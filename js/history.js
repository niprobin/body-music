document.body.classList.add('loading');

document.addEventListener("DOMContentLoaded", () => {
  // Add loading overlay for 2 seconds
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.innerHTML = `
    <div class="loader-content">
      <img src="/assets/web_assets/body_music_duck_logo.png" alt="Loading..." />
      <p>Chargement...</p>
    </div>
  `;
  document.body.appendChild(loader);

  setTimeout(() => {
    loader.classList.add('hide');
    document.body.classList.remove('loading');
  }, 2000);

  const container = document.getElementById("history-container");
  if (!container) return;

  let lastSongId = null;

  function formatPlayedAt(ts) {
    const date = new Date(ts * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const hours = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");
    return isToday
      ? `Aujourd'hui à ${hours}h${mins}`
      : `${date.toLocaleDateString()} à ${hours}h${mins}`;
  }

  function renderHistory(nowPlaying, history) {
    container.innerHTML = "";

    // Add current song as the first card
    if (nowPlaying && nowPlaying.song) {
      const song = nowPlaying.song;
      const card = document.createElement("div");
      card.className = "song-card now-playing";
      card.innerHTML = `
        <img class="song-artwork" src="${song.art || 'https://music.niprobin.com/radio_cover.png'}" alt="Album cover" />
        <div class="song-info">
          <p class="song-title">${song.title || "Unknown Title"}</p>
          <p class="song-artist">${song.artist || "Unknown Artist"}</p>
          <p class="song-played-at">En ce moment</p>
        </div>
      `;
      container.appendChild(card);
    }

    // Add last 10 songs (excluding current if it's duplicated)
    history.forEach(entry => {
      const song = entry.song || {};
      // Avoid duplicate if current song is also first in history
      if (
        nowPlaying &&
        nowPlaying.song &&
        song.title === nowPlaying.song.title &&
        song.artist === nowPlaying.song.artist
      ) {
        return;
      }
      const card = document.createElement("div");
      card.className = "song-card";
      card.innerHTML = `
          <img class="song-artwork" src="${song.art || 'https://music.niprobin.com/radio_cover.png'}" alt="Album cover" />
        <div class="song-info">
          <p class="song-title">${song.title || "Unknown Title"}</p>
          <p class="song-artist">${song.artist || "Unknown Artist"}</p>
          <p class="song-played-at">${formatPlayedAt(entry.played_at)}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function fetchAndUpdate(force = false) {
    // Show loading if container is empty
    if (!container.innerHTML.trim()) {
      container.innerHTML = "<p>Chargement...</p>";
    }
    fetch("https://radio.niprobin.com/api/nowplaying/1?cb=" + Date.now())
      .then(res => res.json())
      .then(data => {
        const nowPlaying = data.now_playing;
        const history = data.song_history.slice(0, 10);
        const latestId = nowPlaying?.sh_id || nowPlaying?.played_at || history[0]?.sh_id || history[0]?.played_at;
        // Update if forced or if the latest song has changed
        if (force || latestId !== lastSongId) {
          renderHistory(nowPlaying, history);
          lastSongId = latestId;
        }
      })
      .catch(err => {
        container.innerHTML = "<p>Impossible de charger l'historique des morceaux.</p>";
        console.error(err);
      });
  }

  // Initial fetch
  fetchAndUpdate(true);

  // Poll every 10 seconds for updates
  setInterval(() => fetchAndUpdate(false), 10000);
});