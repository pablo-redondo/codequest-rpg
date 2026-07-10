import type { Spell } from '../../types/spell';

interface SpellBarProps {
  /** Hechizos ya desbloqueados por el jugador. */
  spells: Spell[];
  usedSpellIds: Set<string>;
  onCast: (spell: Spell) => void;
}

export function SpellBar({ spells, usedSpellIds, onCast }: SpellBarProps) {
  if (spells.length === 0) return null;

  return (
    <div className="spell-bar">
      <div className="code-label">🪄 Grimorio activo</div>
      <div className="spell-buttons">
        {spells.map((spell) => (
          <button
            key={spell.id}
            className="spell-btn"
            disabled={usedSpellIds.has(spell.id)}
            onClick={() => onCast(spell)}
            title={spell.description}
          >
            {spell.icon} {spell.name}
          </button>
        ))}
      </div>
    </div>
  );
}
