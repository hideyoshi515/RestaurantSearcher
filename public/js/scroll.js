let currentPage = 1; // 現在のページ番号
let totalItems = 0; // 全店舗の総数
let currentIndex = 0; // 現在ロードされた店舗のインデックス
const itemsPerPage = 10; // 1ページに表示する最大の件数
const initialLoadCount = 6; // 初回に表示する店舗の件数（6件）
const maxLoadCount = 10; // スクロールで追加できる最大件数（10件まで）

let recentHistory = []; // 最近の履歴データを保存する配列
let historyIndex = 0; // 最近の履歴配列のインデックス
const initialHistoryLoadCount = 4; // 初回にロードする履歴の件数
const maxHistoryLoadCount = 20; // 最大表示する履歴の件数
const shopIncrement = 1; // スクロール時に追加ロードする件数

// 店舗データを生成して表示する関数
function createShopElement(shop, recent) {
    let shopid, name, access, logoImage, address, open;

    if (recent) {
        // recentがtrueの場合、文字列を分割してデータを抽出
        [shopid, name, access, logoImage, address, open] = shop.split("§");
    } else {
        // recentがfalseの場合、XMLデータから抽出
        const shopData = extractShopData(shop);
        ({ shopid, name, access, logoImage, address, open } = shopData);
    }

    const shopLink = document.createElement("a");
    shopLink.classList.add("shop-link");
    shopLink.classList.add("no-linkStyle");
    shopLink.href = "javascript:void(0)";
    shopLink.setAttribute('onclick', `openModal('${shopid}')`);

    const shopDiv = document.createElement("div");
    shopDiv.classList.add("shop");

    const shopImage = document.createElement("img");
    shopImage.src = logoImage;
    shopImage.classList.add("shop-image");
    shopImage.alt = "Shop Image";
    shopDiv.appendChild(shopImage);

    const shopContentDiv = document.createElement("div");
    shopContentDiv.classList.add("shop-content");

    const shopName = document.createElement("p");
    shopName.classList.add("shop-name");
    shopName.textContent = name;
    shopContentDiv.appendChild(shopName);

    const shopAccess = document.createElement("p");
    shopAccess.classList.add("shop-access");
    shopAccess.innerHTML = access;
    shopContentDiv.appendChild(shopAccess);

    const shopTime = document.createElement("p");
    shopTime.classList.add("shop-time");
    shopTime.innerHTML = open;
    shopContentDiv.appendChild(shopTime);

    shopDiv.appendChild(shopContentDiv);
    shopLink.appendChild(shopDiv);

    return shopLink;
}

// 店舗データを追加でロードする関数
function loadMoreShops(endIndex) {
    const shopListContainer = document.querySelector(".shopList");

    if (currentIndex < endIndex && currentIndex - (currentPage - 1) * itemsPerPage < maxLoadCount) {
        const shopElement = createShopElement(shops[currentIndex], false);
        shopListContainer.appendChild(shopElement);
        currentIndex += shopIncrement; // 1件ずつ追加ロード
    } else {
        updatePagination();
    }
}

// スクロールで追加ロードを処理するためのIntersection Observer設定
function setupScrollLoad() {
    const scrollEnd = document.getElementById('scrollEnd'); // スクロール感知要素

    if (!scrollEnd) {
        console.error("scrollEnd 要素がありません。");
        return;
    }

    const onIntersect = (entries) => {
        if (entries[0].isIntersecting) {
            loadMoreShops(totalItems); // スクロール終端で店舗データを追加ロード
        }
    };

    const observer = new IntersectionObserver(onIntersect, {
        root: null, // ビューポート基準
        rootMargin: '0px', // 感知する余白
        threshold: 1.0 // 100% 要素が画面に入ったときにトリガー
    });

    observer.observe(scrollEnd); // scrollEnd要素を監視
}


// ページネーションの更新
function updatePagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let paginationHTML = "";

    if (currentPage > 1) {
        paginationHTML += `<button class="pageBtn" onclick="changePage(${currentPage - 1})"><</button>`;
    } else {
        paginationHTML += `<button class="pageBtn" disabled><</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<span class="current pageBtn">${i}</span>`;
        } else {
            paginationHTML += `<button class="pageBtn" onclick="changePage(${i})">${i}</button>`;
        }
    }

    if (currentPage < totalPages) {
        paginationHTML += `<button class="pageBtn" onclick="changePage(${currentPage + 1})">></button>`;
    } else {
        paginationHTML += `<button class="pageBtn" disabled>></button>`;
    }

    const paginationDiv = document.createElement("div");
    paginationDiv.id = "pagination";
    paginationDiv.innerHTML = paginationHTML;
    paginationDiv.classList.add("pagination");

    const existingPaginationDiv = document.getElementById("pagination");
    if (existingPaginationDiv) {
        document.body.replaceChild(paginationDiv, existingPaginationDiv);
    } else {
        document.body.appendChild(paginationDiv);
    }
}

