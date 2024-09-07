const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

// ルートパスへのリクエストを処理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバーを起動
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
