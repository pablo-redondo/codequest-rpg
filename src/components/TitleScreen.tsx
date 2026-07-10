import { useGameStore } from '../store/gameStore';

export function TitleScreen() {
  const goToScreen = useGameStore((state) => state.goToScreen);

  return (
    <div className="screen title-screen">
      <div className="title-logo">⚔️</div>
      <h1 className="title-heading">CodeQuest</h1>
      <p className="title-sub">El RPG de Programación</p>
      <div className="npc-dialog">
        <span className="npc-avatar">🧙</span>
        <div className="npc-bubble">
          <strong>Maestro Algoritmus:</strong>
          <p>
            ¡Bienvenido, joven aventurero! Me alegra que hayas llegado al reino de CodeQuest.
            Aquí aprenderás los secretos del código JavaScript mientras conquistas zonas
            y completas misiones épicas. ¿Estás listo para comenzar tu aventura?
          </p>
        </div>
      </div>
      <button className="btn-primary" onClick={() => goToScreen('world')}>
        ⚔️ Comenzar Aventura
      </button>
    </div>
  );
}
