import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(3);
  const [scissors, setScissors] = useState({ y: 100, direction: 1 });
  const [cutLineY, setCutLineY] = useState(null);
  const [windowHeight, setWindowHeight] = useState(600);
  const [isCutting, setIsCutting] = useState(false);
  const [cutAnimation, setCutAnimation] = useState({ active: false, startY: 0, progress: 0 });

  // Handle window resize
  useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight);
    };
    
    updateWindowHeight();
    window.addEventListener('resize', updateWindowHeight);
    return () => window.removeEventListener('resize', updateWindowHeight);
  }, []);

  useEffect(() => {
    if (gameState === 'ready') {
      setCutLineY(generateRandomCutLine());
    }
  }, [gameState, windowHeight]);

  const baseSpeed = 2;

  function generateRandomCutLine() {
    const hairTop = windowHeight / 2 - 100;
    return Math.floor(hairTop + Math.random() * 180);
  }

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setHealth(3);
    setScissors({ y: 100, direction: 1 });
    setCutLineY(generateRandomCutLine());
    setIsCutting(false);
    setCutAnimation({ active: false, startY: 0, progress: 0 });
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setHealth(3);
    setScissors({ y: 100, direction: 1 });
    setCutLineY(generateRandomCutLine());
    setIsCutting(false);
    setCutAnimation({ active: false, startY: 0, progress: 0 });
  };

  // Cut animation effect
  useEffect(() => {
    if (!cutAnimation.active) return;

    const animateInterval = setInterval(() => {
      setCutAnimation(prev => {
        if (prev.progress >= 100) {
          setIsCutting(false);
          return { active: false, startY: 0, progress: 0 };
        }
        return { ...prev, progress: prev.progress + 8 };
      });
    }, 16);

    return () => clearInterval(animateInterval);
  }, [cutAnimation.active]);

  useEffect(() => {
    if (gameState !== 'playing' || isCutting) return;

    const speed = baseSpeed + level * 1;
    const interval = setInterval(() => {
      setScissors(prev => {
        let newY = prev.y + prev.direction * speed;
        let newDirection = prev.direction;

        if (newY <= 30) {
          newY = 30;
          newDirection = 1;
        } else if (newY >= windowHeight - 50) {
          newY = windowHeight - 50;
          newDirection = -1;
        }

        return { y: newY, direction: newDirection };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [gameState, level, windowHeight, isCutting]);

  const performCut = useCallback((isSuccess) => {
    setIsCutting(true);
    setCutAnimation({
      active: true,
      startY: scissors.y,
      progress: 0
    });

    setTimeout(() => {
      if (isSuccess) {
        setScore(prev => prev + 10);
        setLevel(prev => prev + 1);
        setCutLineY(generateRandomCutLine());
      } else {
        setHealth(prev => {
          const newHealth = prev - 1;
          if (newHealth <= 0) {
            setGameState('gameOver');
          }
          return newHealth;
        });
      }
    }, 300);
  }, [scissors.y]);

  const handleClick = useCallback(() => {
    if (gameState !== 'playing' || isCutting) return;

    const diff = Math.abs(scissors.y - cutLineY);
    const isSuccess = diff < 15;
    performCut(isSuccess);
  }, [scissors.y, cutLineY, gameState, isCutting, performCut]);

  // Heart component
  const Heart = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
      <path
        fill={filled ? '#ef4444' : '#d1d5db'}
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );

  const gameContainerStyle = {
    background: 'linear-gradient(to bottom, #bae6fd, #e0f2fe)',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  };

  const scissorsStyle = {
    position: 'absolute',
    left: isCutting ? `${20 + (cutAnimation.progress * 2)}px` : '16px',
    top: `${scissors.y}px`,
    width: '40px',
    height: '40px',
    transform: isCutting ? `rotate(${cutAnimation.progress * 2}deg)` : 'rotate(0deg)',
    transition: isCutting ? 'none' : 'all 0.1s ease-out',
    zIndex: 10
  };

  const personContainerStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const headStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#fcd34d',
    marginBottom: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const hairStyle = {
    position: 'relative',
    width: '80px',
    height: '208px',
    backgroundColor: '#92400e',
    borderRadius: '0 0 24px 24px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const cutLineStyle = {
    position: 'absolute',
    width: '100%',
    borderTop: '2px dotted white',
    top: `${cutLineY ? cutLineY - (windowHeight / 2 - 100) : 0}px`
  };

  // Cut effect styles
  const cutEffectStyle = {
    position: 'absolute',
    top: `${cutAnimation.startY - (windowHeight / 2 - 100)}px`,
    left: '0',
    width: '100%',
    height: '3px',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    opacity: cutAnimation.active ? 1 : 0,
    transition: 'opacity 0.3s ease-out'
  };

  const sparkleStyle = {
    position: 'absolute',
    top: `${cutAnimation.startY - (windowHeight / 2 - 100)}px`,
    left: `${cutAnimation.progress}%`,
    width: '6px',
    height: '6px',
    backgroundColor: '#fbbf24',
    borderRadius: '50%',
    boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
    opacity: cutAnimation.active ? 1 : 0,
    transform: 'scale(1.5)',
    animation: cutAnimation.active ? 'sparkle 0.3s ease-out' : 'none'
  };

  const hudStyle = {
    position: 'absolute',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937'
  };

  const healthStyle = {
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center'
  };

  const instructionsStyle = {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '8px 16px',
    borderRadius: '8px'
  };

  const modalStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '320px',
    width: '80%'
  };

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={gameContainerStyle} onClick={handleClick}>
      <style>
        {`
          @keyframes sparkle {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      {/* HUD */}
      <div style={{...hudStyle, top: '16px', left: '16px'}}>Score: {score}</div>
      <div style={{...hudStyle, top: '16px', right: '16px'}}>Level: {level}</div>

      {/* Health Bar */}
      <div style={healthStyle}>
        {[...Array(3)].map((_, i) => (
          <Heart key={i} filled={i < health} />
        ))}
      </div>

      {/* Scissors */}
      <img src="/scissors.png" alt="Scissors" style={scissorsStyle} />

      {/* Person */}
      <div style={personContainerStyle}>
        <div style={headStyle}></div>
        <div style={hairStyle}>
          {cutLineY !== null && <div style={cutLineStyle}></div>}
          
          {/* Cut Effect */}
          {cutAnimation.active && (
            <>
              <div style={cutEffectStyle}></div>
              <div style={sparkleStyle}></div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div style={instructionsStyle}>
          Tap when scissors align with the dotted line! Lives: {health}/3
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'ready' && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937'}}>
              The New Barber
            </h1>
            <p style={{marginBottom: '16px', color: '#6b7280'}}>
              Tap when the scissors align with the dotted line to cut the hair!
            </p>
            <p style={{marginBottom: '16px', color: '#ef4444', fontSize: '14px'}}>
              You have 3 lives. Miss 3 times and it's game over!
            </p>
            <button onClick={startGame} style={buttonStyle}>
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937'}}>
              Game Over!
            </h1>
            <p style={{marginBottom: '8px', color: '#6b7280'}}>Final Score: {score}</p>
            <p style={{marginBottom: '16px', color: '#6b7280'}}>Level Reached: {level}</p>
            <button onClick={resetGame} style={buttonStyle}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
