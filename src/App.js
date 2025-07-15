import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './index.css';

const HairNinjaGame = () => {
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [scissors, setScissors] = useState({ x: 50, y: 50, isMoving: false, direction: 1 });
  const [hairs, setHairs] = useState([]);
  const [particles, setParticles] = useState([]);

  // Generate random hair
  const generateHair = useCallback(() => {
    const newHair = {
      id: Date.now() + Math.random(),
      x: Math.random() * 700 + 100, // Random position across screen
      y: -20,
      speed: Math.random() * 2 + 1,
      color: ['#8B4513', '#A0522D', '#D2691E', '#F4A460', '#000000'][Math.floor(Math.random() * 5)],
      length: Math.random() * 40 + 20
    };
    return newHair;
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Move scissors up and down
      setScissors(prev => {
        if (prev.isMoving) {
          // Moving horizontally across screen
          const newX = prev.x + 8;
          if (newX > 800) {
            return { ...prev, x: 50, isMoving: false };
          }
          return { ...prev, x: newX };
        } else {
          // Moving vertically up and down the entire screen
          let newY = prev.y + (prev.direction * 3);
          let newDirection = prev.direction;
          
          // Bounce at screen boundaries
          if (newY <= 20) {
            newY = 20;
            newDirection = 1;
          } else if (newY >= 580) {
            newY = 580;
            newDirection = -1;
          }
          
          return { ...prev, y: newY, direction: newDirection };
        }
      });

      // Move hairs down
      setHairs(prev => prev.map(hair => ({
        ...hair,
        y: hair.y + hair.speed
      })).filter(hair => hair.y < 650));

      // Generate new hair occasionally
      if (Math.random() < 0.02) {
        setHairs(prev => [...prev, generateHair()]);
      }

      // Remove missed hairs and reduce lives
      setHairs(prev => {
        const missedHairs = prev.filter(hair => hair.y > 600);
        if (missedHairs.length > 0) {
          setLives(currentLives => {
            const newLives = currentLives - missedHairs.length;
            if (newLives <= 0) {
              setGameState('gameOver');
            }
            return Math.max(0, newLives);
          });
        }
        return prev.filter(hair => hair.y <= 600);
      });

      // Update particles
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1
      })).filter(particle => particle.life > 0));

    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gameState, generateHair]);

  // Handle scissors movement and collision
  const handleClick = useCallback(() => {
    if (gameState !== 'playing') return;
    
    if (!scissors.isMoving) {
      setScissors(prev => ({ ...prev, isMoving: true }));
    }
  }, [gameState, scissors.isMoving]);

  // Check for collisions continuously while scissors are moving
  useEffect(() => {
    if (gameState !== 'playing' || !scissors.isMoving) return;

    const checkCollisions = () => {
      setHairs(prev => {
        const newHairs = [];
        let hitCount = 0;
        
        prev.forEach(hair => {
          const distance = Math.sqrt(
            Math.pow(hair.x - scissors.x, 2) + 
            Math.pow(hair.y - scissors.y, 2)
          );
          
          if (distance < 25) {
            // Hair cut! Create particles
            hitCount++;
            for (let i = 0; i < 5; i++) {
              setParticles(prevParticles => [...prevParticles, {
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
        
        if (hitCount > 0) {
          setScore(prev => prev + hitCount * 10);
        }
        
        return newHairs;
      });
    };

    const collisionInterval = setInterval(checkCollisions, 16);
    return () => clearInterval(collisionInterval);
  }, [gameState, scissors.isMoving, scissors.x, scissors.y]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setHairs([]);
    setParticles([]);
    setScissors({ x: 50, y: 50, isMoving: false, direction: 1 });
  };

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLives(3);
    setHairs([]);
    setParticles([]);
    setScissors({ x: 50, y: 50, isMoving: false, direction: 1 });
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 to-sky-100 relative overflow-hidden" onClick={handleClick}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Game UI */}
      <div className="absolute top-4 left-4 text-2xl font-bold text-gray-800 z-10">
        Score: {score}
      </div>
      
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <span className="text-xl font-bold text-gray-800">Lives:</span>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full ${
              i < lives ? 'bg-red-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Game Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">The New Barber</h1>
        <p className="text-xl text-gray-600 mb-8">Cut the falling hair with perfect timing!</p>
      </div>

      {/* Game Start/Over Screen */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Cut Some Hair?</h2>
            <p className="text-gray-600 mb-6">Click to move the scissors across the screen and cut the falling hair!</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl text-gray-600 mb-2">Final Score: {score}</p>
            <p className="text-gray-600 mb-6">You let too much hair fall!</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Scissors */}
      <div
        className="absolute transition-all duration-100 z-10"
        style={{
          left: `${scissors.x}px`,
          top: `${scissors.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
          {/* Scissors SVG */}
          <svg width="40" height="40" viewBox="0 0 40 40" className="text-gray-700">
            <path
              d="M5 15 L25 20 L5 25 Z M25 20 L35 15 L35 25 Z"
              fill="currentColor"
            />
            <circle cx="8" cy="20" r="3" fill="currentColor" />
            <path
              d="M25 20 L35 20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          {/* Motion trail effect */}
          {scissors.isMoving && (
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-30 animate-ping"></div>
          )}
        </div>
      </div>

      {/* Hair strands */}
      {hairs.map(hair => (
        <div
          key={hair.id}
          className="absolute rounded-full"
          style={{
            left: `${hair.x}px`,
            top: `${hair.y}px`,
            width: '4px',
            height: `${hair.length}px`,
            backgroundColor: hair.color,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: '3px',
            height: '3px',
            backgroundColor: particle.color,
            opacity: particle.life / 30
          }}
        />
      ))}

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-10">
          <p className="text-gray-700 bg-white bg-opacity-80 px-4 py-2 rounded-lg">
            Click to send scissors across the screen!
          </p>
        </div>
      )}
    </div>
  );
};

export default HairNinjaGame;