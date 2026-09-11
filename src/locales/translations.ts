export type Language = 'en' | 'zh-TW' | 'zh-CN';

export type TranslationKey =
  // Navigation & Header
  | 'nav_stream'
  | 'nav_explore'
  | 'nav_sets'
  | 'nav_showcase'
  | 'nav_portfolio'
  | 'nav_total_portfolio_value'
  | 'nav_select_language'

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
  | 'confirm_add';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    // Navigation & Header
    nav_stream: 'Telemetry',
    nav_explore: 'Explore',
    nav_sets: 'Sets',
    nav_showcase: 'Showcase',
    nav_portfolio: 'Portfolio',
    nav_total_portfolio_value: 'Total Portfolio Value',
    nav_select_language: 'Language',

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
    view_on_tcgplayer: 'View on TCGPlayer ↗',
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
  },
  'zh-TW': {
    // Navigation & Header
    nav_stream: '即時遙測',
    nav_explore: '探索圖鑑',
    nav_sets: '卡牌擴充包',
    nav_showcase: '3D展覽館',
    nav_portfolio: '資產組合',
    nav_total_portfolio_value: '收藏總資產估值',
    nav_select_language: '選擇語言',

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
    view_on_tcgplayer: '前往 TCGPLAYER 查看 ↗',
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
  },
  'zh-CN': {
    // Navigation & Header
    nav_stream: '实时遥测',
    nav_explore: '探索图鉴',
    nav_sets: '卡牌扩展包',
    nav_showcase: '3D展览馆',
    nav_portfolio: '资产组合',
    nav_total_portfolio_value: '收藏总资产估值',
    nav_select_language: '选择语言',

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
    view_on_tcgplayer: '前往 TCGPLAYER 查看 ↗',
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
  },
};
