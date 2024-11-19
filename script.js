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

// Replace this with your actual AzuraCast API endpoint
const apiUrl = "https://radio.niprobin.com/api/station/1/schedule";

// Function to fetch and render playlists
async function fetchAndRenderPlaylists() {
    const currentPlaylistDiv = document.getElementById('currentPlaylist');
    const upcomingPlaylistsDiv = document.getElementById('upcomingPlaylists');

    try {
        // Fetch playlist data from the API
        const response = await fetch(apiUrl);
        const data = await response.json();

        const currentTime = Math.floor(Date.now() / 1000);

        // Find current and upcoming playlists
        const current = data.find(item => item.is_now);
        const upcoming = data.filter(item => item.start_timestamp > currentTime);
      
        // Function to format timestamps without seconds
        const formatTime = (timestamp) => {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
                   " " +
                   date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        };

        // Render Current Playlist
        if (current) {
            currentPlaylistDiv.innerHTML = `
                <p>${current.title}</p>
            `;
        } else {
            currentPlaylistDiv.innerHTML = `<p>A bit of everything 👽</p>`;
        }

        // Render Upcoming Playlists
        upcomingPlaylistsDiv.innerHTML = ""; // Clear previous content
        if (upcoming.length > 0) {
            upcoming.forEach(playlist => {
                const playlistHTML = `
                    <div class="playlist-card">
                      <table class="schedule-table" width="100%" border="0" cellpadding="0" cellspacing="0" align="center">
                      <tbody>
                        <tr>
                          <td id="upcoming-playlist-name">${playlist.title}</td>
                          <td id="upcoming-playlist-time">${formatTime(playlist.start_timestamp)}</td>
                       </tr>
                       </tbody>
                      </table>
                    </div>
                `;
                upcomingPlaylistsDiv.innerHTML += playlistHTML;
            });
        } else {
            upcomingPlaylistsDiv.innerHTML = `<p>No upcoming playlists.</p>`;
        }
    } catch (error) {
        console.error("Error fetching playlist data:", error);
        currentPlaylistDiv.innerHTML = `<p>Unable to load playlist data. Please try again later.</p>`;
        upcomingPlaylistsDiv.innerHTML = `<p>Unable to load playlist data. Please try again later.</p>`;
    }
}

// Initialize
fetchAndRenderPlaylists();
setInterval(fetchAndRenderPlaylists, 60000);
