import { useGameStore, useCurrentZone, useCurrentMission } from '../store/gameStore';

export function MissionScreen() {
  const currentZone = useCurrentZone();
  const currentMission = useCurrentMission();
  const missionIndex = useGameStore((state) => state.mission.missionIndex);
  const answered = useGameStore((state) => state.mission.answered);
  const selectedAnswer = useGameStore((state) => state.mission.selectedAnswer);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const nextMission = useGameStore((state) => state.nextMission);

  if (!currentZone || !currentMission) return null;

  const totalMissions = currentZone.missions.length;

  return (
    <div className="screen mission-screen">
      <div className="mission-header">
        <span className="zone-badge" style={{ color: currentZone.color }}>
          {currentZone.icon} {currentZone.name}
        </span>
        <span className="mission-progress">
          Misión {missionIndex + 1} / {totalMissions}
        </span>
      </div>

      <div className="npc-dialog">
        <span className="npc-avatar">{currentMission.npc.split(' ')[0]}</span>
        <div className="npc-bubble">
          <strong>{currentMission.npc.slice(currentMission.npc.indexOf(' ') + 1)}:</strong>
          <p>{currentMission.story}</p>
        </div>
      </div>

      <div className="concept-box">
        <div className="concept-label">📚 Concepto</div>
        <p>{currentMission.concept}</p>
      </div>

      <div className="code-block">
        <div className="code-label">💻 Código</div>
        <pre><code>{currentMission.code}</code></pre>
      </div>

      <div className="question-section">
        <p className="question-text">❓ {currentMission.question}</p>
        <div className="choices-grid">
          {currentMission.choices.map((choice, i) => {
            let btnClass = 'choice-btn';
            if (answered) {
              if (i === currentMission.correct) btnClass += ' correct';
              else if (i === selectedAnswer && i !== currentMission.correct) btnClass += ' wrong';
            }
            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => submitAnswer(i)}
                disabled={answered}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div className={`feedback-box ${selectedAnswer === currentMission.correct ? 'feedback-correct' : 'feedback-wrong'}`}>
          <div className="feedback-icon">
            {selectedAnswer === currentMission.correct ? '✅ ¡Correcto! +30 XP +10 Gold' : '❌ Incorrecto'}
          </div>
          <p className="feedback-text">{currentMission.explanation}</p>
          <button className="btn-primary" onClick={nextMission}>
            {missionIndex + 1 < totalMissions ? '➡️ Siguiente Misión' : '🏆 Ver Resultados'}
          </button>
        </div>
      )}
    </div>
  );
}
