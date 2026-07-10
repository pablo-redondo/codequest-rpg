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
  const hpPercent = Math.max(0, Math.round(100 - (casesPassed / totalCases) * 100));

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
          <div className="enemy-hp-track">
            <div className="enemy-hp-fill" style={{ width: `${hpPercent}%` }} />
          </div>
          <div className="enemy-hp-label">
            {casesPassed} / {totalCases} casos superados
          </div>
        </div>
      </div>
    </div>
  );
}
