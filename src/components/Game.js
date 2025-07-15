import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import GameUI from './GameUI';
import GameOver from './GameOver';
import '../styles/Game.css';

const Game = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('gameOver');
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setLevel(1);
  };

  return (
    <div className="game-container">
      {gameState === 'menu' && (
        <div className="game-menu">
          <h1>Game Title</h1>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      
      {gameState === 'playing' && (
        <>
          <GameUI 
            score={score} 
            level={level} 
            onPause={pauseGame}
          />
          <GameBoard 
            gameState={gameState}
            score={score}
            setScore={setScore}
            level={level}
            setLevel={setLevel}
            onGameOver={endGame}
          />
        </>
      )}
      
      {gameState === 'paused' && (
        <div className="game-paused">
          <h2>Game Paused</h2>
          <button onClick={resumeGame}>Resume</button>
          <button onClick={resetGame}>Main Menu</button>
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <GameOver 
          score={score}
          level={level}
          onRestart={startGame}
          onMainMenu={resetGame}
        />
      )}
    </div>
  );
};

export default Game;
