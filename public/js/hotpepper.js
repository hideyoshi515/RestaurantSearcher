let currentPage = 1; // 現在のページ番号
const itemsPerPage = 10; // 1ページに表示する最大の件数
let totalItems = 0; // 全店舗の総数
let shops = []; // 店舗データを格納する配列
let currentIndex = 0; // 現在ロードされた店舗のインデックス
const initialLoadCount = 3; // 初回に表示する店舗の件数（3件）
const maxLoadCount = 10; // スクロールで追加できる最大件数（10件まで）
const shopIncrement = 1; // スクロール時に追加ロードする店舗の件数（1件）

// Result.htmlに表示するためAPIに接続とフォールバック
function getResult() {
  const urlParams = new URLSearchParams(window.location.search);
  let url = new URL(apiUrl);
  url.searchParams.append("count", "100");
  if (urlParams.has("range")) {
    url.searchParams.append("range", urlParams.get("range"));
  }
  if (urlParams.has("lat")) {
    url.searchParams.append("lat", urlParams.get("lat"));
  }
  if (urlParams.has("lng")) {
    url.searchParams.append("lng", urlParams.get("lng"));
  }
  if (urlParams.has("large_area")) {
    url.searchParams.append("large_area", urlParams.get("large_area"));
  }
  if (urlParams.has("middle_area")) {
    url.searchParams.append("middle_area", urlParams.get("middle_area"));
  }
  if (urlParams.has("small_area")) {
    url.searchParams.append("small_area", urlParams.get("small_area"));
  }

  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseXML(data))
    .catch((error) => console.error("Error:", error));

    if (urlParams.has("small_area")) {
      let areaUrl = new URL(smallAreaNameUrl);
      areaUrl.searchParams.append("small_area", urlParams.get("small_area"));
      fetch(proxyUrl + encodeURIComponent(areaUrl))
        .then((response) => response.text())
        .then((data) => parseXMLName(data))
        .catch((error) => console.error("Error:", error));
    }else if (urlParams.has("lat") && urlParams.has("lng")) {
    const xhr = new XMLHttpRequest();
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${urlParams.get("lat")}&lon=${urlParams.get("lng")}&accept-language=ja`;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const response = JSON.parse(this.responseText);
        const name = response.name || "none";
        const address = response.address;
        const postcode = address.postcode;
        const city = address.city;
        const neighbourhood = address.neighbourhood || address.suburb;
  
        document.getElementById("areaName").innerHTML = `${postcode}, ${city}, ${neighbourhood}`;
      }
    };
    xhr.send();
  }
    
}

// XMLデータを解析する関数
function parseXMLName(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const areas = xmlDoc.getElementsByTagName("small_area");
  document.getElementById("areaName").innerHTML = areas[0].getElementsByTagName("name")[0].textContent;
}

// XMLデータを解析する関数
function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  handleXMLData(xmlDoc);
}

// XMLデータの処理
function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  displayPage(currentPage); // ページごとに最初に表示する
}

// XMLから店舗データを抽出する関数
function extractShopData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("access")[0].textContent;
  const logoImage = shop.getElementsByTagName("l")[0].textContent;
  const photo = shop.getElementsByTagName("l")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;
  const open = shop.getElementsByTagName("open")[0].textContent;

  return {
    shopid,
    name,
    access,
    logoImage,
    photo,
    address,
    open,
  };
}

// アクセス情報をフォーマットする関数
function formatAccessInfo(access) {
  return (
    access
      // "駅" かつ特定の語句が続かない場合に改行を追加
      .replace(/駅(?!から|の|徒歩|より|隣|」|出|東|西|南|北|改|前)/g, "駅<br>")
      // 既存の <br> タグを一時的に置き換える
      .replace(/<br\s*\/?>/g, "__BR__")
      // "徒歩"の前にあるスペースを統一し、不要な改行を防ぐ
      .replace(/(\s*徒歩)/g, " 徒歩")
      // "分"の後に数字や "徒" が続かない場合にのみ改行を追加
      .replace(/分(?!\d|徒)/g, "分<br>")
      // "。" または "/" の後に改行を追加
      .replace(/。|\//g, "<br>")
      // 不要な "、" や "！" の後で改行しない
      .replace(/<br>、|<br>！/g, "<br>")
      // 特定のデコレーション文字 "♪" の後に改行を追加
      .replace(/♪/g, "<br>")
      // 既存の <br> タグを元に戻す
      .replace(/__BR__/g, "<br>")
      // 連続する <br> を1つにまとめる
      .replace(/(<br>\s*){2,}/g, "<br>")
  );
}

// 営業時間データをフォーマットする関数
function formatOperatingHours(open) {
  return open
    .split("\n") // 改行を基準に分割
    .filter((line) => line.trim() !== "") // 空の行を削除
    .map((line) => {
      // 時間帯の間にスペースまたは区切りがない場合を処理する正規表現
      let formattedLine = line.replace(/(\d{2}:\d{2})(\d{2}:\d{2})/g, "$1 $2");
      // 括弧がある場合とない場合の処理
      if (formattedLine.includes("（")) {
        const [mainTime, rest] = formattedLine.split("（");
        const [details, afterCloseParen] = rest.split("）");
        formattedLine = `${mainTime.trim()}<br>（${details.trim()}）`;
        // 括弧の後ろに追加の時間帯がある場合
        if (afterCloseParen && afterCloseParen.trim() !== "") {
          formattedLine += `<br>${afterCloseParen.trim()}`;
        }
      }
      return formattedLine.trim();
    })
    .join("<br>");
}

// 店舗データを生成して表示する関数
function createShopElement(shop) {
  const { shopid, name, access, logoImage, open } = extractShopData(shop);

  const shopLink = document.createElement("a");
  shopLink.href = `detail.html?id=${shopid}`;  // shopのcodeをパラメータとしてURLに追加
  shopLink.classList.add("shop-link");  // スタイル用のクラスを追加
  shopLink.style.textDecoration = "none";  // テキストの装飾を削除
  shopLink.style.color = "inherit";  // テキストカラーを継承

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
  shopTime.innerHTML = formatOperatingHours(open);
  shopContentDiv.appendChild(shopTime);

  shopDiv.appendChild(shopContentDiv);
  shopLink.appendChild(shopDiv);

  return shopLink;
}

// ページごとにデータを表示する関数
function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  currentIndex = startIndex; // ページが変更された際にインデックスを初期化
  const shopListContainer = document.querySelector(".shopList");
  shopListContainer.innerHTML = ""; // 以前の項目をクリア

  // 初期ロード3件を表示
  for (let i = currentIndex; i < currentIndex + initialLoadCount && i < endIndex; i++) {
    const shopElement = createShopElement(shops[i]);
    shopListContainer.appendChild(shopElement); // 店舗情報を追加
  }
  currentIndex += initialLoadCount; // 3件ロード後にインデックスを更新

  // スクロールイベントを設定
  setupScrollLoad(endIndex);
}

// スクロールで追加店舗をロードする関数
function setupScrollLoad(endIndex) {
  window.onscroll = function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      loadMoreShops(endIndex);
    }
  };
}

// 追加で店舗をロードする関数
function loadMoreShops(endIndex) {
  const shopListContainer = document.querySelector(".shopList");
  
  // 追加でロードできる最大件数は10件まで
  if (currentIndex < endIndex && currentIndex - ((currentPage - 1) * itemsPerPage) < maxLoadCount) {
    const shopElement = createShopElement(shops[currentIndex]);
    shopListContainer.appendChild(shopElement);
    currentIndex += shopIncrement; // 1件ずつ追加ロード
  } else {
    updatePagination();
  }
}

// ページネーションの更新
function updatePagination() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = "";

  // 前のボタンを生成
  if (currentPage > 1) {
    paginationHTML += `<button class="pageBtn" onclick="changePage(${currentPage - 1})"><</button>`;
  } else {
    paginationHTML += `<button class="pageBtn" disabled><</button>`;
  }

  // ページボタンを生成
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<span class="current pageBtn">${i}</span>`;
    } else {
      paginationHTML += `<button class="pageBtn" onclick="changePage(${i})">${i}</button>`;
    }
  }

  // 次のボタンを生成
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pageBtn" onclick="changePage(${currentPage + 1})">></button>`;
  } else {
    paginationHTML += `<button class="pageBtn" disabled>></button>`;
  }

  const paginationDiv = document.createElement("div");
  paginationDiv.id = "pagination";
  paginationDiv.innerHTML = paginationHTML;

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
    currentIndex = 0; // currentIndex を初期化
    window.scrollTo(0, 0); // ページの最上部にスクロール
    displayPage(currentPage); // ページ表示
  }
}

