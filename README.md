# Stripe Payment Application

## アーキテクチャ

### 概要

バックエンドとフロントエンドが完全に分離された、疎結合なWebアプリケーションです。

### 構成

```
stripe/
├── backend/                    # FastAPI APIサーバー
│   ├── main.py                # FastAPI アプリケーション
│   ├── config.py              # 設定管理
│   ├── requirements.txt       # Python依存関係
│   ├── Dockerfile            # Docker設定
│   └── __pycache__/          # Pythonキャッシュ
├── frontend/                  # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   │   ├── HomePage.tsx # メイン画面
│   │   │   └── SuccessPage.tsx # 成功画面
│   │   ├── services/        # APIサービス
│   │   │   └── stripeApi.ts # Stripe API連携
│   │   ├── types/           # TypeScript型定義
│   │   │   └── stripe.ts    # Stripe関連の型
│   │   ├── utils/           # ユーティリティ
│   │   │   └── config.ts    # 設定管理
│   │   ├── App.tsx          # メインアプリケーション
│   │   ├── main.tsx         # エントリーポイント
│   │   └── index.css        # スタイルシート (Tailwind CSS)
│   ├── index.html           # HTMLテンプレート
│   ├── package.json         # Node.js依存関係
│   ├── vite.config.ts       # Vite設定
│   ├── tailwind.config.js   # Tailwind CSS設定
│   ├── postcss.config.js    # PostCSS設定
│   ├── tsconfig.json        # TypeScript設定
│   └── Dockerfile           # Docker設定
├── frontend-legacy/          # 旧フロントエンド（バックアップ）
│   ├── index.html           # メインページ
│   ├── success.html         # 成功ページ
│   └── static/              # 静的ファイル
├── docker-compose.yml       # Docker Compose設定
├── .env                     # 環境変数
├── .dockerignore           # Docker除外設定
└── README.md               # このファイル
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

#### バックエンド (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

#### フロントエンド (React + TypeScript)

```bash
cd frontend
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、Stripe APIキーを設定:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. アプリケーションの起動

#### 開発環境

**バックエンド（APIサーバー）**

```bash
cd backend
python main.py
```

- アクセスURL: <http://localhost:8000>
- API文書: <http://localhost:8000/docs>

**フロントエンド（React + Vite）**

```bash
cd frontend
npm run dev
```

- アクセスURL: <http://localhost:5173> (または利用可能なポート)

#### Docker環境

```bash
# 開発環境
docker-compose up --build

# 本番環境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

### 4. 技術スタック

#### バックエンド
- **FastAPI**: 高性能なPython Web API フレームワーク
- **Stripe Python SDK**: Stripe API連携
- **Python 3.11+**: プログラミング言語
- **uvicorn**: ASGIサーバー

#### フロントエンド
- **React 19**: UIライブラリ
- **TypeScript**: 型安全なJavaScript
- **Vite**: 高速なビルドツール
- **Tailwind CSS**: ユーティリティファーストCSSフレームワーク
- **React Router**: SPAルーティング
- **Axios**: HTTP クライアント
- **React Query**: データフェッチング・キャッシング

#### インフラ
- **Docker**: コンテナ化
- **Docker Compose**: マルチコンテナ管理

## 環境設定

### 開発環境設定

- **バックエンド**: <http://localhost:8000>
- **フロントエンド**: <http://localhost:5173> (Vite)
- **CORS設定**: localhost 全ポート許可
- **ホットリロード**: 有効

### 本番環境設定

1. **環境変数の設定**
   - Stripe本番用APIキーの設定
   - 本番用データベース設定（必要に応じて）

2. **フロントエンド設定**
   - `frontend/src/utils/config.ts` の `API_BASE_URL` を本番URLに変更

3. **バックエンド設定**
   - `backend/main.py` の CORS設定を本番ドメインに変更

4. **Docker本番デプロイ**

   ```bash
   # 本番用ビルド
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

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
