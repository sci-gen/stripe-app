// API設定
const API_CONFIG = {
    // 開発環境のAPI URL
    BASE_URL: 'http://localhost:8000/api',

    // 本番環境用（必要に応じて変更）
    // BASE_URL: 'https://your-api-domain.com/api',

    // エンドポイント
    ENDPOINTS: {
        CONFIG: '/config',
        CREATE_CHECKOUT: '/create-checkout-session',
        CREATE_INVOICE: '/create-invoice',
        GET_SESSION: '/checkout-session'
    }
};

// Stripe設定（APIから取得）
let STRIPE_CONFIG = null;

/**
 * API設定を取得
 */
async function fetchConfig() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        STRIPE_CONFIG = await response.json();
        return STRIPE_CONFIG;
    } catch (error) {
        console.error('設定の取得に失敗しました:', error);
        throw error;
    }
}

/**
 * APIリクエストを送信
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('APIリクエストエラー:', error);
        throw error;
    }
}
