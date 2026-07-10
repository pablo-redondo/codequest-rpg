import { beforeEach, describe, expect, it } from 'vitest';
import { FLAWLESS_BONUS_XP, useGameStore } from './gameStore';
import { zones } from '../data/zones';
import type { ChallengeResult } from '../types/challenge';

const logicaZone = zones.find((z) => z.id === 'logica')!; // 3 retos (conditionals)
const buclesZone = zones.find((z) => z.id === 'bucles')!; // 3 retos (loops)
const recursionZone = zones.find((z) => z.id === 'recursion')!; // 2 retos (recursion)
const mercadoZone = zones.find((z) => z.id === 'mercado')!; // 3 retos (arrays)

/** Vence, en orden, todos los retos de una zona sin repetir ninguno. */
function clearZone(zoneId: string) {
  useGameStore.getState().startZone(zoneId);
  const zone = zones.find((z) => z.id === zoneId)!;
  zone.challenges.forEach((_, index) => {
    useGameStore.getState().applyChallengeResult(passResult());
    useGameStore.getState().nextChallenge();
    if (index < zone.challenges.length - 1) {
      expect(useGameStore.getState().challenge.challengeIndex).toBe(index + 1);
    }
  });
}

const emptyMastery = {
  variables: 0,
  conditionals: 0,
  loops: 0,
  arrays: 0,
  functions: 0,
  recursion: 0,
};

function resetStore() {
  localStorage.clear();
  useGameStore.setState({
    screen: 'title',
    player: { level: 1, xp: 0, gold: 0, inventory: [] },
    challenge: { currentZoneId: null, challengeIndex: 0 },
    session: { sessionCorrect: 0, sessionXP: 0, challengeAttempts: 0, zoneFlawless: true },
    skills: { masteryByConcept: { ...emptyMastery }, unlockedSpells: [] },
    settings: { soundEnabled: false, crtEnabled: false },
  });
}

beforeEach(resetStore);

function passResult(): ChallengeResult {
  return { outcome: 'pass', cases: [], durationMs: 1 };
}

function failResult(): ChallengeResult {
  return { outcome: 'fail', cases: [], durationMs: 1 };
}

/**
 * Repite el PRIMER reto de 'logica' (golem-de-piedra) sin avanzar de reto:
 * startZone siempre resetea challengeIndex a 0. Útil para probar idempotencia
 * de desbloqueo, no para probar alcanzabilidad sin repetir zona (ver clearZone).
 */
function grindLogicaOnce() {
  useGameStore.getState().startZone('logica');
  useGameStore.getState().applyChallengeResult(passResult());
}

describe('startZone', () => {
  it('moves to the challenge screen and resets the challenge/session state', () => {
    useGameStore.getState().startZone('bucles');
    const state = useGameStore.getState();

    expect(state.screen).toBe('challenge');
    expect(state.challenge).toEqual({ currentZoneId: 'bucles', challengeIndex: 0 });
    expect(state.session).toEqual({
      sessionCorrect: 0,
      sessionXP: 0,
      challengeAttempts: 0,
      zoneFlawless: true,
    });
  });
});

