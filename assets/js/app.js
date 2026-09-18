/**
 * DJ ANTLER — Interactive Web Audio Engine & App Logic
 */

// Global Audio Context & Synthesizer State
let audioCtx = null;
let isPlaying = false;
let currentBpm = 132;
let currentGenre = 'breakbeat';
let beatInterval = null;
let stepCounter = 0;
let analyser = null;
let visualizerAnimationId = null;

// Track progress state
let trackCurrentSec = 0;
let trackTotalSec = 225; // 3:45
let progressTimer = null;

// Initialize Audio Context on first user interaction
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Procedural Web Audio Sound Generators
 */

// 1. Punchy Sub Kick
function playKick() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

  gain.gain.setValueAtTime(1.0, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc.start(now);
  osc.stop(now + 0.3);
}

// 2. Crisp 909 Snare / Clap
function playSnare() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Noise component
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(analyser);
  analyser.connect(ctx.destination);

  // Tonal body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);

  oscGain.gain.setValueAtTime(0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.connect(oscGain);
  oscGain.connect(analyser);

  noise.start(now);
  osc.start(now);
  osc.stop(now + 0.15);
}

// 3. Hi-Hat
function playHiHat(open = false) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = open ? 0.2 : 0.05;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  noise.start(now);
}

// 4. Bass Wobble / Tone
function playBass(freq = 65, duration = 0.2) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + duration);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

// 5. Siren / Drop FX
function playDropFX() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);

  gain.gain.setValueAtTime(0.5, now);
  gain.gain.linearRampToValueAtTime(0.8, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

  osc.connect(gain);
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.9);
}

// 6. Scratch / Vinyl Spin FX
function playScratchFX() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.linearRampToValueAtTime(200, now + 0.08);
  osc.frequency.linearRampToValueAtTime(900, now + 0.16);
  osc.frequency.linearRampToValueAtTime(150, now + 0.25);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

  osc.connect(gain);
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Continuous Beat Loop Sequencer (16 steps)
 */
function stepBeat() {
  const step = stepCounter % 16;
  stepCounter++;

  if (currentGenre === 'breakbeat') {
    // Breakbeat rhythm: Kick on 0, 6, 10; Snare on 4, 12; Hihats on all evens
    if (step === 0 || step === 6 || step === 10) playKick();
    if (step === 4 || step === 12) playSnare();
    if (step % 2 === 0) playHiHat(step % 4 === 2);
    if (step === 2 || step === 8 || step === 14) playBass(step === 8 ? 82 : 60, 0.15);
  } else if (currentGenre === 'jungledutch') {
    // 4-on-the-floor kick with high-pitched synths
    if (step % 4 === 0) playKick();
    if (step === 4 || step === 12) playSnare();
    if (step % 2 === 1) playHiHat(true);
    if (step === 2 || step === 6 || step === 10 || step === 14) playBass(110, 0.12);
  } else if (currentGenre === 'indobounce') {
    // Bounce beat: heavy kick + bounce bass on off-beats
    if (step % 4 === 0) playKick();
    if (step === 4 || step === 12) playSnare();
    if (step % 2 === 1) {
      playHiHat(false);
      playBass(75, 0.1);
    }
  } else if (currentGenre === 'techhouse') {
    // Deep groove 4-on-the-floor
    if (step % 4 === 0) playKick();
    if (step === 4 || step === 12) playSnare();
    if (step % 2 === 1) playHiHat(false);
    if (step === 3 || step === 7 || step === 11 || step === 15) playBass(55, 0.18);
  }
}

function startBeatLoop() {
  if (isPlaying) return;
  isPlaying = true;
  getAudioContext();

  const stepTimeMs = (60 / currentBpm / 4) * 1000;
  beatInterval = setInterval(stepBeat, stepTimeMs);

  updateUIPlayingState(true);
  startProgressTracker();
  startCanvasVisualizer();
}

function stopBeatLoop() {
  if (!isPlaying) return;
  isPlaying = false;
  clearInterval(beatInterval);
  beatInterval = null;

  updateUIPlayingState(false);
  stopProgressTracker();
}

function togglePlay() {
  if (isPlaying) {
    stopBeatLoop();
  } else {
    startBeatLoop();
  }
}

function updateUIPlayingState(playing) {
  const mainPlayIcon = document.getElementById('main-play-icon');
  const trackModeLabel = document.getElementById('track-mode-label');
  const navSoundStatus = document.getElementById('sound-status-text');

  if (playing) {
    if (mainPlayIcon) mainPlayIcon.setAttribute('data-lucide', 'pause');
    if (trackModeLabel) {
      trackModeLabel.textContent = 'LIVE PLAYING';
      trackModeLabel.classList.add('text-brand-crimson', 'animate-pulse');
      trackModeLabel.classList.remove('text-brand-cyan');
    }
    if (navSoundStatus) navSoundStatus.textContent = 'Stop Beat';
  } else {
    if (mainPlayIcon) mainPlayIcon.setAttribute('data-lucide', 'play');
    if (trackModeLabel) {
      trackModeLabel.textContent = 'PAUSED';
      trackModeLabel.classList.remove('text-brand-crimson', 'animate-pulse');
      trackModeLabel.classList.add('text-brand-cyan');
    }
    if (navSoundStatus) navSoundStatus.textContent = 'Audio Demo';
  }
  if (window.lucide) lucide.createIcons();
}

