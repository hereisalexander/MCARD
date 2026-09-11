'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export type FooterModalType = 'terms' | 'privacy' | null;

interface FooterModalsProps {
  activeModal: FooterModalType;
  onClose: () => void;
}

export const FooterModals: React.FC<FooterModalsProps> = ({ activeModal, onClose }) => {
  const { language } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'terms' | 'privacy'>('terms');

  // Sync internal tab state with activeModal prop
  useEffect(() => {
    if (activeModal) {
      setCurrentTab(activeModal);
    }
  }, [activeModal]);

  // Keyboard accessibility: Close on ESC key
  useEffect(() => {
    if (!activeModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleTabSelect = (tab: 'terms' | 'privacy') => {
    setCurrentTab(tab);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-surface text-foreground border border-hairline/80 rounded-2xl max-w-2xl w-full shadow-2xl relative flex flex-col overflow-hidden transition-all duration-200 animate-scale-in max-h-[85vh]">
        
        {/* Top Header & Tab Navigation Bar */}
        <div className="p-6 pb-4 border-b border-hairline/60 flex items-start justify-between gap-4 bg-surface-hover/30">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ferrari-red" />
              <span className="font-mono text-xs font-semibold text-ferrari-red tracking-wider uppercase">
                {language === 'zh-TW'
                  ? '法律條款與協議'
                  : language === 'zh-CN'
                  ? '法律条款与协议'
                  : 'Legal & Compliance Vault'}
              </span>
            </div>

            {/* Quick Switch Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-hover/80 rounded-xl border border-hairline/60 mt-1">
              <button
                onClick={() => handleTabSelect('terms')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  currentTab === 'terms'
                    ? 'bg-surface text-ferrari-red shadow-xs font-bold'
                    : 'text-text-muted hover:text-foreground'
                }`}
                aria-label="View Terms of Service"
              >
                {language === 'zh-TW' ? '服務條款' : language === 'zh-CN' ? '服务条款' : 'Terms of Service'}
              </button>
              <button
                onClick={() => handleTabSelect('privacy')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  currentTab === 'privacy'
                    ? 'bg-surface text-ferrari-red shadow-xs font-bold'
                    : 'text-text-muted hover:text-foreground'
                }`}
                aria-label="View Privacy Policy"
              >
                {language === 'zh-TW' ? '隱私權政策' : language === 'zh-CN' ? '隐私权政策' : 'Privacy Policy'}
              </button>
            </div>
          </div>

          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-hairline/60 shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-[13px] leading-relaxed text-text-muted">
          
          {/* ===================== 1. TERMS OF SERVICE ===================== */}
          {currentTab === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 id="modal-title" className="font-sans font-semibold text-xl sm:text-2xl tracking-tight text-foreground">
                  {language === 'zh-TW'
                    ? '服務條款 (Terms of Service)'
                    : language === 'zh-CN'
                    ? '服务条款 (Terms of Service)'
                    : 'Terms of Service'}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-text-muted">
                  {language === 'zh-TW'
                    ? '最後更新日期：2026 年 9 月'
                    : language === 'zh-CN'
                    ? '最后更新日期：2026 年 9 月'
                    : 'Last Updated: September 2026'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-hover/40 border border-hairline/60">
                <p className="text-foreground/90 font-medium">
                  {language === 'zh-TW'
                    ? '歡迎使用 MCARD 寶可夢卡牌遙測與資產管理平台。透過存取或使用本網站，即表示您已詳細閱讀並同意遵守以下服務條款與免責聲明。'
                    : language === 'zh-CN'
                    ? '欢迎使用 MCARD 宝可梦卡牌遥测与资产管理平台。通过访问或使用本网站，即表示您已详细阅读并同意遵守以下服务条款与免责声明。'
                    : 'Welcome to MCARD. By accessing or using this application, you agree to be bound by these terms regarding card telemetry, API utilization, and fair use.'}
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">1</span>
                  {language === 'zh-TW'
                    ? '智慧財產權與商標免責聲明'
                    : language === 'zh-CN'
                    ? '知识产权与商标免责声明'
                    : 'Intellectual Property & Trademarks'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? 'Pokémon、寶可夢、神奇寶貝名稱與所有角色圖樣均為任天堂 (Nintendo)、Creatures Inc. 及 GAME FREAK 之註冊商標。所有卡片圖樣、卡名與相關美術資產版權均屬於其各自合法權利人。'
                    : language === 'zh-CN'
                    ? 'Pokémon、宝可梦、神奇宝贝名称与所有角色图样均为任天堂 (Nintendo)、Creatures Inc. 及 GAME FREAK 之注册商标。所有卡片图样、卡名与相关美术资产版权均属于其各自合法权利人。'
                    : 'Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK. All card artwork and visual assets belong to their respective copyright holders.'}
                </p>
                <p>
                  {language === 'zh-TW'
                    ? '本網站為非官方粉絲社群開源收藏工具，並未獲得 The Pokémon Company、Nintendo 或相關實體之贊助、認證或正式授權。'
                    : language === 'zh-CN'
                    ? '本网站为非官方粉丝社区开源收藏工具，并未获得 The Pokémon Company、Nintendo 或相关实体之赞助、认证或正式授权。'
                    : 'This platform is an independent, community-driven collector utility and is not affiliated with, endorsed, or sponsored by The Pokémon Company or Nintendo.'}
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">2</span>
                  {language === 'zh-TW'
                    ? '市場行情數據與非財務建議聲明'
                    : language === 'zh-CN'
                    ? '市场行情数据与非财务建议声明'
                    : 'Market Data & Investment Disclaimer'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? '本站所呈現之卡牌市場參考價、歷史價格走勢圖、損益率 (ROI %) 與估值數據，均介接自 Pokémon TCG API、TCGPlayer 或 Cardmarket 之公開市場遙測資訊或估算模型。'
                    : language === 'zh-CN'
                    ? '本站所呈现之卡牌市场参考价、历史价格走势图、损益率 (ROI %) 与估值数据，均介接自 Pokémon TCG API、TCGPlayer 或 Cardmarket 之公开市场遥测资讯或估算模型。'
                    : 'All card prices, historical trajectories, and P&L/ROI percentages are aggregated from public Pokémon TCG API and TCGPlayer market feeds or mathematical models.'}
                </p>
                <p>
                  {language === 'zh-TW'
                    ? '所有數據僅供個人收藏記錄、休閒娛樂及研究參考，絕不構成任何證券、期貨、投資推薦或財務建議。集換式卡牌市場價格波動劇烈，任何交易決策均須由使用者自行承擔風險。'
                    : language === 'zh-CN'
                    ? '所有数据仅供个人收藏记录、休闲娱乐及研究参考，绝不构成任何证券、期货、投资推荐或财务建议。集换式卡牌市场价格波动剧烈，任何交易决策均须由使用者自行承担风险。'
                    : 'Data is provided for informational and collection tracking purposes only and does not constitute financial advice. TCG card market values fluctuate significantly; all transactions are made at your own discretion.'}
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">3</span>
                  {language === 'zh-TW'
                    ? '合理使用與系統可用性'
                    : language === 'zh-CN'
                    ? '合理使用与系统可用性'
                    : 'Fair Use & Service Availability'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? '使用者應遵守公平合理的使用原則，禁止利用惡意腳本、高頻爬蟲對本服務或底層第三方 API 發動阻斷式請求。本服務保留隨時維護、更新或調整功能內容之權利。'
                    : language === 'zh-CN'
                    ? '使用者应遵守公平合理的使用原则，禁止利用恶意脚本、高频爬虫对本服务或底层第三方 API 发动阻断式请求。本服务保留随时维护、更新或调整功能内容之权利。'
                    : 'Users agree to engage with the service respectfully, without malicious automated scripting or flood requests. We reserve the right to modify or maintain system capabilities at any time.'}
                </p>
              </div>
            </div>
          )}

          {/* ===================== 2. PRIVACY POLICY ===================== */}
          {currentTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 id="modal-title" className="font-sans font-semibold text-xl sm:text-2xl tracking-tight text-foreground">
                  {language === 'zh-TW'
                    ? '隱私權政策 (Privacy Policy)'
                    : language === 'zh-CN'
                    ? '隐私权政策 (Privacy Policy)'
                    : 'Privacy Policy'}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-text-muted">
                  {language === 'zh-TW'
                    ? '最後更新日期：2026 年 9 月'
                    : language === 'zh-CN'
                    ? '最后更新日期：2026 年 9 月'
                    : 'Last Updated: September 2026'}
                </p>
              </div>

              {/* Security Badge Highlight */}
              <div className="p-4 rounded-xl bg-semantic-success/10 border border-semantic-success/30 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-semantic-success shrink-0 mt-1 animate-pulse" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-semantic-success tracking-wide uppercase">
                    {language === 'zh-TW'
                      ? '100% 本地優先隱私架構 (Local-First Architecture)'
                      : language === 'zh-CN'
                      ? '100% 本地优先隐私架构 (Local-First Architecture)'
                      : '100% Local-First Architecture'}
                  </span>
                  <p className="text-text-muted text-xs mt-1">
                    {language === 'zh-TW'
                      ? '您的卡牌庫、購入成本、鑑定等級、自訂數量與介面偏好完全儲存於您的本機瀏覽器中，不建立任何遠端使用者追蹤檔案。'
                      : language === 'zh-CN'
                      ? '您的卡牌库、购入成本、鉴定等级、自订数量与界面偏好完全储存于您的本机浏览器中，不建立任何远端使用者追踪档案。'
                      : 'All portfolio holdings, purchase valuations, grading tiers, and user preferences are retained locally inside your browser storage.'}
                  </p>
                </div>
              </div>

              {/* Privacy Item 1 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">1</span>
                  {language === 'zh-TW'
                    ? '我們收集哪些資料？'
                    : language === 'zh-CN'
                    ? '我们收集哪些资料？'
                    : 'Information We Collect'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? '我們不要求您提供任何真實姓名、身份證字號、電話號碼或信用卡財務資料。所有資產組合記錄（Portfolio）均透過瀏覽器的 LocalStorage 在本機端獨立保存。'
                    : language === 'zh-CN'
                    ? '我们不要求您提供任何真实姓名、身份证字号、电话号码或信用卡财务资料。所有资产组合记录（Portfolio）均通过浏览器的 LocalStorage 在本机端独立保存。'
                    : 'We do not collect personal identities, real names, phone numbers, or payment credentials. Your portfolio holdings exist purely within your client-side LocalStorage.'}
                </p>
              </div>

              {/* Privacy Item 2 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">2</span>
                  {language === 'zh-TW'
                    ? 'Cookie 與第三方追蹤機制'
                    : language === 'zh-CN'
                    ? 'Cookie 与第三方追踪机制'
                    : 'Cookies & Tracking Technologies'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? '本網站絕不使用任何跨網站廣告追蹤 Cookie、行為畫像分析或第三方資料販售工具。您的收藏資產屬於您的私人領域，我們絕不向任何行銷機構出售或分享您的資產組合資料。'
                    : language === 'zh-CN'
                    ? '本网站绝不使用任何跨网站广告追踪 Cookie、行为画像分析或第三方资料贩售工具。您的收藏资产属于您的私人领域，我们绝不向任何营销机构出售或分享您的资产组合资料。'
                    : 'We do not implement cross-site marketing cookies, user profiling, or third-party telemetry brokers. Your collection remains entirely private.'}
                </p>
              </div>

              {/* Privacy Item 3 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">3</span>
                  {language === 'zh-TW'
                    ? '第三方 API 服務通訊'
                    : language === 'zh-CN'
                    ? '第三方 API 服务通讯'
                    : 'Third-Party API Communication'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? '當您搜尋卡牌或檢視圖鑑時，應用程式會直接透過安全 HTTPS 協定向官方/公開之 Pokémon TCG API 請求卡片數據與價格行情，傳輸內容僅限於卡牌編號或搜尋字串，絕不上傳您的個人投資組合清單。'
                    : language === 'zh-CN'
                    ? '当您搜寻卡牌或检视图鉴时，应用程序会直接通过安全 HTTPS 协议向官方/公开之 Pokémon TCG API 请求卡片数据与价格行情，传输内容仅限于卡牌编号或搜寻字串，绝不上载您的个人投资组合清单。'
                    : 'API queries are sent via secure HTTPS to fetch publicly accessible card data and pricing. Search keywords and card IDs are transmitted, but your personal holdings are never sent.'}
                </p>
              </div>

              {/* Privacy Item 4 */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs">4</span>
                  {language === 'zh-TW'
                    ? '資料完全自主權（備份與清除）'
                    : language === 'zh-CN'
                    ? '资料完全自主权（备份与清除）'
                    : 'Data Ownership & Erasure'}
                </h4>
                <p>
                  {language === 'zh-TW'
                    ? '您對自己的資料擁有 100% 的掌控權。您可以隨時在 Portfolio 頁面點擊「JSON 匯出」進行離線備份，亦可隨時手動清除瀏覽器快取以永久抹除所有本機資料。'
                    : language === 'zh-CN'
                    ? '您对自己的资料拥有 100% 的掌控权。您可以随时在 Portfolio 页面点击「JSON 汇出」进行离线备份，亦可随时手动清除浏览器快取以永久抹除所有本机资料。'
                    : 'You have absolute control over your records. Export your entire vault as JSON anytime from the Portfolio tab, or purge browser storage to permanently erase records.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-hairline/60 bg-surface-hover/30 flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 text-text-muted font-mono text-[11px]">
            <span>Press</span>
            <kbd className="px-2 py-0.5 rounded bg-surface border border-hairline text-foreground shadow-2xs">ESC</kbd>
            <span>to close</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="h-10 px-6 rounded-xl font-sans text-xs font-semibold bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white transition-all duration-150 cursor-pointer shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
              aria-label="Confirm and close modal"
            >
              <span>
                {language === 'zh-TW' ? '我已瞭解' : language === 'zh-CN' ? '我已了解' : 'I Understand'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