describe('applyChallengeResult', () => {
  it('awards the reward xp/gold of the current challenge on pass (flawless: +bonus)', () => {
    useGameStore.getState().startZone('logica');
    const reward = logicaZone.challenges[0];
    const expectedXp = reward.rewardXp + FLAWLESS_BONUS_XP; // primer intento => flawless

    useGameStore.getState().applyChallengeResult(passResult());
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(expectedXp);
    expect(state.player.gold).toBe(reward.rewardGold);
    expect(state.session.sessionCorrect).toBe(1);
    expect(state.session.sessionXP).toBe(expectedXp);
  });

  it('does not award xp/gold, increments challengeAttempts and clears zoneFlawless on fail/error/timeout', () => {
    useGameStore.getState().startZone('logica');

    useGameStore.getState().applyChallengeResult(failResult());
    useGameStore.getState().applyChallengeResult({ outcome: 'error', cases: [], durationMs: 1 });
    useGameStore.getState().applyChallengeResult({ outcome: 'timeout', cases: [], durationMs: 1 });
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(0);
    expect(state.player.gold).toBe(0);
    expect(state.session.sessionCorrect).toBe(0);
    expect(state.session.challengeAttempts).toBe(3);
    expect(state.session.zoneFlawless).toBe(false);
  });

  it('returns null and applies nothing when there is no active challenge', () => {
    const outcome = useGameStore.getState().applyChallengeResult(passResult());

    expect(outcome).toBeNull();
    expect(useGameStore.getState().player.xp).toBe(0);
  });

  it('levels up and carries over the xp overflow once the threshold is reached', () => {
    useGameStore.setState({ player: { level: 1, xp: 90, gold: 0, inventory: [] } });
    // flawless: rewardXp 40 + bonus 20 = 60 -> 90+60=150 >= 100
    useGameStore.getState().startZone('logica');

    useGameStore.getState().applyChallengeResult(passResult());
    const state = useGameStore.getState();

    expect(state.player.level).toBe(2);
    expect(state.player.xp).toBe(50);
  });

  describe('flawless bonus', () => {
    it('returns flawless=true and adds FLAWLESS_BONUS_XP when there were no prior failed attempts', () => {
      useGameStore.getState().startZone('logica');
      const reward = logicaZone.challenges[0];

      const outcome = useGameStore.getState().applyChallengeResult(passResult());
      const state = useGameStore.getState();

      expect(outcome).toEqual({ flawless: true, xpGained: reward.rewardXp + FLAWLESS_BONUS_XP });
      expect(state.player.xp).toBe(reward.rewardXp + FLAWLESS_BONUS_XP);
      expect(state.session.sessionXP).toBe(reward.rewardXp + FLAWLESS_BONUS_XP);
    });

    it('returns flawless=false and awards no bonus after a prior failed attempt on the same challenge', () => {
      useGameStore.getState().startZone('logica');
      const reward = logicaZone.challenges[0];

      useGameStore.getState().applyChallengeResult(failResult());
      const outcome = useGameStore.getState().applyChallengeResult(passResult());

      expect(outcome).toEqual({ flawless: false, xpGained: reward.rewardXp });
      expect(useGameStore.getState().player.xp).toBe(reward.rewardXp);
    });
  });

  describe('mastery and spell unlocks', () => {
    it('increments masteryByConcept for the concept of the completed challenge', () => {
      useGameStore.getState().startZone('bucles'); // loops
      useGameStore.getState().applyChallengeResult(passResult());

      expect(useGameStore.getState().skills.masteryByConcept.loops).toBe(1);
      expect(useGameStore.getState().skills.masteryByConcept.conditionals).toBe(0);
    });

    it('unlocks Visión Lógica (conditionals, threshold 3) after clearing Bosque de la Lógica once, no repeats', () => {
      expect(logicaZone.challenges.length).toBeGreaterThanOrEqual(3);
      useGameStore.getState().startZone('logica');

      useGameStore.getState().applyChallengeResult(passResult());
      expect(useGameStore.getState().skills.unlockedSpells).not.toContain('vision-logica');

      useGameStore.getState().nextChallenge();
      useGameStore.getState().applyChallengeResult(passResult());
      expect(useGameStore.getState().skills.unlockedSpells).not.toContain('vision-logica');

      useGameStore.getState().nextChallenge();
      useGameStore.getState().applyChallengeResult(passResult());
      const state = useGameStore.getState();

      expect(state.skills.masteryByConcept.conditionals).toBe(3);
      expect(state.skills.unlockedSpells).toContain('vision-logica');
    });

    it('unlocks Eco Recursivo (recursion, threshold 2) after clearing Torre de la Recursión once, no repeats', () => {
      expect(recursionZone.challenges.length).toBeGreaterThanOrEqual(2);
      useGameStore.getState().startZone('recursion');

      useGameStore.getState().applyChallengeResult(passResult());
      expect(useGameStore.getState().skills.unlockedSpells).not.toContain('eco-recursivo');

      useGameStore.getState().nextChallenge();
      useGameStore.getState().applyChallengeResult(passResult());

      expect(useGameStore.getState().skills.masteryByConcept.recursion).toBe(2);
      expect(useGameStore.getState().skills.unlockedSpells).toContain('eco-recursivo');
    });

    it('unlocks Bucle Temporal (loops, threshold 3) after clearing Pantano de los Bucles once, no repeats', () => {
      expect(buclesZone.challenges.length).toBeGreaterThanOrEqual(3);
      clearZone('bucles');

      expect(useGameStore.getState().skills.masteryByConcept.loops).toBe(3);
      expect(useGameStore.getState().skills.unlockedSpells).toContain('bucle-temporal');
    });

    it('unlocks Mano del Recolector after beating two array challenges (arrays, threshold 2)', () => {
      expect(mercadoZone.challenges.length).toBeGreaterThanOrEqual(2);
      useGameStore.getState().startZone('mercado');

      useGameStore.getState().applyChallengeResult(passResult());
      expect(useGameStore.getState().skills.unlockedSpells).not.toContain('mano-recolector');

      useGameStore.getState().nextChallenge(); // avanza al segundo reto de arrays de la zona
      useGameStore.getState().applyChallengeResult(passResult());

      expect(useGameStore.getState().skills.masteryByConcept.arrays).toBe(2);
      expect(useGameStore.getState().skills.unlockedSpells).toContain('mano-recolector');
    });

    it('does not re-add an already-unlocked spell to unlockedSpells', () => {
      grindLogicaOnce();
      grindLogicaOnce();
      grindLogicaOnce();
      grindLogicaOnce(); // una cuarta vez, ya desbloqueado

      const unlocked = useGameStore.getState().skills.unlockedSpells;
      expect(unlocked.filter((id) => id === 'vision-logica')).toHaveLength(1);
    });
  });
});

