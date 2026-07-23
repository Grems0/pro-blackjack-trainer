// Box-Muller transform: generates a standard normal random variable
function randNormal() {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Monte Carlo Risk of Ruin simulation (infinite-horizon approximation).
 *
 * Each session runs until one of three conditions:
 *   1. Bankroll ≤ 0           → RUIN
 *   2. Bankroll ≥ 4× initial  → SUCCESS (practically safe, stop early)
 *   3. maxHands reached        → counted as survival
 *
 * Uses 2 correlated hand outcomes when hands === 2 (ρ = 0.5).
 * Returns ROR as a percentage (0–100).
 */
export function runMonteCarlo({
  betSpread,
  bankroll,
  tcWeights,
  baseEdge,
  edgePerTC,
  numSessions = 1500,
  maxHands    = 60000,
}) {
  if (!bankroll || bankroll <= 0) return 99;

  // Build cumulative TC distribution for efficient sampling
  const tcEntries = Object.entries(tcWeights)
    .map(([tc, w]) => ({ tc: Number(tc), w }))
    .sort((a, b) => a.tc - b.tc);

  const cumTc = [];
  let cum = 0;
  for (const { tc, w } of tcEntries) {
    cum += w;
    cumTc.push({ tc, cum });
  }
  const lastCum = cumTc[cumTc.length - 1].cum;

  // Bet lookup by TC index
  const betLookup = {};
  betSpread.forEach(entry => {
    if (entry.value > 0) {
      betLookup[entry.index] = {
        bet  : entry.value,
        hands: entry.hands || 1,
      };
    }
  });

  const RHO      = 0.5;
  const RHO_PERP = Math.sqrt(1 - RHO * RHO); // ≈ 0.866
  const successThreshold = bankroll * 4;

  let ruinCount = 0;

  for (let s = 0; s < numSessions; s++) {
    let br     = bankroll;
    let ruined = false;

    for (let r = 0; r < maxHands; r++) {
      // Sample TC from cumulative distribution
      const rand = Math.random() * lastCum;
      let sampledTC = cumTc[cumTc.length - 1].tc;
      for (const { tc, cum: c } of cumTc) {
        if (rand <= c) { sampledTC = tc; break; }
      }

      const entry = betLookup[sampledTC];
      if (!entry) continue; // sit out (bet = 0 or not configured)

      const { bet, hands } = entry;
      const edgeFrac = (baseEdge + sampledTC * edgePerTC) / 100;
      const mean     = bet * edgeFrac;
      const std      = 1.14 * bet;

      const z1 = randNormal();
      br += mean + std * z1;

      if (hands === 2) {
        // Correlated second hand: Z2 = ρ·Z1 + √(1-ρ²)·Z_indep
        const z2 = RHO * z1 + RHO_PERP * randNormal();
        br += mean + std * z2;
      }

      if (br <= 0)                { ruined = true; break; }
      if (br >= successThreshold) { break; } // safely doubled+, stop early
    }

    if (ruined) ruinCount++;
  }

  return (ruinCount / numSessions) * 100;
}
