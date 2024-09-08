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

  // スクロールを無効化 (スクロールを一時的に止める)
  document.body.style.overflow = 'hidden';
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
      document.body.style.overflow = 'auto';
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

// ラジオボタンとスライダーの同期処理
if (rangeSlider != null) {
  function syncRangeSlider() {
    const checkedRadio = document.querySelector('input[name="range"]:checked');
    if (checkedRadio) {
      rangeSlider.value = checkedRadio.value;
    }
  }

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", syncRangeSlider);
  });

  function syncRadioButtons() {
    const value = rangeSlider.value;
    radioButtons.forEach((radio) => {
      radio.checked = radio.value === value;
    });
  }

  rangeSlider.addEventListener("input", syncRadioButtons);
  syncRangeSlider();
  syncRadioButtons();
}
