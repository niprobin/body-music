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

//Open modal with current song
const modal = document.getElementById("song-modal");
const closeModal = document.getElementById("close-modal");
const showModalButton = document.getElementById("show-modal");

// API URL for nowPlaying data
const nowPlayingApiUrl = "https://radio.niprobin.com/api/nowplaying/1";

showModalButton.addEventListener("click", () => {
    // Fetch currently playing song data
    fetch(nowPlayingApiUrl)
        .then((response) => response.json())
        .then((data) => {
            // Get song details
            const song = data.now_playing.song;
            const songArt = song.art || "default_art.jpg"; // Provide a fallback image if art is missing
            const songTitle = song.title || "Unknown Title";
            const songArtist = song.artist || "Unknown Artist";

            // Update modal content
            document.getElementById("song-art").src = songArt;
            document.getElementById("song-title").innerText = songTitle;
            document.getElementById("song-artist").innerText = songArtist;

            // Show modal
            modal.style.display = "flex";
        })
        .catch((error) => {
            console.error("Error fetching song data:", error);
            alert("Could not fetch the currently playing song. Please try again later.");
        });
});

// Close the modal on button click
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close the modal when clicking outside of it
window.addEventListener("click", (event) => {
    // Ensure the modal is hidden only when clicking outside of it
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
    

