import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zones } from '../data/zones';
import { getLootItem } from '../utils/loot';
import type { Screen, Zone } from '../types/zone';
import type { CodeChallenge, ChallengeResult } from '../types/challenge';

const XP_PER_LEVEL = 100;

interface PlayerState {
  level: number;
  xp: number;
  gold: number;
  inventory: string[];
}

interface ChallengeSessionState {
  currentZoneId: string | null;
  challengeIndex: number;
}

interface ResultsSessionState {
  sessionCorrect: number;
  sessionXP: number;
  /**
   * Intentos que NO resultaron en "pass" (fail/error/timeout) sobre el reto
   * actual, acumulados desde que se empezó ese reto. Se resetea al pasar al
   * siguiente reto o al empezar zona. Sirve de base para el bonus "flawless"
   * de la Fase 3 (aún no se calcula ningún bonus con este contador).
   */
  challengeAttempts: number;
}

interface GameState {
  screen: Screen;
  player: PlayerState;
  challenge: ChallengeSessionState;
  session: ResultsSessionState;
  goToScreen: (screen: Screen) => void;
  startZone: (zoneId: string) => void;
  /** Aplica de forma síncrona el resultado (ya resuelto) de ejecutar un reto. */
  applyChallengeResult: (result: ChallengeResult) => void;
  nextChallenge: () => void;
  goToWorld: () => void;
}

const initialPlayer: PlayerState = { level: 1, xp: 0, gold: 0, inventory: [] };
const initialChallenge: ChallengeSessionState = { currentZoneId: null, challengeIndex: 0 };
const initialSession: ResultsSessionState = { sessionCorrect: 0, sessionXP: 0, challengeAttempts: 0 };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      player: initialPlayer,
      challenge: initialChallenge,
      session: initialSession,

      goToScreen: (screen) => set({ screen }),

      startZone: (zoneId) =>
        set({
          screen: 'challenge',
          challenge: { currentZoneId: zoneId, challengeIndex: 0 },
          session: { sessionCorrect: 0, sessionXP: 0, challengeAttempts: 0 },
        }),

      applyChallengeResult: (result) => {
        const { challenge, player, session } = get();
        const zone = zones.find((z) => z.id === challenge.currentZoneId);
        const currentChallenge = zone?.challenges[challenge.challengeIndex];
        if (!zone || !currentChallenge) return;

        if (result.outcome !== 'pass') {
          set({ session: { ...session, challengeAttempts: session.challengeAttempts + 1 } });
          return;
        }

        let newXp = player.xp + currentChallenge.rewardXp;
        let newLevel = player.level;
        if (newXp >= player.level * XP_PER_LEVEL) {
          newXp -= player.level * XP_PER_LEVEL;
          newLevel += 1;
        }

        set({
          player: {
            ...player,
            level: newLevel,
            xp: newXp,
            gold: player.gold + currentChallenge.rewardGold,
          },
          session: {
            ...session,
            sessionCorrect: session.sessionCorrect + 1,
            sessionXP: session.sessionXP + currentChallenge.rewardXp,
          },
        });
      },

      nextChallenge: () => {
        const { challenge, player } = get();
        const zone = zones.find((z) => z.id === challenge.currentZoneId);
        if (!zone) return;

        const nextIndex = challenge.challengeIndex + 1;
        if (nextIndex < zone.challenges.length) {
          set({
            challenge: { ...challenge, challengeIndex: nextIndex },
            session: { ...get().session, challengeAttempts: 0 },
          });
          return;
        }

        const lootItem = getLootItem(zone);
        set({
          screen: 'results',
          player: {
            ...player,
            inventory: player.inventory.includes(lootItem)
              ? player.inventory
              : [...player.inventory, lootItem],
          },
        });
      },

      goToWorld: () => set({ screen: 'world' }),
    }),
    {
      name: 'codequest-player-progress',
      partialize: (state) => ({ player: state.player }),
    }
  )
);

export function useCurrentZone(): Zone | null {
  return useGameStore((state) => zones.find((z) => z.id === state.challenge.currentZoneId) ?? null);
}

export function useCurrentChallenge(): CodeChallenge | null {
  return useGameStore((state) => {
    const zone = zones.find((z) => z.id === state.challenge.currentZoneId);
    return zone ? zone.challenges[state.challenge.challengeIndex] ?? null : null;
  });
}