function startProgressTracker() {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    trackCurrentSec++;
    if (trackCurrentSec > trackTotalSec) trackCurrentSec = 0;

    const mins = String(Math.floor(trackCurrentSec / 60)).padStart(2, '0');
    const secs = String(trackCurrentSec % 60).padStart(2, '0');
    const timeEl = document.getElementById('track-time');
    if (timeEl) timeEl.textContent = `${mins}:${secs}`;

    const fillEl = document.getElementById('track-progress-fill');
    if (fillEl) {
      const pct = (trackCurrentSec / trackTotalSec) * 100;
      fillEl.style.width = `${pct}%`;
    }
  }, 1000);
}

function stopProgressTracker() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

/**
 * Canvas Spectrum Visualizer
 */
function startCanvasVisualizer() {
  const canvas = document.getElementById('audio-visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  }
  resizeCanvas();

  const bufferLength = analyser ? analyser.frequencyBinCount : 32;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    visualizerAnimationId = requestAnimationFrame(draw);

    if (analyser && isPlaying) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      // Idle wave animation
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.max(10, Math.sin(Date.now() * 0.003 + i * 0.2) * 40 + 30);
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#ff1e56');
      gradient.addColorStop(0.5, '#ff2d55');
      gradient.addColorStop(1, '#00f2fe');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 4, barHeight);

      // Peak dots
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, canvas.height - barHeight - 4, barWidth - 4, 2);

      x += barWidth;
    }
  }

  draw();
}

/**
 * Floating Dust Background Canvas
 */
