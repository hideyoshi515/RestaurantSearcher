@echo off
:: node_modulesフォルダが存在するか確認
if not exist "node_modules" (
    echo node_modulesフォルダがありません。npm installを実行します...
    npm install
) else (
    echo node_modulesフォルダが存在します。サーバーを起動します...
    npm start
)
