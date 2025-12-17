console.log("Game Loaded");
console.log("JS loaded correctly!");
function playClick() {
    const sfx = document.getElementById("sfx-click");
    sfx.currentTime = 0;
    sfx.play();
}

let selectCooldown = false;

function playSelect() {
    if (selectCooldown) return; // ignore spam clicks

    const sfx = document.getElementById("sfx-select");
    sfx.currentTime = 0;
    sfx.play();

    selectCooldown = true;
    setTimeout(() => selectCooldown = false, 300); // 0.3s cooldown
}
console.log("Game Loaded");
console.log("JS loaded correctly!");

// === SOUND HELPERS ===
function playSFX(id) {
    const sfx = document.getElementById(id);
    if (sfx) {
        sfx.currentTime = 0;
        sfx.play();
    }
}

// Click = card click
function playClick() {
    playSFX("sfx-click");
}

// Select = Play button
function playSelect(event) {
    event.stopPropagation(); // prevents card click + button click double sound
    playSFX("sfx-select");
}

// Hover sound
function playHover() {
    playSFX("sfx-hover");
}

// Slime boop sound + wiggle animation
function slimeBoop() {
    const slime = document.querySelector(".slime");
    playSFX("sfx-slime");

    slime.classList.add("slime-wiggle");

    setTimeout(() => {
        slime.classList.remove("slime-wiggle");
    }, 350);
}


// === HOVER SOUND FOR CARDS & BUTTONS ===
document.addEventListener("DOMContentLoaded", () => {

    // card hover
    document.querySelectorAll(".game-card").forEach(card => {
        card.addEventListener("mouseenter", () => playHover());
    });

    // button hover
    document.querySelectorAll(".pixel-btn").forEach(btn => {
        btn.addEventListener("mouseenter", () => playHover());
    });

    // slime click listener
    const slime = document.querySelector(".slime");
    if (slime) {
        slime.addEventListener("click", slimeBoop);
    }

    // sparkle loop
    setInterval(createSparkle, 1000);

});


// === SPARKLE PARTICLE EFFECT ===
function createSparkle() {
    const cards = document.querySelectorAll(".game-card");
    if (cards.length === 0) return;

    // pick a random card
    const card = cards[Math.floor(Math.random() * cards.length)];

    // create sparkle element
    const sp = document.createElement("div");
    sp.classList.add("sparkle");

    // random position
    const rect = card.getBoundingClientRect();
    sp.style.left = rect.left + Math.random() * rect.width + "px";
    sp.style.top = rect.top + (Math.random() * rect.height) + "px";

    document.body.appendChild(sp);

    // play sparkle sound
    playSFX("sfx-sparkle");

    // fade + remove
    setTimeout(() => sp.remove(), 500);
}


// === PARALLAX CLOUD BACKGROUND ===
// moves the sky image slightly with scroll for life-like retro motion
window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.2;
    document.body.style.backgroundPosition = `center ${offset}px`;
});
// script/clicker.js

const SAVE_KEY = "miniHub_clicker_save_v1";

const elCoins = document.getElementById("coins");
const elPerClick = document.getElementById("perClick");
const elPerSec = document.getElementById("perSec");

const elPcCost = document.getElementById("pcCost");
const elAutoCost = document.getElementById("autoCost");
const elMultCost = document.getElementById("multCost");

const clickBtn = document.getElementById("clickBtn");
const buyPerClickBtn = document.getElementById("buyPerClick");
const buyAutoBtn = document.getElementById("buyAuto");
const buyMultBtn = document.getElementById("buyMult");
const resetBtn = document.getElementById("resetBtn");

// optional SFX (reusing your ids)
const sfxClick = document.getElementById("sfx-click");
const sfxSelect = document.getElementById("sfx-select");

function play(soundEl, volume = 0.7) {
  if (!soundEl) return;
  try {
    soundEl.currentTime = 0;
    soundEl.volume = volume;
    soundEl.play();
  } catch {}
}

