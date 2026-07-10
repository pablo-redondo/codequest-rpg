import { describe, expect, it } from 'vitest';
import { deepEqual, runTestCases } from './sandbox';
import { challenges } from '../data/challenges';
import type { TestCase } from '../types/challenge';

describe('deepEqual', () => {
  it('compares primitives, NaN, arrays and plain objects', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual([1], { 0: 1 })).toBe(false);
  });
});

describe('runTestCases outcomes', () => {
  const cases: TestCase[] = [
    { args: [50, 30], expected: 20 },
    { args: [10, 25], expected: 0 },
  ];

  it('returns "pass" when every case matches', () => {
    const code = 'function f(a, b) { return Math.max(0, a - b); }';
    const result = runTestCases(code, 'f', cases);

    expect(result.outcome).toBe('pass');
    expect(result.cases).toHaveLength(2);
    expect(result.cases.every((c) => c.passed)).toBe(true);
  });

  it('returns "fail" when the code runs but a case is wrong', () => {
    const code = 'function f(a, b) { return a - b; }'; // olvida el mínimo 0
    const result = runTestCases(code, 'f', cases);

    expect(result.outcome).toBe('fail');
    expect(result.cases[0].passed).toBe(true);
    expect(result.cases[1].passed).toBe(false);
    expect(result.cases[1].actual).toBe(-15);
  });

  it('returns "error" on a syntax error (no case runs)', () => {
    const code = 'function f(a, b) { return a - ; }';
    const result = runTestCases(code, 'f', cases);

    expect(result.outcome).toBe('error');
    expect(result.cases).toHaveLength(0);
    expect(result.errorMessage).toBeTruthy();
  });

  it('returns "error" when the named function is missing', () => {
    const code = 'function otra() { return 1; }';
    const result = runTestCases(code, 'f', cases);

    expect(result.outcome).toBe('error');
    expect(result.errorMessage).toContain('f');
  });

  it('returns "error" when a case throws at runtime', () => {
    const code = 'function f() { return noExiste.valor; }';
    const result = runTestCases(code, 'f', cases);

    expect(result.outcome).toBe('error');
    expect(result.cases[0].errored).toBe(true);
    expect(result.errorMessage).toBeTruthy();
  });

  it('does not leak app scope into the sandboxed function', () => {
    const secret = 'no-lo-veras';
    const code = 'function f() { return typeof secret; }';
    const result = runTestCases(code, 'f', [{ args: [], expected: 'undefined' }]);

    expect(result.outcome).toBe('pass');
    expect(secret).toBe('no-lo-veras');
  });
});

describe('each shipped challenge is solvable', () => {
  // Soluciones de referencia (viven solo en el test, no se envían al cliente).
  const solutions: Record<string, string> = {
    'golem-de-piedra': 'function calcularDaño(ataque, defensa) { return Math.max(0, ataque - defensa); }',
    'enjambre-de-slimes':
      'function sumarBotin(monedas) { let t = 0; for (const m of monedas) t += m; return t; }',
    'guardianes-heridos':
      'function contarVivos(heroes) { let v = 0; for (const h of heroes) if (h.vida > 0) v++; return v; }',
    'dragon-fractal':
      'function factorial(n) { return n === 0 ? 1 : n * factorial(n - 1); }',
    'mercader-embrujado':
      'function calcularPrecioFinal(precioBase, recargo, descuentoPorcentaje) { let precio = precioBase + recargo; precio = precio - (precio * descuentoPorcentaje / 100); return precio; }',
    'duende-trastocado':
      'function intercambiarAtributos(fuerza, agilidad) { const temp = fuerza; fuerza = agilidad; agilidad = temp; return [fuerza, agilidad]; }',
    'trol-tasador':
      'function encontrarMayorTesoro(tesoros) { let mayor = tesoros[0]; for (const t of tesoros) if (t > mayor) mayor = t; return mayor; }',
    'golem-contable':
      'function contarObjetosValiosos(objetos, umbral) { let total = 0; for (const o of objetos) if (o > umbral) total++; return total; }',
    'espejo-distorsionado':
      'function invertirPergamino(letras) { return [...letras].reverse(); }',
    'aprendiz-distraido':
      'function invocarHechizo(nombre, poder = 10) { if (!nombre) return "Hechizo fallido: falta el nombre"; return `${nombre} inflige ${poder} de daño`; }',
    'espiritu-combinador':
      'function aplicarHabilidad(base, habilidad) { return habilidad(base); }',
    'espectro-del-azar':
      'function calcularGolpe(probabilidad) { return probabilidad >= 90 ? "CRÍTICO" : "normal"; }',
    'hechicero-elemental':
      'function hallarDebilidad(elemento) { switch (elemento) { case "fuego": return "agua"; case "agua": return "tierra"; case "tierra": return "aire"; case "aire": return "fuego"; default: return "desconocido"; } }',
    'espiritu-fractal':
      'function sumarHastaN(n) { return n === 0 ? 0 : n + sumarHastaN(n - 1); }',
    'eco-del-bosque':
      'function contarVocales(palabra) { let v = 0; for (const letra of palabra) if ("aeiou".includes(letra)) v++; return v; }',
  };

  it.each(challenges)('reto "$id" pasa todos sus casos con la solución correcta', (challenge) => {
    const solution = solutions[challenge.id];
    expect(solution, `falta solución de referencia para ${challenge.id}`).toBeTruthy();

    const result = runTestCases(solution, challenge.functionName, challenge.testCases);

    expect(result.outcome).toBe('pass');
    expect(result.cases).toHaveLength(challenge.testCases.length);
    expect(result.cases.every((c) => c.passed)).toBe(true);
  });
});
