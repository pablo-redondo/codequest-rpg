import { zones } from '../data/zones';
import { useGameStore } from '../store/gameStore';
import { MasteryBars } from './MasteryBars';
import { Grimoire } from './Grimoire';

const XP_PER_LEVEL = 100;

export function WorldMap() {
  const player = useGameStore((state) => state.player);
  const skills = useGameStore((state) => state.skills);
  const startZone = useGameStore((state) => state.startZone);
  const xpProgress = (player.xp / (player.level * XP_PER_LEVEL)) * 100;

  return (
    <div className="screen world-screen">
      <h2 className="world-title">🗺️ Mapa del Mundo</h2>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-icon">⭐</span>
          <span>Nivel {player.level}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">✨</span>
          <span>{player.xp} XP</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💰</span>
          <span>{player.gold} Gold</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🎒</span>
          <span>{player.inventory.length} items</span>
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

      {player.inventory.length > 0 && (
        <div className="inventory-section">
          <h3 className="inventory-title">🎒 Inventario</h3>
          <div className="inventory-grid">
            {player.inventory.map((item, i) => (
              <span key={i} className="inventory-item">{item}</span>
            ))}
          </div>
        </div>
      )}

      <MasteryBars masteryByConcept={skills.masteryByConcept} />
      <Grimoire unlockedSpellIds={skills.unlockedSpells} masteryByConcept={skills.masteryByConcept} />

      <div className="zones-grid">
        {zones.map(zone => (
          <button
            key={zone.id}
            className="zone-card"
            style={{ '--zone-color': zone.color } as React.CSSProperties}
            onClick={() => startZone(zone.id)}
          >
            <div className="zone-icon">{zone.icon}</div>
            <div className="zone-name">{zone.name}</div>
            <div className="zone-desc">{zone.description}</div>
            <div className="zone-missions">{zone.challenges.length} enemigos</div>
          </button>
        ))}
      </div>
    </div>
  );
}
