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
document.addEventListener("mousemove", (e) => {
  const sky = document.querySelector(".sky");
  const far = document.querySelector(".cloud-far");
  const near = document.querySelector(".cloud-near");
  if (!sky || !far || !near) return;

  const x = (e.clientX / window.innerWidth) - 0.5;
  const y = (e.clientY / window.innerHeight) - 0.5;

  far.style.transform = `translate(${x * 6}px, ${y * 2}px)`;
  near.style.transform = `translate(${x * 12}px, ${y * 4}px)`;
});
// ==============================
// 🕊 Birds + ✨ Particles
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const birdsLayer = document.getElementById("birds");
  const particlesLayer = document.getElementById("particles");
  if (!birdsLayer || !particlesLayer) return;

  // ---------- Birds ----------
  const BIRD_COUNT = 6;
  const birds = [];

  function spawnBird() {
    const b = document.createElement("div");
    b.className = "bird";
    b.style.top = (20 + Math.random() * 120) + "px"; // stays in sky band
    b.style.left = (-40 - Math.random() * 200) + "px";

    const speed = 0.25 + Math.random() * 0.45; // px/ms
    const bob = 8 + Math.random() * 10;       // bob amplitude
    const flapSpeed = 0.7 + Math.random() * 0.8;

    b.style.animation = `flap ${flapSpeed}s ease-in-out infinite`;
    birdsLayer.appendChild(b);

    return {
      el: b,
      x: parseFloat(b.style.left),
      y: parseFloat(b.style.top),
      speed,
      bob,
      phase: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < BIRD_COUNT; i++) birds.push(spawnBird());

  // ---------- Particles ----------
  const particles = [];
  const MAX_PARTICLES = 28;

  function spawnParticle() {
    const p = document.createElement("div");
    p.className = "particle";

    // spawn in upper/mid area (above grass)
    const x = Math.random() * window.innerWidth;
    const y = 160 + Math.random() * (window.innerHeight * 0.45);

    const size = 2 + Math.random() * 3;
    const drift = (Math.random() - 0.5) * 0.05; // px/ms sideways
    const rise = 0.03 + Math.random() * 0.07;   // px/ms upward
    const life = 4500 + Math.random() * 3500;   // ms

    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.opacity = (0.35 + Math.random() * 0.45).toFixed(2);

    particlesLayer.appendChild(p);

    return {
      el: p,
      x, y,
      drift,
      rise,
      life,
      born: performance.now(),
    };
  }

  function ensureParticles() {
    while (particles.length < MAX_PARTICLES) particles.push(spawnParticle());
  }

  ensureParticles();

  // ---------- Animation loop ----------
  let last = performance.now();
  function tick(now) {
    const dt = now - last;
    last = now;

    // Birds move right and gently bob
    for (const b of birds) {
      b.x += b.speed * dt;
      b.phase += dt * 0.004;

      const yBob = Math.sin(b.phase) * (b.bob * 0.08); // subtle bob
      b.el.style.transform = `translate(${b.x}px, ${yBob}px)`;

      if (b.x > window.innerWidth + 200) {
        // recycle to left
        b.x = -260 - Math.random() * 300;
        b.y = 20 + Math.random() * 120;
        b.el.style.top = b.y + "px";
        b.speed = 0.25 + Math.random() * 0.45;
        b.bob = 8 + Math.random() * 10;
      }
    }

    // Particles drift up & fade out near end of life
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.drift * dt;
      p.y -= p.rise * dt;

      const age = now - p.born;
      const t = Math.min(1, age / p.life);
      const fade = (1 - t);

      p.el.style.left = p.x + "px";
      p.el.style.top = p.y + "px";
      p.el.style.opacity = String(0.65 * fade);

      // recycle
      if (t >= 1 || p.y < 120) {
        p.el.remove();
        particles.splice(i, 1);
      }
    }

    ensureParticles();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
