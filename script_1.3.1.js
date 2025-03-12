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
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            })
            .catch((error) => {
                console.error("Playback failed:", error);
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            });
    } else {
        // Pause playback if currently playing
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
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

// ----------------------- BEST ALBUMS JS -----------------------

const albumDataUrl = "https://opensheet.elk.sh/1gHxDBsWpkbOQ-exCD6iIC-uJS3JMjVmfFLvM8UO93qc/data_albums"; // URL to fetch album data
const albumsContainer = document.getElementById("albums-container");
const genreFilter = document.getElementById("genre-filter");
const ratingFilter = document.getElementById("rating-filter");

let albumsData = [];

// Fetch data from the album data URL
async function fetchAlbums() {
  try {
    const response = await fetch(albumDataUrl);
    if (!response.ok) throw new Error("Failed to fetch data");
    const albums = await response.json();
    albumsData = albums;
    populateGenreFilter(albums);
    populateRatingFilter(albums);
    displayAlbums(albums);
  } catch (error) {
    console.error("Error:", error);
    albumsContainer.innerHTML = "<p>Failed to load albums. Please try again later.</p>";
  }
}

// Populate genre filter options
function populateGenreFilter(albums) {
  const genres = new Set();
  albums.forEach(album => {
    album.genre.split(',').forEach(genre => {
      genres.add(genre.trim());
    });
  });
  const sortedGenres = Array.from(genres).sort();
  sortedGenres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Populate rating filter options
function populateRatingFilter(albums) {
  const ratings = new Set(albums.map(album => album.rating));
  const sortedRatings = Array.from(ratings).sort((a, b) => a - b);
  sortedRatings.forEach(rating => {
    const option = document.createElement("option");
    option.value = rating;
    option.textContent = rating;
    ratingFilter.appendChild(option);
  });
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
              <a href="${album.spotify_url}" target="_blank"><i class="fa-brands fa-youtube"></i>&nbsp;&nbsp;<i class="fa-brands fa-spotify"></i>&nbsp;Listen to the album</a>
          </div>
        </div>
      </div>
    `;

    albumDiv.innerHTML = albumHTML;
    albumsContainer.appendChild(albumDiv);
  });
}

// Filter albums based on selected genre and rating
function filterAlbums() {
  const selectedGenre = genreFilter.value;
  const selectedRating = ratingFilter.value;
  const filteredAlbums = albumsData.filter(album => {
    const albumGenres = album.genre.split(',').map(genre => genre.trim());
    return (selectedGenre ? albumGenres.includes(selectedGenre) : true) &&
           (selectedRating ? album.rating === selectedRating : true);
  });
  displayAlbums(filteredAlbums);
}

// Event listeners for genre and rating filters
genreFilter.addEventListener("change", filterAlbums);
ratingFilter.addEventListener("change", filterAlbums);

// Call fetchAlbums to load and display albums data
fetchAlbums();
