console.log("Reaction Test loaded!");

const SAVE_KEY = "miniHub_reaction_best_v1";

const box = document.getElementById("box");
const boxText = document.getElementById("boxText");
const boxSub = document.getElementById("boxSub");

const bestEl = document.getElementById("best");
const lastEl = document.getElementById("last");
const triesEl = document.getElementById("tries");
const resetBtn = document.getElementById("resetBtn");

const sfxClick = document.getElementById("sfx-click");
const sfxSelect = document.getElementById("sfx-select");

function play(soundEl, vol = 0.7){
  if (!soundEl) return;
  try { soundEl.currentTime = 0; soundEl.volume = vol; soundEl.play(); } catch {}
}

function setClass(state){
  box.classList.remove("waiting","running","ready","toosoon");
  box.classList.add(state);
}

let phase = "idle"; // idle -> waiting -> ready
let timerId = null;
let startTime = 0;

let tries = 0;
let best = null;

function loadBest(){
  const raw = localStorage.getItem(SAVE_KEY);
  const n = raw ? Number(raw) : null;
  if (Number.isFinite(n) && n > 0) best = n;
  bestEl.textContent = best ? String(best) : "—";
}

function saveBest(){
  if (!best) return;
  localStorage.setItem(SAVE_KEY, String(best));
}

function setTries(n){
  tries = n;
  triesEl.textContent = String(tries);
}

function setLast(ms){
  lastEl.textContent = ms ? String(ms) : "—";
}

function resetToIdle(){
  phase = "idle";
  if (timerId) clearTimeout(timerId);
  timerId = null;

  setClass("waiting");
  boxText.textContent = "CLICK TO START";
  boxSub.textContent = "Wait for GREEN, then click fast.";
}

function startRound(){
  phase = "waiting";
  setClass("running");
  boxText.textContent = "WAIT...";
  boxSub.textContent = "Don’t click yet 👀";

  // random delay (classic reaction test)
  const delay = 900 + Math.floor(Math.random() * 2200); // 0.9s–3.1s
  timerId = setTimeout(() => {
    phase = "ready";
    setClass("ready");
    boxText.textContent = "CLICK NOW!";
    boxSub.textContent = "GO GO GO!";
    startTime = performance.now();
    play(sfxSelect, 0.6);
  }, delay);
}

function tooSoon(){
  phase = "toosoon";
  if (timerId) clearTimeout(timerId);
  timerId = null;

  setClass("toosoon");
  boxText.textContent = "TOO SOON!";
  boxSub.textContent = "False start. Click to try again.";
  play(sfxClick, 0.6);
}

function finish(){
  const end = performance.now();
  const ms = Math.max(1, Math.round(end - startTime));

  setTries(tries + 1);
  setLast(ms);

  if (!best || ms < best){
    best = ms;
    bestEl.textContent = String(best);
    saveBest();
  }

  setClass("waiting");
  boxText.textContent = `${ms} ms`;
  boxSub.textContent = "Click to go again.";
  play(sfxClick, 0.6);

  phase = "idle";
}

box.addEventListener("click", () => {
  if (phase === "idle") {
    play(sfxClick, 0.5);
    startRound();
    return;
  }
  if (phase === "waiting") {
    tooSoon();
    return;
  }
  if (phase === "ready") {
    finish();
    return;
  }
  if (phase === "toosoon") {
    resetToIdle();
    return;
  }
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("Reset best score + attempts?");
  if (!ok) return;
  localStorage.removeItem(SAVE_KEY);
  best = null;
  bestEl.textContent = "—";
  setTries(0);
  setLast(null);
  resetToIdle();
});

// init
loadBest();
setTries(0);
setLast(null);
resetToIdle();
