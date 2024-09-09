## 作動環境
- Live Server
- Docker
上記の中１つ

## Docker環境
- Docker Desktop 4.33.1
- node.js 20.17.0 Alpine
- npm 4.1.5
- live-server 1.2.2

## 機能フォローチャート
```mermaid
flowchart TD;
    A([メインサイト【index.html】])
    B[/現在位置基盤/]
    C[/日本地図から選択 *1/]
    D[検索処理]
    E[/店の詳細モーダル/]
    F[[直近閲覧リストに追加]]
    H[/店舗名基盤/]
    G[/リストサイト/]
    A-->id1{{直近閲覧リストを出力}}
    id1-->id{検索条件}
    id-->B & C & H
    B & C & H-->D
    D-->G
    G-->F
    F-->E & id1
```


## 引用元
1. 日本地図リソース：https://web.contempo.jp/weblog/tips/post-7652

## 注意事項
- 自分のSSL認証書を使用する場合、sslフォルダにSSL認証書を入れて./dockerfileと./ssl/ssl-config.jsを修正する必要があります。
