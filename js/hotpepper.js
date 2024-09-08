let shops = []; // 店舗データを格納する配列

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

// XMLデータの処理
function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  displayPage(currentPage); // ページごとに最初に表示
}

// エラー処理関数
function handleError(error) {
  console.error("Error:", error);
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

// ローディング画面を非表示にする関数
function hideDataLoading() {
  const dataLoading = document.getElementById("dataLoading");
  if (dataLoading) {
    dataLoading.style.display = "none";
  }
}

// XMLデータから店舗名を解析して表示する関数
function parseXMLName(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const name = xmlDoc.getElementsByTagName("name")[0].textContent;
  document.getElementById("areaName").innerHTML = name;
}

// ページごとに店舗データを表示する関数
function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  currentIndex = startIndex; // ページが変更された際にインデックスを初期化
  const shopListContainer = document.querySelector(".shopList");
  shopListContainer.innerHTML = ""; // 以前の店舗データをクリア

  // 表示する範囲内の店舗データを生成してリストに追加
  for (let i = currentIndex; i < currentIndex + initialLoadCount && i < endIndex; i++) {
    const shopElement = createShopElement(shops[i], false);
    shopListContainer.appendChild(shopElement);
  }

  currentIndex += initialLoadCount; // ロード後にインデックスを更新

  // スクロール終端の感知を設定
  setupScrollLoad();
}

// XMLデータから店舗情報を抽出する関数
function extractShopData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("mobile_access")[0].textContent;
  const logoImage = shop.getElementsByTagName("l")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;
  const open = shop.getElementsByTagName("open")[0].textContent;

  return { shopid, name, access, logoImage, address, open };
}
