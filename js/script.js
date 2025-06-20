// -------------------- LOADING SCREEN --------------------
document.body.classList.add('loading');

// -------------------- PARTICLES BACKGROUND --------------------
window.addEventListener('DOMContentLoaded', () => {
    // Hide loader after 3 seconds
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hide');
        document.body.classList.remove('loading');
    }, 3000);

    // Initialize particlesJS after DOM is ready
    if (window.particlesJS) {
        particlesJS("particles-js", {
            particles: {
                number: { value: 50 },
                size: { value: 2 },
                move: { speed: 2 },
                color: { value: "#ffedf3" }
            }
        });
    }

    // -------------------- LANGUAGE & TRANSLATION --------------------
    let currentLang = "fr"; // Default to French

    async function loadTranslations() {
        try {
            const response = await fetch("/json/translations.json");
            const translations = await response.json();
            updateLanguage(translations);
        } catch (error) {
            console.error("Failed to load translations:", error);
        }
    }

    function updateLanguage(translations) {
        document.querySelectorAll("[data-translate]").forEach(el => {
            const key = el.getAttribute("data-translate");
            if (translations[currentLang] && translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key].replace(/\n/g, "<br>");
            }
        });
    }

    async function detectUserLocation() {
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            currentLang = data.country_code === "FR" ? "fr" : "en";
            localStorage.setItem("lang", currentLang);
            loadTranslations();
        } catch (error) {
            console.error("Geolocation failed, defaulting to French.");
            loadTranslations();
        }
    }

    // Only call translation logic after DOM is ready
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
        currentLang = savedLang;
        loadTranslations();
    } else {
        detectUserLocation();
    }

    // -------------------- NAVIGATION MENU --------------------
    const nav = document.getElementById("main-nav");
    const openBtn = document.getElementById("menu-toggle");
    const closeBtn = document.getElementById("menu-close");

    function openNav() {
        if (nav) {
            nav.hidden = false;
            setTimeout(() => nav.classList.add("open"), 10);
            document.body.style.overflow = "hidden";
        }
    }
    function closeNav() {
        if (nav) {
            nav.classList.remove("open");
            setTimeout(() => { nav.hidden = true; document.body.style.overflow = ""; }, 300);
        }
    }

    if (openBtn && closeBtn && nav) {
        openBtn.addEventListener("click", openNav);
        closeBtn.addEventListener("click", closeNav);

        // Optional: close nav on ESC or click outside
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !nav.hidden) closeNav();
        });
        nav.addEventListener("click", e => {
            if (e.target === nav) closeNav();
        });
    }

    // -------------------- RADIO PLAYER --------------------
    const audio = document.getElementById("audio-player");
    const playButton = document.getElementById("play-btn");
    let reconnectTimeout;

    function playStream() {
        clearTimeout(reconnectTimeout);
        const liveStreamUrl = `https://radio.niprobin.com/listen/body_music_radio/body-radio-256?nocache=${Date.now()}`;
        if (audio) {
            audio.src = liveStreamUrl;
            audio.load();
            audio.play().then(() => {
                if (playButton) playButton.innerHTML = '<i class="fa-solid fa-pause"></i>&nbsp;&nbsp;Pause';
            }).catch(error => {
                console.error("Error playing stream:", error);
                alert("Unable to play the stream. Please check your connection.");
            });
        }
    }

    function pauseStream() {
        clearTimeout(reconnectTimeout);
        if (audio) {
            audio.pause();
            if (playButton) playButton.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;Play';
        }
    }

    function autoReconnect() {
        reconnectTimeout = setTimeout(playStream, 5000);
    }

    if (playButton && audio) {
        playButton.addEventListener("click", () => {
            if (audio.paused) {
                playStream();
            } else {
                pauseStream();
            }
        });

        audio.addEventListener("error", autoReconnect);
        audio.addEventListener("ended", autoReconnect);
    }
});

// -------------------- MEDIA SESSION API --------------------
function updateMediaSession() {
    fetch('https://radio.niprobin.com/api/nowplaying/1')
        .then(response => response.json())
        .then(data => {
            const coverUrl = "https://music.niprobin.com/radio_cover.png";
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "BODY MUSIC RADIO",
                    artist: "A trip through our music library with us",
                    artwork: [{ src: coverUrl, sizes: '512x512', type: 'image/png' }]
                });
            }
        })
        .catch(error => console.error('Error fetching playlist data:', error));
}

updateMediaSession();
setInterval(updateMediaSession, 30000);