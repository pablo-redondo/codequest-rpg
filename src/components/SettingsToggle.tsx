import { useGameStore } from '../store/gameStore';

/**
 * Toggles de sonido y CRT. De momento solo leen/escriben settings en la
 * store: el sonido real y el overlay CRT llegan en pasos posteriores del
 * rediseño retro.
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
        onClick={toggleSound}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? '🔊' : '🔇'} Sonido
      </button>
      <button
        className="settings-btn"
        onClick={toggleCrt}
        aria-pressed={crtEnabled}
      >
        📺 CRT {crtEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
