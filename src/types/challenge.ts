export type Concept =
  | 'variables'
  | 'conditionals'
  | 'loops'
  | 'arrays'
  | 'functions'
  | 'recursion';

export interface TestCase {
  /** Argumentos que se pasan a la función del jugador. */
  args: unknown[];
  /** Salida esperada (se compara por igualdad profunda). */
  expected: unknown;
  /** Texto opcional para el jugador ("sin enemigos", "empate"...). */
  description?: string;
  /** Caso oculto: no se muestra hasta vencer, evita hardcodear la salida. */
  hidden?: boolean;
}

export interface CodeChallenge {
  id: string;
  concept: Concept;
  difficulty: 1 | 2 | 3;
  /** Piel RPG del reto. */
  enemy: { name: string; icon: string };
  /** Enunciado que ve el jugador. */
  prompt: string;
  /** Qué concepto enseña (para el panel didáctico). */
  conceptExplanation: string;
  /** Nombre EXACTO de la función que el ejecutor invocará. */
  functionName: string;
  /** Código inicial con el hueco a completar. */
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
  rewardXp: number;
  rewardGold: number;
}

/** Resultado de un caso de prueba concreto. */
export interface CaseResult {
  description?: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  /** true si el código lanzó una excepción al ejecutar este caso. */
  errored: boolean;
}

/** Lo que devuelve la ejecución pura (sandbox), sin dimensión de tiempo. */
export interface SandboxResult {
  outcome: 'pass' | 'fail' | 'error';
  cases: CaseResult[];
  errorMessage?: string;
}

/** Petición que el hilo principal envía al Web Worker. */
export interface SandboxRequest {
  code: string;
  functionName: string;
  testCases: TestCase[];
}

export type ChallengeOutcome = 'pass' | 'fail' | 'error' | 'timeout';

/** Resultado final que consume la UI / la progresión. */
export interface ChallengeResult {
  outcome: ChallengeOutcome;
  cases: CaseResult[];
  errorMessage?: string;
  durationMs: number;
}
