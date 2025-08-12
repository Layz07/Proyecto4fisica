const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const magDisplay = document.getElementById("magDisplay");
const angleDisplay = document.getElementById("angleDisplay");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const velXInput = document.getElementById("velX");
const velYInput = document.getElementById("velY");

let score = 0;
let timeLeft = 30;
let gameRunning = false;

let animationFrameId;
let timerInterval;

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 12,
  speedX: 0,
  speedY: 0
};

const paddle = {
  width: 100,
  height: 15,
  x: canvas.width / 2 - 50,
  y: canvas.height - 30,
  speed: 7,
  movingLeft: false,
  movingRight: false
};

window.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft") paddle.movingLeft = true;
  if (e.key === "ArrowRight") paddle.movingRight = true;
});
window.addEventListener("keyup", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft") paddle.movingLeft = false;
  if (e.key === "ArrowRight") paddle.movingRight = false;
});

function movePaddle() {
  if (paddle.movingLeft) {
    paddle.x -= paddle.speed;
    if (paddle.x < 0) paddle.x = 0;
  }
  if (paddle.movingRight) {
    paddle.x += paddle.speed;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
  }
}

function updateBallSpeedFromInputs() {
  let sx = parseFloat(velXInput.value);
  let sy = parseFloat(velYInput.value);

  if (isNaN(sx)) sx = 4;
  if (isNaN(sy)) sy = -3;

  sx = Math.min(Math.max(sx, -20), 20);
  sy = Math.min(Math.max(sy, -20), 20);

  ball.speedX = sx;
  ball.speedY = sy;

  updateMagAndAngleDisplay(sx, sy);
}

function updateMagAndAngleDisplay(sx, sy) {
  const mag = Math.sqrt(sx * sx + sy * sy);
  let angleRad = Math.atan2(sy, sx);
  let angleDeg = angleRad * (180 / Math.PI);
  if (angleDeg < 0) angleDeg += 360;

  magDisplay.textContent = mag.toFixed(2);
  angleDisplay.textContent = angleDeg.toFixed(1);
}

function moveBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Rebote en paredes laterales
  if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.speedX = -ball.speedX;
    velXInput.value = ball.speedX.toFixed(2);
  }
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.speedX = -ball.speedX;
    velXInput.value = ball.speedX.toFixed(2);
  }

  // Rebote en techo
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.speedY = -ball.speedY;
    velYInput.value = ball.speedY.toFixed(2);
  }

  // Cuando la pelota toca el suelo (pierde punto)
  if (ball.y + ball.radius > canvas.height) {
    score--;
    updateScore();
    resetBall();
  }

  // Detectar colisión con paddle (solo si pelota va hacia abajo)
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.speedY > 0
  ) {
    ball.speedY = -ball.speedY;
    velYInput.value = ball.speedY.toFixed(2);
    score++;
    updateScore();
  }

  // Actualizar magnitud y ángulo en pantalla según velocidad actual
  updateMagAndAngleDisplay(ball.speedX, ball.speedY);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  // Tomamos la velocidad de los inputs
  const baseSpeedX = parseFloat(velXInput.value) || 4;
  const baseSpeedY = parseFloat(velYInput.value) || -3;

  // Para que siempre salga hacia arriba (Y negativo)
  ball.speedY = -Math.abs(baseSpeedY);

  // Para darle variación horizontal aleatoria pero manteniendo la magnitud base de X
  ball.speedX = Math.random() < 0.5 ? -Math.abs(baseSpeedX) : Math.abs(baseSpeedX);

  // Actualizar inputs para que muestren la velocidad actual
  velXInput.value = ball.speedX.toFixed(2);
  velYInput.value = ball.speedY.toFixed(2);

  updateMagAndAngleDisplay(ball.speedX, ball.speedY);
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
  } else {
    stopGame();
    alert(`⏳ ¡Tiempo terminado! Puntos totales: ${score}`);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "cyan";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function gameLoop() {
  if (!gameRunning) return;
  movePaddle();
  moveBall();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  timeLeft = 30;
  updateScore();
  timeDisplay.textContent = timeLeft;
  resetBall();
  paddle.x = canvas.width / 2 - paddle.width / 2;

  startBtn.disabled = true;
  resetBtn.disabled = false;
  velXInput.disabled = true;
  velYInput.disabled = true;

  timerInterval = setInterval(updateTimer, 1000);
  gameLoop();
}

function stopGame() {
  gameRunning = false;
  cancelAnimationFrame(animationFrameId);
  clearInterval(timerInterval);
  startBtn.disabled = false;
  resetBtn.disabled = true;
  velXInput.disabled = false;
  velYInput.disabled = false;
}

function resetGame() {
  stopGame();
  score = 0;
  timeLeft = 30;
  updateScore();
  timeDisplay.textContent = timeLeft;
  resetBall();
  paddle.x = canvas.width / 2 - paddle.width / 2;
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

// Mostrar valores iniciales al cargar
updateBallSpeedFromInputs();
