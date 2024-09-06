// モーダル関連の要素を取得
const modal = document.getElementById("detailModal"); // モーダル要素
const modalBody = document.getElementById("modalBody"); // モーダルの本文部分

// 各リンクにクリックイベントを追加
function openModal(shopid) {
  const loading = document.getElementById("loading");
  modalBody.innerHTML = `
  <div style="display:flex;justify-content: center;">
  <img src="img/loading.gif" style="padding: 10vh 0; width: 50%;">
  </div>`;
  modal.style.display = "block"; // モーダルを表示

  const url = `${apiUrl}&id=${shopid}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseModalXML(data))
    .catch((error) => console.error("Error:", error))
    .finally(() => {
      loading.style.display = "none";
    }); 
}

function parseModalXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  handleModalData(xmlDoc);
}

function handleModalData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("mobile_access")[0].textContent;
  const logoImage = shop.getElementsByTagName("l")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;
  const open = shop.getElementsByTagName("open")[0].textContent;
  const private_room = shop
    .getElementsByTagName("private_room")[0]
    .textContent.includes("あり")
    ? "個室あり"
    : "個室なし";
  const cardCan = shop
    .getElementsByTagName("card")[0]
    .textContent.includes("不可")
    ? "カード払い利用不可"
    : "カード払い利用可";

  modalBody.innerHTML = `
  <div>
    <div>
        <img class="shop-image" src="${logoImage}" alt="${name}"">
        <p class="shop-name">${name}</p>
        <p class="shop-access"> ${address}</p>
        <p class="shop-access"> ${access}</p>
        <p class="shop-time"> ${open}</p>
    </div>
    <div>
        <p class="shop-tag"> #${private_room} #${cardCan}</p>
    </div>
  </div>
`;
}

// モーダル外をクリックした時にモーダルを閉じる処理
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none"; // モーダルを非表示にする
  }
};
