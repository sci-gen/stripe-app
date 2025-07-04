# Node.js 20をベースイメージとして使用（安定版LTS）
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# Alpine LinuxのパッケージマネージャーでPythonとmake、g++を追加
RUN apk add --no-cache python3 make g++

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production=false

# アプリケーションコードをコピー
COPY . .

# ポートを公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
