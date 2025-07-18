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

  useEffect(() => {
    const updateWindowHeight = () => setWindowHeight(window.innerHeight);
    updateWindowHeight();
    window.addEventListener('resize', updateWindowHeight);
    return () => window.removeEventListener('resize', updateWindowHeight);
  }, []);

  useEffect(() => {
    if (gameState === 'ready') {
      setCutLineY(generateRandomCutLine());
    }
  }, [gameState, windowHeight]);

  const baseSpeed = 1; // Slowed speed

  function generateRandomCutLine() {
    const imageTop = windowHeight / 2 - 120;
    return Math.floor(imageTop + Math.random() * 180);
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

  useEffect(() => {
    if (!cutAnimation.active) return;
    const interval = setInterval(() => {
      setCutAnimation(prev => {
        if (prev.progress >= 100) {
          setIsCutting(false);
          return { active: false, startY: 0, progress: 0 };
        }
        return { ...prev, progress: prev.progress + 6 };
      });
    }, 16);
    return () => clearInterval(interval);
  }, [cutAnimation.active]);

  useEffect(() => {
    if (gameState !== 'playing' || isCutting) return;
    let animationId;
    const animate = () => {
      setScissors(prev => {
        let newY = prev.y + prev.direction * baseSpeed;
        let dir = prev.direction;
        if (newY <= 30) {
          newY = 30;
          dir = 1;
        } else if (newY >= windowHeight - 50) {
          newY = windowHeight - 50;
          dir = -1;
        }
        return { y: newY, direction: dir };
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => animationId && cancelAnimationFrame(animationId);
  }, [gameState, level, windowHeight, isCutting]);

  const performCut = useCallback((isSuccess, clickY) => {
    setIsCutting(true);
    const cutPosition = clickY || scissors.y;
    setCutAnimation({ active: true, startY: cutPosition, progress: 0 });
    setTimeout(() => {
      if (isSuccess) {
        setScore(prev => prev + 10);
        setLevel(prev => prev + 1);
        setCutLineY(generateRandomCutLine());
      } else {
        setHealth(prev => {
          const newHealth = prev - 1;
          if (newHealth <= 0) setGameState('gameOver');
          return newHealth;
        });
      }
    }, 300);
  }, [scissors.y]);

  const handleClick = useCallback((e) => {
    if (gameState !== 'playing' || isCutting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = (e.nativeEvent?.clientY || e.clientY) - rect.top;
    const diff = Math.abs(clickY - cutLineY);
    performCut(diff < 25, clickY);
  }, [cutLineY, gameState, isCutting, performCut]);

  const Heart = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
      <path fill={filled ? '#ef4444' : '#d1d5db'}
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
           2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
           4.5 2.09C13.09 3.81 14.76 3 16.5 3 
           19.58 3 22 5.42 22 8.5c0 3.78-3.4 
           6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom, #bae6fd, #e0f2fe)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      <style>{`
        @keyframes sparkle {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 18, fontWeight: 'bold' }}>Score: {score}</div>
      <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, fontWeight: 'bold' }}>Level: {level}</div>
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center'
      }}>
        {[...Array(3)].map((_, i) => <Heart key={i} filled={i < health} />)}
      </div>

      {/* Scissors */}
      <img
        src="/scissors.png"
        alt="Scissors"
        style={{
          position: 'absolute',
          left: isCutting ? `${20 + (cutAnimation.progress * 2)}px` : '16px',
          top: `${scissors.y}px`,
          width: '40px',
          height: '40px',
          transform: isCutting ? `rotate(${cutAnimation.progress * 2}deg)` : 'rotate(0deg)',
          transition: isCutting ? 'none' : 'all 0.1s ease-out',
          zIndex: 10
        }}
      />

      {/* Person Image */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }}>
        <img
          src="/long-hair-person.png"
          alt="Person with long hair"
          style={{
            width: '200px',
            borderRadius: '16px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        />
        {cutLineY && (
          <div style={{
            position: 'absolute',
            top: `${cutLineY - (windowHeight / 2 - 120)}px`,
            width: '100%',
            borderTop: '2px dotted white',
            zIndex: 2
          }}></div>
        )}
        {cutAnimation.active && (
          <>
            <div style={{
              position: 'absolute',
              top: `${cutAnimation.startY - (windowHeight / 2 - 120)}px`,
              left: 0,
              width: '100%',
              height: '3px',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 10px rgba(255,255,255,0.8)',
              zIndex: 2
            }}></div>
            <div style={{
              position: 'absolute',
              top: `${cutAnimation.startY - (windowHeight / 2 - 120)}px`,
              left: `${cutAnimation.progress}%`,
              width: '6px',
              height: '6px',
              backgroundColor: '#fbbf24',
              borderRadius: '50%',
              animation: 'sparkle 0.3s ease-out',
              zIndex: 2
            }}></div>
          </>
        )}
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          backgroundColor: 'rgba(255,255,255,0.85)',
          padding: '8px 16px',
          borderRadius: '8px'
        }}>
          Tap when scissors align with the dotted line!
        </div>
      )}

      {/* Start Modal */}
      {gameState === 'ready' && (
        <Modal title="The New Barber" buttonText="Start Game" onClick={startGame} />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameOver' && (
        <Modal
          title="Game Over!"
          buttonText="Play Again"
          onClick={resetGame}
          score={score}
          level={level}
        />
      )}
    </div>
  );
};

const Modal = ({ title, buttonText, onClick, score, level }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: 24,
      borderRadius: 8,
      textAlign: 'center',
      maxWidth: 320
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>{title}</h1>
      {score !== undefined && (
        <>
          <p>Final Score: {score}</p>
          <p>Level Reached: {level}</p>
        </>
      )}
      <button onClick={onClick} style={{
        marginTop: 16,
        backgroundColor: '#3b82f6',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer'
      }}>{buttonText}</button>
    </div>
  </div>
);

export default App;
