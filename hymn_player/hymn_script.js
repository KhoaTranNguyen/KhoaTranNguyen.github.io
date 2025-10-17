// Define the folder where your music and playlist.json are located
const albumFolder = "music/Various Artists - Spirit & Song Disc C (2013) [16B-44.1kHz]/";

/**
 * Asynchronously loads the playlist from the JSON file.
 * Handles errors if the file is missing or can't be read.
 */
async function loadPlaylist() {
  try {
    const res = await fetch(albumFolder + "playlist.json");
    if (!res.ok) {
      throw new Error(`Could not load playlist.json: ${res.statusText}`);
    }
    const songs = await res.json();
    setupPlayer(songs);
  } catch (error) {
    console.error("Failed to load playlist:", error);
    document.getElementById("song-title").textContent = "Error: Could not load playlist.";
  }
}

/**
 * Sets up the music player, creates the playlist, and wires up the controls.
 * @param {Array} songs - The array of song objects from playlist.json
 */
function setupPlayer(songs) {
  let current = 0;
  const audio = document.getElementById("audio");
  const title = document.getElementById("song-title");
  const playlist = document.getElementById("playlist");

  /**
   * Loads and plays a specific song by its index.
   * @param {number} index - The index of the song in the 'songs' array.
   */
  function loadSong(index) {
    if (index < 0 || index >= songs.length) {
      console.error("Invalid song index");
      return;
    }
    const song = songs[index];
    audio.src = albumFolder + song.file;
    title.textContent = "🎵 " + song.title; // Update the main title display
    highlight(index);
    audio.play();
  }

  /**
   * Highlights the currently playing song in the playlist.
   * @param {number} index - The index of the song to highlight.
   */
  function highlight(index) {
    // Remove 'active' class from all list items
    document.querySelectorAll("#playlist li").forEach((li) => {
      li.classList.remove("active");
    });
    // Add 'active' class to the currently playing song
    const activeItem = playlist.children[index];
    if (activeItem) {
      activeItem.classList.add("active");
    }
  }

  // Clear any existing playlist items (e.g., "Loading...")
  playlist.innerHTML = ""; 

  // Create and append all playlist items to the <ul>
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    
    // Create inner structure just for the title
    // This matches the simplified UI you wanted
    const spanTitle = document.createElement("span");
    spanTitle.className = "text-gray-800 font-medium";
    spanTitle.textContent = song.title;

    li.className = "flex items-center justify-between"; // Base styles from HTML/CSS
    li.appendChild(spanTitle);
    
    // Add click event to play the song
    li.onclick = () => {
      current = i;
      loadSong(i);
    };
    playlist.appendChild(li);
  });

  // --- Setup Player Controls ---

  // Previous button
  document.getElementById("prev").onclick = () => {
    current = (current - 1 + songs.length) % songs.length;
    loadSong(current);
  };

  // Next button
  document.getElementById("next").onclick = () => {
    current = (current + 1) % songs.length;
    loadSong(current);
  };

  // Auto-play the next song when the current one ends
  audio.addEventListener("ended", () => {
    current = (current + 1) % songs.length;
    loadSong(current);
  });

  // --- Initial Load ---
  
  // Load the first song on page load, but don't play it
  if (songs.length > 0) {
    const firstSong = songs[current];
    audio.src = albumFolder + firstSong.file;
    title.textContent = "🎵 " + firstSong.title;
    highlight(current);
  } else {
    title.textContent = "Playlist is empty.";
  }
}

// Start the whole process
loadPlaylist();