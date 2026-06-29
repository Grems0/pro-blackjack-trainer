import React, { useState, useCallback, useRef } from 'react';
import SessionResults from './SessionResults';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, BookOpen, X, RefreshCw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import PlayingCard from '../game/PlayingCard';
import StrategyCharts from '../charts/StrategyCharts';
import {
  deviationsS17, deviationsH17,
  surrenderDeviationsS17, surrenderDeviationsH17,
} from '../../data/mockData';

const HAND_CARDS = {
  '16':  [{ value: '10', suit: 'spades' }, { value: '6',  suit: 'hearts' }],
  '15':  [{ value: '10', suit: 'spades' }, { value: '5',  suit: 'hearts' }],
  '14':  [{ value: '10', suit: 'spades' }, { value: '4',  suit: 'hearts' }],
  '13':  [{ value: '10', suit: 'spades' }, { value: '3',  suit: 'hearts' }],
  '12':  [{ value: '10', suit: 'spades' }, { value: '2',  suit: 'hearts' }],
  '11':  [{ value: '7',  suit: 'spades' }, { value: '4',  suit: 'hearts' }],
  '10':  [{ value: '6',  suit: 'spades' }, { value: '4',  suit: 'hearts' }],
  '9':   [{ value: '5',  suit: 'spades' }, { value: '4',  suit: 'hearts' }],
  '8':   [{ value: '4',  suit: 'spades' }, { value: '4',  suit: 'hearts' }],
  '8,8': [{ value: '8',  suit: 'spades' }, { value: '8',  suit: 'hearts' }],
  'A,7': [{ value: 'A',  suit: 'spades' }, { value: '7',  suit: 'hearts' }],
};

const DEV_SIGN_S17 = {
  1: false, 2: false, 3: false, 4: false, 5: false, 6: false,
  7: false, 8: false, 9: false, 10: false, 11: false,
  12: true, 13: true, 14: true, 15: true, 16: true,
  17: false, 18: false,
};
const DEV_SIGN_H17 = {
  1: false, 2: false, 3: false, 4: false, 5: false, 6: false,
  7: false, 8: false, 9: false, 10: false,
  11: true, 12: true, 13: true, 14: true, 15: true,
  16: false, 17: false, 18: false,
};

const ACTION_KEY_TO_LABEL = {
  H: 'Tirer', S: 'Rester', D: 'Doubler', P: 'Séparer', R: 'Abandonner',
};

function actionKeyFromText(actionText) {
  const t = actionText.toLowerCase();
  if (t.includes('abandonner')) return 'R';
  if (t.includes('séparer'))    return 'P';
  if (t.includes('doubler'))    return 'D';
  if (t.includes('rester'))     return 'S';
  return 'H';
}

