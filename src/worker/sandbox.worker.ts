import { runTestCases } from '../lib/sandbox';
import type { SandboxRequest, SandboxResult } from '../types/challenge';

/**
 * Web Worker que ejecuta el código del jugador en un hilo aislado, separado del
 * DOM y del estado de la aplicación. Recibe una SandboxRequest, ejecuta los
 * casos de prueba de forma síncrona y devuelve el SandboxResult.
 *
 * El timeout (bucles infinitos) lo gestiona el hilo principal terminando este
 * worker; ver lib/codeRunner.ts.
 */

// Tipado mínimo del scope del worker sin depender de la lib "webworker"
// (que entraría en conflicto con la lib "DOM" del tsconfig).
interface WorkerScope {
  onmessage: ((event: MessageEvent<SandboxRequest>) => void) | null;
  postMessage(message: SandboxResult): void;
}

const ctx = self as unknown as WorkerScope;

ctx.onmessage = (event) => {
  const { code, functionName, testCases } = event.data;
  const result = runTestCases(code, functionName, testCases);
  ctx.postMessage(result);
};
