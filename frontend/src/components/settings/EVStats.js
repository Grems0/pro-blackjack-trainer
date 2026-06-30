import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useLang } from '../../contexts/LanguageContext';
import InfoTooltip from '../ui/InfoTooltip';

function StatBox({ label, value, sub, color, tooltip }) {
  return (
    <div className="text-center p-3 bg-[#1a1a1d] rounded-lg">
      <div className="flex items-center justify-center gap-1 mb-1">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
        <InfoTooltip text={tooltip} />
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Calcul de l'avantage de base selon les règles de table ───────────────────
// Baseline : ENHC S17, 6 jeux, double sur 2 premières cartes, DAS autorisé,
// pas surrender, BJ 3:2 → edge joueur ≈ -0.55%
// (source : Wizard of Odds / Don Schlesinger, valeurs règle par règle connues)
function computeBaseEdge(tableRules, additionalSettings) {
  let edge = -0.55; // baseline AVEC DAS

  // Nombre de jeux (vs référence 6 jeux)
  const deckAdj = { 1: 0.48, 2: 0.19, 4: 0.06, 6: 0.00, 8: -0.02 };
  edge += (deckAdj[tableRules.numberOfDecks] ?? 0);

  // H17 : le croupier tire sur 17 mou — pénalise le joueur de 0.22%
  if (tableRules.dealerHitsSoft17) edge -= 0.22;

  // DAS : baseline suppose DAS autorisé — on soustrait si indisponible
  if (!tableRules.doubleAfterSplit) edge -= 0.14;

  // Abandon
  if (tableRules.surrender === 'late') edge += 0.07;
  if (tableRules.surrender === 'es10') edge += 0.24;

  // Paiement BJ
  if (tableRules.blackjackPayout === '6:5') edge -= 1.39;

  // Règle de double
  if (additionalSettings?.doubleRule === '9-10-11') edge -= 0.10;
  if (additionalSettings?.doubleRule === '10-11')   edge -= 0.25;

  // Re-séparation des As
  if (tableRules.splitAces === 'resplit') edge += 0.08;

  return edge;
}

// ─── Distribution empirique du TC (données sim CVData, 6 jeux, 75% pen) ──────
// Poids de base à 75% de pénétration. La pénétration réelle étire/compresse
// les queues : plus de pen → plus de TC extrêmes, moins → distribution plus serrée.
const BASE_TC_WEIGHTS = {
  '-3': 0.080,
  '-2': 0.100,
  '-1': 0.160,
   '0': 0.270,
   '1': 0.170,
   '2': 0.100,
   '3': 0.060,
   '4': 0.030,
   '5': 0.020,
   '6': 0.007,
   '7': 0.003,
};

function getTCWeights(penFraction) {
  const ref = 0.75;
  const stretch = penFraction / ref; // >1 étire les queues, <1 les resserre
  const levels = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  const raw = {};

  levels.forEach(tc => {
    const base = BASE_TC_WEIGHTS[String(tc)] ?? 0.001;
    // TC proches de 0 sont peu affectés ; TC extrêmes proportionnellement plus
    const dist = Math.abs(tc);
    raw[tc] = tc === 0 ? base : base * Math.pow(stretch, dist * 0.4);
  });

  const sum = Object.values(raw).reduce((a, b) => a + b, 0);
  const weights = {};
  levels.forEach(tc => { weights[tc] = raw[tc] / sum; });
  return weights;
}

// ─── Calcul principal ─────────────────────────────────────────────────────────
function calculateStats(playerSettings, betSpread, tableRules, additionalSettings) {
  const bankroll      = playerSettings.availableFunds || 0;
  const roundsPerHour = playerSettings.roundsPerHour  || 80;

  const baseEdge  = computeBaseEdge(tableRules, additionalSettings);

  const penValue  = parseFloat(tableRules.penetration) || 4.5;
  const numDecks  = tableRules.numberOfDecks || 6;
  const penFrac   = Math.min(penValue / numDecks, 0.99);
  const tcWeights = getTCWeights(penFrac);

  // Edge par point de TC selon le système de comptage
  // Hi-Lo/Hi-Opt I/Hi-Opt II/Omega II : ~0.50%/TC (balanced systems, similar betting correlation)
  // KO (Knockout) : ~0.45%/TC — système non-balancé, légèrement moins précis sur les bords
  const edgePerTC = additionalSettings?.countingSystem === 'ko' ? 0.45 : 0.50;

  let sumEV     = 0; // sum(bet × hands × edge × weight)
  let sumBet    = 0; // sum(bet × hands × weight)
  let sumWeight = 0;
  let sumSD2    = 0; // sum(sd_per_hand² × weight)

  betSpread.forEach(entry => {
    const w    = tcWeights[entry.index] ?? 0;
    if (w === 0) return;
    const bet  = entry.value;
    if (bet <= 0) return;
    const hands = entry.hands || 1;
    const totalBet = bet * hands;

    // Avantage joueur à ce TC : base + X% par point de TC selon le système
    const edgePct  = baseEdge + entry.index * edgePerTC;

    sumEV     += totalBet * (edgePct / 100) * w;
    sumBet    += totalBet * w;
    sumWeight += w;

    // Écart-type par round :
    // 1 main  → 1.14 × bet
    // 2 mains → corrélation ρ≈0.5 entre les deux mains simultanées
    //   Var(H1+H2) = 2σ² + 2×0.5×σ² = 3σ²  →  SD = √3 × 1.14 × bet ≈ 1.97 × bet
    const sdPerRound = hands === 2 ? 1.97 * bet : 1.14 * bet;
    sumSD2 += sdPerRound * sdPerRound * w;
  });

  if (sumWeight === 0) {
    return { evPerHour: 0, sdPerHour: 0, riskOfRuin: 99, n0Hours: null, avgBet: 0, weightedEdgePct: 0, baseEdge };
  }

  const avgBet         = sumBet    / sumWeight;
  const evPerHand      = sumEV     / sumWeight;
  const variancePerHand = sumSD2   / sumWeight;
  const sdPerHand      = Math.sqrt(variancePerHand);

  const evPerHour  = evPerHand  * roundsPerHour;
  const sdPerHour  = sdPerHand  * Math.sqrt(roundsPerHour);

  // Risque de ruine (formule Gambler's Ruin continue)
  const riskOfRuin = (evPerHour > 0 && variancePerHand > 0)
    ? Math.min(99, Math.exp(-2 * evPerHand * bankroll / variancePerHand) * 100)
    : 99;

  // N-0 : heures pour que l'avantage dépasse la variance
  const n0Hours = evPerHour > 0
    ? Math.round(Math.pow(sdPerHour, 2) / Math.pow(evPerHour, 2))
    : null;

  const weightedEdgePct = avgBet > 0 ? (evPerHand / avgBet) * 100 : 0;

  return { evPerHour, sdPerHour, riskOfRuin, n0Hours, avgBet, weightedEdgePct, baseEdge };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function EVStats() {
  const { playerSettings, betSpread, tableRules, additionalSettings } = useGame();
  const { t } = useLang();
  const s = calculateStats(playerSettings, betSpread, tableRules, additionalSettings);

  const evColor  = s.evPerHour  > 0  ? 'text-emerald-400' : 'text-red-400';
  const rorColor = s.riskOfRuin < 5  ? 'text-emerald-400'
                 : s.riskOfRuin < 20 ? 'text-amber-400'   : 'text-red-400';

  return (
    <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-emerald-400 font-semibold">{t('ev_title')}</h2>
        <span className="text-xs text-gray-500">{t('ev_avg_bet')} ~€{s.avgBet.toFixed(0)}</span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3">
        <StatBox
          label={t('ev_per_hour')}
          value={`${s.evPerHour >= 0 ? '+' : ''}€${s.evPerHour.toFixed(0)}`}
          sub={t('ev_per_hour_sub')}
          color={evColor}
          tooltip={t('ev_tip_ev')}
        />

        <StatBox
          label={t('ev_std_dev')}
          value={`±€${s.sdPerHour.toFixed(0)}`}
          sub={t('ev_std_dev_sub')}
          color="text-white"
          tooltip={t('ev_tip_sd')}
        />

        <StatBox
          label={t('ev_ruin')}
          value={`${s.riskOfRuin.toFixed(1)}%`}
          sub={s.riskOfRuin < 5 ? t('ev_ruin_good') : s.riskOfRuin < 20 ? t('ev_ruin_ok') : t('ev_ruin_bad')}
          color={rorColor}
          tooltip={t('ev_tip_ror')}
        />

        <StatBox
          label={t('ev_n0')}
          value={s.n0Hours ? (s.n0Hours > 5000 ? '5 000+' : s.n0Hours.toLocaleString('fr-FR')) : '∞'}
          sub={t('ev_n0_sub')}
          color="text-white"
          tooltip={t('ev_tip_n0')}
        />
      </div>

      {/* Avantage estimé + base edge */}
      <div className="px-3 pb-3 space-y-2">
        <div className="bg-[#1a1a1d] rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {t('ev_edge_weighted')}
            <InfoTooltip text={t('ev_tip_weighted')} />
          </div>
          <span className={`text-sm font-bold ${s.weightedEdgePct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.weightedEdgePct >= 0 ? '+' : ''}{s.weightedEdgePct.toFixed(2)}%
          </span>
        </div>

        <div className="bg-[#1a1a1d] rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {t('ev_edge_base')}
            <InfoTooltip text={t('ev_tip_base')} />
          </div>
          <span className={`text-sm font-bold ${s.baseEdge > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.baseEdge >= 0 ? '+' : ''}{s.baseEdge.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
