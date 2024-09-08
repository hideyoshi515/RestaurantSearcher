# Node.jsの公式Alpineイメージを使用
FROM node:20.17.0-alpine

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# live-serverをグローバルにインストール
RUN npm install -g live-server

# ソースコードをコピー
COPY . .

# SSLキーと証明書をコピー (localhost.keyとlocalhost.pem)
COPY ./.vscode/localhost.key /usr/src/app/localhost.key
COPY ./.vscode/localhost.pem /usr/src/app/localhost.pem

# 3001ポートを公開
EXPOSE 3001

# アプリケーションを起動 (SSLを使用してlive-serverを3001ポートで実行)
CMD ["live-server", "--https=--cert=localhost.pem --key=localhost.key", "--port=3001"]
