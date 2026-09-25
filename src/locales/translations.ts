export type Language = 'en' | 'zh-TW' | 'zh-CN';

export type TranslationKey =
  // Navigation & Header
  | 'nav_stream'
  | 'nav_explore'
  | 'nav_market'
  | 'nav_sets'
  | 'nav_showcase'
  | 'nav_portfolio'
  | 'nav_total_portfolio_value'
  | 'nav_select_language'
  | 'nav_account'

  // Auth & User Profile
  | 'auth_login'
  | 'auth_logout'
  | 'auth_guest'
  | 'auth_online_synced'
  | 'auth_modal_title'
  | 'auth_modal_subtitle'
  | 'auth_continue_google'
  | 'auth_sign_in_email'
  | 'auth_sign_up_email'
  | 'auth_email_label'
  | 'auth_password_label'
  | 'auth_name_label'
  | 'auth_or_divider'
  | 'auth_cloud_sync_desc'
  | 'auth_close'

  // CardGrid Search & Filters
  | 'search_label'
  | 'search_placeholder'
  | 'sort_by_label'
  | 'sort_default'
  | 'sort_price_desc'
  | 'sort_price_asc'
  | 'sort_name_asc'
  | 'sort_number_asc'
  | 'filter_price_range'
  | 'filter_all_prices'
  | 'filter_under_25'
  | 'filter_25_100'
  | 'filter_100_300'
  | 'filter_300_plus'
  | 'filter_expansion_set'
  | 'filter_elemental_type'
  | 'showing_cards'
  | 'fetching_live_data'
  | 'no_cards_found'
  | 'try_resetting_filters'
  | 'est_market_price'
  | 'add_to_portfolio'
  | 'load_more_cards'

  // Card Detail View
  | 'back_to_explore'
  | 'card_artist'
  | 'view_on_tcgplayer'
  | 'view_on_ebay'
  | 'find_on_ebay'
  | 'tcgplayer_lowest_price'
  | 'affiliate_disclosure_footer'
  | 'affiliate_badge'
  | 'select_condition'
  | 'price_history_title'
  | 'price_change_3m'
  | 'high_low_range'
  | 'time_range_1m'
  | 'time_range_3m'
  | 'time_range_6m'
  | 'time_range_1y'

  // Expansion Sets View
  | 'sets_page_title'
  | 'sets_active_count'
  | 'sets_release_date'
  | 'sets_series'
  | 'sets_total_cards'
  | 'sets_collected_progress'
  | 'sets_loading'

  // Portfolio Dashboard
  | 'portfolio_title'
  | 'portfolio_total_value'
  | 'portfolio_buy_in_cost'
  | 'portfolio_total_pnl'
  | 'portfolio_total_roi'
  | 'export_json'
  | 'import_json'
  | 'add_custom_card'
  | 'empty_portfolio_title'
  | 'empty_portfolio_subtitle'
  | 'card_name_th'
  | 'condition_th'
  | 'quantity_th'
  | 'buy_cost_th'
  | 'market_price_th'
  | 'current_value_th'
  | 'pnl_th'
  | 'actions_th'
  | 'delete_action'
  | 'add_card_modal_title'
  | 'card_name_label'
  | 'purchase_price_label'
  | 'quantity_label'
  | 'image_url_label'
  | 'cancel'
  | 'confirm_add'
  // Multi-Category Keys
  | 'cat_all'
  | 'cat_pokemon'
  | 'cat_yugioh'
  | 'cat_onepiece'
  | 'cat_dragonball'
  | 'cat_nba'
  | 'cat_fifa'
  | 'cat_breakdown_title'
  | 'player_or_artist'
  | 'release_year'

  // Marketplace & P2P Trading
  | 'marketplace_title'
  | 'marketplace_subtitle'
  | 'marketplace_p2p_badge'
  | 'marketplace_list_card_btn'
  | 'marketplace_tab_all'
  | 'marketplace_tab_my'
  | 'marketplace_tab_sold'
  | 'marketplace_search_placeholder'
  | 'marketplace_discount_only'
  | 'marketplace_all_conditions'
  | 'marketplace_all_categories'
  | 'marketplace_seller_active_title'
  | 'marketplace_seller_active_val'
  | 'marketplace_seller_sold_title'
  | 'marketplace_seller_sold_val'
  | 'marketplace_seller_add_hint'
  | 'marketplace_asking_price'
  | 'marketplace_official_ref'
  | 'marketplace_deal_sold_badge'
  | 'marketplace_deal_completed'
  | 'marketplace_realized_price'
  | 'marketplace_my_listing_tag'
  | 'marketplace_edit_price'
  | 'marketplace_mark_sold'
  | 'marketplace_delist'
  | 'marketplace_empty_all'
  | 'marketplace_empty_all_desc'
  | 'marketplace_empty_my'
  | 'marketplace_empty_my_desc'
  | 'marketplace_empty_sold'
  | 'marketplace_below_pct'
  | 'marketplace_delist_confirm'
  | 'marketplace_contact_seller'
  | 'marketplace_seller_info'
  | 'marketplace_copied_toast'
  | 'modal_close'
  | 'modal_asking_price'
  | 'modal_official_ref'
  | 'modal_below_market'
  | 'modal_premium'
  | 'modal_photo_hint'
  | 'modal_seller_rating'
  | 'modal_seller_sales'
  | 'modal_posted_at'
  | 'modal_trade_location'
  | 'modal_condition_notes'
  | 'modal_copy_contact'
  | 'modal_copied'
  | 'modal_safety_tip'
  | 'create_modal_title'
  | 'create_modal_err_name'
  | 'create_modal_err_price'
  | 'create_modal_err_contact'
  | 'create_modal_import_label'
  | 'create_modal_import_placeholder'
  | 'create_modal_card_name'
  | 'create_modal_card_name_ph'
  | 'create_modal_category'
  | 'create_modal_ref_price'
  | 'create_modal_asking_price'
  | 'create_modal_asking_price_ph'
  | 'create_modal_comparison'
  | 'create_modal_below_market'
  | 'create_modal_equal_market'
  | 'create_modal_above_market'
  | 'create_modal_condition_label'
  | 'create_modal_series_label'
  | 'create_modal_series_ph'
  | 'create_modal_photo_label'
  | 'create_modal_photo_change'
  | 'create_modal_photo_upload'
  | 'create_modal_contact_label'
  | 'create_modal_contact_ph'
  | 'create_modal_location_label'
  | 'create_modal_location_ph'
  | 'create_modal_notes_label'
  | 'create_modal_notes_ph'
  | 'create_modal_submit'
  | 'create_modal_default_notes'
  | 'create_modal_default_location'
  | 'create_modal_cond_psa10'
  | 'create_modal_cond_psa9'
  | 'create_modal_cond_bgs95'
  | 'create_modal_cond_cgc10'
  | 'create_modal_cond_raw_nm'
  | 'create_modal_cond_played';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    // Navigation & Header
    nav_stream: 'Live',
    nav_explore: 'Explore',
    nav_market: 'Market',
    nav_sets: 'Sets',
    nav_showcase: 'Showcase',
    nav_portfolio: 'Portfolio',
    nav_total_portfolio_value: 'Total Portfolio Value',
    nav_select_language: 'Language',
    nav_account: 'Account',

    // Auth & User Profile
    auth_login: 'Log In',
    auth_logout: 'Log Out',
    auth_guest: 'Guest',
    auth_online_synced: 'Online (Synced)',
    auth_modal_title: 'Welcome to Collector Portal',
    auth_modal_subtitle: 'Log in to sync your portfolio & track market ROI across devices.',
    auth_continue_google: 'Continue with Google',
    auth_sign_in_email: 'Sign in with Email',
    auth_sign_up_email: 'Create an Account',
    auth_email_label: 'Email Address',
    auth_password_label: 'Password',
    auth_name_label: 'Display Name',
    auth_or_divider: 'Or sign in with email',
    auth_cloud_sync_desc: 'Your local portfolio will automatically merge & sync to your account upon log in.',
    auth_close: 'Close',

    // CardGrid Search & Filters
    search_label: 'Search Pokémon Database (Real-Time API)',
    search_placeholder: 'Search by name (e.g. Charizard, Pikachu, Mew)...',
    sort_by_label: 'Sort By',
    sort_default: 'Default Sort',
    sort_price_desc: 'Price: High to Low ▼',
    sort_price_asc: 'Price: Low to High ▲',
    sort_name_asc: 'Card Name: A to Z',
    sort_number_asc: 'Card Number',
    filter_price_range: 'Filter by Price Range',
    filter_all_prices: 'All Prices',
    filter_under_25: 'Under $25',
    filter_25_100: '$25 - $100',
    filter_100_300: '$100 - $300',
    filter_300_plus: '$300+',
    filter_expansion_set: 'Filter by Expansion Set',
    filter_elemental_type: 'Filter by Elemental Type',
    showing_cards: 'Showing {count} of {total} cards (sorted & filtered)',
    fetching_live_data: 'Fetching live data...',
    no_cards_found: 'No cards found matching search & filters',
    try_resetting_filters: 'Try resetting your price range or sort option',
    est_market_price: 'Est. Market Price',
    add_to_portfolio: '+ Portfolio',
    load_more_cards: 'Load More Cards ({count} / {total})',

    // Card Detail View
    back_to_explore: '← Back to Explore',
    card_artist: 'Card Artist',
    view_on_tcgplayer: 'TCGPlayer Lowest',
    view_on_ebay: 'View on eBay',
    find_on_ebay: 'eBay Stock',
    tcgplayer_lowest_price: 'TCGPlayer Lowest',
    affiliate_disclosure_footer: 'Affiliate Disclosure: When you click links on this site to our partner merchants (such as eBay or TCGPlayer) and make a purchase, this site may earn an affiliate commission. This does not affect your purchase price.',
    affiliate_badge: 'Verified Partner Merchant',
    select_condition: 'Select Condition & Grading',
    price_history_title: '{condition} Price History',
    price_change_3m: 'Price Change',
    high_low_range: 'High / Low Range',
    time_range_1m: '1M',
    time_range_3m: '3M',
    time_range_6m: '6M',
    time_range_1y: '1Y',

    // Expansion Sets View
    sets_page_title: 'Pokémon Expansion Sets',
    sets_active_count: '{count} live sets in database',
    sets_release_date: 'Released',
    sets_series: 'Series',
    sets_total_cards: 'Total Cards',
    sets_collected_progress: 'Collection Progress',
    sets_loading: 'Fetching expansion sets...',

    // Portfolio Dashboard
    portfolio_title: 'Portfolio Asset Dashboard',
    portfolio_total_value: 'Total Portfolio Market Value',
    portfolio_buy_in_cost: 'Total Buy-in Cost',
    portfolio_total_pnl: 'Total Unrealized P&L',
    portfolio_total_roi: 'Total ROI (%)',
    export_json: 'Export JSON',
    import_json: 'Import Backup',
    add_custom_card: '+ Add Card',
    empty_portfolio_title: 'Your portfolio is empty',
    empty_portfolio_subtitle: 'Explore cards or add cards manually to track investment ROI',
    card_name_th: 'Card Name',
    condition_th: 'Condition / Grade',
    quantity_th: 'Qty',
    buy_cost_th: 'Buy Cost',
    market_price_th: 'Market Price',
    current_value_th: 'Current Value',
    pnl_th: 'Unrealized P&L',
    actions_th: 'Actions',
    delete_action: 'Remove',
    add_card_modal_title: 'Add Card to Portfolio',
    card_name_label: 'Card Name',
    purchase_price_label: 'Buy-in Price ($)',
    quantity_label: 'Quantity',
    image_url_label: 'Card Image URL (Optional)',
    cancel: 'Cancel',
    confirm_add: 'Add to Portfolio',
    cat_all: 'All',
    cat_pokemon: 'Pokémon',
    cat_yugioh: 'Yu-Gi-Oh!',
    cat_onepiece: 'One Piece',
    cat_dragonball: 'Dragon Ball',
    cat_nba: 'NBA Cards',
    cat_fifa: 'FIFA Football',
    cat_breakdown_title: 'Asset Allocation by Category',
    player_or_artist: 'Player / Artist',
    release_year: 'Release Year',

    // Marketplace & P2P Trading
    marketplace_title: 'P2P Physical Card Marketplace',
    marketplace_subtitle: '0% Commission, Direct P2P Trading! Buy or sell authentic cards directly with verified collectors with live price benchmarks.',
    marketplace_p2p_badge: 'P2P Verified Collector Market',
    marketplace_list_card_btn: '+ List My Card',
    marketplace_tab_all: 'All Market',
    marketplace_tab_my: 'My Listings',
    marketplace_tab_sold: 'Sold Archive',
    marketplace_search_placeholder: 'Search cards, sellers, or sets...',
    marketplace_discount_only: 'Below Market Deals Only',
    marketplace_all_conditions: 'All Conditions',
    marketplace_all_categories: 'All Categories',
    marketplace_seller_active_title: 'Active Listings',
    marketplace_seller_active_val: 'Total Listed Value',
    marketplace_seller_sold_title: 'Completed Deals',
    marketplace_seller_sold_val: 'Total Realized Revenue',
    marketplace_seller_add_hint: 'Import from portfolio or list directly',
    marketplace_asking_price: 'Asking Price',
    marketplace_official_ref: 'Official Benchmark',
    marketplace_deal_sold_badge: 'Sold',
    marketplace_deal_completed: 'Deal Completed',
    marketplace_realized_price: 'Realized',
    marketplace_my_listing_tag: 'My Listing',
    marketplace_edit_price: 'Edit Price',
    marketplace_mark_sold: 'Mark Sold',
    marketplace_delist: 'Delist',
    marketplace_empty_all: 'No active listings found',
    marketplace_empty_all_desc: 'Try resetting your search query or switching categories.',
    marketplace_empty_my: 'You have not listed any cards yet',
    marketplace_empty_my_desc: 'Click "+ List My Card" above to showcase your physical collection!',
    marketplace_empty_sold: 'No sold archives found',
    marketplace_below_pct: '{pct}% Below Market',
    marketplace_delist_confirm: 'Are you sure you want to delist "{name}" from the marketplace?',
    marketplace_contact_seller: 'Contact Seller',
    marketplace_seller_info: 'Seller Information',
    marketplace_copied_toast: 'Contact info copied to clipboard!',
    modal_close: 'Close',
    modal_asking_price: 'Asking Price',
    modal_official_ref: 'Official Market Price:',
    modal_below_market: 'Cheaper than market by {pct}% (Save ${save})',
    modal_premium: 'Grade Premium +{pct}%',
    modal_photo_hint: 'Actual photo by seller, condition as shown.',
    modal_seller_rating: 'Rating {rating}',
    modal_seller_sales: '{count} sales',
    modal_posted_at: 'Posted {time}',
    modal_trade_location: 'Location:',
    modal_condition_notes: 'Seller Condition Notes:',
    modal_copy_contact: 'Copy Seller {platform}: {val}',
    modal_copied: 'Copied!',
    modal_safety_tip: 'Free P2P info matching. Meet in safe public places for high-value cards.',

    // Create Listing Modal
    create_modal_title: 'List Card for Sale',
    create_modal_err_name: 'Please enter card name!',
    create_modal_err_price: 'Please enter a valid asking price!',
    create_modal_err_contact: 'Please enter contact information (e.g., LINE ID or phone) so buyers can reach you!',
    create_modal_import_label: 'Quick import from Portfolio',
    create_modal_import_placeholder: '-- Select from existing holdings --',
    create_modal_card_name: 'Card Name *',
    create_modal_card_name_ph: 'e.g. Charizard ex SAR #199',
    create_modal_category: 'Card Category',
    create_modal_ref_price: 'Official Benchmark ($)',
    create_modal_asking_price: 'Your Asking Price ($) *',
    create_modal_asking_price_ph: 'Asking price',
    create_modal_comparison: 'Market comparison:',
    create_modal_below_market: 'Below official market by {pct}% (Save ${save})',
    create_modal_equal_market: 'Equal to official market price',
    create_modal_above_market: 'Above official benchmark +{pct}%',
    create_modal_condition_label: 'Condition / Grading Tag',
    create_modal_series_label: 'Expansion / Set',
    create_modal_series_ph: 'e.g. 151 / Evolving Skies',
    create_modal_photo_label: 'Physical Card Photo (Camera or Album)',
    create_modal_photo_change: 'Change Photo',
    create_modal_photo_upload: 'Take Photo or Upload Image',
    create_modal_contact_label: 'Buyer Contact Method *',
    create_modal_contact_ph: 'Enter your ID or account handle',
    create_modal_location_label: 'Trade Location / Shipping',
    create_modal_location_ph: 'e.g. Meetup in NYC / Tracked shipping',
    create_modal_notes_label: 'Condition Description & Notes',
    create_modal_notes_ph: 'Describe condition details (e.g., clean edges, magnetic case, smoke-free storage) to build buyer trust!',
    create_modal_submit: 'Publish to Marketplace',
    create_modal_default_notes: 'Authentic physical card collection. Feel free to contact for condition details.',
    create_modal_default_location: 'Meetup available / Tracked shipping',
    create_modal_cond_psa10: 'PSA 10 (Gem Mint)',
    create_modal_cond_psa9: 'PSA 9 (Mint)',
    create_modal_cond_bgs95: 'BGS 9.5 (Gold Label)',
    create_modal_cond_cgc10: 'CGC 10 (Pristine)',
    create_modal_cond_raw_nm: 'Ungraded Near Mint',
    create_modal_cond_played: 'Played / Moderately Played',
  },
  'zh-TW': {
    // Navigation & Header
    nav_stream: '即時',
    nav_explore: '探索',
    nav_market: '市場',
    nav_sets: '擴充包',
    nav_showcase: '3D展覽館',
    nav_portfolio: '資產',
    nav_total_portfolio_value: '收藏總資產估值',
    nav_select_language: '選擇語言',
    nav_account: '帳戶',

    // Auth & User Profile
    auth_login: '會員登入',
    auth_logout: '登出帳號',
    auth_guest: '訪客模式',
    auth_online_synced: '在線 (已同步)',
    auth_modal_title: '歡迎使用 寶可夢卡牌 Collector 平台',
    auth_modal_subtitle: '登入以跨裝置同步您的資產組合與市場 ROI 投資績效。',
    auth_continue_google: '使用 Google 帳號一鍵登入',
    auth_sign_in_email: '使用 Email / 密碼登入',
    auth_sign_up_email: '註冊新帳號',
    auth_email_label: '電子郵件地址',
    auth_password_label: '密碼',
    auth_name_label: '顯示名稱',
    auth_or_divider: '或使用 EMAIL 登入',
    auth_cloud_sync_desc: '登入後，您在訪客模式下建立的卡牌資料將自動合併並同步備份至雲端。',
    auth_close: '關閉',

    // CardGrid Search & Filters
    search_label: '搜尋寶可夢資料庫 (即時 API)',
    search_placeholder: '輸入卡牌名稱搜尋 (如 噴火龍、皮卡丘、超夢)...',
    sort_by_label: '排序方式',
    sort_default: '預設排序',
    sort_price_desc: '價格：由高到低 ▼',
    sort_price_asc: '價格：由低到高 ▲',
    sort_name_asc: '卡牌名稱：A 到 Z',
    sort_number_asc: '卡牌編號排序',
    filter_price_range: '價格區間篩選',
    filter_all_prices: '全部價格',
    filter_under_25: '$25 以下 (平價)',
    filter_25_100: '$25 - $100 (中階)',
    filter_100_300: '$100 - $300 (高價)',
    filter_300_plus: '$300+ (頂級罕見)',
    filter_expansion_set: '按卡牌擴充包篩選',
    filter_elemental_type: '按元素屬性篩選',
    showing_cards: '顯示 {count} / {total} 張卡牌 (已排序與篩選)',
    fetching_live_data: '即時資料載入中...',
    no_cards_found: '未找到符合搜尋條件與篩選的卡牌',
    try_resetting_filters: '請嘗試重置價格區間或排序選項',
    est_market_price: '估算市場價格',
    add_to_portfolio: '+ 加入資產庫',
    load_more_cards: '載入更多卡牌 ({count} / {total})',

    // Card Detail View
    back_to_explore: '← 返回圖鑑頁面',
    card_artist: '繪師資訊',
    view_on_tcgplayer: '在 TCGPlayer 查看最低價 ↗',
    view_on_ebay: '在 eBay 查看現貨 ↗',
    find_on_ebay: 'eBay 現貨',
    tcgplayer_lowest_price: 'TCGPlayer 最低價',
    affiliate_disclosure_footer: '聯盟行銷聲明：當您點擊本站導向合作夥伴商戶（如 eBay 或 TCGPlayer）的推廣連結並完成購買時，本站可能會獲得微量佣金報酬。這不會增加您的購買費用，感謝您支持本站持續營運。',
    affiliate_badge: '官方認證導購合作夥伴',
    select_condition: '選擇卡牌品相與鑑定等級',
    price_history_title: '{condition} 歷史價格走勢圖',
    price_change_3m: '價格變動',
    high_low_range: '最高 / 最低區間',
    time_range_1m: '1個月',
    time_range_3m: '3個月',
    time_range_6m: '6個月',
    time_range_1y: '1年',

    // Expansion Sets View
    sets_page_title: '寶可夢卡牌擴充包圖鑑',
    sets_active_count: '資料庫包含 {count} 個熱門擴充包',
    sets_release_date: '發行年份',
    sets_series: '卡包系列',
    sets_total_cards: '總發行卡牌數',
    sets_collected_progress: '圖鑑收集完成度',
    sets_loading: '即時載入擴充包圖鑑中...',

    // Portfolio Dashboard
    portfolio_title: '個人收藏資產管理儀表板',
    portfolio_total_value: '收藏庫總市場估值',
    portfolio_buy_in_cost: '累計購入成本',
    portfolio_total_pnl: '未實現總損益 (P&L)',
    portfolio_total_roi: '總投資報酬率 (ROI)',
    export_json: '匯出 JSON 備份',
    import_json: '匯入備份檔案',
    add_custom_card: '+ 手動新增卡牌',
    empty_portfolio_title: '您的資產組合目前是空的',
    empty_portfolio_subtitle: '請前往圖鑑探索卡牌或手動新增以開始追蹤投資損益',
    card_name_th: '卡牌名稱',
    condition_th: '品相 / 鑑定等級',
    quantity_th: '數量',
    buy_cost_th: '購入單價',
    market_price_th: '市場單價',
    current_value_th: '持倉總值',
    pnl_th: '未實現損益',
    actions_th: '操作',
    delete_action: '移除',
    add_card_modal_title: '新增卡牌至資產組合',
    card_name_label: '卡牌名稱',
    purchase_price_label: '購入成本 ($)',
    quantity_label: '持有數量',
    image_url_label: '卡牌圖片網址 (選填)',
    cancel: '取消',
    confirm_add: '確認加入資產庫',
    cat_all: '全部',
    cat_pokemon: '寶可夢',
    cat_yugioh: '遊戲王',
    cat_onepiece: '海賊王',
    cat_dragonball: '七龍珠',
    cat_nba: 'NBA 球星卡',
    cat_fifa: 'FIFA 足球卡',
    cat_breakdown_title: '跨品類資產配置分佈',
    player_or_artist: '球星 / 繪師',
    release_year: '發行年份',

    // Marketplace & P2P Trading
    marketplace_title: '實體卡自由交易市場',
    marketplace_subtitle: '免抽成、零手續費！直接向真實卡友購買或出售正版實體卡，即時比對官方行情，透明安心。',
    marketplace_p2p_badge: 'P2P 玩家認證市場',
    marketplace_list_card_btn: '+ 上架我的實體卡',
    marketplace_tab_all: '全部市場',
    marketplace_tab_my: '我的刊登管理',
    marketplace_tab_sold: '歷史成交紀錄',
    marketplace_search_placeholder: '搜尋市場卡牌、賣家或系列...',
    marketplace_discount_only: '僅看低於市價破盤卡',
    marketplace_all_conditions: '全部卡況',
    marketplace_all_categories: '全部分類',
    marketplace_seller_active_title: '在庫刊登中卡牌',
    marketplace_seller_active_val: '總掛牌估值',
    marketplace_seller_sold_title: '已成功結案售出',
    marketplace_seller_sold_val: '累計成交實收',
    marketplace_seller_add_hint: '直接從資產庫匯入或拍照刊登',
    marketplace_asking_price: '賣家報價',
    marketplace_official_ref: '官方行情參考價',
    marketplace_deal_sold_badge: '已成交',
    marketplace_deal_completed: '已完成交易手續',
    marketplace_realized_price: '實收',
    marketplace_my_listing_tag: '我的刊登',
    marketplace_edit_price: '改價',
    marketplace_mark_sold: '標記售出',
    marketplace_delist: '下架',
    marketplace_empty_all: '目前沒有符合條件的卡牌商品',
    marketplace_empty_all_desc: '可嘗試重設篩選條件或切換不同分類。',
    marketplace_empty_my: '您目前尚未在市場刊登任何卡牌',
    marketplace_empty_my_desc: '點擊上方「上架我的實體卡」，開始向全球卡友展示您的實體收藏！',
    marketplace_empty_sold: '目前尚無已完成的成交歷史',
    marketplace_below_pct: '低於市價 {pct}%',
    marketplace_delist_confirm: '確定要將「{name}」從市場下架嗎？',
    marketplace_contact_seller: '聯絡賣家',
    marketplace_seller_info: '賣家詳細資訊',
    marketplace_copied_toast: '聯絡方式已複製到剪貼簿！',
    modal_close: '關閉',
    modal_asking_price: '賣家期望售價',
    modal_official_ref: '官方市場參考價：',
    modal_below_market: '比官方行情便宜 {pct}% (省下 ${save})',
    modal_premium: '評級溢價 +{pct}%',
    modal_photo_hint: '賣家手機實體拍攝，品相以此圖為準',
    modal_seller_rating: '評價 {rating}',
    modal_seller_sales: '已售 {count} 筆',
    modal_posted_at: '發布於 {time}',
    modal_trade_location: '交易地區：',
    modal_condition_notes: '賣家卡況說明：',
    modal_copy_contact: '複製賣家 {platform}: {val}',
    modal_copied: '已複製！',
    modal_safety_tip: '平台提供免費資訊撮合，建議高價卡選擇公開場所面交驗卡。',

    // Create Listing Modal
    create_modal_title: '上架我的實體卡',
    create_modal_err_name: '請填寫卡牌名稱！',
    create_modal_err_price: '請輸入有效的出售售價！',
    create_modal_err_contact: '請填寫聯絡方式（如 LINE ID 或電話），以便買家聯繫！',
    create_modal_import_label: '從我的資產庫 (Portfolio) 一鍵快速匯入',
    create_modal_import_placeholder: '-- 點擊選擇現有持倉卡牌 --',
    create_modal_card_name: '卡牌名稱 *',
    create_modal_card_name_ph: '例如：噴火龍 ex SAR #199',
    create_modal_category: '卡牌分類',
    create_modal_ref_price: '官方市場參考價 ($)',
    create_modal_asking_price: '您的期望售價 ($) *',
    create_modal_asking_price_ph: '期望開價',
    create_modal_comparison: '行情比對：',
    create_modal_below_market: '低於官方市價 {pct}% (省下 ${save})',
    create_modal_equal_market: '符合官方行情價',
    create_modal_above_market: '高於官方參考價 +{pct}%',
    create_modal_condition_label: '卡況評級標籤',
    create_modal_series_label: '所屬系列',
    create_modal_series_ph: '例如：151 / 蒼空烈流',
    create_modal_photo_label: '實體卡照片 (支援手機相機拍照或相簿)',
    create_modal_photo_change: '更換實拍照',
    create_modal_photo_upload: '拍照或上傳實體圖',
    create_modal_contact_label: '買家聯繫方式 *',
    create_modal_contact_ph: '請輸入您的 ID 或帳號',
    create_modal_location_label: '交易地區 / 寄送方式',
    create_modal_location_ph: '例如：雙北可面交 / 7-11店到店',
    create_modal_notes_label: '卡況描述與交易說明',
    create_modal_notes_ph: '說明卡牌現況（例如：四角無白邊、附磁吸卡夾、防潮箱存放），提高買家信任！',
    create_modal_submit: '確認發布到市場',
    create_modal_default_notes: '正版實體卡收藏，歡迎私訊洽談或確認卡況細節。',
    create_modal_default_location: '雙北可面交 / 7-11店到店',
    create_modal_cond_psa10: 'PSA 10 (滿分神卡)',
    create_modal_cond_psa9: 'PSA 9 (Mint 完美)',
    create_modal_cond_bgs95: 'BGS 9.5 (金標)',
    create_modal_cond_cgc10: 'CGC 10 (Pristine)',
    create_modal_cond_raw_nm: '未評級 NM (無傷裸卡)',
    create_modal_cond_played: '微瑕 / 下場卡 (Played)',
  },
  'zh-CN': {
    // Navigation & Header
    nav_stream: '即时',
    nav_explore: '探索',
    nav_market: '市场',
    nav_sets: '扩展包',
    nav_showcase: '3D展览馆',
    nav_portfolio: '资产',
    nav_total_portfolio_value: '收藏总资产估值',
    nav_select_language: '选择语言',
    nav_account: '账户',

    // Auth & User Profile
    auth_login: '会员登录',
    auth_logout: '退出登录',
    auth_guest: '访客模式',
    auth_online_synced: '在线 (已同步)',
    auth_modal_title: '欢迎使用 宝可梦卡牌 Collector 平台',
    auth_modal_subtitle: '登录以跨设备同步您的资产组合与市场 ROI 投资绩效。',
    auth_continue_google: '使用 Google 账号一键登录',
    auth_sign_in_email: '使用 Email / 密码登录',
    auth_sign_up_email: '注册新账号',
    auth_email_label: '电子邮件地址',
    auth_password_label: '密码',
    auth_name_label: '显示名称',
    auth_or_divider: '或使用 EMAIL 登录',
    auth_cloud_sync_desc: '登录后，您在访客模式下建立的卡牌数据将自动合并并同步备份至云端。',
    auth_close: '关闭',

    // CardGrid Search & Filters
    search_label: '搜索宝可梦数据库 (实时 API)',
    search_placeholder: '输入卡牌名称搜索 (如 喷火龙、皮卡丘、超梦)...',
    sort_by_label: '排序方式',
    sort_default: '默认排序',
    sort_price_desc: '价格：由高到低 ▼',
    sort_price_asc: '价格：由低到高 ▲',
    sort_name_asc: '卡牌名称：A 到 Z',
    sort_number_asc: '卡牌编号排序',
    filter_price_range: '价格区间筛选',
    filter_all_prices: '全部价格',
    filter_under_25: '$25 以下 (平价)',
    filter_25_100: '$25 - $100 (中阶)',
    filter_100_300: '$100 - $300 (高价)',
    filter_300_plus: '$300+ (顶级罕见)',
    filter_expansion_set: '按卡牌扩展包筛选',
    filter_elemental_type: '按元素属性筛选',
    showing_cards: '显示 {count} / {total} 张卡牌 (已排序与筛选)',
    fetching_live_data: '实时数据加载中...',
    no_cards_found: '未找到符合搜索条件与筛选的卡牌',
    try_resetting_filters: '请尝试重置价格区间或排序选项',
    est_market_price: '估算市场价格',
    add_to_portfolio: '+ 加入资产库',
    load_more_cards: '加载更多卡牌 ({count} / {total})',

    // Card Detail View
    back_to_explore: '← 返回图鉴页面',
    card_artist: '画师信息',
    view_on_tcgplayer: '在 TCGPlayer 查看最低价 ↗',
    view_on_ebay: '在 eBay 查看现货 ↗',
    find_on_ebay: 'eBay 现货',
    tcgplayer_lowest_price: 'TCGPlayer 最低价',
    affiliate_disclosure_footer: '联盟营销声明：当您点击本站导向合作伙伴商户（如 eBay 或 TCGPlayer）的推广链接并完成购买时，本站可能会获得微量佣金报酬。这不会增加您的购买费用，感谢您支持本站持续营运。',
    affiliate_badge: '官方认证导购合作伙伴',
    select_condition: '选择卡牌品相与鉴定等级',
    price_history_title: '{condition} 历史价格走势图',
    price_change_3m: '价格变动',
    high_low_range: '最高 / 最低区间',
    time_range_1m: '1个月',
    time_range_3m: '3个月',
    time_range_6m: '6个月',
    time_range_1y: '1年',

    // Expansion Sets View
    sets_page_title: '宝可梦卡牌扩展包图鉴',
    sets_active_count: '数据库包含 {count} 个热门扩展包',
    sets_release_date: '发行年份',
    sets_series: '卡包系列',
    sets_total_cards: '总发行卡牌数',
    sets_collected_progress: '图鉴收集完成度',
    sets_loading: '实时加载扩展包图鉴中...',

    // Portfolio Dashboard
    portfolio_title: '个人收藏资产管理仪表板',
    portfolio_total_value: '收藏库总市场估值',
    portfolio_buy_in_cost: '累计购入成本',
    portfolio_total_pnl: '未实现总损益 (P&L)',
    portfolio_total_roi: '总投资回报率 (ROI)',
    export_json: '导出 JSON 备份',
    import_json: '导入备份文件',
    add_custom_card: '+ 手动新增卡牌',
    empty_portfolio_title: '您的资产组合目前是空的',
    empty_portfolio_subtitle: '请前往图鉴探索卡牌或手动新增以开始追踪投资损益',
    card_name_th: '卡牌名称',
    condition_th: '品相 / 鉴定等级',
    quantity_th: '数量',
    buy_cost_th: '购入单价',
    market_price_th: '市场单价',
    current_value_th: '持仓总值',
    pnl_th: '未实现损益',
    actions_th: '操作',
    delete_action: '移除',
    add_card_modal_title: '新增卡牌至资产组合',
    card_name_label: '卡牌名称',
    purchase_price_label: '购入成本 ($)',
    quantity_label: '持有数量',
    image_url_label: '卡牌图片网址 (选填)',
    cancel: '取消',
    confirm_add: '确认加入资产库',
    cat_all: '全部',
    cat_pokemon: '宝可梦',
    cat_yugioh: '游戏王',
    cat_onepiece: '航海王',
    cat_dragonball: '七龙珠',
    cat_nba: 'NBA 球星卡',
    cat_fifa: 'FIFA 足球卡',
    cat_breakdown_title: '跨品类资产配置分布',
    player_or_artist: '球星 / 画师',
    release_year: '发行年份',

    // Marketplace & P2P Trading
    marketplace_title: '实体卡自由交易市场',
    marketplace_subtitle: '免抽成、零手续费！直接向真实卡友购买或出售正版实体卡，实时比对官方行情，透明安心。',
    marketplace_p2p_badge: 'P2P 玩家认证市场',
    marketplace_list_card_btn: '+ 上架我的实体卡',
    marketplace_tab_all: '全部市场',
    marketplace_tab_my: '我的刊登管理',
    marketplace_tab_sold: '历史成交记录',
    marketplace_search_placeholder: '搜索市场卡牌、卖家或系列...',
    marketplace_discount_only: '仅看低于市价破盘卡',
    marketplace_all_conditions: '全部卡况',
    marketplace_all_categories: '全部分类',
    marketplace_seller_active_title: '在库刊登中卡牌',
    marketplace_seller_active_val: '总挂牌估值',
    marketplace_seller_sold_title: '已成功结案售出',
    marketplace_seller_sold_val: '累计成交实收',
    marketplace_seller_add_hint: '直接从资产库导入或拍照刊登',
    marketplace_asking_price: '卖家报价',
    marketplace_official_ref: '官方行情参考价',
    marketplace_deal_sold_badge: '已成交',
    marketplace_deal_completed: '已完成交易手续',
    marketplace_realized_price: '实收',
    marketplace_my_listing_tag: '我的刊登',
    marketplace_edit_price: '改价',
    marketplace_mark_sold: '标记售出',
    marketplace_delist: '下架',
    marketplace_empty_all: '目前没有符合条件的卡牌商品',
    marketplace_empty_all_desc: '可尝试重设筛选条件或切换不同分类。',
    marketplace_empty_my: '您目前尚未在市场刊登任何卡牌',
    marketplace_empty_my_desc: '点击上方“上架我的实体卡”，开始向全球卡友展示您的实体收藏！',
    marketplace_empty_sold: '目前尚无已完成的成交历史',
    marketplace_below_pct: '低于市价 {pct}%',
    marketplace_delist_confirm: '确定要将“{name}”从市场下架吗？',
    marketplace_contact_seller: '联系卖家',
    marketplace_seller_info: '卖家详细信息',
    marketplace_copied_toast: '联系方式已复制到剪贴板！',

    // Listing Detail & Action Modal
    modal_close: '关闭',
    modal_asking_price: '卖家挂牌售价',
    modal_official_ref: '官方行情参考价',
    modal_below_market: '比官方行情便宜 {pct}% (省下 ${save})',
    modal_premium: '评级溢价 +{pct}%',
    modal_photo_hint: '卖家手机实物拍摄，品相以此图为准',
    modal_seller_rating: '评价 {rating}',
    modal_seller_sales: '已售 {count} 笔',
    modal_posted_at: '发布于 {time}',
    modal_trade_location: '交易地区：',
    modal_condition_notes: '卖家卡况说明：',
    modal_copy_contact: '复制卖家 {platform}: {val}',
    modal_copied: '已复制！',
    modal_safety_tip: '平台提供免费信息撮合，建议高价卡选择公开场所面交验卡。',

    // Create Listing Modal
    create_modal_title: '上架我的实体卡',
    create_modal_err_name: '请填写卡牌名称！',
    create_modal_err_price: '请输入有效的出售售价！',
    create_modal_err_contact: '请填写联系方式（如微信、LINE ID 或电话），以便买家联系！',
    create_modal_import_label: '从我的资产库 (Portfolio) 一键快速导入',
    create_modal_import_placeholder: '-- 点击选择现有持仓卡牌 --',
    create_modal_card_name: '卡牌名称 *',
    create_modal_card_name_ph: '例如：喷火龙 ex SAR #199',
    create_modal_category: '卡牌分类',
    create_modal_ref_price: '官方市场参考价 ($)',
    create_modal_asking_price: '您的期望售价 ($) *',
    create_modal_asking_price_ph: '期望开价',
    create_modal_comparison: '行情比对：',
    create_modal_below_market: '低于官方市价 {pct}% (省下 ${save})',
    create_modal_equal_market: '符合官方行情价',
    create_modal_above_market: '高于官方参考价 +{pct}%',
    create_modal_condition_label: '卡况评级标签',
    create_modal_series_label: '所属系列',
    create_modal_series_ph: '例如：151 / 苍空烈流',
    create_modal_photo_label: '实体卡照片 (支持手机相机拍照或相册)',
    create_modal_photo_change: '更换实拍照',
    create_modal_photo_upload: '拍照或上传实体图',
    create_modal_contact_label: '买家联系方式 *',
    create_modal_contact_ph: '请输入您的 ID 或账号',
    create_modal_location_label: '交易地区 / 寄送方式',
    create_modal_location_ph: '例如：同城面交 / 顺丰包邮',
    create_modal_notes_label: '卡况描述与交易说明',
    create_modal_notes_ph: '说明卡牌现况（例如：四角无白边、附带磁吸卡砖、防潮箱存放），提升买家信任！',
    create_modal_submit: '确认发布到市场',
    create_modal_default_notes: '正版实体卡收藏，欢迎私信洽谈或确认卡况细节。',
    create_modal_default_location: '同城面交 / 顺丰包邮',
    create_modal_cond_psa10: 'PSA 10 (满分神卡)',
    create_modal_cond_psa9: 'PSA 9 (Mint 完美)',
    create_modal_cond_bgs95: 'BGS 9.5 (金标)',
    create_modal_cond_cgc10: 'CGC 10 (Pristine)',
    create_modal_cond_raw_nm: '未评级 NM (无伤裸卡)',
    create_modal_cond_played: '微瑕 / 实战下场卡 (Played)',
  },
};
