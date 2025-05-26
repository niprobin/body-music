particlesJS("particles-js", {
    particles: {
        number: { value: 20 },
        size: { value: 3 },
        move: { speed: 1 },
        color: { value: "#ffffff" }
    }
});


let currentLang = "fr"; // Default to French

async function loadTranslations() {
    const response = await fetch("/json/translations.json");
    const translations = await response.json();
    updateLanguage(translations);
}

function updateLanguage(translations) {
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        el.innerHTML = translations[currentLang][key].replace(/\n/g, "<br>"); // Convert \n to <br>
    });
}

// Detect user location and set language automatically
async function detectUserLocation() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        // Set language based on country (France = French, Else = English)
        currentLang = data.country_code === "FR" ? "fr" : "en";
        localStorage.setItem("lang", currentLang); // Save preference for next visits
        loadTranslations();
    } catch (error) {
        console.error("Geolocation failed, defaulting to French.");
        loadTranslations(); // Load default language if geolocation fails
    }
}

// Check if user has a saved language preference from last visit
const savedLang = localStorage.getItem("lang");
if (savedLang) {
    currentLang = savedLang;
    loadTranslations();
} else {
    detectUserLocation(); // Auto-detect location on first visit
}

// ----------------------- RADIO PLAYER JS -----------------------

document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById("audio-player");
    const playButton = document.getElementById("play-btn");
    let reconnectTimeout;

    // Function to handle play behavior
    function playStream() {
        clearTimeout(reconnectTimeout); // Clear any existing reconnect attempts

        // Force the stream to start at the live point by appending a unique query parameter
        const liveStreamUrl = `https://radio.niprobin.com/listen/body_music_radio/body-radio-256?nocache=${Date.now()}`;
        audio.src = liveStreamUrl; // Update the audio source
        audio.load(); // Reload the stream

        audio.play().then(() => {
            console.log("Stream is playing.");
            playButton.innerHTML = '<i class="fa-solid fa-pause"></i>&nbsp;&nbsp;Pause';
        }).catch(error => {
            console.error("Error playing stream:", error);
            alert("Unable to play the stream. Please check your connection.");
        });
    }

    // Function to handle pause behavior
    function pauseStream() {
        clearTimeout(reconnectTimeout); // Clear any existing reconnect attempts
        audio.pause();
        console.log("Stream is paused.");
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;Play';
    }

    // Function to handle auto-reconnect
    function autoReconnect() {
        console.log("Attempting to reconnect...");
        reconnectTimeout = setTimeout(() => {
            playStream(); // Attempt to play the stream again
        }, 5000); // Retry after 5 seconds
    }

    // Event listener for play button
    playButton.addEventListener("click", function () {
        if (audio.paused) {
            playStream();
        } else {
            pauseStream();
        }
    });

    // Handle errors during playback
    audio.addEventListener("error", function () {
        console.error("Audio playback error occurred. Reconnecting...");
        autoReconnect();
    });

    // Handle stream ending
    audio.addEventListener("ended", function () {
        console.log("Stream ended. Reconnecting...");
        autoReconnect();
    });
});

// ----------------------- MEDIA SESSION API -----------------------

//Update metadata for mobile rich notification
function updateMediaSession() {
  fetch('https://radio.niprobin.com/api/nowplaying/1')
    .then(response => response.json())
    .then(data => {
      console.log(data); // Verify the structure

      // Safely extract playlist info
      const playlistName = data.now_playing.playlist || 'Probably some good stuff';
      const coverUrl = "https://music.niprobin.com/radio_cover.png"

      // Set Media Session Metadata
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "BODY MUSIC RADIO", //Fixed radio name
          artist: "A trip through our music library with us", // Playlist name as the subtitle
          artwork: [{ src: coverUrl, sizes: '512x512', type: 'image/png' }], //album cover as the background
        });
      }
    })
    .catch(error => console.error('Error fetching playlist data:', error));
}

// Fetch data immediately and then set an interval
updateMediaSession();
setInterval(updateMediaSession, 30000); // Refresh every 30 seconds

// ----------------------- SONG MODAL JS -----------------------

const nowPlayingApiUrl = "https://radio.niprobin.com/api/nowplaying/1";
const modal = document.getElementById("song-modal");
const modalBtn = document.getElementById("modal-btn");

modalBtn.addEventListener("click", () => {
    if (modal.classList.contains("show")) {
        // If modal is already open, close it
        modal.classList.remove("show");
        modalBtn.setAttribute("id", "modal-btn"); // Reset button ID
    } else {
        // Fetch currently playing song data
        fetch(nowPlayingApiUrl)
            .then((response) => response.json())
            .then((data) => {
                // Get song details
                const song = data.now_playing.song;
                const songArt = song.art || "https://radio.niprobin.com/static/uploads/body-music/album_art.1735556879.png"; // Provide a fallback image if art is missing
                const songTitle = song.title || "A great song";
                const songArtist = song.artist || "A great artist";

                // Update modal content
                document.getElementById("song-art").src = songArt;
                document.getElementById("song-title").innerText = songTitle;
                document.getElementById("song-artist").innerText = songArtist;

                // Show modal
                modal.classList.add("show");
            })
            .catch((error) => {
                console.error("Error fetching song data:", error);
                alert("Could not fetch the currently playing song. Please try again later.");
            });
    }
});

// ----------------------- SOURCE MODAL JS -----------------------

const sourceModal = document.getElementById("source-modal");
const sourceBtn = document.getElementById("source-btn");

sourceBtn.addEventListener("click", () => {
    if (sourceModal.classList.contains("show")) {
        // If modal is already open, close it
        sourceModal.classList.remove("show");
        sourceBtn.setAttribute("id", "modal-btn"); // Reset button ID
    } else {
        // Show modal
        sourceModal.classList.add("show");
            };
    });
