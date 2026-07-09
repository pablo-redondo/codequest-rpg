import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';
import { zones } from '../data/zones';
import type { ChallengeResult } from '../types/challenge';

const logicaZone = zones.find((z) => z.id === 'logica')!; // 1 reto
const buclesZone = zones.find((z) => z.id === 'bucles')!; // 2 retos

function resetStore() {
  localStorage.clear();
  useGameStore.setState({
    screen: 'title',
    player: { level: 1, xp: 0, gold: 0, inventory: [] },
    challenge: { currentZoneId: null, challengeIndex: 0 },
    session: { sessionCorrect: 0, sessionXP: 0, challengeAttempts: 0 },
  });
}

beforeEach(resetStore);

function passResult(): ChallengeResult {
  return { outcome: 'pass', cases: [], durationMs: 1 };
}

function failResult(): ChallengeResult {
  return { outcome: 'fail', cases: [], durationMs: 1 };
}

describe('startZone', () => {
  it('moves to the challenge screen and resets the challenge/session state', () => {
    useGameStore.getState().startZone('bucles');
    const state = useGameStore.getState();

    expect(state.screen).toBe('challenge');
    expect(state.challenge).toEqual({ currentZoneId: 'bucles', challengeIndex: 0 });
    expect(state.session).toEqual({ sessionCorrect: 0, sessionXP: 0, challengeAttempts: 0 });
  });
});

describe('applyChallengeResult', () => {
  it('awards the reward xp/gold of the current challenge on pass', () => {
    useGameStore.getState().startZone('logica');
    const reward = logicaZone.challenges[0];

    useGameStore.getState().applyChallengeResult(passResult());
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(reward.rewardXp);
    expect(state.player.gold).toBe(reward.rewardGold);
    expect(state.session.sessionCorrect).toBe(1);
    expect(state.session.sessionXP).toBe(reward.rewardXp);
  });

  it('does not award xp/gold and increments challengeAttempts on fail/error/timeout', () => {
    useGameStore.getState().startZone('logica');

    useGameStore.getState().applyChallengeResult(failResult());
    useGameStore.getState().applyChallengeResult({ outcome: 'error', cases: [], durationMs: 1 });
    useGameStore.getState().applyChallengeResult({ outcome: 'timeout', cases: [], durationMs: 1 });
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(0);
    expect(state.player.gold).toBe(0);
    expect(state.session.sessionCorrect).toBe(0);
    expect(state.session.challengeAttempts).toBe(3);
  });

  it('levels up and carries over the xp overflow once the threshold is reached', () => {
    useGameStore.setState({ player: { level: 1, xp: 90, gold: 0, inventory: [] } });
    useGameStore.getState().startZone('logica'); // rewardXp 40 -> 90+40=130 >= 100

    useGameStore.getState().applyChallengeResult(passResult());
    const state = useGameStore.getState();

    expect(state.player.level).toBe(2);
    expect(state.player.xp).toBe(30);
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
    useGameStore.getState().startZone('logica'); // 1 solo reto

    useGameStore.getState().applyChallengeResult(passResult());
    useGameStore.getState().nextChallenge();
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
    for (let run = 0; run < 2; run++) {
      useGameStore.getState().startZone('logica');
      useGameStore.getState().applyChallengeResult(passResult());
      useGameStore.getState().nextChallenge();
    }

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
