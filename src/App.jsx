import { useState, useCallback, useEffect } from 'react';
import { colors, crt } from './styles/theme.js';
import { generateStartingGroup, aliveSurvivors } from './game/survivor.js';
import { resetEventHistory, generateEvent } from './game/eventGenerator.js';
import { applyChoice } from './game/effects.js';
import { advancePhase } from './game/phaseAdvance.js';
import {
  STARTING_FOOD,
  STARTING_MEDICINE,
  STARTING_AMMO,
  PHASE_NAMES,
  PHASE_ICONS,
} from './game/constants.js';

import TitleScreen from './components/TitleScreen.jsx';
import TutorialScreen from './components/TutorialScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';

const SAVE_KEY = 'flowers_save';

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore quota errors */ }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) { /* ignore */ }
}

function createInitialState() {
  resetEventHistory();
  const survivors = generateStartingGroup();
  const alive = aliveSurvivors(survivors);
  const groupMorale = Math.round(
    alive.reduce((sum, s) => sum + s.morale, 0) / alive.length
  );

  const state = {
    day: 1,
    phase: 0,
    food: STARTING_FOOD,
    medicine: STARTING_MEDICINE,
    ammo: STARTING_AMMO,
    groupMorale,
    survivors,
    log: [`── ${PHASE_ICONS[0]} ${PHASE_NAMES[0].toUpperCase()}, DAY 1 ──`],
    gameOver: false,
    gameWon: false,
    gameOverReason: '',
    currentEvent: null,
    items: [],
    prevResources: null,
  };

  state.currentEvent = generateEvent(state);
  return state;
}

export default function App() {
  const [screen, setScreen] = useState('title');
  const [gameState, setGameState] = useState(null);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(!!loadSave());
  }, []);

  const handleStart = useCallback(() => {
    setScreen('tutorial');
  }, []);

  const handleTutorialComplete = useCallback(() => {
    clearSave();
    const state = createInitialState();
    setGameState(state);
    saveGame(state);
    setScreen('game');
  }, []);

  const handleContinue = useCallback(() => {
    const saved = loadSave();
    if (saved) {
      setGameState(saved);
      setScreen('game');
    }
  }, []);

  const handleChoice = useCallback((effectKey) => {
    setGameState(prev => {
      const newState = applyChoice(prev, prev.currentEvent, effectKey);
      newState.prevResources = { food: prev.food, medicine: prev.medicine, ammo: prev.ammo, morale: prev.groupMorale };
      if (newState.gameOver) {
        clearSave();
        setTimeout(() => setScreen('gameover'), 100);
      } else {
        saveGame(newState);
      }
      return newState;
    });
  }, []);

  const handleAdvance = useCallback(() => {
    setGameState(prev => {
      const newState = advancePhase(prev);
      newState.prevResources = { food: prev.food, medicine: prev.medicine, ammo: prev.ammo, morale: prev.groupMorale };
      if (newState.gameOver) {
        clearSave();
        setTimeout(() => setScreen('gameover'), 100);
      } else {
        saveGame(newState);
      }
      return newState;
    });
  }, []);

  const handleRestart = useCallback(() => {
    clearSave();
    setHasSave(false);
    setGameState(createInitialState());
    setScreen('game');
  }, []);

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.primary,
      fontFamily: '"Courier New", "Lucida Console", monospace',
      minHeight: '100vh',
      ...crt.screenGlow,
      position: 'relative',
    }}>
      <div style={crt.scanlines} />

      {screen === 'title' && (
        <TitleScreen onStart={handleStart} hasSave={hasSave} onContinue={handleContinue} />
      )}
      {screen === 'tutorial' && (
        <TutorialScreen onComplete={handleTutorialComplete} />
      )}
      {screen === 'game' && gameState && (
        <GameScreen
          state={gameState}
          onChoice={handleChoice}
          onAdvance={handleAdvance}
        />
      )}
      {screen === 'gameover' && gameState && (
        <GameOverScreen state={gameState} onRestart={handleRestart} />
      )}
    </div>
  );
}
