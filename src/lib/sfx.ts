/**
 * SFX retro vía Web Audio API (osciladores, sin assets ni dependencias).
 * El AudioContext se crea de forma perezosa en la primera llamada real —
 * nunca antes — para respetar la política de autoplay del navegador, que
 * exige que se cree/reanude dentro de un gesto del usuario.
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(ctx: AudioContext, freq: number, startOffset: number, duration: number): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = freq;

  const startTime = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0.15, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/** Blip corto de interacción con botones pixel. */
export function playClick(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  playTone(ctx, 440, 0, 0.06);
}

/** Arpegio ascendente al superar un reto. */
export function playPass(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  playTone(ctx, 660, 0, 0.06);
  playTone(ctx, 880, 0.06, 0.06);
}

/** Fanfarria de 4 notas (C-E-G-C) al completar una zona. */
export function playVictory(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const step = 0.1;
  notes.forEach((freq, i) => playTone(ctx, freq, i * step, 0.12));
}
