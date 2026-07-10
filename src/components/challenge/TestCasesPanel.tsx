import type { CaseResult, TestCase } from '../../types/challenge';

interface TestCasesPanelProps {
  testCases: TestCase[];
  /** Resultados del último intento, en el mismo orden que testCases. */
  caseResults: CaseResult[] | null;
  /** Índices de casos ocultos revelados por el hechizo Mano del Recolector. */
  revealedHiddenIndices?: number[];
}

export function TestCasesPanel({
  testCases,
  caseResults,
  revealedHiddenIndices = [],
}: TestCasesPanelProps) {
  return (
    <div className="test-cases-panel">
      <div className="code-label">🎯 Casos de prueba</div>
      <ul className="test-cases-list">
        {testCases.map((testCase, i) => {
          const result = caseResults?.[i];
          const isRevealed = revealedHiddenIndices.includes(i);
          let statusClass = 'test-case-item';
          if (result) statusClass += result.passed ? ' test-case-pass' : ' test-case-fail';

          return (
            <li key={i} className={statusClass}>
              {result && <span className="test-case-icon">{result.passed ? '✅' : '❌'}</span>}
              {testCase.hidden && !isRevealed ? (
                <span className="test-case-hidden">??? (caso oculto)</span>
              ) : (
                <span className="test-case-detail">
                  {testCase.description ?? `caso ${i + 1}`}
                  {testCase.hidden && isRevealed && (
                    <span className="test-case-diff">
                      {' '}
                      — 🖐️ revelado: <code>{JSON.stringify(testCase.args)}</code> →{' '}
                      <code>{JSON.stringify(testCase.expected)}</code>
                    </span>
                  )}
                  {!testCase.hidden && result && !result.passed && (
                    <span className="test-case-diff">
                      {' '}
                      — esperado: <code>{JSON.stringify(result.expected)}</code>, obtenido:{' '}
                      <code>{JSON.stringify(result.actual)}</code>
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
