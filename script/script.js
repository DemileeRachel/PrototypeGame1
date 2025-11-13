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
