const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {}
}

export function playFire() {
  playTone(150, 0.1, 'sawtooth', 0.2);
  playTone(80, 0.15, 'square', 0.15);
}

export function playRicochet() {
  playTone(800, 0.05, 'sine', 0.1);
  setTimeout(() => playTone(1200, 0.05, 'sine', 0.08), 30);
}

export function playExplosion() {
  playTone(60, 0.3, 'sawtooth', 0.3);
  playTone(40, 0.4, 'square', 0.2);
  setTimeout(() => playTone(30, 0.3, 'sawtooth', 0.15), 100);
}

export function playVictory() {
  [0, 100, 200, 300].forEach((delay, i) => {
    setTimeout(() => playTone(300 + i * 100, 0.15, 'square', 0.12), delay);
  });
}

export function vibrate(ms: number) {
  try { navigator.vibrate?.(ms); } catch {}
}
