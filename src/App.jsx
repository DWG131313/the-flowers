import { useState, useCallback } from 'react';
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
  };

  state.currentEvent = generateEvent(state);
  return state;
}

export default function App() {
  const [screen, setScreen] = useState('title');
  const [gameState, setGameState] = useState(null);

  const handleStart = useCallback(() => {
    setScreen('tutorial');
  }, []);

  const handleTutorialComplete = useCallback(() => {
    setGameState(createInitialState());
    setScreen('game');
  }, []);

  const handleChoice = useCallback((effectKey) => {
    setGameState(prev => {
      const newState = applyChoice(prev, prev.currentEvent, effectKey);
      if (newState.gameOver) {
        setTimeout(() => setScreen('gameover'), 100);
      }
      return newState;
    });
  }, []);

  const handleAdvance = useCallback(() => {
    setGameState(prev => {
      const newState = advancePhase(prev);
      if (newState.gameOver) {
        setTimeout(() => setScreen('gameover'), 100);
      }
      return newState;
    });
  }, []);

  const handleRestart = useCallback(() => {
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
        <TitleScreen onStart={handleStart} />
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
