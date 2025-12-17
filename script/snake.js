console.log("Snake Lite loaded!");

const SAVE_KEY = "miniHub_snake_best_v1";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");

const restartBtn = document.getElementById("restartBtn");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayBtn = document.getElementById("overlayBtn");

const sfxClick = document.getElementById("sfx-click");
const sfxSelect = document.getElementById("sfx-select");

function play(soundEl, vol = 0.7){
  if (!soundEl) return;
  try { soundEl.currentTime = 0; soundEl.volume = vol; soundEl.play(); } catch {}
}

// --- Grid settings ---
const GRID = 21;                 // 21x21 grid
const CELL = canvas.width / GRID; // pixel size per cell

// --- Game state ---
let snake, dir, nextDir, food, score, best, speedMult;
let running = false;
let paused = false;
let tickMs = 160; // base speed

function loadBest(){
  const raw = localStorage.getItem(SAVE_KEY);
  const n = raw ? Number(raw) : 0;
  best = Number.isFinite(n) && n > 0 ? n : 0;
  bestEl.textContent = String(best);
}

function saveBest(){
  localStorage.setItem(SAVE_KEY, String(best));
}

function randCell(){
  return {
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  };
}

function same(a,b){ return a.x === b.x && a.y === b.y; }

function spawnFood(){
  // keep trying until not on snake
  let f = randCell();
  let safe = false;
  while (!safe){
    safe = !snake.some(seg => same(seg, f));
    if (!safe) f = randCell();
  }
  food = f;
}

function reset(){
  snake = [{x: 10, y: 10},{x: 9, y: 10},{x: 8, y: 10}];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  score = 0;
  speedMult = 1;
  tickMs = 160;
  running = true;
  paused = false;
  overlay.classList.add("hidden");
  updateHUD();
  spawnFood();
}

function updateHUD(){
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
  speedEl.textContent = String(speedMult);
}

function setOverlay(title, text){
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function gameOver(){
  running = false;
  play(sfxSelect, 0.6);
  setOverlay("Game Over", "Hit Play Again or Restart.");
}

function togglePause(){
  if (!running) return;
  paused = !paused;
  if (paused){
    setOverlay("Paused", "Press Space to resume.");
  } else {
    overlay.classList.add("hidden");
  }
}

function isOpposite(a,b){
  return a.x === -b.x && a.y === -b.y;
}

function setDirection(newDir){
  // prevent instant reverse
  if (isOpposite(newDir, dir)) return;
  nextDir = newDir;
}

function step(){
  if (!running || paused) return;

  dir = nextDir;

  const head = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  // walls
  if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID){
    return gameOver();
  }

  // self collision
  if (snake.some(seg => same(seg, newHead))){
    return gameOver();
  }

  snake.unshift(newHead);

  // eat
  if (same(newHead, food)){
    play(sfxClick, 0.55);
    score += 10;

    // speed up every 50 points
    if (score % 50 === 0){
      speedMult += 1;
      tickMs = Math.max(70, tickMs - 12);
    }

    if (score > best){
      best = score;
      saveBest();
    }

    spawnFood();
    updateHUD();
  } else {
    snake.pop();
  }
}

function draw(){
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // subtle grid
  ctx.globalAlpha = 0.25;
  for (let i = 0; i <= GRID; i++){
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(canvas.width, i * CELL);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // food
  ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

  // snake
  snake.forEach((seg, idx) => {
    // make head slightly bigger
    const pad = idx === 0 ? 1 : 2;
    ctx.fillRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad*2, CELL - pad*2);
  });
}

let last = 0;
let acc = 0;

function loop(ts){
  if (!last) last = ts;
  const dt = ts - last;
  last = ts;

  acc += dt;
  while (acc >= tickMs){
    step();
    acc -= tickMs;
  }

  draw();
  requestAnimationFrame(loop);
}

// --- Keyboard controls ---
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();

  if (k === " "){
    e.preventDefault();
    togglePause();
    return;
  }

  if (k === "arrowup" || k === "w") setDirection({x: 0, y: -1});
  if (k === "arrowdown" || k === "s") setDirection({x: 0, y: 1});
  if (k === "arrowleft" || k === "a") setDirection({x: -1, y: 0});
  if (k === "arrowright" || k === "d") setDirection({x: 1, y: 0});
});

// --- Touch controls (swipe) ---
let touchStart = null;

canvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });

canvas.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;

  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (Math.max(ax, ay) < 20) return;

  if (ax > ay){
    setDirection(dx > 0 ? {x: 1, y: 0} : {x: -1, y: 0});
  } else {
    setDirection(dy > 0 ? {x: 0, y: 1} : {x: 0, y: -1});
  }

  touchStart = null;
}, { passive: true });

// --- Buttons ---
restartBtn.addEventListener("click", () => {
  play(sfxSelect, 0.6);
  reset();
});

overlayBtn.addEventListener("click", () => {
  play(sfxSelect, 0.6);
  reset();
});

// init
loadBest();
reset();
requestAnimationFrame(loop);
