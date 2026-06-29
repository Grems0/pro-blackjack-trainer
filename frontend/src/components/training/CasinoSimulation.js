import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, X, Lock } from 'lucide-react';
import { useProAccess } from '../../hooks/useProAccess';
import StrategyCharts from '../charts/StrategyCharts';
import PlayingCard from '../game/PlayingCard';
import {
  generateDeck, shuffleDeck, getHiLoValue, calculateHandTotal, isSoftHand,
  basicStrategyHardENHCS17, basicStrategyHardENHCH17,
  basicStrategySoftENHCS17, basicStrategySoftENHCH17,
  basicStrategyPairsENHC,
  deviationsS17, deviationsH17,
  surrenderDeviationsS17, surrenderDeviationsH17,
} from '../../data/mockData';

// ─── Constants ────────────────────────────────────────────────────────────────
const NUM_DECKS = 6;
const TOTAL_CARDS = NUM_DECKS * 52;
const CHIPS = [5, 10, 25, 50, 100];
const DEFAULT_BETSPREAD = { '-2': 5, '-1': 5, '0': 5, '1': 10, '2': 20, '3': 30, '4': 50, '5': 50, '6': 50 };
const DEFAULT_CFG = { isS17: true, das: true, rsaAllowed: false, surrenderAllowed: true, useDeviations: true, numBots: 1, showRC: false, showTC: false, bankroll: 500, penetrationDecks: 4.5 };
const ACTION_LABELS = { H: 'Tirer', S: 'Rester', D: 'Doubler', P: 'Séparer', R: 'Abandonner' };

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function normDK(v) {
  if (['J', 'Q', 'K'].includes(v)) return 10;
  if (v === 'A') return 'A';
  return parseInt(v);
}
function computeTC(rc, shoe) {
  const d = shoe.length / 52;
  return d >= 0.5 ? Math.trunc(rc / d) : 0;
}
function drawCard(shoe, rc) {
  if (!shoe.length) return { card: null, shoe, rc };
  const [card, ...rest] = shoe;
  return { card, shoe: rest, rc: rc + getHiLoValue(card) };
}
function actionFromText(t) {
  const l = t.toLowerCase();
  if (l.includes('abandonner')) return 'R';
  if (l.includes('séparer'))    return 'P';
  if (l.includes('doubler'))    return 'D';
  if (l.includes('rester'))     return 'S';
  return 'H';
}
function getV(v) { return ['J','Q','K','10'].includes(v) ? '10' : v; }

function getOptimalAction(hand, dealerUpCard, tc, cfg, isFirstAction) {
  if (!hand?.length || !dealerUpCard) return 'S';
  const total = calculateHandTotal(hand);
  const soft  = isSoftHand(hand);
  const dk    = normDK(dealerUpCard.value);
  const isPair = hand.length === 2 && getV(hand[0].value) === getV(hand[1].value);

  const hardT = cfg.isS17 ? basicStrategyHardENHCS17 : basicStrategyHardENHCH17;
  const softT = cfg.isS17 ? basicStrategySoftENHCS17 : basicStrategySoftENHCH17;
  const devs  = cfg.isS17 ? deviationsS17 : deviationsH17;
  const surDs = cfg.isS17 ? surrenderDeviationsS17 : surrenderDeviationsH17;

  if (cfg.surrenderAllowed && isFirstAction && cfg.useDeviations) {
    for (const d of surDs) {
      if (normDK(d.dealerCard) !== dk) continue;
      if (d.playerHand === '8,8') { if (!isPair || hand[0].value !== '8') continue; }
      else if (total !== parseInt(d.playerHand)) continue;
      if (tc >= d.trueCount) return 'R';
    }
  }
  if (cfg.useDeviations) {
    for (const d of devs) {
      if (d.playerHand === 'Assurance') continue;
      if (normDK(d.dealerCard) !== dk) continue;
      if (total !== parseInt(d.playerHand)) continue;
      const down = d.action.includes('au lieu de Rester');
      if (down ? tc <= d.trueCount : tc >= d.trueCount) return actionFromText(d.action);
    }
  }
  if (isPair && isFirstAction) {
    const v = getV(hand[0].value);
    const key = v === 'A' ? 'A,A' : `${v},${v}`;
    const a = basicStrategyPairsENHC[key]?.[dk];
    if (a) return a;
  }
  if (soft && total >= 13 && total <= 20) {
    const a = softT[total]?.[dk];
    if (a) return a === 'Ds' ? (hand.length === 2 ? 'D' : 'S') : a;
  }
  const raw = hardT[total]?.[dk] || 'S';
  if (raw === 'Rh') return cfg.surrenderAllowed && isFirstAction ? 'R' : 'H';
  if (raw === 'Rs') return cfg.surrenderAllowed && isFirstAction ? 'R' : 'S';
  return raw;
}
function getOptimalBet(tc, bs) {
  return bs[Math.max(-2, Math.min(6, tc)).toString()] || 5;
}
// Returns the deal-sequence step index for a card (used for slide-in animation)
// target: 'bot'|'player'|'dealer', handIdx: 0/1, cardIdx: 0/1
function getCardStep(target, handIdx, cardIdx, numBots, numH) {
  if (cardIdx === 0) {
    if (target === 'bot')    return handIdx;
    if (target === 'player') return numBots + handIdx;
    if (target === 'dealer') return numBots + numH;
  } else if (cardIdx === 1) {
    const p2 = numBots + numH + 1;
    if (target === 'bot')    return p2 + handIdx;
    if (target === 'player') return p2 + numBots + handIdx;
  }
  return -1; // hit cards during gameplay always visible
}

function botPlayFull(hand, dk, shoe, rc, cfg) {
  let h = [...hand], s = [...shoe], r = rc;
  const hardT = cfg.isS17 ? basicStrategyHardENHCS17 : basicStrategyHardENHCH17;
  const softT = cfg.isS17 ? basicStrategySoftENHCS17 : basicStrategySoftENHCH17;
  for (let i = 0; i < 12; i++) {
    const tot = calculateHandTotal(h);
    if (tot >= 21) break;
    const soft = isSoftHand(h);
    let action;
    if (soft && tot >= 13 && tot <= 20) {
      const a = softT[tot]?.[dk] || 'S';
      action = a === 'Ds' ? (h.length === 2 ? 'D' : 'S') : a;
    } else { action = hardT[tot]?.[dk] || 'S'; }
    if (action === 'H' || action === 'D') {
      const res = drawCard(s, r);
      if (!res.card) break;
      h = [...h, res.card]; s = res.shoe; r = res.rc;
      if (action === 'D') break;
    } else break;
  }
  return { hand: h, shoe: s, rc: r };
}

