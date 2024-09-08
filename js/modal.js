// モーダル関連の要素を取得
const modal = document.getElementById("detailModal"); // モーダル要素
const modalBody = document.getElementById("modalBody"); // モーダルの本文部分

// 各リンクにクリックイベントを追加
function openModal(shopid) {
  modalBody.innerHTML = `
  <div style="display:flex;justify-content: center;">
  <img src="img/loading.gif" style="padding: 10vh 0; width: 50%;">
  </div>`;

  // モーダルを表示し、スクロール無効化
  modal.style.display = "block";
  document.body.style.overflow = "hidden"; // スクロール無効
  const url = `${apiUrl}&id=${shopid}`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseModalXML(data))
    .catch((error) => console.error("Error:", error))
    .finally(() => {
    });
}

function parseModalXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  handleModalData(xmlDoc); // XMLデータ処理
}

function handleModalData(shop) {
  const shopid = shop.getElementsByTagName("id")[0].textContent;
  const name = shop.getElementsByTagName("name")[0].textContent;
  const access = shop.getElementsByTagName("mobile_access")[0].textContent;
  const logoImage = shop.getElementsByTagName("l")[0].textContent;
  const address = shop.getElementsByTagName("address")[0].textContent;
  const open = shop.getElementsByTagName("open")[0].textContent;
  const genre = shop.getElementsByTagName("genre")[0].getElementsByTagName("name")[0].textContent;
  const private_room = shop.getElementsByTagName("private_room")[0].textContent.includes("あり") ? "個室あり" : "個室なし";
  const cardCan = shop.getElementsByTagName("card")[0].textContent.includes("不可") ? "カード払い利用不可" : "カード払い利用可";
  const parking = shop.getElementsByTagName("parking")[0].textContent.includes("なし") ? "駐車不可" : "駐車可";
  const non_smoking = shop.getElementsByTagName("non_smoking")[0].textContent;
  addItemToList(`${shopid}§${name}§${access}§${logoImage}§${address}§${open}`);
  saveListToLocalStorage("shopHistory");
  // モーダルの本文更新
  modalBody.innerHTML = `
  <div>
    <div>
      <a href="https://www.hotpepper.jp/str${shopid}">
        <img class="shop-image" src="${logoImage}" alt="${name}">
      </a>
      <p class="shop-name" style="white-space: wrap">${name}</p>
      <p class="shop-access" style="white-space: wrap"> ${address}</p>
      <p class="shop-access" style="white-space: wrap"> ${access}</p>
      <p class="shop-time" style="white-space: wrap"> ${open}</p>
      </div>
      <div>
      <p class="shop-tag"> #${private_room} #${cardCan} #${parking} #${non_smoking} #${genre} #写真押すとホットペッパーへ</p>
    </div>
  </div>
`;
}

// モーダル外クリックでモーダル閉じる
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none"; // モーダル非表示
    document.body.style.overflow = "auto"; // スクロール再有効
  }
};
