<div align="center">

# ⚡ MCARD (多領域卡牌與體育球星卡投資與收藏管理系統)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./CODE_OF_CONDUCT.md)

專為卡牌玩家、高階藏家與投資愛好者打造的**多領域跨界卡牌（Multi-TCG & Sports Cards）資產管理與即時市場遙測平台**。融合一級方程式（F1）遙測工程美學，具備極致平滑的 3D 全像光影卡牌傾斜效果、多卡行情疊加對比、心願降價預警、C2C 二手市集，以及完整的收藏投資組合損益（P&L）深度分析。

[快速開始](#-快速開始-getting-started) • [核心功能](#-核心功能-key-features) • [技術架構](#-技術架構-tech-stack) • [貢獻指引](#-開源貢獻-contributing) • [安全政策](./SECURITY.md) • [開源授權與免責聲明](#-授權協議--版權免責-license--disclaimer)

</div>

---

## ✨ 核心功能 (Key Features)

### 1. 🌐 六大多元卡種跨界支援 (Multi-TCG Ecosystem)
- **寶可夢 (Pokémon TCG)**：官方 API 即時對接，涵蓋初代無印、151、超電壓軸至最新系列。
- **航海王 / 海賊王 (One Piece TCG)**：漫畫背景稀有卡（Manga Rare）、太陽神五檔魯夫等頂級行情。
- **遊戲王 (Yu-Gi-Oh!)**：初代青眼白龍、黑魔導、紅碎等經典傳奇神卡收藏。
- **七龍珠 (Dragon Ball Super)**：經典超級賽亞人、自在極意功等傳奇動漫卡牌行情。
- **NBA 籃球球星卡 (NBA Cards)**：麥可·喬丹（Michael Jordan）、柯比·布萊恩（Kobe Bryant）新秀卡及頂級 PSA 10 評級資產追蹤。
- **FIFA 足球球星卡 (FIFA Cards)**：梅西（Lionel Messi）、C 羅（Cristiano Ronaldo）新秀卡與世界杯紀念卡。

### 2. 📡 即時市場遙測儀表板 (Paddock Telemetry / Stream)
- **大盤實時數據**：監控全球即時 24h 交易量（Tracked Volume）、流動性指數與 API 遙測連線率。
- **即時信號廣播**：包括價格飆升信號（Price Surge Alerts）、拍賣行天價落槌成交紀錄（Auction Records）與大師收藏庫入庫通知。
- **熱門系列導航**：一鍵直達 151、Surging Sparks、Crown Zenith、Evolving Skies 等人氣系列。

### 3. 🌈 3D 全像光影傾斜效果 (Holographic Foil Tilt)
- **擬真 3D 視差傾斜**：根據滑鼠游標或行動裝置陀螺儀動態即時計算 3D 俯仰角。
- **動態彩虹炫光反應**：精準模擬實體 SAR、UR、SR、HR 等高罕貴度卡牌在光線下的炫彩物理反光質感。

### 4. 🔍 全系列圖鑑檢索與進階篩選 (Archive & Advanced Filters)
- **全域即時搜尋**：支援按卡名、卡號（如 `#199/165`）、系列名稱模糊搜尋，全站支援 `/` 快速鍵觸發。
- **多維度篩選排序**：依價格高低、卡牌編號、名稱排序，支援稀有度標籤（SAR, UR, AR, Promo）快速過濾。
- **無限滾動加載**：基於 Intersection Observer 實現順暢的無感卡牌加載（Infinite Scroll）。

### 5. 📈 獨立卡牌詳情與動態歷史走勢圖 (Price Analytics)
- **極致平滑曲線圖**：動態自適應 Y 軸縮放，以貝茲曲線繪製平滑無鋸齒的歷史成交走勢。
- **多時間軸切換**：自由切換 1 個月（1M）、3 個月（3M）、6 個月（6M）與 1 年（1Y）趨勢。
- **權威交易市場外鏈**：直接導航至 TCGplayer、eBay、PriceCharting、Cardmarket 與 CardHobby 行情頁。

### 6. ⚔️ 卡牌對比與行情疊加矩陣 (Card Versus & Comparison Matrix)
- **多卡靈活挑選**：支援在圖鑑中勾選 2～4 張卡牌，底部即時顯示專屬浮動卡槽。
- **多曲線疊加走勢**：在同一張走勢圖中以不同色彩疊加各卡歷史價格曲線。
- **數據矩陣對比**：橫向對齊當前市價、歷史漲跌幅、波動度、系列與稀有度，提供深度的橫向決策分析。

### 7. 💼 投資組合與資產損益管理 (Portfolio & Vault)
- **成本與回報追蹤**：記錄卡牌購入成本（Buy-in Cost）、持倉數量與實時市值，自動計算總投資報酬率（ROI %）與未實現損益。
- **品相評級標註**：支援標註評級等級（`Ungraded`、`PSA 10`、`PSA 9`、`BGS 10`、`CGC 10`）。
- **資料備份與還原**：支援本地資產資料庫一鍵匯出為標準 JSON，隨時備份並在跨裝置無痛匯入恢復。

### 8. 💖 願望清單與目標價預警 (Wishlist & Price Target Alerts)
- **心願收藏管理**：一鍵將心儀神卡收入清單，告別遺漏。
- **目標價降價預警**：支援自訂「目標入手價」，系統自動計算折價空間並在達成目標時即時醒目標示。
- **一鍵入庫**：達成目標入手後，可直接一鍵轉入個人資產庫（Vault）。

### 9. 🏪 C2C 二手卡牌市集 (Marketplace)
- **卡牌掛單發布**：藏家可自主發布二手出售資訊，支援直接從個人 Vault 一鍵代入卡牌數據。
- **交易生命週期**：支援「在售中（Active）」、「已售出（Sold）」狀態標記與價格即時動態調整。
- **買家賣家聯絡**：整合聯絡彈窗與交易備忘，建立藏家間的去中心化互信交易通路。

### 10. 👤 會員帳戶與身分認證 (User Auth & Profile)
- **多元登入機制**：支援 Google、Discord 一鍵快速授權，以及 Email 登入。
- **頭像與狀態持久化**：支援個人大頭照、暱稱展示，並在行動端底欄與導航列同步顯示登入狀態。

### 11. 📱 行動端原生級觸控體驗 (Mobile App-like Experience)
- **視窗安全區適配**：採用 `viewport-fit=cover` 與動態視窗高度（`dvh`），無縫相容全面屏瀏海、動態島與底欄手勢條。
- **GPU 加速懸浮底欄**：具備硬體合成層（Hardware Compositing Layer）的 5 合 1 底部導航欄，釘選視窗底部不卡頓。

### 12. 🌓 日夜雙主題與多語系國際化 (Theme & i18n)
- **雙主題配色**：支援純白簡潔畫布模式（Pure Light）與法拉利賽道深色主題（Dark Red-600）。
- **全球化語系**：內建繁體中文（預設）、簡體中文與英文（English），全站介面隨時切換。

---

## 🛠 技術架構 (Tech Stack)

- **前端框架**：[Next.js 16 (Turbopack & App Router)](https://nextjs.org/)
- **UI 庫**：[React 19](https://react.dev/)
- **樣式庫**：[Tailwind CSS v4](https://tailwindcss.com/)
- **程式語言**：[TypeScript 5](https://www.typescriptlang.org/)
- **資料來源**：[Pokémon TCG API v2](https://pokemontcg.io/) 及自建多領域卡牌資料庫
- **程式碼品質**：ESLint 9

---

## 🚀 快速開始 (Getting Started)

### 1. 先決條件
- [Node.js](https://nodejs.org/) 20.x 或更高版本（建議搭配 `.nvmrc`）
- npm, yarn, pnpm 或 bun

### 2. 下載與安裝

```bash
# 複製專案
git clone https://github.com/hereisalexander/MCARD.git

# 進入專案目錄
cd MCARD

# 安裝相依套件
npm install
```

### 3. 環境變數配置 (選填)
專案開箱即可直接查詢公開 API。若希望提升 API 限速配額，請建立 `.env.local` 檔案：

```bash
cp .env.example .env.local
```

並在 `.env.local` 中填入從 [Pokémon TCG Developer Portal](https://dev.pokemontcg.io/) 申請的免費 API Key：

```env
POKEMON_TCG_API_KEY=your_api_key_here
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000) 即可開始體驗！

### 5. 靜態建置與驗證

```bash
# 執行靜態分析
npm run lint

# 產生靜態匯出（支援 Cloudflare Pages / Vercel）
npm run build
```

---

## 🤝 開源貢獻 (Contributing)

歡迎社群提交 Issue 或 Pull Request！在貢獻代碼前，請先閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md) 以了解分支命名、代碼標準與 PR 審查流程，並請共同遵守我們的 [行為準則 (CODE_OF_CONDUCT.md)](./CODE_OF_CONDUCT.md) 與 [安全政策 (SECURITY.md)](./SECURITY.md)。

---

## 📄 授權協議 & 版權免責 (License & Disclaimer)

### 原始碼授權 (Source Code License)
本專案的程式原始碼採用 **[GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE)** 授權開源。
- 任何人均可自由 Clone、Fork、研究或基於本專案進行衍生修改。
- **限制條件**：任何修改後在伺服器或網路上提供服務的衍生版本，**必須同樣以 AGPL v3 條款公開完整原始碼**，不得包裝為私有閉源產品。

### 寶可夢商標與第三方素材免責聲明 (Trademark & Disclaimer)
- **Pokémon**、寶可夢角色名稱、卡牌圖片及相關商標與圖像版權均屬於 **Nintendo**、**Creatures Inc.** 以及 **GAME FREAK inc.** 所有。
- **One Piece** 相關商標與圖像版權屬於 **Eiichiro Oda / Shueisha, Toei Animation, Bandai** 所有。
- **Yu-Gi-Oh!** 相關商標與圖像版權屬於 **Studio Dice / SHUEISHA, TV TOKYO, KONAMI** 所有。
- **Dragon Ball** 相關商標與圖像版權屬於 **Bird Studio / Shueisha, Toei Animation, Bandai** 所有。
- **NBA** 及球員相關標誌版權屬於 **National Basketball Association** 及各球團所有。
- **FIFA** 及相關足球球員標誌版權屬於 **FIFA** 及相關聯賽與授權機構所有。
- **獨立第三方工具聲明**：本平台為獨立開發之卡牌資產管理與行情數據分析工具，與各版權官方無任何官方附屬、贊助或背書關係。
- 本專案所有卡牌資訊與圖片均取自公開第三方 API，僅基於**指稱性合理使用原則 (Nominative Fair Use)** 用於卡牌識別、行情追蹤與市場資訊整理，非官方授權商品。
