const albumFolder = "music/Various Artists - Spirit & Song Disc C (2013) [16B-44.1kHz]/";

async function loadPlaylist() {
  const res = await fetch(albumFolder + "playlist.json");
  const songs = await res.json();
  setupPlayer(songs);
}

function setupPlayer(songs) {
  let current = 0;
  const audio = document.getElementById("audio");
  const title = document.getElementById("song-title");
  const playlist = document.getElementById("playlist");

  function loadSong(index) {
    const song = songs[index];
    audio.src = albumFolder + song.file;
    title.textContent = "🎵 " + song.title;
    highlight(index);
    audio.play();
  }

  function highlight(index) {
    document.querySelectorAll("#playlist li").forEach((li, i) => {
      li.className = i === index ? "text-yellow-400" : "text-white hover:text-gray-300 cursor-pointer";
    });
  }

  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    li.onclick = () => { current = i; loadSong(i); };
    playlist.appendChild(li);
  });

  document.getElementById("prev").onclick = () => {
    current = (current - 1 + songs.length) % songs.length;
    loadSong(current);
  };
  document.getElementById("next").onclick = () => {
    current = (current + 1) % songs.length;
    loadSong(current);
  };
  audio.addEventListener("ended", () => {
    current = (current + 1) % songs.length;
    loadSong(current);
  });

  loadSong(current);
  audio.pause();
}

loadPlaylist();