import { useState } from 'react';
import { useCurrentChallenge, useCurrentZone, useGameStore } from '../../store/gameStore';
import { runChallenge } from '../../lib/codeRunner';
import { EnemyHeader } from './EnemyHeader';
import { PromptPanel } from './PromptPanel';
import { CodeEditor } from './CodeEditor';
import { TestCasesPanel } from './TestCasesPanel';
import { FeedbackArea, type ChallengeStatus } from './FeedbackArea';
import type { ChallengeResult, CodeChallenge } from '../../types/challenge';
import type { Zone } from '../../types/zone';

export function ChallengeScreen() {
  const zone = useCurrentZone();
  const challenge = useCurrentChallenge();

  if (!zone || !challenge) return null;

  // key={challenge.id} remonta este subárbol al cambiar de reto, así el
  // estado local (código, feedback) arranca limpio sin necesidad de un
  // useEffect que sincronice manualmente el estado.
  return <ChallengeRunner key={challenge.id} zone={zone} challenge={challenge} />;
}

interface ChallengeRunnerProps {
  zone: Zone;
  challenge: CodeChallenge;
}

function ChallengeRunner({ zone, challenge }: ChallengeRunnerProps) {
  const challengeIndex = useGameStore((state) => state.challenge.challengeIndex);
  const applyChallengeResult = useGameStore((state) => state.applyChallengeResult);
  const nextChallenge = useGameStore((state) => state.nextChallenge);

  const [code, setCode] = useState(challenge.starterCode);
  const [status, setStatus] = useState<ChallengeStatus>('idle');
  const [result, setResult] = useState<ChallengeResult | null>(null);

  const isRunning = status === 'running';
  const isLastChallenge = challengeIndex + 1 >= zone.challenges.length;
  const casesPassed = result ? result.cases.filter((c) => c.passed).length : 0;

  async function handleAttack() {
    setStatus('running');
    setResult(null);

    const outcome = await runChallenge(code, challenge);

    setResult(outcome);
    setStatus(outcome.outcome);
    applyChallengeResult(outcome);
  }

  return (
    <div className="screen challenge-screen">
      <EnemyHeader
        zone={zone}
        challenge={challenge}
        challengeIndex={challengeIndex}
        casesPassed={casesPassed}
      />

      <PromptPanel challenge={challenge} />

      <CodeEditor value={code} onChange={setCode} readOnly={isRunning || status === 'pass'} />

      <TestCasesPanel testCases={challenge.testCases} caseResults={result?.cases ?? null} />

      {status !== 'pass' && (
        <button className="btn-primary action-button" onClick={handleAttack} disabled={isRunning}>
          {isRunning ? '⏳ Ejecutando…' : '⚔️ Atacar (ejecutar)'}
        </button>
      )}

      <FeedbackArea
        status={status}
        result={result}
        rewardXp={challenge.rewardXp}
        rewardGold={challenge.rewardGold}
        isLastChallenge={isLastChallenge}
        onNext={nextChallenge}
      />
    </div>
  );
}
