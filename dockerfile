# Node.jsの公式Alpineイメージを使用
FROM node:20.17.0-alpine

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD [ "npm", "start" ]
