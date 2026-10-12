'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { CardCategory } from '@/services/multiCardService';

interface LegalPageLayoutProps {
  activeTab: 'terms' | 'privacy';
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ activeTab }) => {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [portfolioCount, setPortfolioCount] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedPortfolio = localStorage.getItem('mcard_portfolio_assets');
        if (savedPortfolio) {
          const parsed = JSON.parse(savedPortfolio);
          if (Array.isArray(parsed)) {
            setPortfolioCount(parsed.length);
            const totalVal = parsed.reduce(
              (sum: number, item: { marketPrice?: number; quantity?: number }) =>
                sum + (Number(item.marketPrice) || 0) * (Number(item.quantity) || 1),
              0
            );
            setPortfolioValue(totalVal);
          }
        }
        const savedWishlist = localStorage.getItem('mcard_wishlist_items');
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            setWishlistCount(parsedWishlist.length);
          }
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'stream' || tab === 'home') {
      router.push('/');
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  const handleCategoryChange = (category: CardCategory) => {
    router.push(`/?tab=explore&category=${category}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* 頂部導航欄（與首頁完全一致的 Navbar） */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        portfolioCount={portfolioCount}
        portfolioValue={portfolioValue}
        selectedCategory="all"
        onCategoryChange={handleCategoryChange}
        wishlistCount={wishlistCount}
      />

      {/* Main Content Area - Full Max Width matching Home Page */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* 次級導覽：回到首頁 & 服務條款 / 隱私權政策 切換 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/60 pb-4 mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{language === 'zh-TW' ? '返回首頁' : language === 'zh-CN' ? '返回首页' : 'Home'}</span>
              </Link>
              <span className="text-hairline">/</span>
              <span className="text-foreground">{language === 'zh-TW' ? '法律條款與協議' : language === 'zh-CN' ? '法律条款与协议' : 'Legal & Compliance'}</span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/terms"
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === 'terms'
                    ? 'bg-surface text-ferrari-red border border-hairline shadow-xs font-bold'
                    : 'text-text-muted hover:text-foreground hover:bg-surface-hover/60 border border-transparent'
                }`}
              >
                {language === 'zh-TW' ? '服務條款' : language === 'zh-CN' ? '服务条款' : 'Terms of Service'}
              </Link>
              <Link
                href="/privacy"
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === 'privacy'
                    ? 'bg-surface text-ferrari-red border border-hairline shadow-xs font-bold'
                    : 'text-text-muted hover:text-foreground hover:bg-surface-hover/60 border border-transparent'
                }`}
              >
                {language === 'zh-TW' ? '隱私權政策' : language === 'zh-CN' ? '隐私权政策' : 'Privacy Policy'}
              </Link>
            </div>
          </div>
        {/* ===================== TERMS OF SERVICE ===================== */}
        {activeTab === 'terms' && (
          <article className="space-y-8">
            <header className="border-b border-hairline/60 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-ferrari-red" />
                <span className="font-mono text-xs font-semibold text-ferrari-red tracking-wider uppercase">
                  {language === 'zh-TW'
                    ? '法律條款與協議'
                    : language === 'zh-CN'
                    ? '法律条款与协议'
                    : 'Legal & Compliance Vault'}
                </span>
              </div>
              <h1 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground">
                {language === 'zh-TW'
                  ? '服務條款 (Terms of Service)'
                  : language === 'zh-CN'
                  ? '服务条款 (Terms of Service)'
                  : 'Terms of Service'}
              </h1>
              <p className="mt-2 font-mono text-xs text-text-muted">
                {language === 'zh-TW'
                  ? '最後更新日期：2026 年 9 月'
                  : language === 'zh-CN'
                  ? '最后更新日期：2026 年 9 月'
                  : 'Last Updated: September 2026'}
              </p>
            </header>

            <div className="p-5 rounded-2xl bg-surface-hover/50 border border-hairline/80 text-foreground/90 font-medium leading-relaxed">
              <p>
                {language === 'zh-TW'
                  ? '歡迎使用 MCARD 寶可夢卡牌遙測與資產管理平台。透過存取或使用本網站，即表示您已詳細閱讀並同意遵守以下服務條款與免責聲明。'
                  : language === 'zh-CN'
                  ? '欢迎使用 MCARD 宝可梦卡牌遥测与资产管理平台。通过访问或使用本网站，即表示您已详细阅读并同意遵守以下服务条款与免责声明。'
                  : 'Welcome to MCARD. By accessing or using this application, you agree to be bound by these terms regarding card telemetry, API utilization, and fair use.'}
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  1
                </span>
                {language === 'zh-TW'
                  ? '智慧財產權與商標免責聲明'
                  : language === 'zh-CN'
                  ? '知识产权与商标免责声明'
                  : 'Intellectual Property & Trademarks'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
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
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  2
                </span>
                {language === 'zh-TW'
                  ? '市場行情數據與非財務建議聲明'
                  : language === 'zh-CN'
                  ? '市场行情数据与非财务建议声明'
                  : 'Market Data & Investment Disclaimer'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
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
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  3
                </span>
                {language === 'zh-TW'
                  ? '合理使用與系統可用性'
                  : language === 'zh-CN'
                  ? '合理使用与系统可用性'
                  : 'Fair Use & Service Availability'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '使用者應遵守公平合理的使用原則，禁止利用惡意腳本、高頻爬蟲對本服務或底層第三方 API 發動阻斷式請求。本服務保留隨時維護、更新或調整功能內容之權利。'
                    : language === 'zh-CN'
                    ? '使用者应遵守公平合理的使用原则，禁止利用恶意脚本、高频爬虫对本服务或底层第三方 API 发动阻断式请求。本服务保留随时维护、更新或调整功能内容之权利。'
                    : 'Users agree to engage with the service respectfully, without malicious automated scripting or flood requests. We reserve the right to modify or maintain system capabilities at any time.'}
                </p>
              </div>
            </section>
          </article>
        )}

        {/* ===================== PRIVACY POLICY ===================== */}
        {activeTab === 'privacy' && (
          <article className="space-y-8">
            <header className="border-b border-hairline/60 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-ferrari-red" />
                <span className="font-mono text-xs font-semibold text-ferrari-red tracking-wider uppercase">
                  {language === 'zh-TW'
                    ? '隱私與數據保護'
                    : language === 'zh-CN'
                    ? '隐私与数据保护'
                    : 'Privacy & Data Protection'}
                </span>
              </div>
              <h1 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground">
                {language === 'zh-TW'
                  ? '隱私權政策 (Privacy Policy)'
                  : language === 'zh-CN'
                  ? '隐私权政策 (Privacy Policy)'
                  : 'Privacy Policy'}
              </h1>
              <p className="mt-2 font-mono text-xs text-text-muted">
                {language === 'zh-TW'
                  ? '最後更新日期：2026 年 9 月'
                  : language === 'zh-CN'
                  ? '最后更新日期：2026 年 9 月'
                  : 'Last Updated: September 2026'}
              </p>
            </header>

            {/* Security Badge Highlight */}
            <div className="p-5 rounded-2xl bg-semantic-success/10 border border-semantic-success/30 flex items-start gap-3.5">
              <div className="w-2.5 h-2.5 rounded-full bg-semantic-success shrink-0 mt-1.5 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-semantic-success tracking-wide uppercase">
                  {language === 'zh-TW'
                    ? '100% 本地優先隱私架構 (Local-First Architecture)'
                    : language === 'zh-CN'
                    ? '100% 本地优先隐私架构 (Local-First Architecture)'
                    : '100% Local-First Architecture'}
                </span>
                <p className="text-text-muted text-sm mt-1 leading-relaxed">
                  {language === 'zh-TW'
                    ? '您的卡牌庫、購入成本、鑑定等級、自訂數量與介面偏好完全儲存於您的本機瀏覽器中，不建立任何遠端使用者追蹤檔案。'
                    : language === 'zh-CN'
                    ? '您的卡牌库、购入成本、鉴定等级、自订数量与界面偏好完全储存于您的本机浏览器中，不建立任何远端使用者追踪档案。'
                    : 'All portfolio holdings, purchase valuations, grading tiers, and user preferences are retained locally inside your browser storage.'}
                </p>
              </div>
            </div>

            {/* Privacy Item 1 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  1
                </span>
                {language === 'zh-TW'
                  ? '我們收集哪些資料？'
                  : language === 'zh-CN'
                  ? '我们收集哪些资料？'
                  : 'Information We Collect'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '我們不要求您提供任何真實姓名、身份證字號、電話號碼或信用卡財務資料。所有資產組合記錄（Portfolio）均透過瀏覽器的 LocalStorage 在本機端獨立保存。'
                    : language === 'zh-CN'
                    ? '我们不要求您提供任何真实姓名、身份证字号、电话号码或信用卡财务资料。所有资产组合记录（Portfolio）均通过浏览器的 LocalStorage 在本机端独立保存。'
                    : 'We do not collect personal identities, real names, phone numbers, or payment credentials. Your portfolio holdings exist purely within your client-side LocalStorage.'}
                </p>
              </div>
            </section>

            {/* Privacy Item 2 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  2
                </span>
                {language === 'zh-TW'
                  ? 'Cookie 與第三方追蹤機制'
                  : language === 'zh-CN'
                  ? 'Cookie 与第三方追踪机制'
                  : 'Cookies & Tracking Technologies'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '本網站絕不使用任何跨網站廣告追蹤 Cookie、行為畫像分析或第三方資料販售工具。您的收藏資產屬於您的私人領域，我們絕不向任何行銷機構出售或分享您的資產組合資料。'
                    : language === 'zh-CN'
                    ? '本网站绝不使用任何跨网站广告追踪 Cookie、行为画像分析或第三方资料贩售工具。您的收藏资产属于您的私人领域，我们绝不向任何营销机构出售或分享您的资产组合资料。'
                    : 'We do not implement cross-site marketing cookies, user profiling, or third-party telemetry brokers. Your collection remains entirely private.'}
                </p>
              </div>
            </section>

            {/* Privacy Item 3 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  3
                </span>
                {language === 'zh-TW'
                  ? '第三方 API 服務通訊'
                  : language === 'zh-CN'
                  ? '第三方 API 服务通讯'
                  : 'Third-Party API Communication'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '當您搜尋卡牌或檢視圖鑑時，應用程式會直接透過安全 HTTPS 協定向官方/公開之 Pokémon TCG API 請求卡片數據與價格行情，傳輸內容僅限於卡牌編號或搜尋字串，絕不上傳您的個人投資組合清單。'
                    : language === 'zh-CN'
                    ? '当您搜寻卡牌或检视图鉴时，应用程序会直接通过安全 HTTPS 协议向官方/公开之 Pokémon TCG API 请求卡片数据与价格行情，传输内容仅限于卡牌编号或搜寻字串，绝不上载您的个人投资组合清单。'
                    : 'API queries are sent via secure HTTPS to fetch publicly accessible card data and pricing. Search keywords and card IDs are transmitted, but your personal holdings are never sent.'}
                </p>
              </div>
            </section>

            {/* Privacy Item 4 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  4
                </span>
                {language === 'zh-TW'
                  ? '資料完全自主權（備份與清除）'
                  : language === 'zh-CN'
                  ? '资料完全自主权（备份与清除）'
                  : 'Data Ownership & Erasure'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '您對自己的資料擁有 100% 的掌控權。您可以隨時在 Portfolio 頁面點擊「JSON 匯出」進行離線備份，亦可隨時手動清除瀏覽器快取以永久抹除所有本機資料。'
                    : language === 'zh-CN'
                    ? '您对自己的资料拥有 100% 的掌控权。您可以随时在 Portfolio 页面点击「JSON 汇出」进行离线备份，亦可随时手动清除浏览器快取以永久抹除所有本机资料。'
                    : 'You have absolute control over your records. Export your entire vault as JSON anytime from the Portfolio tab, or purge browser storage to permanently erase records.'}
                </p>
              </div>
            </section>
          </article>
        )}
        </div>
      </main>

      {/* Footer - Exact match with page.tsx footer dimensions */}
      <footer className="w-full border-t border-hairline/60 py-10 px-4 md:px-10 mt-16 mb-12 bg-surface text-center transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-3.5 bg-ferrari-red" />
              <span className="font-sans text-[11px] tracking-[0.5px] text-text-muted">
                © 2026 MCARD. Multi-TCG & Sports Cards Telemetry Edition. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 font-sans text-[11px] tracking-[0.5px] text-text-muted">
              <Link
                href="/terms"
                className={`transition-colors duration-150 ${
                  activeTab === 'terms' ? 'text-foreground font-bold' : 'hover:text-foreground'
                }`}
              >
                Terms
              </Link>
              <span>/</span>
              <Link
                href="/privacy"
                className={`transition-colors duration-150 ${
                  activeTab === 'privacy' ? 'text-foreground font-bold' : 'hover:text-foreground'
                }`}
              >
                Privacy
              </Link>
            </div>
          </div>

          <div className="border-t border-hairline/40 pt-4 text-left">
            <p className="font-sans text-[10px] text-text-muted/80 leading-relaxed max-w-4xl">
              {t('affiliate_disclosure_footer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
