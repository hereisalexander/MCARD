# 📸 MCARD AI 智能拍照識卡與自動入庫規格規劃 (AI Camera Specification)

> **版本**：v1.0.0  
> **狀態**：規劃中 (Drafted / Ready for Implementation)  
> **目標**：為 MCARD 多領域卡牌資產管理平台引入革命性的「相機拍照 / 圖片上傳即時 AI 辨識、評級盒提取與自動入庫」功能。

---

## 一、 產品定位與核心痛點

實體 TCG 與球星卡藏家在管理卡牌與上架市集時，面臨的主要痛點：
1. **輸入卡名與卡號繁瑣**：每張卡牌的系列代碼、小字卡號（如 `#199/165`、`OP05-119`）極其微小，手動輸入極易出錯。
2. **鑑定評級盒（Graded Slab）認證號過長**：PSA、BGS、CGC 鑑定盒的認證編號（Cert #）長達 8 至 10 位數字，手打效率低下。
3. **多領域跨界難以歸類**：跨足寶可夢、遊戲王、航海王、七龍珠與體育卡時，分類與系列名稱查詢門檻高。

**解決方案**：
融合 **F1 賽道遙測科技美學** 與 **Google Gemini Multimodal Vision API**，在行動端或桌面端提供「即開即掃、秒級結構化解析、自動資料庫比對、一鍵入庫/上架」的無縫體驗。

---

## 二、 核心功能規格 (Core Features)

### 1. 多維度結構化識別能力
* **跨領域卡種判斷**：自動辨識 Pokémon、Yu-Gi-Oh!、One Piece、Dragon Ball、NBA 球星卡或 FIFA 足球卡。
* **卡號與系列識別**：高精準度提取邊角極小字號的官方編號（如 `199/165`、`LOB-001`）與擴充包系列名稱。
* **評級盒 (Graded Slab) 專屬提取**：
  * 自動檢測是否具備防偽鑑定封裝外殼。
  * 提取評級機構（PSA / BGS / CGC / Raw）。
  * 提取評級等級（如 `GEM MT 10`、`MINT 9`、`BGS 9.5`）。
  * 提取官方唯一認證碼（Certification Number）。
* **卡況狀態初估**：針對裸卡（Raw）輔助標記初始建議品相（Near Mint / Lightly Played）。

### 2. 極致的 F1 遙測掃描視覺體驗 (HUD UX)
* **2.5:3.5 標準比例觀景框**：支援即時視訊串流（Webcam / 智慧型手機鏡頭）與本地圖庫圖片拖曳上傳。
* **雷達對齊角標**：四角 HUD 邊框引導藏家對準卡牌。
* **動態雷射掃描動效**：按下拍攝後，觸發垂直流動的紅色鐳射掃描線與遙測數據解析文字動畫。

