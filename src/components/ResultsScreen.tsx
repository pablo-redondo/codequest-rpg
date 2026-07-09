import { useGameStore, useCurrentZone } from '../store/gameStore';
import { getLootItem } from '../utils/loot';

export function ResultsScreen() {
  const currentZone = useCurrentZone();
  const session = useGameStore((state) => state.session);
  const gold = useGameStore((state) => state.player.gold);
  const goToWorld = useGameStore((state) => state.goToWorld);

  const totalChallenges = currentZone ? currentZone.challenges.length : 0;
  const accuracy = totalChallenges > 0 ? Math.round((session.sessionCorrect / totalChallenges) * 100) : 0;
  const lootItem = currentZone ? getLootItem(currentZone) : null;

  return (
    <div className="screen results-screen">
      <h2 className="results-title">🏆 Zona Completada</h2>
      {currentZone && (
        <p className="results-zone">{currentZone.icon} {currentZone.name}</p>
      )}

      <div className="results-grid">
        <div className="result-card">
          <div className="result-value">{session.sessionCorrect}/{totalChallenges}</div>
          <div className="result-label">Enemigos Vencidos</div>
        </div>
        <div className="result-card">
          <div className="result-value">+{session.sessionXP}</div>
          <div className="result-label">XP Ganado</div>
        </div>
        <div className="result-card">
          <div className="result-value">{accuracy}%</div>
          <div className="result-label">Precisión</div>
        </div>
        <div className="result-card">
          <div className="result-value">{gold}</div>
          <div className="result-label">Gold Total</div>
        </div>
      </div>

      {lootItem && (
        <div className="loot-section">
          <h3 className="loot-title">🎁 Loot Obtenido</h3>
          <div className="loot-grid">
            <div className="loot-item pop-in">{lootItem}</div>
          </div>
        </div>
      )}

      {accuracy === 100 && (
        <div className="perfect-badge">⭐ ¡Puntuación Perfecta! ⭐</div>
      )}

      <button className="btn-primary" onClick={goToWorld}>
        🗺️ Volver al Mapa
      </button>
    </div>
  );
}
