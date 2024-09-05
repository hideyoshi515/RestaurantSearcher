let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;
let shops = [];

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

// xmlデータ処理
function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  displayPage(currentPage);
}

// xmlからデータ抽出
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

  // 店舗全体のdivを作成
  const shopDiv = document.createElement("div");
  shopDiv.classList.add("shop");

  // 店舗の画像を作成して追加
  const shopImage = document.createElement("img");
  shopImage.src = logoImage;
  shopImage.classList.add("shop-image");
  shopImage.alt = "Shop Image";
  shopDiv.appendChild(shopImage);

  // 店舗情報の内容を表示するdivを作成
  const shopContentDiv = document.createElement("div");
  shopContentDiv.classList.add("shop-content");

  // 店舗名を追加
  const shopName = document.createElement("p");
  shopName.classList.add("shop-name");
  shopName.textContent = name;
  shopContentDiv.appendChild(shopName);

  // アクセス情報を追加
  const shopAccess = document.createElement("p");
  shopAccess.classList.add("shop-access");
  shopAccess.innerHTML = access;
  shopContentDiv.appendChild(shopAccess);

  // 営業時間をフォーマットして追加
  const shopTime = document.createElement("p");
  shopTime.classList.add("shop-time");
  shopTime.innerHTML = formatOperatingHours(open);
  shopContentDiv.appendChild(shopTime);

  // 全ての内容をshopDivに追加
  shopDiv.appendChild(shopContentDiv);

  // shopDivをaタグに追加
  shopLink.appendChild(shopDiv);

  return shopLink;
}

// ページごとにデータを表示する関数
function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const tableBody = document.querySelector("#shopTable .shopList");
  tableBody.innerHTML = "";

  for (let i = startIndex; i < endIndex; i++) {
    const shop = shops[i];
    const shopDiv = createShopElement(shop);
    tableBody.appendChild(shopDiv); // 店舗情報をテーブルに追加
  }

  updatePagination(); // ページネーションの更新
}

// ページネーション
function updatePagination() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = "";

  // 前ボタンを生成
  if (currentPage > 1) {
    paginationHTML += `<button class="pageBtn" onclick="changePage(${
      currentPage - 1
    })"><</button>`;
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

  // 次ボタンを生成
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pageBtn" onclick="changePage(${
      currentPage + 1
    })">></button>`;
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

// ページ移動
function changePage(page) {
  if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
    currentPage = page;
    displayPage(currentPage);
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
    const { shopid, name, access, logoImage, photo, address } = extractShopData(
      shopElement
    );

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
