import type { CaseResult, SandboxResult, TestCase } from '../types/challenge';

/**
 * Ejecución PURA y síncrona del código del jugador contra los casos de prueba.
 *
 * Este módulo no conoce Web Workers ni timeouts: solo construye la función a
 * partir del código, la ejecuta con cada caso y compara el resultado. Está
 * pensado para vivir DENTRO del Web Worker (aislado del DOM y de la app) y para
 * ser testeable de forma directa en Vitest.
 *
 * ⚠️ No protege contra bucles infinitos: esa responsabilidad es del hilo
 * principal (ver lib/codeRunner.ts), que termina el worker por timeout. Por eso
 * NUNCA debe llamarse a runTestCases con código no confiable fuera de un worker.
 */
export function runTestCases(
  code: string,
  functionName: string,
  testCases: TestCase[],
): SandboxResult {
  let fn: (...args: unknown[]) => unknown;

  try {
    // El código corre dentro del worker; new Function lo aísla del scope de la
    // app (no ve la store, el DOM ni las variables del módulo). En modo strict.
    const factory = new Function(
      `"use strict";\n${code}\nreturn typeof ${functionName} === "function" ? ${functionName} : undefined;`,
    );
    fn = factory() as (...args: unknown[]) => unknown;
    if (typeof fn !== 'function') {
      return {
        outcome: 'error',
        cases: [],
        errorMessage: `No se encontró una función llamada "${functionName}".`,
      };
    }
  } catch (err) {
    return { outcome: 'error', cases: [], errorMessage: describeError(err) };
  }

  const cases: CaseResult[] = [];
  let anyErrored = false;
  let allPassed = true;

  for (const testCase of testCases) {
    try {
      const actual = fn(...testCase.args);
      const passed = deepEqual(actual, testCase.expected);
      if (!passed) allPassed = false;
      cases.push({
        description: testCase.description,
        passed,
        expected: testCase.expected,
        actual,
        errored: false,
      });
    } catch (err) {
      anyErrored = true;
      allPassed = false;
      cases.push({
        description: testCase.description,
        passed: false,
        expected: testCase.expected,
        actual: describeError(err),
        errored: true,
      });
    }
  }

  const outcome: SandboxResult['outcome'] = anyErrored ? 'error' : allPassed ? 'pass' : 'fail';
  return {
    outcome,
    cases,
    errorMessage: anyErrored ? 'El código lanzó un error durante la ejecución.' : undefined,
  };
}

function describeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

/** Igualdad profunda para primitivos, arrays y objetos planos (incluye NaN). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  const aArray = Array.isArray(a);
  const bArray = Array.isArray(b);
  if (aArray !== bArray) return false;

  if (aArray && bArray) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(bObj, key) && deepEqual(aObj[key], bObj[key]));
}
