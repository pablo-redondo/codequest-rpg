import { CONCEPT_META } from '../data/spells';
import type { Concept } from '../types/challenge';

interface MasteryBarsProps {
  masteryByConcept: Record<Concept, number>;
}

/** Ancho de barra normalizado: a partir de este nivel se considera "llena". */
const MASTERY_BAR_MAX = 5;

export function MasteryBars({ masteryByConcept }: MasteryBarsProps) {
  const concepts = Object.keys(masteryByConcept) as Concept[];
  const practiced = concepts.filter((concept) => masteryByConcept[concept] > 0);

  if (practiced.length === 0) return null;

  return (
    <div className="mastery-section">
      <h3 className="inventory-title">📊 Maestría</h3>
      <div className="mastery-grid">
        {practiced.map((concept) => {
          const level = masteryByConcept[concept];
          const percent = Math.min(100, (level / MASTERY_BAR_MAX) * 100);
          const meta = CONCEPT_META[concept];
          return (
            <div key={concept} className="mastery-row">
              <span className="mastery-label">
                {meta.icon} {meta.label}
              </span>
              <div className="mastery-track">
                <div className="mastery-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="mastery-count">{level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
