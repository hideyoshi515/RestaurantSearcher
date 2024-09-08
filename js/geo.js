const rangeSlider = document.getElementById("rangeSlider");
const radioButtons = document.querySelectorAll('input[name="range"]');
const locationInput = document.getElementById('locationInput');
const dataLoading = document.getElementById('dataLoading');
const getLocationBtn = document.getElementById('getLocationBtn');

// 位置情報を取得して指定されたパラメータを含むURLにリダイレクト
function showPosition(position) {
  let { latitude, longitude } = position.coords; // 位置情報オブジェクトから緯度と経度を抽出
  let test = false; // テスト用のフラグ

  if (test) {
    // テスト用東京都庁座標
    latitude = "35.689501375244";
    longitude = "139.69173371705";
  }

  // 基本的にスクロールを無効化
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  // User-Agentを使用してPCとモバイルを判別
  if (!/Mobi|Android/i.test(navigator.userAgent)) {
    // PCの場合（モバイルデバイスでない場合）
    // スクロールバーが消えたスペース分、右側にパディングを追加
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }


  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ja`;

  fetch(url)
    .then(response => response.json()) // JSONレスポンスを解析
    .then(data => {
      const { address } = data;
      const name = data.name || "none";
      const { postcode, city, neighbourhood = address.suburb } = address; // データを構造分解
      document.getElementById(
        "locationInput"
      ).value = `${postcode}, ${city}, ${neighbourhood}`;
    })
    .catch(error => console.error('位置データを取得中にエラーが発生しました:', error)) // エラーハンドリング
    .finally(() => {
      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        document.body.style.paddingRight = '';
      }
      document.body.style.overflow = 'auto'; // スクロールを再開
      dataLoading.style.display = "none";
      getLocationBtn.disabled = false;
    });
}

// 取った情報で検索
function searchPosition(position) {
  const { latitude, longitude } = position.coords; // 緯度と経度を取得
  const range = rangeSlider.value; // スライダーの値を取得
  window.location.href = `result.html?range=${range}&lat=${latitude}&lon=${longitude}&count=100`;  // 検索結果ページにリダイレクト
}

// ユーザーの位置情報取得のためGeolocation API呼び出し
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  }
}

// 検索処理
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

  locationInput.value = errorMessage[error.code] || '未知のエラーが発生しました。'; // エラーメッセージを表示
  dataLoading.style.display = "none";
  getLocationBtn.disabled = true;
}

// ラジオボタンとスライダーの同期処理
if (rangeSlider != null) {
  function syncRangeSlider() {
    const checkedRadio = document.querySelector('input[name="range"]:checked'); // チェックされたラジオボタンを取得
    if (checkedRadio) {
      rangeSlider.value = checkedRadio.value; // スライダーの値を同期
    }
  }

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", syncRangeSlider); // ラジオボタンの変更を監視
  });

  function syncRadioButtons() {
    const value = rangeSlider.value; // スライダーの値を取得
    radioButtons.forEach((radio) => {
      radio.checked = radio.value === value; // ラジオボタンを同期
    });
  }

  rangeSlider.addEventListener("input", syncRadioButtons); // スライダーの入力を監視
  syncRangeSlider();
  syncRadioButtons();
}
