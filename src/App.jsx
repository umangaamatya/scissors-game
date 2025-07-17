import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [scissors, setScissors] = useState({ y: 100, direction: 1 });
  const [cutLineY, setCutLineY] = useState(null);
  const [windowHeight, setWindowHeight] = useState(600); // Default height

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
    // Returns Y-position (in px) within hair block range
    const hairTop = windowHeight / 2 - 100;
    return Math.floor(hairTop + Math.random() * 180); // hair block height is 200
  }

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setScissors({ y: 100, direction: 1 });
    setCutLineY(generateRandomCutLine());
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setScissors({ y: 100, direction: 1 });
    setCutLineY(generateRandomCutLine());
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const speed = baseSpeed + level * 1; // increase speed with level
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
  }, [gameState, level, windowHeight]);

  const handleClick = useCallback(() => {
    if (gameState !== 'playing') return;

    const diff = Math.abs(scissors.y - cutLineY);
    if (diff < 15) {
      // Successful cut
      setScore(prev => prev + 10);
      setLevel(prev => prev + 1);
      setCutLineY(generateRandomCutLine());
    } else {
      // Optional: do nothing or fail feedback
    }
  }, [scissors.y, cutLineY, gameState]);

  // Simple scissors SVG component
  const ScissorsIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="text-gray-700">
      <path
        fill="currentColor"
        d="M12 4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 18c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      />
      <path
        fill="currentColor"
        d="M28.5 16.5L16 20l12.5 3.5c1.4.4 2.8-.4 3.2-1.8.4-1.4-.4-2.8-1.8-3.2z"
      />
    </svg>
  );

  return (
    <div className="game-container bg-gradient-to-b from-sky-200 to-sky-100 min-h-screen relative overflow-hidden" onClick={handleClick}>
      {/* HUD */}
      <div className="absolute top-4 left-4 text-lg font-bold text-gray-800">Score: {score}</div>
      <div className="absolute top-4 right-4 text-lg font-bold text-gray-800">Level: {level}</div>

      {/* Scissors */}
      <div className="absolute left-4" style={{ top: scissors.y }}>
        <ScissorsIcon />
      </div>

      {/* Hair Block (Mocked Person) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
        {/* Head (optional) */}
        <div className="w-20 h-20 rounded-full bg-yellow-300 mb-1 shadow-md"></div>
        {/* Hair */}
        <div className="relative w-20 h-52 bg-amber-800 rounded-b-3xl overflow-hidden shadow-lg">
          {/* Dotted cut line */}
          {cutLineY !== null && (
            <div
              className="absolute w-full border-t-2 border-dotted border-white"
              style={{ top: `${cutLineY - (windowHeight / 2 - 100)}px` }}
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 bg-white bg-opacity-80 px-4 py-2 rounded-lg">
          Tap when scissors align with the dotted line!
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 text-center w-[80%] max-w-md">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">The New Barber</h1>
            <p className="mb-4 text-gray-600">Tap when the scissors align with the dotted line to cut the hair!</p>
            <button onClick={startGame} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Game Over!</h1>
            <p className="mb-4 text-gray-600">Final Score: {score}</p>
            <button onClick={resetGame} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;