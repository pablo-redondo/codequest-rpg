import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';
import { zones } from '../data/zones';

const variablesZone = zones.find((z) => z.id === 'variables')!;

function resetStore() {
  localStorage.clear();
  useGameStore.setState({
    screen: 'title',
    player: { level: 1, xp: 0, gold: 0, inventory: [] },
    mission: { currentZoneId: null, missionIndex: 0, answered: false, selectedAnswer: null },
    session: { sessionCorrect: 0, sessionXP: 0 },
  });
}

beforeEach(resetStore);

describe('startZone', () => {
  it('moves to the mission screen and resets the mission/session state', () => {
    useGameStore.getState().startZone('variables');
    const state = useGameStore.getState();

    expect(state.screen).toBe('challenge');
    expect(state.mission).toEqual({
      currentZoneId: 'variables',
      missionIndex: 0,
      answered: false,
      selectedAnswer: null,
    });
    expect(state.session).toEqual({ sessionCorrect: 0, sessionXP: 0 });
  });
});

describe('submitAnswer', () => {
  it('awards XP and gold on a correct answer', () => {
    useGameStore.getState().startZone('variables');
    const correctIndex = variablesZone.missions[0].correct;

    useGameStore.getState().submitAnswer(correctIndex);
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(30);
    expect(state.player.gold).toBe(10);
    expect(state.session).toEqual({ sessionCorrect: 1, sessionXP: 30 });
    expect(state.mission.answered).toBe(true);
    expect(state.mission.selectedAnswer).toBe(correctIndex);
  });

  it('does not award XP or gold on a wrong answer', () => {
    useGameStore.getState().startZone('variables');
    const correctIndex = variablesZone.missions[0].correct;
    const wrongIndex = (correctIndex + 1) % variablesZone.missions[0].choices.length;

    useGameStore.getState().submitAnswer(wrongIndex);
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(0);
    expect(state.player.gold).toBe(0);
    expect(state.session).toEqual({ sessionCorrect: 0, sessionXP: 0 });
    expect(state.mission.answered).toBe(true);
    expect(state.mission.selectedAnswer).toBe(wrongIndex);
  });

  it('is a no-op once the current mission has already been answered', () => {
    useGameStore.getState().startZone('variables');
    const correctIndex = variablesZone.missions[0].correct;

    useGameStore.getState().submitAnswer(correctIndex);
    useGameStore.getState().submitAnswer(correctIndex);
    const state = useGameStore.getState();

    expect(state.player.xp).toBe(30);
    expect(state.session.sessionCorrect).toBe(1);
  });

  it('levels up and carries over the XP overflow once the threshold is reached', () => {
    useGameStore.setState({ player: { level: 1, xp: 90, gold: 0, inventory: [] } });
    useGameStore.getState().startZone('variables');
    const correctIndex = variablesZone.missions[0].correct;

    useGameStore.getState().submitAnswer(correctIndex);
    const state = useGameStore.getState();

    // 90 + 30 = 120 >= 1 * 100 -> level up, remainder 20
    expect(state.player.level).toBe(2);
    expect(state.player.xp).toBe(20);
  });
});

describe('nextMission', () => {
  it('advances to the next mission and resets the answer state', () => {
    useGameStore.getState().startZone('variables');
    useGameStore.getState().submitAnswer(variablesZone.missions[0].correct);

    useGameStore.getState().nextMission();
    const state = useGameStore.getState();

    expect(state.screen).toBe('challenge');
    expect(state.mission.missionIndex).toBe(1);
    expect(state.mission.answered).toBe(false);
    expect(state.mission.selectedAnswer).toBe(null);
  });

  it('awards loot and moves to the results screen after the last mission', () => {
    useGameStore.getState().startZone('variables');

    variablesZone.missions.forEach((mission, index) => {
      useGameStore.getState().submitAnswer(mission.correct);
      useGameStore.getState().nextMission();
      if (index < variablesZone.missions.length - 1) {
        expect(useGameStore.getState().mission.missionIndex).toBe(index + 1);
      }
    });

    const state = useGameStore.getState();
    expect(state.screen).toBe('results');
    expect(state.player.inventory).toEqual(['📦 Variables Scroll']);
    expect(state.session).toEqual({ sessionCorrect: 3, sessionXP: 90 });
  });

  it('does not duplicate loot if the same zone is completed twice', () => {
    for (let run = 0; run < 2; run++) {
      useGameStore.getState().startZone('variables');
      variablesZone.missions.forEach((mission) => {
        useGameStore.getState().submitAnswer(mission.correct);
        useGameStore.getState().nextMission();
      });
    }

    expect(useGameStore.getState().player.inventory).toEqual(['📦 Variables Scroll']);
  });
});

describe('goToWorld', () => {
  it('returns to the world screen and clears the answer state', () => {
    useGameStore.getState().startZone('variables');
    useGameStore.getState().submitAnswer(variablesZone.missions[0].correct);

    useGameStore.getState().goToWorld();
    const state = useGameStore.getState();

    expect(state.screen).toBe('world');
    expect(state.mission.answered).toBe(false);
    expect(state.mission.selectedAnswer).toBe(null);
  });
});
