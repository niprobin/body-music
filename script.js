// Replace with your AzuraCast stream URL
const streamUrl = "https://radio.niprobin.com:8000/radio.mp3";

// DOM Elements
const playBtn = document.getElementById("play-btn");
const audioPlayer = document.getElementById("audio-player");

// Play and Pause Functionality
playBtn.addEventListener("click", () => {
    if (audioPlayer.paused || audioPlayer.readyState === 0) {
        // If paused OR not yet loaded, start playback
        audioPlayer.src = streamUrl; // Ensure the stream URL is loaded
        audioPlayer.load(); // Reload the stream
        audioPlayer.play()
            .then(() => {
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>&nbsp;&nbsp;Pause';
            })
            .catch((error) => {
                console.error("Playback failed:", error);
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;Play';
            });
    } else {
        // Pause playback if currently playing
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;Play';
    }
});

// Set initial volume
audioPlayer.volume = 0.5;


// API endpoint to get the radio schedule
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
      
        // Function to calculate time remaining
        const calculateTimeRemaining = (startTimestamp) => {
            const now = Math.floor(Date.now() / 1000);
            const diff = startTimestamp - now;

            if (diff <= 0) return "Now";

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);

            return `${hours}h ${minutes}m`;
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
                          <td id="upcoming-playlist-time">Starts in ${calculateTimeRemaining(playlist.start_timestamp)}</td>
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
          artist: playlistName, // Playlist name as the subtitle
          artwork: [{ src: coverUrl, sizes: '512x512', type: 'image/png' }], //album cover as the background
        });
      }
    })
    .catch(error => console.error('Error fetching playlist data:', error));
}

// Fetch data immediately and then set an interval
updateMediaSession();
setInterval(updateMediaSession, 30000); // Refresh every 30 seconds

//Drawer functionality
const openDrawerBtn = document.getElementById("open-drawer-btn");
const closeDrawerBtn = document.getElementById("close-drawer-btn");
const drawer = document.getElementById("drawer");

// Open the drawer
openDrawerBtn.addEventListener("click", () => {
  drawer.classList.add("open");
});

// Close the drawer
closeDrawerBtn.addEventListener("click", () => {
  drawer.classList.remove("open");
});

//Schedule-drawer functionality
const openScheduleDrawerBtn = document.getElementById("open-schedule-drawer-btn");
const closeScheduleDrawerBtn = document.getElementById("close-schedule-drawer-btn");
const Scheduledrawer = document.getElementById("schedule-drawer");

// Open the drawer
openScheduleDrawerBtn.addEventListener("click", () => {
  Scheduledrawer.classList.add("open");
});

// Close the drawer
closeScheduleDrawerBtn.addEventListener("click", () => {
  Scheduledrawer.classList.remove("open");
});

