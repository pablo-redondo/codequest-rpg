import { useGameState } from './hooks/useGameState';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { MissionScreen } from './components/MissionScreen';
import { ResultsScreen } from './components/ResultsScreen';
import './styles/game.css';

function App() {
  const state = useGameState();

  if (state.screen === 'title') {
    return <TitleScreen onStart={() => state.goToScreen('world')} />;
  }

  if (state.screen === 'world') {
    return (
      <WorldMap
        level={state.level}
        xp={state.xp}
        gold={state.gold}
        inventory={state.inventory}
        xpProgress={state.xpProgress}
        onStartZone={state.startZone}
      />
    );
  }

  if (state.screen === 'mission') {
    return (
      <MissionScreen
        currentZone={state.currentZone}
        currentMission={state.currentMission}
        missionIndex={state.missionIndex}
        totalMissions={state.totalMissions}
        answered={state.answered}
        selectedAnswer={state.selectedAnswer}
        onSubmit={state.submitAnswer}
        onNext={state.nextMission}
      />
    );
  }

  if (state.screen === 'results') {
    return (
      <ResultsScreen
        currentZone={state.currentZone}
        sessionCorrect={state.sessionCorrect}
        sessionXP={state.sessionXP}
        gold={state.gold}
        inventory={state.inventory}
        totalMissions={state.totalMissions}
        onGoToWorld={state.goToWorld}
      />
    );
  }

  return null;
}

export default App;
