function switchTab(event, tabName) {
  // タブコンテンツを隠す
  let i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // タブリンクの非アクティブ化
  tablinks = document.getElementsByClassName("tab");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  // クリックされたタブをアクティブ化し、内容を表示
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.classList.add("active");

  // スライダーを移動
  const slider = document.querySelector(".tab-slider");
  const activeTab = event.currentTarget;
  slider.style.width = activeTab.offsetWidth + "px";
  slider.style.left = activeTab.offsetLeft + "px";

  const areaDiv = document.getElementById("areaDiv");
  areaDiv.style.display = "none";
}

// ページの読み込み時に最初のタブをアクティブにする
document.getElementsByClassName("tab")[0].click();
