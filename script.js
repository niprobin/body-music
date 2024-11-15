// Replace with your AzuraCast stream and API URLs
const streamUrl = "https://radio.niprobin.com:8000/radio.mp3";
const nowPlayingApiUrl = "https://radio.niprobin.com/api/nowplaying/1";

// DOM Elements
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
const audioPlayer = document.getElementById("audio-player");
const coverArt = document.getElementById("cover-art");
const artistSong = document.getElementById("artist-song");
const nowPlayingTitle = document.getElementById("now-playing-title");

// Play and Pause Functionality
playBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
        audioPlayer.src = streamUrl;
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>&nbsp;&nbsp;PAUSE';
        
    } else {
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;PLAY';
        
    }
});

// Fetch Now Playing Info
async function fetchNowPlaying() {
    try {
        const response = await fetch(nowPlayingApiUrl);
        if (!response.ok) throw new Error("API call failed");
        const data = await response.json();

        // Update UI
        const albumArt = data.now_playing.song.art || "https://iili.io/HlHy9Yx.png";

        coverArt.src = albumArt;
    } catch (error) {
        console.error("Error fetching Now Playing info:", error);
    }
}

// Update Now Playing Info Every 5 Seconds
setInterval(fetchNowPlaying, 5000);
fetchNowPlaying();

// Volume slider JS
const volumeControl = document.getElementById("volume-control");
volumeControl.addEventListener("input", (e) => {
    audioPlayer.volume = e.target.value;
});

// Replace with your AzuraCast station schedule API URL
const scheduleApiUrl = "https://radio.niprobin.com/api/station/1/schedule";

// DOM element for current playlist
const currentPlaylistEl = document.getElementById("current-playlist");

// Function to fetch and display the current playlist
async function fetchCurrentPlaylist() {
    try {
        // Fetch the schedule data
        const response = await fetch(scheduleApiUrl);
        if (!response.ok) throw new Error("Failed to fetch schedule.");
        const schedule = await response.json();

        // Find the current playlist based on `is_now` property
        const currentPlaylist = schedule.find(event => event.is_now);

        // Update the DOM with the current playlist or show a default message
        currentPlaylistEl.textContent = currentPlaylist 
            ? currentPlaylist.name 
            : "No playlist currently playing";

    } catch (error) {
        console.error("Error fetching schedule:", error);
        currentPlaylistEl.textContent = "Error loading playlist";
    }
}

// Fetch and update the current playlist every minute
fetchCurrentPlaylist();
setInterval(fetchCurrentPlaylist, 60000);