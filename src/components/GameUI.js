import React from 'react';
import '../styles/GameUI.css';

const GameUI = ({ score, level, onPause }) => {
  return (
    <div className="game-ui">
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{level}</span>
        </div>
      </div>
      
      <div className="game-controls">
        <button className="control-btn" onClick={onPause}>
          Pause
        </button>
      </div>
    </div>
  );
};

export default GameUI;