// URLのクエリパラメータからショップIDを取得し、詳細情報をAPIから取得して処理
function getDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const shopId = urlParams.get("id");

  const url = `${apiUrl}&id=${shopId}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseDetailXML(data))
    .catch((error) => console.error("Error:", error));
}

// URLのクエリパラメータからショップIDを取得し、エリア情報をAPIから取得して処理
function getArea() {
  const urlParams = new URLSearchParams(window.location.search);
  const shopId = urlParams.get("id");

  const url = `${apiUrl}&id=${shopId}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseDetailXML(data))
    .catch((error) => console.error("Error:", error));
}

// XML 文字列をパースして、ショップの詳細情報を抽出し、表示関数に渡す
function parseDetailXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const shopElement = xmlDoc.getElementsByTagName("shop")[0];

  if (shopElement) {
    const { shopid, name, access, logoImage, photo, address } = extractShopData(shopElement);
    displayDetail({ shopid, name, access, photo, address });
  } else {
    console.error("No shop details found.");
  }
}

// ショップの詳細情報を指定された HTML（#shopDetail）に表示
function displayDetail(shop) {
  const detailContainer = document.querySelector("#shopDetail");

  if (!detailContainer) {
    console.error("Detail container not found.");
    return;
  }

  detailContainer.innerHTML = `
      <div><img src="${shop.photo}" alt="Thumbnail" style="width: 200px; height: auto;"></div>
      <p><strong>Name:</strong> ${shop.name}</p>
      <p><strong>Access:</strong> ${shop.access}</p>
      <p><strong>Address:</strong> ${shop.address}</p>
    `;
}

// クエリ文字列のパラメータを更新または追加し、URLを履歴に反映
function updateQueryStringParameter(key, value) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // 既存のパラメータがある場合は値を更新し、ない場合は追加
  params.set(key, value);

  // URLを更新
  window.history.replaceState({}, "", `${url.pathname}?${params.toString()}`);
}

// セレクトボックスから選択されたエリアコードを基にURLを生成してリダイレクト
function searchAreaCode() {
  const large_area = document.querySelector("#largeSelect").value;
  const middle_area = document.querySelector("#middleSelect").value;
  const small_area = document.querySelector("#smallSelect").value;

  const baseUrl = "result.html";
  const params = new URLSearchParams();
  if (large_area != "") {
    params.set("large_area", large_area);
  }
  if (middle_area != "") {
    params.set("middle_area", middle_area);
  }
  if (small_area != "") {
    params.set("small_area", small_area);
  }
  params.set("count", 100);

  window.location.href = `${baseUrl}?${params.toString()}`;
}
