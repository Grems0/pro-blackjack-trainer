/* eslint-disable no-restricted-globals */

// ─── SHOE ────────────────────────────────────────────────────────────────────
function createShoe(numDecks) {
  const vals = [2,3,4,5,6,7,8,9,10,10,10,10,11];
  const shoe = [];
  for (let d = 0; d < numDecks; d++)
    for (const v of vals)
      for (let s = 0; s < 4; s++)
        shoe.push(v);
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = shoe[i]; shoe[i] = shoe[j]; shoe[j] = t;
  }
  return shoe;
}

// ─── HI-LO ───────────────────────────────────────────────────────────────────
function hiLo(c) { return c <= 6 ? 1 : (c === 10 || c === 11) ? -1 : 0; }

// ─── HAND VALUE ──────────────────────────────────────────────────────────────
function handVal(cards) {
  let t = 0, a = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i] === 11) { a++; t += 11; } else t += cards[i];
  }
  while (t > 21 && a-- > 0) t -= 10;
  return t;
}
function isSoft(cards) {
  let t = 0, a = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i] === 11) { a++; t += 11; } else t += cards[i];
  }
  return a > 0 && t <= 21;
}

// ─── BASIC STRATEGY (ENHC — European No Hole Card) ───────────────────────────
// Tables extraites exactement de mockData.js (basicStrategyHardENHCS17, etc.)
// Dealer index: 2→0, 3→1, ..., 10→8, A(11)→9
const H=0,S=1,D=2,Ds=3,P=4,R=6;
// D=double/hit, Ds=double/stand, R=surrender/hit

function dI(c) { return c === 11 ? 9 : c - 2; }

// Hard [total-4][dI]: totals 4-17
// ENHC S17 — 11 vs A = H (pas D), pas de surrender dans la stratégie de base
const HARD_S17=[
  [H,H,H,H,H,H,H,H,H,H],[H,H,H,H,H,H,H,H,H,H],[H,H,H,H,H,H,H,H,H,H],
  [H,H,H,H,H,H,H,H,H,H],[H,H,H,H,H,H,H,H,H,H],
  [H,D,D,D,D,H,H,H,H,H],[D,D,D,D,D,D,D,D,H,H],[D,D,D,D,D,D,D,D,D,H], // 11 vs A = H
  [H,H,S,S,S,H,H,H,H,H],[S,S,S,S,S,H,H,H,H,H],[S,S,S,S,S,H,H,H,H,H],
  [S,S,S,S,S,H,H,H,H,H],[S,S,S,S,S,H,H,H,H,H],[S,S,S,S,S,S,S,S,S,S], // 15/16: H vs hautes (pas R)
];
// ENHC H17 — 11 vs A = D, surrender autorisé sur 15/16 vs hautes
const HARD_H17=[
  [H,H,H,H,H,H,H,H,H,H],[H,H,H,H,H,H,H,H,H,H],[H,H,H,H,H,H,H,H,H,H],
  [H,H,H,H,H,H,H,H,H,H],[H,H,H,H,H,H,H,H,H,H],
  [H,D,D,D,D,H,H,H,H,H],[D,D,D,D,D,D,D,D,H,H],[D,D,D,D,D,D,D,D,D,D], // 11 vs A = D
  [H,H,S,S,S,H,H,H,H,H],[S,S,S,S,S,H,H,H,H,H],[S,S,S,S,S,H,H,H,H,H],
  [S,S,S,S,S,H,H,H,R,R],[S,S,S,S,S,H,H,R,R,R],[S,S,S,S,S,S,S,S,S,S], // 15/16: R vs hautes
];

