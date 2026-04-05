const video = document.getElementById("video");
        const overlay = document.getElementById("overlay");
        const statusText = document.getElementById("statusText");
        const progress = document.getElementById("progress");
        const speedBadge = document.getElementById("speedBadge");
        const speedButtons = document.querySelectorAll(".speed-btn");

        let hasStarted = false;
        let hasEnded = false;
        let selectedSpeed = null;
        let lastAllowedTime = 0;

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

            speedBadge.textContent = `Selected speed: x${speed}`;
            statusText.textContent = `Video is playing at x${speed}...`;
            overlay.classList.add("hidden");

            try {
                await video.play();
            } catch (error) {
                statusText.textContent = "Playback was blocked. Please click again.";
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
            statusText.textContent = "Video finished. Redirecting to the test...";

            setTimeout(() => {
                window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLScB56OfvBlerydAEHXDTaJfLWcyGpfH-YgCsPv9pEDZIwCP-Q/viewform?usp=header";
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