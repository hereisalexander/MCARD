/**
 * Edge Cache & Pokemon API 驗證腳本
 */

import {
  withStaleWhileRevalidate,
  getCacheMetrics,
  resetCacheMetrics,
  clearCache,
} from '@/utils/cache';

import {
  fetchPokemonSets,
  fetchPokemonCardsFromApi,
  fetchPokemonCardById,
  SETS_CACHE_TTL_SECONDS,
  CARDS_CACHE_TTL_SECONDS,
  FALLBACK_POKEMON_SETS,
} from '@/services/pokemonApi';

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${message}`);
  }
};

const runTests = async (): Promise<void> => {
  console.log('=== [1] 開始驗證 Edge Cache SWR 機制 ===');
  await clearCache();
  resetCacheMetrics();

  let fetchCount = 0;
  const mockFetcher = async () => {
    fetchCount++;
    return { data: 'test-value', timestamp: Date.now() };
  };

  // 1. 初次請求 (Cache Miss)
  const res1 = await withStaleWhileRevalidate('test:swr:key', mockFetcher, {
    ttlSeconds: 1, // 1 秒新鮮期
    swrSeconds: 2, // 2 秒 stale 寬限期
  });
  assert(res1.data === 'test-value', '初次請求應返回正確資料');
  assert(fetchCount === 1, '初次請求應調用 fetcher 1 次');
  let metrics = getCacheMetrics();
  assert(metrics.misses === 1, '指標 misses 應為 1');
  assert(metrics.hits === 0, '指標 hits 應為 0');
  console.log('✓ 初次請求 (Cache Miss) 通過');

  // 2. 新鮮期內再次請求 (Fresh Hit)
  const res2 = await withStaleWhileRevalidate('test:swr:key', mockFetcher, {
    ttlSeconds: 1,
    swrSeconds: 2,
  });
  assert(res2.data === 'test-value', '新鮮期內應直接返回快取資料');
  assert(fetchCount === 1, '新鮮期內不應再次調用 fetcher');
  metrics = getCacheMetrics();
  assert(metrics.hits === 1, '指標 hits 應增加為 1');
  console.log('✓ 新鮮期快取命中 (Cache Hit) 通過');

  // 3. 測試 Single-Flight 並發去重
  console.log('=== [2] 開始驗證 Single-Flight 並發請求去重 ===');
  let concurrentFetcherCount = 0;
  const slowFetcher = async () => {
    concurrentFetcherCount++;
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { id: 'concurrent-result' };
  };

  const concurrentPromises = Array.from({ length: 10 }).map(() =>
    withStaleWhileRevalidate('test:concurrent:key', slowFetcher, {
      ttlSeconds: 10,
    })
  );

  const results = await Promise.all(concurrentPromises);
  assert(results.length === 10, '所有並發請求皆應順利解析');
  assert(concurrentFetcherCount === 1, `10 個並發請求應只執行 1 次 fetcher，實際為: ${concurrentFetcherCount}`);
  for (const r of results) {
    assert(r.id === 'concurrent-result', '並發請求回傳值應一致');
  }
  console.log('✓ Single-Flight 10 個並發請求去重防擊穿 (429 防護) 通過');

  // 4. 測試 API 故障時的平滑降級 Fallback 機制
  console.log('=== [3] 開始驗證 429 速率限制與 API 故障平滑降級 ===');
  await clearCache();
  resetCacheMetrics();

  // 場景 A: 完全無快取時發生 429，降級至傳入的 fallback
  const failingFetcher = async () => {
    const error = new Error('HTTP 429 Too Many Requests');
    (error as unknown as { status: number }).status = 429;
    throw error;
  };

  const fallbackData = { fallback: true, message: '平滑降級兜底' };
  const degradedRes1 = await withStaleWhileRevalidate('test:fail:key', failingFetcher, {
    ttlSeconds: 10,
    fallback: fallbackData,
  });
  assert(degradedRes1.fallback === true, '無快取且 API 故障時應返回 fallback');
  metrics = getCacheMetrics();
  assert(metrics.fallbackHits === 1, '指標 fallbackHits 應為 1');
  assert(metrics.errorsHandled === 1, '指標 errorsHandled 應為 1');
  console.log('✓ 無快取時 429 故障降級至預設 Fallback 通過');

  // 場景 B: 存在歷史舊快取時發生 429，平滑降級回傳歷史快取
  let callCount = 0;
  const sometimesFailingFetcher = async () => {
    callCount++;
    if (callCount === 1) {
      return { version: 'v1-initial-data' };
    }
    throw new Error('500 Internal Server Error (API Down)');
  };

  // 先建立快取
  const initialRes = await withStaleWhileRevalidate('test:stale-fail:key', sometimesFailingFetcher, {
    ttlSeconds: 0.1, // 極短 TTL
    swrSeconds: 0.1, // 極短 SWR
  });
  assert(initialRes.version === 'v1-initial-data', '初次寫入快取成功');

  // 等待快取過期
  await new Promise((resolve) => setTimeout(resolve, 250));

  // 再次請求，此時 fetcher 拋出 500，應平滑降級回傳歷史快取
  const degradedRes2 = await withStaleWhileRevalidate('test:stale-fail:key', sometimesFailingFetcher, {
    ttlSeconds: 0.1,
    swrSeconds: 0.1,
    fallback: { version: 'static-fallback' },
  });
  assert(degradedRes2.version === 'v1-initial-data', 'API 故障時應平滑降級返回歷史快取');
  console.log('✓ API 故障時平滑降級回傳歷史快取 通過');

  // 5. 驗證 Pokémon API 快取與降級常數
  console.log('=== [4] 驗證 Pokémon API 快取週期與常數規範 ===');
  assert(SETS_CACHE_TTL_SECONDS === 86400, 'Sets 快取新鮮期必須為 24hr (86400 秒)');
  assert(CARDS_CACHE_TTL_SECONDS === 7200, 'Cards 快取新鮮期必須為 2hr (7200 秒)');
  assert(FALLBACK_POKEMON_SETS.length > 0, 'FALLBACK_POKEMON_SETS 必須包含備用系列');
  console.log(`✓ Sets 快取週期: ${SETS_CACHE_TTL_SECONDS}s (24hr)`);
  console.log(`✓ Cards 快取週期: ${CARDS_CACHE_TTL_SECONDS}s (2hr)`);

  // 6. 驗證 fetchPokemonSets 平滑降級機制
  console.log('=== [5] 驗證 fetchPokemonSets 與 FALLBACK_POKEMON_SETS ===');
  const sets = await fetchPokemonSets();
  assert(Array.isArray(sets) && sets.length > 0, 'fetchPokemonSets 應回傳系列列表');
  assert(sets[0].name !== '', '系列名稱不應為空');
  console.log(`✓ fetchPokemonSets 順利返回 ${sets.length} 個系列，首個系列: ${sets[0].name}`);

  // 7. 驗證 fetchPokemonCardsFromApi 兜底安全格式
  console.log('=== [6] 驗證 fetchPokemonCardsFromApi 結構安全 ===');
  const cardsResult = await fetchPokemonCardsFromApi({ page: 1, pageSize: 5 });
  assert(typeof cardsResult.totalCount === 'number', 'totalCount 應為數字');
  assert(Array.isArray(cardsResult.cards), 'cards 應為陣列');
  assert(typeof cardsResult.hasMore === 'boolean', 'hasMore 應為布林值');
  console.log(`✓ fetchPokemonCardsFromApi 結構檢驗正常 (totalCount: ${cardsResult.totalCount}, cards: ${cardsResult.cards.length})`);

  // 8. 驗證 fetchPokemonCardById 單卡查詢介面
  console.log('=== [7] 驗證 fetchPokemonCardById 查詢介面 ===');
  const emptyCard = await fetchPokemonCardById('');
  assert(emptyCard === null, '空 ID 應安全返回 null');
  console.log('✓ fetchPokemonCardById 空參數防禦通過');

  console.log('=== [測試全部通過 - Edge Cache & SWR Protection 完備] ===');
};

runTests().catch((err) => {
  console.error('測試失敗:', err);
  process.exit(1);
});
