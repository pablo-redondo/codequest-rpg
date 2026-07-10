import type { Concept } from './challenge';

/** Efecto mecánico real que produce el hechizo al lanzarse en un reto. */
export type SpellEffect =
  | 'reveal-first-failure'
  | 'extend-timeout'
  | 'reveal-hidden-case'
  | 'reveal-base-case-hint';

export interface Spell {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Concepto cuya maestría desbloquea este hechizo. */
  concept: Concept;
  /** Nivel de maestría en ese concepto necesario para desbloquearlo. */
  threshold: number;
  effect: SpellEffect;
}
