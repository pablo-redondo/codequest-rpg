import { useState } from 'react';
import { useCurrentChallenge, useCurrentZone, useGameStore } from '../../store/gameStore';
import { DEFAULT_TIMEOUT_MS, runChallenge } from '../../lib/codeRunner';
import { spells } from '../../data/spells';
import { EnemyHeader } from './EnemyHeader';
import { PromptPanel } from './PromptPanel';
import { CodeEditor } from './CodeEditor';
import { TestCasesPanel } from './TestCasesPanel';
import { SpellBar } from './SpellBar';
import { FeedbackArea, type ChallengeStatus } from './FeedbackArea';
import type { ChallengeResult, CodeChallenge } from '../../types/challenge';
import type { Spell } from '../../types/spell';
import type { Zone } from '../../types/zone';

export function ChallengeScreen() {
  const zone = useCurrentZone();
  const challenge = useCurrentChallenge();

  if (!zone || !challenge) return null;

  // key={challenge.id} remonta este subárbol al cambiar de reto, así el
  // estado local (código, feedback, hechizos usados) arranca limpio sin
  // necesidad de un useEffect que sincronice manualmente el estado.
  return <ChallengeRunner key={challenge.id} zone={zone} challenge={challenge} />;
}

interface ChallengeRunnerProps {
  zone: Zone;
  challenge: CodeChallenge;
}

function ChallengeRunner({ zone, challenge }: ChallengeRunnerProps) {
  const challengeIndex = useGameStore((state) => state.challenge.challengeIndex);
  const unlockedSpellIds = useGameStore((state) => state.skills.unlockedSpells);
  const applyChallengeResult = useGameStore((state) => state.applyChallengeResult);
  const nextChallenge = useGameStore((state) => state.nextChallenge);

  const [code, setCode] = useState(challenge.starterCode);
  const [status, setStatus] = useState<ChallengeStatus>('idle');
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [passInfo, setPassInfo] = useState<{ flawless: boolean; xpGained: number } | null>(null);

  // Efectos de los hechizos, todos ámbito-reto (se resetean al cambiar de reto
  // porque ChallengeRunner se remonta con key={challenge.id}).
  const [usedSpellIds, setUsedSpellIds] = useState<Set<string>>(new Set());
  const [extendedTimeout, setExtendedTimeout] = useState(false);
  const [revealedHiddenIndices, setRevealedHiddenIndices] = useState<number[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  const isRunning = status === 'running';
  const isLastChallenge = challengeIndex + 1 >= zone.challenges.length;
  const casesPassed = result ? result.cases.filter((c) => c.passed).length : 0;
  const unlockedSpells = spells.filter((spell) => unlockedSpellIds.includes(spell.id));
  const effectiveTimeoutMs = extendedTimeout ? DEFAULT_TIMEOUT_MS * 1.5 : DEFAULT_TIMEOUT_MS;

  async function handleAttack() {
    setStatus('running');
    setResult(null);
    setPassInfo(null);

    const outcome = await runChallenge(code, challenge, { timeoutMs: effectiveTimeoutMs });

    setResult(outcome);
    setStatus(outcome.outcome);
    setPassInfo(applyChallengeResult(outcome));
  }

  function markUsed(spellId: string) {
    setUsedSpellIds((prev) => new Set(prev).add(spellId));
  }

  async function handleCastSpell(spell: Spell) {
    switch (spell.effect) {
      case 'reveal-first-failure': {
        // Marca el hechizo como usado ANTES del await: si no, un doble-clic
        // rápido puede disparar dos dry-runs concurrentes (el botón no se
        // deshabilita hasta que la promesa resuelve).
        markUsed(spell.id);
        // Ejecución de diagnóstico: corre el código en el worker pero NUNCA
        // llama a applyChallengeResult, así no cuenta como intento.
        setDiagnosing(true);
        const dryRun = await runChallenge(code, challenge, { timeoutMs: effectiveTimeoutMs });
        setDiagnosing(false);

        const firstFailureIndex = dryRun.cases.findIndex((c) => !c.passed);
        if (firstFailureIndex === -1) {
          setHintMessage('🔍 Tu código ya pasa todos los casos que puedo ver. ¡Ataca para confirmarlo!');
          return;
        }
        const failedCase = dryRun.cases[firstFailureIndex];
        const meta = challenge.testCases[firstFailureIndex];
        if (meta.hidden) {
          setHintMessage('🔍 Un caso oculto sigue fallando. Revisa casos límite que no ves en pantalla.');
        } else {
          setHintMessage(
            `🔍 Falla "${meta.description ?? `caso ${firstFailureIndex + 1}`}": esperado ` +
              `${JSON.stringify(failedCase.expected)}, obtuviste ${JSON.stringify(failedCase.actual)}.`,
          );
        }
        return;
      }

      case 'extend-timeout': {
        setExtendedTimeout(true);
        markUsed(spell.id);
        return;
      }

      case 'reveal-hidden-case': {
        const nextHiddenIndex = challenge.testCases.findIndex(
          (tc, i) => tc.hidden && !revealedHiddenIndices.includes(i),
        );
        if (nextHiddenIndex !== -1) {
          setRevealedHiddenIndices((prev) => [...prev, nextHiddenIndex]);
        }
        markUsed(spell.id);
        return;
      }

      case 'reveal-base-case-hint': {
        setHintMessage(challenge.hints?.[0] ?? '🌀 Este reto no tiene pistas adicionales registradas.');
        markUsed(spell.id);
        return;
      }
    }
  }

  return (
    <div className="screen challenge-screen">
      <EnemyHeader
        zone={zone}
        challenge={challenge}
        challengeIndex={challengeIndex}
        casesPassed={casesPassed}
        defeated={status === 'pass'}
      />

      <PromptPanel challenge={challenge} />

      <CodeEditor value={code} onChange={setCode} readOnly={isRunning || status === 'pass'} />

      <TestCasesPanel
        testCases={challenge.testCases}
        caseResults={result?.cases ?? null}
        revealedHiddenIndices={revealedHiddenIndices}
      />

      {hintMessage && <div className="hint-box">{hintMessage}</div>}

      <SpellBar spells={unlockedSpells} usedSpellIds={usedSpellIds} onCast={handleCastSpell} />

      {status !== 'pass' && (
        <button
          className="btn-primary action-button"
          onClick={handleAttack}
          disabled={isRunning || diagnosing}
        >
          {isRunning ? '⏳ Ejecutando…' : '⚔️ Atacar (ejecutar)'}
        </button>
      )}

      <FeedbackArea
        status={status}
        result={result}
        rewardGold={challenge.rewardGold}
        xpGained={passInfo?.xpGained ?? challenge.rewardXp}
        flawless={passInfo?.flawless ?? false}
        isLastChallenge={isLastChallenge}
        onNext={nextChallenge}
      />
    </div>
  );
}
