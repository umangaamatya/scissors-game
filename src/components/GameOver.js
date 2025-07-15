import React from 'react';
import '../styles/GameOver.css';

const GameOver = ({ score, level, onRestart, onMainMenu }) => {
  return (
    <div className="game-over">
      <div className="game-over-content">
        <h2>Game Over</h2>
        
        <div className="final-stats">
          <div className="final-stat">
            <span className="stat-label">Final Score:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="final-stat">
            <span className="stat-label">Level Reached:</span>
            <span className="stat-value">{level}</span>
          </div>
        </div>
        
        <div className="game-over-buttons">
          <button className="restart-btn" onClick={onRestart}>
            Play Again
          </button>
          <button className="menu-btn" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
