import { useState } from 'react';
import { zones } from '../data/zones';

export function useGameState() {
  const [screen, setScreen] = useState('title');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [currentZoneId, setCurrentZoneId] = useState(null);
  const [missionIndex, setMissionIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const XP_PER_LEVEL = 100;

  function goToScreen(s) {
    setScreen(s);
  }

  function startZone(zoneId) {
    setCurrentZoneId(zoneId);
    setMissionIndex(0);
    setSessionCorrect(0);
    setSessionXP(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setScreen('mission');
  }

  function submitAnswer(choiceIndex) {
    if (answered) return;

    const zone = zones.find(z => z.id === currentZoneId);
    const mission = zone.missions[missionIndex];
    const isCorrect = choiceIndex === mission.correct;

    setSelectedAnswer(choiceIndex);
    setAnswered(true);

    if (isCorrect) {
      const earnedXP = 30;
      const earnedGold = 10;

      setSessionCorrect(prev => prev + 1);
      setSessionXP(prev => prev + earnedXP);
      setXp(prev => {
        const newXP = prev + earnedXP;
        if (newXP >= level * XP_PER_LEVEL) {
          setLevel(l => l + 1);
          return newXP - level * XP_PER_LEVEL;
        }
        return newXP;
      });
      setGold(prev => prev + earnedGold);
    }
  }

  function nextMission() {
    const zone = zones.find(z => z.id === currentZoneId);
    const nextIndex = missionIndex + 1;

    if (nextIndex < zone.missions.length) {
      setMissionIndex(nextIndex);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      const zone = zones.find(z => z.id === currentZoneId);
      const lootItem = zone.icon + ' ' + zone.name.replace('Zona de ', '') + ' Scroll';
      setInventory(prev => {
        if (!prev.includes(lootItem)) return [...prev, lootItem];
        return prev;
      });
      setScreen('results');
    }
  }

  function goToWorld() {
    setScreen('world');
    setAnswered(false);
    setSelectedAnswer(null);
  }

  const currentZone = zones.find(z => z.id === currentZoneId) || null;
  const currentMission = currentZone ? currentZone.missions[missionIndex] : null;
  const totalMissions = currentZone ? currentZone.missions.length : 0;
  const xpProgress = level > 0 ? (xp / (level * XP_PER_LEVEL)) * 100 : 0;

  return {
    screen,
    level,
    xp,
    gold,
    inventory,
    currentZoneId,
    missionIndex,
    sessionCorrect,
    sessionXP,
    answered,
    selectedAnswer,
    currentZone,
    currentMission,
    totalMissions,
    xpProgress,
    goToScreen,
    startZone,
    submitAnswer,
    nextMission,
    goToWorld,
  };
}
