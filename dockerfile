# Node.jsの公式Alpineイメージを使用
FROM node:20.17.0-alpine

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# expressとcorsをインストール
RUN npm install express cors

# ソースコードをコピー
COPY . .

# SSLキーと証明書をコピー
COPY ./ssl/localhost.key /usr/src/app/localhost.key
COPY ./ssl/localhost.pem /usr/src/app/localhost.pem
COPY ./ssl/ssl-config.js /usr/src/app/ssl-config.js

# 3000および3001ポートを公開
EXPOSE 3000
EXPOSE 3001

# アプリケーションを起動
CMD ["node", "server.js"]
