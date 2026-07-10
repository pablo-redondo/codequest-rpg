import { CONCEPT_META, spells } from '../data/spells';
import type { Concept } from '../types/challenge';

interface GrimoireProps {
  unlockedSpellIds: string[];
  masteryByConcept: Record<Concept, number>;
}

export function Grimoire({ unlockedSpellIds, masteryByConcept }: GrimoireProps) {
  return (
    <div className="grimoire-section">
      <h3 className="inventory-title">📖 Grimorio</h3>
      <ul className="grimoire-list">
        {spells.map((spell) => {
          const unlocked = unlockedSpellIds.includes(spell.id);
          const progress = masteryByConcept[spell.concept];
          const meta = CONCEPT_META[spell.concept];

          return (
            <li key={spell.id} className={`grimoire-item ${unlocked ? 'grimoire-unlocked' : 'grimoire-locked'}`}>
              <span className="grimoire-icon">{unlocked ? spell.icon : '🔒'}</span>
              <div className="grimoire-info">
                <div className="grimoire-name">{spell.name}</div>
                <div className="grimoire-desc">{spell.description}</div>
                {!unlocked && (
                  <div className="grimoire-requirement">
                    Requiere {meta.icon} {meta.label}: {progress}/{spell.threshold}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
