console.log("Hub JS loaded correctly!");

// === SOUND HELPERS ===
function playSFX(id) {
  const sfx = document.getElementById(id);
  if (!sfx) return;
  try {
    sfx.currentTime = 0;
    sfx.play();
  } catch {}
}

// Click = card click
function playClick() {
  playSFX("sfx-click");
}

// Select = Play button (call it with event)
let selectCooldown = false;
function playSelect(event) {
  if (event) event.stopPropagation();
  if (selectCooldown) return;

  playSFX("sfx-select");

  selectCooldown = true;
  setTimeout(() => (selectCooldown = false), 300);
}

// Hover sound
function playHover() {
  playSFX("sfx-hover");
}

// Slime boop + wiggle
function slimeBoop() {
  const slime = document.querySelector(".slime");
  playSFX("sfx-slime");
  if (!slime) return;

  slime.classList.add("slime-wiggle");
  setTimeout(() => slime.classList.remove("slime-wiggle"), 350);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("mouseenter", playHover);
  });

  document.querySelectorAll(".pixel-btn").forEach((btn) => {
    btn.addEventListener("mouseenter", playHover);
  });

  const slime = document.querySelector(".slime");
  if (slime) slime.addEventListener("click", slimeBoop);

  // sparkle loop ONLY if you actually have sfx-sparkle in HTML
  // setInterval(createSparkle, 1000);
});

// OPTIONAL: Parallax clouds
window.addEventListener("scroll", () => {
  const offset = window.scrollY * 0.2;
  document.body.style.backgroundPosition = `center ${offset}px`;
});