// ─── Config Screen ─────────────────────────────────────────────────────────────
function ProLockOverlay({ navigate, label }) {
  return (
    <div
      onClick={() => navigate('/pricing')}
      style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 10, cursor: 'pointer',
        background: 'rgba(10,10,10,0.82)',
        backdropFilter: 'blur(4px)',
        borderRadius: 16,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={18} color="#c9a84c" />
      </div>
      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 800, margin: '0 0 4px' }}>
          Abonnement Pro requis
        </p>
        <p style={{ color: '#888', fontSize: 11, margin: '0 0 10px', lineHeight: 1.5 }}>
          {label || 'Cette section'} est réservée aux abonnés.<br />Souscris un abonnement pour débloquer l'accès.
        </p>
        <span style={{
          display: 'inline-block', padding: '7px 16px', borderRadius: 8,
          background: 'linear-gradient(135deg, #c9a84c, #a8823a)',
          color: '#000', fontSize: 12, fontWeight: 800,
        }}>
          Voir les offres →
        </span>
      </div>
    </div>
  );
}

function ConfigScreen({ onStart }) {
  const navigate = useNavigate();
  const isPro = useProAccess();
  const [cfg, setCfg] = useState({ ...DEFAULT_CFG });
  const [bs, setBs] = useState({ ...DEFAULT_BETSPREAD });
  const [savedModels, setSavedModels] = useState(() => { try { return JSON.parse(localStorage.getItem('bj_betspreads') || '[]'); } catch { return []; } });
  const [saveInput, setSaveInput] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const toggle = k => setCfg(p => ({ ...p, [k]: !p[k] }));
  const TC_RANGE = ['-2', '-1', '0', '1', '2', '3', '4', '5', '6'];
  const PEN_DECKS = [4, 4.5, 5, 5.5];
  const BANKROLL_PRESETS = [200, 500, 1000, 2000, 5000];

  const loadModel = (m) => {
    setBs({ ...DEFAULT_BETSPREAD, ...m.spread });
    if (m.cfg) setCfg({ ...DEFAULT_CFG, ...m.cfg });
  };

  const saveModel = () => {
    if (!saveInput.trim()) return;
    const entry = { name: saveInput.trim(), spread: { ...bs }, cfg: { ...cfg } };
    const updated = [...savedModels.filter(m => m.name !== entry.name), entry];
    localStorage.setItem('bj_betspreads', JSON.stringify(updated));
    setSavedModels(updated);
    setSaveInput('');
    setSaveOpen(false);
  };

  const deleteModel = (name, e) => {
    e.stopPropagation();
    const updated = savedModels.filter(m => m.name !== name);
    localStorage.setItem('bj_betspreads', JSON.stringify(updated));
    setSavedModels(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a472a] to-[#0d2818] px-4 py-10">
      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Simulation Casino</h1>
          <p className="text-gray-400 text-sm">ENHC · 6 jeux · Hi-Lo</p>
        </div>

        {/* ── Mes modèles (EN HAUT) ── */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold">Mes modèles</h2>
            <button onClick={() => setSaveOpen(p => !p)}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg transition-colors">
              + Sauvegarder le modèle actuel
            </button>
          </div>

          {saveOpen && (
            <div className="flex gap-2 mb-3">
              <input autoFocus type="text" placeholder="Nom du modèle..." value={saveInput}
                onChange={e => setSaveInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveModel()}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-500/60" />
              <button onClick={saveModel} disabled={!saveInput.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-bold rounded-lg text-sm transition-colors">
                OK
              </button>
            </div>
          )}

          {savedModels.length === 0 ? (
            <p className="text-gray-600 text-sm italic text-center py-2">Aucun modèle sauvegardé</p>
          ) : (
            <div className="space-y-2">
              {savedModels.map(m => (
                <button key={m.name} onClick={() => loadModel(m)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all group">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div>
                      <p className="text-white font-bold text-sm">{m.name}</p>
                      {m.cfg && (
                        <p className="text-gray-500 text-xs">
                          {m.cfg.isS17 ? 'S17' : 'H17'} · {m.cfg.penetrationDecks ?? 4.5} jeux · BK {m.cfg.bankroll ?? 500}€
                          {m.cfg.surrenderAllowed ? ' · Surrender' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Charger tout →</span>
                    <span onClick={(e) => deleteModel(m.name, e)}
                      className="text-gray-600 hover:text-red-400 text-lg leading-none px-1 transition-colors">×</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Règles de la table ── */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-5" style={{ position: 'relative' }}>
          <h2 className="text-white font-bold mb-4">Règles de la table</h2>

          <div className="mb-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Règle du soft 17</p>
            <div className="flex gap-2">
              {[
                { val: true,  label: 'S17', sub: 'Stand on soft 17' },
                { val: false, label: 'H17', sub: 'Hit on soft 17' },
              ].map(({ val, label, sub }) => (
                <button key={label} onClick={() => setCfg(p => ({ ...p, isS17: val }))}
                  className={`flex-1 py-3 rounded-xl font-black text-base transition-all border-2 ${
                    cfg.isS17 === val
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}>
                  {label}
                  <p className={`text-xs font-normal mt-0.5 ${cfg.isS17 === val ? 'text-emerald-200' : 'text-gray-600'}`}>{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Pénétration en jeux */}
          <div className="mb-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Pénétration (jeux avant mélange)</p>
            <div className="flex gap-2">
              {PEN_DECKS.map(v => (
                <button key={v} onClick={() => setCfg(p => ({ ...p, penetrationDecks: v }))}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                    cfg.penetrationDecks === v
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}>
                  {v}
                  <p className="text-[10px] font-normal mt-0.5 opacity-70">{Math.round(v * 52)} cartes</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { k: 'das',              label: 'Double After Split (DAS)' },
              { k: 'rsaAllowed',       label: 'Resplit Aces' },
              { k: 'surrenderAllowed', label: 'Surrender autorisé' },
              { k: 'useDeviations',    label: 'Déviations (Hi-Lo)' },
            ].map(({ k, label }) => (
              <button key={k} onClick={() => toggle(k)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                  cfg[k] ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${cfg[k] ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Configuration ── */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-5" style={{ position: 'relative' }}>
          <h2 className="text-white font-bold mb-4">Configuration</h2>

          <div className="mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Bankroll de départ</p>
            <div className="flex gap-2 mb-2">
              {BANKROLL_PRESETS.map(v => (
                <button key={v} onClick={() => setCfg(p => ({ ...p, bankroll: v }))}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${cfg.bankroll === v ? 'bg-amber-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {v}€
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <span className="text-gray-400 text-xs">Personnalisé :</span>
              <input type="number" min="10" step="10" value={cfg.bankroll}
                onChange={e => setCfg(p => ({ ...p, bankroll: parseInt(e.target.value) || 100 }))}
                className="flex-1 bg-transparent text-white text-sm font-bold text-right outline-none" />
              <span className="text-gray-500 text-xs">€</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Joueurs fictifs</p>
            <div className="flex gap-2">
              {[0, 1, 2].map(n => (
                <button key={n} onClick={() => setCfg(p => ({ ...p, numBots: n }))}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${cfg.numBots === n ? 'bg-amber-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {n} {n <= 1 ? 'joueur' : 'joueurs'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Afficher pendant la session</p>
          <div className="flex gap-2">
            {[{ k: 'showRC', label: 'Running Count' }, { k: 'showTC', label: 'True Count' }].map(({ k, label }) => (
              <button key={k} onClick={() => toggle(k)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${cfg[k] ? 'bg-blue-500/30 border border-blue-500/50 text-blue-300' : 'bg-white/10 text-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Betspread ── */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-5" style={{ position: 'relative' }}>
          <h2 className="text-white font-bold mb-4">Grille de mises (Betspread)</h2>
          <div className="grid grid-cols-3 gap-2">
            {TC_RANGE.map(t => (
              <div key={t} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                <span className={`text-xs font-bold w-8 ${parseInt(t) > 0 ? 'text-emerald-400' : parseInt(t) < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  TC{parseInt(t) >= 0 ? `+${t}` : t}
                </span>
                <input type="number" min="0" value={bs[t]}
                  onChange={e => setBs(p => ({ ...p, [t]: parseInt(e.target.value) || 0 }))}
                  className="flex-1 bg-transparent text-white text-sm font-bold text-right outline-none w-10" />
                <span className="text-gray-500 text-xs">€</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => onStart(cfg, bs)}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl transition-colors shadow-lg shadow-emerald-900/50">
          Démarrer la simulation
        </button>
      </div>
    </div>
  );
}

// ─── Shoe SVG (style casino acrylique) ────────────────────────────────────────
function ShoeDisplay({ remaining, total, showCounts }) {
  const pct   = remaining / total;
  const W = 72, H = 140;
  const padX = 8, baseH = 12;
  const innerH = H - baseH - 6;
  const stackH = Math.round(pct * innerH);
  const lineCount = Math.max(0, Math.floor(stackH / 5));

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Sabot</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>
        {/* Base noire */}
        <rect x={2} y={H - baseH} width={W - 4} height={baseH} rx={3} fill="#111" />
        {/* Corps transparent */}
        <rect x={padX} y={4} width={W - padX * 2} height={H - baseH - 2} rx={2}
          fill="rgba(180,220,255,0.04)" stroke="rgba(180,220,255,0.35)" strokeWidth={1.5} />
        {/* Reflet gauche */}
        <rect x={padX + 2} y={6} width={5} height={H - baseH - 8} rx={2}
          fill="rgba(255,255,255,0.07)" />

        {/* Pile de cartes (du bas vers le haut) */}
        {stackH > 0 && (
          <>
            {/* Corps blanc des cartes */}
            <rect x={padX + 2} y={H - baseH - 2 - stackH} width={W - padX * 2 - 4} height={stackH}
              fill="#eeeee8" />
            {/* Lignes horizontales = tranche des cartes */}
            {Array.from({ length: lineCount }).map((_, i) => (
              <line key={i}
                x1={padX + 2} y1={H - baseH - 2 - (i + 1) * 5}
                x2={W - padX - 2} y2={H - baseH - 2 - (i + 1) * 5}
                stroke="rgba(160,160,150,0.5)" strokeWidth={0.6} />
            ))}
            {/* Carte bleue en haut (cut card) */}
            <rect x={padX + 2} y={H - baseH - 2 - stackH} width={W - padX * 2 - 4} height={10}
              fill="#2a3faa" />
            {/* Motif losanges sur la carte bleue */}
            {Array.from({ length: 5 }).map((_, i) => (
              <text key={i} x={padX + 6 + i * 10} y={H - baseH - 2 - stackH + 7}
                fontSize={6} fill="rgba(130,170,255,0.7)" textAnchor="middle">◆</text>
            ))}
          </>
        )}

        {/* Arêtes supérieures du boîtier (perspective 3D) */}
        <line x1={padX} y1={4} x2={4} y2={10} stroke="rgba(180,220,255,0.25)" strokeWidth={1} />
        <line x1={W - padX} y1={4} x2={W - 4} y2={10} stroke="rgba(180,220,255,0.25)" strokeWidth={1} />
      </svg>
      {showCounts && <p className="text-white font-black text-base leading-none">{remaining}</p>}
      {showCounts && <p className="text-gray-400 text-[10px]">cartes · {(remaining / 52).toFixed(1)} jeux</p>}
    </div>
  );
}

// ─── Discard Tray SVG ──────────────────────────────────────────────────────────
function DiscardTray({ cardCount, total, showCounts }) {
  const pct   = cardCount / total;
  const W = 72, H = 140;
  const padX = 8, baseH = 12;
  const innerH = H - baseH - 6;
  const stackH = Math.round(pct * innerH);
  const lineCount = Math.max(0, Math.floor(stackH / 5));

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Défausse</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>
        {/* Base noire */}
        <rect x={2} y={H - baseH} width={W - 4} height={baseH} rx={3} fill="#111" />
        {/* Corps transparent */}
        <rect x={padX} y={4} width={W - padX * 2} height={H - baseH - 2} rx={2}
          fill="rgba(180,220,255,0.04)" stroke="rgba(180,220,255,0.25)" strokeWidth={1.5} />
        {/* Reflet gauche */}
        <rect x={padX + 2} y={6} width={5} height={H - baseH - 8} rx={2}
          fill="rgba(255,255,255,0.06)" />

        {cardCount === 0 && (
          <rect x={padX + 4} y={H - baseH - 14} width={W - padX * 2 - 8} height={10}
            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} strokeDasharray="3,2" />
        )}

        {stackH > 0 && (
          <>
            <rect x={padX + 2} y={H - baseH - 2 - stackH} width={W - padX * 2 - 4} height={stackH}
              fill="#eeeee8" />
            {Array.from({ length: lineCount }).map((_, i) => (
              <line key={i}
                x1={padX + 2} y1={H - baseH - 2 - (i + 1) * 5}
                x2={W - padX - 2} y2={H - baseH - 2 - (i + 1) * 5}
                stroke="rgba(160,160,150,0.5)" strokeWidth={0.6} />
            ))}
          </>
        )}
        <line x1={padX} y1={4} x2={4} y2={10} stroke="rgba(180,220,255,0.2)" strokeWidth={1} />
        <line x1={W - padX} y1={4} x2={W - 4} y2={10} stroke="rgba(180,220,255,0.2)" strokeWidth={1} />
      </svg>
      {showCounts && <p className="text-white font-black text-base leading-none">{cardCount}</p>}
      {showCounts && <p className="text-gray-400 text-[10px]">cartes · {(cardCount / 52).toFixed(1)} jeux</p>}
    </div>
  );
}

// ─── Card hand row ────────────────────────────────────────────────────────────
function HandRow({ label, hand, size = 'sm', active = false, bet, outcome, visibleSteps, dealStep }) {
  const total = hand?.length ? calculateHandTotal(hand) : null;
  const bust  = total > 21;
  const cardStyle = size === 'md'
    ? { width: 56, height: 80 }
    : size === 'lg'
    ? { width: 70, height: 96 }
    : { width: 44, height: 60 };

  return (
    <div className={`flex flex-col items-center transition-all ${active ? 'ring-2 ring-amber-400 rounded-xl px-2 py-1' : 'px-2 py-1'}`}>
      <p className="text-gray-300 text-xs uppercase tracking-wide mb-2 font-semibold">
        {label} {active && <span className="text-amber-300">▶</span>}
      </p>
      <div className="flex gap-2 justify-center items-end" style={{ minHeight: cardStyle.height }}>
        {hand?.length
          ? hand.map((card, i) => {
              const step = visibleSteps?.[i] ?? -1;
              const vis = step === -1 || dealStep > step;
              return (
                <div key={i} style={{
                  width: cardStyle.width, height: cardStyle.height, flexShrink: 0,
                  transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: vis ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(0.6)',
                  opacity: vis ? 1 : 0,
                }}>
                  <PlayingCard card={card} size={size} />
                </div>
              );
            })
          : <div style={{ width: cardStyle.width, height: cardStyle.height }}
              className="rounded-lg border-2 border-dashed border-white/15 bg-white/5" />
        }
      </div>
      {total !== null && (
        <p className={`text-base font-black mt-2 ${bust ? 'text-red-400' : 'text-white'}`}>
          {bust ? '💥 BUST' : total}
        </p>
      )}
      {bet !== undefined && bet > 0 && (
        <p className="text-amber-400 text-xs font-bold mt-0.5">{bet}€</p>
      )}
      {outcome && (
        <p className={`text-base font-black mt-1 ${outcome === 'win' ? 'text-emerald-400' : outcome === 'push' ? 'text-amber-400' : 'text-red-400'}`}>
          {outcome === 'win' ? '🎉 GAGNÉ' : outcome === 'push' ? '↔ ÉGALITÉ' : '✗ PERDU'}
        </p>
      )}
    </div>
  );
}

// ─── Casino Results Screen ─────────────────────────────────────────────────────
function CasinoResults({ stats, startBankroll, finalBankroll, timeSeconds, onReplay, onHome }) {
  const totalDecisions = stats.correctPlays + stats.incorrectPlays;
  const totalBets      = stats.correctBets  + stats.incorrectBets;
  const playPct  = totalDecisions > 0 ? Math.round((stats.correctPlays / totalDecisions) * 100) : 0;
  const betPct   = totalBets      > 0 ? Math.round((stats.correctBets  / totalBets)      * 100) : 0;
  const pnl      = finalBankroll - startBankroll;
  const pnlColor = pnl > 0 ? '#4ade80' : pnl < 0 ? '#f87171' : '#888';

  const scoreColor = playPct >= 90 ? '#4ade80' : playPct >= 75 ? '#c9a84c' : playPct >= 50 ? '#f97316' : '#f87171';
  const scoreLabel = playPct >= 90 ? 'Excellent' : playPct >= 75 ? 'Bien' : playPct >= 50 ? 'À améliorer' : 'À reprendre';

  const formatTime = s => s >= 60 ? `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')} s` : `${s} s`;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 16px 60px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Simulation Casino — Fin de session
          </span>
        </div>

        {/* Score décisions */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: -2 }}>
              {playPct}<span style={{ fontSize: 40 }}>%</span>
            </div>
            <div style={{ display: 'inline-block', marginTop: 10, padding: '3px 14px', background: `${scoreColor}18`, border: `1px solid ${scoreColor}50`, borderRadius: 20, color: scoreColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              {scoreLabel} — Précision des décisions
            </div>
          </div>

          {/* Pills décisions */}
          <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Correctes',   value: stats.correctPlays,   color: '#4ade80' },
              { label: 'Erreurs',     value: stats.incorrectPlays, color: '#f87171' },
              { label: 'Mains',       value: stats.hands,          color: '#e0e0e0' },
              { label: 'Durée',       value: formatTime(timeSeconds), color: '#60a5fa' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 80, background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                <p style={{ color, fontSize: 20, fontWeight: 900, margin: 0 }}>{value}</p>
                <p style={{ color: '#444', fontSize: 10, fontWeight: 600, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Résultats de table */}
        <div style={{ marginTop: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ color: '#444', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Résultats à la table</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Victoires',  value: stats.wins,   color: '#4ade80' },
              { label: 'Défaites',   value: stats.losses, color: '#f87171' },
              { label: 'Égalités',   value: stats.pushes, color: '#888' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <p style={{ color, fontSize: 22, fontWeight: 900, margin: 0 }}>{value}</p>
                <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bankroll */}
        <div style={{ marginTop: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ color: '#444', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Bankroll</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: 22, fontWeight: 900, margin: 0 }}>{startBankroll}€</p>
              <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Départ</p>
            </div>
            <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <p style={{ color: '#c9a84c', fontSize: 22, fontWeight: 900, margin: 0 }}>{finalBankroll}€</p>
              <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Finale</p>
            </div>
            <div style={{ flex: 1, background: '#0a0a0a', border: `1px solid ${pnlColor}25`, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <p style={{ color: pnlColor, fontSize: 22, fontWeight: 900, margin: 0 }}>{pnl >= 0 ? `+${pnl}` : pnl}€</p>
              <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>P&L</p>
            </div>
          </div>
        </div>

        {/* Paris */}
        {totalBets > 0 && (
          <div style={{ marginTop: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 13, margin: '0 0 2px' }}>Précision des mises</p>
              <p style={{ color: '#555', fontSize: 11, margin: 0 }}>{stats.correctBets} correctes · {stats.incorrectBets} incorrectes sur {totalBets} mains</p>
            </div>
            <span style={{ flexShrink: 0, padding: '4px 12px', borderRadius: 20, background: betPct >= 80 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${betPct >= 80 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, color: betPct >= 80 ? '#4ade80' : '#f87171', fontSize: 14, fontWeight: 900 }}>
              {betPct}%
            </span>
          </div>
        )}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onReplay}
            style={{ flex: 1, padding: 14, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ↺ Rejouer
          </button>
          <button onClick={onHome}
            style={{ flex: 1, padding: 14, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 12, color: '#c9a84c', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Accueil
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CasinoSimulation() {
  const navigate = useNavigate();
  const isPro = useProAccess();

  const [phase,         setPhase]         = useState('config');
  const [config,        setConfig]        = useState(null);
  const [betspread,     setBetspread]     = useState(null);
  const [gs,            setGs]            = useState(null);
  const [currentBet,    setCurrentBet]    = useState(0);
  const [pendingHands,  setPendingHands]  = useState(1);
  const [wrongBetInfo,  setWrongBetInfo]  = useState(null);
  const [wrongPlayInfo, setWrongPlayInfo] = useState(null);
  const [startBankroll, setStartBankroll] = useState(0);
  const [showCounters,  setShowCounters]  = useState(false);
  const [showChart,     setShowChart]     = useState(false);
  const [dealStep,      setDealStep]      = useState(999);
  const [showShoe,      setShowShoe]      = useState(false);
  const [showResults,   setShowResults]   = useState(false);
  const dealAnimRef  = useRef(null);
  const sessionStart = useRef(null);
  const [elapsed,       setElapsed]       = useState(0);

  const startDealAnimation = (total) => {
    if (dealAnimRef.current) clearInterval(dealAnimRef.current);
    setDealStep(0);
    let step = 0;
    dealAnimRef.current = setInterval(() => {
      step++;
      setDealStep(step);
      if (step >= total) { clearInterval(dealAnimRef.current); dealAnimRef.current = null; }
    }, 350);
  };

  useEffect(() => {
    if (!sessionStart.current || showResults) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [showResults, gs]);

  const tc = gs ? computeTC(gs.rc, gs.shoe) : 0;
  const discardCount = gs ? TOTAL_CARDS - gs.shoe.length : 0;

  // ── Start ──────────────────────────────────────────────────────────────────
  const handleStart = (cfg, bs) => {
    setConfig(cfg);
    setBetspread(bs);
    setStartBankroll(cfg.bankroll);
    setGs({
      shoe: shuffleDeck(generateDeck(NUM_DECKS)), rc: 0, bankroll: cfg.bankroll,
      dealerHand: [], botHands: [[], []], playerHands: [[]], playerBets: [0],
      activeHandIdx: 0, roundResult: null,
      stats: { hands: 0, wins: 0, losses: 0, pushes: 0, correctPlays: 0, incorrectPlays: 0, correctBets: 0, incorrectBets: 0 },
    });
    setCurrentBet(0);
    setPendingHands(1);
    setWrongBetInfo(null);
    setWrongPlayInfo(null);
    setShowResults(false);
    setElapsed(0);
    sessionStart.current = Date.now();
    setPhase('betting');
  };

  // ── Bet ────────────────────────────────────────────────────────────────────
  const addChip = val => {
    if (!gs || val > gs.bankroll - currentBet) return;
    setCurrentBet(p => p + val);
  };

  const handleDeal = () => {
    if (!gs || currentBet === 0) return;
    const optBet = getOptimalBet(tc, betspread);
    if (currentBet !== optBet) {
      setWrongBetInfo({ playerBet: currentBet, expectedBet: optBet, rc: gs.rc, tc, decks: (gs.shoe.length / 52).toFixed(1) });
      return;
    }
    doDeal(gs, true);
  };

  const doDeal = (currentGs, betCorrect) => {
    const cfg = config;
    const numH = pendingHands;
    let { shoe, rc, bankroll, stats } = currentGs;
    bankroll -= currentBet * numH;

    const draw = () => { const r = drawCard(shoe, rc); shoe = r.shoe; rc = r.rc; return r.card; };
    const bH = [[], []];
    const pH = Array(numH).fill(null).map(() => []);

    // ENHC: round-robin, dealer gets 1 card only
    for (let i = 0; i < cfg.numBots; i++) bH[i].push(draw());
    for (let i = 0; i < numH; i++) pH[i].push(draw());
    const d1 = draw();
    for (let i = 0; i < cfg.numBots; i++) bH[i].push(draw());
    for (let i = 0; i < numH; i++) pH[i].push(draw());

    // Bot play
    const dk = normDK(d1.value);
    const finalBots = [...bH];
    for (let i = 0; i < cfg.numBots; i++) {
      if (finalBots[i].length) {
        const res = botPlayFull(finalBots[i], dk, shoe, rc, cfg);
        finalBots[i] = res.hand; shoe = res.shoe; rc = res.rc;
      }
    }

    setGs({
      ...currentGs, shoe, rc, bankroll,
      dealerHand: [d1], botHands: finalBots,
      playerHands: pH, playerBets: Array(numH).fill(currentBet),
      activeHandIdx: 0, roundResult: null,
      stats: { ...stats, hands: stats.hands + 1, [betCorrect ? 'correctBets' : 'incorrectBets']: stats[betCorrect ? 'correctBets' : 'incorrectBets'] + 1 },
    });
    setWrongBetInfo(null);
    // numBots * 2 cards + numH * 2 cards + 1 dealer card
    startDealAnimation(cfg.numBots * 2 + numH * 2 + 1);
    setPhase('playing');
  };

  // ── Player action ──────────────────────────────────────────────────────────
  const handlePlayerAction = action => {
    if (!gs) return;
    const hand = gs.playerHands[gs.activeHandIdx];
    const isFirst = hand.length === 2;
    const optimal = getOptimalAction(hand, gs.dealerHand[0], tc, config, isFirst);

    if (action !== optimal) {
      setWrongPlayInfo({ chosen: action, correct: optimal, handTotal: calculateHandTotal(hand), dealerCard: gs.dealerHand[0]?.value, rc: gs.rc, tc, pendingAction: action });
      setGs(p => ({ ...p, stats: { ...p.stats, incorrectPlays: p.stats.incorrectPlays + 1 } }));
      return;
    }
    setGs(p => ({ ...p, stats: { ...p.stats, correctPlays: p.stats.correctPlays + 1 } }));
    doAction(action, gs);
  };

  const doAction = (action, cur) => {
    let { shoe, rc, bankroll, playerHands, playerBets, activeHandIdx } = cur;
    let hands = playerHands.map(h => [...h]);
    let bets  = [...playerBets];
    const hand = [...hands[activeHandIdx]];
    const bet  = bets[activeHandIdx];
    const draw = () => { const r = drawCard(shoe, rc); shoe = r.shoe; rc = r.rc; return r.card; };

    if (action === 'R') { bankroll += bet / 2; return advance({ ...cur, shoe, rc, bankroll, playerHands: hands, playerBets: bets }, activeHandIdx); }
    if (action === 'S') { return advance({ ...cur, shoe, rc, bankroll, playerHands: hands, playerBets: bets }, activeHandIdx); }

    if (action === 'P') {
      const c1 = draw(), c2 = draw();
      hands.splice(activeHandIdx, 1, [hand[0], c1], [hand[1], c2]);
      bets.splice(activeHandIdx, 1, bet, bet);
      bankroll -= bet;
      return setGs({ ...cur, shoe, rc, bankroll, playerHands: hands, playerBets: bets });
    }

    if (action === 'D') {
      if (bankroll >= bet) { bankroll -= bet; bets[activeHandIdx] = bet * 2; }
      hands[activeHandIdx] = [...hand, draw()];
    } else {
      hands[activeHandIdx] = [...hand, draw()];
    }

    const newTotal = calculateHandTotal(hands[activeHandIdx]);
    const ng = { ...cur, shoe, rc, bankroll, playerHands: hands, playerBets: bets };
    if (newTotal > 21 || action === 'D') { advance(ng, activeHandIdx); }
    else { setGs(ng); }
  };

  const advance = (cur, idx) => {
    const nextIdx = idx + 1;
    if (nextIdx < cur.playerHands.length) {
      setGs({ ...cur, activeHandIdx: nextIdx });
    } else {
      const after = dealerPlay(cur, config);
      setGs(after);
      setPhase('result');
    }
  };

  const dealerPlay = (cur, cfg) => {
    let { shoe, rc, bankroll, dealerHand, playerHands, playerBets, stats } = cur;
    const draw = () => { const r = drawCard(shoe, rc); shoe = r.shoe; rc = r.rc; return r.card; };
    let dh = [...dealerHand, draw()];
    while (true) {
      const tot = calculateHandTotal(dh);
      const s17 = isSoftHand(dh) && tot === 17;
      if (tot >= 17 && !(s17 && !cfg.isS17)) break;
      if (tot > 21) break;
      dh = [...dh, draw()];
    }
    const dt = calculateHandTotal(dh);
    const db = dt > 21;
    let wins = 0, losses = 0, pushes = 0;
    playerHands.forEach((hand, i) => {
      const pt = calculateHandTotal(hand);
      if (pt > 21) { losses++; }
      else if (db || pt > dt) { wins++; bankroll += playerBets[i] * 2; }
      else if (pt === dt) { pushes++; bankroll += playerBets[i]; }
      else { losses++; }
    });
    return { ...cur, shoe, rc, bankroll, dealerHand: dh, roundResult: { dealerTotal: dt, dealerBust: db },
      stats: { ...stats, wins: stats.wins + wins, losses: stats.losses + losses, pushes: stats.pushes + pushes } };
  };

  // ── Wrong overlays ─────────────────────────────────────────────────────────
  const handleWrongBetContinue = () => { setWrongBetInfo(null); doDeal(gs, false); };
  const handleWrongBetFix      = () => { setWrongBetInfo(null); setCurrentBet(0); };
  const handleWrongPlayContinue = () => {
    if (!wrongPlayInfo) return;
    const a = wrongPlayInfo.pendingAction;
    setWrongPlayInfo(null);
    doAction(a, gs);
  };

  const startNewRound = () => {
    if (!gs) return;
    let newGs = { ...gs, dealerHand: [], botHands: [[], []], playerHands: [[]], playerBets: [0], activeHandIdx: 0, roundResult: null };
    const penCards = (config.penetrationDecks || 4.5) * 52;
    if (TOTAL_CARDS - gs.shoe.length >= penCards) {
      newGs = { ...newGs, shoe: shuffleDeck(generateDeck(NUM_DECKS)), rc: 0 };
    }
    setGs(newGs);
    setCurrentBet(0);
    setPendingHands(1);
    setDealStep(999);
    setPhase('betting');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (phase === 'config') return <ConfigScreen onStart={handleStart} />;
  if (!gs || !config) return null;

  if (showResults) {
    return (
      <CasinoResults
        stats={gs.stats}
        startBankroll={startBankroll}
        finalBankroll={gs.bankroll}
        timeSeconds={elapsed}
        onReplay={() => handleStart(config, betspread)}
        onHome={() => navigate('/training')}
      />
    );
  }

  const isPlaying = phase === 'playing';
  const activeHand = gs.playerHands[gs.activeHandIdx] || [];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#071508' }} className="select-none">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, #1a5c35 0%, #0f3d22 50%, #071508 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}/>
      <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '120%', height: 200, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', border: '3px solid rgba(201,168,76,0.2)', borderBottom: 'none', pointerEvents: 'none' }}/>

      {/* ── Wrong Bet Overlay ── */}
      {wrongBetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-orange-950 border-2 border-orange-400 rounded-2xl p-8 max-w-sm w-full text-center">
            <p className="text-4xl font-black text-orange-300 mb-1">⚠ MAUVAISE MISE</p>
            <p className="text-orange-200/60 text-xs mb-6">La mise ne correspond pas à votre grille</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-xs text-red-300 uppercase mb-1">Votre mise</p>
                <p className="text-3xl font-black text-red-400">{wrongBetInfo.playerBet}€</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-xs text-emerald-300 uppercase mb-1">Attendue</p>
                <p className="text-3xl font-black text-emerald-400">{wrongBetInfo.expectedBet}€</p>
              </div>
            </div>
            <div className="flex justify-around text-center mb-6">
              <div><p className="text-gray-500 text-xs">RC</p><p className="text-white font-bold">{wrongBetInfo.rc >= 0 ? `+${wrongBetInfo.rc}` : wrongBetInfo.rc}</p></div>
              <div><p className="text-gray-500 text-xs">TC</p><p className="text-white font-bold">{wrongBetInfo.tc >= 0 ? `+${wrongBetInfo.tc}` : wrongBetInfo.tc}</p></div>
              <div><p className="text-gray-500 text-xs">Jeux restants</p><p className="text-white font-bold">{wrongBetInfo.decks}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleWrongBetFix} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl">Corriger</button>
              <button onClick={handleWrongBetContinue} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl">Continuer quand même</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wrong Play Overlay ── */}
      {wrongPlayInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-red-950 border-2 border-red-500 rounded-2xl p-8 max-w-sm w-full text-center">
            <p className="text-4xl font-black text-red-300 mb-1">✗ MAUVAIS CHOIX</p>
            <p className="text-red-200/50 text-xs mb-6">Décision incorrecte</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-xs text-red-300 uppercase mb-1">Votre choix</p>
                <p className="text-2xl font-black text-red-400">{ACTION_LABELS[wrongPlayInfo.chosen]}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-xs text-emerald-300 uppercase mb-1">Correct</p>
                <p className="text-2xl font-black text-emerald-400">{ACTION_LABELS[wrongPlayInfo.correct]}</p>
              </div>
            </div>
            <div className="flex justify-around mb-6">
              <div><p className="text-gray-500 text-xs">Votre main</p><p className="text-white font-bold">{wrongPlayInfo.handTotal}</p></div>
              <div><p className="text-gray-500 text-xs">Croupier</p><p className="text-white font-bold">{wrongPlayInfo.dealerCard}</p></div>
              <div><p className="text-gray-500 text-xs">RC</p><p className="text-white font-bold">{wrongPlayInfo.rc >= 0 ? `+${wrongPlayInfo.rc}` : wrongPlayInfo.rc}</p></div>
              <div><p className="text-gray-500 text-xs">TC</p><p className="text-white font-bold">{wrongPlayInfo.tc >= 0 ? `+${wrongPlayInfo.tc}` : wrongPlayInfo.tc}</p></div>
            </div>
            <button onClick={handleWrongPlayContinue} className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl">
              Compris, continuer
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      {/* Overlay tableau de stratégie */}
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowChart(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="p-5">
              <StrategyCharts defaultVariant={config.isS17 ? 'S17' : 'H17'} locked />
            </div>
          </div>
        </div>
      )}

      <header className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setPhase('config')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => { setElapsed(Math.floor((Date.now() - sessionStart.current) / 1000)); setShowResults(true); }}
              disabled={gs.stats.hands === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25 disabled:opacity-30 disabled:cursor-not-allowed">
              Terminer
            </button>
            <div>
              <span className="text-white font-bold text-sm">Simulation Casino</span>
              <p className="text-xs text-gray-500 mt-0.5">Début de l'exercice</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* RC / TC avec bouton toggle */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-gray-500 text-xs">RC</p>
                <p className={`font-black text-xl leading-none ${gs.rc > 0 ? 'text-emerald-400' : gs.rc < 0 ? 'text-red-400' : 'text-white'}`}>
                  {(config.showRC || showCounters) ? (gs.rc >= 0 ? `+${gs.rc}` : gs.rc) : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">TC</p>
                <p className={`font-black text-xl leading-none ${tc > 0 ? 'text-emerald-400' : tc < 0 ? 'text-red-400' : 'text-white'}`}>
                  {(config.showTC || showCounters) ? (tc >= 0 ? `+${tc}` : tc) : '—'}
                </p>
              </div>
              <button onClick={() => setShowChart(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 text-[10px] font-bold hidden sm:inline">Tableaux</span>
              </button>
              <button onClick={() => setShowCounters(p => !p)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  showCounters
                    ? 'bg-blue-500/30 border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                }`}>
                {showCounters ? 'Cacher' : 'Voir'}
              </button>
              <button onClick={() => setShowShoe(p => !p)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  showShoe
                    ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                }`}>
                {showShoe ? '🂠 Sabot ON' : '🂠 Sabot OFF'}
              </button>
            </div>
            <div className="text-center border-l border-white/10 pl-4">
              <p className="text-gray-500 text-xs">Bankroll</p>
              <p className="font-black text-xl leading-none text-amber-400">{gs.bankroll}€</p>
              {(() => {
                const pnl = gs.bankroll - startBankroll;
                return pnl !== 0 ? (
                  <p className={`text-xs font-bold leading-none mt-0.5 ${pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnl > 0 ? `+${pnl}€` : `${pnl}€`}
                  </p>
                ) : <p className="text-xs text-gray-600 leading-none mt-0.5">±0€</p>;
              })()}
            </div>
          </div>
        </div>
      </header>

      {/* ── Table ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-5">
        <div className="bg-[#1a5c32] rounded-3xl border-4 border-[#8B6914] shadow-2xl overflow-hidden" style={{ boxShadow: '0 0 0 2px #3d2b05, 0 20px 60px rgba(0,0,0,0.7)' }}>
          {/* Felt texture overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />

          <div className="relative p-5">

            {/* ── DEALER (haut, centré) ── */}
            <div className="flex items-start justify-between mb-4">
              <DiscardTray cardCount={discardCount} total={TOTAL_CARDS} showCounts={showShoe} />

              {/* Dealer au centre */}
              <div className="flex-1 flex flex-col items-center px-4">
                <p className="text-gray-300 text-xs uppercase tracking-widest mb-2 font-semibold">Croupier</p>
                <div className="flex gap-2 justify-center items-end" style={{ minHeight: 80 }}>
                  {gs.dealerHand.length > 0
                    ? gs.dealerHand.map((card, i) => {
                        const step = getCardStep('dealer', 0, i, config.numBots, gs.playerHands.length);
                        const vis = step === -1 || dealStep > step;
                        return (
                          <div key={i} style={{
                            width: 56, height: 80, flexShrink: 0,
                            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                            transform: vis ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(0.6)',
                            opacity: vis ? 1 : 0,
                          }}>
                            <PlayingCard card={card} size="md" />
                          </div>
                        );
                      })
                    : <div style={{ width: 56, height: 80 }} className="rounded-lg border-2 border-dashed border-white/20 bg-white/5" />
                  }
                </div>
                {gs.dealerHand.length > 0 && (
                  <p className={`text-sm font-bold mt-2 ${calculateHandTotal(gs.dealerHand) > 21 ? 'text-red-400' : 'text-gray-300'}`}>
                    {calculateHandTotal(gs.dealerHand) > 21 ? '💥 BUST' : calculateHandTotal(gs.dealerHand)}
                  </p>
                )}
              </div>

              <ShoeDisplay remaining={gs.shoe.length} total={TOTAL_CARDS} showCounts={showShoe} />
            </div>

            {/* ── Divider ── */}
            <div className="border-t-2 border-[#8B6914]/40 mb-4" />

            {/* ── RANGÉE JOUEURS : Bot A | Mains | Bot B (comme au casino) ── */}
            <div className="flex justify-center items-end gap-4 mb-5">

              {/* Bot A (gauche) */}
              {config.numBots >= 1 && (
                <div className="flex flex-col items-center opacity-80">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1.5">Joueur A</p>
                  <div className="flex gap-1 items-end" style={{ minHeight: 60 }}>
                    {gs.botHands[0]?.length > 0
                      ? gs.botHands[0].map((card, i) => {
                          const step = getCardStep('bot', 0, i, config.numBots, gs.playerHands.length);
                          const vis = step === -1 || dealStep > step;
                          return (
                            <div key={i} style={{
                              width: 40, height: 56, flexShrink: 0,
                              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                              transform: vis ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(0.6)',
                              opacity: vis ? 1 : 0,
                            }}>
                              <PlayingCard card={card} size="sm" />
                            </div>
                          );
                        })
                      : <div style={{ width: 40, height: 56 }} className="rounded border border-dashed border-white/10" />
                    }
                  </div>
                  {gs.botHands[0]?.length > 0 && (
                    <p className={`text-xs font-bold mt-1 ${calculateHandTotal(gs.botHands[0]) > 21 ? 'text-red-400' : 'text-gray-500'}`}>
                      {calculateHandTotal(gs.botHands[0]) > 21 ? 'BUST' : calculateHandTotal(gs.botHands[0])}
                    </p>
                  )}
                </div>
              )}

              {/* Mains du joueur */}
              <div className="flex gap-6 items-end">
                {gs.playerHands.map((hand, idx) => {
                  const isAct = isPlaying && idx === gs.activeHandIdx;
                  const outcome = phase === 'result' && gs.roundResult ? (() => {
                    const pt = calculateHandTotal(hand);
                    if (pt > 21) return 'lose';
                    if (gs.roundResult.dealerBust || pt > gs.roundResult.dealerTotal) return 'win';
                    if (pt === gs.roundResult.dealerTotal) return 'push';
                    return 'lose';
                  })() : null;
                  const visibleSteps = [
                    getCardStep('player', idx, 0, config.numBots, gs.playerHands.length),
                    getCardStep('player', idx, 1, config.numBots, gs.playerHands.length),
                  ];
                  return (
                    <HandRow key={idx}
                      label={gs.playerHands.length > 1 ? `Main ${idx + 1}` : 'Votre main'}
                      hand={hand}
                      size="lg"
                      active={isAct}
                      bet={gs.playerBets[idx]}
                      outcome={outcome}
                      visibleSteps={visibleSteps}
                      dealStep={dealStep}
                    />
                  );
                })}
              </div>

              {/* Bot B (droite) */}
              {config.numBots >= 2 && (
                <div className="flex flex-col items-center opacity-80">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1.5">Joueur B</p>
                  <div className="flex gap-1 items-end" style={{ minHeight: 60 }}>
                    {gs.botHands[1]?.length > 0
                      ? gs.botHands[1].map((card, i) => {
                          const step = getCardStep('bot', 1, i, config.numBots, gs.playerHands.length);
                          const vis = step === -1 || dealStep > step;
                          return (
                            <div key={i} style={{
                              width: 40, height: 56, flexShrink: 0,
                              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                              transform: vis ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(0.6)',
                              opacity: vis ? 1 : 0,
                            }}>
                              <PlayingCard card={card} size="sm" />
                            </div>
                          );
                        })
                      : <div style={{ width: 40, height: 56 }} className="rounded border border-dashed border-white/10" />
                    }
                  </div>
                  {gs.botHands[1]?.length > 0 && (
                    <p className={`text-xs font-bold mt-1 ${calculateHandTotal(gs.botHands[1]) > 21 ? 'text-red-400' : 'text-gray-500'}`}>
                      {calculateHandTotal(gs.botHands[1]) > 21 ? 'BUST' : calculateHandTotal(gs.botHands[1])}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Betting Controls ── */}
            {phase === 'betting' && (
              <div className="space-y-4">
                {/* Hand count choice */}
                <div className="flex justify-center gap-3">
                  {[1, 2].map(n => (
                    <button key={n} onClick={() => setPendingHands(n)}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${pendingHands === n ? 'bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                      {n} main{n > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                {/* Current bet display */}
                <div className="text-center">
                  {currentBet > 0
                    ? <p className="text-amber-400 font-black text-4xl">{currentBet}€</p>
                    : <p className="text-gray-500 text-lg">Placez votre mise</p>
                  }
                </div>

                {/* Chips */}
                <div className="flex justify-center gap-3">
                  {CHIPS.map(val => (
                    <button key={val} onClick={() => addChip(val)} disabled={val > gs.bankroll - currentBet}
                      className={`w-16 h-16 rounded-full font-black text-sm border-4 transition-all hover:scale-110 shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                        val === 5   ? 'bg-red-700 border-red-300 text-white' :
                        val === 10  ? 'bg-blue-700 border-blue-300 text-white' :
                        val === 25  ? 'bg-emerald-700 border-emerald-300 text-white' :
                        val === 50  ? 'bg-amber-600 border-yellow-300 text-black' :
                                      'bg-gray-700 border-gray-300 text-white'
                      }`}>
                      {val}€
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  <button onClick={() => setCurrentBet(0)} disabled={currentBet === 0}
                    className="px-6 py-2.5 bg-black/30 hover:bg-black/50 text-white font-bold rounded-xl border border-white/20 disabled:opacity-30 transition-colors">
                    Effacer
                  </button>
                  <button onClick={handleDeal} disabled={currentBet === 0}
                    className="px-12 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl disabled:opacity-30 transition-all hover:scale-105 shadow-lg shadow-amber-500/30 text-base">
                    Distribuer
                  </button>
                </div>
              </div>
            )}

            {/* ── Playing Controls ── */}
            {phase === 'playing' && (
              <div className="flex justify-center flex-wrap gap-2">
                {[
                  { action: 'H', label: 'Tirer',      color: 'bg-emerald-600 hover:bg-emerald-500', show: true },
                  { action: 'S', label: 'Rester',     color: 'bg-red-600 hover:bg-red-500',         show: true },
                  { action: 'D', label: 'Doubler',    color: 'bg-blue-600 hover:bg-blue-500',        show: activeHand.length === 2 && gs.bankroll >= gs.playerBets[gs.activeHandIdx] },
                  { action: 'P', label: 'Séparer',    color: 'bg-purple-600 hover:bg-purple-500',    show: activeHand.length === 2 && getV(activeHand[0]?.value) === getV(activeHand[1]?.value) && gs.bankroll >= gs.playerBets[gs.activeHandIdx] },
                  { action: 'R', label: 'Abandonner', color: 'bg-amber-800 hover:bg-amber-700',      show: config.surrenderAllowed && activeHand.length === 2 },
                ].filter(b => b.show).map(({ action, label, color }) => (
                  <button key={action} onClick={() => handlePlayerAction(action)}
                    className={`px-8 py-3 ${color} text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg`}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Result ── */}
            {phase === 'result' && (
              <div className="text-center">
                <button onClick={startNewRound}
                  className="px-14 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 text-lg">
                  Main suivante →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-4 grid grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Mains', value: gs.stats.hands, c: 'text-white' },
            { label: 'Victoires', value: gs.stats.wins, c: 'text-emerald-400' },
            { label: 'Défaites', value: gs.stats.losses, c: 'text-red-400' },
            { label: 'Égalités', value: gs.stats.pushes, c: 'text-amber-400' },
          ].map(({ label, value, c }) => (
            <div key={label} className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className={`text-xl font-bold ${c}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3" style={{ position: 'relative' }}>
          {!isPro && <ProLockOverlay navigate={navigate} label="Les statistiques EV" />}
          {[
            { label: 'Précision des décisions', ok: gs.stats.correctPlays, total: gs.stats.correctPlays + gs.stats.incorrectPlays },
            { label: 'Précision des mises', ok: gs.stats.correctBets, total: gs.stats.correctBets + gs.stats.incorrectBets },
          ].map(({ label, ok, total }) => (
            <div key={label} className="bg-black/30 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="text-white text-xs font-bold">{total > 0 ? `${Math.round(ok / total * 100)}%` : '—'}</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${total > 0 ? ok / total * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
