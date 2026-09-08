<div align="center">

# ⚡ Pokémon Collector (寶可夢卡牌投資與收藏管理系統)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

專為寶可夢 TCG 玩家、卡牌藏家與投資愛好者打造的現代化資產管理與圖鑑瀏覽平台。具備極致平滑的 3D 全像光影卡牌傾斜效果、即時市場行情走勢追蹤，以及完整的收藏投資組合損益（P&L）分析。

[快速開始](#-快速開始-getting-started) • [核心功能](#-核心功能-key-features) • [技術架構](#-技術架構-tech-stack) • [貢獻指引](#-開源貢獻-contributing) • [開源授權與免責聲明](#-授權協議--版權免責-license--disclaimer)

</div>

---

## ✨ 核心功能 (Key Features)

- 🌈 **3D 全像光影傾斜效果 (Holographic Foil Tilt)**
  - 擬真 3D 視差傾斜與動態彩虹炫光反應，游標懸停或移動設備陀螺儀交互，完美重現高罕貴度（SAR, UR, SR 等）卡牌的實體反光質感。

- 📊 **投資組合與資產損益管理 (Portfolio & P&L Tracker)**
  - 記錄購入成本（Buy-in Cost）、持倉數量與實時市場價值。
  - 即時計算投資報酬率（ROI %）與總未實現損益。
  - 支援卡牌品相評級標籤（`Ungraded`、`PSA 10`、`PSA 9`、`BGS 10` 等）。
  - 支援資產資料以 JSON 格式安全備份與匯出/匯入。

- 📈 **獨立卡牌詳情與動態歷史走勢圖 (Price Analytics)**
  - 支援 1M / 3M / 6M / 1Y 歷史時間軸切換。
  - 動態自適應 Y 軸縮放與平滑無鋸齒貝茲曲線渲染。
  - 完整展示繪師資訊、系列編號、卡牌稀有度與市場均價。

- 🔍 **全系列圖鑑搜尋與進階篩選 (Search & Filter)**
  - 介接真實 Pokémon TCG API，提供全卡牌資料庫即時檢索。
  - 支援依照價格區間、卡牌名稱、系列名稱、稀有度與發行日期多維度排序。

- 🌐 **多語系支援 (i18n)**
  - 內建繁體中文、簡體中文與英文即時切換。

---

## 🛠 技術架構 (Tech Stack)

- **前端框架**：[Next.js 16 (App Router)](https://nextjs.org/)
- **UI 庫**：[React 19](https://react.dev/)
- **樣式庫**：[Tailwind CSS v4](https://tailwindcss.com/)
- **語言**：[TypeScript 5](https://www.typescriptlang.org/)
- **資料來源**：[Pokémon TCG API v2](https://pokemontcg.io/)
- **代碼品質**：ESLint 9

---

## 🚀 快速開始 (Getting Started)

### 1. 先決條件
- [Node.js](https://nodejs.org/) 20.x 或更高版本
- npm, yarn, pnpm 或 bun

### 2. 下載與安裝

```bash
# 複製專案
git clone https://github.com/hereisalexander/Pokemon_Collector.git

# 進入專案目錄
cd Pokemon_Collector

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

---

## 🤝 開源貢獻 (Contributing)

歡迎社群提交 Issue 或 Pull Request！在貢獻代碼前，請先閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md) 以了解分支命名、代碼標準與 PR 審查流程。

---

## 📄 授權協議 & 版權免責 (License & Disclaimer)

### 原始碼授權 (Source Code License)
本專案的程式原始碼採用 **[GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE)** 授權開源。
- 任何人均可自由 Clone、Fork、研究或基於本專案進行衍生修改。
- **限制條件**：任何修改後在伺服器或網路上提供服務的衍生版本，**必須同樣以 AGPL v3 條款公開完整原始碼**，不得包裝為私有閉源產品。

### 寶可夢商標與素材版權免責 (Trademark & Fan Art Disclaimer)
- **Pokémon**、寶可夢名稱、寶可夢卡牌圖片及其相關商標、圖像與版權屬於 **Nintendo**、**Creatures Inc.** 以及 **GAME FREAK inc.** 所有。
- 本專案純屬個人與開源社群之**非營利、愛好者研究與學習展示用途**。
- 本專案所使用的卡牌數據與圖像均取自公開之第三方 API，不屬於 AGPL-3.0 開源協議之轉讓範疇。
