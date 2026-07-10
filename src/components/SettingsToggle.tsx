import { useGameStore } from '../store/gameStore';
import { playClick } from '../lib/sfx';

/**
 * Toggles de sonido y CRT. El overlay CRT llega en un paso posterior del
 * rediseño retro; el sonido ya suena vía Web Audio API (src/lib/sfx.ts),
 * gateado en todo momento por settings.soundEnabled.
 */
export function SettingsToggle() {
  const soundEnabled = useGameStore((state) => state.settings.soundEnabled);
  const crtEnabled = useGameStore((state) => state.settings.crtEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const toggleCrt = useGameStore((state) => state.toggleCrt);

  return (
    <div className="settings-toggle">
      <button
        className="settings-btn"
        onClick={() => {
          playClick(soundEnabled);
          toggleSound();
        }}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? '🔊' : '🔇'} Sonido
      </button>
      <button
        className="settings-btn"
        onClick={() => {
          playClick(soundEnabled);
          toggleCrt();
        }}
        aria-pressed={crtEnabled}
      >
        📺 CRT {crtEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
