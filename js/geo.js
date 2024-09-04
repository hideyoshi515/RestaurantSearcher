//現在の位置情報を取得し、指定されたパラメータを含むURLにリダイレクト
function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const range = document.querySelector('input[name="range"]:checked').value;

  const baseUrl = "result.html";
  const params = new URLSearchParams();
  params.set("range", range);
  params.set("lat", latitude);
  params.set("lng", longitude);
  params.set("count", 100);

  window.location.href = `${baseUrl}?${params.toString()}`;
}

//ユーザーの位置情報を取得するために Geolocation API を呼び出し
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
}

//位置情報の取得に失敗した場合にエラーメッセージを表示
function showError(error) {
  alert(`Error occurred: ${error.code}`);
}

//東京都庁の固定位置情報でリダイレクト
function testTokyo() {
  const locationElement = document.getElementById("location");
  window.location.href = `result.html?lat=35.689501375244&lng=139.69173371705&count=100`;
}