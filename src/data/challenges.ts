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

  // --- Aldea de las Variables (concept: variables) ---
  {
    id: 'mercader-embrujado',
    concept: 'variables',
    difficulty: 1,
    enemy: { name: 'Mercader Embrujado', icon: '👻' },
    prompt:
      'El mercader sube el precio dos veces, en este orden: primero añade un recargo fijo, ' +
      'luego aplica un descuento porcentual sobre el resultado. Devuelve el precio final.',
    conceptExplanation:
      'Variables y reasignación: guarda el precio en una variable con let y actualízala paso a ' +
      'paso con cada operación, en el mismo orden que ocurren.',
    functionName: 'calcularPrecioFinal',
    starterCode: `function calcularPrecioFinal(precioBase, recargo, descuentoPorcentaje) {
  let precio = precioBase + recargo;
  // ahora aplica el descuento porcentual sobre "precio"
  return precio;
}`,
    testCases: [
      { args: [100, 10, 10], expected: 99, description: 'recargo y luego descuento' },
      { args: [50, 0, 50], expected: 25, description: 'sin recargo' },
      { args: [200, 50, 0], expected: 250, description: 'sin descuento' },
      { args: [0, 0, 0], expected: 0, description: 'todo en cero', hidden: true },
    ],
    hints: [
      'precio = precio - (precio * descuentoPorcentaje / 100).',
      'El orden importa: primero el recargo, después el descuento sobre el nuevo precio.',
    ],
    rewardXp: 40,
    rewardGold: 15,
  },
  {
    id: 'duende-trastocado',
    concept: 'variables',
    difficulty: 1,
    enemy: { name: 'Duende Trastocado', icon: '🧌' },
    prompt:
      'El duende ha mezclado los atributos del héroe. Intercambia (swap) los valores de fuerza ' +
      'y agilidad usando una variable temporal, y devuelve [fuerza, agilidad] ya intercambiados.',
    conceptExplanation:
      'Variables: para intercambiar dos valores sin perder ninguno, guarda uno de ellos en una ' +
      'variable temporal antes de sobrescribirlo.',
    functionName: 'intercambiarAtributos',
    starterCode: `function intercambiarAtributos(fuerza, agilidad) {
  const temp = fuerza;
  // usa "temp" para completar el intercambio
  return [fuerza, agilidad];
}`,
    testCases: [
      { args: [10, 5], expected: [5, 10], description: 'valores distintos' },
      { args: [0, 100], expected: [100, 0], description: 'uno en cero' },
      { args: [7, 7], expected: [7, 7], description: 'valores iguales' },
      { args: [3, 9], expected: [9, 3], description: 'comprobación', hidden: true },
    ],
    hints: ['temp guarda el valor original de fuerza antes de sobrescribirla.', 'fuerza = agilidad; agilidad = temp;'],
    rewardXp: 40,
    rewardGold: 15,
  },

  // --- Mercado de las Listas (concept: arrays) ---
  {
    id: 'trol-tasador',
    concept: 'arrays',
    difficulty: 1,
    enemy: { name: 'Trol Tasador', icon: '🧌' },
    prompt: 'Recibes un array de tesoros (números). Devuelve el valor del tesoro más grande.',
    conceptExplanation:
      'Arrays: recorre la lista comparando cada elemento contra el mayor visto hasta el momento.',
    functionName: 'encontrarMayorTesoro',
    starterCode: `function encontrarMayorTesoro(tesoros) {
  let mayor = tesoros[0];
  // recorre el array y actualiza "mayor" si encuentras uno más grande
  return mayor;
}`,
    testCases: [
      { args: [[10, 50, 20]], expected: 50, description: 'tesoros variados' },
      { args: [[5]], expected: 5, description: 'un solo tesoro' },
      { args: [[100, 100, 1]], expected: 100, description: 'empate en el máximo' },
      { args: [[3, 9, 2, 9, 1]], expected: 9, description: 'comprobación', hidden: true },
    ],
    hints: ['Compara cada elemento con "mayor" dentro del bucle.', 'if (t > mayor) mayor = t;'],
    rewardXp: 40,
    rewardGold: 15,
  },
  {
    id: 'golem-contable',
    concept: 'arrays',
    difficulty: 2,
    enemy: { name: 'Golem Contable', icon: '🧮' },
    prompt:
      'Recibes el valor de varios objetos y un umbral. Cuenta cuántos objetos valen ' +
      'MÁS que el umbral (estrictamente mayor).',
    conceptExplanation:
      'Arrays + condicionales: recorre la lista y suma 1 al contador solo cuando el elemento ' +
      'supera el umbral.',
    functionName: 'contarObjetosValiosos',
    starterCode: `function contarObjetosValiosos(objetos, umbral) {
  let total = 0;
  // recorre "objetos" y cuenta los que son mayores que "umbral"
  return total;
}`,
    testCases: [
      { args: [[10, 60, 30, 90], 50], expected: 2, description: 'algunos superan el umbral' },
      { args: [[1, 2, 3], 10], expected: 0, description: 'ninguno lo supera' },
      { args: [[100], 50], expected: 1, description: 'un solo objeto' },
      { args: [[5, 5, 5, 5], 4], expected: 4, description: 'todos lo superan', hidden: true },
    ],
    hints: ['El umbral es estricto: igual no cuenta, solo mayor.', 'if (o > umbral) total++;'],
    rewardXp: 60,
    rewardGold: 25,
  },
  {
    id: 'espejo-distorsionado',
    concept: 'arrays',
    difficulty: 2,
    enemy: { name: 'Espejo Distorsionado', icon: '🪞' },
    prompt:
      'El espejo invierte todo lo que refleja. Devuelve un NUEVO array con los elementos en ' +
      'orden inverso, sin modificar el array original.',
    conceptExplanation:
      'Arrays: crea una copia (por ejemplo con el operador spread) antes de reordenarla, para no ' +
      'mutar el array que recibiste.',
    functionName: 'invertirPergamino',
    starterCode: `function invertirPergamino(letras) {
  // devuelve una copia de "letras" en orden inverso
  return letras;
}`,
    testCases: [
      { args: [['a', 'b', 'c']], expected: ['c', 'b', 'a'], description: 'tres símbolos' },
      { args: [[1]], expected: [1], description: 'un solo símbolo' },
      { args: [[]], expected: [], description: 'pergamino vacío' },
      { args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1], description: 'comprobación', hidden: true },
    ],
    hints: ['[...letras] crea una copia sin modificar el original.', 'Los arrays tienen un método .reverse().'],
    rewardXp: 60,
    rewardGold: 25,
  },

  // --- Gremio de las Funciones (concept: functions) ---
  {
    id: 'aprendiz-distraido',
    concept: 'functions',
    difficulty: 2,
    enemy: { name: 'Aprendiz Distraído', icon: '🧙‍♂️' },
    prompt:
      'Invoca un hechizo con un nombre y un poder (que por defecto es 10 si no se indica). ' +
      'Si el nombre está vacío, el hechizo falla y no se invoca ningún poder.',
    conceptExplanation:
      'Funciones: parámetros por defecto (poder = 10) y retorno anticipado (early return) cuando ' +
      'falta un dato obligatorio.',
    functionName: 'invocarHechizo',
    starterCode: `function invocarHechizo(nombre, poder = 10) {
  // si no hay nombre, el hechizo falla: devuelve "Hechizo fallido: falta el nombre"
  return \`\${nombre} inflige \${poder} de daño\`;
}`,
    testCases: [
      { args: ['Bola de fuego'], expected: 'Bola de fuego inflige 10 de daño', description: 'poder por defecto' },
      { args: ['Rayo', 25], expected: 'Rayo inflige 25 de daño', description: 'poder explícito' },
      { args: [''], expected: 'Hechizo fallido: falta el nombre', description: 'sin nombre' },
      { args: ['Escudo', 0], expected: 'Escudo inflige 0 de daño', description: 'comprobación', hidden: true },
    ],
    hints: ['if (!nombre) return "Hechizo fallido: falta el nombre";', 'Los parámetros por defecto solo aplican si el argumento es undefined.'],
    rewardXp: 60,
    rewardGold: 25,
  },
  {
    id: 'espiritu-combinador',
    concept: 'functions',
    difficulty: 3,
    enemy: { name: 'Espíritu Combinador', icon: '🌟' },
    prompt:
      'Recibes un valor base y una habilidad (una función). Aplica la habilidad sobre el valor ' +
      'base y devuelve el resultado.',
    conceptExplanation:
      'Funciones de primera clase: en JavaScript las funciones se pueden recibir como parámetros ' +
      'y llamarse desde dentro de otra función.',
    functionName: 'aplicarHabilidad',
    starterCode: `function aplicarHabilidad(base, habilidad) {
  // llama a "habilidad" pasándole "base" y devuelve el resultado
  return null;
}`,
    testCases: [
      { args: [10, (x: number) => x * 2], expected: 20, description: 'duplicar' },
      { args: [5, (x: number) => x + 100], expected: 105, description: 'sumar' },
      { args: [0, (x: number) => x - 1], expected: -1, description: 'restar' },
      { args: [7, (x: number) => x * x], expected: 49, description: 'comprobación', hidden: true },
    ],
    hints: ['"habilidad" ya es una función: solo tienes que invocarla.', 'return habilidad(base);'],
    rewardXp: 90,
    rewardGold: 40,
  },
];
