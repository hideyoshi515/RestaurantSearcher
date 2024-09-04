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

  const codes = [
    'Z041', // 北海道
    'Z051', // 青森
    'Z054', // 秋田
    'Z052', // 岩手
    'Z055', // 山形
    'Z053', // 宮城
    'Z056', // 福島
    'Z017', // 群馬
    'Z016', // 栃木
    'Z015', // 茨城
    'Z013', // 埼玉
    'Z014', // 千葉
    'Z011', // 東京
    'Z012', // 神奈川
    'Z061', // 新潟
    'Z062', // 富山
    'Z063', // 石川
    'Z064', // 福井
    'Z066', // 長野
    'Z031', // 岐阜
    'Z065', // 山梨
    'Z033', // 愛知
    'Z032', // 静岡
    'Z022', // 京都
    'Z021', // 滋賀
    'Z023', // 大阪
    'Z025', // 奈良
    'Z034', // 三重
    'Z026', // 和歌山
    'Z024', // 兵庫
    'Z071', // 鳥取
    'Z073', // 岡山
    'Z072', // 島根
    'Z074', // 広島
    'Z075', // 山口
    'Z082', // 香川
    'Z083', // 愛媛
    'Z081', // 徳島
    'Z084', // 高知
    'Z091', // 福岡
    'Z092', // 佐賀
    'Z093', // 長崎
    'Z095', // 大分
    'Z094', // 熊本
    'Z096', // 宮崎
    'Z097', // 鹿児島
    'Z098'  // 沖縄
  ];

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
    initialize();
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
    for (const [code, name] of Object.entries(areas)) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      middleSelect.appendChild(option);
    }
  }

  // 小エリア更新
  function populateSmallSelect(areas) {
    for (const [code, name] of Object.entries(areas)) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      smallSelect.appendChild(option);
    }
  }

  if (window.location.pathname.endsWith("index.html")) {
    largeSelect.addEventListener("change", () => {
      middleSelect.innerHTML = '<option value="">選択してください</option>';
      smallSelect.innerHTML = '<option value="">選択してください</option>';
      const largeAreaCode = largeSelect.value;
      middleSelect.disabled = false;
      smallSelect.disabled = true;
      loadMiddleAreas(largeAreaCode);
    });

    middleSelect.addEventListener("change", () => {
      smallSelect.innerHTML = '<option value="">選択してください</option>';
      const middleAreaCode = middleSelect.value;
      smallSelect.disabled = false;
      loadSmallAreas(middleAreaCode);
    });

    loadLargeAreas();
  }

  //中エリア初期時読み込み
  function initialize() {
    for (const code of codes) {
      loadMiddleAreas(code);
    }
    loadMiddleAreas('');
    console.log("initialize");
  }
});
