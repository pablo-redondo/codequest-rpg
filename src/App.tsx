import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { MissionScreen } from './components/MissionScreen';
import { ResultsScreen } from './components/ResultsScreen';
import './styles/game.css';

function App() {
  const screen = useGameStore((state) => state.screen);

  if (screen === 'title') return <TitleScreen />;
  if (screen === 'world') return <WorldMap />;
  if (screen === 'challenge') return <MissionScreen />;
  if (screen === 'results') return <ResultsScreen />;

  return null;
}

export default App;