### 3. 一鍵業務閉環 (Seamless Actions)
* **一鍵入庫 (Add to Vault)**：自動關聯最新市場行情、填入識別出的評級（如 PSA 10），直接存入 [`PortfolioDashboard`](file:///d:/TCG/MCARD/src/components/PortfolioDashboard.tsx)。
* **一鍵市集刊登 (Create Listing)**：將拍攝的卡牌高清照片直接代入賣家相冊，自動帶入卡名、系列、評級與參考定價，直接喚起 [`CreateListingModal`](file:///d:/TCG/MCARD/src/components/CreateListingModal.tsx)。
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
                            │ 觸發
                            ▼
┌────────────────────────────────────────────────────────┐
│         相機掃描模態框 (CardScannerModal.tsx)           │
│  1. 取景框對齊 (2.5:3.5 Viewfinder)                    │
│  2. Canvas 降噪與無感壓縮 (WebP / 800~1200px)           │
│  3. 播放 F1 賽道遙測 HUD 解析動效                       │
└───────────────────────────┬────────────────────────────┘
                            │ POST /api/v1/scan (Base64)
                            ▼
┌────────────────────────────────────────────────────────┐
│           後端服務 (Next.js App Router API)            │
│  src/app/api/v1/scan/route.ts                          │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Google Gemini Multimodal Vision API              │  │
│  │ 透過 Structured Outputs (JSON Schema) 強制回傳    │  │
│  │ 包含 cardName, cardNumber, setName, grade 等     │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ 結構化 JSON 結果
                            ▼
┌────────────────────────────────────────────────────────┐
│           資料庫與行情檢索匹配引擎                      │
│  - Pokémon: 對接 pokemonApi.ts 查詢官方資料庫          │
│  - 其他類別: 對接 multiCardService.ts 多領域圖鑑庫     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               結果確認與微調面板 (Result View)           │
│  - 顯示識別卡牌大圖、信心度、官方市場參考價             │
│  - 藏家可微調數量、買入成本、品相標籤                   │
│  - 提供「加入資產庫」、「掛單出售」、「查看圖表」三鍵閉環 │
└────────────────────────────────────────────────────────┘
```

---

## 四、 資料結構與型別契約 (Type Contracts)

### 1. 掃描結果契約 (`src/contracts/scan.schema.ts`)
```typescript
import { z } from 'zod';

export const CardScanResultSchema = z.object({
  category: z.enum(['pokemon', 'yugioh', 'onepiece', 'dragonball', 'nba', 'fifa', 'unknown']),
  cardName: z.string().describe('Official card name in English or Japanese/Chinese'),
  cardNumber: z.string().optional().describe('Card number like 199/165 or OP05-119'),
  setName: z.string().optional().describe('Expansion set or collection name'),
  rarity: z.string().optional().describe('e.g. SAR, UR, Secret Rare, Base'),
  isGraded: z.boolean().describe('Whether the card is enclosed in a graded slab'),
  gradingCompany: z.enum(['PSA', 'BGS', 'CGC', 'RAW']).optional(),
  gradeScore: z.string().optional().describe('e.g. 10, 9.5, 9'),
  certNumber: z.string().optional().describe('Certification number on the grading label'),
  confidence: z.number().min(0).max(1).describe('Recognition confidence level'),
  summary: z.string().optional().describe('Brief visual feature description'),
});

export type CardScanResult = z.infer<typeof CardScanResultSchema>;
```

---

## 五、 詳細偽代碼規劃 (Detailed Pseudocode)

### 1. 後端辨識 API (`src/app/api/v1/scan/route.ts`)
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

    // 1. 構建 System Prompt 規範識別邊界
    const systemPrompt = `You are an expert TCG and sports card appraiser.
Extract card category, official card name, set number, expansion set name, and rarity.
If the card is inside a PSA, BGS, or CGC slab, extract the grading company, grade score, and certification number.
Output MUST conform strictly to the JSON schema.`;

    // 2. 調用 Gemini Vision 模型 (如 gemini-2.5-flash / gemini-1.5-flash)
    // 傳送 base64 影像資料與 JSON Schema
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: CardScanResultSchema,
        },
      }),
    });

    const aiData = await response.json();
    const parsedText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    const validatedResult = CardScanResultSchema.parse(JSON.parse(parsedText));

    return jsonSuccess(validatedResult);
  } catch (error) {
    console.error('[AI Camera Scan API Error]:', error);
    return jsonError('Failed to process card recognition', 500);
  }
};
```

### 2. 前端拍照掃描組件 (`src/components/CardScannerModal.tsx`)
```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HoloCard } from '@/components/HoloCard';
import { UniversalCard } from '@/services/multiCardService';
import { CardScanResult } from '@/contracts/scan.schema';

type ScannerStep = 'viewfinder' | 'analyzing' | 'result';

export const CardScannerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddToVault: (card: UniversalCard, condition: string, buyPrice: number) => void;
  onCreateListing: (card: UniversalCard, photoUrl: string, condition: string) => void;
}> = ({ isOpen, onClose, onAddToVault, onCreateListing }) => {
  const [step, setStep] = useState<ScannerStep>('viewfinder');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CardScanResult | null>(null);
  const [matchedCard, setMatchedCard] = useState<UniversalCard | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. 初始化相機權限與視訊串流
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.warn('Camera access denied or unavailable:', err));
  }, [isOpen]);

  // 2. 擷取影格並壓縮
  const handleCapture = async () => {
    const canvas = document.createElement('canvas');
    // 壓縮至長邊 1200px 內，輸出優質 WebP 格式
    const base64 = compressVideoFrame(videoRef.current, canvas);
    setCapturedPhoto(base64);
    setStep('analyzing');

    // 3. 呼叫後端 API
    const res = await fetch('/api/v1/scan', {
      method: 'POST',
      body: JSON.stringify({ imageBase64: base64 }),
    });
    const result = await res.json();
    setScanResult(result.data);

    // 4. 比對本地或官方資料庫取得最佳候選卡牌
    const card = await matchCardWithDatabase(result.data);
    setMatchedCard(card);
    setStep('result');
  };

  // 5. 渲染視圖：取景框 -> 賽道掃描動效 -> 確認結果面板
  // ...
};
```

---

## 六、 UI 接入點規劃 (Entry Points)

| 入口位置 | 觸發元素 | 操作反饋 |
| :--- | :--- | :--- |
| **頂部導航列 ([Navbar.tsx](file:///d:/TCG/MCARD/src/components/Navbar.tsx))** | 搜尋列右側新增「相機掃描按鈕」 | 點擊開啟全螢幕/彈窗掃描視窗，支援拍照或拖曳圖片辨識 |
| **行動端懸浮底欄 ([MobileBottomNav.tsx](file:///d:/TCG/MCARD/src/components/MobileBottomNav.tsx))** | 5 鍵導航中或懸浮中央 FAB 操作按鈕 | 行動端藏家單手拇指直接輕觸啟動手機鏡頭拍照 |
| **資產管理頁 ([PortfolioDashboard.tsx](file:///d:/TCG/MCARD/src/components/PortfolioDashboard.tsx))** | 資產管理統計卡上方「拍照快速入庫」 | 辨識完成後自動代入購入成本、評級標籤與持倉數量 |
| **市集刊登頁 ([CreateListingModal.tsx](file:///d:/TCG/MCARD/src/components/CreateListingModal.tsx))** | 上傳商品照片旁「拍照自動填單」 | 拍攝照片直接作為第一張商品圖，並自動填寫卡名、系列、卡況與參考售價 |

---

## 七、 實作路線階段檢核表 (Implementation Checklist)

- [ ] **Phase A: 基礎設施與契約建立**
  - [ ] 於 `.env.example` 與 `.env.local` 宣告 `GEMINI_API_KEY`
  - [ ] 建立 `src/contracts/scan.schema.ts`（包含 Zod 驗證契約）
  - [ ] 建立 `src/app/api/v1/scan/route.ts` API 路由端點
- [ ] **Phase B: 前端相機與取景器模態框**
  - [ ] 建立 `src/components/CardScannerModal.tsx`
  - [ ] 實作 MediaDevices 相機存取與手機端後置鏡頭（`facingMode: 'environment'`）優選
  - [ ] 支援本地圖片拖曳上傳與檔案選擇器（Fallback 機制）
  - [ ] 前端 Canvas 畫布尺寸自動縮放與 WebP 輕量壓縮模組
- [ ] **Phase C: 賽道科技美學與掃描動效**
  - [ ] 實作 2.5:3.5 卡牌對齊標線與雷達定位角標
  - [ ] 實作紅色雷射掃描動效與 HUD 遙測數據解算狀態
- [ ] **Phase D: 資料庫比對與業務連動**
  - [ ] 比對搜尋算法：依據 `cardNumber` + `cardName` 搜尋 [pokemonApi.ts](file:///d:/TCG/MCARD/src/services/pokemonApi.ts) 與 [multiCardService.ts](file:///d:/TCG/MCARD/src/services/multiCardService.ts)
  - [ ] 連動一鍵入庫至 [PortfolioDashboard.tsx](file:///d:/TCG/MCARD/src/components/PortfolioDashboard.tsx)
  - [ ] 連動一鍵刊登至 [CreateListingModal.tsx](file:///d:/TCG/MCARD/src/components/CreateListingModal.tsx)
  - [ ] 在 [Navbar.tsx](file:///d:/TCG/MCARD/src/components/Navbar.tsx) 與 [MobileBottomNav.tsx](file:///d:/TCG/MCARD/src/components/MobileBottomNav.tsx) 部署相機圖標入口
- [ ] **Phase E: 國際化與例外邊界處理**
  - [ ] 在 `src/locales/translations.ts` 補齊繁中、簡中、英文翻譯字串
  - [ ] 處理相機未授權、模糊失焦、無法識別時的重拍與手動搜尋 Fallback 機制
