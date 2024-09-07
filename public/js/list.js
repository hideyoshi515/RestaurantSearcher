// 最大サイズを指定
const MAX_SIZE = 20;
const storageKey = 'shopHistory'; // ストレージキーを指定

// サイズ制限があるListクラスを定義
class OrderedLimitedList {
    constructor(maxSize) {
        this.maxSize = maxSize;  // 最大サイズを設定
        this.list = [];  // 順序を保持するための配列
    }

    // アイテムを追加するメソッド
    add(item) {
        const index = this.list.indexOf(item);
        if (index === -1) {
            // アイテムがリストに存在しない場合、リストに追加
            this.list.push(item);

            // サイズ制限を超えた場合は最も古いアイテムを削除
            if (this.list.length > this.maxSize) {
                this.list.shift();  // 最も古いアイテムを削除
            }
        } else {
            // アイテムが既に存在する場合、リスト内での位置を更新
            this.list.splice(index, 1);
            this.list.push(item);
        }
    }

    // リストからアイテムを削除するメソッド
    remove(item) {
        const index = this.list.indexOf(item);
        if (index !== -1) {
            this.list.splice(index, 1);
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
    myList.add(item);
}

// リストをlocalStorageに保存する関数
function saveListToLocalStorage() {
    // 既存のデータを取得
    const existingData = localStorage.getItem(storageKey);
    
    // 既存のデータを配列に変換
    let existingList = [];
    if (existingData) {
        existingList = JSON.parse(existingData);
    }

    // 現在のリストのデータを取得
    const newData = myList.getList();
    
    // 現在のリストのデータを追加
    newData.forEach(item => {
        if (!existingList.includes(item)) {
            if (existingList.length >= MAX_SIZE) {
                existingList.shift(); // サイズ制限を超えた場合は最も古いアイテムを削除
            }
            existingList.push(item); // 新しいアイテムを追加
        }
    });

    // 更新されたリストをJSON文字列に変換してlocalStorageに保存
    localStorage.setItem(storageKey, JSON.stringify(existingList)); 
}

// localStorageからリストをロードする関数
function loadListFromLocalStorage() {
    const data = localStorage.getItem(storageKey);
    if (data) {
        const parsedData = JSON.parse(data);  // JSON文字列を配列に変換
        // 既存のOrderedLimitedListを更新
        myList = new OrderedLimitedList(MAX_SIZE);
        parsedData.forEach(item => myList.add(item));  // 既存データをリストに追加
    } else {
        myList = new OrderedLimitedList(MAX_SIZE); // データがなければ空のリストを作成
    }
    return myList;
}

// ページが読み込まれたときにリストをロードする
window.onload = function() {
    loadListFromLocalStorage();  // ページローディング時にデータをロード
};
