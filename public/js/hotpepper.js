let currentPage = 1; // 現在のページ番号
const itemsPerPage = 10; // 1ページに表示する最大の件数
let totalItems = 0; // 全店舗の総数
let shops = []; // 店舗データを格納する配列
let currentIndex = 0; // 現在ロードされた店舗のインデックス
const initialLoadCount = 6; // 初回に表示する店舗の件数（6件）
const maxLoadCount = 10; // スクロールで追加できる最大件数（10件まで）
const shopIncrement = 1; // スクロール時に追加ロードする店舗の件数（1件）

// URLパラメータからAPI用のURLを生成
function generateApiUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  let url = new URL(apiUrl);
  url.searchParams.append("count", "100");
  
  // 各エリア情報をパラメータに追加
  appendParamsToUrl(url, {
    range: urlParams.get("range"),
    lat: urlParams.get("lat"),
    lng: urlParams.get("lng") || urlParams.get("lon"),
    lon: urlParams.get("lon"),
    large_area: urlParams.get("large_area"),
    middle_area: urlParams.get("middle_area"),
    small_area: urlParams.get("small_area")
  });

  return url;
}

// APIに接続して結果を取得する関数
function getResult() {
  const url = generateApiUrl();
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseXML(data))
    .catch(handleError);

  const urlParams = new URLSearchParams(window.location.search);

  // エリア名をAPIから取得
  if (urlParams.has("small_area")) {
    fetchAreaName(urlParams.get("small_area"));
  } else if (urlParams.has("lat") && (urlParams.has("lng") || urlParams.has("lon"))) {
    const longitude = urlParams.get("lng") || urlParams.get("lon");
    fetchLocationInfo(urlParams.get("lat"), longitude, urlParams.get("range"));
  }
}

// エリア名を取得する関数
function fetchAreaName(smallArea) {
  let areaUrl = new URL(smallAreaNameUrl);
  areaUrl.searchParams.append("small_area", smallArea);
  fetch(proxyUrl + encodeURIComponent(areaUrl))
    .then((response) => response.text())
    .then((data) => parseXMLName(data))
    .catch(handleError)
    .finally(hideDataLoading);
}

// 緯度と経度を使用して位置情報を取得する関数
function fetchLocationInfo(lat, lng, range) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const address = data.address;
      const neighbourhood = address.neighbourhood || address.suburb;
      let rangeText = getRangeText(range);

      document.getElementById("areaName").innerHTML = `〒${address.postcode} ${neighbourhood}から${rangeText}以内`;
    })
    .catch(handleError)
    .finally(hideDataLoading);
}

// 距離範囲のテキストを取得する関数
function getRangeText(range) {
  const rangeTexts = {
    "1": "300m",
    "2": "500m",
    "3": "1,000m",
    "4": "2,000m",
    "5": "3,000m"
  };
  return rangeTexts[range] || "1,000m";
}

// XMLデータを解析する関数
function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  handleXMLData(xmlDoc);
}

// エリア名のXMLを解析する関数
function parseXMLName(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const name = xmlDoc.getElementsByTagName("name")[0].textContent;
  const small_area_code = xmlDoc.getElementsByTagName("code")[0].textContent;
  document.getElementById("areaName").innerHTML = name;
}

// XMLデータの処理
function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  displayPage(currentPage); // ページごとに最初に表示
}

// 店舗データを抽出する関数
function extractShopData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("mobile_access")[0].textContent;
  const logoImage = shop.getElementsByTagName("l")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;
  const open = shop.getElementsByTagName("open")[0].textContent;

  return { shopid, name, access, logoImage, address, open };
}

// 店舗データを生成して表示する関数
function createShopElement(shop,recent) {
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

// ページごとにデータを表示する関数
function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  currentIndex = startIndex; // ページが変更された際にインデックスを初期化
  const shopListContainer = document.querySelector(".shopList");
  shopListContainer.innerHTML = ""; // 以前の項目をクリア

  for (let i = currentIndex; i < currentIndex + initialLoadCount && i < endIndex; i++) {
    const shopElement = createShopElement(shops[i],false);
    shopListContainer.appendChild(shopElement);
  }

  currentIndex += initialLoadCount; // 6件ロード後にインデックスを更新

  // スクロールイベントの設定
  setupScrollLoad(endIndex);
}

// スクロールで追加店舗をロードする関数
function setupScrollLoad(endIndex) {
  const onScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      loadMoreShops(endIndex);
    }
  };

  window.addEventListener("scroll", onScroll);

  // 스크롤 이벤트 핸들러 해제 (필요시)
  return () => window.removeEventListener("scroll", onScroll);
}

// 追加で店舗をロードする関数
function loadMoreShops(endIndex) {
  const shopListContainer = document.querySelector(".shopList");
  if (currentIndex < endIndex && currentIndex - (currentPage - 1) * itemsPerPage < maxLoadCount) {
    const shopElement = createShopElement(shops[currentIndex],false);
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
    currentIndex = 0; // currentIndex を初期化
    window.scrollTo(0, 0); // ページの最上部にスクロール
    displayPage(currentPage); // ページ表示
  }
}

// エラー処理関数
function handleError(error) {
  console.error("Error:", error);
}

// `dataLoading` を隠す関数
function hideDataLoading() {
  const dataLoading = document.getElementById("dataLoading");
  if (dataLoading) {
    dataLoading.style.display = "none";
  }
}

// URLにパラメータを追加する関数
function appendParamsToUrl(url, params) {
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url;
}
