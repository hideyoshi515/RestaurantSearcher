let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;
let shops = [];

//Result.htmlに表示するためAPIに接続とフォールバック
function getResult() {
  const urlParams = new URLSearchParams(window.location.search);
  let url = new URL(apiUrl);
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
  } else {
    url =
      apiUrl + "&lat=35.689501375244&lng=139.69173371705&count=100&count=100";
  }
  if (urlParams.has("middle_area")) {
    url.searchParams.append("middle_area", urlParams.get("middle_area"));
  }
  if (urlParams.has("small_area")) {
    url.searchParams.append("small_area", urlParams.get("small_area"));
  }
  url.searchParams.append("count", "100");

  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseXML(data))
    .catch((error) => console.error("Error:", error));
}

function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  handleXMLData(xmlDoc);
}

function parseDetailXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  const { shopid, name, access, logoImage, image, address } = extractShopData(
    shops[0]
  );
}

//xmlデータ処理
function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  displayPage(currentPage);
}

//xmlからデータ抽出
function extractShopData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("access")[0].textContent;
  const logoImage = shop.getElementsByTagName("s")[0].textContent;
  const photo = shop.getElementsByTagName("l")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;

  return {
    shopid,
    name,
    access,
    logoImage,
    photo,
    address,
  };
}

//ページによりデータ表示
function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const tableBody = document.querySelector("#shopTable .shopList");
  tableBody.innerHTML = "";

  for (let i = startIndex; i < endIndex; i++) {
    const shop = shops[i];

    // extractShopData データ抽出
    const { shopid, name, access, logoImage } = extractShopData(shop);

    // 各行をリンクで囲み
    const row = document.createElement("a");
    row.href = `detail.html?id=${shopid}`;
    row.classList.add("shop-row");
    row.style.textDecoration = "none";
    row.style.color = "inherit";

    // サムネール
    const thumbnailCell = document.createElement("div");
    thumbnailCell.classList.add("shop-img-cell");
    const img = document.createElement("img");
    img.src = logoImage;
    img.alt = "Thumbnail";
    img.style.width = "100px";
    img.style.height = "auto";
    thumbnailCell.appendChild(img);
    row.appendChild(thumbnailCell);

    // 店舗名
    const nameCell = document.createElement("div");
    nameCell.classList.add("shop-cell");
    nameCell.textContent = name;
    row.appendChild(nameCell);

    // アクセス情報
    const accessCell = document.createElement("div");
    accessCell.classList.add("shop-cell");
    accessCell.innerHTML = access;
    row.appendChild(accessCell);

    tableBody.appendChild(row);
  }

  updatePagination();
}

//ページネーション
function updatePagination() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = "";

  // 前ボタンを生成
  if (currentPage > 1) {
    paginationHTML += `<button class="pageBtn" onclick="changePage(${
      currentPage - 1
    })">前へ</button>`;
  } else {
    paginationHTML += `<button class="pageBtn" disabled>前へ</button>`;
  }

  // ページボタンを生成
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<span class="current pageBtn">${i}</span>`;
    } else {
      paginationHTML += `<button class="pageBtn" onclick="changePage(${i})">${i}</button>`;
    }
  }

  // 次ボタンを生成
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pageBtn" onclick="changePage(${
      currentPage + 1
    })">次へ</button>`;
  } else {
    paginationHTML += `<button class="pageBtn" disabled>次へ</button>`;
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

//ページ移動
function changePage(page) {
  if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
    currentPage = page;
    displayPage(currentPage);
  }
}

//URLのクエリパラメータからショップIDを取得し、詳細情報をAPIから取得して処理
function getDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const shopId = urlParams.get("id");

  const url = `${apiUrl}&id=${shopId}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseDetailXML(data))
    .catch((error) => console.error("Error:", error));
}

//URLのクエリパラメータからショップIDを取得し、エリア情報をAPIから取得して処理
function getArea() {
  const urlParams = new URLSearchParams(window.location.search);
  const shopId = urlParams.get("id");

  const url = `${apiUrl}&id=${shopId}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseDetailXML(data))
    .catch((error) => console.error("Error:", error));
}

//XML 文字列をパースして、ショップの詳細情報を抽出し、表示関数に渡す
function parseDetailXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const shopElement = xmlDoc.getElementsByTagName("shop")[0];

  if (shopElement) {
    const { shopid, name, access, logoImage, photo, address } = extractShopData(
      shopElement
    );

    displayDetail({ shopid, name, access, photo, address });
  } else {
    console.error("No shop details found.");
  }
}

//ショップの詳細情報を指定された HTML（#shopDetail）に表示
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

//クエリ文字列のパラメータを更新または追加し、URLを履歴に反映
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
