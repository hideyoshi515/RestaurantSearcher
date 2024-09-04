
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

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
}

function showError(error) {
  alert(`Error occurred: ${error.code}`);
}

function testTokyo() {
  const locationElement = document.getElementById("location");
  let url = `${apiUrl}&lat=35.689501375244&lng=139.69173371705`;
  fetch(proxyUrl + encodeURIComponent(url))
    .then((response) => response.text())
    .then((data) => parseXML(data))
    .catch((error) => console.error("Error:", error));
}
