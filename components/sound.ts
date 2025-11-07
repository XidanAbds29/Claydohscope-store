// Improved lightweight WebAudio manager
// - Protects against overlapping bursts by limiting concurrent oscillators
// - Rate-limits repeated sounds (prevents collisions)
// - Adds simple looped background music (synthesized) with start/stop/toggle

type SoundName = 'add' | 'remove' | 'success' | 'error' | 'click' | 'confirm';

function getManager() {
  if (typeof window === 'undefined') return null as any;
  const w = window as any;
  if (!w.__claydoh_audio) {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = AudioCtx ? new AudioCtx() : null;
    w.__claydoh_audio = {
      ctx,
      active: 0,
      last: {} as Record<string, number>,
      maxConcurrent: 10,
      music: {
        playing: false,
        nodes: [] as any[],
        intervalId: 0 as any,
        gain: null as GainNode | null,
      },
    };
  }
  return w.__claydoh_audio;
}

function nowMs() {
  return Date.now();
}

function playTone(frequency: number, duration = 120, type: OscillatorType = 'sine', volume = 0.12) {
  const mgr = getManager();
  if (!mgr || !mgr.ctx) return;
  if (mgr.active >= mgr.maxConcurrent) return; // don't spawn too many
  try {
    const ctx: AudioContext = mgr.ctx;
    const start = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(volume, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration / 1000);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + duration / 1000 + 0.02);
    mgr.active += 1;
    o.onended = () => {
      mgr.active = Math.max(0, mgr.active - 1);
      try {
        o.disconnect();
        g.disconnect();
      } catch (e) {}
    };
  } catch (e) {
    // ignore
  }
}

const minInterval: Record<SoundName, number> = {
  add: 120,
  remove: 140,
  success: 50,
  error: 300,
  click: 80,
  confirm: 60,
};

function shouldPlay(name: SoundName) {
  const mgr = getManager();
  if (!mgr) return false;
  const last = mgr.last[name] || 0;
  if (nowMs() - last < (minInterval[name] || 100)) return false;
  mgr.last[name] = nowMs();
  return true;
}

export function playAdd() {
  if (!shouldPlay('add')) return;
  playTone(880, 100, 'sine', 0.12);
}

export function playRemove() {
  if (!shouldPlay('remove')) return;
  playTone(440, 140, 'triangle', 0.10);
}

export function playClick() {
  if (!shouldPlay('click')) return;
  playTone(660, 80, 'square', 0.06);
}

export function playConfirm() {
  if (!shouldPlay('confirm')) return;
  playTone(990, 90, 'sine', 0.11);
}

export function playSuccess() {
  if (!shouldPlay('success')) return;
  // quick 3-note arpeggio
  playTone(880, 80, 'sine', 0.10);
  setTimeout(() => playTone(1100, 90, 'sine', 0.10), 90);
  setTimeout(() => playTone(1320, 140, 'sine', 0.12), 190);
}

export function playError() {
  if (!shouldPlay('error')) return;
  playTone(220, 220, 'sawtooth', 0.14);
}

// --- Simple background music (synthesized loop) ---
export function isMusicPlaying() {
  const mgr = getManager();
  return !!mgr && !!mgr.music.playing;
}

export function startMusic() {
  const mgr = getManager();
  if (!mgr || !mgr.ctx) return;
  if (mgr.music.playing) return;
  const ctx: AudioContext = mgr.ctx;
  // create a gentle pad
  const pad = ctx.createOscillator();
  pad.type = 'sine';
  pad.frequency.value = 110; // A2
  const padGain = ctx.createGain();
  padGain.gain.value = 0.02;
  pad.connect(padGain);
  padGain.connect(ctx.destination);
  pad.start();

  // light arpeggio using a separate oscillator - we'll schedule via interval
  const arpOsc = ctx.createOscillator();
  arpOsc.type = 'triangle';
  const arpGain = ctx.createGain();
  arpGain.gain.value = 0.06;
  arpOsc.connect(arpGain);
  arpGain.connect(ctx.destination);
  arpOsc.start();

  let step = 0;
  const notes = [440, 550, 660, 880];
  const id = setInterval(() => {
    try {
      const f = notes[step % notes.length];
      arpOsc.frequency.setValueAtTime(f, ctx.currentTime);
      // quick envelope
      arpGain.gain.cancelScheduledValues(ctx.currentTime);
      arpGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      arpGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      step += 1;
    } catch (e) {
      // ignore
    }
  }, 350);

  mgr.music.playing = true;
  mgr.music.nodes = [pad, padGain, arpOsc, arpGain];
  mgr.music.intervalId = id;
}

export function stopMusic() {
  const mgr = getManager();
  if (!mgr || !mgr.ctx || !mgr.music.playing) return;
  try {
    const ctx: AudioContext = mgr.ctx;
    if (mgr.music.intervalId) {
      clearInterval(mgr.music.intervalId);
      mgr.music.intervalId = 0;
    }
    // stop and disconnect nodes
    (mgr.music.nodes || []).forEach((n: any) => {
      try {
        if (typeof n.stop === 'function') n.stop();
      } catch (e) {}
      try {
        n.disconnect();
      } catch (e) {}
    });
  } catch (e) {
    // ignore
  }
  mgr.music.nodes = [];
  mgr.music.playing = false;
}

export function toggleMusic() {
  if (isMusicPlaying()) stopMusic(); else startMusic();
}

// Try to resume the audio context on first user gesture if needed
export function resumeIfNeeded() {
  const mgr = getManager();
  if (!mgr || !mgr.ctx) return;
  const ctx: AudioContext = mgr.ctx;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
}
