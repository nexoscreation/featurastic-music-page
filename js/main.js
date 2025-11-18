const API_URL = "https://gist.githubusercontent.com/Funkmastercodex/0797e7e2d0e4c8cf0e8fdb424ac3d2e8/raw/featurastic-tracks.json"; // Replace with your own endpoint!

// UI Elements
const player = document.getElementById('music-player');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const cover = document.getElementById('cover');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');

let tracks = [];
let currentIndex = 0;
let isPlaying = false;

// --- Fetch Tracks From API ---
async function fetchTracks() {
  showLoading();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error('No tracks found.');
    tracks = data;
    hideLoading();
    player.style.display = '';
    loadTrack(0);
  } catch (e) {
    showError(`Unable to load tracks: ${e.message}`);
  }
}

function showLoading() {
  loading.style.display = '';
  error.style.display = 'none';
  player.style.display = 'none';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showError(msg) {
  error.textContent = msg;
  error.style.display = '';
  loading.style.display = 'none';
  player.style.display = 'none';
}

// --- Player Logic ---
function loadTrack(idx) {
  const track = tracks[idx];
  cover.src = track.cover || '';
  cover.alt = `${track.title} cover`;
  title.textContent = track.title || 'Unknown Title';
  artist.textContent = track.artist || 'Unknown Artist';
  audio.src = track.src;
  currentIndex = idx;
  resetProgress();
}

function resetProgress() {
  progress.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
}

function playTrack() {
  audio.play();
  isPlaying = true;
  document.getElementById('play-icon').innerHTML = `<path fill="currentColor" d="M6 19h4V5H6zm8-14v14h4V5z"></path>`; // pause icon
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  document.getElementById('play-icon').innerHTML = `<path fill="currentColor" d="M8 5v14l11-7z"></path>`; // play icon
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex);
  playTrack();
}
function nextTrack() {
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex);
  playTrack();
}

// --- Event Listeners ---
playBtn.onclick = () => (isPlaying ? pauseTrack() : playTrack());
prevBtn.onclick = prevTrack;
nextBtn.onclick = nextTrack;

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextTrack);

progressContainer.onclick = (e) => {
  const percent = e.offsetX / progressContainer.offsetWidth;
  audio.currentTime = percent * audio.duration;
};

function updateProgress() {
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  }
}

function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

// --- Start ---
fetchTracks();
