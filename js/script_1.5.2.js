// -------------------- PARTICLES BACKGROUND --------------------
particlesJS("particles-js", {
    particles: {
        number: { value: 20 },
        size: { value: 3 },
        move: { speed: 1 },
        color: { value: "#ffffff" }
    }
});

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

const savedLang = localStorage.getItem("lang");
if (savedLang) {
    currentLang = savedLang;
    loadTranslations();
} else {
    detectUserLocation();
}

// -------------------- DOM READY --------------------
document.addEventListener("DOMContentLoaded", () => {
    // -------------------- RADIO PLAYER --------------------
    const audio = document.getElementById("audio-player");
    const playButton = document.getElementById("play-btn");
    let reconnectTimeout;

    function playStream() {
        clearTimeout(reconnectTimeout);
        const liveStreamUrl = `https://radio.niprobin.com/listen/body_music_radio/body-radio-256?nocache=${Date.now()}`;
        audio.src = liveStreamUrl;
        audio.load();
        audio.play().then(() => {
            playButton.innerHTML = '<i class="fa-solid fa-pause"></i>&ensp;Pause';
        }).catch(error => {
            console.error("Error playing stream:", error);
            alert("Unable to play the stream. Please check your connection.");
        });
    }

    function pauseStream() {
        clearTimeout(reconnectTimeout);
        audio.pause();
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>&ensp;Play';
    }

    function autoReconnect() {
        reconnectTimeout = setTimeout(playStream, 5000);
    }

    playButton.addEventListener("click", () => {
        if (audio.paused) {
            playStream();
        } else {
            pauseStream();
        }
    });

    audio.addEventListener("error", autoReconnect);
    audio.addEventListener("ended", autoReconnect);

    // -------------------- SONG MODAL --------------------
    const nowPlayingApiUrl = "https://radio.niprobin.com/api/nowplaying/1";
    const songModal = document.getElementById("song-modal");
    const modalBtn = document.getElementById("modal-btn");

    modalBtn.addEventListener("click", () => {
        if (songModal.classList.contains("show")) {
            songModal.classList.remove("show");
            modalBtn.blur();
        } else {
            fetch(nowPlayingApiUrl)
                .then(response => response.json())
                .then(data => {
                    const song = data.now_playing.song || {};
                    document.getElementById("song-art").src = song.art || "https://radio.niprobin.com/static/uploads/body-music/album_art.1735556879.png";
                    document.getElementById("song-title").innerText = song.title || "A great song";
                    document.getElementById("song-artist").innerText = song.artist || "A great artist";
                    songModal.classList.add("show");
                })
                .catch(error => {
                    console.error("Error fetching song data:", error);
                    alert("Could not fetch the currently playing song. Please try again later.");
                });
        }
    });

    // -------------------- SOURCE MODAL --------------------
    const sourceModal = document.getElementById("source-modal");
    const sourceBtn = document.getElementById("source-btn");

    sourceBtn.addEventListener("click", () => {
        sourceModal.classList.toggle("show");
        sourceBtn.blur();
    });

    // Optional: Close modals when clicking outside or pressing Escape
    document.addEventListener("click", (e) => {
        if (songModal.classList.contains("show") && !songModal.contains(e.target) && e.target !== modalBtn) {
            songModal.classList.remove("show");
        }
        if (sourceModal.classList.contains("show") && !sourceModal.contains(e.target) && e.target !== sourceBtn) {
            sourceModal.classList.remove("show");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            songModal.classList.remove("show");
            sourceModal.classList.remove("show");
        }
    });
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
setInterval(updateMediaSession, 30000); // Refresh every 30 seconds