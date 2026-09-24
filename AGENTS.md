<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MCARD Project Roadmap & Guidelines

## Phase 1 核心完善方向 (已全數完成)：

1. **對接真實 Pokémon TCG API**：
   - 介接 `https://api.pokemontcg.io/v2/cards` 獲取真實卡牌資料庫與價格。
   - 支援無限滾動（Infinite Scroll）與全圖鑑搜尋。

2. **投資組合 (Portfolio) 高級資產管理**：
   - 支援購入成本 (Buy-in Cost) 與 損益率 (P&L / ROI %) 追蹤。
   - 支援卡牌品相/鑑定等級標籤 (`Ungraded`, `PSA 10`, `PSA 9`, `BGS 10`)。
   - 支援持倉數量 (Quantity) 與 JSON/CSV 備份與匯入匯出。

3. **3D 閃卡彩虹光影互動 (Holographic Foil Effect)**：
   - 為特殊卡牌（SAR, UR, SR 等）加入 3D 視差傾斜 (Parallax Tilt) 與動態質感流暢微傾斜。

4. **獨立卡牌詳情頁與歷史價格圖表**：
   - 獨立頁面 View 導覽，展示動態自適應 Y 軸縮放、可切換 1M/3M/6M/1Y 時間軸、無鋸齒極致平滑的歷史價格走勢圖、繪師資訊與詳細屬性。

5. **排序與多維度高級過濾**：
   - 支援價格升降序、名稱/編號排序，以及價格區間過濾。

---

## Phase 2 進階重量級功能規劃 (Roadmap Future Features)：

1. **卡牌對比與行情疊加分析 (Card Versus & Comparison Matrix)**：
   - 支援同時勾選 2~4 張卡牌，疊加展示歷史價格走勢曲線對比、ROI 報酬率與數據矩陣。

2. **願望清單與目標價預警 (Wishlist & Price Target Alerts)**：
   - 支援加至 Wishlist，並提供目標降價預警（Price Drops Notification）。

3. **封印盒/未拆箱資產管理 (Sealed Product Tracker)**：
   - 在 Portfolio 支援 `Sealed Products` 頁籤，追蹤 Booster Box / ETB 盒裝市價與成本。

4. **虛擬拆包與抽卡體驗 (Booster Pack Opening Simulator)**：
   - 提供 151 / Evolving Skies 虛擬拆包撕開動畫與抽卡配率，抽中神卡可一鍵放入 Portfolio。

5. **收藏庫資產分析報告導出 (Graphic Infographic Export)**：
   - 一鍵生成炫酷的個人卡牌收藏資產報告海報，方便社群分享。
