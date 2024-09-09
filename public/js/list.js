// 最大サイズを指定
const MAX_SIZE = 20;
const storageKey = 'shopHistory'; // ストレージキーを指定

// サイズ制限があるリストクラス
class OrderedLimitedList {
    constructor(maxSize) {
        this.maxSize = maxSize;  // リストの最大サイズを設定
        this.list = [];  // アイテムを保持するための配列
    }

    // アイテムをリストに追加するメソッド
    add(item) {
        const index = this.list.indexOf(item);
        if (index === -1) {
            // アイテムがリストに存在しない場合は追加
            this.list.push(item);

            // サイズ制限を超えた場合は最も古いアイテムを削除
            if (this.list.length > this.maxSize) {
                this.list.shift();  // 最も古いアイテムを削除
            }
        } else {
            // 既存のアイテムがある場合、その位置を更新
            this.list.splice(index, 1);
            this.list.push(item);
        }
    }

    // リストからアイテムを削除するメソッド
    remove(item) {
        const index = this.list.indexOf(item);
        if (index !== -1) {
            this.list.splice(index, 1); // アイテムをリストから削除
        }
    }

    // リストを取得するメソッド
    getList() {
        return this.list.slice();  // リストのコピーを返す
    }
}

// 新しい制限付きのリストを作成
let myList = new OrderedLimitedList(MAX_SIZE);

// リストにアイテムを追加する関数
function addItemToList(item) {
    myList.add(item); // リストにアイテムを追加
}

// リストをlocalStorageに保存する関数
function saveListToLocalStorage() {
    const existingData = localStorage.getItem(storageKey); // 既存データを取得

    let existingList = [];
    if (existingData) {
        existingList = JSON.parse(existingData); // 既存データを配列に変換
    }

    const newData = myList.getList(); // 現在のリストを取得

    newData.forEach(item => {
        if (!existingList.includes(item)) {
            if (existingList.length >= MAX_SIZE) {
                existingList.shift(); // サイズ制限を超えた場合は古いデータを削除
            }
            existingList.push(item); // 新しいアイテムを追加
        }
    });

    localStorage.setItem(storageKey, JSON.stringify(existingList)); // localStorageに保存
}

// localStorageからリストをロードする関数
function loadListFromLocalStorage() {
    const data = localStorage.getItem(storageKey); // localStorageからデータを取得
    if (data) {
        const parsedData = JSON.parse(data);  // JSONデータをパース
        myList = new OrderedLimitedList(MAX_SIZE); // 新しいリストを作成
        parsedData.forEach(item => myList.add(item));  // データをリストに追加
    } else {
        myList = new OrderedLimitedList(MAX_SIZE); // データがなければ空のリストを作成
    }
    return myList;
}

// ページが読み込まれたときにリストをロードする
window.onload = function () {
    loadListFromLocalStorage();  // ページローディング時にデータをロード
};
