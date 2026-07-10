import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mockAudioContext() {
  const oscillator = {
    type: '',
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gain = {
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  };
  const createOscillator = vi.fn(() => oscillator);
  const createGain = vi.fn(() => gain);
  const AudioContextMock = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.currentTime = 0;
    this.destination = {};
    this.createOscillator = createOscillator;
    this.createGain = createGain;
  });
  vi.stubGlobal('AudioContext', AudioContextMock);
  return { AudioContextMock, createOscillator, createGain, oscillator };
}

// sfx.ts guarda el AudioContext en una variable de módulo (singleton
// perezoso). vi.resetModules() + import dinámico por test evita que ese
// estado se filtre entre tests y garantiza un AudioContext mockeado fresco
// en cada caso.
async function freshSfx() {
  vi.resetModules();
  return import('./sfx');
}

describe('sfx', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('con soundEnabled=false no crea AudioContext ni osciladores en ningún evento', async () => {
    const { AudioContextMock, createOscillator } = mockAudioContext();
    const { playClick, playPass, playVictory } = await freshSfx();

    playClick(false);
    playPass(false);
    playVictory(false);

    expect(AudioContextMock).not.toHaveBeenCalled();
    expect(createOscillator).not.toHaveBeenCalled();
  });

  it('con soundEnabled=true, playClick crea el AudioContext y dispara un oscilador', async () => {
    const { AudioContextMock, createOscillator } = mockAudioContext();
    const { playClick } = await freshSfx();

    playClick(true);

    expect(AudioContextMock).toHaveBeenCalledTimes(1);
    expect(createOscillator).toHaveBeenCalledTimes(1);
  });

  it('con soundEnabled=true, playPass dispara dos osciladores (arpegio ascendente)', async () => {
    const { createOscillator } = mockAudioContext();
    const { playPass } = await freshSfx();

    playPass(true);

    expect(createOscillator).toHaveBeenCalledTimes(2);
  });

  it('con soundEnabled=true, playVictory dispara cuatro osciladores (fanfarria C-E-G-C)', async () => {
    const { createOscillator, oscillator } = mockAudioContext();
    const { playVictory } = await freshSfx();

    playVictory(true);

    expect(createOscillator).toHaveBeenCalledTimes(4);
    expect(oscillator.start).toHaveBeenCalledTimes(4);
    expect(oscillator.stop).toHaveBeenCalledTimes(4);
  });

  it('reutiliza el mismo AudioContext entre llamadas sucesivas (no crea uno nuevo cada vez)', async () => {
    const { AudioContextMock } = mockAudioContext();
    const { playClick, playPass } = await freshSfx();

    playClick(true);
    playPass(true);

    expect(AudioContextMock).toHaveBeenCalledTimes(1);
  });
});
