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
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let ballIndex = 0;
let hiddenBallId = null;
let cups = [];

highScoreEl.textContent = highScore;

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.difficulty;
    startButton.disabled = false;

    if (difficulty === "easy") {
      cupCount = 3;
      speed = 800;
    } else if (difficulty === "medium") {
      cupCount = 4;
      speed = 600;
    } else {
      cupCount = 5;
      speed = 400;
    }
  });
});

startButton.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  score = 0;
  currentScoreEl.textContent = score;
  startRound();
});

function startRound() {
  cupLine.innerHTML = "";
  resultBox.classList.add("hidden");
  cups = [];

  for (let i = 0; i < cupCount; i++) {
    const cup = document.createElement("div");
    cup.classList.add("cup");
    cup.dataset.index = i;
    cup.dataset.id = i; // 固定身份 ID
    cup.addEventListener("click", () => handleGuess(parseInt(cup.dataset.id)));
    cupLine.appendChild(cup);
    cups.push(cup);
  }

  placeCups(cups);

  // 显示并隐藏球
  setTimeout(() => {
    ballIndex = Math.floor(Math.random() * cupCount);
    hiddenBallId = parseInt(cups[ballIndex].dataset.id); // 记录固定身份

    const ball = document.createElement("div");
    ball.className = "ball";
    cups[ballIndex].appendChild(ball);
    cups[ballIndex].style.top = "-60px"; // 上升

    setTimeout(() => {
      cups[ballIndex].style.top = "50px"; // 下落
      ball.remove();
    }, 1000);
  }, 500);

  // 开始洗杯子
  setTimeout(() => {
    shuffleCups(cups);
  }, 2500);
}

function placeCups(cups) {
  const spacing = 120;
  const startX = (window.innerWidth - spacing * (cups.length - 1)) / 2;

  cups.forEach((cup, i) => {
    cup.style.left = `${startX + i * spacing}px`;
    cup.style.top = "50px";
    cup.dataset.pos = i;
  });
}

function getTwoRandomIndices(max) {
  let a = Math.floor(Math.random() * max);
  let b;
  do {
    b = Math.floor(Math.random() * max);
  } while (a === b);
  return [a, b];
}

function animateSwap(cups, a, b) {
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

    setTimeout(resolve, speed + 100);
  });
}

async function shuffleCups(cups) {
  for (let i = 0; i < 5; i++) {
    const [a, b] = getTwoRandomIndices(cups.length);
    await animateSwap(cups, a, b);
  }
}

function handleGuess(clickedId) {
  if (clickedId === hiddenBallId) {
    if (difficulty === "easy") score += 1;
    else if (difficulty === "medium") score += 2;
    else score += 3;

    currentScoreEl.textContent = score;
    setTimeout(startRound, 1000);
  } else {
    const ball = document.createElement("div");
    ball.className = "ball";
    cups[ballIndex].appendChild(ball);
    cups[ballIndex].style.top = "-60px";

    resultText.textContent = `打错了哦！最终得分：${score}`;
    resultBox.classList.remove("hidden");

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreEl.textContent = highScore;
    }
  }
}

restartButton.addEventListener("click", () => {
  score = 0;
  currentScoreEl.textContent = score;
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});
