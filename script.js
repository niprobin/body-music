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

document.getElementById("fetch-song").addEventListener("click", async () => {
  try {
      // Fetch data from the API
      const response = await fetch("https://radio.niprobin.com/api/station/1/history");
      const data = await response.json();

      // Check if data is available
      if (data.length > 0) {
          const currentSong = data[0].song; // Get the first item (currently playing)

          // Populate modal with song details
          document.getElementById("song-title").textContent = currentSong.title;
          document.getElementById("song-artist").textContent = currentSong.artist;
          document.getElementById("song-art").src = currentSong.art;

          // Show the modal
          document.getElementById("modal").style.display = "block";
      } else {
          alert("No data available.");
      }
  } catch (error) {
      console.error("Error fetching the song details:", error);
      alert("Failed to fetch the song details. Try again later.");
  }
});

// Close the modal
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});


