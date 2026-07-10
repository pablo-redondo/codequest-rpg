import type { ChallengeResult } from '../../types/challenge';

export type ChallengeStatus = 'idle' | 'running' | 'pass' | 'fail' | 'error' | 'timeout';

interface FeedbackAreaProps {
  status: ChallengeStatus;
  result: ChallengeResult | null;
  rewardGold: number;
  /** XP realmente ganado en el pass (incluye el bonus flawless si aplica). */
  xpGained: number;
  flawless: boolean;
  isLastChallenge: boolean;
  onNext: () => void;
}

export function FeedbackArea({
  status,
  result,
  rewardGold,
  xpGained,
  flawless,
  isLastChallenge,
  onNext,
}: FeedbackAreaProps) {
  if (status === 'idle') return null;

  if (status === 'running') {
    return (
      <div className="feedback-box feedback-running">
        <div className="feedback-icon">
          <span className="spinner" /> Lanzando hechizo en un plano aislado…
        </div>
      </div>
    );
  }

  if (status === 'pass') {
    return (
      <div className="feedback-box feedback-correct">
        <div className="feedback-icon">✅ ¡Enemigo derrotado! +{xpGained} XP +{rewardGold} Gold</div>
        {flawless && (
          <p className="feedback-flawless">⚡ ¡Impecable! Sin fallos previos (+20 XP de bonus)</p>
        )}
        <button className="btn-primary" onClick={onNext}>
          {isLastChallenge ? '🏆 Ver Resultados' : '➡️ Siguiente Enemigo'}
        </button>
      </div>
    );
  }

  if (status === 'fail') {
    return (
      <div className="feedback-box feedback-wrong">
        <div className="feedback-icon">❌ El enemigo resiste todavía</div>
        <p className="feedback-text">
          Revisa los casos de prueba fallidos abajo y vuelve a atacar cuando corrijas tu hechizo.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="feedback-box feedback-error">
        <div className="feedback-icon">💥 Tu hechizo se deshizo</div>
        <p className="feedback-text">{result?.errorMessage ?? 'Error desconocido al ejecutar el código.'}</p>
      </div>
    );
  }

  // timeout
  return (
    <div className="feedback-box feedback-timeout">
      <div className="feedback-icon">⌛ El hechizo tardó demasiado</div>
      <p className="feedback-text">
        El enemigo te interrumpió antes de completar el conjuro. ¿Quizás un bucle infinito? Revisa
        las condiciones de salida de tus bucles o llamadas recursivas.
      </p>
    </div>
  );
}
