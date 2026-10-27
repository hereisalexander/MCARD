import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';
import { ScanRequestSchema, CardScanResultSchema, CardScanResult } from '@/contracts/scan.schema';

export const dynamic = 'force-dynamic';

const extractJsonFromText = (text: string): unknown => {
  const trimmed = text.trim();
  const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const targetStr = markdownMatch ? markdownMatch[1].trim() : trimmed;

  const firstBrace = targetStr.indexOf('{');
  const lastBrace = targetStr.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('未在模型回應中找到合法的 JSON 物件');
  }

  const jsonSubstring = targetStr.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonSubstring);
};

// 固定指定使用模型：Gemini 3.5 Flash Lite
const TARGET_MODEL = 'gemini-3.5-flash-lite';

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await req.json();
    const { imageBase64 } = ScanRequestSchema.parse(rawBody);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return apiError(
        'UNAUTHORIZED',
        '未檢測到 GEMINI_API_KEY，請於專案 .env.local 中配置金鑰以啟用真實 AI 辨識。',
        null,
        401
      );
    }

    // 徹底清洗 Base64 數據：剝除 Data URL 前綴並移除所有無效空白與換行符
    const cleanBase64 = (
      imageBase64.includes(',')
        ? imageBase64.slice(imageBase64.indexOf(',') + 1)
        : imageBase64
    ).replace(/\s+/g, '');

    const systemPrompt = `You are an elite, world-class trading card game (TCG) and sports card expert and appraiser.
Your objective is to examine the provided card image, identify its detailed parameters, and estimate secondary market pricing data in USD (authoritative benchmark sources: PriceCharting, eBay Sold Listings, TCGplayer).

Analyze the image carefully:
1. Identify the card category: exactly one of ['pokemon', 'yugioh', 'onepiece', 'dragonball', 'nba', 'fifa', 'unknown'].
2. Extract official card name (English / Japanese / Chinese), card number (e.g. 199/165, OP05-119, LOB-001), set/expansion name, and rarity (e.g. SAR, UR, Secret Rare).
3. Determine if encapsulated in a graded slab:
   - isGraded: boolean
   - gradingCompany: 'PSA' | 'BGS' | 'CGC' | 'RAW'
   - gradeScore: string (e.g. '10', '9.5', '9')
   - certNumber: string (official certification code on label if visible)
4. Estimate secondary market valuation in USD:
   - rawPrice: estimated fair market price for Ungraded / Raw condition (number, or null if unknown)
   - psa10Price: estimated market price for PSA 10 Gem Mint graded condition (number, or null if unknown)
   - currentPrice: estimated fair market price matching the actual card condition in the image (if PSA 10, use psa10Price; if Raw, use rawPrice)
   - priceRange: { low: number, high: number }
   - lastUpdated: current date string
   - source: name of the benchmark source, e.g. "PriceCharting / eBay Recent Solds"
   - history: an array of 5 historical benchmark points representing ['1Y', '6M', '3M', '1M', 'NOW'] with approximate historical prices for this card grade, including period, date (YYYY-MM), and price (number).
5. Output ONLY a valid JSON object strictly matching this TypeScript structure:
{
  "category": "pokemon" | "yugioh" | "onepiece" | "dragonball" | "nba" | "fifa" | "unknown",
  "cardName": string,
  "cardNumber": string,
  "setName": string,
  "rarity": string,
  "isGraded": boolean,
  "gradingCompany": "PSA" | "BGS" | "CGC" | "RAW",
  "gradeScore": string,
  "certNumber": string,
  "confidence": number, // between 0.0 and 1.0
  "summary": string,
  "pricing": {
    "currency": "USD",
    "currentPrice": number | null,
    "rawPrice": number | null,
    "psa10Price": number | null,
    "priceRange": { "low": number, "high": number },
    "lastUpdated": string,
    "source": string,
    "history": [
      { "period": "1Y", "date": "YYYY-MM", "price": number },
      { "period": "6M", "date": "YYYY-MM", "price": number },
      { "period": "3M", "date": "YYYY-MM", "price": number },
      { "period": "1M", "date": "YYYY-MM", "price": number },
      { "period": "NOW", "date": "YYYY-MM", "price": number }
    ]
  }
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`;

    const payload: Record<string, unknown> = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
    };

    console.log(`[Gemini] 執行識卡辨識 | 模型: ${TARGET_MODEL} | 聯網搜價: 關閉 (純視覺模式)`);
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000), // 30 秒超時
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Gemini API Error]: HTTP ${response.status}`, errText);

      let parsedErrMsg = '';
      try {
        const errJson = JSON.parse(errText);
        parsedErrMsg = errJson?.error?.message || '';
      } catch {}

      let clientMessage = `Gemini 視覺辨識請求失敗 (HTTP ${response.status})`;

      if (parsedErrMsg.includes('API key not valid') || response.status === 403) {
        clientMessage = 'Gemini API Key 無效或未開通權限，請檢查 Cloudflare 變數配置。';
      } else if (response.status === 400) {
        clientMessage = parsedErrMsg
          ? `圖片辨識參數異常: ${parsedErrMsg}`
          : '圖片數據解析失敗，請重新拍攝或換個角度。';
      } else if (response.status === 404) {
        clientMessage = `Gemini 模型 (${TARGET_MODEL}) 不存在或已下線。`;
      } else if (response.status === 429) {
        clientMessage = 'Gemini API 請求頻率過高或配額耗盡，請稍候片刻後重試。';
      } else if (parsedErrMsg) {
        clientMessage = `辨識服務異常: ${parsedErrMsg}`;
      }

      return apiError('INTERNAL_SERVER_ERROR', clientMessage, errText, response.status);
    }

    const geminiData = await response.json();
    const candidate = geminiData?.candidates?.[0];
    const rawPartsText = candidate?.content?.parts
      ?.map((p: { text?: string }) => p.text || '')
      .join('\n');

    if (!rawPartsText) {
      return apiError('INTERNAL_SERVER_ERROR', 'Gemini 模型未回傳有效文字內容', geminiData, 500);
    }

    const parsedData = extractJsonFromText(rawPartsText);
    const validatedResult: CardScanResult = CardScanResultSchema.parse(parsedData);

    console.log(`[Gemini] ✅ 辨識成功！模型: ${TARGET_MODEL}`);
    return apiSuccess(validatedResult);
  } catch (error) {
    console.error('[AI Camera Scan API Route Error]:', error);
    return handleApiError(error);
  }
};

