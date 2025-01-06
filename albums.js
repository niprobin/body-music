const webAppUrl = "https://script.google.com/macros/s/AKfycbxxDIYpN5J0mxDpaTDoGe3WtzO0FGc6Z8hmULZl4BK2z8XfvQaOSf4fAFw30Zpz9wCP/exec"; // Replace with your Google Web App URL
const albumsContainer = document.getElementById("albums-container");

// Fetch data from the Google Web App
async function fetchAlbums() {
  try {
    const response = await fetch(webAppUrl);
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
    const releasedInFormatted = formatDate(album.released_in);
    const listenedInFormatted = formatDate(album.listened_in);


    const albumHTML = `
    <div class="album">  
        <img class="album-cover" src="${coverArt}" alt="Album Cover">
        <div class="album-details">
            <p class="genre">${album.genre}</p>
            <h3>${album.album}</h3>
            <p>${album.artist}</p>
            <div class="additional-info">
              <p class="listen-year">Discovered: ${listenedInFormatted}</p>
              <hr style="border-top:1px solid #fff;margin:3px 0px;">
              <p class="rating"><strong>Rated ${album.rating} <i class="fa-solid fa-star"></i></strong></p>
            </div>
              <a class="album-link" href="${album.spotify_url}" target="_blank"><i class="fa-brands fa-spotify"></i>&nbsp;Spotify</a>
        </div>
      </div>
    `;

    albumDiv.innerHTML = albumHTML;
    albumsContainer.appendChild(albumDiv);
  });
}

// Fetch and display albums when the page loads
fetchAlbums(); 