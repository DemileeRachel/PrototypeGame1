console.log("Memory Match loaded!");

const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const totalPairsEl = document.getElementById("totalPairs");
const timeEl = document.getElementById("time");

const winOverlay = document.getElementById("win");
const winMovesEl = document.getElementById("winMoves");
const winTimeEl = document.getElementById("winTime");

const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const sfxClick = document.getElementById("sfx-click");
const sfxSelect = document.getElementById("sfx-select");

function play(soundEl, vol = 0.7){
  if (!soundEl) return;
  try{
    soundEl.currentTime = 0;
    soundEl.volume = vol;
    soundEl.play();
  } catch {}
}

// --- Config ---
const EMOJIS = ["🐱","🐸","🦝","🐝","🐍","🐰","🦊","🐼"]; // we’ll use first N pairs
const PAIRS = 6; // change to 8 for harder
totalPairsEl.textContent = String(PAIRS);

// --- State ---
let first = null;
let second = null;
let lock = false;

let moves = 0;
let matches = 0;

let seconds = 0;
let timer = null;
let started = false;

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startTimer(){
  if (timer) return;
  timer = setInterval(() => {
    seconds += 1;
    timeEl.textContent = String(seconds);
  }, 1000);
}

function stopTimer(){
  if (timer){
    clearInterval(timer);
    timer = null;
  }
}

function setMoves(n){
  moves = n;
  movesEl.textContent = String(moves);
}

function setMatches(n){
  matches = n;
  matchesEl.textContent = String(matches);
}

function showWin(){
  stopTimer();
  winMovesEl.textContent = String(moves);
  winTimeEl.textContent = String(seconds);
  winOverlay.classList.remove("hidden");
}

function hideWin(){
  winOverlay.classList.add("hidden");
}

function buildDeck(){
  const pick = EMOJIS.slice(0, PAIRS);
  const deck = shuffle([...pick, ...pick].map((v, idx) => ({ id: idx, value: v })));
  return deck;
}

function makeCard(cardData){
  const btn = document.createElement("button");
  btn.className = "card";
  btn.type = "button";
  btn.setAttribute("data-value", cardData.value);
  btn.setAttribute("aria-label", "Memory card");

  btn.innerHTML = `
    <div class="face back">ROGUE<br>WHISKERS</div>
    <div class="face front">${cardData.value}</div>
  `;

  btn.addEventListener("click", () => onCardClick(btn));
  return btn;
}

function reveal(card){
  card.classList.add("revealed");
}
function hide(card){
  card.classList.remove("revealed");
}
function disable(card){
  card.classList.add("disabled");
  card.disabled = true;
}
function markMatched(a,b){
  a.classList.add("matched");
  b.classList.add("matched");
  disable(a); disable(b);
}

function resetTurn(){
  first = null;
  second = null;
  lock = false;
}

function onCardClick(card){
  if (lock) return;
  if (card.disabled) return;
  if (card === first) return;

  if (!started){
    started = true;
    startTimer();
  }

  play(sfxClick, 0.6);
  reveal(card);

  if (!first){
    first = card;
    return;
  }

  // second pick
  second = card;
  lock = true;
  setMoves(moves + 1);

  const a = first.getAttribute("data-value");
  const b = second.getAttribute("data-value");

  if (a === b){
    // match
    play(sfxSelect, 0.6);
    markMatched(first, second);
    setMatches(matches + 1);

    if (matches + 1 >= PAIRS){
      setTimeout(showWin, 250);
    }
    resetTurn();
  } else {
    // not a match
    setTimeout(() => {
      hide(first);
      hide(second);
      resetTurn();
    }, 650);
  }
}

function newGame(){
  stopTimer();
  started = false;
  seconds = 0;
  timeEl.textContent = "0";

  setMoves(0);
  setMatches(0);
  hideWin();
  resetTurn();

  board.innerHTML = "";
  const deck = buildDeck();
  deck.forEach(d => board.appendChild(makeCard(d)));
}

restartBtn.addEventListener("click", () => {
  play(sfxSelect, 0.6);
  newGame();
});

playAgainBtn.addEventListener("click", () => {
  play(sfxSelect, 0.6);
  newGame();
});

newGame();
