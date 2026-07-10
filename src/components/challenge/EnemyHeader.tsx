import type { Zone } from '../../types/zone';
import type { CodeChallenge } from '../../types/challenge';

interface EnemyHeaderProps {
  zone: Zone;
  challenge: CodeChallenge;
  challengeIndex: number;
  casesPassed: number;
}

export function EnemyHeader({ zone, challenge, challengeIndex, casesPassed }: EnemyHeaderProps) {
  const totalCases = challenge.testCases.length;

  return (
    <div className="enemy-header">
      <div className="enemy-header-top">
        <span className="zone-badge" style={{ color: zone.color }}>
          {zone.icon} {zone.name}
        </span>
        <span className="mission-progress">
          Enemigo {challengeIndex + 1} / {zone.challenges.length}
        </span>
      </div>

      <div className="enemy-card">
        <div className="enemy-icon">{challenge.enemy.icon}</div>
        <div className="enemy-info">
          <div className="enemy-name">{challenge.enemy.name}</div>
          {/* key={casesPassed}: remonta la fila de bloques en cada intento
              nuevo, así el flash de "bloque vaciado" se reproduce siempre
              desde el principio en vez de depender de comparar el estado
              anterior caso por caso. */}
          <div className="enemy-hp-track" key={casesPassed}>
            {Array.from({ length: totalCases }, (_, i) => (
              <div
                key={i}
                className={i < casesPassed ? 'enemy-hp-segment enemy-hp-segment-empty' : 'enemy-hp-segment enemy-hp-segment-filled'}
              />
            ))}
          </div>
          <div className="enemy-hp-label">
            {casesPassed} / {totalCases} casos superados
          </div>
        </div>
      </div>
    </div>
  );
}
