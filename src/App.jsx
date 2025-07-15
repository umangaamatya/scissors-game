import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './index.css';

const App = () => {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [scissors, setScissors] = useState({ x: 50, y: 50, isMoving: false, direction: 1 });
  const [hairs, setHairs] = useState([]);
  const [particles, setParticles] = useState([]);

  
  const generateHair = useCallback(() => {
    const newHair = {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - 100) + 100,
      y: -20,
      speed: Math.random() * 2 + 1,
      color: ['#8B4513', '#A0522D', '#D2691E', '#F4A460', '#000000'][Math.floor(Math.random() * 5)],
      length: Math.random() * 40 + 20
    };
    return newHair;
  }, []);


  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
     
      setScissors(prev => {
        if (prev.isMoving) {
         
          const newX = prev.x + 8;
          if (newX > window.innerWidth) {
            return { ...prev, x: 50, isMoving: false };
          }
          return { ...prev, x: newX };
        } else {
          
          let newY = prev.y + (prev.direction * 3);
          let newDirection = prev.direction;

          if (newY <= 20) {
            newY = 20;
            newDirection = 1;
          } else if (newY >= window.innerHeight - 20) {
            newY = window.innerHeight - 20;
            newDirection = -1;
          }

          return { ...prev, y: newY, direction: newDirection };
        }
      });

      
      setHairs(prev => prev.map(hair => ({
        ...hair,
        y: hair.y + hair.speed
      })).filter(hair => hair.y < window.innerHeight + 50));



      
      if (Math.random() < 0.02) {
        setHairs(prev => [...prev, generateHair()]);
      }


      setHairs(prev => {
        const missedHairs = prev.filter(hair => hair.y > window.innerHeight - 10);
        if (missedHairs.length > 0) {
          setLives(currentLives => {
            const newLives = currentLives - missedHairs.length;
            if (newLives <= 0) {
              setGameState('gameOver');
            }
            return Math.max(0, newLives);
          });
        }
        return prev.filter(hair => hair.y <= window.innerHeight - 10);
      });

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 1
      })).filter(p => p.life > 0));

    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, generateHair]);


  const handleClick = useCallback(() => {
    if (gameState !== 'playing') return;
    
    if (!scissors.isMoving) {
      setScissors(prev => ({ ...prev, isMoving: true }));
    }
  }, [gameState, scissors.isMoving]);


  useEffect(() => {
    if (gameState !== 'playing' || !scissors.isMoving) return;

    const collisionCheck = setInterval(() => {
      setHairs(prev => {
        const newHairs = [];
        let hitCount = 0;
        
        prev.forEach(hair => {
          const dx = hair.x - scissors.x;
          const dy = hair.y - scissors.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 25) {
           
            hitCount++;
            for (let i = 0; i < 5; i++) {
              setParticles(p => [...p, {
                id: Date.now() + Math.random(),
                x: hair.x,
                y: hair.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: hair.color,
                life: 30
              }]);
            }
          } else {
            newHairs.push(hair);
          }
        });
        if (hitCount > 0) setScore(prev => prev + hitCount * 10);
        return newHairs;
      });
    }, 16);

    return () => clearInterval(collisionCheck);
  }, [gameState, scissors.isMoving, scissors.x, scissors.y]);


  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setHairs([]);
    setParticles([]);
    setScissors({ x: 50, y: 50, isMoving: false, direction: 1 });
  };

  
  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLives(3);
    setHairs([]);
    setParticles([]);
    setScissors({ x: 50, y: 50, isMoving: false, direction: 1 });
  };

  return (
    <div className="game-container bg-gradient-to-b from-sky-200 to-sky-100" onClick={handleClick}>
      <div className="score absolute top-4 left-4 text-xl font-bold">Score: {score}</div>
      <div className="lives absolute top-4 right-4 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-red-500' : 'bg-gray-300'}`}></div>
        ))}
      </div>



      {gameState === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <h1 className="text-3xl font-bold mb-4">The New Barber</h1>
            <p className="mb-4 text-gray-600">Tap to start cutting falling hair!</p>
            <button onClick={startGame} className="bg-blue-500 text-white px-4 py-2 rounded">Start Game</button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Game Over!</h1>
            <p className="mb-4 text-gray-600">Final Score: {score}</p>
            <button onClick={resetGame} className="bg-blue-500 text-white px-4 py-2 rounded">Play Again</button>
          </div>
        </div>
      )}

      <div className="scissors" style={{ left: scissors.x, top: scissors.y }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="8" cy="20" r="3" fill="black" />
          <path d="M5 15 L25 20 L5 25 Z M25 20 L35 15 L35 25 Z" fill="black" />
        </svg>
      </div>


      {hairs.map(hair => (
        <div key={hair.id} className="hair-strand" style={{ left: hair.x, top: hair.y, height: hair.length, backgroundColor: hair.color }} />
      ))}

      {particles.map(p => (
        <div key={p.id} className="particle" style={{ left: p.x, top: p.y, backgroundColor: p.color, opacity: p.life / 30 }}></div>
      ))}


      {gameState === 'playing' && (
        <div className="instruction absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-800">Tap anywhere to slice!</div>
      )}
    </div>
  );
};

export default App;