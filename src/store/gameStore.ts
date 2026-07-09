import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zones } from '../data/zones';
import { getLootItem } from '../utils/loot';
import type { Screen, Zone, Mission } from '../types/zone';

const XP_PER_LEVEL = 100;
const XP_PER_CORRECT_ANSWER = 30;
const GOLD_PER_CORRECT_ANSWER = 10;

interface PlayerState {
  level: number;
  xp: number;
  gold: number;
  inventory: string[];
}

interface MissionSessionState {
  currentZoneId: string | null;
  missionIndex: number;
  answered: boolean;
  selectedAnswer: number | null;
}

interface ResultsSessionState {
  sessionCorrect: number;
  sessionXP: number;
}

interface GameState {
  screen: Screen;
  player: PlayerState;
  mission: MissionSessionState;
  session: ResultsSessionState;
  goToScreen: (screen: Screen) => void;
  startZone: (zoneId: string) => void;
  submitAnswer: (choiceIndex: number) => void;
  nextMission: () => void;
  goToWorld: () => void;
}

const initialPlayer: PlayerState = { level: 1, xp: 0, gold: 0, inventory: [] };
const initialMission: MissionSessionState = {
  currentZoneId: null,
  missionIndex: 0,
  answered: false,
  selectedAnswer: null,
};
const initialSession: ResultsSessionState = { sessionCorrect: 0, sessionXP: 0 };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      player: initialPlayer,
      mission: initialMission,
      session: initialSession,

      goToScreen: (screen) => set({ screen }),

      startZone: (zoneId) =>
        set({
          screen: 'challenge',
          mission: { currentZoneId: zoneId, missionIndex: 0, answered: false, selectedAnswer: null },
          session: { sessionCorrect: 0, sessionXP: 0 },
        }),

      submitAnswer: (choiceIndex) => {
        const { mission, player, session } = get();
        if (mission.answered) return;

        const zone = zones.find((z) => z.id === mission.currentZoneId);
        if (!zone) return;
        const currentMission = zone.missions[mission.missionIndex];
        const isCorrect = choiceIndex === currentMission.correct;

        set({ mission: { ...mission, answered: true, selectedAnswer: choiceIndex } });
        if (!isCorrect) return;

        let newXp = player.xp + XP_PER_CORRECT_ANSWER;
        let newLevel = player.level;
        if (newXp >= player.level * XP_PER_LEVEL) {
          newXp -= player.level * XP_PER_LEVEL;
          newLevel += 1;
        }

        set({
          player: { ...player, level: newLevel, xp: newXp, gold: player.gold + GOLD_PER_CORRECT_ANSWER },
          session: {
            sessionCorrect: session.sessionCorrect + 1,
            sessionXP: session.sessionXP + XP_PER_CORRECT_ANSWER,
          },
        });
      },

      nextMission: () => {
        const { mission, player } = get();
        const zone = zones.find((z) => z.id === mission.currentZoneId);
        if (!zone) return;

        const nextIndex = mission.missionIndex + 1;
        if (nextIndex < zone.missions.length) {
          set({ mission: { ...mission, missionIndex: nextIndex, answered: false, selectedAnswer: null } });
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

      goToWorld: () =>
        set((state) => ({
          screen: 'world',
          mission: { ...state.mission, answered: false, selectedAnswer: null },
        })),
    }),
    {
      name: 'codequest-player-progress',
      partialize: (state) => ({ player: state.player }),
    }
  )
);

export function useCurrentZone(): Zone | null {
  return useGameStore((state) => zones.find((z) => z.id === state.mission.currentZoneId) ?? null);
}

export function useCurrentMission(): Mission | null {
  return useGameStore((state) => {
    const zone = zones.find((z) => z.id === state.mission.currentZoneId);
    return zone ? zone.missions[state.mission.missionIndex] : null;
  });
}
