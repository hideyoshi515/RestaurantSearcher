```mermaid
flowchart TD;
    A([メインサイト【index.html】])
    B[現在位置基盤]
    C[日本地図から選択 *1]
    D[/結果リストサイト/]
    E[/店の詳細モーダル/]
    F[[データを獲得及び最近訪問リストに追加]]
    H[店舗名基盤]
    A-->id1{{最近訪問記録出力}}
    id1-->id{検索貯件}
    id-->B & C & H
    B & C & H-->D
    D-->F
    F-->id1 & E
```


引用元
*1 日本地図リソース：https://web.contempo.jp/weblog/tips/post-7652

Docker Desktop 4.33.1
node.js 20.17.0 Alpine


Need to ssl key in .vscode folder and named localhost.key / localhost.pem, or edit in dockerfile & ssl-config.js
