import { challenges } from './challenges';
import type { Zone } from '../types/zone';

function challengesFor(...ids: string[]) {
  return ids.map((id) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) throw new Error(`Reto desconocido: ${id}`);
    return challenge;
  });
}

/**
 * Orden de progresión: variables -> condicionales -> bucles -> arrays ->
 * funciones -> recursión. Sigue la curva pedagógica clásica y coincide con
 * la dificultad creciente de los retos (1,1 -> 1 -> 2,2 -> 1,2,2 -> 2,3 -> 3).
 */
export const zones: Zone[] = [
  {
    id: 'aldea',
    name: 'Aldea de las Variables',
    icon: '🏘️',
    color: '#00bcd4',
    description: 'Donde todo aventurero aprende a nombrar y recordar el mundo',
    concept: 'variables',
    challenges: challengesFor('mercader-embrujado', 'duende-trastocado'),
  },
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
    id: 'mercado',
    name: 'Mercado de las Listas',
    icon: '🧺',
    color: '#4caf50',
    description: 'Cada tesoro es un elemento más en una lista por domar',
    concept: 'arrays',
    challenges: challengesFor('trol-tasador', 'golem-contable', 'espejo-distorsionado'),
  },
  {
    id: 'gremio',
    name: 'Gremio de las Funciones',
    icon: '⚙️',
    color: '#3f51b5',
    description: 'Aquí los hechizos se empaquetan para reutilizarse mil veces',
    concept: 'functions',
    challenges: challengesFor('aprendiz-distraido', 'espiritu-combinador'),
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