// ページを変更する関数
function changePage(page) {
    if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
        currentPage = page;
        currentIndex = 0; // インデックスを初期化
        window.scrollTo(0, 0); // ページの最上部にスクロール
        displayPage(currentPage); // ページを表示
    }
}

// 最近の履歴データをロードして表示する関数
function loadRecentHistory() {
    const shopHistory = loadListFromLocalStorage("shopHistory");

    recentHistory = shopHistory.getList(); // 保存された最近の履歴を取得
    historyIndex = 0; // インデックスを初期化
    if (recentHistory.length > 0) {
        const historyTable = document.getElementById("historyMsg");
        const historyMessage = document.createElement("span");
        historyMessage.classList.add("historyList");
        historyMessage.innerHTML = "直近閲覧のお店一覧";
        historyTable.appendChild(historyMessage);
    }

    // 初回ロード時に4件のみ表示
    displayRecentHistory(initialHistoryLoadCount);
}

// 履歴データを表示する関数
function displayRecentHistory(loadCount) {
    const historiesDiv = document.getElementById("historyDiv");

    // 表示する件数を計算
    let itemsToDisplay = Math.min(loadCount, recentHistory.length - historyIndex);

    for (let i = historyIndex; i < historyIndex + itemsToDisplay && i < recentHistory.length; i++) {
        const shopElement = createShopElement(recentHistory[i], true);
        historiesDiv.appendChild(shopElement);
    }

    // インデックスを更新
    historyIndex += itemsToDisplay;

    // すべての履歴が表示されたらメッセージを追加
    if (historyIndex >= Math.min(maxHistoryLoadCount, recentHistory.length)) {
        const message = document.createElement("span");
        message.textContent = `最大 ${maxHistoryLoadCount}件まで表示されています`;
        message.classList.add("info-message");
        if (recentHistory.length > 0 && !document.querySelector('.info-message')) {
            document.getElementById('historyEnd').appendChild(message);
        }
    }
}

// スクロールで追加履歴をロードする部分をIntersection Observerに変更
function setupScrollLoadRecentHistory() {
    const loadMoreTrigger = document.getElementById('scrollEnd'); // スクロール終端のトリガー要素
    if (!loadMoreTrigger) {
      console.error("scrollEnd 要素が見つかりません。");
      return;
    }

    const onIntersect = (entries, observer) => {
      if (entries[0].isIntersecting) { // 要素がビューポートに入ったときに実行
        if (historyIndex < Math.min(recentHistory.length, maxHistoryLoadCount)) {
          displayRecentHistory(shopIncrement); // 1件ずつ追加ロード
        } else {
          const message = document.createElement("span");
          message.textContent = `最大 ${maxHistoryLoadCount}件まで表示されています`;
          message.classList.add("info-message");
          observer.disconnect(); // データがすべてロードされたら監視停止
        }
      }
    };

    const observer = new IntersectionObserver(onIntersect, {
      root: null, // ビューポート基準
      rootMargin: '200px', // 感知する余白を200pxに設定して余裕を持たせる
      threshold: 0.5 // 要素の50%が画面に入ったときにトリガー
    });

    observer.observe(loadMoreTrigger); // scrollEnd要素を監視
}

// ページロード時に最近の履歴をロードしてインターセクションを設定
document.addEventListener("DOMContentLoaded", () => {
    const pathname = window.location.pathname;

    // index.html ページの場合、履歴データをロードして無限スクロールを設定
    if (pathname.endsWith("index.html")) {
        loadRecentHistory(); // 最近の履歴をロード
        setupScrollLoadRecentHistory(); // 履歴データ用のインターセクションを設定
    }

    // result.html ページの場合、店舗データ用の無限スクロールを設定
    if (pathname.endsWith("result.html")) {
        setupScrollLoad(); // 店舗データ用のインターセクションを設定
    }
});
