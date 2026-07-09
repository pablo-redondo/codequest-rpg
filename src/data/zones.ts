import type { Zone } from '../types/zone';

export const zones: Zone[] = [
  {
    id: 'variables',
    name: 'Zona de Variables',
    icon: '📦',
    color: '#00bcd4',
    description: 'Aprende a almacenar y manipular datos',
    missions: [
      {
        npc: '🧙 Maestro Sintax',
        story: 'Joven aventurero, las variables son los contenedores mágicos donde guardamos información. Sin ellas, ningún programa podría recordar nada.',
        concept: 'Las variables se declaran con let (reasignable) o const (constante). Cada una tiene un nombre y un valor.',
        code: `let nombre = "Héroe";
const nivel = 1;
let xp = 0;

xp = xp + 50;
console.log(nombre + " alcanzó " + xp + " XP");`,
        question: '¿Qué valor tiene xp después de ejecutar el código?',
        choices: ['0', '50', '100', 'undefined'],
        correct: 1,
        explanation: 'xp empieza en 0 y luego se le suma 50, por lo que el valor final es 50.',
      },
      {
        npc: '🔮 Oráculo Typo',
        story: 'Los tipos de datos son la esencia de toda variable. ¡Conocerlos te dará poder sobre cualquier dato del reino!',
        concept: 'JavaScript tiene tipos primitivos: string (texto), number (número), boolean (true/false), null y undefined.',
        code: `let texto = "Hola";
let numero = 42;
let activo = true;
let vacio = null;

console.log(typeof texto);    // "string"
console.log(typeof numero);   // "number"
console.log(typeof activo);   // "boolean"`,
        question: '¿Qué devuelve typeof "CodeQuest"?',
        choices: ['"text"', '"string"', '"word"', '"char"'],
        correct: 1,
        explanation: 'typeof devuelve "string" para cualquier cadena de texto en JavaScript.',
      },
      {
        npc: '⚗️ Alquimista Scope',
        story: 'Hay diferencias cruciales entre var, let y const. Usar la incorrecta puede invocar bugs oscuros en tu código.',
        concept: 'const no puede reasignarse. let tiene scope de bloque. var tiene scope de función y puede causar problemas inesperados.',
        code: `const MAX_LEVEL = 99;
let jugador = "Pablo";

// Esto funciona:
jugador = "Héroe Pablo";

// Esto lanzaría un error:
// MAX_LEVEL = 100;

console.log(jugador);`,
        question: '¿Qué pasa si intentas reasignar una variable declarada con const?',
        choices: ['El valor cambia normalmente', 'Se ignora el cambio', 'Lanza un TypeError', 'Devuelve undefined'],
        correct: 2,
        explanation: 'Reasignar una const lanza TypeError: Assignment to constant variable.',
      },
    ],
  },
  {
    id: 'condicionales',
    name: 'Zona de Condicionales',
    icon: '🔀',
    color: '#9c27b0',
    description: 'Toma decisiones en tu código',
    missions: [
      {
        npc: '⚖️ Juez Lógicus',
        story: 'Las condicionales son los encrucijadas del código. Dependiendo del estado del mundo, el programa tomará caminos diferentes.',
        concept: 'if/else evalúa una condición booleana. Si es true ejecuta el primer bloque, si es false ejecuta el else.',
        code: `let vida = 30;
let escudo = true;

if (vida > 50) {
  console.log("¡Estás en buena forma!");
} else if (escudo) {
  console.log("Vida baja, pero el escudo te protege.");
} else {
  console.log("¡Peligro! Busca una poción.");
}`,
        question: '¿Qué mensaje se imprime con vida=30 y escudo=true?',
        choices: [
          '¡Estás en buena forma!',
          'Vida baja, pero el escudo te protege.',
          '¡Peligro! Busca una poción.',
          'No se imprime nada',
        ],
        correct: 1,
        explanation: 'vida no es mayor que 50, pero escudo es true, así que entra en el else if.',
      },
      {
        npc: '🃏 Mago Ternario',
        story: 'El operador ternario es como un hechizo rápido: una condición compacta en una sola línea para los guerreros del código eficiente.',
        concept: 'Sintaxis: condición ? valorSiTrue : valorSiFalse. Ideal para asignaciones simples.',
        code: `let nivel = 15;
let rango = nivel >= 10 ? "Veterano" : "Novato";

let mensaje = nivel === 1
  ? "¡Bienvenido!"
  : nivel < 10
    ? "Sigue entrenando"
    : "¡Eres un maestro!";

console.log(rango);    // "Veterano"
console.log(mensaje);  // "¡Eres un maestro!"`,
        question: '¿Qué valor tiene rango si nivel es 5?',
        choices: ['"Maestro"', '"Veterano"', '"Novato"', '"Experto"'],
        correct: 2,
        explanation: '5 >= 10 es false, así que el ternario devuelve "Novato".',
      },
      {
        npc: '🎭 Árbitro Switch',
        story: 'Cuando tienes muchos caminos posibles, switch es más elegante que una cadena de if-else. Los héroes sabios eligen la herramienta correcta.',
        concept: 'switch compara un valor con múltiples cases. break evita que continúe ejecutando los siguientes casos.',
        code: `let clase = "Mago";

switch (clase) {
  case "Guerrero":
    console.log("Equipa espada");
    break;
  case "Mago":
    console.log("Equipa báculo");
    break;
  case "Arquero":
    console.log("Equipa arco");
    break;
  default:
    console.log("Clase desconocida");
}`,
        question: '¿Qué pasa si olvidas poner break en un case de switch?',
        choices: [
          'El código lanza un error',
          'Se ejecutan los cases siguientes (fall-through)',
          'El switch se detiene automáticamente',
          'Solo se ejecuta el default',
        ],
        correct: 1,
        explanation: 'Sin break, JavaScript continúa ejecutando los casos siguientes hasta encontrar un break o el final del switch (fall-through).',
      },
    ],
  },
  {
    id: 'bucles',
    name: 'Zona de Bucles',
    icon: '🔄',
    color: '#ff9800',
    description: 'Repite acciones con elegancia',
    missions: [
      {
        npc: '🌀 Espiral el Infinito',
        story: 'Los bucles son el corazón de la automatización. ¿Para qué escribir 100 líneas si un bucle puede hacer el trabajo?',
        concept: 'El bucle for tiene tres partes: inicialización; condición; incremento. Se repite mientras la condición sea true.',
        code: `let totalXP = 0;

for (let mision = 1; mision <= 5; mision++) {
  totalXP += mision * 10;
  console.log("Misión " + mision + ": +" + (mision * 10) + " XP");
}

console.log("Total XP: " + totalXP);`,
        question: '¿Cuántas veces se ejecuta el cuerpo del bucle?',
        choices: ['4 veces', '5 veces', '6 veces', '10 veces'],
        correct: 1,
        explanation: 'mision va de 1 a 5 inclusive (mision <= 5), por lo tanto el bucle se ejecuta 5 veces.',
      },
      {
        npc: '📜 Pergamino While',
        story: 'El bucle while es para cuando no sabes cuántas repeticiones necesitas. Repite mientras la condición sea verdadera.',
        concept: 'while evalúa la condición antes de cada iteración. Si la condición es false desde el inicio, el cuerpo nunca se ejecuta.',
        code: `let vida = 100;
let turno = 0;

while (vida > 0) {
  let daño = Math.floor(Math.random() * 20) + 5;
  vida -= daño;
  turno++;
  console.log("Turno " + turno + ": -" + daño + " HP");
}

console.log("Batalla terminó en " + turno + " turnos");`,
        question: '¿Cuándo termina el bucle while del código?',
        choices: [
          'Después de exactamente 5 turnos',
          'Cuando vida llega a 0 o menos',
          'Cuando turno supera 10',
          'Nunca termina',
        ],
        correct: 1,
        explanation: 'La condición es vida > 0, el bucle termina cuando vida deja de ser mayor que 0.',
      },
      {
        npc: '🗺️ Explorador ForOf',
        story: 'Cuando tienes una colección de elementos, los métodos de arrays son tus mejores aliados. forEach y map transforman datos como magia.',
        concept: 'forEach ejecuta una función por cada elemento. map crea un nuevo array con los resultados transformados.',
        code: `const heroes = ["Arturo", "Merlin", "Lancelot"];

heroes.forEach((heroe, index) => {
  console.log((index + 1) + ". " + heroe);
});

const heroesConRango = heroes.map(heroe => heroe + " el Poderoso");
console.log(heroesConRango);`,
        question: '¿Qué devuelve map() a diferencia de forEach()?',
        choices: [
          'Un número con el total de elementos',
          'El primer elemento que cumple la condición',
          'Un nuevo array con los valores transformados',
          'Modifica el array original',
        ],
        correct: 2,
        explanation: 'map() crea y retorna un nuevo array con los resultados de aplicar la función a cada elemento. forEach() solo itera sin retornar nada.',
      },
    ],
  },
  {
    id: 'funciones',
    name: 'Zona de Funciones',
    icon: '⚙️',
    color: '#f44336',
    description: 'Crea bloques de código reutilizables',
    missions: [
      {
        npc: '🏭 Constructor Func',
        story: 'Las funciones son los hechizos del programador. Escríbelos una vez, úsalos mil veces. Son la base de todo código limpio.',
        concept: 'Una función agrupa código reutilizable. Recibe parámetros, ejecuta lógica y puede retornar un valor con return.',
        code: `function calcularDaño(ataque, defensa) {
  const daño = Math.max(0, ataque - defensa);
  return daño;
}

function describir(heroe, nivel) {
  return heroe + " (Nivel " + nivel + ")";
}

console.log(calcularDaño(50, 30));  // 20
console.log(calcularDaño(10, 25));  // 0
console.log(describir("Héroe", 7)); // "Héroe (Nivel 7)"`,
        question: '¿Qué devuelve calcularDaño(10, 25)?',
        choices: ['-15', '15', '0', '25'],
        correct: 2,
        explanation: 'Math.max(0, 10-25) = Math.max(0, -15) = 0. El daño nunca puede ser negativo.',
      },
      {
        npc: '🏹 Arquera Arrow',
        story: 'Las arrow functions son la escritura moderna y concisa. Los héroes modernos las prefieren para callbacks y funciones cortas.',
        concept: 'Arrow function: const fn = (params) => expresión. Si hay un solo parámetro, puedes omitir los paréntesis. Si retorna directamente, omite las llaves y return.',
        code: `const saludar = nombre => "¡Hola, " + nombre + "!";

const sumar = (a, b) => a + b;

const procesarHeroes = (heroes) => heroes
  .filter(h => h.nivel >= 5)
  .map(h => h.nombre.toUpperCase());

console.log(saludar("Pablo"));        // "¡Hola, Pablo!"
console.log(sumar(3, 7));             // 10`,
        question: '¿Cuál es la forma correcta de una arrow function que suma dos números?',
        choices: [
          'function (a, b) => a + b',
          '(a, b) -> a + b',
          '(a, b) => a + b',
          'arrow (a, b) { return a + b }',
        ],
        correct: 2,
        explanation: 'La sintaxis correcta de arrow function es (parámetros) => expresión o (parámetros) => { cuerpo }.',
      },
      {
        npc: '🌌 Archimago Closure',
        story: 'Los closures son la magia avanzada: funciones que recuerdan el entorno donde fueron creadas. ¡El conocimiento definitivo del código!',
        concept: 'Un closure es una función que tiene acceso a variables de su scope externo, incluso después de que esa función externa haya terminado.',
        code: `function crearContador(nombre) {
  let count = 0;

  return {
    incrementar: () => {
      count++;
      return count;
    },
    valor: () => count,
    reset: () => { count = 0; }
  };
}

const contador = crearContador("XP");
contador.incrementar();
contador.incrementar();
contador.incrementar();
console.log(contador.valor()); // 3`,
        question: '¿Qué imprime contador.valor() después de tres llamadas a incrementar()?',
        choices: ['0', '1', '3', 'undefined'],
        correct: 2,
        explanation: 'El closure mantiene la variable count en memoria. Tres llamadas a incrementar() la llevan a 3.',
      },
    ],
  },
];
