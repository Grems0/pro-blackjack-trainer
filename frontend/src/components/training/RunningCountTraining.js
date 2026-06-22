import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Pause, Play, BookOpen, X } from 'lucide-react';
import SessionResults from './SessionResults';
import { useGame } from '../../contexts/GameContext';
import { generateDeck, shuffleDeck, getHiLoValue } from '../../data/mockData';
import StrategyCharts from '../charts/StrategyCharts';

// Card Component matching the design
function Card({ card, style = {}, className = '', isDealing = false }) {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  
  const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-gray-900',
    spades: 'text-gray-900'
  };
  
  return (
    <div 
      className={`relative bg-white rounded-xl shadow-2xl transition-all duration-500 ${isDealing ? 'animate-deal' : ''} ${className}`}
      style={{ width: '100px', height: '140px', ...style }}
    >
      {/* Top left */}
      <div className={`absolute top-2 left-2 ${suitColors[card.suit]}`}>
        <div className="text-lg font-bold leading-none">{card.value}</div>
        <div className="text-base leading-none">{suitSymbols[card.suit]}</div>
      </div>
      
      {/* Center symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${suitColors[card.suit]}`}>
        <span className="text-5xl">{suitSymbols[card.suit]}</span>
      </div>
      
      {/* Bottom right (rotated) */}
      <div className={`absolute bottom-2 right-2 rotate-180 ${suitColors[card.suit]}`}>
        <div className="text-lg font-bold leading-none">{card.value}</div>
        <div className="text-base leading-none">{suitSymbols[card.suit]}</div>
      </div>
    </div>
  );
}

// Progress Panel Component
function ProgressPanel({ stats, timer, rounds, decksCompleted, totalDecks }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  
  return (
    <div className="bg-[#2a2a2d] rounded-lg p-5">
      <h3 className="text-gray-400 text-lg font-semibold mb-4">Progress</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Timer */}
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
          </svg>
          <span className="text-white text-xl font-bold">{formatTime(timer)}</span>
        </div>
        
        {/* Precision */}
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span className="text-white text-xl font-bold">{stats.correct}/{stats.total}</span>
        </div>
        
        {/* Decks */}
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          <span className="text-white text-xl font-bold">{decksCompleted}/{totalDecks}D</span>
        </div>
        
        {/* Accuracy */}
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-white text-xl font-bold">{accuracy}%</span>
        </div>
        
        {/* Rounds */}
        <div className="flex items-center gap-3 col-span-2">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <span className="text-white text-xl font-bold">{rounds} rounds</span>
        </div>
      </div>
    </div>
  );
}

// Feedback Modal Component
function FeedbackModal({ type, userAnswer, correctAnswer, onDismiss }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2d] rounded-xl p-8 max-w-sm w-full mx-4 text-center">
        {type === 'correct' ? (
          <>
            {/* Correct Icon */}
            <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">CORRECT</h2>
          </>
        ) : (
          <>
            {/* Wrong Icon */}
            <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-b from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white text-5xl font-bold">!</span>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">WRONG</h2>
          </>
        )}
        
        <p className="text-gray-300 text-lg mb-2">
          Your Answer: <span className={type === 'correct' ? 'text-emerald-400' : 'text-red-400'}>{userAnswer}</span>
        </p>
        <p className={`text-3xl font-bold mb-6 text-emerald-500`}>
          {correctAnswer > 0 ? '+' : ''}{correctAnswer}
        </p>
        
        <button
          onClick={onDismiss}
          className="w-full py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// Count Input Modal
