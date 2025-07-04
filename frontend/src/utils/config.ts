import type { EnvConfig } from '../types/stripe';

// 環境設定
const config: EnvConfig = {
  development: {
    apiBaseUrl: 'http://localhost:8000',
    frontendBaseUrl: 'http://localhost:3000'
  },
  production: {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'https://your-api-domain.com',
    frontendBaseUrl: import.meta.env.VITE_FRONTEND_URL || 'https://your-frontend-domain.com'
  }
};

// 現在の環境を判定
const getCurrentEnvironment = (): 'development' | 'production' => {
  if (import.meta.env.MODE === 'development') return 'development';
  return 'production';
};

// 現在の環境設定を取得
export const getConfig = () => {
  const env = getCurrentEnvironment();
  return config[env];
};

// デフォルトエクスポート
export default getConfig();
