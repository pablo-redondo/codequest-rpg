import type { Concept } from '../types/challenge';
import type { Spell } from '../types/spell';

/** Metadatos de presentación por concepto (barras de maestría, Grimorio...). */
export const CONCEPT_META: Record<Concept, { label: string; icon: string }> = {
  variables: { label: 'Variables', icon: '📦' },
  conditionals: { label: 'Condicionales', icon: '🧩' },
  loops: { label: 'Bucles', icon: '🌀' },
  arrays: { label: 'Arrays', icon: '🖐️' },
  functions: { label: 'Funciones', icon: '⚙️' },
  recursion: { label: 'Recursión', icon: '🐉' },
};

/**
 * Catálogo de hechizos. Cada uno se desbloquea al alcanzar `threshold` retos
 * vencidos del `concept` indicado (skills.masteryByConcept) y tiene un efecto
 * mecánico real, conectado en ChallengeScreen — no son botones decorativos.
 */
export const spells: Spell[] = [
  {
    id: 'vision-logica',
    name: 'Visión Lógica',
    icon: '🔍',
    description:
      'Ejecuta tu código en modo diagnóstico y resalta el primer caso que falla ' +
      '(esperado vs. obtenido), sin gastar un intento.',
    concept: 'conditionals',
    threshold: 3,
    effect: 'reveal-first-failure',
  },
  {
    id: 'bucle-temporal',
    name: 'Bucle Temporal',
    icon: '⏳',
    description: 'Extiende un 50% el tiempo límite de ejecución del reto actual.',
    concept: 'loops',
    threshold: 3,
    effect: 'extend-timeout',
  },
  {
    id: 'mano-recolector',
    name: 'Mano del Recolector',
    icon: '🖐️',
    description: 'Revela uno de los casos de prueba ocultos del reto como pista.',
    concept: 'arrays',
    threshold: 2,
    effect: 'reveal-hidden-case',
  },
  {
    id: 'eco-recursivo',
    name: 'Eco Recursivo',
    icon: '🌀',
    description: 'Muestra el esqueleto del caso base como pista.',
    concept: 'recursion',
    threshold: 2,
    effect: 'reveal-base-case-hint',
  },
];
