import { lazy, Suspense } from 'react';
import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { ResultsScreen } from './components/ResultsScreen';
import { CrtOverlay } from './components/CrtOverlay';
import type { Screen } from './types/zone';
import './styles/game.css';

// CodeMirror (el editor real del ChallengeScreen) pesa la mayor parte del
// bundle. Se difiere a su propio chunk para que TitleScreen/WorldMap no
// paguen ese coste: solo se descarga cuando el jugador entra a un reto.
const ChallengeScreen = lazy(() =>
  import('./components/challenge/ChallengeScreen').then((module) => ({
    default: module.ChallengeScreen,
  })),
);

function App() {
  const screen = useGameStore((state) => state.screen);

  return (
    <>
      {renderScreen(screen)}
      <CrtOverlay />
    </>
  );
}

function renderScreen(screen: Screen) {
  if (screen === 'title') return <TitleScreen />;
  if (screen === 'world') return <WorldMap />;
  if (screen === 'challenge') {
    return (
      <Suspense fallback={<ChallengeScreenFallback />}>
        <ChallengeScreen />
      </Suspense>
    );
  }
  if (screen === 'results') return <ResultsScreen />;

  return null;
}

function ChallengeScreenFallback() {
  return (
    <div className="screen challenge-screen-loading">
      <span className="spinner" /> Preparando el editor de hechizos…
    </div>
  );
}

export default App;
