const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const statusText = document.getElementById("statusText");
const progress = document.getElementById("progress");
const speedBadge = document.getElementById("speedBadge");
const speedButtons = document.querySelectorAll(".speed-btn");
const timerText = document.getElementById("timerText");

let hasStarted = false;
let hasEnded = false;
let selectedSpeed = null;
let lastAllowedTime = 0;

function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

async function startVideoWithSpeed(speed) {
    if (hasStarted) return;

    hasStarted = true;
    selectedSpeed = speed;

    video.currentTime = 0;
    video.controls = false;
    video.loop = false;
    video.muted = false;
    video.volume = 1;
    video.playbackRate = speed;
    video.defaultPlaybackRate = speed;

    speedBadge.textContent = `x${speed}`;
    statusText.textContent = `Playing at x${speed}`;
    timerText.textContent = "Loading...";
    overlay.classList.add("hidden");

    try {
        await video.play();
    } catch (error) {
        statusText.textContent = "Playback blocked. Please click again.";
        hasStarted = false;
        overlay.classList.remove("hidden");
        console.error(error);
    }
}

speedButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const speed = parseFloat(button.dataset.speed);
        startVideoWithSpeed(speed);
    });
});

video.addEventListener("loadedmetadata", () => {
    if (video.duration) {
        timerText.textContent = formatTime(video.duration);
    }
});

video.addEventListener("play", () => {
    if (selectedSpeed) {
        video.playbackRate = selectedSpeed;
    }
});

video.addEventListener("ratechange", () => {
    if (hasStarted && selectedSpeed && video.playbackRate !== selectedSpeed) {
        video.playbackRate = selectedSpeed;
    }
});

video.addEventListener("timeupdate", () => {
    if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = percent + "%";

        const remaining = video.duration - video.currentTime;
        timerText.textContent = formatTime(remaining);
    }

    if (!video.seeking) {
        lastAllowedTime = video.currentTime;
    }
});

video.addEventListener("pause", () => {
    if (!video.ended && hasStarted) {
        video.play().catch(() => {});
    }
});

video.addEventListener("seeking", () => {
    if (hasStarted && !video.ended) {
        if (video.currentTime > lastAllowedTime + 0.3) {
            video.currentTime = lastAllowedTime;
        }
    }
});

video.addEventListener("contextmenu", (e) => e.preventDefault());

video.addEventListener("ended", () => {
    if (hasEnded) return;

    hasEnded = true;
    progress.style.width = "100%";
    timerText.textContent = "00:00";
    statusText.textContent = "Finished. Redirecting...";

    setTimeout(() => {
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSffnlRRBBHZgnWQBO9j4Foc-jWRqHboSY7JvGeMYSgnM_jAuQ/viewform?usp=header";
    }, 1500);
});

document.addEventListener("keydown", (e) => {
    const blockedKeys = [
        " ",
        "Spacebar",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "MediaPlayPause"
    ];

    if (blockedKeys.includes(e.key)) {
        e.preventDefault();
    }
});