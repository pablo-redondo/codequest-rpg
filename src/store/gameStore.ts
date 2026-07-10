import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zones } from '../data/zones';
import { spells } from '../data/spells';
import { getLootItem } from '../utils/loot';
import type { Screen, Zone } from '../types/zone';
import type { ChallengeResult, CodeChallenge, Concept } from '../types/challenge';

const XP_PER_LEVEL = 100;
export const FLAWLESS_BONUS_XP = 20;

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
   * siguiente reto o al empezar zona. Si sigue en 0 cuando el reto se supera,
   * ese pass es "flawless" y recibe FLAWLESS_BONUS_XP.
   */
  challengeAttempts: number;
  /** true mientras ningún reto de esta corrida de zona haya fallado. */
  zoneFlawless: boolean;
}

interface SkillsState {
  masteryByConcept: Record<Concept, number>;
  unlockedSpells: string[];
}

interface SettingsState {
  soundEnabled: boolean;
  crtEnabled: boolean;
}

interface GameState {
  screen: Screen;
  player: PlayerState;
  challenge: ChallengeSessionState;
  session: ResultsSessionState;
  skills: SkillsState;
  settings: SettingsState;
  goToScreen: (screen: Screen) => void;
  startZone: (zoneId: string) => void;
  /**
   * Aplica de forma síncrona el resultado (ya resuelto) de ejecutar un reto:
   * recompensa, maestría, desbloqueo de hechizos y bonus flawless. Devuelve
   * info del pass para que la UI la muestre, o null si no fue un pass.
   */
  applyChallengeResult: (result: ChallengeResult) => { flawless: boolean; xpGained: number } | null;
  nextChallenge: () => void;
  goToWorld: () => void;
  toggleSound: () => void;
  toggleCrt: () => void;
}

const initialPlayer: PlayerState = { level: 1, xp: 0, gold: 0, inventory: [] };
const initialChallenge: ChallengeSessionState = { currentZoneId: null, challengeIndex: 0 };
const initialSession: ResultsSessionState = {
  sessionCorrect: 0,
  sessionXP: 0,
  challengeAttempts: 0,
  zoneFlawless: true,
};
const initialSkills: SkillsState = {
  masteryByConcept: {
    variables: 0,
    conditionals: 0,
    loops: 0,
    arrays: 0,
    functions: 0,
    recursion: 0,
  },
  unlockedSpells: [],
};
// El jugador activa sonido/CRT si quiere; no arrancan encendidos.
const initialSettings: SettingsState = { soundEnabled: false, crtEnabled: false };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      player: initialPlayer,
      challenge: initialChallenge,
      session: initialSession,
      skills: initialSkills,
      settings: initialSettings,

      goToScreen: (screen) => set({ screen }),

      startZone: (zoneId) =>
        set({
          screen: 'challenge',
          challenge: { currentZoneId: zoneId, challengeIndex: 0 },
          session: { sessionCorrect: 0, sessionXP: 0, challengeAttempts: 0, zoneFlawless: true },
        }),

      applyChallengeResult: (result) => {
        const { challenge, player, session, skills } = get();
        const zone = zones.find((z) => z.id === challenge.currentZoneId);
        const currentChallenge = zone?.challenges[challenge.challengeIndex];
        if (!zone || !currentChallenge) return null;

        if (result.outcome !== 'pass') {
          set({
            session: {
              ...session,
              challengeAttempts: session.challengeAttempts + 1,
              zoneFlawless: false,
            },
          });
          return null;
        }

        const flawless = session.challengeAttempts === 0;
        const xpGained = currentChallenge.rewardXp + (flawless ? FLAWLESS_BONUS_XP : 0);

        let newXp = player.xp + xpGained;
        let newLevel = player.level;
        if (newXp >= player.level * XP_PER_LEVEL) {
          newXp -= player.level * XP_PER_LEVEL;
          newLevel += 1;
        }

        const concept = currentChallenge.concept;
        const newMastery = {
          ...skills.masteryByConcept,
          [concept]: skills.masteryByConcept[concept] + 1,
        };
        const newlyUnlocked = spells
          .filter((spell) => !skills.unlockedSpells.includes(spell.id))
          .filter((spell) => newMastery[spell.concept] >= spell.threshold)
          .map((spell) => spell.id);

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
            sessionXP: session.sessionXP + xpGained,
          },
          skills: {
            masteryByConcept: newMastery,
            unlockedSpells: [...skills.unlockedSpells, ...newlyUnlocked],
          },
        });

        return { flawless, xpGained };
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

      toggleSound: () =>
        set((state) => ({ settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled } })),

      toggleCrt: () =>
        set((state) => ({ settings: { ...state.settings, crtEnabled: !state.settings.crtEnabled } })),
    }),
    {
      name: 'codequest-player-progress',
      partialize: (state) => ({ player: state.player, skills: state.skills, settings: state.settings }),
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
