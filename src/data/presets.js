// プリセットサービス一覧
export const CATEGORIES = [
    'LLM・生成AI', 'AIコーディング・開発ツール', 'AI画像生成', 'AI動画生成',
    'AI音楽生成', 'AIライティング・ドキュメント', '動画配信', '音楽配信',
    '生産性・クラウドストレージ', 'エンタメ・ライフスタイル', '通信・VPN・セキュリティ',
];

export const PRESET_SERVICES = [
    // LLM・生成AI（チャット型）
    { id: 'chatgpt_go', name: 'ChatGPT Go', icon: '🤖', category: 'LLM・生成AI', plan: 'Go', defaultAmount: 1500 },
    { id: 'chatgpt_plus', name: 'ChatGPT Plus', icon: '🤖', category: 'LLM・生成AI', plan: 'Plus', defaultAmount: 3000 },
    { id: 'chatgpt_pro', name: 'ChatGPT Pro', icon: '🤖', category: 'LLM・生成AI', plan: 'Pro', defaultAmount: 30000 },
    { id: 'claude_pro', name: 'Claude Pro', icon: '🧠', category: 'LLM・生成AI', plan: 'Pro', defaultAmount: 3000 },
    { id: 'claude_max5x', name: 'Claude Max 5x', icon: '🧠', category: 'LLM・生成AI', plan: 'Max 5x', defaultAmount: 15000 },
    { id: 'claude_max20x', name: 'Claude Max 20x', icon: '🧠', category: 'LLM・生成AI', plan: 'Max 20x', defaultAmount: 30000 },
    { id: 'google_ai_pro', name: 'Google AI Pro', icon: '✨', category: 'LLM・生成AI', plan: 'AI Pro', defaultAmount: 2900 },
    { id: 'google_ai_ultra', name: 'Google AI Ultra', icon: '✨', category: 'LLM・生成AI', plan: 'AI Ultra', defaultAmount: 36400 },
    { id: 'perplexity_pro', name: 'Perplexity Pro', icon: '🔍', category: 'LLM・生成AI', plan: 'Pro', defaultAmount: 3000 },
    { id: 'perplexity_max', name: 'Perplexity Max', icon: '🔍', category: 'LLM・生成AI', plan: 'Max', defaultAmount: 30000 },
    { id: 'copilot_pro', name: 'Microsoft Copilot Pro', icon: '🪟', category: 'LLM・生成AI', plan: 'Pro', defaultAmount: 3200 },
    { id: 'grok_premium', name: 'xAI Grok Premium', icon: '🚀', category: 'LLM・生成AI', plan: 'Premium', defaultAmount: 1960 },

    // AIコーディング・開発ツール
    { id: 'ghcopilot_individual', name: 'GitHub Copilot Individual', icon: '💻', category: 'AIコーディング・開発ツール', plan: 'Individual', defaultAmount: 1500 },
    { id: 'ghcopilot_business', name: 'GitHub Copilot Business', icon: '💻', category: 'AIコーディング・開発ツール', plan: 'Business', defaultAmount: 2850 },
    { id: 'cursor_pro', name: 'Cursor Pro', icon: '🖱️', category: 'AIコーディング・開発ツール', plan: 'Pro', defaultAmount: 3000 },
    { id: 'cursor_ultra', name: 'Cursor Ultra', icon: '🖱️', category: 'AIコーディング・開発ツール', plan: 'Ultra', defaultAmount: 30000 },
    { id: 'windsurf_pro', name: 'Windsurf Pro', icon: '🏄', category: 'AIコーディング・開発ツール', plan: 'Pro', defaultAmount: 1500 },
    { id: 'cline_pro', name: 'Cline（旧 Claude Dev）', icon: '🔧', category: 'AIコーディング・開発ツール', plan: 'Pro', defaultAmount: 3000 },
    { id: 'replit_core', name: 'Replit Core', icon: '🔁', category: 'AIコーディング・開発ツール', plan: 'Core', defaultAmount: 3750 },
    { id: 'v0_premium', name: 'v0 Premium', icon: '▲', category: 'AIコーディング・開発ツール', plan: 'Premium', defaultAmount: 3000 },
    { id: 'bolt_pro', name: 'Bolt.new Pro', icon: '⚡', category: 'AIコーディング・開発ツール', plan: 'Pro', defaultAmount: 3000 },

    // AI画像生成
    { id: 'midjourney_basic', name: 'Midjourney Basic', icon: '🎨', category: 'AI画像生成', plan: 'Basic', defaultAmount: 1500 },
    { id: 'midjourney_standard', name: 'Midjourney Standard', icon: '🎨', category: 'AI画像生成', plan: 'Standard', defaultAmount: 4500 },
    { id: 'midjourney_pro', name: 'Midjourney Pro', icon: '🎨', category: 'AI画像生成', plan: 'Pro', defaultAmount: 9000 },
    { id: 'dalle', name: 'DALL-E（ChatGPT Plus 内）', icon: '🖼️', category: 'AI画像生成', plan: 'Plus内', defaultAmount: 0 },
    { id: 'stable_diffusion', name: 'Stable Diffusion', icon: '🖼️', category: 'AI画像生成', plan: 'API従量制', defaultAmount: 1500 },
    { id: 'adobe_firefly', name: 'Adobe Firefly Premium', icon: '🔥', category: 'AI画像生成', plan: 'Premium', defaultAmount: 680 },
    { id: 'leonardo_pro', name: 'Leonardo.AI Pro', icon: '🎨', category: 'AI画像生成', plan: 'Apprentice', defaultAmount: 1800 },

    // AI動画生成
    { id: 'runway_standard', name: 'Runway Standard', icon: '🎬', category: 'AI動画生成', plan: 'Standard', defaultAmount: 1800 },
    { id: 'runway_pro', name: 'Runway Pro', icon: '🎬', category: 'AI動画生成', plan: 'Pro', defaultAmount: 4500 },
    { id: 'pika_standard', name: 'Pika Standard', icon: '📹', category: 'AI動画生成', plan: 'Standard', defaultAmount: 1200 },
    { id: 'kling_pro', name: 'Kling AI Pro', icon: '🎥', category: 'AI動画生成', plan: 'Pro', defaultAmount: 750 },
    { id: 'heygen_creator', name: 'HeyGen Creator', icon: '🗣️', category: 'AI動画生成', plan: 'Creator', defaultAmount: 4350 },

    // AI音楽生成
    { id: 'suno_pro', name: 'Suno Pro', icon: '🎵', category: 'AI音楽生成', plan: 'Pro', defaultAmount: 1500 },
    { id: 'suno_premier', name: 'Suno Premier', icon: '🎵', category: 'AI音楽生成', plan: 'Premier', defaultAmount: 4500 },
    { id: 'udio_standard', name: 'Udio Standard', icon: '🎶', category: 'AI音楽生成', plan: 'Standard', defaultAmount: 1500 },

    // AIライティング・ドキュメント
    { id: 'notion_ai', name: 'Notion AI', icon: '📝', category: 'AIライティング・ドキュメント', plan: 'アドオン', defaultAmount: 1500 },
    { id: 'notion_plus', name: 'Notion Plus', icon: '📝', category: 'AIライティング・ドキュメント', plan: 'Plus', defaultAmount: 1650 },
    { id: 'jasper_creator', name: 'Jasper Creator', icon: '✍️', category: 'AIライティング・ドキュメント', plan: 'Creator', defaultAmount: 5850 },
    { id: 'grammarly_premium', name: 'Grammarly Premium', icon: '📖', category: 'AIライティング・ドキュメント', plan: 'Premium', defaultAmount: 1800 },
    { id: 'deepl_starter', name: 'DeepL Pro Starter', icon: '🌐', category: 'AIライティング・ドキュメント', plan: 'Starter', defaultAmount: 1000 },

    // 動画配信
    { id: 'netflix', name: 'Netflix（スタンダード）', icon: '🎬', category: '動画配信', plan: 'スタンダード', defaultAmount: 1590 },
    { id: 'amazon_prime_video', name: 'Amazon Prime Video', icon: '📦', category: '動画配信', plan: '', defaultAmount: 600 },
    { id: 'disney_plus', name: 'Disney+（スタンダード）', icon: '🏰', category: '動画配信', plan: 'スタンダード', defaultAmount: 990 },
    { id: 'unext', name: 'U-NEXT', icon: '🎞️', category: '動画配信', plan: '', defaultAmount: 2189 },
    { id: 'hulu', name: 'Hulu', icon: '📺', category: '動画配信', plan: '', defaultAmount: 1026 },
    { id: 'dazn', name: 'DAZN', icon: '⚽', category: '動画配信', plan: '', defaultAmount: 4200 },
    { id: 'abema', name: 'ABEMAプレミアム', icon: '📡', category: '動画配信', plan: '', defaultAmount: 960 },
    { id: 'wowow', name: 'WOWOWオンデマンド', icon: '🎭', category: '動画配信', plan: '', defaultAmount: 2530 },
    { id: 'dmm_tv', name: 'DMM TV', icon: '🎮', category: '動画配信', plan: '', defaultAmount: 550 },
    { id: 'lemino', name: 'Lemino プレミアム', icon: '📱', category: '動画配信', plan: '', defaultAmount: 990 },
    { id: 'nhk_ondemand', name: 'NHKオンデマンド', icon: '📺', category: '動画配信', plan: '', defaultAmount: 990 },
    { id: 'fod', name: 'FOD プレミアム', icon: '📺', category: '動画配信', plan: '', defaultAmount: 976 },
    { id: 'paravi', name: 'Paravi（U-NEXT統合）', icon: '📺', category: '動画配信', plan: '', defaultAmount: 1017 },

    // 音楽配信
    { id: 'spotify', name: 'Spotify Premium', icon: '🎵', category: '音楽配信', plan: 'Premium', defaultAmount: 980 },
    { id: 'apple_music', name: 'Apple Music', icon: '🍎', category: '音楽配信', plan: '', defaultAmount: 1080 },
    { id: 'youtube_music', name: 'YouTube Music Premium', icon: '▶️', category: '音楽配信', plan: 'Premium', defaultAmount: 1080 },
    { id: 'amazon_music', name: 'Amazon Music Unlimited', icon: '🎧', category: '音楽配信', plan: '', defaultAmount: 1080 },
    { id: 'line_music', name: 'LINE MUSIC', icon: '🟢', category: '音楽配信', plan: '', defaultAmount: 980 },
    { id: 'awa', name: 'AWA', icon: '🎶', category: '音楽配信', plan: '', defaultAmount: 980 },

    // 生産性・クラウドストレージ
    { id: 'ms365', name: 'Microsoft 365 Personal', icon: '📊', category: '生産性・クラウドストレージ', plan: 'Personal', defaultAmount: 1490 },
    { id: 'google_one_100', name: 'Google One（100GB）', icon: '☁️', category: '生産性・クラウドストレージ', plan: '100GB', defaultAmount: 250 },
    { id: 'google_one_2tb', name: 'Google One（2TB）', icon: '☁️', category: '生産性・クラウドストレージ', plan: '2TB', defaultAmount: 1300 },
    { id: 'dropbox_plus', name: 'Dropbox Plus', icon: '📁', category: '生産性・クラウドストレージ', plan: 'Plus', defaultAmount: 1500 },
    { id: 'icloud_50', name: 'iCloud+（50GB）', icon: '☁️', category: '生産性・クラウドストレージ', plan: '50GB', defaultAmount: 130 },
    { id: 'icloud_200', name: 'iCloud+（200GB）', icon: '☁️', category: '生産性・クラウドストレージ', plan: '200GB', defaultAmount: 400 },
    { id: 'icloud_2tb', name: 'iCloud+（2TB）', icon: '☁️', category: '生産性・クラウドストレージ', plan: '2TB', defaultAmount: 1300 },
    { id: 'adobe_cc', name: 'Adobe Creative Cloud コンプリート', icon: '🎨', category: '生産性・クラウドストレージ', plan: 'コンプリート', defaultAmount: 7780 },
    { id: 'canva_pro', name: 'Canva Pro', icon: '🖌️', category: '生産性・クラウドストレージ', plan: 'Pro', defaultAmount: 1500 },
    { id: '1password', name: '1Password', icon: '🔐', category: '生産性・クラウドストレージ', plan: '', defaultAmount: 450 },

    // エンタメ・ライフスタイル
    { id: 'youtube_premium', name: 'YouTube Premium', icon: '▶️', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 1280 },
    { id: 'amazon_prime', name: 'Amazonプライム', icon: '📦', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 600 },
    { id: 'switch_online', name: 'Nintendo Switch Online', icon: '🎮', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 306 },
    { id: 'switch_online_plus', name: 'Nintendo Switch Online + 追加パック', icon: '🎮', category: 'エンタメ・ライフスタイル', plan: '追加パック', defaultAmount: 817 },
    { id: 'ps_plus_essential', name: 'PlayStation Plus Essential', icon: '🎮', category: 'エンタメ・ライフスタイル', plan: 'Essential', defaultAmount: 850 },
    { id: 'ps_plus_extra', name: 'PlayStation Plus Extra', icon: '🎮', category: 'エンタメ・ライフスタイル', plan: 'Extra', defaultAmount: 1300 },
    { id: 'xbox_core', name: 'Xbox Game Pass Core', icon: '🎮', category: 'エンタメ・ライフスタイル', plan: 'Core', defaultAmount: 842 },
    { id: 'xbox_ultimate', name: 'Xbox Game Pass Ultimate', icon: '🎮', category: 'エンタメ・ライフスタイル', plan: 'Ultimate', defaultAmount: 1450 },
    { id: 'kindle_unlimited', name: 'Kindle Unlimited', icon: '📚', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 980 },
    { id: 'audible', name: 'Audible', icon: '🎧', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 1500 },
    { id: 'rakuten_magazine', name: '楽天マガジン', icon: '📖', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 418 },
    { id: 'd_magazine', name: 'dマガジン', icon: '📖', category: 'エンタメ・ライフスタイル', plan: '', defaultAmount: 580 },
    { id: 'moneyforward', name: 'マネーフォワード ME プレミアム', icon: '💰', category: 'エンタメ・ライフスタイル', plan: 'プレミアム', defaultAmount: 500 },

    // 通信・VPN・セキュリティ
    { id: 'nordvpn', name: 'NordVPN', icon: '🛡️', category: '通信・VPN・セキュリティ', plan: '', defaultAmount: 1510 },
    { id: 'expressvpn', name: 'ExpressVPN', icon: '🛡️', category: '通信・VPN・セキュリティ', plan: '', defaultAmount: 1800 },
    { id: 'virus_buster', name: 'ウイルスバスター クラウド', icon: '🔒', category: '通信・VPN・セキュリティ', plan: '', defaultAmount: 500 },
    { id: 'norton360', name: 'ノートン 360', icon: '🔒', category: '通信・VPN・セキュリティ', plan: '', defaultAmount: 700 },
];

export const CATEGORY_COLORS = {
    'LLM・生成AI': '#a78bfa',
    'AIコーディング・開発ツール': '#818cf8',
    'AI画像生成': '#f472b6',
    'AI動画生成': '#fb923c',
    'AI音楽生成': '#34d399',
    'AIライティング・ドキュメント': '#60a5fa',
    '動画配信': '#f87171',
    '音楽配信': '#4ade80',
    '生産性・クラウドストレージ': '#38bdf8',
    'エンタメ・ライフスタイル': '#fbbf24',
    '通信・VPN・セキュリティ': '#94a3b8',
    'その他': '#6b7280',
};
