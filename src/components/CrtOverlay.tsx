import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { shouldApplyCrt } from '../lib/crt';

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Capa de scanlines + viñeta superpuesta a todo el juego. El editor de
 * código (CodeMirror) queda por encima en z-index con su propio fondo
 * opaco (ver .code-editor en game.css), así que el overlay nunca se ve
 * sobre el código.
 */
export function CrtOverlay() {
  const crtEnabled = useGameStore((state) => state.settings.crtEnabled);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!shouldApplyCrt(crtEnabled, prefersReducedMotion)) return null;

  return <div className="crt-overlay" aria-hidden="true" />;
}
