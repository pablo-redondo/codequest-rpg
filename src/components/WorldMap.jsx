import { zones } from '../data/zones';

export function WorldMap({ level, xp, gold, inventory, xpProgress, onStartZone }) {
  return (
    <div className="screen world-screen">
      <h2 className="world-title">🗺️ Mapa del Mundo</h2>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-icon">⭐</span>
          <span>Nivel {level}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">✨</span>
          <span>{xp} XP</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💰</span>
          <span>{gold} Gold</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🎒</span>
          <span>{inventory.length} items</span>
        </div>
      </div>

      <div className="xp-bar-container">
        <div className="xp-bar-label">
          XP al siguiente nivel
        </div>
        <div className="xp-bar-track">
          <div
            className="xp-bar-fill"
            style={{ width: `${Math.min(100, xpProgress)}%` }}
          />
        </div>
        <div className="xp-bar-pct">{Math.round(xpProgress)}%</div>
      </div>

      {inventory.length > 0 && (
        <div className="inventory-section">
          <h3 className="inventory-title">🎒 Inventario</h3>
          <div className="inventory-grid">
            {inventory.map((item, i) => (
              <span key={i} className="inventory-item">{item}</span>
            ))}
          </div>
        </div>
      )}

      <div className="zones-grid">
        {zones.map(zone => (
          <button
            key={zone.id}
            className="zone-card"
            style={{ '--zone-color': zone.color }}
            onClick={() => onStartZone(zone.id)}
          >
            <div className="zone-icon">{zone.icon}</div>
            <div className="zone-name">{zone.name}</div>
            <div className="zone-desc">{zone.description}</div>
            <div className="zone-missions">{zone.missions.length} misiones</div>
          </button>
        ))}
      </div>
    </div>
  );
}
