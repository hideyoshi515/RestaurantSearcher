const express = require('express');
const fs = require('fs');
const https = require('https');
const cors = require('cors');

// SSLキーと証明書の設定
const sslKey = fs.readFileSync('./localhost.key', 'utf8');
const sslCert = fs.readFileSync('./localhost.pem', 'utf8');

// アプリケーションの初期化
const app = express();

// CORSの問題を解決するためのミドルウェアを追加
app.use(cors());

// 静的ファイルを提供
app.use(express.static('public'));

// HTTPサーバーをポート3000で起動
app.listen(3000, () => {
  console.log('HTTPサーバーはポート3000で実行中');
});

// HTTPSサーバーをポート3001で起動
https.createServer({ key: sslKey, cert: sslCert }, app).listen(3001, () => {
  console.log('HTTPSサーバーはポート3001で実行中');
});
