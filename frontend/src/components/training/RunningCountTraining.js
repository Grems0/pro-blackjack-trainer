import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, BookOpen, X, Lock } from 'lucide-react';
import SessionResults from './SessionResults';
import { useGame } from '../../contexts/GameContext';
import { generateDeck, shuffleDeck, getHiLoValue } from '../../data/mockData';
import StrategyCharts from '../charts/StrategyCharts';
import { useProAccess } from '../../hooks/useProAccess';

// ── Carte individuelle ───────────────────────────────────────────────────────
function Card({ card, faceDown = false, animating = false, small = false }) {
  const suits = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  const red   = card && (card.suit === 'hearts' || card.suit === 'diamonds');
  const w = small ? 62 : 74;
  const h = small ? 88 : 104;

  return (
    <div style={{
      width: w, height: h,
      borderRadius: 7,
      background: faceDown
        ? 'linear-gradient(135deg,#1a4a8a,#0d2d5a)'
        : '#fafaf5',
      border: faceDown ? '2px solid #2a5a9a' : '1px solid #ddd',
      boxShadow: '0 4px 14px rgba(0,0,0,0.55)',
      position: 'relative',
      flexShrink: 0,
      opacity: animating ? 0 : 1,
      transform: animating ? 'translate(180px,-160px) rotate(12deg) scale(0.5)' : 'translate(0,0) rotate(0) scale(1)',
      transition: animating ? 'none' : 'opacity 0.4s ease, transform 0.42s cubic-bezier(0.22,0.68,0,1.2)',
    }}>
      {faceDown ? (
        /* Dos de carte */
        <div style={{
          position: 'absolute', inset: 4, borderRadius: 4,
          background: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.07) 0,rgba(255,255,255,0.07) 1px,transparent 1px,transparent 8px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}/>
      ) : card ? (
        <>
          <div style={{ position: 'absolute', top: 4, left: 6, lineHeight: 1, color: red ? '#c0392b' : '#1a1a1a' }}>
            <div style={{ fontSize: small ? 11 : 13, fontWeight: 900 }}>{card.value}</div>
            <div style={{ fontSize: small ? 10 : 11 }}>{suits[card.suit]}</div>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: red ? '#c0392b' : '#1a1a1a' }}>
            <span style={{ fontSize: small ? 22 : 28 }}>{suits[card.suit]}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 4, right: 6, lineHeight: 1, color: red ? '#c0392b' : '#1a1a1a', transform: 'rotate(180deg)' }}>
            <div style={{ fontSize: small ? 11 : 13, fontWeight: 900 }}>{card.value}</div>
            <div style={{ fontSize: small ? 10 : 11 }}>{suits[card.suit]}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ── Spot joueur ──────────────────────────────────────────────────────────────
function PlayerSpot({ cards, animatingIdx, label, isYou }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 100 }}>
      {/* Cartes */}
      <div style={{ display: 'flex', gap: -8, position: 'relative', height: 104 }}>
        {cards.length === 0 ? (
          <div style={{
            width: 74, height: 104, borderRadius: 7,
            border: '1.5px dashed rgba(255,255,255,0.12)',
          }}/>
        ) : (
          cards.map((c, i) => (
            <div key={i} style={{ marginLeft: i > 0 ? -18 : 0, zIndex: i }}>
              <Card card={c} animating={animatingIdx === i}/>
            </div>
          ))
        )}
      </div>
      {/* Étiquette */}
      <div style={{
        background: isYou ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isYou ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 20, padding: '3px 12px',
      }}>
        <span style={{ color: isYou ? '#c9a84c' : 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: isYou ? 700 : 400, letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Modal saisie du RC ───────────────────────────────────────────────────────
function CountInputModal({ onSubmit }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => { if (value !== '') onSubmit(parseInt(value)); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 20, padding: '32px 28px', maxWidth: 340, width: '90%', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 12px' }}>Running Count</p>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 24px' }}>Quel est le RC ?</h2>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="0"
          style={{
            width: '100%', padding: '16px', background: '#0a0a0a',
            border: '1px solid #2a2a2a', borderRadius: 12, color: '#fff',
            fontSize: 32, textAlign: 'center', outline: 'none',
            fontWeight: 800, marginBottom: 20, boxSizing: 'border-box',
          }}
        />
        <button onClick={submit} style={{
          width: '100%', padding: '14px', borderRadius: 12,
          background: 'linear-gradient(135deg,#4ade80,#16a34a)',
          border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer',
        }}>
          Valider →
        </button>
      </div>
    </div>
  );
}

