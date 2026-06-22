import React from 'react';
import { useGame } from '../../contexts/GameContext';
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

// ─── Distribution approx. du TC selon la pénétration ─────────────────────────
// Plus la pénétration est élevée, plus les TC extrêmes sont fréquents.
function getTCWeights(penFraction) {
  const levels = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  const mu = -0.3;                    // léger biais vers les TC négatifs
  const sigma = 2.2 * (penFraction / 0.75); // étalée par la pénétration
  const raw = levels.map(tc =>
    Math.exp(-0.5 * Math.pow((tc - mu) / sigma, 2))
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  const weights = {};
  levels.forEach((tc, i) => { weights[tc] = raw[i] / sum; });
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
  const s = calculateStats(playerSettings, betSpread, tableRules, additionalSettings);

  const evColor  = s.evPerHour  > 0  ? 'text-emerald-400' : 'text-red-400';
  const rorColor = s.riskOfRuin < 5  ? 'text-emerald-400'
                 : s.riskOfRuin < 20 ? 'text-amber-400'   : 'text-red-400';

  return (
    <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-emerald-400 font-semibold">Statistiques EV</h2>
        <span className="text-xs text-gray-500">Mise moy. ~€{s.avgBet.toFixed(0)}</span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3">
        <StatBox
          label="EV / heure"
          value={`${s.evPerHour >= 0 ? '+' : ''}€${s.evPerHour.toFixed(0)}`}
          sub="gain attendu par heure"
          color={evColor}
          tooltip="Gain moyen attendu par heure, calculé à partir de votre spread de mise, des règles de la table et de la pénétration. Varie en temps réel avec vos paramètres."
        />

        <StatBox
          label="Écart-type / heure"
          value={`±€${s.sdPerHour.toFixed(0)}`}
          sub="variance normale"
          color="text-white"
          tooltip="Volatilité de vos résultats sur une heure. 68% du temps vos gains réels seront dans [EV − σ, EV + σ]. Élevé au blackjack — c'est la variance qui masque votre avantage à court terme."
        />

        <StatBox
          label="Risque de ruine"
          value={`${s.riskOfRuin.toFixed(1)}%`}
          sub={s.riskOfRuin < 5 ? 'excellent' : s.riskOfRuin < 20 ? 'acceptable' : 'trop élevé'}
          color={rorColor}
          tooltip="Probabilité de perdre toute votre bankroll avant d'être profitable. Objectif : sous 5%. Pour réduire : augmentez votre bankroll (plus d'unités) ou réduisez votre spread."
        />

        <StatBox
          label="N-0 (heures)"
          value={s.n0Hours ? (s.n0Hours > 5000 ? '5 000+' : s.n0Hours.toLocaleString('fr-FR')) : '∞'}
          sub="pour prouver l'avantage"
          color="text-white"
          tooltip="Heures de jeu nécessaires pour que votre avantage statistique soit visible avec certitude (signal > bruit). Typiquement 200–1000h pour un compteur régulier."
        />
      </div>

      {/* Avantage estimé + base edge */}
      <div className="px-3 pb-3 space-y-2">
        <div className="bg-[#1a1a1d] rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            Avantage joueur pondéré
            <InfoTooltip text="Avantage moyen pondéré sur le casino en tenant compte de votre spread de mise et de la distribution du TC. Un compteur efficace vise +0.5% à +1%." />
          </div>
          <span className={`text-sm font-bold ${s.weightedEdgePct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.weightedEdgePct >= 0 ? '+' : ''}{s.weightedEdgePct.toFixed(2)}%
          </span>
        </div>

        <div className="bg-[#1a1a1d] rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            Edge de base (sans comptage)
            <InfoTooltip text="Avantage maison calculé uniquement à partir des règles de la table, sans comptage. Reflète l'impact des règles (H17, DAS, abandon, paiement BJ…) sur votre edge de départ." />
          </div>
          <span className={`text-sm font-bold ${s.baseEdge > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.baseEdge >= 0 ? '+' : ''}{s.baseEdge.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
