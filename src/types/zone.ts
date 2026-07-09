import type { CodeChallenge, Concept } from './challenge';

export interface Zone {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  concept: Concept;
  challenges: CodeChallenge[];
}

export type Screen = 'title' | 'world' | 'challenge' | 'results';
