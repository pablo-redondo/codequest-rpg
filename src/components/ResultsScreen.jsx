export function ResultsScreen({
  currentZone,
  sessionCorrect,
  sessionXP,
  gold,
  inventory,
  totalMissions,
  onGoToWorld,
}) {
  const accuracy = totalMissions > 0 ? Math.round((sessionCorrect / totalMissions) * 100) : 0;
  const lootItem = currentZone
    ? currentZone.icon + ' ' + currentZone.name.replace('Zona de ', '') + ' Scroll'
    : null;

  return (
    <div className="screen results-screen">
      <h2 className="results-title">🏆 Zona Completada</h2>
      {currentZone && (
        <p className="results-zone">{currentZone.icon} {currentZone.name}</p>
      )}

      <div className="results-grid">
        <div className="result-card">
          <div className="result-value">{sessionCorrect}/{totalMissions}</div>
          <div className="result-label">Correctas</div>
        </div>
        <div className="result-card">
          <div className="result-value">+{sessionXP}</div>
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

      <button className="btn-primary" onClick={onGoToWorld}>
        🗺️ Volver al Mapa
      </button>
    </div>
  );
}
