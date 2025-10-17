/**
 * NOTE FOR THIS NEW SCRIPT:
 * * Your playlist.json file needs to be updated to support the new UI.
 * Your old JSON probably just had: { "title": "...", "file": "..." }
 * * For the new UI to work fully, your playlist.json should look like this:
 * [
 * {
 * "title": "Song Title 1",
 * "artist": "Artist Name",
 * "file": "song1.mp3",
 * "image": "album-art.jpg", // Image file in the same folder
 * "duration": "3:45"        // Optional: A string for display
 * },
 * {
 * "title": "Song Title 2",
 * "artist": "Artist Name",
 * "file": "song2.mp3",
 * "image": "album-art.jpg",
 * "duration": "4:02"
 * }
 * ]
 * * This script includes fallbacks if 'artist', 'image', or 'duration' are missing,
 * but it will look best if you add them.
 */

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
 * Sets up the music player, creates the playlist, and wires up all custom controls.
 * @param {Array} songs - The array of song objects from playlist.json
 */
function setupPlayer(songs) {
  let current = 0;
  const placeholderArt = "https://via.placeholder.com/600x600/2C3E50/FFFFFF?text=Album+Art";

  // --- Get All DOM Elements ---
  const audio = document.getElementById("audio");
  const playlist = document.getElementById("playlist");
  
  // "Now Playing" Info
  const songTitle = document.getElementById("song-title");
  const songArtist = document.getElementById("song-artist");
  const albumArt = document.getElementById("album-art-img");

  // Custom Controls
  const playPauseBtn = document.getElementById("play-pause-button");
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  const prevBtn = document.getElementById("prev-button"); // Renamed from "prev"
  const nextBtn = document.getElementById("next-button"); // Renamed from "next"

  // Progress Bar
  const progressBar = document.getElementById("progress-bar");
  const progress = document.getElementById("progress");
  const currentTimeEl = document.getElementById("current-time");
  const totalTimeEl = document.getElementById("total-time");

  /**
   * Loads and plays a specific song by its index.
   * This is the central function for updating the entire player UI.
   * @param {number} index - The index of the song in the 'songs' array.
   */
  function loadSong(index) {
    if (index < 0 || index >= songs.length) {
      console.error("Invalid song index");
      return;
    }
    const song = songs[index];
    
    // Update audio source
    audio.src = albumFolder + song.file;

    // Update "Now Playing" info
    songTitle.textContent = song.title || "Unknown Title";
    songArtist.textContent = song.artist || "Unknown Artist";
    albumArt.src = song.image ? (albumFolder + song.image) : placeholderArt;

    // Highlight in playlist
    highlight(index);
    
    // Play the song
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

  /**
   * Toggles the Play/Pause icon.
   * @param {boolean} isPlaying - True if audio is playing, false if paused.
   */
  function updatePlayPauseIcon(isPlaying) {
    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
      playPauseBtn.setAttribute("title", "Pause");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      playPauseBtn.setAttribute("title", "Play");
    }
  }

  /**
   * Formats time in seconds to a "M:SS" string.
   * @param {number} seconds - The time in seconds.
   */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }


  // --- 1. Populate Playlist <ul> ---
  
  // Clear any existing dummy items
  playlist.innerHTML = ""; 

  songs.forEach((song, i) => {
    const li = document.createElement("li");
    
    // Store song data directly on the element for easy access
    li.dataset.index = i;
    
    // Create the rich inner HTML for the playlist item
    li.innerHTML = `
      <div class="flex justify-between items-center w-full">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-400 w-4">${i + 1}.</span>
          <div>
            <p class="font-medium text-white">${song.title || "Unknown Title"}</p>
            <p class="text-sm text-gray-400">${song.artist || "Unknown Artist"}</p>
          </div>
        </div>
        <span class="text-sm text-gray-400">${song.duration || "---"}</span>
      </div>
    `;
    
    // Add click event to play the song
    li.onclick = () => {
      current = i;
      loadSong(i);
    };
    
    playlist.appendChild(li);
  });

  // --- 2. Setup Player Controls ---

  // Play/Pause button
  playPauseBtn.onclick = () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  // Previous button
  prevBtn.onclick = () => {
    current = (current - 1 + songs.length) % songs.length;
    loadSong(current);
  };

  // Next button
  nextBtn.onclick = () => {
    current = (current + 1) % songs.length;
    loadSong(current);
  };

  // --- 3. Wire up Audio Events ---

  // Update icons on play/pause
  audio.addEventListener("play", () => updatePlayPauseIcon(true));
  audio.addEventListener("pause", () => updatePlayPauseIcon(false));

  // Auto-play the next song when the current one ends
  audio.addEventListener("ended", () => {
    current = (current + 1) % songs.length;
    loadSong(current);
  });

  // Update progress bar and time stamps
  audio.addEventListener("timeupdate", () => {
    const { currentTime, duration } = audio;
    if (duration) {
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    }
  });

  // Set total duration once song is loaded
  audio.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  // Allow seeking by clicking on the progress bar
  progressBar.onclick = (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
      audio.currentTime = (clickX / width) * duration;
    }
  };

  // --- 4. Initial Load ---
  
  // Load the first song on page load, but don't play it
  if (songs.length > 0) {
    const firstSong = songs[current];
    audio.src = albumFolder + firstSong.file;
    songTitle.textContent = firstSong.title || "Unknown Title";
    songArtist.textContent = firstSong.artist || "Unknown Artist";
    albumArt.src = firstSong.image ? (albumFolder + firstSong.image) : placeholderArt;
    highlight(current);
    // Ensure total time is set, even if it's 0:00 initially
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    }, { once: true }); // Only run this first-load listener once

  } else {
    songTitle.textContent = "Playlist is empty.";
    songArtist.textContent = "Please add songs.";
  }
}

// Start the whole process
loadPlaylist();