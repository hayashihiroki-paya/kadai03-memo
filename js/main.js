// 固定の数値設定
const constant = {
    windowHight: 800,
    windowWidth: 1000
}

// DOMキャッシュ
const $boll = $("#boll");
const $left = $("#leftBoard");
const $right = $("#rightBoard");

// ドラッグドロップ関係
$(".pieceGroup").draggable();
$(".miniPieceGroup").draggable();
$(".dropZoneGroup").droppable({
    accept: ".pieceGroup",
    hoverClass: ".dropTarget",
    drop: function (event, ui) {
        alert('drop検知');
    }
});

// キーボードが押されているかの判定
let keys = {};
$(window).on('keydown', function (e) {
    keys[e.key] = true;
})
$(window).on('keyup', function (e) {
    keys[e.key] = false;
})
// 画面のフォーカスが外れたらリセット（押されたままにならないように）
$(window).on("blur", function () {
    keys = {};
});

// ボールの動き
// let angle = Math.random() * 360;
// いったん初期値は45度で
let angle = 45;
let rad = angle * Math.PI / 180;
let bollSpeedX = Math.cos(rad) * 200;
let bollSpeedY = Math.sin(rad) * 200;
// ボールの現在の座標取得
const bollPos = $boll.offset();
// 左右のバーの速度の設定
let leftSpeed = 0;
let rightSpeed = 0;
// 初期位置取得
let posLeft = $left.offset();
let posRight = $right.offset();
// 処理落ちしてもいいように前回処理した時間を取得
let lastTime = performance.now();
// アニメーション含めたマイフレームごとの処理
function animate(now) {
    // 前回の処理からかかった時間を取得
    let dt = (now - lastTime) / 1000;
    // 時間管理更新
    lastTime = now;
    bollPos.top += bollSpeedY * dt;
    bollPos.left += bollSpeedX * dt;
    // 壁で反射 はみ出ないように座標を強制する
    if (bollPos.left < 0) {
        bollPos.left = 0;
        bollSpeedX *= -1;
    } else if (bollPos.left > constant.windowWidth - $boll.width()) {
        bollPos.left = constant.windowWidth - $boll.width();
        bollSpeedX *= -1;
    }
    if (bollPos.top < 0) {
        bollPos.top = 0;
        bollSpeedY *= -1;
    } else if (bollPos.top > constant.windowHight - $boll.height()) {
        bollPos.top = constant.windowHight - $boll.height();
        bollSpeedY *= -1;
    }
    // ボール座標更新
    $boll.css({
        top: bollPos.top,
        left: bollPos.left
    })

    // 左右のバーの動作 速度を変更する
    // 左
    if (keys["q"]) leftSpeed = Math.max(leftSpeed - 1, -10);
    if (!keys["q"] && leftSpeed < 0) leftSpeed = Math.min(leftSpeed + 1, 0);
    if (keys["a"]) leftSpeed = Math.min(leftSpeed + 1, 10);
    if (!keys["a"] && leftSpeed > 0) leftSpeed = Math.max(leftSpeed - 1, 0);
    // 右
    if (keys["["]) rightSpeed = Math.max(rightSpeed - 1, -10);
    if (!keys["["] && rightSpeed < 0) rightSpeed = Math.min(rightSpeed + 1, 0);
    if (keys["]"]) rightSpeed = Math.min(rightSpeed + 1, 10);
    if (!keys["]"] && rightSpeed > 0) rightSpeed = Math.max(rightSpeed - 1, 0);
    posLeft.top += leftSpeed;
    posRight.top += rightSpeed;
    posLeft.top = Math.max(0, Math.min(posLeft.top, constant.windowHight - $left.height()));
    posRight.top = Math.max(0, Math.min(posRight.top, constant.windowHight - $right.height()));
    $left.css("top", posLeft.top);
    $right.css("top", posRight.top);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

$('.saveSlot').on('click', function () {
    console.log("保存押された");
    const num = $('.saveSlot').index(this);
    console.log("num", num);
    const pos = [];
    $(".pieceGroup").each(function () {
        pos.push($(this).offset());
    })
    console.log("pos", pos);
    const json = JSON.stringify(pos);
    console.log("json", json);
    localStorage.setItem('memo' + num, json);
});
$(".clearSlot").on('click', function () {
    const num = $(".clearSlot").index(this);
    localStorage.removeItem('memo' + num);
    console.log("ローカルストレージ削除");
    $(".pieceGroup").offset({
        top: 0,
        left: 0
    });
});
$(".loadSlot").on('click', function () {
    const num = $(".loadSlot").index(this);
    if (localStorage.getItem('memo' + num)) {
        const json = localStorage.getItem('memo' + num);
        console.log("読み込みjson", json);
        const pos = JSON.parse(json);
        console.log("読み込みpos", pos);
        $(".pieceGroup").each(function (i) {
            $(this).offset(pos[i]);
        })
    }
});