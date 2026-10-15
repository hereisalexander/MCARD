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
  const [currentTab, setCurrentTab] = useState<'terms' | 'privacy'>(activeTab);
  const [portfolioCount, setPortfolioCount] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // Sync tab on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('privacy')) {
        setCurrentTab('privacy');
      } else if (path.includes('terms')) {
        setCurrentTab('terms');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLegalTabSwitch = (e: React.MouseEvent, targetTab: 'terms' | 'privacy') => {
    e.preventDefault();
    if (currentTab === targetTab) return;
    setCurrentTab(targetTab);
    window.history.pushState(null, '', `/${targetTab}`);
  };

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
        activeTab={currentTab}
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
                scroll={false}
                onClick={(e) => handleLegalTabSwitch(e, 'terms')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  currentTab === 'terms'
                    ? 'bg-surface text-ferrari-red border border-hairline shadow-xs'
                    : 'text-text-muted hover:text-foreground hover:bg-surface-hover/60 border border-transparent'
                }`}
              >
                {language === 'zh-TW' ? '服務條款' : language === 'zh-CN' ? '服务条款' : 'Terms of Service'}
              </Link>
              <Link
                href="/privacy"
                scroll={false}
                onClick={(e) => handleLegalTabSwitch(e, 'privacy')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  currentTab === 'privacy'
                    ? 'bg-surface text-ferrari-red border border-hairline shadow-xs'
                    : 'text-text-muted hover:text-foreground hover:bg-surface-hover/60 border border-transparent'
                }`}
              >
                {language === 'zh-TW' ? '隱私權政策' : language === 'zh-CN' ? '隐私权政策' : 'Privacy Policy'}
              </Link>
            </div>
          </div>
        {/* ===================== TERMS OF SERVICE ===================== */}
        {currentTab === 'terms' && (
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
                  ? '多領域卡牌智慧財產權與商標聲明'
                  : language === 'zh-CN'
                  ? '多领域卡牌知识产权与商标声明'
                  : 'Multi-TCG Intellectual Property & Trademarks'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '本平台所涵蓋之各項集換式卡牌與球星卡系列商標、標誌、卡面圖樣、角色名稱及美術著作權，均屬其各自合法權利人所有，包括但不限於：'
                    : language === 'zh-CN'
                    ? '本平台所涵盖之各项集换式卡牌与球星卡系列商标、标志、卡面图样、角色名称及美术著作权，均属其各自合法权利人所有，包括但不限于：'
                    : 'All trading card and sports card trademarks, logos, card designs, character names, and artistic copyrights belong to their respective legal owners, including but not limited to:'}
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-text-muted/90">
                  <li><strong>Pokémon</strong>: © Nintendo / Creatures Inc. / GAME FREAK inc.</li>
                  <li><strong>Yu-Gi-Oh! (遊戲王)</strong>: © Studio Dice / SHUEISHA, TV TOKYO, KONAMI.</li>
                  <li><strong>One Piece / Dragon Ball (航海王 / 七龍珠)</strong>: © Eiichiro Oda / Akira Toriyama / SHUEISHA, Toei Animation, Bandai Namco.</li>
                  <li><strong>Sports Cards (NBA / FIFA)</strong>: © NBA Properties, Inc., © FIFA, Panini America, Topps.</li>
                </ul>
                <p>
                  {language === 'zh-TW'
                    ? 'MCARD 係獨立運作之非官方粉絲開源工具與卡牌資產管理平台，未受上述任何公司或其實體之出資、贊助、背書或正式授權。'
                    : language === 'zh-CN'
                    ? 'MCARD 系独立运作之非官方粉丝开源工具与卡牌资产管理平台，未受上述任何公司或其实体之出资、赞助、背书或正式授权。'
                    : 'MCARD is an independent community-driven collector telemetry application and is not affiliated with, sponsored, or endorsed by any of the aforementioned entities.'}
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
                    ? '本站所呈現之卡牌市場參考價、歷史價格走勢圖、損益率 (ROI %) 與估值數據，均整合自第三方公開二級市場（如 TCGPlayer、eBay 等）之數據流或數值模型。'
                    : language === 'zh-CN'
                    ? '本站所呈现之卡牌市场参考价、历史价格走势图、损益率 (ROI %) 与估值数据，均整合自第三方公开二级市场（如 TCGPlayer、eBay 等）之数据流或数值模型。'
                    : 'All card market values, historical trends, and P&L/ROI percentages are aggregated from public secondary market feeds (e.g., TCGPlayer, eBay) or algorithmic models.'}
                </p>
                <p>
                  {language === 'zh-TW'
                    ? '所有數據僅供個人收藏記錄、休閒娛樂及研究參考，絕不構成任何證券、期貨、投資推薦或財務稅務建議。卡牌市場價值波動劇烈，任何買賣決策均須由使用者自行審慎評估並承擔全部風險。'
                    : language === 'zh-CN'
                    ? '所有数据仅供个人收藏记录、休闲娱乐及研究参考，绝不构成任何证券、期货、投资推荐或财务税务建议。卡牌市场价值波动剧烈，任何买卖决策均须由使用者自行审慎评估并承担全部风险。'
                    : 'Data is provided for personal tracking and informational purposes only and does not constitute financial, investment, or tax advice. Card market values fluctuate; all transactions are made at your own risk.'}
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
                  ? '市集撮合與交易免責聲明 (Marketplace P2P Disclaimer)'
                  : language === 'zh-CN'
                  ? '市集撮合与交易免责声明 (Marketplace P2P Disclaimer)'
                  : 'P2P Marketplace & Transaction Disclaimer'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? 'MCARD 提供之「市集 (Marketplace)」僅為卡牌愛好者間免費之資訊刊登與社群交流看板，平台本身非交易當事人，亦不提供第三方支付代收代付（Escrow）或商品物流倉儲服務。'
                    : language === 'zh-CN'
                    ? 'MCARD 提供之「市集 (Marketplace)」仅为卡牌爱好者间免费之信息刊登与社区交流看板，平台本身非交易当事人，亦不提供第三方支付代收代付（Escrow）或商品物流仓储服务。'
                    : 'The MCARD Marketplace operates solely as an informational bulletin and matchmaking venue for collectors. MCARD is not a party to any contract, nor does it process payments, hold escrow, or manage fulfillment.'}
                </p>
                <p>
                  {language === 'zh-TW'
                    ? '嚴厲禁止刊登假卡（Proxy / Counterfeit）、未經授權之翻版複製品、贓物或任何具法律爭議之物件。買賣雙方應自行確認卡牌真偽、鑑定盒防偽編號與商品品相。因私下交易、面交、匯款或郵寄衍生之任何詐欺、瑕疵或損失，本平台概不負任何連帶保證或賠償責任。'
                    : language === 'zh-CN'
                    ? '严厉禁止刊登假卡（Proxy / Counterfeit）、未经授权之翻版复制品、赃物或任何具法律争议之物件。买卖双方应自行确认卡牌真伪、鉴定盒防伪编号与商品品相。因私下交易、面交、汇款或邮寄衍生之任何欺诈、瑕疵或损失，本平台概不负任何连带保证或赔偿责任。'
                    : 'Listing counterfeit cards, proxy reproductions, stolen goods, or illegal items is strictly prohibited. Buyers and sellers must independently verify card authenticity and condition. MCARD expressly disclaims all liability for transactions, fraud, or shipment disputes.'}
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  4
                </span>
                {language === 'zh-TW'
                  ? '社群原創內容 (UGC) 與行為守則'
                  : language === 'zh-CN'
                  ? '社区原创内容 (UGC) 与行为守则'
                  : 'User-Generated Content (UGC) & Community Conduct'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '使用者於本站動態牆發布之貼文、留言、圖片與卡牌實拍照片，均由發布者承擔完全之法律責任。嚴禁發布包含誹謗、色情、仇恨言論、洗版惡意廣告或侵害他人智慧財產權之內容。'
                    : language === 'zh-CN'
                    ? '使用者于本站动态墙发布之贴文、留言、图片与卡牌实拍照片，均由发布者承担完全之法律责任。严禁发布包含诽谤、色情、仇恨言论、刷屏恶意广告或侵害他人知识产权之内容。'
                    : 'Users retain responsibility for posts, comments, and photos shared on the community feed. Prohibited content includes defamation, adult material, hate speech, spam, or copyright violations.'}
                </p>
                <p>
                  {language === 'zh-TW'
                    ? '本平台保留隨時依自主判斷審查、隱藏、下架或永久刪除任何違規內容，以及終止惡意濫用者存取權限之權利。若有著作權人認為內容涉及侵權，可備妥證明文件向本站提出下架請求。'
                    : language === 'zh-CN'
                    ? '本平台保留随时依自主判断审查、隐藏、下架或永久删除任何违规内容，以及终止恶意滥用者访问权限之权利。若有著作权人认为内容涉及侵权，可备妥证明文件向本站提出下架请求。'
                    : 'We reserve the right to moderate, hide, or permanently remove violating content and restrict abusive accounts without prior notice. Copyright holders may submit takedown notices with verifying documentation.'}
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  5
                </span>
                {language === 'zh-TW'
                  ? '系統可用性與責任限制'
                  : language === 'zh-CN'
                  ? '系统可用性与责任限制'
                  : 'Fair Use & Limitation of Liability'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '本服務按「現狀 (AS IS)」及「現有 (AS AVAILABLE)」基礎提供，禁止利用高頻自動化爬蟲對伺服器發動阻斷請求。在法律允許之最大範圍內，本平台不對任何伺服器維護中斷、數據遺失或衍生性損害承擔賠償責任。'
                    : language === 'zh-CN'
                    ? '本服务按「现状 (AS IS)」及「现有 (AS AVAILABLE)」基础提供，禁止利用高频自动化爬虫对服务器发动阻断请求。在法律允许之最大范围内，本平台不对任何服务器维护中断、数据遗失或衍生性损害承担赔偿责任。'
                    : 'The service is provided on an "AS IS" and "AS AVAILABLE" basis. Malicious automated scraping or flood requests are prohibited. To the fullest extent permitted by law, MCARD disclaims liability for service interruptions or incidental damages.'}
                </p>
              </div>
            </section>
          </article>
        )}

        {/* ===================== PRIVACY POLICY ===================== */}
        {currentTab === 'privacy' && (
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
                  ? '最後更新日期：2026 年 10 月'
                  : language === 'zh-CN'
                  ? '最后更新日期：2026 年 10 月'
                  : 'Last Updated: October 2026'}
              </p>
            </header>


            {/* Privacy Item 1 */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-foreground text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-ferrari-red/10 text-ferrari-red font-mono text-xs flex items-center justify-center font-bold">
                  1
                </span>
                {language === 'zh-TW'
                  ? '雙層資料儲存架構與透明度'
                  : language === 'zh-CN'
                  ? '双层资料储存架构与透明度'
                  : 'Two-Tier Data Architecture & Storage Transparency'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? 'MCARD 堅持最小化資料收集原則，並採用透明的雙層資料儲存架構：'
                    : language === 'zh-CN'
                    ? 'MCARD 坚持最小化资料收集原则，并采用透明的双层资料储存架构：'
                    : 'MCARD adheres to strict data minimization principles through a transparent two-tier storage model:'}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans text-xs sm:text-sm">
                  <li>
                    <strong>{language === 'zh-TW' ? '私密本地資產 (Private Local Storage)' : language === 'zh-CN' ? '私密本地资产 (Private Local Storage)' : 'Private Local Vault'}:</strong>{' '}
                    {language === 'zh-TW'
                      ? '您的個人卡牌購入成本、持倉數量、自訂備忘錄與願望清單，均預設存於瀏覽器 LocalStorage，保有最高個人隱私。'
                      : language === 'zh-CN'
                      ? '您的个人卡牌购入成本、持仓数量、自订备忘录与愿望清单，均预设存于浏览器 LocalStorage，保有最高个人隐私。'
                      : 'Your personal buy costs, holdings, and vault notes remain in browser LocalStorage for maximum privacy.'}
                  </li>
                  <li>
                    <strong>{language === 'zh-TW' ? '公開社群與市集同步 (Public Edge Sync)' : language === 'zh-CN' ? '公开社区与市集同步 (Public Edge Sync)' : 'Public Edge Sync'}:</strong>{' '}
                    {language === 'zh-TW'
                      ? '當您主動刊登「市集商品」或發布「社群貼文/留言」時，該公開資訊將加密同步至 Cloudflare D1 分散式邊緣資料庫，供全球藏家瀏覽撮合。'
                      : language === 'zh-CN'
                      ? '当您主动刊登「市集商品」或发布「社区贴文/留言」时，该公开信息将加密同步至 Cloudflare D1 分布式边缘数据库，供全球藏家浏览撮合。'
                      : 'When you publish listings or community posts, that public information syncs to Cloudflare D1 distributed edge database for global discovery.'}
                  </li>
                </ul>
                <p>
                  {language === 'zh-TW'
                    ? '我們絕不收集您的身分證字號、真實住址、銀行信用卡帳號等敏感隱私資料。'
                    : language === 'zh-CN'
                    ? '我们绝不收集您的身份证字号、真实住址、银行信用卡账号等敏感隐私资料。'
                    : 'We never collect national ID numbers, home addresses, or credit card payment credentials.'}
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
                  ? '相片上傳與 AI 影像辨識隱私保護'
                  : language === 'zh-CN'
                  ? '相片上传与 AI 影像辨识隐私保护'
                  : 'Image Uploads & AI Vision Privacy'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '當您透過相機拍照識卡 (AI Camera) 或於市集上傳卡片相片時，影像資料僅會傳輸至專屬辨識接口進行卡號、卡名與評級盒子特徵萃取，或作為刊登商品相冊展示。'
                    : language === 'zh-CN'
                    ? '当您通过相机拍照识卡 (AI Camera) 或于市集上传卡片相片时，影像资料仅会传输至专属辨识接口进行卡号、卡名与评级盒子特征萃取，或作为刊登商品相册展示。'
                    : 'When using AI Camera scanning or uploading photos for listings, images are processed solely for card feature extraction or marketplace display.'}
                </p>
                <p>
                  {language === 'zh-TW'
                    ? '我們絕不會將您的實體卡牌拍攝照片出售予第三方行銷仲介，亦不會在未經許可下用於公開的商業基礎模型訓練。'
                    : language === 'zh-CN'
                    ? '我们绝不会将您的实体卡牌拍摄照片出售予第三方营销中介，亦不会在未经许可下用于公开的商业基础模型训练。'
                    : 'Your photos are never sold to marketing brokers nor used without consent for unauthorized commercial foundation model training.'}
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
                  ? 'Cookie 與第三方通訊機制'
                  : language === 'zh-CN'
                  ? 'Cookie 与第三方通讯机制'
                  : 'Cookies & Third-Party Telemetry'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '本網站絕不植入任何跨站廣告追蹤 Cookie、隱私側錄或行銷定向工具。當您點擊外部商戶連結（如 eBay 或 TCGPlayer）時，僅在跳轉瞬間傳遞卡名關鍵字以導向商品搜尋頁面。'
                    : language === 'zh-CN'
                    ? '本网站绝不植入任何跨站广告追踪 Cookie、隐私侧录或营销定向工具。当您点击外部商户链接（如 eBay 或 TCGPlayer）时，仅在跳转瞬间传递卡名关键字以导向商品搜寻页面。'
                    : 'We do not utilize cross-site tracking cookies or marketing profiling pixels. Outbound merchant links (eBay, TCGPlayer) transmit only public card keywords upon navigation.'}
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
                  ? '資料自主權、備份與永久抹除'
                  : language === 'zh-CN'
                  ? '资料自主权、备份与永久抹除'
                  : 'Data Sovereignty, Export & Erasure'}
              </h2>
              <div className="space-y-2 text-text-muted text-sm sm:text-[15px] leading-relaxed pl-8">
                <p>
                  {language === 'zh-TW'
                    ? '您對個人記錄擁有 100% 自主權。您可隨時在「資產看板」匯出 JSON 格式的完整離線備份，亦可隨時在市集中將已刊登商品標記為「已下架」或「已售出」。若欲永久抹除本機儲存，隨時清理瀏覽器快取即可無痕清除所有個人資產資料。'
                    : language === 'zh-CN'
                    ? '您对个人记录拥有 100% 自主权。您可随时在「资产看板」汇出 JSON 格式的完整离线备份，亦可随时在市集中将已刊登商品标记为「已下架」或「已售出」。若欲永久抹除本机储存，随时清理浏览器快取即可无痕清除所有个人资产资料。'
                    : 'You have complete sovereignty over your records. Export your vault anytime as JSON, manage or delist marketplace items, or clear browser cache to permanently purge local records.'}
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
                © 2026 MCARD. All rights reserved.
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
