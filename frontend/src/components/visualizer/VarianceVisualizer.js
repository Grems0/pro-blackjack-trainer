import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import InfoTooltip from '../ui/InfoTooltip';

// ─── Calcul EV / SD depuis les paramètres (même logique qu'EVStats) ───────────

function computeBaseEdge(tr, as_) {
  let edge = -0.55;
  const da = { 1: 0.48, 2: 0.19, 4: 0.06, 6: 0.00, 8: -0.02 };
  edge += da[tr?.numberOfDecks] ?? 0;
  if (tr?.dealerHitsSoft17)           edge -= 0.22;
  if (!tr?.doubleAfterSplit)          edge -= 0.14;
  if (tr?.surrender === 'late')       edge += 0.07;
  if (tr?.surrender === 'es10')       edge += 0.24;
  if (tr?.blackjackPayout === '6:5')  edge -= 1.39;
  if (as_?.doubleRule === '9-10-11')  edge -= 0.10;
  if (as_?.doubleRule === '10-11')    edge -= 0.25;
  if (tr?.splitAces === 'resplit')    edge += 0.08;
  return edge;
}

function getTCWeights(penFrac) {
  const levels = [-3,-2,-1,0,1,2,3,4,5,6,7];
  const mu = -0.3, sigma = 2.2 * (penFrac / 0.75);
  const raw = levels.map(tc => Math.exp(-0.5 * ((tc - mu) / sigma) ** 2));
  const sum = raw.reduce((a,b) => a+b, 0);
  const w = {};
  levels.forEach((tc, i) => { w[tc] = raw[i] / sum; });
  return w;
}

function computeStats(ps, bs, tr, as_) {
  const rph      = ps?.roundsPerHour || 80;
  const bankroll = ps?.availableFunds || 10000;
  const base     = computeBaseEdge(tr, as_);
  const pen      = Math.min((parseFloat(tr?.penetration) || 4.5) / (tr?.numberOfDecks || 6), 0.99);
  const tw       = getTCWeights(pen);

  let sumEV = 0, sumBet = 0, sumW = 0, sumSD2 = 0;
  (bs || []).forEach(e => {
    const w = tw[e.index] ?? 0;
    if (!w || e.value <= 0) return;
    const bet = e.value, h = e.hands || 1;
    const edgePct = base + e.index * 0.5;
    sumEV  += bet * h * (edgePct / 100) * w;
    sumBet += bet * h * w;
    sumW   += w;
    const sd = h === 2 ? 1.97 * bet : 1.14 * bet;
    sumSD2 += sd * sd * w;
  });

  if (!sumW) return { evPerHour: 0, sdPerHour: 0, bankroll, rph };

  const evH = (sumEV / sumW) * rph;
  const sdH = Math.sqrt(sumSD2 / sumW) * Math.sqrt(rph);
  return { evPerHour: evH, sdPerHour: sdH, bankroll, rph };
}

// ─── Moteur de simulation Monte-Carlo ────────────────────────────────────────

function boxMuller() {
  const u1 = Math.random(), u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
}

function runMonteCarlo(bankroll, evPerHour, sdPerHour, hours, n) {
  const paths = [];
  for (let i = 0; i < n; i++) {
    const path = new Float64Array(hours + 1);
    path[0] = bankroll;
    let cur = bankroll;
    for (let h = 1; h <= hours; h++) {
      cur += evPerHour + boxMuller() * sdPerHour;
      path[h] = cur;
    }
    paths.push(path);
  }
  return paths;
}

// ─── Formatage euro ───────────────────────────────────────────────────────────

function fmtEuro(v, sign = false) {
  const abs = Math.abs(v);
  const s   = v < 0 ? '-' : sign ? '+' : '';
  if (abs >= 1_000_000) return `${s}${(abs/1_000_000).toFixed(1)}M€`;
  if (abs >= 10_000)    return `${s}${(abs/1_000).toFixed(0)}k€`;
  if (abs >= 1_000)     return `${s}${(abs/1_000).toFixed(1)}k€`;
  return `${s}${Math.round(abs)}€`;
}

// ─── Couleurs trajectoires ────────────────────────────────────────────────────