function clamp0(n) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// --- Game state ---
let state = {
  coins: 0,

  perClick: 1,
  autoPerSec: 0,
  multiplier: 1,

  // costs
  pcCost: 10,
  autoCost: 25,
  multCost: 100,
};

// --- Save / Load ---
function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    // only accept known fields (safer)
    state.coins = clamp0(data.coins ?? state.coins);
    state.perClick = clamp0(data.perClick ?? state.perClick);
    state.autoPerSec = clamp0(data.autoPerSec ?? state.autoPerSec);
    state.multiplier = clamp0(data.multiplier ?? state.multiplier) || 1;

    state.pcCost = clamp0(data.pcCost ?? state.pcCost) || 10;
    state.autoCost = clamp0(data.autoCost ?? state.autoCost) || 25;
    state.multCost = clamp0(data.multCost ?? state.multCost) || 100;
  } catch {
    // ignore corrupted save
  }
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  state = {
    coins: 0,
    perClick: 1,
    autoPerSec: 0,
    multiplier: 1,
    pcCost: 10,
    autoCost: 25,
    multCost: 100,
  };
  render();
  save();
}

// --- Economy helpers ---
function gainFromClick() {
  return Math.floor(state.perClick * state.multiplier);
}

function gainFromAutoPerTick() {
  return Math.floor(state.autoPerSec * state.multiplier);
}

function canAfford(cost) {
  return state.coins >= cost;
}

function spend(cost) {
  state.coins -= cost;
  if (state.coins < 0) state.coins = 0;
}

// --- UI ---
function render() {
  elCoins.textContent = Math.floor(state.coins);
  elPerClick.textContent = `${Math.floor(state.perClick)} x${state.multiplier}`;
  elPerSec.textContent = `${Math.floor(state.autoPerSec)} x${state.multiplier}`;

  elPcCost.textContent = `${state.pcCost}`;
  elAutoCost.textContent = `${state.autoCost}`;
  elMultCost.textContent = `${state.multCost}`;

  // disable buttons if broke
  buyPerClickBtn.disabled = !canAfford(state.pcCost);
  buyAutoBtn.disabled = !canAfford(state.autoCost);
  buyMultBtn.disabled = !canAfford(state.multCost);
}

// --- Actions ---
function doClick() {
  state.coins += gainFromClick();
  play(sfxClick, 0.6);
  render();
}

function buyPerClick() {
  if (!canAfford(state.pcCost)) return;
  spend(state.pcCost);
  state.perClick += 1;

  // scale cost
  state.pcCost = Math.floor(state.pcCost * 1.35 + 2);
  play(sfxSelect, 0.6);
  render();
}

function buyAuto() {
  if (!canAfford(state.autoCost)) return;
  spend(state.autoCost);
  state.autoPerSec += 1;

  state.autoCost = Math.floor(state.autoCost * 1.40 + 3);
  play(sfxSelect, 0.6);
  render();
}

function buyMult() {
  if (!canAfford(state.multCost)) return;
  spend(state.multCost);

  // multiplier increases slowly (keeps it fun)
  state.multiplier = Math.min(50, state.multiplier + 1);

  state.multCost = Math.floor(state.multCost * 1.75 + 10);
  play(sfxSelect, 0.6);
  render();
}

// --- Autos ---
let lastSave = Date.now();

function tick() {
  // auto income once per second
  state.coins += gainFromAutoPerTick();

  // autosave every ~5 seconds
  const now = Date.now();
  if (now - lastSave > 5000) {
    save();
    lastSave = now;
  }

  render();
}

clickBtn.addEventListener("click", doClick);
buyPerClickBtn.addEventListener("click", buyPerClick);
buyAutoBtn.addEventListener("click", buyAuto);
buyMultBtn.addEventListener("click", buyMult);

resetBtn.addEventListener("click", () => {
  const ok = confirm("Reset your Clicker Game save? This cannot be undone.");
  if (ok) resetSave();
});

// init
load();
render();
setInterval(tick, 1000);

// save when leaving page
window.addEventListener("beforeunload", save);
