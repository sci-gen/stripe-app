/**
 * フロントエンド設定ファイル
 * 環境に応じてAPIのベースURLを設定
 */

const CONFIG = {
    // 開発環境
    development: {
        API_BASE_URL: 'http://localhost:8000',
        FRONTEND_BASE_URL: 'http://localhost:3000'
    },
    // 本番環境
    production: {
        API_BASE_URL: 'https://your-api-domain.com',
        FRONTEND_BASE_URL: 'https://your-frontend-domain.com'
    }
};

// 現在の環境を判定（開発環境はlocalhostを含む）
const getCurrentEnvironment = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'development'
        : 'production';
};

// 現在の環境設定を取得
const currentConfig = CONFIG[getCurrentEnvironment()];

// エクスポート
window.APP_CONFIG = currentConfig;
