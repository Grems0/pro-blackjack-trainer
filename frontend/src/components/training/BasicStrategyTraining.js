import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, BookOpen, X, RefreshCw, Lock } from 'lucide-react';
import { useDemoMode } from '../../hooks/useDemoMode';
import { useLang } from '../../contexts/LanguageContext';
import SessionResults from './SessionResults';
import { useGame } from '../../contexts/GameContext';
import PlayingCard from '../game/PlayingCard';
import CasinoTable from '../game/CasinoTable';
import StrategyCharts from '../charts/StrategyCharts';
import {
  generateDeck,
  shuffleDeck,
  basicStrategyHardENHCS17,
  basicStrategyHardENHCH17,
  basicStrategySoftENHCS17,
  basicStrategySoftENHCH17,
  basicStrategyPairsENHCDAS,
  basicStrategyPairsENHCNoDAS,
  getCardValue,
  calculateHandTotal,
  isSoftHand
} from '../../data/mockData';

// ACTIONS uses static keys — labels are rendered via t() in the component
const ACTION_KEYS = [
  { key: 'H', tKey: 'bs_action_hit',       color: 'bg-emerald-500 hover:bg-emerald-600' },
  { key: 'S', tKey: 'bs_action_stand',     color: 'bg-red-500 hover:bg-red-600' },
  { key: 'D', tKey: 'bs_action_double',    color: 'bg-blue-500 hover:bg-blue-600' },
  { key: 'P', tKey: 'bs_action_split',     color: 'bg-purple-500 hover:bg-purple-600' },
  { key: 'R', tKey: 'bs_action_surrender', color: 'bg-amber-500 hover:bg-amber-600' }
];

