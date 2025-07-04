// Stripe関連の型定義
export interface StripeConfig {
  publishable_key: string;
  currency: string;
}

export interface CheckoutRequest {
  amount: number;
  currency?: string;
  product_name?: string;
}

export interface CheckoutResponse {
  success: boolean;
  session_id: string;
  checkout_url: string;
}

export interface InvoiceRequest {
  amount: number;
  email: string;
  description?: string;
  currency?: string;
}

export interface InvoiceResponse {
  id: string;
  customer_email: string;
  amount_due: number;
  currency: string;
  status: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

export interface SessionInfo {
  id: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email?: string;
}

export interface SessionResponse {
  success: boolean;
  session: SessionInfo;
}

// API レスポンス共通型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
}

// フォーム関連の型
export interface PaymentFormData {
  amount: number;
  productName: string;
}

export interface InvoiceFormData {
  amount: number;
  email: string;
  description: string;
}

// アプリケーション設定
export interface AppConfig {
  apiBaseUrl: string;
  frontendBaseUrl: string;
}

// 環境変数
export interface EnvConfig {
  development: AppConfig;
  production: AppConfig;
}

// エラー型
export interface StripeError {
  message: string;
  type: string;
  code?: string;
}
