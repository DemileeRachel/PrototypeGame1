console.log("Game Loaded");
console.log("JS loaded correctly!");
function playClick() {
    const sfx = document.getElementById("sfx-click");
    sfx.currentTime = 0;
    sfx.play();
}

function playSelect() {
    const sfx = document.getElementById("sfx-select");
    sfx.currentTime = 0;
    sfx.play();
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