const PALETTE = [
  '#22c55e','#3b82f6','#f59e0b','#ec4899',
  '#8b5cf6','#06b6d4','#f97316','#a3e635',
  '#e879f9','#67e8f9',
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function VarianceVisualizer({ isOpen, onClose }) {
  const { playerSettings, betSpread, tableRules, additionalSettings } = useGame();
  const computed = computeStats(playerSettings, betSpread, tableRules, additionalSettings);

  const [hours,        setHours]        = useState(500);
  const [nbTraj,       setNbTraj]       = useState(10);
  const [bankrollEdit, setBankrollEdit] = useState(null);
  const [paths,        setPaths]        = useState([]);
  const [isRunning,    setIsRunning]    = useState(false);

  const canvasRef = useRef(null);

  const bankroll   = bankrollEdit ?? computed.bankroll;
  const evPerHour  = computed.evPerHour;
  const sdPerHour  = computed.sdPerHour;

  // Stats finales
  const evFinal  = evPerHour * hours;
  const sdFinal  = sdPerHour * Math.sqrt(hours);
  const rorPct   = (evPerHour > 0 && sdPerHour > 0)
    ? Math.min(99, Math.exp(-2 * (evPerHour / computed.rph) * bankroll
        / (sdPerHour / Math.sqrt(computed.rph)) ** 2) * 100)
    : 99;

  // Lancer la simulation
  const launch = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      setPaths(runMonteCarlo(bankroll, evPerHour, sdPerHour, hours, nbTraj));
      setIsRunning(false);
    }, 20);
  }, [bankroll, evPerHour, sdPerHour, hours, nbTraj]);

  // ─── Dessin canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const PAD = { t: 24, r: 16, b: 44, l: 76 };
    const CW = W - PAD.l - PAD.r;
    const CH = H - PAD.t - PAD.b;

    // Bornes Y
    let yMin = bankroll + evFinal - 2.2 * sdFinal;
    let yMax = bankroll + evFinal + 2.2 * sdFinal;
    for (const p of paths) {
      for (let h = 0; h <= hours; h++) {
        if (p[h] < yMin) yMin = p[h];
        if (p[h] > yMax) yMax = p[h];
      }
    }
    const yRange = yMax - yMin || 1;
    yMin -= yRange * 0.04;
    yMax += yRange * 0.04;

    const xS = h => PAD.l + (h / hours) * CW;
    const yS = v => PAD.t + CH - ((v - yMin) / (yMax - yMin)) * CH;

    // Fond
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Grille horizontale
    const NHG = 6;
    for (let i = 0; i <= NHG; i++) {
      const v = yMin + (i / NHG) * (yMax - yMin);
      const y = yS(v);
      ctx.strokeStyle = '#1c1c1c';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
      ctx.fillStyle = '#4b5563';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(fmtEuro(v), PAD.l - 6, y + 3);
    }

    // Grille verticale
    const NVG = 8;
    for (let i = 0; i <= NVG; i++) {
      const h = Math.round((i / NVG) * hours);
      const x = xS(h);
      ctx.strokeStyle = '#1c1c1c';
      ctx.beginPath(); ctx.moveTo(x, PAD.t); ctx.lineTo(x, H - PAD.b); ctx.stroke();
      ctx.fillStyle = '#4b5563';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${h}h`, x, H - PAD.b + 14);
    }

    // Label axe X
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Heures jouées', W / 2, H - 4);

    // ─── Bande 2 SD (zone rouge) ───────────────────────────────────────────
    const STEP = Math.max(1, Math.floor(hours / 400));
    const bandPath = (mult) => {
      const pts = [];
      for (let h = 0; h <= hours; h += STEP) pts.push([h, bankroll + evPerHour*h + mult * sdPerHour * Math.sqrt(h)]);
      pts.push([hours, bankroll + evPerHour*hours + mult * sdPerHour * Math.sqrt(hours)]);
      return pts;
    };

    const upper2 = bandPath(+2), lower2 = bandPath(-2);
    const upper1 = bandPath(+1), lower1 = bandPath(-1);

    function fillBand(upper, lower, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      upper.forEach(([h, v], i) => i === 0 ? ctx.moveTo(xS(h), yS(v)) : ctx.lineTo(xS(h), yS(v)));
      for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(xS(lower[i][0]), yS(lower[i][1]));
      ctx.closePath();
      ctx.fill();
    }

    fillBand(upper2, lower2, 'rgba(239,68,68,0.07)');
    fillBand(upper1, lower1, 'rgba(245,158,11,0.11)');

    // Contours SD
    function drawLine(pts, color, dash) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      pts.forEach(([h, v], i) => i === 0 ? ctx.moveTo(xS(h), yS(v)) : ctx.lineTo(xS(h), yS(v)));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawLine(upper2, 'rgba(239,68,68,0.55)',  [3,3]);
    drawLine(lower2, 'rgba(239,68,68,0.55)',  [3,3]);
    drawLine(upper1, 'rgba(245,158,11,0.65)', [3,3]);
    drawLine(lower1, 'rgba(245,158,11,0.65)', [3,3]);

    // ─── Trajectoires ──────────────────────────────────────────────────────
    const opacity = nbTraj >= 1000 ? 0.05 : nbTraj >= 100 ? 0.18 : 0.75;
    ctx.lineWidth  = nbTraj >= 100 ? 0.7 : 1.5;

    for (let i = 0; i < paths.length; i++) {
      const p     = paths[i];
      const color = nbTraj <= 10 ? PALETTE[i % PALETTE.length] : '#34d399';
      ctx.strokeStyle  = color;
      ctx.globalAlpha  = opacity;
      ctx.beginPath();
      for (let h = 0; h <= hours; h += STEP) {
        const v = p[Math.min(h, hours)];
        h === 0 ? ctx.moveTo(xS(h), yS(v)) : ctx.lineTo(xS(h), yS(v));
      }
      ctx.lineTo(xS(hours), yS(p[hours]));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ─── Ligne EV ──────────────────────────────────────────────────────────
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth   = 2.5;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(xS(0),     yS(bankroll));
    ctx.lineTo(xS(hours), yS(bankroll + evFinal));
    ctx.stroke();
    ctx.setLineDash([]);

    // Point de départ
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(xS(0), yS(bankroll), 4, 0, Math.PI * 2);
    ctx.fill();

    // Label EV finale
    if (paths.length > 0) {
      const evY = yS(bankroll + evFinal);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(fmtEuro(bankroll + evFinal), xS(hours) + 4, evY + 4);
    }

  }, [paths, hours, bankroll, evPerHour, sdPerHour, nbTraj, evFinal, sdFinal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div className="bg-[#141414] rounded-2xl w-full max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Visualisateur de Variance</h2>
            <p className="text-xs text-gray-500 mt-0.5">Simulation Monte-Carlo · Blackjack ENHC Hi-Lo</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ─── Paramètres ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* Capital */}
            <div className="bg-[#1a1a1d] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-xs text-gray-400">Capital initial</label>
                <InfoTooltip text="Bankroll de départ pour la simulation. Correspond à votre 'Bankroll disponible' dans les paramètres joueur. Modifiable ici pour tester différents scénarios." />
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                <input
                  type="number"
                  value={bankrollEdit ?? computed.bankroll}
                  onChange={e => setBankrollEdit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-2 py-2 pl-6 text-white text-sm"
                />
              </div>
            </div>

            {/* Heures */}
            <div className="bg-[#1a1a1d] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-xs text-gray-400">Heures simulées</label>
                <InfoTooltip text="Durée totale de la simulation. 500h ≈ 1-2 ans de jeu sérieux. Plus d'heures → la courbe réelle converge progressivement vers l'EV théorique." />
              </div>
              <input
                type="number"
                value={hours}
                min={10} max={2000}
                onChange={e => setHours(Math.max(10, Math.min(2000, parseInt(e.target.value) || 100)))}
                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            {/* EV/h */}
            <div className="bg-[#1a1a1d] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-xs text-gray-400">EV / heure</label>
                <InfoTooltip text="Gain théorique moyen par heure calculé depuis votre spread de mise, les règles de la table et la pénétration. Modifiez vos paramètres de jeu pour changer cette valeur." />
              </div>
              <p className={`text-xl font-bold ${evPerHour >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {evPerHour >= 0 ? '+' : ''}{evPerHour.toFixed(0)}€/h
              </p>
              <p className="text-xs text-gray-600 mt-0.5">depuis vos paramètres</p>
            </div>

            {/* SD/h */}
            <div className="bg-[#1a1a1d] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-xs text-gray-400">Écart-type / heure</label>
                <InfoTooltip text="Mesure la volatilité par heure. 68% du temps votre gain réel sera dans l'intervalle [EV−σ, EV+σ]. Un σ élevé signifie de grands swings possibles, même avec un avantage positif." />
              </div>
              <p className="text-xl font-bold text-white">±{sdPerHour.toFixed(0)}€/h</p>
              <p className="text-xs text-gray-600 mt-0.5">depuis vos paramètres</p>
            </div>
          </div>

          {/* ─── Contrôles simulation ────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Trajectoires :</span>
              {[10, 100, 1000].map(n => (
                <button
                  key={n}
                  onClick={() => setNbTraj(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    nbTraj === n
                      ? 'bg-emerald-600/80 text-white border border-emerald-500'
                      : 'bg-[#1a1a1d] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {n}
                </button>
              ))}
              <InfoTooltip text="Nombre de joueurs virtuels simulés. 10 = trajectoires individuelles colorées (vue détaillée). 100 = vue d'ensemble. 1000 = vue statistique de la population entière." />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {paths.length > 0 && (
                <button
                  onClick={() => setPaths([])}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Effacer
                </button>
              )}
              <button
                onClick={launch}
                disabled={isRunning || evPerHour === 0}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Calcul en cours…' : 'Lancer la simulation'}
              </button>
            </div>
          </div>

          {/* ─── Canvas ─────────────────────────────────────────────────── */}
          <div className="rounded-xl overflow-hidden bg-[#0a0a0a]">
            <canvas
              ref={canvasRef}
              width={1080}
              height={440}
              className="w-full block"
            />
          </div>

          {/* ─── Légende ─────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 border-t-2 border-dashed border-emerald-400" />
              <span>EV théorique</span>
              <InfoTooltip text="Ligne verte pointillée : progression parfaite si vous jouiez exactement à votre avantage moyen sans variance. C'est l'objectif long-terme du compteur." />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded" style={{background:'rgba(245,158,11,0.35)'}} />
              <span>Zone 1 SD — 68%</span>
              <InfoTooltip text="Zone amber : 68% des joueurs se retrouveront dans cet intervalle à tout moment. Une variance 'normale' et prévisible pour un compteur de cartes." />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded" style={{background:'rgba(239,68,68,0.25)'}} />
              <span>Zone 2 SD — 95%</span>
              <InfoTooltip text="Zone rouge : 95% des joueurs restent dans ces bornes. Toucher la borne inférieure = bad run extrême mais mathématiquement possible. La borne supérieure = run exceptionnel." />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t border-emerald-400 opacity-50" />
              <span>Trajectoires simulées</span>
              <InfoTooltip text="Chaque courbe = un joueur virtuel dont les résultats sont simulés main par main selon votre EV et votre écart-type." />
            </div>
          </div>

          {/* ─── Stats finales ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: 'EV finale',
                value: fmtEuro(evFinal, true),
                color: evPerHour >= 0 ? 'text-emerald-400' : 'text-red-400',
                tooltip: `Gain théorique cumulé après ${hours}h à ${evPerHour.toFixed(0)}€/h. C'est la valeur attendue en moyenne sur un très grand nombre de sessions.`,
              },
              {
                label: 'Fourchette 1 SD',
                value: `${fmtEuro(evFinal - sdFinal, true)} / ${fmtEuro(evFinal + sdFinal, true)}`,
                color: 'text-amber-400',
                tooltip: `Intervalle dans lequel 68% des joueurs se retrouveront après ${hours}h. C'est la variance classique attendue pour un compteur.`,
              },
              {
                label: 'Fourchette 2 SD',
                value: `${fmtEuro(evFinal - 2*sdFinal, true)} / ${fmtEuro(evFinal + 2*sdFinal, true)}`,
                color: 'text-red-400',
                tooltip: `Intervalle dans lequel 95% des joueurs se retrouveront après ${hours}h. Sortir de ces bornes est statistiquement très rare (5% de chances).`,
              },
              {
                label: 'Risque de ruine',
                value: `${rorPct.toFixed(1)}%`,
                color: rorPct < 5 ? 'text-emerald-400' : rorPct < 20 ? 'text-amber-400' : 'text-red-400',
                tooltip: 'Probabilité mathématique de perdre toute votre bankroll à un moment quelconque. Objectif : < 5%. Pour réduire : plus d\'unités en bankroll ou spread moins agressif.',
              },
              {
                label: 'Mains / heure',
                value: `${computed.rph}`,
                color: 'text-gray-300',
                tooltip: 'Nombre de mains jouées par heure repris de vos paramètres joueur (vitesse de table × nombre de joueurs à la table).',
              },
            ].map(({ label, value, color, tooltip }) => (
              <div key={label} className="bg-[#1a1a1d] rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-500">{label}</span>
                  <InfoTooltip text={tooltip} />
                </div>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
