# 📸 MCARD AI 智能拍照識卡與自動入庫規格規劃 (AI Camera Specification)

> **版本**：v2.0.0 (全自給自足架構，零外部 API 依賴)  
> **狀態**：規劃就緒 (Ready for Implementation)  
> **核心驅動**：**Google Gemini Multimodal Vision API + Google Search Grounding (實時聯網搜價)**  
> **目標**：為 MCARD 跨領域卡牌資產管理平台引入革命性的「拍照即辨識、即時聯網搜行情、歷史走勢生成與一鍵自動入庫」功能。

---

## 一、 產品定位與架構理念

在傳統卡牌資產系統中，拍照辨識往往需要依賴龐大且難以維護的外部資料庫或付費卡牌 API（如已解耦的 `pokemontcg.io`），這會帶來以下痛點：
1. **API 易失效、限流與維護成本高**：第三方卡牌 API 經常變更格式、延遲或收費，維護成本極高。
2. **跨領域支援度低**：傳統 API 通常只支援寶可夢，無法同時覆蓋**遊戲王、航海王、七龍珠、NBA、FIFA** 等跨界領域。
3. **評級盒行情缺失**：傳統 API 僅提供裸卡價格，無法查詢 PSA 10 或 BGS 9.5 評級盒的真實落槌拍賣價。

**MCARD v2.0 解決方案**：
採用 **Gemini 多模態視覺 + Google Search 實時聯網檢索** 的「全自給自足」模式：
* **零外部卡庫依賴**：不需維護龐大資料庫，直接讓 AI 聯網查詢 TCGplayer、PriceCharting、eBay 的最新成交數據。
* **全領域全覆蓋**：任何卡種、任何語言（英文、日文、中文）甚至冷門特典卡皆能精準辨識與報價。
* **實拍卡圖直出**：經過前端輕量壓縮與 2.5:3.5 透視比例對齊，直接採用藏家實拍的高清圖入庫或刊登市集。

---

## 二、 核心功能規格 (Core Features)

### 1. 多維度結構化視覺識別 (Multimodal Vision)
* **跨領域卡種判斷**：自動辨識 Pokémon、Yu-Gi-Oh!、One Piece、Dragon Ball、NBA 球星卡或 FIFA 足球卡。
* **卡號與系列識別**：高精準度提取邊角極小字號的官方編號（如 `199/165`、`OP05-119`）與擴充包系列名稱。
* **評級盒 (Graded Slab) 專屬提取**：
  * 自動檢測是否具備防偽鑑定封裝外殼。
  * 提取評級機構（PSA / BGS / CGC / Raw 裸卡）。
  * 提取評級等級（如 `GEM MT 10`、`MINT 9`、`BGS 9.5`）。
  * 提取官方唯一認證碼（Certification Number）。
* **卡況狀態初估**：針對裸卡（Raw）輔助標記初始建議品相（Near Mint / Lightly Played）。

