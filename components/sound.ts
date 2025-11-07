// Lightweight WebAudio-based sounds (no external files required)
// Exports small helper functions to play UI sounds.

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  if (!w.__claydoh_audio_ctx) {
    try {
      w.__claydoh_audio_ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      w.__claydoh_audio_ctx = null;
    }
  }
  return w.__claydoh_audio_ctx;
}

function playTone(frequency: number, duration = 120, type: OscillatorType = 'sine', gain = 0.12) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + duration / 1000 + 0.02);
  } catch (e) {
    // ignore
  }
}

export function playAdd() {
  // bright short tone
  playTone(880, 100, 'sine', 0.12);
}

export function playRemove() {
  // lower soft tone
  playTone(440, 120, 'triangle', 0.10);
}

export function playSuccess() {
  // simple arpeggio: A5, B5, E6
  playTone(880, 90, 'sine', 0.12);
  setTimeout(() => playTone(988, 90, 'sine', 0.12), 100);
  setTimeout(() => playTone(1320, 130, 'sine', 0.14), 220);
}

export function playError() {
  // low buzz
  playTone(220, 200, 'sawtooth', 0.14);
}
