import { useState, useEffect, useRef } from 'react';

const useGameState = (initialState = 'menu') => {
  const [gameState, setGameState] = useState(initialState);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);
  
  const gameLoopRef = useRef(null);

  useEffect(() => {
    setIsGameRunning(gameState === 'playing');
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setIsGameRunning(true);
  };

  const pauseGame = () => {
    setGameState('paused');
    setIsGameRunning(false);
  };

  const resumeGame = () => {
    setGameState('playing');
    setIsGameRunning(true);
  };

  const endGame = () => {
    setGameState('gameOver');
    setIsGameRunning(false);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setLevel(1);
    setLives(3);
    setIsGameRunning(false);
  };

  const incrementScore = (points = 10) => {
    setScore(prevScore => prevScore + points);
  };

  const decrementLives = () => {
    setLives(prevLives => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        endGame();
      }
      return newLives;
    });
  };

  const levelUp = () => {
    setLevel(prevLevel => prevLevel + 1);
  };

  return {
    gameState,
    score,
    level,
    lives,
    isGameRunning,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    incrementScore,
    decrementLives,
    levelUp,
    setScore,
    setLevel,
    setLives
  };
};

export default useGameState;