### 2. 即時聯網市場報價與歷史走勢提取 (Real-time Grounding)
* **最新市場參考價 (Current Market Price)**：由 AI 透過 Google Search 檢索 TCGplayer、PriceCharting、eBay Recent Solds 最新成交均價（USD）。
* **二級市場區間 (Price Range)**：提供近期的價格區間（`low` ~ `high`）。
* **歷史走勢基準節點 (Historical Trend Points)**：
  * 自動提取 `1M`、`3M`、`6M`、`1Y` 的歷史關鍵價格節點。
  * 供前端透過平滑貝茲曲線算法（如 [`CardDetailView.tsx`](file:///d:/TCG/MCARD/src/components/CardDetailView.tsx)）即時繪製專業歷史趨勢圖。

### 3. 簡約克制的專業取景體驗 (Clean & Focused UX)
* **2.5:3.5 標準比例觀景框**：支援即時視訊串流（Webcam / 手機鏡頭）與本地圖庫圖片拖曳上傳。
* **極簡卡牌對齊導引**：乾淨俐落的細線圓角導引框，視覺聚焦於卡牌主體，無多餘遮擋。
* **平滑低調的狀態過渡**：拍照後僅以精緻細微的紅色進度條或微光呼吸提示（避免過度浮誇的花俏雷射與眼花繚亂的跑馬燈），著重在極速識別與流暢的操作手感。

### 4. 一鍵業務閉環 (Seamless Actions)
* **一鍵入庫 (Add to Vault)**：自動帶入最新市場行情、實拍照片、評級標籤（如 PSA 10），直接存入 [`PortfolioDashboard`](file:///d:/TCG/MCARD/src/components/PortfolioDashboard.tsx)。
* **一鍵市集刊登 (Create Listing)**：拍攝照片直接作為第一張商品圖，自動填寫卡名、系列、評級與參考定價，直接喚起 [`CreateListingModal`](file:///d:/TCG/MCARD/src/components/CreateListingModal.tsx)。
* **一鍵歷史走勢分析 (Analytics)**：跳轉獨立 [`CardDetailView`](file:///d:/TCG/MCARD/src/components/CardDetailView.tsx) 查看該卡的歷史成交走勢與各平台外鏈。
* **一鍵加入對比 (Versus)**：直接加入 [`CardVersusModal`](file:///d:/TCG/MCARD/src/components/CardVersusModal.tsx) 進行多卡行情曲線疊加。

---

## 三、 系統技術架構 (Architecture)

```text
┌────────────────────────────────────────────────────────┐
│                   前端用戶操作介面                       │
│  - Navbar 相機圖標                                     │
│  - MobileBottomNav 掃描入口                             │
│  - PortfolioDashboard / CreateListingModal 快速掃描按鈕 │
└───────────────────────────┬────────────────────────────┘
                            │ 觸發開啟
                            ▼
┌────────────────────────────────────────────────────────┐
│         相機掃描模態框 (CardScannerModal.tsx)           │
│  1. 取景框對齊 (2.5:3.5 Viewfinder)                    │
│  2. 前端 Canvas 輕量壓縮 (WebP / 800~1200px)           │
│  3. 簡潔微光呼吸過渡 (Clean Progress Feedback)         │
└───────────────────────────┬────────────────────────────┘
                            │ POST /api/v1/scan (Base64)
                            ▼
┌────────────────────────────────────────────────────────┐
│           後端服務 (Next.js App Router API)            │
│  src/app/api/v1/scan/route.ts                          │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Google Gemini Multimodal Vision                  │  │
│  │ + Google Search Grounding (實時聯網搜價)         │  │
│  │                                                  │  │
│  │ 1. 視覺特徵解析 (卡名/卡號/系列/PSA 10 認證碼)   │  │
│  │ 2. 聯網檢索 TCGplayer/PriceCharting/eBay 即時報價 │  │
│  │ 3. 提取 1M/3M/6M/1Y 歷史價格走勢節點              │  │
│  │ 4. 嚴格輸出符合 Zod 規格的結構化 JSON             │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ 結構化 JSON 結果
                            ▼
┌────────────────────────────────────────────────────────┐
│               結果確認與微調面板 (Result View)           │
│  - 顯示實拍卡圖、卡牌資訊、PSA/BGS 評級標籤             │
│  - 顯示實時市場參考價格與二級市場價格區間               │
│  - 即時呈現 1M/3M/1Y 平滑歷史走勢圖                     │
│  - 提供「加入資產庫」、「掛單出售」、「查看圖表」三鍵閉環 │
└────────────────────────────────────────────────────────┘
```

---

## 四、 資料結構與型別契約 (Type Contracts)

### 1. 掃描與行情契約 (`src/contracts/scan.schema.ts`)
```typescript
import { z } from 'zod';

// 歷史價格節點定義
export const PriceHistoryPointSchema = z.object({
  period: z.enum(['1M', '3M', '6M', '1Y', 'NOW']),
  date: z.string().describe('e.g. 2026-09 or 2026-10'),
  price: z.number().describe('Estimated historical market price in USD'),
});

// 即時行情數據
export const CardPricingSchema = z.object({
  currency: z.literal('USD').default('USD'),
  currentPrice: z.number().nullable().describe('Current estimated market price in USD'),
  priceRange: z.object({
    low: z.number().optional(),
    high: z.number().optional(),
  }).optional(),
  lastUpdated: z.string().describe('ISO timestamp or current date string'),
  source: z.string().describe('Price source citation, e.g. PriceCharting / eBay Recent Solds'),
  history: z.array(PriceHistoryPointSchema).default([]),
});

// 完整掃描結果契約
export const CardScanResultSchema = z.object({
  category: z.enum(['pokemon', 'yugioh', 'onepiece', 'dragonball', 'nba', 'fifa', 'unknown']),
  cardName: z.string().describe('Official card name in English or Japanese/Chinese'),
  cardNumber: z.string().optional().describe('Card number like 199/165, OP05-119, LOB-001'),
  setName: z.string().optional().describe('Expansion set or collection name'),
  rarity: z.string().optional().describe('e.g. SAR, UR, Secret Rare, Base'),
  isGraded: z.boolean().describe('Whether the card is enclosed in a graded slab'),
  gradingCompany: z.enum(['PSA', 'BGS', 'CGC', 'RAW']).optional(),
  gradeScore: z.string().optional().describe('e.g. 10, 9.5, 9'),
  certNumber: z.string().optional().describe('Certification number on the grading label'),
  confidence: z.number().min(0).max(1).describe('Recognition confidence level (0.0 - 1.0)'),
  summary: z.string().optional().describe('Brief visual feature description'),
  pricing: CardPricingSchema,
});

export type CardScanResult = z.infer<typeof CardScanResultSchema>;
export type CardPricing = z.infer<typeof CardPricingSchema>;
```

---

## 五、 詳細偽代碼規劃 (Detailed Pseudocode)

### 1. 後端辨識與聯網搜價 API (`src/app/api/v1/scan/route.ts`)
```typescript
import { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { CardScanResultSchema } from '@/contracts/scan.schema';

export const runtime = 'edge'; // 或 nodejs 支援

export const POST = async (request: NextRequest) => {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return jsonError('Missing imageBase64 payload', 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonError('Gemini API key is not configured', 500);
    }

    // 1. 提示詞：結合視覺分析與 Google Search 聯網搜價
    const systemPrompt = `You are an elite TCG and sports card appraiser.
Your task:
1. Identify the card in the image: official name, card number, set name, rarity, category (pokemon, yugioh, onepiece, dragonball, nba, fifa).
2. Check if it's a graded slab (PSA, BGS, CGC). If graded, extract the company, grade score (e.g. 10), and certification number.
3. Use Google Search to find current market pricing in USD from authoritative secondary markets (PriceCharting, eBay Sold Listings, TCGplayer):
   - Current fair market price (currentPrice)
   - Estimated 24h/30d range (priceRange.low, priceRange.high)
   - Benchmark historical prices for 1Y ago, 6M ago, 3M ago, 1M ago, and NOW.
   - If it's a PSA 10 or graded card, search specifically for that graded card's market price!
4. Output STRICT JSON conforming to the requested schema.`;

    // 2. 調用支援 Search Grounding 的 Gemini 模型
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                  },
                },
              ],
            },
          ],
          tools: [
            {
              googleSearch: {}, // 開啟 Google Search Grounding 聯網能力
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const aiData = await response.json();
    const candidate = aiData?.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;
    
    // 3. 驗證契約並確保容錯性
    const parsedJson = JSON.parse(rawText);
    const validatedResult = CardScanResultSchema.parse(parsedJson);

    return jsonSuccess(validatedResult);
  } catch (error) {
    console.error('[AI Camera Scan & Grounding API Error]:', error);
    return jsonError('Failed to identify card or fetch market pricing', 500);
  }
};
```

### 2. 前端拍照掃描組件 (`src/components/CardScannerModal.tsx`)
```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardScanResult } from '@/contracts/scan.schema';
import { UniversalCard } from '@/services/multiCardService';

type ScannerStep = 'viewfinder' | 'analyzing' | 'result';

export const CardScannerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddToVault: (cardData: {
    name: string;
    category: string;
    price: number | null;
    buyPrice: number;
    condition: string;
    imageUrl: string;
  }) => void;
  onCreateListing: (cardData: {
    name: string;
    category: string;
    askingPrice: number;
    condition: string;
    photoUrl: string;
  }) => void;
}> = ({ isOpen, onClose, onAddToVault, onCreateListing }) => {
  const [step, setStep] = useState<ScannerStep>('viewfinder');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CardScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. 初始化鏡頭
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.warn('Camera stream error:', err));
  }, [isOpen]);

  // 2. 拍攝並壓縮影格 (WebP, 最大寬度 1200px)
  const handleCapture = async () => {
    const canvas = document.createElement('canvas');
    const base64 = compressVideoFrame(videoRef.current, canvas);
    setCapturedPhoto(base64);
    setStep('analyzing'); // 進入平滑微光進度過渡狀態

    // 3. 呼叫後端 API (一次完成識圖 + 聯網搜價)
    const res = await fetch('/api/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    });
    const { data } = await res.json();
    setScanResult(data);
    setStep('result'); // 進入結果面板
  };

  // 4. 結果面板一鍵入庫
  const handleConfirmVault = (buyPrice: number) => {
    if (!scanResult) return;
    onAddToVault({
      name: scanResult.cardName,
      category: scanResult.category,
      price: scanResult.pricing.currentPrice,
      buyPrice: buyPrice,
      condition: scanResult.isGraded
        ? `${scanResult.gradingCompany} ${scanResult.gradeScore}`
        : 'Ungraded',
      imageUrl: capturedPhoto || '',
    });
    onClose();
  };

  // 5. 渲染視圖：簡約取景框 (2.5:3.5) -> 微光解析過渡 -> 結果面板與歷史趨勢圖
  // ...
};
```

---

## 六、 UI 接入點規劃 (Entry Points)

| 入口位置 | 觸發元素 | 操作反饋 |
| :--- | :--- | :--- |
| **頂部導航列 ([Navbar.tsx](file:///d:/TCG/MCARD/src/components/Navbar.tsx))** | 搜尋列右側新增「相機掃描按鈕」 | 點擊開啟簡約掃描彈窗，支援相機拍照或圖片檔案拖曳上傳 |
| **行動端懸浮底欄 ([MobileBottomNav.tsx](file:///d:/TCG/MCARD/src/components/MobileBottomNav.tsx))** | 5 鍵導航中或懸浮中央 FAB 操作按鈕 | 行動端藏家單手拇指直接輕觸啟動後置鏡頭拍照 |
| **資產管理頁 ([PortfolioDashboard.tsx](file:///d:/TCG/MCARD/src/components/PortfolioDashboard.tsx))** | 資產管理統計卡上方「拍照快速入庫」 | 辨識與聯網搜價完成後，自動代入實拍照片、實時行情與評級等級直接入庫 |
| **市集刊登頁 ([CreateListingModal.tsx](file:///d:/TCG/MCARD/src/components/CreateListingModal.tsx))** | 上傳商品照片旁「拍照自動填單」 | 實拍照片直接作為第一張商品圖，並自動填寫卡名、系列、卡況與參考售價 |

---

## 七、 實作路線階段檢核表 (Implementation Checklist)

- [x] **Phase A: 基礎設施與契約建立**
  - [x] 於 `.env.example` 與 `.env.local` 宣告 `GEMINI_API_KEY`
  - [x] 建立 `src/contracts/scan.schema.ts`（包含 Zod 驗證契約與 `pricing` 歷史走勢節點）
  - [x] 建立 `src/app/api/v1/scan/route.ts` API 路由端點（開啟 Google Search Grounding）
- [x] **Phase B: 前端相機與取景器模態框**
  - [x] 建立 `src/components/CardScannerModal.tsx`
  - [x] 實作 MediaDevices 相機存取與手機端後置鏡頭（`facingMode: 'environment'`）優選
  - [x] 支援本地圖片拖曳上傳與檔案選擇器（Fallback 機制）
  - [x] 前端 Canvas 畫布尺寸自動縮放與輕量壓縮模組（控制在 150KB 內）
- [x] **Phase C: 簡約高級取景視覺與平滑狀態過渡**
  - [x] 實作 2.5:3.5 標準卡牌簡約對齊導引框（乾淨俐落的細線與柔和圓角，無多餘遮擋）
  - [x] 實作克制平滑的掃描狀態反饋（細緻進度條 / 柔和呼吸提示，保持乾淨簡約與極致響應）
- [x] **Phase D: 實拍直出、即時走勢圖繪製與業務閉環**
  - [x] 實作結果確認面板：實拍照片預覽 + 自動填寫屬性 + 實時市場行情展示
  - [x] 使用 `pricing.history` 節點即時繪製貝茲平滑歷史價格曲線
  - [x] 連動一鍵入庫至 [PortfolioDashboard.tsx](file:///d:/TCG/MCARD/src/components/PortfolioDashboard.tsx)
  - [x] 連動一鍵刊登至 [CreateListingModal.tsx](file:///d:/TCG/MCARD/src/components/CreateListingModal.tsx)
  - [x] 在 [Navbar.tsx](file:///d:/TCG/MCARD/src/components/Navbar.tsx) 與 [MobileBottomNav.tsx](file:///d:/TCG/MCARD/src/components/MobileBottomNav.tsx) 部署相機圖標入口
- [x] **Phase E: 國際化與例外邊界處理**
  - [x] 在 `src/locales/translations.ts` 補齊繁中、簡中、英文翻譯字串
  - [x] 處理相機未授權、模糊失焦、無法識別時的重拍與手動填寫 Fallback 機制