// Soft [total-13][dI]: soft 13-20
// ENHC S17 — A7 vs 2 = S (pas Ds), vs A = H (pas S)
const SOFT_S17=[
  [H,H,H,D,D,H,H,H,H,H],[H,H,H,D,D,H,H,H,H,H],
  [H,H,D,D,D,H,H,H,H,H],[H,H,D,D,D,H,H,H,H,H],
  [H,D,D,D,D,H,H,H,H,H],
  [S,Ds,Ds,Ds,Ds,S,S,H,H,H], // soft 18: vs 2=S, vs 3-6=Ds, vs A=H
  [S,S,S,S,S,S,S,S,S,S],[S,S,S,S,S,S,S,S,S,S],
];
// ENHC H17 — A6 vs 2 = D, A7 vs 2 = Ds, A8 vs 6 = Ds
const SOFT_H17=[
  [H,H,H,D,D,H,H,H,H,H],[H,H,H,D,D,H,H,H,H,H],
  [H,H,D,D,D,H,H,H,H,H],[H,H,D,D,D,H,H,H,H,H],
  [D,D,D,D,D,H,H,H,H,H],  // soft 17 (A6): vs 2 = D (pas H!)
  [Ds,Ds,Ds,Ds,Ds,S,S,H,H,H], // soft 18: vs 2=Ds, vs A=H
  [S,S,S,S,Ds,S,S,S,S,S],     // soft 19 (A8): vs 6=Ds
  [S,S,S,S,S,S,S,S,S,S],
];

// Paires ENHC — deux tables selon DAS (extrait de mockData.js)
const PAIR_ENHC_DAS={
  2: [P,P,P,P,P,P,H,H,H,H],
  3: [P,P,P,P,P,P,H,H,H,H],
  4: [H,H,H,P,P,H,H,H,H,H],  // P vs 5-6 avec DAS
  5: [D,D,D,D,D,D,D,D,H,H],
  6: [P,P,P,P,P,H,H,H,H,H],  // P vs 2-6 avec DAS
  7: [P,P,P,P,P,P,H,H,H,H],
  8: [P,P,P,P,P,P,P,P,P,H],  // ENHC: H vs A
  9: [P,P,P,P,P,S,P,P,S,S],
  10:[S,S,S,S,S,S,S,S,S,S],
  11:[P,P,P,P,P,P,P,P,P,P],
};
const PAIR_ENHC_NODAS={
  2: [H,P,P,P,P,P,H,H,H,H],  // H vs 2 sans DAS
  3: [H,P,P,P,P,P,H,H,H,H],  // H vs 2 sans DAS
  4: [H,H,H,H,H,H,H,H,H,H],  // pas séparer sans DAS
  5: [D,D,D,D,D,D,D,D,H,H],
  6: [H,P,P,P,P,H,H,H,H,H],  // H vs 2 sans DAS
  7: [P,P,P,P,P,P,H,H,H,H],
  8: [P,P,P,P,P,P,P,P,P,H],  // ENHC: H vs A
  9: [P,P,P,P,P,S,P,P,S,S],
  10:[S,S,S,S,S,S,S,S,S,S],
  11:[P,P,P,P,P,P,P,P,P,P],
};

function getAction(cards, dealerUp, canDbl, canSpl, surrender, rules) {
  const { h17, das } = rules;
  const di = dI(dealerUp);
  const v  = handVal(cards);
  const sf = isSoft(cards);

  // Pair — table DAS ou no-DAS selon les règles
  if (canSpl && cards.length === 2 && cards[0] === cards[1]) {
    const cv = cards[0];
    if (cv !== 5) {
      const pairTable = das ? PAIR_ENHC_DAS : PAIR_ENHC_NODAS;
      const a = pairTable[cv]?.[di] ?? H;
      if (a === P) return 'P';
      if (a === S) return 'S';
    }
  }

  if (v >= 21) return 'S';

  // Soft
  if (sf && v >= 13 && v <= 20) {
    const a = (h17 ? SOFT_H17 : SOFT_S17)[v - 13][di];
    if (a === Ds) return canDbl ? 'D' : 'S';
    if (a === D)  return canDbl ? 'D' : 'H';
    return a === S ? 'S' : 'H';
  }

  if (v >= 17) return 'S';
  if (v <= 8)  return 'H';

  const a = (h17 ? HARD_H17 : HARD_S17)[v - 4][di];
  if (a === D)  return canDbl ? 'D' : 'H';
  if (a === Ds) return canDbl ? 'D' : 'S';
  if (a === R)  return surrender ? 'R' : 'H';
  return a === S ? 'S' : 'H';
}

