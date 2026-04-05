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

/* ============================= */
/* 🔒 BLOCK ACCESS IF REFRESHED  */
/* ============================= */

if (localStorage.getItem("videoStarted") === "true") {
    document.body.innerHTML = `
        <div style="
            display:flex;
            height:100vh;
            justify-content:center;
            align-items:center;
            background:#0f172a;
            color:white;
            font-family:Arial;
            text-align:center;
            padding:20px;
        ">
            <div>
                <h1>Access blocked</h1>
                <p>You refreshed the page during the experiment.<br>
                Please restart the session.</p>
            </div>
        </div>
    `;
}

/* ============================= */
/* ⏱ FORMAT TIMER               */
/* ============================= */

function formatTime(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    const m = String(Math.floor(safe / 60)).padStart(2, "0");
    const s = String(safe % 60).padStart(2, "0");
    return `${m}:${s}`;
}

/* ============================= */
/* ▶ START VIDEO                */
/* ============================= */

async function startVideoWithSpeed(speed) {
    if (hasStarted) return;

    hasStarted = true;
    selectedSpeed = speed;

    // 🚨 mark session started (anti-refresh)
    localStorage.setItem("videoStarted", "true");

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
        statusText.textContent = "Playback blocked. Click again.";
        hasStarted = false;
        overlay.classList.remove("hidden");
        console.error(error);
    }
}

/* ============================= */
/* 🎯 SPEED BUTTONS             */
/* ============================= */

speedButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const speed = parseFloat(btn.dataset.speed);
        startVideoWithSpeed(speed);
    });
});

/* ============================= */
/* ⏱ TIMER + PROGRESS          */
/* ============================= */

video.addEventListener("loadedmetadata", () => {
    if (video.duration) {
        timerText.textContent = formatTime(video.duration);
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

/* ============================= */
/* 🔒 ANTI CHEAT                */
/* ============================= */

// ❌ Prevent pause
video.addEventListener("pause", () => {
    if (!video.ended && hasStarted) {
        video.play().catch(() => {});
    }
});

// ❌ Prevent skip forward
video.addEventListener("seeking", () => {
    if (hasStarted && !video.ended) {
        if (video.currentTime > lastAllowedTime + 0.3) {
            video.currentTime = lastAllowedTime;
        }
    }
});

// ❌ Prevent changing speed manually
video.addEventListener("ratechange", () => {
    if (hasStarted && selectedSpeed && video.playbackRate !== selectedSpeed) {
        video.playbackRate = selectedSpeed;
    }
});

// ❌ Disable right click
video.addEventListener("contextmenu", (e) => e.preventDefault());

// ❌ Block keyboard controls
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

/* ============================= */
/* 🔒 REFRESH WARNING           */
/* ============================= */

window.onbeforeunload = function () {
    if (hasStarted && !hasEnded) {
        return "You cannot leave or refresh during the experiment.";
    }
};

/* ============================= */
/* 👀 TAB SWITCH DETECTION      */
/* ============================= */

document.addEventListener("visibilitychange", () => {
    if (document.hidden && hasStarted && !video.ended) {
        alert("Please stay on the video page!");
    }
});

/* ============================= */
/* ✅ VIDEO END                 */
/* ============================= */

video.addEventListener("ended", () => {
    if (hasEnded) return;

    hasEnded = true;

    progress.style.width = "100%";
    timerText.textContent = "00:00";
    statusText.textContent = "Finished. Redirecting...";

    // ✅ allow future sessions
    localStorage.removeItem("videoStarted");

    setTimeout(() => {
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLScB56OfvBlerydAEHXDTaJfLWcyGpfH-YgCsPv9pEDZIwCP-Q/viewform?usp=header";
    }, 1500);
});