// ドラッグしているかを判定する
let isMouseDown = false;
// マウスカーソルの移動判定時に直前の座標を入れておく

let beforePos = { top: 0, left: 0 };
// mousedown処理
$("#piece").on('mousedown', function (e) {
    // mousedown検知してフラグ変更
    isMouseDown = true;
    console.log('isMouseDown', isMouseDown);
    // 押された瞬間のマウス座標を保存
    beforePos.top = e.pageY;
    beforePos.left = e.pageX;
    console.log("beforePos", beforePos);
    // 確認用に現在の要素の座標を表示
    const pos = $("#piece").offset();
    console.log("pos", pos);
});
$("#piece").on('mousemove', function (e) {
    if (isMouseDown) {
        // マウスが動いた時の現在のマウス座標取得
        const currentPos = { top: e.pageY, left: e.pageX };
        // 現在の要素の座標取得
        const pos = $("#piece").offset();
        // マウスの座標差分で動いた距離を計算し、その分要素を動かす
        $("#piece").offset({
            top: pos.top + currentPos.top - beforePos.top,
            left: pos.left + currentPos.left - beforePos.left
        });
        // 動かし終わったので直前座標を現在座標に更新する
        if (beforePos !== currentPos) {
            beforePos = currentPos;
        }
    }
});
$("#piece").on('mouseup', function () {
    isMouseDown = false;
    console.log('isMouseDown', isMouseDown);
    console.log('mouseup');
});
$("#piece").on('mouseout', function (e) {
    console.log('mouseout');
    // 急に動いて要素からカーソルが外れたとき用
    // mousemoveと同じなので後で関数化する
    if (isMouseDown) {
        const currentPos = { top: e.pageY, left: e.pageX };
        const pos = $("#piece").offset();
        $("#piece").offset({
            top: pos.top + currentPos.top - beforePos.top,
            left: pos.left + currentPos.left - beforePos.left
        });
        if (beforePos !== currentPos) {
            beforePos = currentPos;
        }
    }
});

$('#save').on('click', function () {
    console.log("保存押された");
    const pos = $("#piece").offset();
    console.log("pos", pos);
    const json = JSON.stringify(pos);
    console.log("json", json);
    localStorage.setItem('memo', json);
});
$("#clear").on('click', function () {
    localStorage.removeItem('memo');
    console.log("ローカルストレージ削除");
    $("#piece").offset({
        top: 0,
        left: 0
    });
});
if (localStorage.getItem('memo')) {
    const json = localStorage.getItem('memo');
    console.log("読み込みjson", json);
    const pos = JSON.parse(json);
    console.log("読み込みpos", pos);
    $("#piece").offset(pos);
}