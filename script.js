console.log("Spotify clone running");

let audio = null;
let songs = [];
let currentSongIndex = 0;
let playlists = {};
let isDragging = false;

document.addEventListener("DOMContentLoaded", async () => {
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prevsong");
  const nextBtn = document.getElementById("nextbtn");
  const songUL = document.querySelector(".list ul");
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeBtn = document.getElementById("volumeBtn");
  const seekbar = document.querySelector(".seekbar");
  const circle = document.querySelector(".circle");
  const timeEl = document.querySelector(".songtime");

  function formatTime(sec) {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const res = await fetch("songs/playlists.json");
  playlists = await res.json();

  function renderSongList() {
    songUL.innerHTML = "";

    songs.forEach((song, index) => {
      const name = decodeURIComponent(song.file).split("/").pop().replace(".mp3", "");
      const artist = song.artist || "Unknown Artist";

      const li = document.createElement("li");
      li.dataset.index = index;

      li.innerHTML = `
        <div class="songtemplate">
          <img class="invert" src="Images/music.svg">
          <div class="info">
            <div class="song-name">${name}</div>
            <div class="artist-name">${artist}</div>
          </div>
          <div class="playnow">
            <div>Play Now</div>
            <img src="Images/play.svg" alt="play">
          </div>
        </div>
      `;

      li.addEventListener("click", () => {
        currentSongIndex = index;
        playSong(songs[currentSongIndex]);
      });

      songUL.appendChild(li);
    });
  }

  function updateCirclePosition(percent) {
    const x = percent * seekbar.clientWidth;
    circle.style.left = `${x}px`;
  }

  function playSong(songObj) {
    if (audio) audio.pause();

    audio = new Audio(songObj.file);
    audio.volume = volumeSlider.value;
    audio.play();
    updatePlayBtn();

    document.querySelector(".song-details .info").innerHTML = `
      <div>${decodeURIComponent(songObj.file).split("/").pop().replace(".mp3", "")}</div>
      <div>${songObj.artist}</div>
    `;

    audio.onended = () => {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      playSong(songs[currentSongIndex]);
    };

    audio.ontimeupdate = () => {
      if (isDragging) return;
      const percent = audio.currentTime / audio.duration;
      updateCirclePosition(percent);
      timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    };
  }

  function updatePlayBtn() {
    playBtn.src = audio && !audio.paused ? "Images/pause.svg" : "Images/play.svg";
  }


  playBtn.onclick = () => {
    if (!audio) return;
    audio.paused ? audio.play() : audio.pause();
    updatePlayBtn();
  };


  prevBtn.onclick = () => {
    if (!songs.length) return;
    currentSongIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    playSong(songs[currentSongIndex]);
  };

  nextBtn.onclick = () => {
    if (!songs.length) return;
    currentSongIndex = currentSongIndex === songs.length - 1 ? 0 : currentSongIndex + 1;
    playSong(songs[currentSongIndex]);
  };


  volumeSlider.oninput = e => {
    if (audio) audio.volume = e.target.value;
  };

  volumeBtn.onclick = () => {
    if (!audio) return;
    audio.muted = !audio.muted;
    volumeBtn.src = audio.muted ? "Images/mute.svg" : "Images/volume.svg";
  };


  seekbar.addEventListener("click", e => {
    if (!audio || !audio.duration) return;
    const rect = seekbar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    audio.currentTime = percent * audio.duration;
    updateCirclePosition(percent);
  });


  circle.addEventListener("mousedown", e => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging || !audio || !audio.duration) return;
    const rect = seekbar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    audio.currentTime = percent * audio.duration;
    updateCirclePosition(percent);
  });


  document.querySelectorAll(".card").forEach(card => {
    card.onclick = () => {
      songs = playlists[card.dataset.folder];
      if (!songs) return;
      currentSongIndex = 0;
      renderSongList();
      playSong(songs[0]);
    };
  });

  const hamburger = document.querySelector(".hamburger-btn");
  const leftSidebar = document.querySelector(".left");
  const closeBtn = document.querySelector(".close");

  hamburger.addEventListener("click", () => {
    leftSidebar.classList.toggle("active");
  });

  closeBtn.addEventListener("click", () => {
    leftSidebar.classList.remove("active");
  });
  document.querySelector(".library > .songtemplate")?.remove();
});


