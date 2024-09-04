document.addEventListener("DOMContentLoaded", () => {
    const largeSelect = document.getElementById("largeSelect");
    const middleSelect = document.getElementById("middleSelect");
    const smallSelect = document.getElementById("smallSelect");
  
    // キャッシュ
    const cache = {
      largeAreas: {},
      middleAreas: {},
      smallAreas: {}
    };
  
    // データロード
    function loadData(url, parser, key) {
      return fetch(proxyUrl + encodeURIComponent(url))
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
          const areas = data.getElementsByTagName(key);
          const result = {};
          for (let i = 0; i < areas.length; i++) {
            const code = areas[i].getElementsByTagName("code")[0].textContent;
            const name = areas[i].getElementsByTagName("name")[0].textContent;
            result[code] = name;
          }
          return result;
        })
        .catch(error => console.error(`Error fetching ${key}:`, error));
    }
  
    // 大エリアロード
    function loadLargeAreas() {
      return loadData(largeAreaUrl, "text/xml", "large_area")
        .then(data => {
          cache.largeAreas = data;
          for (const [code, name] of Object.entries(data)) {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = name;
            largeSelect.appendChild(option);
          }
        });
    }
  
    // 中エリアロード
    function loadMiddleAreas(largeAreaCode) {
      if (cache.middleAreas[largeAreaCode]) {
        populateMiddleSelect(cache.middleAreas[largeAreaCode]);
      } else {
        loadData(middleAreaUrl + largeAreaCode, "text/xml", "middle_area")
          .then(data => {
            cache.middleAreas[largeAreaCode] = data;
            populateMiddleSelect(data);
          });
      }
    }
  
    // 小エリアロード
    function loadSmallAreas(middleAreaCode) {
      if (cache.smallAreas[middleAreaCode]) {
        populateSmallSelect(cache.smallAreas[middleAreaCode]);
      } else {
        loadData(smallAreaUrl + middleAreaCode, "text/xml", "small_area")
          .then(data => {
            cache.smallAreas[middleAreaCode] = data;
            populateSmallSelect(data);
          });
      }
    }
  
    // 中エリア更新
    function populateMiddleSelect(areas) {
      middleSelect.innerHTML = '<option value="">選択してください</option>';
      smallSelect.innerHTML = '<option value="">選択してください</option>';
      middleSelect.disabled = false;
      smallSelect.disabled = true;
  
      for (const [code, name] of Object.entries(areas)) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = name;
        middleSelect.appendChild(option);
      }
    }
  
    // 小エリア更新
    function populateSmallSelect(areas) {
      smallSelect.innerHTML = '<option value="">選択してください</option>';
      smallSelect.disabled = false;
  
      for (const [code, name] of Object.entries(areas)) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = name;
        smallSelect.appendChild(option);
      }
    }
  
    if (window.location.pathname.endsWith("index.html")) {
      largeSelect.addEventListener("change", () => {
        const largeAreaCode = largeSelect.value;
        middleSelect.innerHTML = '<option value="">選択してください</option>';
        middleSelect.disabled = true;
        smallSelect.innerHTML = '<option value="">選択してください</option>';
        smallSelect.disabled = true;
        loadMiddleAreas(largeAreaCode);
      });
  
      middleSelect.addEventListener("change", () => {
        const middleAreaCode = middleSelect.value;
        smallSelect.innerHTML = '<option value="">選択してください</option>';
        smallSelect.disabled = true;
        loadSmallAreas(middleAreaCode);
      });
  
      loadLargeAreas();
    }
  });
  