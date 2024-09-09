let shops = []; // 店舗データを格納する配列

// URLパラメータからAPI用のURLを生成
function generateApiUrl() {
  const urlParams = new URLSearchParams(window.location.search); // URLパラメータを取得
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
    small_area: urlParams.get("small_area"),
    name_any: urlParams.get("name_any")
  });

  return url;
}

// APIに接続して結果を取得する関数
function getResult() {
  const url = generateApiUrl(); // APIのURLを生成
  fetch(encodeURIComponent(url)) // APIリクエストを送信
    .then((response) => response.text())
    .then((data) => parseXML(data)) // XMLレスポンスを解析
    .catch(handleError); // エラー処理

  const urlParams = new URLSearchParams(window.location.search); // パラメータを取得

  // エリア名をAPIから取得
  if (urlParams.has("small_area")) {
    fetchAreaName(urlParams.get("small_area"));
  } else if (urlParams.has("lat") && (urlParams.has("lng") || urlParams.has("lon"))) {
    const longitude = urlParams.get("lng") || urlParams.get("lon");
    fetchLocationInfo(urlParams.get("lat"), longitude, urlParams.get("range"));
  } if (urlParams.has("name_any")) {
    fetchShopName(urlParams.get("name_any"));
  }
}

// お店名を取得する関数
function fetchShopName(shopName) {
  let areaUrl = new URL(apiUrl); // お店名取得用のURLを作成
  areaUrl.searchParams.append("name_any", shopName);
  fetch(encodeURIComponent(areaUrl))
    .then((response) => response.text())
    .then((data) => { 
      parseXML(data); 
      document.getElementById("areaName").innerHTML = `「${shopName}」検索結果`;
    }) // XMLレスポンスを解析
    .catch(handleError) // エラーハンドリング
    .finally(hideDataLoading); // ローディング表示を終了
}

// エリア名を取得する関数
function fetchAreaName(smallArea) {
  let areaUrl = new URL(smallAreaNameUrl); // エリア名取得用のURLを作成
  areaUrl.searchParams.append("small_area", smallArea);
  fetch(encodeURIComponent(areaUrl))
    .then((response) => response.text())
    .then((data) => parseXMLName(data)) // XMLレスポンスを解析
    .catch(handleError) // エラーハンドリング
    .finally(hideDataLoading); // ローディング表示を終了
}

// 緯度と経度を使用して位置情報を取得する関数
function fetchLocationInfo(lat, lng, range) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja`;
  fetch(url)
    .then((response) => response.json()) // JSONレスポンスを解析
    .then((data) => {
      const address = data.address;
      const neighbourhood = address.neighbourhood || address.suburb; // 近隣エリア名を取得
      let rangeText = getRangeText(range); // 範囲テキストを取得

      document.getElementById("areaName").innerHTML = `〒${address.postcode} ${neighbourhood}から${rangeText}以内`;
    })
    .catch(handleError)
    .finally(hideDataLoading); // ローディング表示を終了
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
  return rangeTexts[range] || "1,000m"; // デフォルトは1,000m
}

// XMLデータを解析する関数
function parseXML(xmlString) {
  const parser = new DOMParser(); // DOMParserを使用してXMLを解析
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  handleXMLData(xmlDoc); // XMLデータを処理
}

// XMLデータの処理
function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop"); // 店舗情報を取得
  totalItems = shopElements.length;
  shops = Array.from(shopElements); // 店舗データを配列に変換
  displayPage(currentPage); // ページごとに最初の店舗情報を表示
}

// エラー処理関数
function handleError(error) {
  console.error("Error:", error); // コンソールにエラーを表示
}

// URLにパラメータを追加する関数
function appendParamsToUrl(url, params) {
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.append(key, params[key]); // 有効なパラメータをURLに追加
    }
  });
  return url;
}

// ローディング画面を非表示にする関数
function hideDataLoading() {
  const dataLoading = document.getElementById("dataLoading");
  if (dataLoading) {
    dataLoading.style.display = "none"; // ローディング画面を非表示
  }
}

// XMLデータから店舗名を解析して表示する関数
function parseXMLName(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const name = xmlDoc.getElementsByTagName("name")[0].textContent; // 店舗名を取得
  document.getElementById("areaName").innerHTML = name; // 店舗名を表示
}

// ページごとに店舗データを表示する関数
function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage; // 開始インデックスを計算
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems); // 終了インデックスを計算

  currentIndex = startIndex; // 現在のインデックスを初期化
  const shopListContainer = document.querySelector(".shopList");
  shopListContainer.innerHTML = ""; // 前の店舗データをクリア

  // 指定範囲内の店舗データを生成してリストに追加
  for (let i = currentIndex; i < currentIndex + initialLoadCount && i < endIndex; i++) {
    const shopElement = createShopElement(shops[i], false); // 店舗要素を生成
    shopListContainer.appendChild(shopElement); // リストに追加
  }

  currentIndex += initialLoadCount; // ロード後にインデックスを更新

  // スクロール終端の感知を設定
  setupScrollLoad();
}

// XMLデータから店舗情報を抽出する関数
function extractShopData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent; // 店舗IDを取得
  const name = shop.getElementsByTagName("name")[0].textContent; // 店舗名を取得
  const access = shop.getElementsByTagName("mobile_access")[0].textContent; // アクセス情報を取得
  const logoImage = shop.getElementsByTagName("l")[0].textContent; // ロゴ画像を取得
  const address = shop.getElementsByTagName("address")[0].textContent; // 住所を取得
  const open = shop.getElementsByTagName("open")[0].textContent; // 営業時間を取得

  return { shopid, name, access, logoImage, address, open }; // 店舗データを返す
}
