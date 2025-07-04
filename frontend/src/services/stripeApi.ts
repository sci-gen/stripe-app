import axios from 'axios';
import type {
  StripeConfig,
  CheckoutRequest,
  CheckoutResponse,
  InvoiceRequest,
  InvoiceResponse,
  SessionResponse
} from '../types/stripe';
import config from '../utils/config';

// Axios インスタンスを作成
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Stripe API サービス
export const stripeApi = {
  // 設定取得
  getConfig: async (): Promise<StripeConfig> => {
    const response = await api.get('/api/config');
    return response.data;
  },

  // チェックアウトセッション作成
  createCheckoutSession: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await api.post('/api/create-checkout-session', data);
    return response.data;
  },

  // 請求書作成
  createInvoice: async (data: InvoiceRequest): Promise<InvoiceResponse> => {
    const response = await api.post('/api/create-invoice', data);
    return response.data;
  },

  // セッション情報取得
  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await api.get(`/api/checkout-session/${sessionId}`);
    return response.data;
  },

  // ヘルスチェック
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default stripeApi;
