import { challenges } from './challenges';
import type { Zone } from '../types/zone';

function challengesFor(...ids: string[]) {
  return ids.map((id) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) throw new Error(`Reto desconocido: ${id}`);
    return challenge;
  });
}

export const zones: Zone[] = [
  {
    id: 'logica',
    name: 'Bosque de la Lógica',
    icon: '🧩',
    color: '#9c27b0',
    description: 'Enemigos que solo caen ante decisiones correctas',
    concept: 'conditionals',
    challenges: challengesFor('golem-de-piedra'),
  },
  {
    id: 'bucles',
    name: 'Pantano de los Bucles',
    icon: '🌀',
    color: '#ff9800',
    description: 'Hordas que solo se vencen repitiendo la acción correcta',
    concept: 'loops',
    challenges: challengesFor('enjambre-de-slimes', 'guardianes-heridos'),
  },
  {
    id: 'recursion',
    name: 'Torre de la Recursión',
    icon: '🐉',
    color: '#f44336',
    description: 'El desafío final: vencerte a ti mismo, una y otra vez',
    concept: 'recursion',
    challenges: challengesFor('dragon-fractal'),
  },
];
