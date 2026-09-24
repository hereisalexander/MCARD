# 🤝 貢獻指南 (Contributing Guide)

感謝你對 **MCARD** 的關注與支持！我們歡迎任何形式的貢獻，包括但不限於：問題回報（Bug Reports）、新功能建議（Feature Requests）、文件改進以及代碼提交（Pull Requests）。

在開始貢獻前，請花一點時間閱讀以下指引，並請遵守我們的 [行為準則 (Code of Conduct)](./CODE_OF_CONDUCT.md)。

---

## 🕊️ 行為準則 (Code of Conduct)

為了保障所有社群成員的權益與良好交流氛圍，參與本專案請遵守我們的 [行為準則 (Contributor Covenant v2.1)](./CODE_OF_CONDUCT.md)。任何騷擾、歧視或不當行為均不被允許。

---

## 📜 開源協議規範 (License Notice)

本專案採用 **[GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE)** 授權開源。
- 任何提交給本專案的代碼均視為同意以 **AGPL-3.0** 授權。
- 若你基於本專案建立分支或發布衍生服務，**必須維持 AGPL-3.0 協議並公開完整原始碼**。
- 請注意：寶可夢相關商標與卡牌圖像版權屬於原官方（Nintendo / Creatures Inc. / GAME FREAK inc.），本專案與官方無附屬關係，提交代碼請勿包含任何侵害第三方智慧財產權之未授權資產。

---

## 🛠 本地開發環境設置 (Local Development)

1. **Fork 本專案**：
   在 GitHub 頁面右上角點擊 **Fork** 按鈕，複製一份至你的 GitHub 帳號。

2. **Clone 至本機**：
   ```bash
   git clone https://github.com/<your-username>/MCARD.git
   cd MCARD
   ```

3. **安裝相依套件**：
   ```bash
   npm install
   ```

4. **環境變數 (選填)**：
   若需自訂 API 配額，請複製 `.env.example` 為 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

5. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   在瀏覽器中造訪 `http://localhost:3000`。

---

## 🌿 分支管理規範 (Git Branches)

建議從 `main` 分支建立新的特性或修復分支，並遵循清晰的命名規範：

- `feat/<feature-name>`：新功能開發（例如：`feat/card-versus-matrix`）
- `fix/<bug-name>`：錯誤修復（例如：`fix/mobile-touch-tilt`）
- `docs/<doc-name>`：文件或說明補充（例如：`docs/api-guide`）
- `refactor/<target>`：代碼重構或優化

---

## 📝 Commit 訊息風格 (Conventional Commits)

請盡量遵循標準的 Commit Message 風格：
```
<type>(<scope>): <short description>
```
常見的 `type`：
- `feat`：新功能
- `fix`：錯誤修復
- `style`：樣式調整或格式化
- `refactor`：重構
- `docs`：文件變更
- `chore`：設定檔或建置工具調整

*範例：`feat(portfolio): add sealed product tracker tab`*

---

## 🧪 代碼質量與提交前自我檢查 (Checklist)

在建立 Pull Request 前，請務必在本地終端執行以下兩項命令，確保無錯誤：

1. **代碼風格檢查**：
   ```bash
   npm run lint
   ```
   確保 `0 errors` 通過。

2. **生產構建驗證**：
   ```bash
   npm run build
   ```
   確保 Next.js 能成功打包編譯，無 TypeScript 型別錯誤。

---

## 🚀 提交 Pull Request (PR)

1. 將你的改動 Push 至你 Fork 的遠端倉庫：
   ```bash
   git push origin feat/your-feature-name
   ```
2. 在 GitHub 上針對本專案的 `main` 分支發起 Pull Request。
3. 詳細填寫 PR 描述，說明改動動機、改動內容以及自測結果。
4. GitHub Actions CI 會自動針對你的 PR 執行構建測試。待通過並由維護者審核完成後即可合併！

感謝你為寶可夢卡牌社群所做的貢獻！🎉
