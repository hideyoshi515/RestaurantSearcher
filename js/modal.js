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
  // 基本的にスクロールを無効化
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  // User-Agentを使用してPCとモバイルを判別
  if (!/Mobi|Android/i.test(navigator.userAgent)) {
    // PCの場合（モバイルデバイスでない場合）
    // スクロールバーが消えたスペース分、右側にパディングを追加
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  const url = `${apiUrl}&id=${shopid}`;
  fetch(encodeURIComponent(url))
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

// モーダルを閉じる関数
function closeModal() {
  modal.style.display = "none"; // モーダル非表示
  if (!/Mobi|Android/i.test(navigator.userAgent)) {
    document.body.style.paddingRight = '';
  }
  document.body.style.overflow = "auto"; // スクロール再有効
}

// モーダル外クリックでモーダルを閉じる (クリックとタッチイベントの両方に対応)
window.addEventListener("click", function (event) {
  if (event.target == modal) {
    event.preventDefault();  // デフォルト動作を防止
    event.stopPropagation(); // イベント伝播を防止
    closeModal();
  }
});

// iOS用: タッチイベントでもモーダルを閉じる (タッチ終了時に処理)
window.addEventListener("touchend", function (event) {
  if (event.target == modal) {
    event.preventDefault();  // デフォルト動作を防止
    event.stopPropagation(); // イベント伝播を防止
    closeModal();
  }
}, { passive: false });

// モーダル内のクリックイベントが外部に伝播されないようにする
document.querySelector('.modal-content').addEventListener("click", function (event) {
  event.stopPropagation();
});

// モーダル内のタッチイベントが外部に伝播されないようにする (iOS用)
document.querySelector('.modal-content').addEventListener("touchend", function (event) {
  event.stopPropagation();
}, { passive: false });