function weightedRandom(items) {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export default function BasicStrategyTraining() {
  const navigate = useNavigate();
  const { isDemo, isPro, demoHandsPlayed, demoLeft, demoExpired, incrementDemoHand, DEMO_LIMIT } = useDemoMode();
  const { t } = useLang();
  const [showProMsg,   setShowProMsg]   = useState(false);
  const [showDemoChart, setShowDemoChart] = useState(false);
  const { tableRules, currentModule } = useGame();

  const savedConfig = (() => { try { return JSON.parse(localStorage.getItem('trainingModuleConfig') || '{}'); } catch { return {}; } })();
  const moduleConfig    = currentModule?.config || savedConfig.config || {};
  const ruleVariant     = moduleConfig.ruleVariant || 'S17';
  const isS17           = ruleVariant === 'S17';
  const surrenderAllowed = moduleConfig.surrenderAllowed === true;

  const LS_KEY = `bs_review_${ruleVariant}`;

  // ─── Review state (persisted) ────────────────────────────────────────────
  const [reviewItems, setReviewItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  });
  const [reviewMode, setReviewMode]       = useState(false);
  const [currentReviewKey, setCurrentReviewKey] = useState(null);

  const reviewCount = Object.keys(reviewItems).length;

  const saveReviewItems = (items) => {
    setReviewItems(items);
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  };

  // ─── Session state ────────────────────────────────────────────────────────
  const [playerCards,      setPlayerCards]      = useState([]);
  const [dealerCard,       setDealerCard]        = useState(null);
  const [feedback,         setFeedback]          = useState(null);
  const [showChart,        setShowChart]         = useState(false);
  const [showSummary,      setShowSummary]       = useState(false);
  const [stats,            setStats]             = useState({ correct: 0, incorrect: 0 });
  const [mistakes,         setMistakes]          = useState([]);
  const [lastCorrectAction,setLastCorrectAction] = useState(null);
  const [mode,             setMode]              = useState(moduleConfig.mode || 'all');
  const [sessionTime,      setSessionTime]       = useState(0);
  const startTimeRef = useRef(Date.now());

  // ─── Generate random hand ────────────────────────────────────────────────
  const generateHand = useCallback(() => {
    const deck = shuffleDeck(generateDeck(1));
    let player = [];

    if (mode === 'pairs') {
      const values = ['2','3','4','5','6','7','8','9','10','A'];
      const pairValue = values[Math.floor(Math.random() * values.length)];
      player = [
        { value: pairValue, suit: 'hearts', id: '1' },
        { value: pairValue, suit: 'spades', id: '2' }
      ];
    } else if (mode === 'soft') {
      const values = ['2','3','4','5','6','7','8','9'];
      player = [
        { value: 'A',  suit: 'hearts', id: '1' },
        { value: values[Math.floor(Math.random() * values.length)], suit: 'spades', id: '2' }
      ];
    } else if (mode === 'hard') {
      let attempts = 0;
      do {
        player = [deck.pop(), deck.pop()];
        attempts++;
      } while ((isSoftHand(player) || player[0].value === player[1].value) && attempts < 20);
    } else {
      player = [deck.pop(), deck.pop()];
    }

    const dealer = deck.pop();
    setPlayerCards(player);
    setDealerCard(dealer);
    setFeedback(null);
    setLastCorrectAction(null);
    setCurrentReviewKey(null);
  }, [mode]);

  // ─── Generate review hand (weighted) ─────────────────────────────────────
  const generateReviewHand = useCallback(() => {
    const items = Object.values(reviewItems);
    if (!items.length) { setReviewMode(false); generateHand(); return; }
    const picked = weightedRandom(items);
    setPlayerCards(picked.playerCards);
    setDealerCard(picked.dealerCard);
    setFeedback(null);
    setLastCorrectAction(null);
    setCurrentReviewKey(picked.reviewKey);
  }, [reviewItems, generateHand]);

  const nextQuestion = useCallback(() => {
    if (reviewMode) generateReviewHand();
    else generateHand();
  }, [reviewMode, generateReviewHand, generateHand]);

  useEffect(() => { generateHand(); }, [generateHand]);

  // ─── Correct action lookup ────────────────────────────────────────────────
  const getCorrectAction = () => {
    if (!playerCards.length || !dealerCard) return null;

    const hardTable  = isS17 ? basicStrategyHardENHCS17 : basicStrategyHardENHCH17;
    const softTable  = isS17 ? basicStrategySoftENHCS17 : basicStrategySoftENHCH17;
    const pairsTable = tableRules.doubleAfterSplit ? basicStrategyPairsENHCDAS : basicStrategyPairsENHCNoDAS;

    const playerTotal = calculateHandTotal(playerCards);
    const dealerValue = dealerCard.value === 'A' ? 'A' :
                        ['10','J','Q','K'].includes(dealerCard.value) ? '10' : dealerCard.value;
    const dealerKey   = dealerValue === 'A' ? 'A' : parseInt(dealerValue) || 10;

    if (playerCards.length === 2 && playerCards[0].value === playerCards[1].value) {
      const pairKey = playerCards[0].value === 'A' ? 'A,A' :
                      ['10','J','Q','K'].includes(playerCards[0].value) ? '10,10' :
                      `${playerCards[0].value},${playerCards[0].value}`;
      if (pairsTable[pairKey]) return pairsTable[pairKey][dealerKey];
    }
    if (isSoftHand(playerCards) && playerTotal <= 20) {
      if (softTable[playerTotal]) return softTable[playerTotal][dealerKey];
    }
    if (hardTable[playerTotal]) return hardTable[playerTotal][dealerKey];
    return 'S';
  };

  // ─── Handle answer ────────────────────────────────────────────────────────
  const handleAction = (action) => {
    if (demoExpired) return;
    const correct = getCorrectAction();
    setLastCorrectAction(correct);
    if (isDemo) incrementDemoHand();

    const normalizedCorrect = correct?.replace('h','').replace('s','')[0];
    const isCorrect = action === normalizedCorrect ||
                      (action === 'R' && (correct === 'Rh' || correct === 'Rs'));

    const dealerDisplay = dealerCard
      ? (['10','J','Q','K'].includes(dealerCard.value) ? '10' : dealerCard.value)
      : '?';
    const currentTotal  = calculateHandTotal(playerCards);
    const currentIsPair = playerCards.length === 2 && playerCards[0]?.value === playerCards[1]?.value;
    const currentIsSoft = isSoftHand(playerCards) && !currentIsPair;

    let handDesc;
    if (currentIsPair) {
      const v = playerCards[0]?.value;
      handDesc = `Pair ${['10','J','Q','K'].includes(v) ? '10' : v}`;
    } else if (currentIsSoft) {
      handDesc = `Soft ${currentTotal} (A + ${currentTotal - 11})`;
    } else {
      handDesc = `Hard ${currentTotal}`;
    }

    if (isCorrect) {
      setFeedback({ type: 'correct' });
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));

      // Review mode: diminuer le poids de l'item
      if (reviewMode && currentReviewKey) {
        const updated = { ...reviewItems };
        if (updated[currentReviewKey]) {
          updated[currentReviewKey].weight -= 1;
          if (updated[currentReviewKey].weight <= 0) delete updated[currentReviewKey];
        }
        saveReviewItems(updated);
      }

      setTimeout(nextQuestion, 900);
    } else {
      // Sauvegarder dans la file de révision
      const rKey = `${handDesc}__${dealerDisplay}`;
      const updated = { ...reviewItems };
      updated[rKey] = {
        reviewKey:   rKey,
        playerCards: playerCards.map(c => ({ ...c })),
        dealerCard:  { ...dealerCard },
        handDesc,
        dealerDisplay,
        weight: Math.min((updated[rKey]?.weight || 0) + 2, 10),
      };
      saveReviewItems(updated);

      setMistakes(prev => [...prev, { handDesc, dealerDisplay, chosenAction: action, correctAction: correct }]);
      setFeedback({ type: 'incorrect', chosenAction: action, correctAction: isDemo ? null : correct });
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const getActionLabel = (action) => ({
    'H':  'Hit',
    'S':  'Stand',
    'D':  'Double',
    'P':  'Split',
    'Rh': 'Surrender or Hit',
    'Rs': 'Surrender or Stand',
    'Ds': 'Double or Stand'
  }[action] || action);

  const playerTotal = calculateHandTotal(playerCards);
  const isPair      = playerCards.length === 2 && playerCards[0]?.value === playerCards[1]?.value;
  const isSoft      = isSoftHand(playerCards);

  // ─── Écran bilan ──────────────────────────────────────────────────────────
  if (showSummary) {
    const counts = {};
    for (const m of mistakes) {
      const key = `${m.handDesc} vs ${m.dealerDisplay}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    const topMistakes = Object.entries(counts)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));

    return (
      <SessionResults
        moduleName="Stratégie de base"
        accentColor="#fcd34d"
        stats={{ correct: stats.correct, incorrect: stats.incorrect, total: stats.correct + stats.incorrect }}
        timeSeconds={sessionTime}
        topMistakes={topMistakes}
        reviewCount={reviewCount}
        onReplay={() => { setShowSummary(false); setStats({ correct: 0, incorrect: 0 }); setMistakes([]); setReviewMode(false); startTimeRef.current = Date.now(); generateHand(); }}
        onReview={reviewCount > 0 ? () => { setShowSummary(false); setStats({ correct: 0, incorrect: 0 }); setMistakes([]); setReviewMode(true); startTimeRef.current = Date.now(); } : undefined}
        onHome={() => navigate('/training')}
      />
    );
  }

  // ─── Jeu principal ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#071508' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, #1a5c35 0%, #0f3d22 50%, #071508 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}/>
      <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '120%', height: 200, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', border: '3px solid rgba(201,168,76,0.2)', borderBottom: 'none', pointerEvents: 'none' }}/>
      {/* Modal Pro — Tableau */}
      {showProMsg && (
        <div onClick={() => setShowProMsg(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: '28px 24px', maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={20} color="#c9a84c" />
            </div>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>{t('bs_pro_table_title')}</h3>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>
              {t('bs_pro_table_desc')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowProMsg(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid #2a2a2a', color: '#888', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {t('rc_close')}
              </button>
              <button onClick={() => navigate('/pricing')} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                {t('rc_see_offers')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall demo — après 10 mains */}
      {demoExpired && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 20, padding: '36px 28px', maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🃏</div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>{t('bs_demo_paywall_title').replace('{n}', DEMO_LIMIT)}</h2>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7, margin: '0 0 8px' }}>
              {t('bs_demo_paywall_desc')}
            </p>
            <p style={{ color: '#c9a84c', fontWeight: 700, fontSize: 14, margin: '0 0 24px' }}>
              {t('bs_demo_paywall_cta')}
            </p>
            <button
              onClick={() => navigate('/pricing')}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 900, fontSize: 15, cursor: 'pointer', marginBottom: 10 }}
            >
              {t('bs_demo_see_offers')}
            </button>
            <button
              onClick={() => navigate('/training')}
              style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid #2a2a2a', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              {t('bs_demo_back_home')}
            </button>
          </div>
        </div>
      )}

      {/* Tableaux floutés en mode demo */}
      {showDemoChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowDemoChart(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="p-5 relative">
              {/* Tableau flou */}
              <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
                <StrategyCharts defaultVariant={ruleVariant} locked />
              </div>
              {/* Overlay cadenas */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'rgba(0,0,0,0.55)', borderRadius: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={24} color="#c9a84c" />
                </div>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, textAlign: 'center', margin: 0 }}>{t('bs_demo_charts_locked')}</p>
                <p style={{ color: '#888', fontSize: 12, textAlign: 'center', margin: 0, maxWidth: 220 }}>{t('bs_demo_charts_desc')}</p>
                <button
                  onClick={() => navigate('/pricing')}
                  style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  {t('bs_demo_charts_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableaux pro (membres) */}
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowChart(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="p-5"><StrategyCharts defaultVariant={ruleVariant} locked /></div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 bg-black/30 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/training')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Basic Strategy</h1>
              <p className="text-sm text-gray-500">
                {reviewMode ? t('bs_revision_mode') : t('bs_session_start')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton révision */}
            {reviewCount > 0 && !reviewMode && (
              <button
                onClick={() => { setReviewMode(true); generateReviewHand(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                title={`${reviewCount} situation${reviewCount > 1 ? 's' : ''} à réviser`}
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-bold">{reviewCount}</span>
              </button>
            )}
            {reviewMode && (
              <button
                onClick={() => { setReviewMode(false); generateHand(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/30 border border-amber-500/60 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                <span className="text-amber-300 text-sm font-bold">{t('bs_review_mode')} {reviewCount > 0 ? `(${reviewCount})` : '✓'}</span>
              </button>
            )}
            {/* Compteur demo */}
            {isDemo && !demoExpired && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700 }}>
                  {t('bs_demo_hand')} {demoHandsPlayed}/{DEMO_LIMIT}
                </span>
                <span style={{ color: '#555', fontSize: 11 }}>·</span>
                <button onClick={() => navigate('/pricing')} style={{ color: '#c9a84c', fontSize: 11, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  {t('bs_demo_signup')}
                </button>
              </div>
            )}

            <button
              onClick={() => isPro ? setShowChart(true) : setShowDemoChart(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
            >
              {isPro ? <BookOpen className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span className="text-amber-300 text-sm font-semibold hidden sm:inline">{t('bs_table_btn')}</span>
            </button>

            <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{ruleVariant}</span>
            <button
              onClick={() => { setSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000)); setShowSummary(true); }}
              disabled={stats.correct + stats.incorrect === 0}
              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('bs_end')}
            </button>
            <button onClick={nextQuestion} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">

        {/* Bannière mode révision */}
        {reviewMode && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-900/30 border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm font-semibold">
                {t('bs_review_mode')} —{' '}
                {reviewCount > 0
                  ? `${reviewCount} ${t('bs_review_remaining')}`
                  : t('bs_review_done')}
              </p>
            </div>
            {reviewCount === 0 && (
              <button onClick={() => { setReviewMode(false); generateHand(); }} className="text-xs text-amber-400 underline">
                {t('bs_back_normal')}
              </button>
            )}
          </div>
        )}

        {/* Bannière d'invitation à réviser (mode normal, items en attente) */}
        {!reviewMode && reviewCount > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-900/20 border border-amber-500/30 flex items-center justify-between gap-3">
            <p className="text-amber-400/80 text-xs">
              <span className="font-bold text-amber-300">{reviewCount}</span> {t('bs_review_from_errors')}
            </p>
            <button
              onClick={() => { setReviewMode(true); generateReviewHand(); }}
              className="text-xs text-amber-400 font-bold underline flex-shrink-0"
            >
              {t('bs_start_review')}
            </button>
          </div>
        )}

        {/* Stats & Mode */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-gray-400 text-sm">{t('bs_correct')}</span>
              <p className="text-2xl font-bold text-emerald-400">{stats.correct}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400 text-sm">{t('bs_wrong_decision')}</span>
              <p className="text-2xl font-bold text-red-400">{stats.incorrect}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400 text-sm">{t('rc_accuracy')}</span>
              <p className="text-2xl font-bold text-amber-400">
                {stats.correct + stats.incorrect > 0
                  ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {!reviewMode && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{t('bs_mode')}</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-[#1a1a1d] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
              >
                <option value="all">{t('modal_all_hands')}</option>
                <option value="hard">{t('modal_hard_hands')}</option>
                <option value="soft">{t('modal_soft_hands')}</option>
                <option value="pairs">{t('modal_pairs')}</option>
              </select>
            </div>
          )}
        </div>

        {/* Table de jeu */}
        <CasinoTable
          inscription="Blackjack pays 3:2"
          subline={isS17 ? 'Dealer must stand on 17' : 'Dealer hits soft 17'}
          glow={feedback?.type === 'correct'}
        >
          <div className="text-center mb-8 mt-6">
            <span className="text-gray-300 text-sm">{t('bs_dealer_card')}</span>
            <div className="flex justify-center mt-3">
              {dealerCard && <PlayingCard key={`d-${dealerCard.value}${dealerCard.suit}`} card={dealerCard} size="lg" dealt />}
            </div>
          </div>

          <div className="border-t border-amber-700/30 my-6" />

          <div className="text-center mb-8">
            <span className="text-gray-300 text-sm">{t('bs_your_hand')}</span>
            <div className="flex justify-center gap-3 mt-3">
              {playerCards.map((card, idx) => (
                <PlayingCard key={`${card.value}${card.suit}${idx}`} card={card} size="lg" dealt dealIndex={idx + 1} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="text-white text-xl font-bold">{t('bs_total')} {playerTotal}</span>
              {isPair && <span className="text-purple-400 text-sm">{t('bs_pair')}</span>}
              {isSoft && !isPair && <span className="text-blue-400 text-sm">{t('bs_soft')}</span>}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mb-6 rounded-lg border ${
              feedback.type === 'correct'
                ? 'bg-emerald-500/20 border-emerald-500/50 p-4 text-center'
                : 'bg-red-500/10 border-red-500/30 p-5'
            }`}>
              {feedback.type === 'correct' ? (
                <p className="text-emerald-400 font-bold text-lg">{t('bs_correct')}</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-400 font-bold text-center mb-3">{t('bs_wrong_decision')}</p>
                  {feedback.correctAction ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2 flex-1 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                        <span className="text-red-400 text-lg">✗</span>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{t('bs_your_choice')}</p>
                          <p className="text-red-300 font-bold">{getActionLabel(feedback.chosenAction)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                        <span className="text-emerald-400 text-lg">✓</span>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{t('bs_good_decision')}</p>
                          <p className="text-emerald-300 font-bold">{getActionLabel(feedback.correctAction)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Mode demo : pas de correction affichée */
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <p style={{ color: '#888', fontSize: 13, margin: '0 0 8px' }}>
                        {t('bs_demo_wrong_msg')}
                      </p>
                      <button
                        onClick={() => navigate('/pricing')}
                        style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                      >
                        {t('bs_demo_wrong_btn')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-wrap justify-center gap-3">
            {ACTION_KEYS.filter(a => a.key !== 'R' || surrenderAllowed).map(action => (
              <button
                key={action.key}
                onClick={() => handleAction(action.key)}
                disabled={feedback?.type === 'correct'}
                className={`px-6 py-3 ${action.color} text-white font-semibold rounded-lg transition-all disabled:opacity-50 hover:scale-105`}
              >
                {t(action.tKey).split(' = ')[1] || t(action.tKey)}
              </button>
            ))}
          </div>

          {feedback?.type === 'incorrect' && (
            <div className="mt-4 text-center">
              <button onClick={nextQuestion} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                {t('bs_next_hand')}
              </button>
            </div>
          )}
        </CasinoTable>

        {/* Référence rapide */}
        <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-3">{t('bs_quick_ref')}</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">{t('bs_action_hit')}</span>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">{t('bs_action_stand')}</span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{t('bs_action_double')}</span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">{t('bs_action_split')}</span>
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">{t('bs_action_surrender')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
