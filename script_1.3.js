// Replace with your AzuraCast stream URL
const streamUrl = "https://radio.niprobin.com/listen/body-music/radio.mp3";

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
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>&nbsp;&nbsp;PAUSE';
            })
            .catch((error) => {
                console.error("Playback failed:", error);
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;PLAY';
            });
    } else {
        // Pause playback if currently playing
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp;&nbsp;PLAY';
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
            const songArt = song.art || "https://radio.niprobin.com/static/uploads/body-music/album_art.1735556879.png"; // Provide a fallback image if art is missing
            const songTitle = song.title || "A great song";
            const songArtist = song.artist || "A great artist";

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

// ----------------------- BEST ALBUMS JS -----------------------

const netlifyFunctionUrl = "/.netlify/fuctions/albums.js"; // Replace with your Google Web App URL
const albumsContainer = document.getElementById("albums-container");

// Fetch data from the Google Web App
async function fetchAlbums() {
  try {
    const response = await fetch(netlifyFunctionUrl);
    if (!response.ok) throw new Error("Failed to fetch data");
    const albums = await response.json();
    displayAlbums(albums);
  } catch (error) {
    console.error("Error:", error);
    albumsContainer.innerHTML = "<p>Failed to load albums. Please try again later.</p>";
  }
}

// Format a date in "Month Year" format
function formatDate(dateString) {
  if (!dateString) return "Unknown Date";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date);
}

// Display albums in the container
function displayAlbums(albums) {
  albumsContainer.innerHTML = ""; // Clear any existing content

  albums.forEach(album => {
    // Create album card
    const albumDiv = document.createElement("div");
    albumDiv.className = "album";

    const coverArt = album.cover_art || "https://via.placeholder.com/80";
    const listenedInFormatted = formatDate(album.listened_in);


    const albumHTML = `
    <div>
        <div class="cover-rating">
          <p class="rating">Rated ${album.rating} <i class="fa-solid fa-star"></i></p>  
          <img class="album-cover" src="${coverArt}" alt="Album Cover">
        </div>
        <div class="album-details">
          <div class="additional-info">
            <p><mark>&nbsp;Genres&nbsp;</mark><br>${album.genre}</p>
            <p class="listen-year"><mark>&nbsp;Discovered&nbsp;</mark><br>${listenedInFormatted}</p>
          </div>
          <div class="main-info">
            <p class="album-name">${album.album}</p>
            <p class="artist">${album.artist}</p>
          </div>
          <div class="additional-info">
            
          </div>
          <div class="album-link">
              <a href="${album.spotify_url}" target="_blank"><i class="fa-brands fa-spotify"></i>&nbsp;Listen on Spotify</a>
          </div>
        </div>
      </div>
    `;

    albumDiv.innerHTML = albumHTML;
    albumsContainer.appendChild(albumDiv);
  });
}

// Fetch and display albums when the page loads
fetchAlbums(); 


// ----------------------- DRAWER JS -----------------------

// DOM Elements for schedule and comment drawers
const openScheduleBtn = document.getElementById("open-schedule-btn");
const openCommentBtn = document.getElementById("open-comment-btn");
const scheduleDrawer = document.getElementById("schedule-drawer");
const commentDrawer = document.getElementById("comment-drawer");
const closeScheduleBtn = document.getElementById("close-schedule-btn");
const closeCommentBtn = document.getElementById("close-comment-btn");
const websiteBody = document.body;

// Open and close functions for the schedule drawer
openScheduleBtn.addEventListener("click", () => {
    scheduleDrawer.classList.add("open"); // Show the schedule drawer
    websiteBody.classList.add("no-scroll"); // Disable scrolling on the body
});

closeScheduleBtn.addEventListener("click", () => {
    scheduleDrawer.classList.remove("open"); // Hide the schedule drawer
    websiteBody.classList.remove("no-scroll"); // Disable scrolling on the body
});

// Open and close functions for the comment drawer
openCommentBtn.addEventListener("click", () => {
    commentDrawer.classList.add("open"); // Show the comment drawer
});

closeCommentBtn.addEventListener("click", () => {
    commentDrawer.classList.remove("open"); // Hide the comment drawer
});


// ----------------------- TODAY SCHEDULE JS -----------------------

async function loadSchedule() {
  try {
      // Fetch JSON data
      const response = await fetch("schedule.json");
      const scheduleData = await response.json();

      // Get current day and time
      const now = new Date();
      const currentDay = now.toLocaleString("en-US", { weekday: "long" });
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert time to minutes

      // Select the schedule container
      const scheduleList = document.getElementById("schedule-list");
      scheduleList.innerHTML = ""; // Clear previous content
      let currentDayElement = null; // Store reference for scrolling

      // Loop through all days
      for (let day in scheduleData) {
          const dayDiv = document.createElement("div");
          dayDiv.classList.add("schedule-day");

          // Highlight the current day & set an ID for scrolling
          if (day === currentDay) {
              dayDiv.classList.add("current-day");
              dayDiv.id = "current-day"; // Unique ID for scrolling
              currentDayElement = dayDiv;
          }

          // Add day title
          dayDiv.innerHTML = `<h3>${day}</h3>`;

          // Loop through the shows for the day
          scheduleData[day].forEach(show => {
              const showItem = document.createElement("div");
              showItem.classList.add("schedule-item");

              // Convert show times to minutes
              const [startHours, startMinutes] = show.start.split(":").map(Number);
              const [endHours, endMinutes] = show.end.split(":").map(Number);
              const startTime = startHours * 60 + startMinutes;
              const endTime = endHours * 60 + endMinutes;

              // Highlight the currently playing show
              if (day === currentDay && currentTime >= startTime && currentTime < endTime) {
                  showItem.classList.add("current-show");
              }

              showItem.innerHTML = `${show.start} &#8212; ${show.end} &#124; ${show.show}`;
              dayDiv.appendChild(showItem);
          });

          scheduleList.appendChild(dayDiv);
      }

      // Scroll to the current day after rendering
      if (currentDayElement) {
          setTimeout(() => {
              currentDayElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 500); // Small delay to ensure rendering is complete
      }

  } catch (error) {
      console.error("Error loading schedule:", error);
  }
}

// Load schedule immediately & refresh every 5 minutes
loadSchedule();
setInterval(loadSchedule, 5 * 60 * 1000); // Refresh every 5 minutes (300,000 ms)

// Also ensure it runs when the DOM is fully ready (fallback)
document.addEventListener("DOMContentLoaded", loadSchedule);
