import type { CodeChallenge } from '../../types/challenge';

interface PromptPanelProps {
  challenge: CodeChallenge;
}

export function PromptPanel({ challenge }: PromptPanelProps) {
  return (
    <>
      <div className="npc-dialog">
        <span className="npc-avatar">📜</span>
        <div className="npc-bubble">
          <strong>Mision</strong>
          <p>{challenge.prompt}</p>
        </div>
      </div>

      <div className="concept-box">
        <div className="concept-label">📚 Concepto</div>
        <p>{challenge.conceptExplanation}</p>
      </div>
    </>
  );
}
