// ----------------------- BEST ALBUMS JS -----------------------

const albumDataUrl = "https://opensheet.elk.sh/1gHxDBsWpkbOQ-exCD6iIC-uJS3JMjVmfFLvM8UO93qc/data_albums"; // URL to fetch album data
const albumsContainer = document.getElementById("albums-container");
const genreFilter = document.getElementById("genre-filter");
const ratingFilter = document.getElementById("rating-filter");
const paginationControls = document.getElementById("pagination-controls");

let albumsData = [];
let currentPage = 1;
const itemsPerPage = 8;

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlbums = albums.slice(startIndex, endIndex);

  paginatedAlbums.forEach(album => {
    // Create album card
    const albumDiv = document.createElement("div");
    albumDiv.className = "album";

    const coverArt = album.cover_art || "https://via.placeholder.com/80";

    const albumHTML = `
    <div>
        <div class="cover-art"> 
          <img class="album-cover" src="${coverArt}" alt="Album Cover">
        </div>
        <div class="album-details">
          <div class="additional-info">
            <p><mark>&nbsp;Genres&nbsp;</mark>&nbsp;${album.genre}</p>
            <p><mark>&nbsp;Rated&nbsp;</mark>&nbsp;${album.rating} <i class="fa-solid fa-star"></i></p> 
          </div>
          <div class="main-info">
            <p class="album-name">${album.album}</p>
            <p class="artist">${album.artist}</p>
          </div>
        </div>
        <div class="album-link">
              <a href="${album.spotify_url}" target="_blank"><i class="fa-brands fa-youtube"></i>&nbsp;&nbsp;<i class="fa-brands fa-spotify"></i>&nbsp;Listen to the album</a>
        </div>
      </div>
    `;

    albumDiv.innerHTML = albumHTML;
    albumsContainer.appendChild(albumDiv);
  });

  displayPaginationControls(albums.length);
}

// Display pagination controls
function displayPaginationControls(totalItems) {
  paginationControls.innerHTML = ""; // Clear existing controls

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? "active" : "";
    pageButton.addEventListener("click", () => {
      currentPage = i;
      filterAlbums();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    paginationControls.appendChild(pageButton);
  }

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAlbums();
    }
  });
  paginationControls.insertBefore(prevButton, paginationControls.firstChild);

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      filterAlbums();
    }
  });
  paginationControls.appendChild(nextButton);
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
genreFilter.addEventListener("change", () => {
  currentPage = 1; // Reset to first page on filter change
  filterAlbums();
});
ratingFilter.addEventListener("change", () => {
  currentPage = 1; // Reset to first page on filter change
  filterAlbums();
});

// Call fetchAlbums to load and display albums data
fetchAlbums();