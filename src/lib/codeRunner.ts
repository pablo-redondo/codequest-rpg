import type {
  ChallengeResult,
  CodeChallenge,
  SandboxRequest,
  SandboxResult,
} from '../types/challenge';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PRIVACIDAD / SEGURIDAD — LEER ANTES DE MODIFICAR
 * ═══════════════════════════════════════════════════════════════════════════
 *  La ejecución del código del jugador es 100% CLIENT-SIDE. El código escrito
 *  en el editor se ejecuta dentro de un Web Worker aislado en el propio
 *  navegador del jugador (ver worker/sandbox.worker.ts) y NUNCA se envía a
 *  ningún backend, API ni servidor: no hay fetch/XHR/WebSocket con el código.
 *  No se transmite, no se registra en remoto y no sale de la máquina del
 *  usuario. Cualquier cambio futuro debe preservar esta propiedad.
 *
 *  El hilo principal se limita a: enviar el código al worker, cronometrar la
 *  ejecución y TERMINAR el worker si supera el timeout (así se corta un bucle
 *  infinito, ya que un worker colgado no puede resolver su propio timeout).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const DEFAULT_TIMEOUT_MS = 2000;

/** Contrato mínimo de worker que necesita el runner (permite inyectar uno falso en tests). */
export interface RunnerWorker {
  postMessage(message: SandboxRequest): void;
  onmessage: ((event: MessageEvent<SandboxResult>) => void) | null;
  terminate(): void;
}

/** Crea el Web Worker real. Vite empaqueta el worker a partir de esta URL. */
export function createSandboxWorker(): RunnerWorker {
  return new Worker(new URL('../worker/sandbox.worker.ts', import.meta.url), {
    type: 'module',
  }) as unknown as RunnerWorker;
}

interface RunOptions {
  timeoutMs?: number;
  /** Solo para tests: inyecta un worker controlable en vez del real. */
  createWorker?: () => RunnerWorker;
}

/**
 * Ejecuta el código del jugador contra los casos de prueba del reto dentro de
 * un worker aislado, aplicando un timeout. Nunca lanza: siempre resuelve con un
 * ChallengeResult (pass | fail | error | timeout).
 */
export function runChallenge(
  code: string,
  challenge: Pick<CodeChallenge, 'functionName' | 'testCases'>,
  options: RunOptions = {},
): Promise<ChallengeResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const createWorker = options.createWorker ?? createSandboxWorker;
  const startedAt = Date.now();
  const worker = createWorker();

  return new Promise<ChallengeResult>((resolve) => {
    let settled = false;

    const finish = (result: ChallengeResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ outcome: 'timeout', cases: [], durationMs: Date.now() - startedAt });
    }, timeoutMs);

    worker.onmessage = (event) => {
      const sandbox = event.data;
      finish({
        outcome: sandbox.outcome,
        cases: sandbox.cases,
        errorMessage: sandbox.errorMessage,
        durationMs: Date.now() - startedAt,
      });
    };

    worker.postMessage({
      code,
      functionName: challenge.functionName,
      testCases: challenge.testCases,
    });
  });
}
