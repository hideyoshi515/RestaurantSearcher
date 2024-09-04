const proxyUrl = "https://corsproxy.io/?";
const apiUrl =
  "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=2957e45352f97570";

let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;
let shops = [];

function getResult() {
  const urlParams = new URLSearchParams(window.location.search);
  const range = urlParams.get("range");
  const latitude = urlParams.get("lat");
  const longitude = urlParams.get("lng");

  let url = `${apiUrl}&lat=${latitude}&lng=${longitude}&range=${range}&count=100`;
  url = apiUrl + "&lat=35.689501375244&lng=139.69173371705&count=100&count=100";
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
  const { shopid, name, access, logoImage, address } = extractShopData(
    shops[0]
  );
}

function handleXMLData(xmlDoc) {
  const shopElements = xmlDoc.getElementsByTagName("shop");
  totalItems = shopElements.length;
  shops = Array.from(shopElements);
  displayPage(currentPage);
}

function extractShopData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("access")[0].textContent;
  const logoImage = shop.getElementsByTagName("logo_image")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;

  return {
    shopid,
    name,
    access,
    logoImage,
    address,
  };
}

function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const tableBody = document.querySelector("#shopTable .shopList");
  tableBody.innerHTML = "";

  for (let i = startIndex; i < endIndex; i++) {
    const shop = shops[i];

    // extractShopData 메소드를 사용하여 데이터 추출
    const { shopid, name, access, logoImage } = extractShopData(shop);

    // 각 행을 링크로 감싸기
    const row = document.createElement("a");
    row.href = `detail.html?id=${shopid}`;
    row.classList.add("shop-row");
    row.style.textDecoration = "none"; // 링크 스타일 제거
    row.style.color = "inherit"; // 링크 색상 제거

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

function changePage(page) {
  if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
    currentPage = page;
    displayPage(currentPage);
  }
}

function getDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const shopId = urlParams.get("id");

  const url = `${apiUrl}&id=${shopId}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseDetailXML(data))
    .catch((error) => console.error("Error:", error));
}

function parseDetailXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const shopElement = xmlDoc.getElementsByTagName("shop")[0];

  if (shopElement) {
    const { shopid, name, access, logoImage, address } = extractShopData(
      shopElement
    );

    displayDetail({ shopid, name, access, logoImage, address });
  } else {
    console.error("No shop details found.");
  }
}

function displayDetail(shop) {
    const detailContainer = document.querySelector("#shopDetail");
    
    if (!detailContainer) {
      console.error("Detail container not found.");
      return;
    }
  
    detailContainer.innerHTML = `
      <h1>${shop.name}</h1>
      <div><img src="${shop.logoImage}" alt="Thumbnail" style="width: 200px; height: auto;"></div>
      <p><strong>ID:</strong> ${shop.shopid}</p>
      <p><strong>Access:</strong> ${shop.access}</p>
      <p><strong>Address:</strong> ${shop.address}</p>
    `;
  }