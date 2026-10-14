// Web Audio API Synthesizer for high-fidelity notifications and reward feedback

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
}

// Pleasant harmonic chime for reminders (e.g. section start, task due)
export function playReminderChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';

  // Major third interval (E5 -> G#5)
  osc1.frequency.setValueAtTime(659.25, now);
  osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

  osc2.frequency.setValueAtTime(1318.5, now + 0.15); // E6

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now + 0.15);
  osc1.stop(now + 1.2);
  osc2.stop(now + 1.2);
}

// Satisfying dopamine chime for completing tasks/subtasks (Atomic Habit reinforcement)
export function playSuccessChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.06);

    gain.gain.setValueAtTime(0.001, now + index * 0.06);
    gain.gain.linearRampToValueAtTime(0.15, now + index * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.06);
    osc.stop(now + index * 0.06 + 0.45);
  });
}

// Level-up / Streak milestone sound
export function playLevelUpFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 440, time: 0 },
    { freq: 554.37, time: 0.1 },
    { freq: 659.25, time: 0.2 },
    { freq: 880, time: 0.32 },
  ];

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now + note.time);

    gain.gain.setValueAtTime(0.001, now + note.time);
    gain.gain.linearRampToValueAtTime(0.2, now + note.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + 0.65);
  });
}