function weightedRandom(items) {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

const TC_VALUES = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

export default function DeviationsTraining() {
  const navigate       = useNavigate();
  const { currentModule } = useGame();

  const savedConfig = (() => {
    try { return JSON.parse(localStorage.getItem('trainingModuleConfig') || '{}'); }
    catch { return {}; }
  })();
  const moduleConfig     = currentModule?.config || savedConfig.config || {};
  const ruleVariant      = moduleConfig.ruleVariant || 'S17';
  const isS17            = ruleVariant === 'S17';
  const surrenderAllowed = moduleConfig.surrenderAllowed === true;

  const LS_KEY = `dev_review_${ruleVariant}`;

  const baseDevs   = isS17 ? deviationsS17   : deviationsH17;
  const surDevs    = isS17 ? surrenderDeviationsS17 : surrenderDeviationsH17;
  const devSignMap = isS17 ? DEV_SIGN_S17    : DEV_SIGN_H17;

  const devPool = [
    ...baseDevs.filter(d => d.playerHand !== 'Assurance'),
    ...(surrenderAllowed ? surDevs : []),
  ];

  // ─── Review state ─────────────────────────────────────────────────────────
  const [reviewItems, setReviewItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  });
  const [reviewMode,       setReviewMode]       = useState(false);
  const [currentReviewKey, setCurrentReviewKey] = useState(null);

  const reviewCount = Object.keys(reviewItems).length;

  const saveReviewItems = (items) => {
    setReviewItems(items);
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  };

  // ─── Session state ────────────────────────────────────────────────────────
  const [scenario,       setScenario]       = useState(null);
  const [isSurrenderDev, setIsSurrenderDev] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedSign,   setSelectedSign]   = useState(null);
  const [selectedTC,     setSelectedTC]     = useState(null);
  const [feedback,       setFeedback]       = useState(null);
  const [showChart,      setShowChart]      = useState(false);
  const [showSummary,    setShowSummary]    = useState(false);
  const [stats,          setStats]          = useState({ correct: 0, incorrect: 0 });
  const [mistakes,       setMistakes]       = useState([]);
  const [sessionTime,    setSessionTime]    = useState(0);
  const startTimeRef = useRef(Date.now());

  // ─── Generate random scenario ──────────────────────────────────────────────
  const generateScenario = useCallback(() => {
    const dev  = devPool[Math.floor(Math.random() * devPool.length)];
    const isSur = surrenderAllowed && surDevs.includes(dev);
    setScenario(dev);
    setIsSurrenderDev(isSur);
    setSelectedAction(null);
    setSelectedSign(null);
    setSelectedTC(null);
    setFeedback(null);
    setCurrentReviewKey(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleVariant, surrenderAllowed]);

  // ─── Generate review scenario (weighted) ──────────────────────────────────
  const generateReviewScenario = useCallback(() => {
    const items = Object.values(reviewItems);
    if (!items.length) { setReviewMode(false); generateScenario(); return; }

    const picked = weightedRandom(items);
    // Retrouver le dev correspondant dans le pool
    const matchedDev = devPool.find(d =>
      `${d.playerHand}_vs_${d.dealerCard}` === picked.devKey
    );
    if (!matchedDev) { generateScenario(); return; }

    const isSur = surrenderAllowed && surDevs.includes(matchedDev);
    setScenario(matchedDev);
    setIsSurrenderDev(isSur);
    setSelectedAction(null);
    setSelectedSign(null);
    setSelectedTC(null);
    setFeedback(null);
    setCurrentReviewKey(picked.reviewKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewItems, generateScenario, ruleVariant, surrenderAllowed]);

  const nextScenario = useCallback(() => {
    if (reviewMode) generateReviewScenario();
    else generateScenario();
  }, [reviewMode, generateReviewScenario, generateScenario]);

  React.useEffect(() => { generateScenario(); }, [generateScenario]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const handleValidate = () => {
    if (!selectedAction || selectedSign === null || selectedTC === null) return;

    const isDownward    = isSurrenderDev ? false : (devSignMap[scenario.index] ?? false);
    const correctSign   = isDownward ? '≤' : '≥';
    const correctTC     = scenario.trueCount;
    const correctAction = actionKeyFromText(scenario.action);

    const actionOk = selectedAction === correctAction;
    const signOk   = selectedSign   === correctSign;
    const tcOk     = selectedTC     === correctTC;
    const formatTC = v => `${v >= 0 ? '+' : ''}${v}`;

    const handDesc = `${scenario.playerHand} vs ${scenario.dealerCard}`;

    if (actionOk && signOk && tcOk) {
      setFeedback({ type: 'correct' });
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));

      // Review mode : diminuer le poids
      if (reviewMode && currentReviewKey) {
        const updated = { ...reviewItems };
        if (updated[currentReviewKey]) {
          updated[currentReviewKey].weight -= 1;
          if (updated[currentReviewKey].weight <= 0) delete updated[currentReviewKey];
        }
        saveReviewItems(updated);
      }

      setTimeout(nextScenario, 900);
    } else {
      // Sauvegarder dans la file de révision
      const devKey   = `${scenario.playerHand}_vs_${scenario.dealerCard}`;
      const rKey     = `${devKey}_${ruleVariant}`;
      const updated  = { ...reviewItems };
      updated[rKey]  = {
        reviewKey: rKey,
        devKey,
        handDesc,
        weight: Math.min((updated[rKey]?.weight || 0) + 2, 10),
      };
      saveReviewItems(updated);

      setMistakes(prev => [...prev, {
        handDesc,
        action:        scenario.action,
        chosenAnswer:  `${ACTION_KEY_TO_LABEL[selectedAction] || '?'} · ${selectedSign} ${formatTC(selectedTC)}`,
        correctAnswer: `${ACTION_KEY_TO_LABEL[correctAction]} · ${correctSign} ${formatTC(correctTC)}`,
      }]);
      setFeedback({
        type:          'incorrect',
        chosenAnswer:  `${ACTION_KEY_TO_LABEL[selectedAction] || '?'} · ${selectedSign} ${formatTC(selectedTC)}`,
        correctAnswer: `${ACTION_KEY_TO_LABEL[correctAction]} · ${correctSign} ${formatTC(correctTC)}`,
      });
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const ACTIONS = [
    { key: 'H', label: 'Tirer' },
    { key: 'S', label: 'Rester' },
    { key: 'D', label: 'Doubler' },
    { key: 'P', label: 'Séparer' },
    ...(surrenderAllowed ? [{ key: 'R', label: 'Abandonner' }] : []),
  ];

  const playerCards   = scenario ? (HAND_CARDS[scenario.playerHand] || []) : [];
  const dealerCardObj = scenario ? { value: scenario.dealerCard, suit: 'clubs' } : null;
  const canValidate   = selectedAction && selectedSign !== null && selectedTC !== null && !feedback;

  // ─── Bilan ────────────────────────────────────────────────────────────────
  if (showSummary) {
    const counts = {};
    for (const m of mistakes) {
      counts[m.handDesc] = (counts[m.handDesc] || 0) + 1;
    }
    const topMistakes = Object.entries(counts)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));

    return (
      <SessionResults
        moduleName="Déviations"
        accentColor="#c084fc"
        stats={{ correct: stats.correct, incorrect: stats.incorrect, total: stats.correct + stats.incorrect }}
        timeSeconds={sessionTime}
        topMistakes={topMistakes}
        reviewCount={reviewCount}
        onReplay={() => { setShowSummary(false); setStats({ correct: 0, incorrect: 0 }); setMistakes([]); setReviewMode(false); startTimeRef.current = Date.now(); generateScenario(); }}
        onReview={reviewCount > 0 ? () => { setShowSummary(false); setStats({ correct: 0, incorrect: 0 }); setMistakes([]); setReviewMode(true); startTimeRef.current = Date.now(); } : undefined}
        onHome={() => navigate('/training')}
      />
    );
  }

  // ─── Drill ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#071508' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, #1a5c35 0%, #0f3d22 50%, #071508 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}/>
      <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '120%', height: 200, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', border: '3px solid rgba(201,168,76,0.2)', borderBottom: 'none', pointerEvents: 'none' }}/>
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowChart(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 z-10">
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
              <h1 className="text-xl font-bold text-white">Déviations</h1>
              <p className="text-sm text-gray-500">
                {reviewMode ? '— Mode Révision' : "Début de l'exercice"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Bouton révision */}
            {reviewCount > 0 && !reviewMode && (
              <button
                onClick={() => { setReviewMode(true); generateReviewScenario(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                title={`${reviewCount} déviation${reviewCount > 1 ? 's' : ''} à réviser`}
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-bold">{reviewCount}</span>
              </button>
            )}
            {reviewMode && (
              <button
                onClick={() => { setReviewMode(false); generateScenario(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/30 border border-amber-500/60 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                <span className="text-amber-300 text-sm font-bold">Révision {reviewCount > 0 ? `(${reviewCount})` : '✓'}</span>
              </button>
            )}
            <button onClick={() => setShowChart(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-semibold hidden sm:inline">Tableau</span>
            </button>
            <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{ruleVariant}</span>
            <button
              onClick={() => { setSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000)); setShowSummary(true); }}
              disabled={stats.correct + stats.incorrect === 0}
              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Terminer
            </button>
            <button onClick={nextScenario} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">

        {/* Bannière mode révision */}
        {reviewMode && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-900/30 border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm font-semibold">
                Mode Révision —{' '}
                {reviewCount > 0
                  ? `${reviewCount} déviation${reviewCount > 1 ? 's' : ''} restante${reviewCount > 1 ? 's' : ''}`
                  : 'File terminée ! Toutes les erreurs corrigées.'}
              </p>
            </div>
            {reviewCount === 0 && (
              <button onClick={() => { setReviewMode(false); generateScenario(); }} className="text-xs text-amber-400 underline">
                Retour normal
              </button>
            )}
          </div>
        )}

        {/* Invitation à réviser */}
        {!reviewMode && reviewCount > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-900/20 border border-amber-500/30 flex items-center justify-between gap-3">
            <p className="text-amber-400/80 text-xs">
              <span className="font-bold text-amber-300">{reviewCount}</span> déviation{reviewCount > 1 ? 's' : ''} à réviser depuis tes erreurs passées
            </p>
            <button
              onClick={() => { setReviewMode(true); generateReviewScenario(); }}
              className="text-xs text-amber-400 font-bold underline flex-shrink-0"
            >
              Commencer la révision →
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center gap-8">
          <div className="text-center">
            <span className="text-gray-400 text-sm">Correct</span>
            <p className="text-2xl font-bold text-emerald-400">{stats.correct}</p>
          </div>
          <div className="text-center">
            <span className="text-gray-400 text-sm">Incorrect</span>
            <p className="text-2xl font-bold text-red-400">{stats.incorrect}</p>
          </div>
          <div className="text-center">
            <span className="text-gray-400 text-sm">Précision</span>
            <p className="text-2xl font-bold text-amber-400">
              {stats.correct + stats.incorrect > 0
                ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-gradient-to-b from-green-800/50 to-green-900/50 rounded-2xl p-8 border border-amber-700/30">

          <div className="text-center mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Situation</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-2">Votre main</p>
                <div className="flex gap-2 justify-center">
                  {playerCards.map((card, idx) => (
                    <PlayingCard key={idx} card={card} size="lg" />
                  ))}
                </div>
                <p className="text-white font-bold mt-2">{scenario?.playerHand}</p>
              </div>
              <div className="text-gray-500 text-2xl font-light">vs</div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-2">Croupier</p>
                {dealerCardObj && <PlayingCard card={dealerCardObj} size="lg" />}
                <p className="text-white font-bold mt-2">{scenario?.dealerCard}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-700/20 my-5" />

          <p className="text-center text-gray-300 text-sm mb-5 font-semibold uppercase tracking-wide">
            Quelle est l'action optimale et à quel True Count ?
          </p>

          {/* Sélecteur Action */}
          <div className="mb-5">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-2 text-center">Action optimale</p>
            <div className="flex flex-wrap justify-center gap-2">
              {ACTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => !feedback && setSelectedAction(key)}
                  disabled={!!feedback}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed ${
                    selectedAction === key
                      ? 'bg-blue-500 text-white scale-105 shadow-lg shadow-blue-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-amber-700/10 my-4" />

          {/* Sélecteur Signe */}
          <div className="mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-2 text-center">Signe du TC</p>
            <div className="flex justify-center gap-3">
              {[
                { sign: '≥', label: 'À partir de',  hint: 'déviation si TC est supérieur ou égal' },
                { sign: '≤', label: 'En dessous de', hint: 'déviation si TC est inférieur ou égal' },
              ].map(({ sign, label, hint }) => (
                <button
                  key={sign}
                  onClick={() => !feedback && setSelectedSign(sign)}
                  disabled={!!feedback}
                  title={hint}
                  className={`flex flex-col items-center px-6 py-3 rounded-xl transition-all disabled:cursor-not-allowed ${
                    selectedSign === sign
                      ? 'bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="text-2xl font-black leading-none">{sign}</span>
                  <span className={`text-xs mt-1 font-medium ${selectedSign === sign ? 'text-black/70' : 'text-gray-400'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur TC */}
          <div className="mb-6">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-2 text-center">Valeur du TC</p>
            <div className="flex flex-wrap justify-center gap-2">
              {TC_VALUES.map(val => (
                <button
                  key={val}
                  onClick={() => !feedback && setSelectedTC(val)}
                  disabled={!!feedback}
                  className={`w-14 py-2.5 rounded-lg font-bold text-sm transition-all disabled:cursor-not-allowed ${
                    selectedTC === val
                      ? 'bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {val >= 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          {!feedback && (
            <button
              onClick={handleValidate}
              disabled={!canValidate}
              className="w-full py-3 rounded-xl font-bold text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Valider
            </button>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`rounded-lg border ${
              feedback.type === 'correct'
                ? 'bg-emerald-500/20 border-emerald-500/50 p-4 text-center'
                : 'bg-red-500/10 border-red-500/30 p-5'
            }`}>
              {feedback.type === 'correct' ? (
                <p className="text-emerald-400 font-bold text-lg">Correct !</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-400 font-bold text-center mb-3">Mauvaise réponse</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2 flex-1 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                      <span className="text-red-400 text-lg">✗</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Votre réponse</p>
                        <p className="text-red-300 font-bold font-mono">{feedback.chosenAnswer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                      <span className="text-emerald-400 text-lg">✓</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Bonne réponse</p>
                        <p className="text-emerald-300 font-bold font-mono">{feedback.correctAnswer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {feedback?.type === 'incorrect' && (
            <div className="mt-4 text-center">
              <button onClick={nextScenario} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                Scénario suivant
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
