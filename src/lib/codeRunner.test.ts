import { describe, expect, it } from 'vitest';
import { runChallenge, type RunnerWorker } from './codeRunner';
import type { SandboxRequest, SandboxResult, TestCase } from '../types/challenge';

const testCases: TestCase[] = [{ args: [1, 2], expected: 3 }];

/**
 * Worker falso que responde de forma asíncrona con un resultado fijo. Sirve
 * para probar la orquestación del runner sin un Web Worker real (que no existe
 * en el entorno de Vitest).
 */
function makeEchoWorker(result: SandboxResult) {
  const worker: RunnerWorker & { terminated: boolean; received?: SandboxRequest } = {
    terminated: false,
    onmessage: null,
    postMessage(message) {
      worker.received = message;
      setTimeout(() => {
        worker.onmessage?.({ data: result } as MessageEvent<SandboxResult>);
      }, 0);
    },
    terminate() {
      worker.terminated = true;
    },
  };
  return worker;
}

/** Worker falso que nunca responde: simula un bucle infinito. */
function makeHangingWorker() {
  const worker: RunnerWorker & { terminated: boolean } = {
    terminated: false,
    onmessage: null,
    postMessage() {
      /* nunca responde */
    },
    terminate() {
      worker.terminated = true;
    },
  };
  return worker;
}

describe('runChallenge', () => {
  it('resolves with the worker result and adds durationMs on success', async () => {
    const sandbox: SandboxResult = {
      outcome: 'pass',
      cases: [{ passed: true, expected: 3, actual: 3, errored: false }],
    };
    const worker = makeEchoWorker(sandbox);

    const result = await runChallenge('function f(){}', { functionName: 'f', testCases }, {
      createWorker: () => worker,
    });

    expect(result.outcome).toBe('pass');
    expect(result.cases).toEqual(sandbox.cases);
    expect(typeof result.durationMs).toBe('number');
    expect(worker.terminated).toBe(true);
    expect(worker.received).toEqual({ code: 'function f(){}', functionName: 'f', testCases });
  });

  it('forwards a "fail" outcome unchanged', async () => {
    const worker = makeEchoWorker({
      outcome: 'fail',
      cases: [{ passed: false, expected: 3, actual: 4, errored: false }],
    });

    const result = await runChallenge('code', { functionName: 'f', testCases }, {
      createWorker: () => worker,
    });

    expect(result.outcome).toBe('fail');
  });

  it('resolves as "timeout" and terminates the worker on an infinite loop', async () => {
    const worker = makeHangingWorker();

    const result = await runChallenge('while(true){}', { functionName: 'f', testCases }, {
      timeoutMs: 20,
      createWorker: () => worker,
    });

    expect(result.outcome).toBe('timeout');
    expect(result.cases).toEqual([]);
    expect(worker.terminated).toBe(true);
    expect(typeof result.durationMs).toBe('number');
  });
});
