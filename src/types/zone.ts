export interface Mission {
  npc: string;
  story: string;
  concept: string;
  code: string;
  question: string;
  choices: string[];
  correct: number;
  explanation: string;
}

export interface Zone {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  missions: Mission[];
}

export type Screen = 'title' | 'world' | 'challenge' | 'results';
