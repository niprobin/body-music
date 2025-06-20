document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("history-container");
  if (!container) return;

  let lastSongId = null;
  let lastFullRefresh = Date.now();

  function formatPlayedAt(ts) {
    const date = new Date(ts * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const hours = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");
    return isToday
      ? `Aujourd'hui à ${hours}h${mins}`
      : `${date.toLocaleDateString()} at ${hours}h${mins}`;
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
    fetch("https://radio.niprobin.com/api/nowplaying/1")
      .then(res => res.json())
      .then(data => {
        const nowPlaying = data.now_playing;
        const history = data.song_history.slice(0, 10);
        const latestId = nowPlaying?.sh_id || nowPlaying?.played_at || history[0]?.sh_id || history[0]?.played_at;
        // Update if forced, or if the latest song has changed, or if 2 minutes passed
        if (force || latestId !== lastSongId || Date.now() - lastFullRefresh > 120000) {
          renderHistory(nowPlaying, history);
          lastSongId = latestId;
          lastFullRefresh = Date.now();
        }
      })
      .catch(err => {
        container.innerHTML = "<p>Could not load song history.</p>";
        console.error(err);
      });
  }

  // Initial fetch
  fetchAndUpdate(true);

  // Poll every 10 seconds for updates
  setInterval(() => fetchAndUpdate(false), 10000);

  // Full refresh every 2 minutes (in case of missed updates)
  setInterval(() => fetchAndUpdate(true), 120000);
});