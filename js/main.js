// DOMキャッシュ
const $boll = $("#boll");
const $left = $("#leftBoard");
const $right = $("#rightBoard");
const $piece = $(".pieceGroup");
const $scoreL = $("#scoreL");
const $scoreR = $("#scoreR");
// 固定の数値設定
const constant = {
    windowHight: 800,
    windowWidth: 1000,
    bollSpeed: 600,
    boardMaxSpeed: 10,
    randomAngle: 80,
    deadAngle: 20,
    bollDefaultPos: $boll.offset(),
    pieceRedDefaultPos: $(".colorRed").offset(),
    pieceBlueDefaultPos: $(".colorYellow").offset(),
    gameSetScore: 10,
    boardDefaultPosL: $("#leftBoard").offset(),
    boardDefaultPosR: $("#rightBoard").offset()
}
// 音声設定
const reflectionSE = new Audio('./audio/reflection.mp3');
const missSE = new Audio('./audio/miss.mp3');
const resultSE = new Audio('./audio/result.mp3');
// ドラッグドロップ関係
$(".pieceGroup").draggable({ containment: "#messageWindow" });
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
// 初期値は45+90nで斜めに出るように
let angle = 45 + 90 * Math.floor(Math.random() * 4);
let rad = angle * Math.PI / 180;
let bollSpeedX = Math.cos(rad) * constant.bollSpeed;
let bollSpeedY = Math.sin(rad) * constant.bollSpeed;
// ボールの現在の座標取得
const bollPos = $boll.offset();
// サイズ取得
const bollSize = {
    width: $boll.width(),
    height: $boll.height()
}
// スコア管理用
let scoreL = 0;
let scoreR = 0;
// 初期値表示
$scoreR.text(`${scoreR}`);
$scoreL.text(`${scoreL}`);
// 左右のバーの速度の設定
let leftSpeed = 0;
let rightSpeed = 0;
// 初期位置取得
let posLeft = $left.offset();
let posRight = $right.offset();
// サイズ取得
const boardSize = {
    width: $left.width(),
    height: $left.height()
}
// 当たり判定用の座標とサイズ格納
const pos = [];
const posSize = [];
$piece.each(function () {
    pos.push($(this).offset());
    posSize.push({
        width: $(this).width(),
        height: $(this).height()
    })
})
// 上を通過する間判定が繰り返されないように重なり検知のフラグ
let flags = [];
$piece.each(function (i) {
    flags[i] = false;
});
// お邪魔バーの初期位置がきれいに並ぶようにする
function resetPieceGroup() {
    $(".colorRed").each(function (i) {
        const redPos = {
            top: constant.pieceRedDefaultPos.top + $(this).width() * i,
            left: constant.pieceRedDefaultPos.left + $(this).width() * i
        }
        $(this).css('top', redPos.top);
        $(this).css('left', redPos.left);
    })
    $(".colorYellow").each(function (i) {
        const redPos = {
            top: constant.pieceBlueDefaultPos.top + $(this).width() * i,
            left: constant.pieceBlueDefaultPos.left - $(this).width() * i
        }
        $(this).css('top', redPos.top);
        $(this).css('left', redPos.left);
    })
}
resetPieceGroup();
// 処理落ちしてもいいように前回処理した時間を取得
let lastTime = performance.now();
// アニメーションを止めて行う処理と分けるためのフラグ
let isAnimate = false;
// アニメーション含めたマイフレームごとの処理
function animate(now) {
    // 前回の処理からかかった時間を取得
    let dt = (now - lastTime) / 1000;
    // 時間管理更新
    lastTime = now;
    bollPos.top += bollSpeedY * dt;
    bollPos.left += bollSpeedX * dt;
    // 壁で反射 左右は得点処理してリセット
    if (bollPos.left < 0) {
        $("#messageWindow").css('display', 'block');
        isAnimate = false;
        scoreR++;
        $scoreR.text(`${scoreR}`);
        if (scoreR >= constant.gameSetScore) {
            gameFinish();
        }else{
            playSE(missSE);
        }
        return;
    } else if (bollPos.left > constant.windowWidth - $boll.width()) {
        $("#messageWindow").css('display', 'block');
        isAnimate = false;
        scoreL++;
        $scoreL.text(`${scoreL}`);
        if (scoreL >= constant.gameSetScore) {
            gameFinish();
        }else{
            playSE(missSE);
        }
        return;
    }
    // 上下壁で反射 はみ出ないように座標を強制する
    if (bollPos.top < 0) {
        bollPos.top = 0;
        bollSpeedY *= -1;
        angle = 360 - angle;
        playSE(reflectionSE);
        if (angle < 0) angle = 360 + angle;
    } else if (bollPos.top > constant.windowHight - $boll.height()) {
        bollPos.top = constant.windowHight - $boll.height();
        bollSpeedY *= -1;
        angle = 360 - angle;
        playSE(reflectionSE);
        if (angle < 0) angle = 360 + angle;
    }
    // 左右のバーの動作 速度を変更する
    // 左
    if (keys["q"]) leftSpeed = Math.max(leftSpeed - 1, -constant.boardMaxSpeed);
    if (!keys["q"] && leftSpeed < 0) leftSpeed = Math.min(leftSpeed + 1, 0);
    if (keys["a"]) leftSpeed = Math.min(leftSpeed + 1, constant.boardMaxSpeed);
    if (!keys["a"] && leftSpeed > 0) leftSpeed = Math.max(leftSpeed - 1, 0);
    // 右
    if (keys["["]) rightSpeed = Math.max(rightSpeed - 1, -constant.boardMaxSpeed);
    if (!keys["["] && rightSpeed < 0) rightSpeed = Math.min(rightSpeed + 1, 0);
    if (keys["]"]) rightSpeed = Math.min(rightSpeed + 1, constant.boardMaxSpeed);
    if (!keys["]"] && rightSpeed > 0) rightSpeed = Math.max(rightSpeed - 1, 0);
    posLeft.top += leftSpeed;
    posRight.top += rightSpeed;
    posLeft.top = Math.max(0, Math.min(posLeft.top, constant.windowHight - $left.height()));
    posRight.top = Math.max(0, Math.min(posRight.top, constant.windowHight - $right.height()));
    // バーとの接触判定
    if (posLeft.left < bollPos.left + bollSize.width &&
        posLeft.left + boardSize.width > bollPos.left &&
        posLeft.top < bollPos.top + bollSize.height &&
        posLeft.top + boardSize.height > bollPos.top) {
        // 接触している場合の処理
        bollPos.left = posLeft.left + boardSize.width;
        bollSpeedX *= -1;
        angle = 180 - angle;
        playSE(reflectionSE);
        if (angle < 0) angle = 360 + angle;
    }
    if (posRight.left < bollPos.left + bollSize.width &&
        posRight.left + boardSize.width > bollPos.left &&
        posRight.top < bollPos.top + bollSize.height &&
        posRight.top + boardSize.height > bollPos.top) {
        // 接触している場合の処理
        bollPos.left = posRight.left - bollSize.width;
        bollSpeedX *= -1;
        angle = 180 - angle;
        playSE(reflectionSE);
        if (angle < 0) angle = 360 + angle;
    }
    // お邪魔ブロックとの当たり判定
    const pos = [];
    const posSize = [];
    $piece.each(function () {
        pos.push($(this).offset());
        posSize.push({
            width: $(this).width(),
            height: $(this).height()
        })
    })
    $piece.each(function (i) {
        if (pos[i].left < bollPos.left + bollSize.width &&
            pos[i].left + posSize[i].width > bollPos.left &&
            pos[i].top < bollPos.top + bollSize.height &&
            pos[i].top + posSize[i].height > bollPos.top && !flags[i]) {
            // 接触している場合の処理
            flags[i] = true;
            angle += Math.floor(Math.random() * constant.randomAngle - constant.randomAngle / 2);
            // 角度が縦すぎるとき修正 90,270は垂直移動してる時の角度
            if (angle > 270 - constant.deadAngle && angle <= 270) angle = 270 - constant.deadAngle;
            if (angle >= 270 && angle < 270 + constant.deadAngle) angle = 270 + constant.deadAngle;
            if (angle > 90 - constant.deadAngle && angle <= 90) angle = 90 - constant.deadAngle;
            if (angle >= 90 && angle < 90 + constant.deadAngle) angle = 90 + constant.deadAngle;
            rad = angle * Math.PI / 180;
            bollSpeedX = Math.cos(rad) * constant.bollSpeed;
            bollSpeedY = Math.sin(rad) * constant.bollSpeed;
        } else if (pos[i].left < bollPos.left + bollSize.width &&
            pos[i].left + posSize[i].width > bollPos.left &&
            pos[i].top < bollPos.top + bollSize.height &&
            pos[i].top + posSize[i].height > bollPos.top && flags[i]) {
        } else {
            if (flags[i]) {
                flags[i] = false;
            }
        }
    })
    // ボール座標更新
    $boll.css({
        top: bollPos.top,
        left: bollPos.left
    })
    // バー座標更新
    $left.css("top", posLeft.top);
    $right.css("top", posRight.top);
    console.log("isAnimate", isAnimate);
    if (isAnimate) {
        requestAnimationFrame(animate);
    }
}
if (isAnimate) {
    requestAnimationFrame(animate);
}
// スペースキー押されたときゲームスタート
$(window).on('keyup', function (e) {
    // 10点あったら終了
    if (scoreL >= constant.gameSetScore || scoreR >= constant.gameSetScore) {
        location.reload();
    }
    if (e.key === " " && !isAnimate) {
        $("#messageWindow").css('display', 'none');
        $boll.offset(constant.bollDefaultPos);
        bollPos.left = constant.bollDefaultPos.left;
        bollPos.top = constant.bollDefaultPos.top;
        $left.offset(constant.boardDefaultPosL);
        posLeft = $left.offset();
        $right.offset(constant.boardDefaultPosR);
        posRight = $right.offset()
        isAnimate = true;
        lastTime = performance.now();
        requestAnimationFrame(animate);
    }
})
// 対戦履歴を自動読み込み
let resultTextLog = [];
if (localStorage.getItem('resultText')) {
    const json = localStorage.getItem('resultText');
    const text = JSON.parse(json);
    for (let i = 0; i < text.length; i++) {
        console.log("text[i]", text[i]);
        resultTextLog.push(text[i]);
    }
}
console.log("resultTextLog", resultTextLog);
for (let i = 0; i < resultTextLog.length; i++) {
    $("#resultTextSpan").append(`<p>${resultTextLog[i]}</p>`);
}
// ゲーム終了処理
function gameFinish() {
    const resultText = `${scoreL} 対 ${scoreR}`
    playSE(resultSE);
    $("#messageText").html(`<p>試合終了！</p><p>${resultText}</p>`);
    $("#messageText").addClass("bigFont");
    $("#messageWindow").css("display", "flex");
    resultTextLog.unshift(resultText);
    console.log("resultTextLog", resultTextLog);
    if (resultTextLog.length > 5) {
        resultTextLog.pop();
    }
    const json = JSON.stringify(resultTextLog);
    localStorage.setItem('resultText', json);
}
// セーブロード処理
$('.saveSlot').on('click', function () {
    // セーブスロット実装
    const num = $('.saveSlot').index(this);
    const pos = [];
    $piece.each(function () {
        // お邪魔ブロックの座標を保存
        pos.push($(this).offset());
    })
    const json = JSON.stringify(pos);
    localStorage.setItem('memo' + num, json);
});
$(".clearSlot").on('click', function () {
    const num = $(".clearSlot").index(this);
    localStorage.removeItem('memo' + num);
    resetPieceGroup();
});
$(".loadSlot").on('click', function () {
    const num = $(".loadSlot").index(this);
    if (localStorage.getItem('memo' + num)) {
        const json = localStorage.getItem('memo' + num);
        const pos = JSON.parse(json);
        $piece.each(function (i) {
            $(this).offset(pos[i]);
        })
    }
});
// 連続再生対応関数
function playSE(audioItem) {
    audioItem.pause();
    audioItem.currentTime = 0;
    audioItem.play();
}