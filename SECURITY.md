# 安全政策 (Security Policy)

感謝你協助維護 **Pokémon Collector** 的安全性與穩健性。我們非常重視專案與使用者的安全。

---

## 支援的版本 (Supported Versions)

目前僅針對最新發布與 `main` 分支的代碼提供安全性維護與漏洞修復支援：

| 版本 / 分支 | 是否支援安全修復 | 說明 |
| :--- | :---: | :--- |
| `main` 分支 | ✅ 支援 | 活躍維護中的最新版本代碼 |
| 舊版 / 其他分支 | ❌ 不支援 | 請更新至最新 `main` 分支代碼 |

---

## 安全漏洞回報流程 (Reporting a Vulnerability)

為了保護社群與使用者免受潛在風險影響，**請勿在公開的 GitHub Issues 中直接公布未修復的安全漏洞細節**。

我們完全透過 **GitHub 平台** 進行私密安全漏洞回報與處理（無需寄送 Email）：

### 🛡️ 建議通報管道：GitHub 私密安全通報 (Private Vulnerability Reporting)
1. 前往本儲存庫的 **[Security Advisories 頁面](https://github.com/hereisalexander/Pokemon_Collector/security/advisories/new)**。
2. 點擊 **"Report a vulnerability"** 建立私密報告。
3. 詳細填寫以下資訊：
   - 受影響的元件、檔案或路由（例如 API 端點、狀態持久化邏輯等）。
   - 漏洞類型與嚴重性（例如 XSS、CSRF、資料洩漏、注入漏洞等）。
   - 重現步驟與概念驗證（PoC / 攻擊範例）。
   - 建議的緩解措施或修復方案（如有）。

> **備註**：透過 GitHub Security Advisories 提交的漏洞通報，**只有專案維護者與你本人看得見**，能確保在修復完成前不被惡意第三方利用。

---

## 漏洞處理與揭露承諾 (Vulnerability Handling Process)

1. **確認與回覆**：
   - 維護團隊在收到通報後，會盡速確認該漏洞的有效性與風險等級。
2. **修復與驗證**：
   - 維護團隊將在私密安全分支中開發修復補丁，並進行回歸測試與構建驗證。
3. **安全公告與發布**：
   - 修復補丁合併至 `main` 分支後，我們將公開發布安全更新，並在公告中適度向通報者致謝（若通報者同意）。

---

## 第三方 API 金鑰與敏感資訊安全提醒

- 請勿將個人的 **`POKEMON_TCG_API_KEY`** 或任何私密金鑰提交（Commit）至 Git 儲存庫。
- 本專案已在 `.gitignore` 中預設忽略所有 `.env*` 檔案（除 `.env.example` 範本外）。若不慎提交了私密金鑰，請立即至提供商處撤銷並重新生成。