function CountInputModal({ onSubmit, onCancel }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = () => {
    if (value !== '') {
      onSubmit(parseInt(value));
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2d] rounded-xl p-8 max-w-sm w-full mx-4 text-center">
        <h2 className="text-white text-xl font-bold mb-6">Quel est le Running Count ?</h2>
        
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full bg-[#1a1a1d] border border-gray-600 rounded-lg px-4 py-4 text-white text-center text-3xl mb-6 focus:border-emerald-500 focus:outline-none"
          placeholder="0"
        />
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RunningCountTraining() {
  const navigate = useNavigate();
  const { tableRules, currentModule } = useGame();
  const [showChart, setShowChart] = useState(false);
  
  // Get settings from module config or use defaults
  const moduleConfig = currentModule?.config || {};
  const speed = moduleConfig.speed ? (11 - moduleConfig.speed) * 300 : 2500; // Slower by default
  const askEveryN = moduleConfig.askEvery || 5;
  
  // Game state
  const [deck, setDeck] = useState([]);
  const [dealerCard, setDealerCard] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [runningCount, setRunningCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [decksCompleted, setDecksCompleted] = useState(0);
  
  // Animation states
  const [dealingPhase, setDealingPhase] = useState('idle'); // 'idle', 'dealer', 'player1', 'player2', 'done'
  const [dealingCard, setDealingCard] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [rcMistakes, setRcMistakes] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Modal states
  const [showCountInput, setShowCountInput] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Round tracking
  const [cardsDealtInRound, setCardsDealtInRound] = useState(0);
  
  const totalDecks = tableRules.numberOfDecks;
  
  // Initialize deck
  const initializeDeck = useCallback(() => {
    const newDeck = shuffleDeck(generateDeck(totalDecks));
    setDeck(newDeck);
    setDealerCard(null);
    setPlayerCards([]);
    setRunningCount(0);
    setCardsDealtInRound(0);
    setDealingPhase('idle');
  }, [totalDecks]);
  
  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);
  
  // Timer
  useEffect(() => {
    let interval;
    if (isPlaying && !showCountInput && !feedback) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, showCountInput, feedback]);
  
  // Dealing animation sequence
  const dealRound = useCallback(() => {
    if (deck.length < 3 || dealingPhase !== 'idle') return;
    
    const cardsToUse = deck.slice(0, 3);
    const newDeck = deck.slice(3);
    
    // Phase 1: Deal dealer card (with delay)
    setDealingPhase('dealer');
    setTimeout(() => {
      setDealerCard(cardsToUse[0]);
      setRunningCount(prev => prev + getHiLoValue(cardsToUse[0]));
      
      // Phase 2: Deal first player card (with delay)
      setTimeout(() => {
        setDealingPhase('player1');
        setPlayerCards([cardsToUse[1]]);
        setRunningCount(prev => prev + getHiLoValue(cardsToUse[1]));
        
        // Phase 3: Deal second player card (with delay)
        setTimeout(() => {
          setDealingPhase('player2');
          setPlayerCards([cardsToUse[1], cardsToUse[2]]);
          setRunningCount(prev => prev + getHiLoValue(cardsToUse[2]));
          
          // Finish dealing
          setTimeout(() => {
            setDealingPhase('done');
            setDeck(newDeck);
            setRounds(prev => prev + 1);
            
            setCardsDealtInRound(prev => {
              const newCount = prev + 1;
              if (newCount >= askEveryN) {
                setIsPlaying(false);
                setShowCountInput(true);
                return 0;
              }
              return newCount;
            });
            
            // Reset for next round
            setTimeout(() => {
              setDealingPhase('idle');
            }, 800);
            
          }, 600);
        }, 600);
      }, 600);
    }, 400);
    
  }, [deck, dealingPhase, askEveryN]);
  
  // Auto-deal when playing
  useEffect(() => {
    if (!isPlaying || showCountInput || feedback || dealingPhase !== 'idle') return;
    
    // Check if need to reshuffle
    if (deck.length < 3) {
      initializeDeck();
      setDecksCompleted(prev => prev + 1);
      return;
    }
    
    const timeout = setTimeout(() => {
      dealRound();
    }, speed);
    
    return () => clearTimeout(timeout);
  }, [isPlaying, showCountInput, feedback, dealingPhase, deck.length, speed, dealRound, initializeDeck]);
  
  const handleCountSubmit = (userAnswer) => {
    setShowCountInput(false);
    const isCorrect = userAnswer === runningCount;
    
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      total: prev.total + 1
    }));
    if (!isCorrect) {
      setRcMistakes(prev => [...prev, { userAnswer, correctAnswer: runningCount }]);
    }
    
    setFeedback({
      type: isCorrect ? 'correct' : 'incorrect',
      userAnswer,
      correctAnswer: runningCount
    });
  };
  
  const handleDismissFeedback = () => {
    setFeedback(null);
    setIsPlaying(true);
  };
  
  const resetGame = () => {
    initializeDeck();
    setTimer(0);
    setRounds(0);
    setDecksCompleted(0);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setRcMistakes([]);
    setShowResults(false);
    setIsPlaying(false);
  };
  
  if (showResults) {
    return (
      <SessionResults
        moduleName="Running Count"
        accentColor="#4ade80"
        stats={{ correct: stats.correct, incorrect: stats.incorrect, total: stats.total }}
        timeSeconds={timer}
        rcMistakes={rcMistakes}
        onReplay={resetGame}
        onHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Overlay tableau de stratégie */}
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowChart(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="p-5">
              <StrategyCharts />
            </div>
          </div>
        </div>
      )}

      {/* Casino table background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#1a5c3a',
          backgroundImage: `
            radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
          `
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 bg-black/30 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Running Count</h1>
              <p className="text-sm text-gray-500">Début de l'exercice</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChart(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-semibold hidden sm:inline">Tableaux</span>
            </button>
            <button
              onClick={() => { setIsPlaying(false); setShowResults(true); }}
              disabled={stats.total === 0}
              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Terminer
            </button>
            <button
              onClick={resetGame}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Card Area */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center" style={{ minHeight: '500px' }}>
            {/* Dealer Card (Top) */}
            <div className="mb-20">
              {dealerCard ? (
                <div className="transform transition-all duration-500 ease-out">
                  <Card card={dealerCard} />
                </div>
              ) : (
                <div 
                  className="rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
                  style={{ width: '100px', height: '140px' }}
                >
                  <span className="text-white/40 text-xs">Croupier</span>
                </div>
              )}
            </div>
            
            {/* Player Cards (Bottom) - Side by side with slight overlap */}
            <div className="mb-12">
              {playerCards.length > 0 ? (
                <div className="flex" style={{ marginLeft: '-20px' }}>
                  {playerCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="transform transition-all duration-500 ease-out"
                      style={{
                        marginLeft: idx > 0 ? '-25px' : '0',
                        zIndex: idx,
                        transform: `rotate(${(idx - 0.5) * 8}deg)`
                      }}
                    >
                      <Card card={card} />
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
                  style={{ width: '100px', height: '140px' }}
                >
                  <span className="text-white/40 text-xs">Joueur</span>
                </div>
              )}
            </div>
            
            {/* Interactive Circle (Play/Pause) */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={dealingPhase !== 'idle' && dealingPhase !== 'done'}
              className="w-14 h-14 rounded-full border-2 border-purple-400 bg-purple-500/20 hover:bg-purple-500/40 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-purple-300" />
              ) : (
                <Play className="w-6 h-6 text-purple-300 ml-1" />
              )}
            </button>
          </div>
          
          {/* Progress Panel - Right side */}
          <div className="space-y-6">
            <ProgressPanel
              stats={stats}
              timer={timer}
              rounds={rounds}
              decksCompleted={decksCompleted}
              totalDecks={totalDecks}
            />
            
            {/* Hi-Lo Reference */}
            <div className="bg-[#2a2a2d] rounded-lg p-5">
              <h3 className="text-gray-400 text-lg font-semibold mb-4">Référence Hi-Lo</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-emerald-400 text-2xl font-bold">+1</span>
                  <p className="text-gray-400 text-sm mt-1">2-6</p>
                </div>
                <div>
                  <span className="text-gray-400 text-2xl font-bold">0</span>
                  <p className="text-gray-400 text-sm mt-1">7-9</p>
                </div>
                <div>
                  <span className="text-red-400 text-2xl font-bold">-1</span>
                  <p className="text-gray-400 text-sm mt-1">10-A</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      
      {/* Count Input Modal */}
      {showCountInput && (
        <CountInputModal
          onSubmit={handleCountSubmit}
          onCancel={() => {
            setShowCountInput(false);
            setIsPlaying(true);
          }}
        />
      )}
      
      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          type={feedback.type}
          userAnswer={feedback.userAnswer}
          correctAnswer={feedback.correctAnswer}
          onDismiss={handleDismissFeedback}
        />
      )}
      
      {/* CSS for card dealing animation */}
      <style>{`
        @keyframes dealCard {
          0% {
            opacity: 0;
            transform: translateY(-100px) translateX(100px) rotate(-20deg) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0) scale(1);
          }
        }
        
        .animate-deal {
          animation: dealCard 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
