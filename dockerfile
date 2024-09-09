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
COPY ./ssl/localhost.key /usr/src/app/localhost.key
COPY ./ssl/localhost.pem /usr/src/app/localhost.pem
COPY ./ssl/ssl-config.js /usr/src/app/ssl-config.js

# 3000:3001ポートを公開
EXPOSE 3000
EXPOSE 3001


# アプリケーションを起動 (SSLを使用してlive-serverを3001ポートで実行)
CMD ["sh", "-c", "live-server --port=3000 & live-server --https=ssl-config.js --port=3001"]