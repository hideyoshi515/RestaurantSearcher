let recentHistory = []; // 最近の履歴データを保存する配列
let historyIndex = 0; // 最近の履歴配列のインデックス
const historyLoadCount = 4; // 一度にロードする履歴の件数
const maxHistoryLoadCount = 20; // 最大表示する履歴の件数
const rangeSlider = document.getElementById("rangeSlider");
const radioButtons = document.querySelectorAll('input[name="range"]');
const locationInput = document.getElementById('locationInput');
const dataLoading = document.getElementById('dataLoading');
const getLocationBtn = document.getElementById('getLocationBtn');

// 位置情報を取得して指定されたパラメータを含むURLにリダイレクト
function showPosition(position) {
  let { latitude, longitude } = position.coords; // 位置情報オブジェクトから値を抽出
  let test = false;

  if (test) {
    //テスト用東京都庁座標
    latitude = "35.689501375244";
    longitude = "139.69173371705";
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ja`;

  fetch(url)
    .then(response => response.json()) // JSONレスポンス解析
    .then(data => {
      const { address } = data;
      const name = data.name || "none";
      const { postcode, city, neighbourhood = address.suburb } = address; // データの構造分解
      document.getElementById(
        "locationInput"
      ).value = `${postcode}, ${city}, ${neighbourhood}`;
    })
    .catch(error => console.error('位置データを取得中にエラーが発生しました:', error)) // エラーハンドリング追加
    .finally(() => {
      dataLoading.style.display = "none";
      getLocationBtn.disabled = false;
    });
}

//取った情報で検索
function searchPosition(position) {
  const { latitude, longitude } = position.coords;
  const range = rangeSlider.value;
  window.location.href = `result.html?range=${range}&lat=${latitude}&lon=${longitude}&count=100`;  // 小エリア選択時の処理
}

// ユーザーの位置情報取得のためGeolocation API呼び出し
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  }
}

function searchLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(searchPosition, showError);
  }
}

// 位置情報取得に失敗した場合エラーメッセージ表示
function showError(error) {
  const errorMessage = {
    1: '位置情報が許可されていません。',
    2: '位置情報が取得できませんでした。',
    3: 'タイムアウトが発生しました。'
  };

  locationInput.value = errorMessage[error.code] || '未知のエラーが発生しました。';
  dataLoading.style.display = "none";
  getLocationBtn.disabled = true;
}

if (rangeSlider != null) {
  // ラジオボタン選択時スライダー同期関数
  function syncRangeSlider() {
    const checkedRadio = document.querySelector('input[name="range"]:checked');
    if (checkedRadio) {
      // スライダーとラジオボタンの同期処理
      rangeSlider.value = checkedRadio.value;
    }
  }

  // ラジオボタン値変更時スライダー同期
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", syncRangeSlider);
  });

  // スライダー値変更時ラジオボタン同期関数
  function syncRadioButtons() {
    const value = rangeSlider.value;
    radioButtons.forEach((radio) => {
      radio.checked = radio.value === value;
    });
  }

  // スライダー値変更時ラジオボタン同期
  rangeSlider.addEventListener("input", syncRadioButtons);

  // 初期ロード時同期
  syncRangeSlider();
  syncRadioButtons();
}
// 最近の履歴データをロードして表示する関数
function loadRecentHistory() {
  const shopHistory = loadListFromLocalStorage("shopHistory");

  recentHistory = shopHistory.getList(); // 保存された最近の履歴を取得
  historyIndex = 0; // インデックスを初期化

  // 初めに表示する履歴をロード
  displayRecentHistory();
}

// 最近の履歴を画面に表示する関数
function displayRecentHistory() {
  const historiesDiv = document.getElementById("historyDiv");

  // 最大20件を表示する
  let itemsToDisplay = Math.min(historyLoadCount, recentHistory.length - historyIndex);

  for (let i = historyIndex; i < historyIndex + itemsToDisplay && i < recentHistory.length; i++) {
    const shopElement = createShopElement(recentHistory[i], true);
    historiesDiv.appendChild(shopElement);
  }

  historyIndex += itemsToDisplay; // インデックスを更新

  // 最大件数に達した場合にメッセージを表示
  if (historyIndex >= Math.min(maxHistoryLoadCount, recentHistory.length)) {
    const message = document.createElement("span");
    message.textContent = `最大 ${maxHistoryLoadCount}件まで表示されています`;
    message.classList.add("info-message");
    historiesDiv.appendChild(message);
  }
}

// スクロールで追加履歴をロードする関数
function setupScrollLoadRecentHistory() {
  const onScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      if (historyIndex < recentHistory.length && historyIndex < maxHistoryLoadCount) {
        displayRecentHistory();
      }
    }
  };

  window.addEventListener("scroll", onScroll);

  // スクロールイベントハンドラーの解除（必要に応じて）
  return () => window.removeEventListener("scroll", onScroll);
}

// ページロード時に最近の履歴をロードして無限スクロールを設定
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("index.html")) {
    loadRecentHistory(); // 最近の履歴をロード
    setupScrollLoadRecentHistory(); // 無限スクロールを設定
  }
});