describe('nextChallenge', () => {
  it('advances challengeIndex within the zone and resets challengeAttempts', () => {
    useGameStore.getState().startZone('bucles');
    useGameStore.getState().applyChallengeResult(failResult());
    useGameStore.getState().applyChallengeResult(passResult());

    useGameStore.getState().nextChallenge();
    const state = useGameStore.getState();

    expect(state.screen).toBe('challenge');
    expect(state.challenge.challengeIndex).toBe(1);
    expect(state.session.challengeAttempts).toBe(0);
  });

  it('awards loot and moves to results after the last challenge of the zone', () => {
    clearZone('logica');
    const state = useGameStore.getState();

    expect(state.screen).toBe('results');
    expect(state.player.inventory).toEqual(['🧩 Bosque de la Lógica Scroll']);
  });

  it('advances through every challenge of a multi-challenge zone before finishing', () => {
    useGameStore.getState().startZone('bucles');

    buclesZone.challenges.forEach((_, index) => {
      useGameStore.getState().applyChallengeResult(passResult());
      useGameStore.getState().nextChallenge();
      if (index < buclesZone.challenges.length - 1) {
        expect(useGameStore.getState().challenge.challengeIndex).toBe(index + 1);
      }
    });

    expect(useGameStore.getState().screen).toBe('results');
  });

  it('does not duplicate loot if the same zone is completed twice', () => {
    clearZone('logica');
    clearZone('logica');

    expect(useGameStore.getState().player.inventory).toEqual(['🧩 Bosque de la Lógica Scroll']);
  });
});

describe('goToWorld', () => {
  it('returns to the world screen', () => {
    useGameStore.getState().startZone('logica');

    useGameStore.getState().goToWorld();

    expect(useGameStore.getState().screen).toBe('world');
  });
});

describe('settings', () => {
  it('defaults to soundEnabled=false and crtEnabled=false', () => {
    expect(useGameStore.getState().settings).toEqual({ soundEnabled: false, crtEnabled: false });
  });

  it('toggleSound flips soundEnabled without touching crtEnabled', () => {
    useGameStore.getState().toggleSound();
    expect(useGameStore.getState().settings).toEqual({ soundEnabled: true, crtEnabled: false });

    useGameStore.getState().toggleSound();
    expect(useGameStore.getState().settings.soundEnabled).toBe(false);
  });

  it('toggleCrt flips crtEnabled without touching soundEnabled', () => {
    useGameStore.getState().toggleCrt();
    expect(useGameStore.getState().settings).toEqual({ soundEnabled: false, crtEnabled: true });

    useGameStore.getState().toggleCrt();
    expect(useGameStore.getState().settings.crtEnabled).toBe(false);
  });

  it('persists the toggled settings to localStorage via the persist middleware', () => {
    useGameStore.getState().toggleSound();
    useGameStore.getState().toggleCrt();

    const stored = JSON.parse(localStorage.getItem('codequest-player-progress')!);

    expect(stored.state.settings).toEqual({ soundEnabled: true, crtEnabled: true });
  });
});
