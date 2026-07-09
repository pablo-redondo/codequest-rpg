import type { CodeChallenge } from '../types/challenge';

/**
 * Retos de código del core loop (Fase 2). Cada reto es un "enemigo": vencerlo
 * es hacer pasar todos sus casos de prueba. Dificultad creciente y conceptos
 * distintos para validar que el formato aguanta variedad.
 *
 * NOTA: aquí NO se guardan soluciones. Las soluciones de referencia viven en
 * los tests, para no enviar las respuestas al cliente.
 */
export const challenges: CodeChallenge[] = [
  {
    id: 'golem-de-piedra',
    concept: 'conditionals',
    difficulty: 1,
    enemy: { name: 'Golem de Piedra', icon: '🗿' },
    prompt:
      'El Golem tiene armadura. Calcula el daño que recibe: ataque menos defensa, ' +
      'pero el daño NUNCA puede ser negativo (mínimo 0).',
    conceptExplanation:
      'Condicionales y operadores: usa Math.max(0, ...) o un if para evitar valores negativos.',
    functionName: 'calcularDaño',
    starterCode: `function calcularDaño(ataque, defensa) {
  // El daño nunca puede ser negativo.
  return /* completa aquí */;
}`,
    testCases: [
      { args: [50, 30], expected: 20, description: 'el ataque supera la armadura' },
      { args: [10, 25], expected: 0, description: 'la armadura absorbe todo' },
      { args: [100, 100], expected: 0, description: 'empate' },
      { args: [30, 0], expected: 30, description: 'sin defensa', hidden: true },
    ],
    hints: ['¿Qué pasa si ataque es menor que defensa?', 'Math.max(0, x) nunca devuelve negativos.'],
    rewardXp: 40,
    rewardGold: 15,
  },
  {
    id: 'enjambre-de-slimes',
    concept: 'loops',
    difficulty: 2,
    enemy: { name: 'Enjambre de Slimes', icon: '🟢' },
    prompt:
      'Cada slime suelta oro al morir. Recibes un array con el oro de cada uno; ' +
      'devuelve la suma total del botín.',
    conceptExplanation:
      'Bucles: recorre el array con for / for..of (o usa reduce) y acumula los valores.',
    functionName: 'sumarBotin',
    starterCode: `function sumarBotin(monedas) {
  let total = 0;
  // recorre el array y acumula cada valor en total
  return total;
}`,
    testCases: [
      { args: [[10, 20, 30]], expected: 60, description: 'enjambre normal' },
      { args: [[]], expected: 0, description: 'enjambre vacío' },
      { args: [[5]], expected: 5, description: 'un solo slime' },
      { args: [[1, 1, 1, 1, 1]], expected: 5, description: 'enjambre grande', hidden: true },
    ],
    hints: ['Empieza el total en 0.', 'Suma cada elemento del array al total dentro del bucle.'],
    rewardXp: 60,
    rewardGold: 25,
  },
  {
    id: 'guardianes-heridos',
    concept: 'loops',
    difficulty: 2,
    enemy: { name: 'Guardianes Heridos', icon: '🛡️' },
    prompt:
      'Recibes un array de héroes, cada uno con una propiedad "vida". Cuenta ' +
      'cuántos siguen con vida (vida > 0).',
    conceptExplanation:
      'Combina bucle + condicional + acceso a propiedades de objetos (heroe.vida).',
    functionName: 'contarVivos',
    starterCode: `function contarVivos(heroes) {
  let vivos = 0;
  // recorre los héroes y cuenta los que tienen vida > 0
  return vivos;
}`,
    testCases: [
      {
        args: [[{ vida: 10 }, { vida: 0 }, { vida: 5 }]],
        expected: 2,
        description: 'mezcla de vivos y caídos',
      },
      { args: [[]], expected: 0, description: 'no hay héroes' },
      { args: [[{ vida: 0 }, { vida: 0 }]], expected: 0, description: 'todos caídos' },
      { args: [[{ vida: 1 }]], expected: 1, description: 'uno vivo', hidden: true },
    ],
    hints: ['Accede a la vida con heroe.vida.', 'Incrementa el contador solo si vida > 0.'],
    rewardXp: 60,
    rewardGold: 25,
  },
  {
    id: 'dragon-fractal',
    concept: 'recursion',
    difficulty: 3,
    enemy: { name: 'Dragón Fractal', icon: '🐉' },
    prompt:
      'El dragón se multiplica sobre sí mismo. Calcula el factorial de n (n!) ' +
      'de forma recursiva. factorial(0) = 1.',
    conceptExplanation:
      'Recursión: define el caso base (n === 0 → 1) y el caso recursivo (n * factorial(n - 1)).',
    functionName: 'factorial',
    starterCode: `function factorial(n) {
  // caso base: factorial(0) = 1
  // caso recursivo: n * factorial(n - 1)
}`,
    testCases: [
      { args: [0], expected: 1, description: 'caso base' },
      { args: [1], expected: 1, description: 'caso base + 1' },
      { args: [5], expected: 120, description: 'recursión completa' },
      { args: [3], expected: 6, description: 'comprobación', hidden: true },
    ],
    hints: ['Sin caso base, la recursión no termina.', 'factorial(5) = 5 * factorial(4).'],
    rewardXp: 90,
    rewardGold: 40,
  },
];