// ─── DEVIATIONS (ENHC S17 / H17 + Surrender optionnel) ──────────────────────
// Reproduit exactement les tables deviationsS17 / deviationsH17 /
// surrenderDeviationsS17 / surrenderDeviationsH17 de mockData.js
function getDeviation(cards, dealerUp, canDbl, canSpl, tc, rules) {
  const { h17, surrender } = rules;
  const hasSurrender = surrender && surrender !== 'no' && surrender !== 'none';
  const v  = handVal(cards);
  const sf = isSoft(cards);
  const n  = cards.length;
  const isPair = n === 2 && cards[0] === cards[1];

  // ── Surrender deviations (Fab 4 ENHC) ────────────────────────────────────
  if (hasSurrender && n === 2) {
    if (h17) {
      // surrenderDeviationsH17
      if (isPair && cards[0] === 8 && dealerUp === 11 && tc >= 5) return 'R'; // 8,8 vs A >= +5
      if (v === 15 && dealerUp === 9  && tc >= 2)  return 'R';
      if (v === 15 && dealerUp === 11 && tc >= 1)  return 'R';
      if (v === 14 && dealerUp === 10 && tc >= 3)  return 'R';
      if (v === 14 && dealerUp === 11 && tc >= 4)  return 'R';
    } else {
      // surrenderDeviationsS17
      if (isPair && cards[0] === 8 && dealerUp === 11 && tc >= 6) return 'P'; // 8,8 vs A >= +6 → Split
      if (v === 15 && dealerUp === 9  && tc >= 2)  return 'R';
      if (v === 15 && dealerUp === 11 && tc >= 1)  return 'R';
      if (v === 14 && dealerUp === 10 && tc >= 3)  return 'R';
    }
  }

  // ── Hard deviations ───────────────────────────────────────────────────────
  if (!sf) {
    // Stand deviations (upward: stand when TC high enough)
    if (v === 16 && dealerUp === 10 && tc >= 0)  return 'S';
    if (v === 16 && dealerUp === 11 && tc >= (h17 ? 3 : 4)) return 'S'; // ENHC: +4 S17, +3 H17
    if (v === 16 && dealerUp === 9  && tc >= 4)  return 'S'; // ENHC: +4 (pas +5)
    if (v === 15 && dealerUp === 10 && tc >= 4)  return 'S';
    if (v === 15 && dealerUp === 11 && tc >= (h17 ? 2 : 1)) return 'S'; // H17: +2, S17: +1
    if (v === 12 && dealerUp === 2  && tc >= 3)  return 'S';
    if (v === 12 && dealerUp === 3  && tc >= 2)  return 'S';

    // Hit deviations (downward: hit when TC below threshold)
    if (v === 12 && dealerUp === 4  && tc < 0)   return 'H';
    if (v === 12 && dealerUp === 5  && tc < -2)  return 'H';
    if (v === 12 && dealerUp === 6  && tc < -1)  return 'H';
    if (v === 13 && dealerUp === 2  && tc < -1)  return 'H';
    if (v === 13 && dealerUp === 3  && tc < -2)  return 'H';

    // Double deviations (initial 2 cards only)
    if (canDbl && n === 2) {
      if (v === 11 && dealerUp === 11 && !h17 && tc >= 3) return 'D'; // ENHC S17: 11 vs A >= +3
      if (v === 10 && dealerUp === 10 && tc >= 4)         return 'D';
      if (v === 10 && dealerUp === 11 && tc >= (h17 ? 3 : 4)) return 'D'; // H17: +3, S17: +4
      if (v === 9  && dealerUp === 2  && tc >= 1)         return 'D';
      if (v === 9  && dealerUp === 7  && tc >= 3)         return 'D';
    }
  }

  // ── Soft deviation (H17 only) ─────────────────────────────────────────────
  if (sf && h17 && canDbl && n === 2 && v === 18 && dealerUp === 2 && tc >= 1) return 'D'; // A,7 vs 2

  return null; // pas de déviation → stratégie de base
}

// ─── PLAY ONE ROUND ──────────────────────────────────────────────────────────
// Returns net profit; draws cards from shoe via drawCard()
function canDouble(cards, doubleRule) {
  if (doubleRule === 'any2') return true;
  const v = handVal(cards);
  const sf = isSoft(cards);
  if (doubleRule === '10-11') return !sf && (v === 10 || v === 11);
  if (doubleRule === '9-10-11') return !sf && v >= 9 && v <= 11;
  return true;
}