// ── Modal feedback ───────────────────────────────────────────────────────────
function FeedbackModal({ correct, userAnswer, correctAnswer, onDismiss }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#111', border: `1px solid ${correct ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 20, padding: '32px 28px', maxWidth: 320, width: '90%', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: correct ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
          border: `2px solid ${correct ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          {correct ? '✓' : '✗'}
        </div>
        <h2 style={{ color: correct ? '#4ade80' : '#f87171', fontSize: 22, fontWeight: 900, margin: '0 0 12px' }}>
          {correct ? 'Correct' : 'Incorrect'}
        </h2>
        {!correct && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 4px' }}>
            Votre réponse : <span style={{ color: '#f87171', fontWeight: 700 }}>{userAnswer > 0 ? `+${userAnswer}` : userAnswer}</span>
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, margin: '0 0 24px' }}>
          RC : <span style={{ color: '#4ade80', fontWeight: 800, fontSize: 24 }}>{correctAnswer > 0 ? `+${correctAnswer}` : correctAnswer}</span>
        </p>
        <button onClick={onDismiss} style={{
          width: '100%', padding: '13px', borderRadius: 12,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          Continuer →
        </button>
      </div>
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function RunningCountTraining() {
  const navigate = useNavigate();
  const isPro = useProAccess();
  const { tableRules, currentModule } = useGame();
  const [showChart, setShowChart] = useState(false);
  const [showProMsg, setShowProMsg] = useState(false);

  const savedConfig  = JSON.parse(localStorage.getItem('trainingModuleConfig') || '{}');
  const moduleConfig = currentModule?.config || savedConfig.config || {};
  const dealDelay    = moduleConfig.speed ? (11 - moduleConfig.speed) * 200 : 500;
  const askEveryN    = moduleConfig.askEvery || 4;
  const totalDecks = tableRules.numberOfDecks;

  // ── State du jeu ──────────────────────────────────────────────────────────
  const [deck,          setDeck]          = useState([]);
  const [runningCount,  setRunningCount]  = useState(0);
  const [timer,         setTimer]         = useState(0);
  const [rounds,        setRounds]        = useState(0);
  const [decksCompleted,setDecksCompleted]= useState(0);
  const [stats,         setStats]         = useState({ correct: 0, incorrect: 0, total: 0 });
  const [rcMistakes,    setRcMistakes]    = useState([]);
  const [showResults,   setShowResults]   = useState(false);
  const [showCountInput,setShowCountInput]= useState(false);
  const [feedback,      setFeedback]      = useState(null);
  const [roundsSinceAsk,setRoundsSinceAsk]= useState(0);

  // ── State du tapis ────────────────────────────────────────────────────────
  // 3 spots joueurs + 1 croupier, chacun { cards: [], animatingIdx: null }
  const [dealer, setDealer] = useState({ cards: [], animatingIdx: null });
  const [spots,  setSpots]  = useState([
    { id: 'p1', cards: [], animatingIdx: null },
    { id: 'p2', cards: [], animatingIdx: null },
    { id: 'p3', cards: [], animatingIdx: null },
  ]);

  const [dealing,   setDealing]   = useState(false);
  const [gameActive,setGameActive]= useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  const initDeck = useCallback(() => {
    setDeck(shuffleDeck(generateDeck(totalDecks)));
    setRunningCount(0);
    setDealing(false);
  }, [totalDecks]);

  useEffect(() => { initDeck(); }, [initDeck]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameActive || showCountInput || feedback) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameActive, showCountInput, feedback]);

  // ── Distribuer un round ───────────────────────────────────────────────────
  // Ordre réaliste : P1c1, P2c1, P3c1, Dealer c1, P1c2, P2c2, P3c2, Dealer c2 (face down)
  const dealRound = useCallback((currentDeck, currentRC) => {
    if (currentDeck.length < 8) return;
    setDealing(true);

    const cards = currentDeck.slice(0, 8);
    const remaining = currentDeck.slice(8);

    // Séquence de distribution avec délai
    const sequence = [
      { target: 'p1',     cardIdx: 0, spotCard: 0, faceDown: false },
      { target: 'p2',     cardIdx: 1, spotCard: 0, faceDown: false },
      { target: 'p3',     cardIdx: 2, spotCard: 0, faceDown: false },
      { target: 'dealer', cardIdx: 3, spotCard: 0, faceDown: false },
      { target: 'p1',     cardIdx: 4, spotCard: 1, faceDown: false },
      { target: 'p2',     cardIdx: 5, spotCard: 1, faceDown: false },
      { target: 'p3',     cardIdx: 6, spotCard: 1, faceDown: false },
      { target: 'dealer', cardIdx: 7, spotCard: 1, faceDown: true  },
    ];

    // Vider le tapis d'abord
    setDealer({ cards: [], animatingIdx: null });
    setSpots([
      { id: 'p1', cards: [], animatingIdx: null },
      { id: 'p2', cards: [], animatingIdx: null },
      { id: 'p3', cards: [], animatingIdx: null },
    ]);

    let rc = currentRC;

    sequence.forEach((step, i) => {
      const card = cards[step.cardIdx];

      // Phase animating (carte part du sabot)
      setTimeout(() => {
        if (step.target === 'dealer') {
          setDealer(d => ({ cards: d.cards, animatingIdx: step.spotCard }));
        } else {
          setSpots(prev => prev.map(s =>
            s.id === step.target ? { ...s, animatingIdx: step.spotCard } : s
          ));
        }
      }, i * dealDelay);

      // Carte posée sur le tapis
      setTimeout(() => {
        if (step.target === 'dealer') {
          setDealer(d => ({
            cards: [...d.cards, { ...card, faceDown: step.faceDown }],
            animatingIdx: null,
          }));
        } else {
          setSpots(prev => prev.map(s =>
            s.id === step.target
              ? { ...s, cards: [...s.cards, card], animatingIdx: null }
              : s
          ));
        }
        // Compter uniquement les cartes visibles
        if (!step.faceDown) {
          rc += getHiLoValue(card);
          setRunningCount(rc);
        }
      }, i * dealDelay + 180);
    });

    // Après la dernière carte
    setTimeout(() => {
      setDeck(remaining);
      setRounds(r => r + 1);
      setDealing(false);

      setRoundsSinceAsk(prev => {
        const next = prev + 1;
        if (next >= askEveryN) {
          setGameActive(false);
          setShowCountInput(true);
          return 0;
        }
        return next;
      });
    }, sequence.length * dealDelay + 300);

  }, [dealDelay, askEveryN]);

  // ── Auto-deal ─────────────────────────────────────────────────────────────
  const deckRef        = useRef(deck);
  const rcRef          = useRef(runningCount);
  const dealingRef     = useRef(dealing);
  const gameActiveRef  = useRef(gameActive);
  const showInputRef   = useRef(showCountInput);
  const feedbackRef    = useRef(feedback);

  useEffect(() => { deckRef.current       = deck;          }, [deck]);
  useEffect(() => { rcRef.current         = runningCount;  }, [runningCount]);
  useEffect(() => { dealingRef.current    = dealing;       }, [dealing]);
  useEffect(() => { gameActiveRef.current = gameActive;    }, [gameActive]);
  useEffect(() => { showInputRef.current  = showCountInput;}, [showCountInput]);
  useEffect(() => { feedbackRef.current   = feedback;      }, [feedback]);

  useEffect(() => {
    if (!gameActive || dealing || showCountInput || feedback) return;
    if (deck.length < 8) {
      initDeck();
      setDecksCompleted(d => d + 1);
      return;
    }
    const id = setTimeout(() => {
      if (gameActiveRef.current && !dealingRef.current && !showInputRef.current && !feedbackRef.current) {
        dealRound(deckRef.current, rcRef.current);
      }
    }, 800);
    return () => clearTimeout(id);
  }, [gameActive, dealing, showCountInput, feedback, deck.length, dealRound, initDeck]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCountSubmit = (answer) => {
    setShowCountInput(false);
    const ok = answer === runningCount;
    setStats(s => ({ correct: s.correct + (ok ? 1 : 0), incorrect: s.incorrect + (ok ? 0 : 1), total: s.total + 1 }));
    if (!ok) setRcMistakes(m => [...m, { userAnswer: answer, correctAnswer: runningCount }]);
    setFeedback({ correct: ok, userAnswer: answer, correctAnswer: runningCount });
  };

  const handleDismiss = () => { setFeedback(null); setGameActive(true); };

  const reset = () => {
    initDeck();
    setTimer(0); setRounds(0); setDecksCompleted(0);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setRcMistakes([]); setShowResults(false);
    setGameActive(false); setRoundsSinceAsk(0);
    setDealer({ cards: [], animatingIdx: null });
    setSpots([
      { id: 'p1', cards: [], animatingIdx: null },
      { id: 'p2', cards: [], animatingIdx: null },
      { id: 'p3', cards: [], animatingIdx: null },
    ]);
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Résultats ─────────────────────────────────────────────────────────────
  if (showResults) {
    return (
      <SessionResults
        moduleName="Running Count"
        accentColor="#4ade80"
        stats={{ correct: stats.correct, incorrect: stats.incorrect, total: stats.total }}
        timeSeconds={timer}
        rcMistakes={rcMistakes}
        onReplay={reset}
        onHome={() => navigate('/training')}
      />
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#0a1a0e' }}>

      {/* ── Tapis de casino ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, #1a5c35 0%, #0f3d22 50%, #071508 100%)',
      }}/>
      {/* Texture feutre */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}/>
      {/* Arc du tapis (bord de table) */}
      <div style={{
        position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
        width: '120%', height: 200,
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        border: '3px solid rgba(201,168,76,0.25)',
        borderBottom: 'none',
        pointerEvents: 'none',
      }}/>

      {/* ── Modals ── */}
      {showProMsg && (
        <div onClick={() => setShowProMsg(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: '28px 24px', maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <Lock size={24} color="#c9a84c" style={{ marginBottom: 12 }}/>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>Tableaux réservés aux abonnés</h3>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>Accédez aux tableaux de stratégie avec un abonnement Pro.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowProMsg(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid #2a2a2a', color: '#888', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Fermer</button>
              <button onClick={() => navigate('/pricing')} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a84c,#a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Voir les offres →</button>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '24px 16px' }}>
          <div style={{ background: '#1a1a1d', borderRadius: 20, border: '1px solid #333', width: '100%', maxWidth: 480, position: 'relative' }}>
            <button onClick={() => setShowChart(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
              <X size={18} color="#fff"/>
            </button>
            <div style={{ padding: 20 }}><StrategyCharts /></div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/training')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
              <ArrowLeft size={18} color="#fff"/>
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Running Count</h1>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>
                {gameActive ? `Round ${rounds + 1}` : 'Appuyez sur Distribuer'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Timer */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt(timer)}</span>
            </div>
            {/* Précision */}
            {stats.total > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: accuracy >= 80 ? '#4ade80' : accuracy >= 60 ? '#fbbf24' : '#f87171', fontSize: 15, fontWeight: 700 }}>{accuracy}%</span>
              </div>
            )}
            <button onClick={() => isPro ? setShowChart(true) : setShowProMsg(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', cursor: 'pointer' }}>
              {isPro ? <BookOpen size={15} color="#c9a84c"/> : <Lock size={15} color="#c9a84c"/>}
              <span style={{ color: '#c9a84c', fontSize: 13, fontWeight: 600 }}>Tableaux</span>
            </button>
            <button onClick={() => { setGameActive(false); setShowResults(true); }}
              disabled={stats.total === 0}
              style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: stats.total === 0 ? 0.3 : 1 }}>
              Terminer
            </button>
            <button onClick={reset} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
              <RotateCcw size={17} color="#fff"/>
            </button>
          </div>
        </div>
      </header>

      {/* ── Tapis principal ── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Zone croupier */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 48 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 16px' }}>Croupier</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {dealer.cards.length === 0 ? (
              <>
                <div style={{ width: 74, height: 104, borderRadius: 7, border: '1.5px dashed rgba(255,255,255,0.1)' }}/>
                <div style={{ width: 74, height: 104, borderRadius: 7, border: '1.5px dashed rgba(255,255,255,0.1)' }}/>
              </>
            ) : (
              dealer.cards.map((c, i) => (
                <div key={i} style={{ marginLeft: i > 0 ? 8 : 0 }}>
                  <Card card={c} faceDown={c.faceDown} animating={dealer.animatingIdx === i}/>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ligne dorée séparatrice */}
        <div style={{ width: '80%', margin: '0 auto 40px', height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)' }}/>

        {/* Spots joueurs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {spots.map((spot, i) => (
            <PlayerSpot
              key={spot.id}
              cards={spot.cards}
              animatingIdx={spot.animatingIdx}
              label={i === 1 ? 'Vous' : `Joueur ${i === 0 ? 1 : 3}`}
              isYou={i === 1}
            />
          ))}
        </div>

        {/* Bouton Distribuer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 52 }}>
          {!gameActive ? (
            <button
              onClick={() => { setGameActive(true); }}
              disabled={dealing}
              style={{
                padding: '16px 52px', borderRadius: 14,
                background: 'linear-gradient(135deg,#c9a84c,#a8823a)',
                border: 'none', color: '#000', fontSize: 15, fontWeight: 800,
                cursor: 'pointer', letterSpacing: '0.05em',
                boxShadow: '0 6px 24px rgba(201,168,76,0.3)',
                opacity: dealing ? 0.5 : 1,
              }}
            >
              ♠ Distribuer
            </button>
          ) : (
            <button
              onClick={() => setGameActive(false)}
              style={{
                padding: '14px 40px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Pause
            </button>
          )}
        </div>

        {/* Stats en bas */}
        {stats.total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { label: 'Rounds', value: rounds },
              { label: 'Corrects', value: stats.correct, color: '#4ade80' },
              { label: 'Erreurs', value: stats.incorrect, color: '#f87171' },
              { label: 'Précision', value: `${accuracy}%`, color: accuracy >= 80 ? '#4ade80' : accuracy >= 60 ? '#fbbf24' : '#f87171' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: s.color || 'rgba(255,255,255,0.7)', fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Référence Hi-Lo */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 32 }}>
          {[['2–6','+1','#4ade80'],['7–9','0','rgba(255,255,255,0.35)'],['10–A','-1','#f87171']].map(([r,v,c]) => (
            <div key={r} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: c, fontSize: 16, fontWeight: 800 }}>{v}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{r}</div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Modals RC ── */}
      {showCountInput && <CountInputModal onSubmit={handleCountSubmit}/>}
      {feedback && (
        <FeedbackModal
          correct={feedback.correct}
          userAnswer={feedback.userAnswer}
          correctAnswer={feedback.correctAnswer}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
