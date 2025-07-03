# Stripe Payment Application

## アーキテクチャ

### 概要

バックエンドとフロントエンドが完全に分離された、疎結合なWebアプリケーションです。

### 構成

```
stripe/
├── backend/                 # APIサーバー
│   ├── main.py             # FastAPI アプリケーション
│   ├── config.py           # 設定管理
│   ├── requirements.txt    # Python依存関係
│   └── .env               # 環境変数
├── frontend/               # フロントエンドアプリケーション
│   ├── index.html         # メインページ
│   ├── success.html       # 成功ページ
│   ├── server.py          # 開発用HTTPサーバー
│   └── static/
│       ├── css/
│       │   └── style.css  # スタイルシート
│       └── js/
│           ├── config.js  # API設定
│           ├── payment.js # 決済処理
│           └── success.js # 成功ページ処理
```

## 設計原則

### 疎結合アーキテクチャ

- **バックエンド**: 純粋なREST API（JSON APIのみ）
- **フロントエンド**: 静的HTML/CSS/JavaScript
- **通信**: CORS対応のHTTP API通信

### 責任分離

- **バックエンド**: Stripe API連携、データ処理、ビジネスロジック
- **フロントエンド**: UI/UX、ユーザー操作、API呼び出し

### スケーラビリティ

- 独立したデプロイメント
- 異なる技術スタックでの置き換え可能
- マイクロサービスアーキテクチャ対応

## API仕様

### エンドポイント

#### 1. 設定取得

```
GET /api/config
```

**レスポンス:**

```json
{
    "publishable_key": "pk_test_...",
    "currency": "jpy"
}
```

#### 2. チェックアウトセッション作成

```
POST /api/create-checkout-session
```

**リクエスト:**

```json
{
    "amount": 1000,
    "currency": "jpy",
    "product_name": "単発購入"
}
```

**レスポンス:**

```json
{
    "success": true,
    "session_id": "cs_test_...",
    "checkout_url": "https://checkout.stripe.com/..."
}
```

#### 3. 請求書作成

```
POST /api/create-invoice
```

**リクエスト:**

```json
{
    "amount": 1000,
    "email": "customer@example.com",
    "description": "単発購入",
    "currency": "jpy"
}
```

**レスポンス:**

```json
{
    "success": true,
    "invoice_id": "in_...",
    "invoice_url": "https://invoice.stripe.com/...",
    "invoice_pdf": "https://..."
}
```

#### 4. セッション情報取得

```
GET /api/checkout-session/{session_id}
```

**レスポンス:**

```json
{
    "success": true,
    "session": {
        "id": "cs_test_...",
        "payment_status": "paid",
        "amount_total": 1000,
        "currency": "jpy",
        "customer_email": "customer@example.com"
    }
}
```

#### 5. ヘルスチェック

```
GET /api/health
```

**レスポンス:**

```json
{
    "status": "healthy",
    "message": "Stripe Payment API is running"
}
```

## セットアップ

### 1. 依存関係のインストール

```bash
# バックエンド
cd backend
pip install -r requirements.txt
```

### 2. 環境変数の設定

`.env` ファイルを作成し、Stripe APIキーを設定:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. アプリケーションの起動

#### バックエンド（APIサーバー）

```bash
cd backend
python main.py
```

- アクセスURL: <http://localhost:8000>
- API文書: <http://localhost:8000/docs>

#### フロントエンド（Webアプリケーション）

```bash
cd frontend
python server.py
```

- アクセスURL: <http://localhost:3000>

## 開発・本番環境の切り替え

### 開発環境

- バックエンド: <http://localhost:8000>
- フロントエンド: <http://localhost:3000>
- CORS設定: localhost許可

### 本番環境

1. `frontend/static/js/config.js` のAPI URLを変更
2. `backend/main.py` のCORS設定を本番ドメインに変更
3. 環境変数でStripeキーを本番用に設定

## 利点

### 1. 独立したデプロイメント

- バックエンドとフロントエンドを異なるサーバーにデプロイ可能
- 各コンポーネントの独立したスケーリング

### 2. 技術スタックの柔軟性

- フロントエンドをReact、Vue.js等に置き換え可能
- バックエンドをNode.js、Django等に置き換え可能

### 3. 開発効率の向上

- 並行開発が可能
- APIファーストな設計
- 明確な責任分離

### 4. セキュリティ

- API認証の実装が容易
- フロントエンドとバックエンドの分離によるセキュリティ向上

## 今後の拡張

### 1. 認証・認可

- JWT認証の実装
- ユーザー管理機能

### 2. データベース連携

- 取引履歴の保存
- 顧客情報の管理

### 3. 通知機能

- Webhook対応
- メール通知

### 4. 管理画面

- 取引管理
- 統計・レポート機能
