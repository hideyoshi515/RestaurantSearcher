// 現在の位置情報を取得し、指定されたパラメータを含むURLにリダイレクト
function showPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let test = true;

  if (test) {
    latitude = "35.689501375244";
    longitude = "139.69173371705";
  }
  const xhr = new XMLHttpRequest();
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ja`;
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText);
      const name = response.name || "none";
      const address = response.address;
      const postcode = address.postcode;
      const city = address.city;
      const neighbourhood = address.neighbourhood || address.suburb;

      document.getElementById(
        "locationInput"
      ).value = `${postcode}, ${city}, ${neighbourhood}`;
      document.getElementById("getLocationBtn").style.display = "none";
    }
  };
  xhr.send();
  /*
  const range = document.querySelector('input[name="range"]:checked').value;

  const baseUrl = "result.html";
  const params = new URLSearchParams();
  params.set("range", range);
  params.set("lat", latitude);
  params.set("lng", longitude);
  params.set("count", 100);

  window.location.href = `${baseUrl}?${params.toString()}`;*/
}

// ユーザーの位置情報を取得するために Geolocation API を呼び出し
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  }
}

// 位置情報の取得に失敗した場合にエラーメッセージを表示
function showError(error) {
  alert(`Error occurred: ${error.code}`);
}

document.addEventListener("DOMContentLoaded", () => {
  const rangeSlider = document.getElementById("rangeSlider");
  const radioButtons = document.querySelectorAll('input[name="range"]');

  if (rangeSlider != null) {
    // ラジオボタンが選択されたときにスライダーを同期する関数
    function syncRangeSlider() {
      const checkedRadio = document.querySelector(
        'input[name="range"]:checked'
      );
      if (checkedRadio) {
        rangeSlider.value = checkedRadio.value;
      }
    }

    // ラジオボタンの値が変更されたときにスライダーを同期
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", syncRangeSlider);
    });

    // スライダーの値が変更されたときにラジオボタンを同期する関数
    function syncRadioButtons() {
      const value = rangeSlider.value;
      radioButtons.forEach((radio) => {
        radio.checked = radio.value === value;
      });
    }

    // スライダーの値が変更されたときにラジオボタンを同期
    rangeSlider.addEventListener("input", syncRadioButtons);

    // 初期ロード時に同期する
    syncRangeSlider();
    syncRadioButtons();
  }
});