function playRound(drawCard, dealerUp, dealerHole, bet, rules, maxSplits, tc) {
  const { h17, surrender, enhc, doubleRule } = rules;
  const hasSurrender = surrender && surrender !== 'no' && surrender !== 'none';
  const dealerBJ = handVal([dealerUp, dealerHole]) === 21;

  // ── Insurance deviation (Illustrious 18 #1) ──────────────────────────────
  let insuranceProfit = 0;
  if (dealerUp === 11 && tc >= 3) {
    const insuranceBet = bet / 2;
    insuranceProfit = dealerBJ ? insuranceBet : -insuranceBet;
  }

  // Initial hands queue
  const hands = [{ cards: [drawCard(), drawCard()], bet, splits: 0, aceSplit: false }];
  const dealerCards = [dealerUp, dealerHole];

  // ── Hole card game: peek for BJ before players act ───────────────────────
  // ENHC: no peek — players complete their hands even if dealer has BJ
  const pBJ = handVal(hands[0].cards) === 21;
  if (!enhc) {
    if (pBJ && dealerBJ) return insuranceProfit;           // push
    if (pBJ)             return insuranceProfit + 1.5 * bet;
    if (dealerBJ)        return insuranceProfit - bet;     // lose original bet only
  } else {
    // ENHC: player BJ checked, but dealer BJ resolved after players act
    if (pBJ) return insuranceProfit + (dealerBJ ? 0 : 1.5 * bet);
  }

  // Play each player hand
  let hi = 0;
  while (hi < hands.length) {
    const hnd = hands[hi];
    if (hnd.aceSplit) { hnd.cards.push(drawCard()); hi++; continue; }

    let done = false;
    while (!done) {
      const v = handVal(hnd.cards);
      if (v >= 21) break;

      const canDbl = hnd.cards.length === 2 && canDouble(hnd.cards, doubleRule);
      const canSpl = hnd.cards.length === 2 &&
                     hnd.cards[0] === hnd.cards[1] &&
                     hnd.splits < maxSplits - 1;

      // Check deviation first, then fall back to basic strategy
      const act = getDeviation(hnd.cards, dealerUp, canDbl, canSpl, tc, rules)
               ?? getAction(hnd.cards, dealerUp, canDbl, canSpl, hasSurrender, rules);

      if (act === 'S') { break; }
      if (act === 'R') { hnd.surrendered = true; done = true; break; }
      if (act === 'D') {
        hnd.cards.push(drawCard());
        hnd.bet *= 2;
        break;
      }
      if (act === 'P') {
        const isAce = hnd.cards[0] === 11;
        const newHnd = { cards: [hnd.cards[1], drawCard()], bet: bet, splits: hnd.splits + 1, aceSplit: isAce };
        hnd.cards = [hnd.cards[0], drawCard()];
        hnd.splits++;
        hnd.aceSplit = isAce;
        hands.splice(hi + 1, 0, newHnd);
        if (isAce) { hnd.cards.push(drawCard()); done = true; }
        continue;
      }
      // Hit
      hnd.cards.push(drawCard());
    }
    hi++;
  }

  // Dealer plays
  while (true) {
    const dv = handVal(dealerCards);
    if (dv > 21) break;
    const hitSoft17 = h17 && dv === 17 && isSoft(dealerCards);
    if (dv >= 17 && !hitSoft17) break;
    dealerCards.push(drawCard());
  }
  const dFinal = handVal(dealerCards);
  const dBust  = dFinal > 21;

  // ── ENHC: dealer BJ after players have acted → all hands lose full bet ────
  if (enhc && dealerBJ) {
    let loss = insuranceProfit;
    for (const hnd of hands) {
      loss -= hnd.bet; // lose full bet including doubles
    }
    return loss;
  }

  // Settle normally
  let profit = insuranceProfit;
  for (const hnd of hands) {
    const hv = handVal(hnd.cards);
    if (hnd.surrendered) { profit -= hnd.bet / 2; continue; }
    if (hv > 21)         { profit -= hnd.bet; continue; }
    if (dBust || hv > dFinal) { profit += hnd.bet; }
    else if (hv < dFinal)     { profit -= hnd.bet; }
    // push: 0
  }
  return profit;
}

