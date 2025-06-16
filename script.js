const startButton = document.getElementById("start-button");
const difficultyButtons = document.querySelectorAll("#difficulty-form button");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const cupLine = document.getElementById("cup-line");
const resultBox = document.getElementById("result");
const resultText = document.getElementById("result-text");
const restartButton = document.getElementById("restart-button");
const currentScoreEl = document.getElementById("current-score");
const highScoreEl = document.getElementById("high-score");

let difficulty = null;
let cupCount = 3;
let speed = 800;
let round = 5;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let ballIndex = 0;
let hiddenBallId = 0;
let cups = [];
let canClick = false; // 控制点击状态

highScoreEl.textContent = highScore;

difficultyButtons.forEach((btn) => { //选择难度
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.difficulty;
    startButton.disabled = false;

    if (difficulty === "easy") {
      cupCount = 3;
      speed = 800;
      round = 5;
    } else if (difficulty === "medium") {
      cupCount = 4;
      speed = 600;
      round = 8;
    } else {
      cupCount = 5;
      speed = 400;
      round = 10;
    }
  });
});

startButton.addEventListener("click", () => { 
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startRound();
});

function startRound() {
  cupLine.innerHTML = "";
  resultBox.classList.add("hidden");
  cups = [];
  canClick = false; // 开始前禁用点击

  for (let i = 0; i < cupCount; i++) { //创造杯子并赋予id
    const cup = document.createElement("div");
    cup.classList.add("cup");
    cup.dataset.index = i;
    cup.dataset.id = i;
    cup.addEventListener("click", () => handleGuess(parseInt(cup.dataset.id)));
    cupLine.appendChild(cup);
    cups.push(cup);
  }

  placeCups(cups);

  // 展示球
  setTimeout(() => {
    ballIndex = Math.floor(Math.random() * cupCount);
    hiddenBallId = parseInt(cups[ballIndex].dataset.id); // 记录初始藏球位置

    const ball = document.createElement("div");
    ball.className = "ball";
    cups[ballIndex].appendChild(ball);
    cups[ballIndex].style.top = "-60px";  
    setTimeout(() => {
      cups[ballIndex].style.top = "50px";
      ball.remove();
    }, 1000);
  }, 500);

  // 洗杯子
  setTimeout(() => {
    shuffleCups(cups).then(() => {
      canClick = true; // 洗完杯后允许点击
    });
  }, 2500);
}

function placeCups(cups) { // 放置杯子
  const spacing = 120;
  const startX = (window.innerWidth - spacing * (cups.length - 1)) / 2;

  cups.forEach((cup, i) => {
    cup.style.left = `${startX + i * spacing}px`;
    cup.style.top = "50px";
    cup.dataset.pos = i;
  });
}

function getTwoRandomIndices(max) { //随机两个索引
  let a = Math.floor(Math.random() * max);
  let b;
  do {
    b = Math.floor(Math.random() * max);
  } while (a === b);
  return [a, b];
}

function animateSwap(cups, a, b) { //交换动画，同时交换dom值和数组中位置
  return new Promise((resolve) => {
    const leftA = cups[a].style.left;
    const leftB = cups[b].style.left;

    cups[a].style.left = leftB;
    cups[b].style.left = leftA;

    const tempPos = cups[a].dataset.pos;
    cups[a].dataset.pos = cups[b].dataset.pos;
    cups[b].dataset.pos = tempPos;

    [cups[a], cups[b]] = [cups[b], cups[a]];

    if (ballIndex === a) ballIndex = b;
    else if (ballIndex === b) ballIndex = a;

    setTimeout(resolve, speed - 10);
  });
}

async function shuffleCups(cups) { //交换杯子
  for (let i = 0; i < round; i++) {
    const [a, b] = getTwoRandomIndices(cups.length);
    await animateSwap(cups, a, b);
  }
}

function handleGuess(clickedId) { //判定系统
  if (!canClick) return; //禁止点击时不处理
  canClick = false; // 一旦点击立即锁定

  if (clickedId === hiddenBallId) {
    setTimeout(() => { //确认所选正确
    const ball = document.createElement("div");
    ball.className = "ball";
    cups[ballIndex].appendChild(ball);
    cups[ballIndex].style.top = "-60px";
    message.classList.remove("hidden"); 

    setTimeout(() => {
      cups[ballIndex].style.top = "50px";
      ball.remove();
      message.classList.add("hidden");
    },1000 );

  },500)
  
    
    if (difficulty === "easy") score += 1;
    else if (difficulty === "medium") score += 2;
    else score += 3;

    currentScoreEl.textContent = score;
    setTimeout(startRound, 3000);
  } else {
    const ball = document.createElement("div");
    ball.className = "ball";
    cups[ballIndex].appendChild(ball);
    cups[ballIndex].style.top = "-60px";

    resultText.textContent = `答错了！最终得分：${score}`;
    resultBox.classList.remove("hidden");

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreEl.textContent = highScore;
    }
  }
}

restartButton.addEventListener("click", () => { // 重置游戏
  score = 0;
  currentScoreEl.textContent = score;
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

