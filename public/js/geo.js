// 位置情報を取得して指定されたパラメータを含むURLにリダイレクト
function showPosition(position) {
  let { latitude, longitude } = position.coords; // 位置情報オブジェクトから値を抽出
  let test = false;

  if (test) {
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
      document.getElementById("getLocationBtn").style.display = "none";
    })
    .catch(error => console.error('Error fetching location data:', error)); // エラーハンドリング追加
}

// ユーザーの位置情報取得のためGeolocation API呼び出し
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  }
}

// 位置情報取得に失敗した場合エラーメッセージ表示
function showError(error) {
  const errorMessage = {
    1: '位置情報が許可されていません。',
    2: '位置情報が取得できませんでした。',
    3: 'タイムアウトが発生しました。'
  };
  alert(errorMessage[error.code] || '未知のエラーが発生しました。');
}

// スライダーとラジオボタンの同期処理
const rangeSlider = document.getElementById("rangeSlider");
const radioButtons = document.querySelectorAll('input[name="range"]');

if (rangeSlider != null) {
  // ラジオボタン選択時スライダー同期関数
  function syncRangeSlider() {
    const checkedRadio = document.querySelector('input[name="range"]:checked');
    if (checkedRadio) {
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

// `index.html`ページで履歴を表示する処理
if (location.href.indexOf("index.html") > 0) {
  const historiesDiv = document.getElementById("historyDiv");
  const shopHistory = loadListFromLocalStorage("shopHistory");
  shopHistory.getList().forEach((element) => {
    const [areaName, areaCode, searchRange] = element.split(":"); // 構造分解使用

    const searchLink = document.createElement("a");
    searchLink.style.textDecoration = "none"; // テキスト装飾削除
    searchLink.style.color = "inherit"; // テキストカラー継承

    const historyDiv = document.createElement("div");
    historyDiv.classList.add("shopHistories");
    if (searchRange > 5) {
      console.log(`${areaName} 周辺 ${areaCode}`);
      searchLink.href = `result.html?small_area=${areaCode}&count=100`;
      historyDiv.innerHTML = `${areaName} 周辺`;
    } else {
      searchLink.href = `result.html?range=${searchRange}&${areaCode}&count=100`;
      const rangeMapping = {
        1: "300m",
        2: "500m",
        3: "1,000m",
        4: "2,000m",
        5: "3,000m",
      };
      const range = rangeMapping[searchRange] || "1,000m"; // 範囲マッピング最適化
      console.log(`${areaName} ${range}以内`);
      historyDiv.innerHTML = `${areaName} ${range}以内`;
    }
    searchLink.appendChild(historyDiv);
    historiesDiv.appendChild(searchLink);
  });
}