// ─── SIMULATION ──────────────────────────────────────────────────────────────
function simulate(cfg) {
  const {
    numDecks, penetration, betSpread, bankroll,
    tableRules, additionalSettings = {},
    roundsPerHour = 80, numPlayers = 5,
    numSessions = 1500,
  } = cfg;

  const maxSplits = tableRules.maxSplits || 4;
  const doubleRule = additionalSettings.doubleRule || 'any2'; // 'any2' | '9-10-11' | '10-11'
  const rules = {
    h17       : tableRules.dealerHitsSoft17,
    das       : tableRules.doubleAfterSplit,
    surrender : tableRules.surrender,
    enhc      : tableRules.enhc !== false,
    doubleRule,
  };

  // Cartes brûlées lors d'un sit-out : 3 cartes × nombre de joueurs à la table
  const sitOutBurn = numPlayers * 3;

  const totalCards = numDecks * 52;
  const cutAt = Math.floor(totalCards * penetration);

  // Bet lookup by TC index
  const betLookup = {};
  betSpread.forEach(e => { if (e.value > 0) betLookup[e.index] = { bet: e.value, hands: e.hands || 1 }; });

  const successBR = bankroll * 4;
  let ruinCount = 0;

  // EV / variance tracking across all hands
  let sumProfit        = 0;
  let sumProfit2       = 0;
  let totalRounds      = 0; // rounds where a bet was placed
  let totalOpportunities = 0; // all round opportunities (played + sat out)

  for (let s = 0; s < numSessions; s++) {
    let br = bankroll;

    // Keep playing shoes until ruin or success
    while (br > 0 && br < successBR) {
      const shoe = createShoe(numDecks);
      let pos = 0;
      let rc  = 0;

      const drawCard = () => {
        const c = shoe[pos++];
        rc += hiLo(c);
        return c;
      };

      // Play hands in this shoe
      while (pos + 12 < cutAt && br > 0 && br < successBR) {
        const rem = (shoe.length - pos) / 52;
        const tc  = rem > 0 ? Math.trunc(rc / rem) : 0;
        const tcC = Math.max(-3, Math.min(7, tc));

        totalOpportunities++;

        const entry = betLookup[tcC];
        if (!entry) {
          // Brûler les cartes d'un tour complet : dealer (2) + numPlayers × 3 ≈ sitOutBurn + 2
          for (let b = 0; b < sitOutBurn + 2 && pos < shoe.length; b++) drawCard();
          continue;
        }

        const { bet, hands: numHands } = entry;

        const dealerUp   = drawCard();
        const dealerHole = drawCard();

        // First hand
        const p1 = playRound(drawCard, dealerUp, dealerHole, bet, rules, maxSplits, tcC);
        br += p1;

        let roundProfit = p1;

        // Optional second simultaneous hand (same dealer)
        if (numHands === 2 && pos + 6 < shoe.length && br > 0) {
          const p2 = playRound(drawCard, dealerUp, dealerHole, bet, rules, maxSplits, tcC);
          br += p2;
          roundProfit += p2;
        }

        // Accumulate EV stats per round (= per betting opportunity)
        sumProfit  += roundProfit;
        sumProfit2 += roundProfit * roundProfit;
        totalRounds++;
      }
    }

    if (br <= 0) ruinCount++;

    // Progress updates every 50 sessions
    if ((s + 1) % 50 === 0) {
      self.postMessage({ type: 'progress', value: (s + 1) / numSessions });
    }
  }

  const ror = (ruinCount / numSessions) * 100;

  // EV / SD per hour from real simulation results
  let evPerHour = 0, sdPerHour = 0, n0Hours = null;
  if (totalRounds > 0) {
    // Play fraction: proportion of opportunities where a bet was placed
    const playFraction = totalOpportunities > 0 ? totalRounds / totalOpportunities : 1;
    const effectiveRoundsPerHour = roundsPerHour * playFraction;

    const evPerRound  = sumProfit / totalRounds;
    const varPerRound = (sumProfit2 / totalRounds) - (evPerRound * evPerRound);
    const sdPerRound  = Math.sqrt(Math.max(0, varPerRound));

    evPerHour = evPerRound * effectiveRoundsPerHour;
    sdPerHour = sdPerRound * Math.sqrt(effectiveRoundsPerHour);
    if (evPerHour > 0) n0Hours = Math.round(Math.pow(sdPerHour, 2) / Math.pow(evPerHour, 2));
  }

  return { ror, evPerHour, sdPerHour, n0Hours };
}

// ─── MESSAGE HANDLER ─────────────────────────────────────────────────────────
self.onmessage = function(e) {
  const result = simulate(e.data);
  self.postMessage({ type: 'result', ...result });
};
