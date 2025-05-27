const playlist = [
{
    title: "Direct Lounge (ENAwave)",
    artist: "sleepCircle",
    cover: "assets/images/covers/direct-lounge-cover.jpg",
    src: "assets/audio/Direct Lounge (ENAwave).mp3"
  },
    {
    title: "High class bout",
    artist: "LoFia Soren",
    cover: "assets/images/covers/high-class-battle-cover.jpg",
    src: "assets/audio/LoFia Soren - High class bout.mp3"
  },
    {
    title: "vacillate",
    artist: "Oliver Buckland",
    cover: "assets/images/covers/vacilitate-cover",
    src: "assets/audio/Oliver Buckland - vacillate.mp3"
  },
    {
    title: "Diagrams",
    artist: "LoFia Soren",
    cover: "assets/images/covers/diagrams-cover",
    src: "assets/audio/LoFia Soren - Diagrams.mp3"
  },
    {
    title: "Yokai disco",
    artist: "Telan Devik",
    cover: "assets/images/covers/yokai-disco-cover",
    src: "assets/audio/Telan Devik - Yokai disco.mp3"
  },
    {
    title: "Synthepanzer",
    artist: "Telan Devik",
    cover: "assets/images/covers/Deviks-first-colony-cover.jpg",
    src: "assets/audio/Telan Devik - Synthepanzer.mp3"
  },
    {
    title: "Sky high",
    artist: "Telan Devik",
    cover: "assets/images/covers/sky-high-cover.jpg",
    src: "assets/audio/Telan Devik - Sky high.mp3"
  },
    {
    title: "YMO 'Simoon' from Yellow Magic Orchestra",
    artist: "Isao Takaku (くじゃく)",
    cover: "assets/images/covers/ymo-simoon-cover.jpg",
    src: "assets/audio/Isao Takaku (くじゃく) - YMO _Simoon_ from Yellow Magic Orchestra.mp3"
  },
    {
    title: "YMO 'Technopolis' (mixed 2008)",
    artist: "Isao Takaku (くじゃく)",
    cover: "assets/images/covers/ymo-technopolis-cover.jpg",
    src: "assets/audio/Isao Takaku (くじゃく) - YMO _Technopolis_ (mixed 2008).mp3"
  }
  // Add more tracks as needed
];

let currentTrackIndex = 0;
const audio = document.getElementById('player');
const cover = document.querySelector('.music-player .cover');
const title = document.querySelector('.music-player .title');
const artist = document.querySelector('.music-player .artist');

function loadTrack(index) {
  const track = playlist[index];
  audio.src = track.src;
  cover.src = track.cover;
  title.textContent = track.title;
  artist.textContent = track.artist;
  audio.volume = localStorage.getItem('volume') || 0.5;
  document.getElementById('volume').value = audio.volume;
}

function togglePlay() {
  if (audio.paused) audio.play();
  else audio.pause();
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
  audio.play();
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
  audio.play();
}

function toggleMute() {
  audio.muted = !audio.muted;
}

document.getElementById('volume').addEventListener('input', (e) => {
  audio.volume = e.target.value;
  audio.muted = false;
  localStorage.setItem('volume', e.target.value);
});

loadTrack(currentTrackIndex);