function initBackgroundParticles() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const count = 40;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '#ff1e56' : '#00f2fe'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/**
 * DOM Ready Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Background Canvas
  initBackgroundParticles();
  startCanvasVisualizer();

  // 2. Play / Pause Button
  const mainPlayBtn = document.getElementById('main-play-btn');
  if (mainPlayBtn) {
    mainPlayBtn.addEventListener('click', togglePlay);
  }

  const heroPlayBtn = document.getElementById('hero-play-demo-btn');
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
      if (!isPlaying) startBeatLoop();
      const mixtapeEl = document.getElementById('mixtape');
      if (mixtapeEl) mixtapeEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const navSoundBtn = document.getElementById('nav-sound-btn');
  if (navSoundBtn) {
    navSoundBtn.addEventListener('click', togglePlay);
  }

  // 3. Sound Pads Interactive Triggers
  const soundPads = document.querySelectorAll('.sound-pad');
  soundPads.forEach(pad => {
    pad.addEventListener('click', () => {
      const type = pad.getAttribute('data-pad');
      pad.classList.add('pad-active');
      setTimeout(() => pad.classList.remove('pad-active'), 150);

      switch (type) {
        case 'kick':
          playKick();
          break;
        case 'snare':
          playSnare();
          break;
        case 'drop':
          playDropFX();
          break;
        case 'scratch':
          playScratchFX();
          break;
      }
    });
  });

  // 4. Genre Presets Switcher
  const genrePresetBtns = document.querySelectorAll('.genre-preset-btn');
  const activeTrackName = document.getElementById('active-track-name');
  const bpmTag = document.getElementById('current-bpm-tag');

  genrePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genrePresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const genre = btn.getAttribute('data-genre');
      const bpm = parseInt(btn.getAttribute('data-bpm'), 10);
      currentGenre = genre;
      currentBpm = bpm;

      if (bpmTag) {
        bpmTag.textContent = `${bpm} BPM • ${genre.toUpperCase()} MIX`;
      }
      if (activeTrackName) {
        activeTrackName.textContent = `Antler ${btn.textContent.trim()} Live Energy`;
      }

      if (isPlaying) {
        clearInterval(beatInterval);
        const stepTimeMs = (60 / currentBpm / 4) * 1000;
        beatInterval = setInterval(stepBeat, stepTimeMs);
      }
    });
  });

  // 5. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 6. WhatsApp Booking Form Submission Auto-Formatter
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();

      const name = document.getElementById('client-name').value.trim();
      const phone = document.getElementById('client-phone').value.trim();
      const eventType = document.getElementById('event-type').value;
      const location = document.getElementById('event-location').value.trim();
      const eventDate = document.getElementById('event-date').value;
      const duration = document.getElementById('event-duration').value;
      const notes = document.getElementById('event-notes').value.trim();

      // Selected genres
      const checkedBoxes = document.querySelectorAll('input[name="genres"]:checked');
      const selectedGenres = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

      const message = 
`Halo DJ ANTLER! 👋
Saya ingin melakukan reservasi / booking event dengan detail sebagai berikut:

🎧 *INQUIRY BOOKING DJ ANTLER*
━━━━━━━━━━━━━━━━━━━━━━
👤 *Nama / Organizer:* ${name}
📱 *No. WhatsApp:* ${phone}
🎪 *Tipe Event:* ${eventType}
📍 *Kota / Lokasi Venue:* ${location}
📅 *Tanggal Acara:* ${eventDate || 'Belum Ditentukan'}
⏱️ *Durasi Set:* ${duration}
🎵 *Preferensi Genre:* ${selectedGenres || 'Open Format'}
📝 *Catatan Tambahan:* ${notes || '-'}
━━━━━━━━━━━━━━━━━━━━━━
Mohon info ketersediaan jadwal & rate card. Terima kasih!`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/6285121124152?text=${encodedMessage}`;
      window.open(waUrl, '_blank');
    });
  }

  // 8. Interactive Video Playlist Switcher
  const playlistItems = document.querySelectorAll('.video-playlist-item');
  const spotlightVideo = document.getElementById('spotlight-video');
  const spotlightTitle = document.getElementById('spotlight-title');
  const spotlightDesc = document.getElementById('spotlight-desc');
  const spotlightBadge = document.getElementById('spotlight-badge');

  if (spotlightVideo && playlistItems.length > 0) {
    playlistItems.forEach(item => {
      item.addEventListener('click', () => {
        playlistItems.forEach(i => {
          i.classList.remove('active', 'border-brand-crimson', 'border-brand-cyan', 'border-purple-500', 'border-emerald-500');
          i.classList.add('border-white/10');
        });

        item.classList.add('active');
        item.classList.remove('border-white/10');
        item.classList.add('border-brand-crimson');

        const videoSrc = item.getAttribute('data-video');
        const title = item.getAttribute('data-title');
        const desc = item.getAttribute('data-desc');
        const badge = item.getAttribute('data-badge');

        if (videoSrc && spotlightVideo) {
          spotlightVideo.src = videoSrc;
          spotlightVideo.play().catch(() => {});
        }
        if (spotlightTitle && title) spotlightTitle.textContent = title;
        if (spotlightDesc && desc) spotlightDesc.textContent = desc;
        if (spotlightBadge && badge) spotlightBadge.textContent = badge;
      });
    });

    // Pause synthesizer beat demo when user plays a video
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(vid => {
      vid.addEventListener('play', () => {
        if (isPlaying) {
          const playDemoBtn = document.getElementById('hero-play-demo-btn');
          if (playDemoBtn) playDemoBtn.click();
        }
      });
    });
  }

  // 9. Navbar Scroll Background Opacity & Scroll Progress Bar
  const nav = document.getElementById('main-nav');
  const scrollProgressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    if (nav) {
      if (scrollY > 50) {
        nav.classList.add('bg-[#050608]/95', 'shadow-2xl', 'shadow-black/60');
        nav.classList.remove('bg-[#050608]/80');
      } else {
        nav.classList.remove('bg-[#050608]/95', 'shadow-2xl', 'shadow-black/60');
        nav.classList.add('bg-[#050608]/80');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 10. Scroll-Driven Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-init');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          
          // Check if this element has animated counters inside
          const counters = entry.target.querySelectorAll('.count-up');
          counters.forEach(counter => {
            if (!counter.hasAttribute('data-counted')) {
              counter.setAttribute('data-counted', 'true');
              animateCounter(counter);
            }
          });

          // Unobserve once animated
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('reveal-active'));
  }

  // Helper: Number Count-Up Animation
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600; // ms
    const startTime = performance.now();

    function updateCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(updateCount);
  }

  // 11. Preloader Loading System (0% -> 100%)
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-progress-bar');
  const preloaderCounter = document.getElementById('preloader-counter');

  if (preloader) {
    let currentPct = 0;
    const loadStart = performance.now();
    const minLoadTime = 700; // ms

    const timer = setInterval(() => {
      currentPct += Math.floor(Math.random() * 15) + 8;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(timer);

        if (preloaderBar) preloaderBar.style.width = '100%';
        if (preloaderCounter) preloaderCounter.textContent = '100%';

        setTimeout(() => {
          preloader.classList.add('loaded');
          // Trigger Hero section reveal right away
          document.querySelectorAll('#hero .reveal-init').forEach(el => el.classList.add('reveal-active'));
        }, 300);
      } else {
        if (preloaderBar) preloaderBar.style.width = `${currentPct}%`;
        if (preloaderCounter) preloaderCounter.textContent = `${currentPct}%`;
      }
    }, 45);

    window.addEventListener('load', () => {
      // Ensure it finishes when page is ready
      currentPct = 95;
    });
  }
});
