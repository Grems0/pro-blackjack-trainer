// Mock data for Pro Blackjack Trainer

export const defaultPlayerSettings = {
  savedTemplates: [],
  selectedTemplate: null,
  availableFunds: 10000,
  estimateRoundsPerHour: true,
  roundsPerHour: 94, // estimateRoundsPerHour('moyenne', 2) = round(120/1.28)
  numberOfPlayers: 2,
  tableSpeed: 'moyenne',
  unitQuantity: 10,
  numberOfUnits: 1000,
  spreadType: '1 - 10 (2 places)',
  spreadsType: 'standard',
  deckDivisor: 'demi-pont'
};

export const defaultBetSpread = [
  { index: -3, value: 0, hands: 1 },
  { index: -2, value: 0, hands: 1 },
  { index: -1, value: 10, hands: 1 },
  { index: 0, value: 10, hands: 1 },
  { index: 1, value: 20, hands: 1 },
  { index: 2, value: 30, hands: 2 },
  { index: 3, value: 40, hands: 2 },
  { index: 4, value: 50, hands: 2 },
  { index: 5, value: 50, hands: 2 },
  { index: 6, value: 50, hands: 2 },
  { index: 7, value: 50, hands: 2 }
];

export const defaultTableRules = {
  numberOfDecks: 6,
  penetration: '4.5',
  dealerHitsSoft17: false,  // false = S17 (croupier reste sur 17 mou), true = H17 (croupier tire sur 17 mou)
  doubleAfterSplit: false,
  splitAces: 'resplit',
  maxSplitHands: 4,
  surrender: 'late',
  blackjackPayout: '3:2',
  enhc: true               // European No Hole Card — activé par défaut
};

export const additionalSettings = {
  countingSystem: 'hi-lo',
  trueCountMethod: 'truncate',
  deckEstimationPrecision: 'half',
  doubleRule: 'any2',
  blackjackPayout: '3:2',
  granularPen: false,
  defaultBetSpreadsPlayAll: false,
  flexibleOneOrTwoHands: true,
};

export const trainingModules = [
  {
    id: 'running-count',
    name: 'RUNNING COUNT',
    icon: 'counter',
    features: [
      'Définissez votre propre rythme',
      'Commentaires par tour',
      'Analyse de précision'
    ],
    buttonText: "Début de l'exercice",
    buttonColor: 'gray',
    textColor: 'green'
  },
  {
    id: 'true-count',
    name: 'TRUE COUNT',
    icon: 'calculator',
    features: [
      'vrais bacs à déchets',
      '2, 4, 6 et 8 jeux de cartes',
      'Commentaires par tour'
    ],
    buttonText: "Début de l'exercice",
    buttonColor: 'gray',
    textColor: 'green'
  },
  {
    id: 'basic-strategy',
    name: 'BASIC STRATEGY',
    icon: 'strategy',
    features: [
      'Mettez en pratique toutes les possibilités',
      "Notifications d'erreurs en temps réel",
      'Problème de revue des mains'
    ],
    buttonText: "Début de l'exercice",
    buttonColor: 'gray',
    textColor: 'green'
  },
  {
    id: 'deviations',
    name: 'DEVIATIONS',
    icon: 'deviation',
    features: [
      'Augmentez vos revenus de 20 %',
      'Mettez vos connaissances à profit',
      'Problème de revue des mains'
    ],
    buttonText: "Début de l'exercice",
    buttonColor: 'gray',
    textColor: 'green'
  },
  {
    id: 'in-casino',
    name: 'IN CASINO',
    icon: 'casino',
    features: [
      'Maintenez le rythme grâce à des décisions de jeu chronométrées.',
      "Aucun retour d'information intermédiaire",
      'Analyse de précision'
    ],
    buttonText: 'Entrez dans le casino',
    buttonColor: 'yellow',
    textColor: 'yellow'
  }
];

// Hi-Lo counting values
export const hiLoValues = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};

// ─── ENHC S17 Basic Strategy (6 decks, European No Hole Card, Dealer Stands on Soft 17) ───
// H=Tirer, S=Rester, D=Doubler (sinon Tirer), Ds=Doubler (sinon Rester),
// Rh=Abandonner (sinon Tirer), Rs=Abandonner (sinon Rester)
// Règle ENHC clé : le croupier ne vérifie pas le BJ → ne pas doubler vs A sur certaines mains

export const basicStrategyHardENHCS17 = {
  5:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  6:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  7:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  8:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  9:  { 2:'H', 3:'D', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  10: { 2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'H', A:'H' },
  11: { 2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'D', A:'H' }, // ENHC S17: H vs A
  12: { 2:'H', 3:'H', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  13: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  14: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  15: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  16: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  17: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  18: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  19: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  20: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  21: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
};

export const basicStrategyHardENHCH17 = {
  5:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  6:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  7:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  8:  { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  9:  { 2:'H', 3:'D', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  10: { 2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'H', A:'H' },
  11: { 2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'D', A:'D' }, // H17: D vs A
  12: { 2:'H', 3:'H', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  13: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  14: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  15: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'Rh', A:'Rh' },
  16: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'Rh', 10:'Rh', A:'Rh' },
  17: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  18: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  19: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  20: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  21: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
};

export const basicStrategySoftENHCS17 = {
  // Ds = Doubler si autorisé, sinon Rester
  13: { 2:'H',  3:'H',  4:'H',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // A,2
  14: { 2:'H',  3:'H',  4:'H',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // A,3
  15: { 2:'H',  3:'H',  4:'D',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // A,4
  16: { 2:'H',  3:'H',  4:'D',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // A,5
  17: { 2:'H',  3:'D',  4:'D',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // A,6
  18: { 2:'S',  3:'Ds', 4:'Ds', 5:'Ds', 6:'Ds', 7:'S', 8:'S', 9:'H', 10:'H', A:'H' }, // A,7 — S17: S vs 2
  19: { 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S', 8:'S', 9:'S', 10:'S', A:'S' }, // A,8
  20: { 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S', 8:'S', 9:'S', 10:'S', A:'S' }, // A,9
};

export const basicStrategySoftENHCH17 = {
  // H17 ENHC 6 decks — différences vs S17 :
  // A,6 vs 2 → D (le croupier tire plus souvent, le double devient rentable)
  // A,7 vs A → H (ENHC : risque de perdre le double si BJ croupier, donc H)
  // A,8 vs 6 → Ds (H17 rend le croupier plus faible vs 6)
  13: { 2:'H',  3:'H',  4:'H',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  14: { 2:'H',  3:'H',  4:'H',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  15: { 2:'H',  3:'H',  4:'D',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  16: { 2:'H',  3:'H',  4:'D',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' },
  17: { 2:'D',  3:'D',  4:'D',  5:'D',  6:'D',  7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // H17: D vs 2 (≠ S17 où H vs 2)
  18: { 2:'Ds', 3:'Ds', 4:'Ds', 5:'Ds', 6:'Ds', 7:'S', 8:'S', 9:'H', 10:'H', A:'H' }, // H17: H vs A (ENHC — pas D vs A)
  19: { 2:'S',  3:'S',  4:'S',  5:'S',  6:'Ds', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' }, // H17: Ds vs 6
  20: { 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
};

// Paires ENHC avec DAS (doubleAfterSplit autorisé)
export const basicStrategyPairsENHCDAS = {
  '2,2':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'H', 9:'H', 10:'H', A:'H' },
  '3,3':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'H', 9:'H', 10:'H', A:'H' },
  '4,4':  { 2:'H',  3:'H', 4:'H', 5:'P', 6:'P', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // P vs 5-6 avec DAS
  '5,5':  { 2:'D',  3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'H', A:'H' },
  '6,6':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // P vs 2-6 avec DAS
  '7,7':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'H', 9:'H', 10:'H', A:'H' },
  '8,8':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'P', 9:'P', 10:'P', A:'H' }, // ENHC: H vs A
  '9,9':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'S', 8:'P', 9:'P', 10:'S', A:'S' },
  '10,10':{ 2:'S',  3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  'A,A':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'P', 9:'P', 10:'P', A:'P' },
};

// Paires ENHC sans DAS (no doubleAfterSplit — défaut en Europe)
// Différences vs DAS : 2,2/3,3 vs 2 = H, 4,4 vs 5/6 = H, 6,6 vs 2 = H
export const basicStrategyPairsENHCNoDAS = {
  '2,2':  { 2:'H',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'H', 9:'H', 10:'H', A:'H' }, // H vs 2 sans DAS
  '3,3':  { 2:'H',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'H', 9:'H', 10:'H', A:'H' }, // H vs 2 sans DAS
  '4,4':  { 2:'H',  3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // pas séparer sans DAS
  '5,5':  { 2:'D',  3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'H', A:'H' },
  '6,6':  { 2:'H',  3:'P', 4:'P', 5:'P', 6:'P', 7:'H', 8:'H', 9:'H', 10:'H', A:'H' }, // H vs 2 sans DAS
  '7,7':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'H', 9:'H', 10:'H', A:'H' },
  '8,8':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'P', 9:'P', 10:'P', A:'H' }, // ENHC: H vs A
  '9,9':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'S', 8:'P', 9:'P', 10:'S', A:'S' },
  '10,10':{ 2:'S',  3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', A:'S' },
  'A,A':  { 2:'P',  3:'P', 4:'P', 5:'P', 6:'P', 7:'P', 8:'P', 9:'P', 10:'P', A:'P' },
};

// Alias — no-DAS par défaut (defaultTableRules.doubleAfterSplit = false)
export const basicStrategyPairsENHC = basicStrategyPairsENHCNoDAS;

// Aliases pour compatibilité avec les composants existants
export const basicStrategyHard = basicStrategyHardENHCS17;
export const basicStrategySoft = basicStrategySoftENHCS17;
export const basicStrategyPairs = basicStrategyPairsENHC;

// ─── Déviations ENHC S17 (Hi-Lo, 6 decks) ───
export const deviationsS17 = [
  // Index = True Count auquel on dévie de la Basic Strategy
  { index: 1,  playerHand: 'Assurance',  dealerCard: 'A',  trueCount: 3,  action: 'Prendre l\'assurance (TC ≥ +3)' },
  { index: 2,  playerHand: '16',         dealerCard: '10', trueCount: 0,  action: 'Rester (au lieu de Tirer/Abandonner)' },
  { index: 3,  playerHand: '15',         dealerCard: '10', trueCount: 4,  action: 'Rester (au lieu de Tirer/Abandonner)' },
  { index: 4,  playerHand: '15',         dealerCard: 'A',  trueCount: 1,  action: 'Rester (au lieu de Tirer)' },
  { index: 5,  playerHand: '16',         dealerCard: 'A',  trueCount: 4,  action: 'Rester (au lieu de Tirer)' },
  { index: 6,  playerHand: '16',         dealerCard: '9',  trueCount: 4,  action: 'Rester (au lieu de Tirer)' },
  { index: 7,  playerHand: '10',         dealerCard: '10', trueCount: 4,  action: 'Doubler (au lieu de Tirer)' },
  { index: 8,  playerHand: '10',         dealerCard: 'A',  trueCount: 4,  action: 'Doubler (au lieu de Tirer)' },
  { index: 9,  playerHand: '11',         dealerCard: 'A',  trueCount: 3,  action: 'Doubler (au lieu de Tirer) — ENHC S17' },
  { index: 10, playerHand: '12',         dealerCard: '2',  trueCount: 3,  action: 'Rester (au lieu de Tirer)' },
  { index: 11, playerHand: '12',         dealerCard: '3',  trueCount: 2,  action: 'Rester (au lieu de Tirer)' },
  { index: 12, playerHand: '12',         dealerCard: '4',  trueCount: 0,  action: 'Tirer (au lieu de Rester)' },
  { index: 13, playerHand: '12',         dealerCard: '5',  trueCount: -2, action: 'Tirer (au lieu de Rester)' },
  { index: 14, playerHand: '12',         dealerCard: '6',  trueCount: -1, action: 'Tirer (au lieu de Rester)' },
  { index: 15, playerHand: '13',         dealerCard: '2',  trueCount: -1, action: 'Tirer (au lieu de Rester)' },
  { index: 16, playerHand: '13',         dealerCard: '3',  trueCount: -2, action: 'Tirer (au lieu de Rester)' },
  { index: 17, playerHand: '9',          dealerCard: '2',  trueCount: 1,  action: 'Doubler (au lieu de Tirer)' },
  { index: 18, playerHand: '9',          dealerCard: '7',  trueCount: 3,  action: 'Doubler (au lieu de Tirer)' },
];

// ─── Déviations ENHC H17 (Hi-Lo, 6 decks) ───
export const deviationsH17 = [
  { index: 1,  playerHand: 'Assurance',  dealerCard: 'A',  trueCount: 3,  action: 'Prendre l\'assurance (TC ≥ +3)' },
  { index: 2,  playerHand: '16',         dealerCard: '10', trueCount: 0,  action: 'Rester (au lieu de Tirer/Abandonner)' },
  { index: 3,  playerHand: '15',         dealerCard: '10', trueCount: 4,  action: 'Rester (au lieu de Tirer/Abandonner)' },
  { index: 4,  playerHand: '15',         dealerCard: 'A',  trueCount: 2,  action: 'Rester (au lieu de Tirer) — TC ≥ +2 en H17' },
  { index: 5,  playerHand: '16',         dealerCard: 'A',  trueCount: 3,  action: 'Rester (au lieu de Tirer)' },
  { index: 6,  playerHand: '16',         dealerCard: '9',  trueCount: 4,  action: 'Rester (au lieu de Tirer)' },
  { index: 7,  playerHand: '10',         dealerCard: '10', trueCount: 4,  action: 'Doubler (au lieu de Tirer)' },
  { index: 8,  playerHand: '10',         dealerCard: 'A',  trueCount: 3,  action: 'Doubler (au lieu de Tirer) — TC ≥ +3 en H17' },
  { index: 9,  playerHand: '12',         dealerCard: '2',  trueCount: 3,  action: 'Rester (au lieu de Tirer)' },
  { index: 10, playerHand: '12',         dealerCard: '3',  trueCount: 2,  action: 'Rester (au lieu de Tirer)' },
  { index: 11, playerHand: '12',         dealerCard: '4',  trueCount: 0,  action: 'Tirer (au lieu de Rester)' },
  { index: 12, playerHand: '12',         dealerCard: '5',  trueCount: -2, action: 'Tirer (au lieu de Rester)' },
  { index: 13, playerHand: '12',         dealerCard: '6',  trueCount: -1, action: 'Tirer (au lieu de Rester)' },
  { index: 14, playerHand: '13',         dealerCard: '2',  trueCount: -1, action: 'Tirer (au lieu de Rester)' },
  { index: 15, playerHand: '13',         dealerCard: '3',  trueCount: -2, action: 'Tirer (au lieu de Rester)' },
  { index: 16, playerHand: '9',          dealerCard: '2',  trueCount: 1,  action: 'Doubler (au lieu de Tirer)' },
  { index: 17, playerHand: '9',          dealerCard: '7',  trueCount: 3,  action: 'Doubler (au lieu de Tirer)' },
  { index: 18, playerHand: 'A,7',        dealerCard: '2',  trueCount: 1,  action: 'Doubler (au lieu de Rester) — spécifique H17' },
];

// ─── Surrender ENHC S17 ───
export const surrenderDeviationsS17 = [
  { playerHand: '8,8', dealerCard: 'A',  trueCount: 6,  action: 'Séparer (au lieu de Tirer) — déviation ENHC' },
  { playerHand: '15',  dealerCard: '9',  trueCount: 2,  action: 'Abandonner' },
  { playerHand: '15',  dealerCard: 'A',  trueCount: 1,  action: 'Abandonner' },
  { playerHand: '14',  dealerCard: '10', trueCount: 3,  action: 'Abandonner' },
];

// ─── Surrender ENHC H17 ───
export const surrenderDeviationsH17 = [
  { playerHand: '8,8', dealerCard: 'A',  trueCount: 5,  action: 'Abandonner' },
  { playerHand: '15',  dealerCard: '9',  trueCount: 2,  action: 'Abandonner' },
  { playerHand: '15',  dealerCard: 'A',  trueCount: 1,  action: 'Abandonner' },
  { playerHand: '14',  dealerCard: '10', trueCount: 3,  action: 'Abandonner' },
  { playerHand: '14',  dealerCard: 'A',  trueCount: 4,  action: 'Abandonner' },
];

// Aliases de compatibilité (anciens noms)
export const illustrious18    = deviationsS17;
export const illustrious18H17 = deviationsH17;
export const fab4Surrenders   = surrenderDeviationsS17;

// Deck configurations
export const deckConfigs = [
  { value: 1, label: '1 jeu' },
  { value: 2, label: '2 jeux' },
  { value: 4, label: '4 jeux' },
  { value: 6, label: '6 jeux' },
  { value: 8, label: '8 jeux' }
];

// Penetration options (for 6 decks = 312 cards)
export const penetrationOptions = [
  { value: '5.5', label: '5.5 jeux (26 cartes ~91%)' },
  { value: '5.25', label: '5.25 jeux (39 cartes ~87%)' },
  { value: '5', label: '5 jeux (52 cartes ~83%)' },
  { value: '4.75', label: '4.75 jeux (65 cartes ~79%)' },
  { value: '4.5', label: '4.5 jeux (78 cartes ~75%)' },
  { value: '4.25', label: '4.25 jeux (91 cartes ~70%)' },
  { value: '4', label: '4 jeux (104 cartes ~66%)' },
  { value: '3.75', label: '3.75 jeux (117 cartes ~62%)' },
  { value: '3.5', label: '3.5 jeux (130 cartes ~58%)' },
  { value: '3.25', label: '3.25 jeux (143 cartes ~54%)' },
  { value: '3', label: '3 jeux (156 cartes ~50%)' },
];

// Table speed options — base rounds/hour at 1 player
export const tableSpeedOptions = [
  { value: 'lente', label: 'Lente', baseRounds: 90 },
  { value: 'moyenne', label: 'Moyenne', baseRounds: 120 },
  { value: 'rapide', label: 'Rapide', baseRounds: 160 },
];

// Calculate estimated rounds per hour based on speed and number of players
export function estimateRoundsPerHour(tableSpeed, numberOfPlayers) {
  const opt = tableSpeedOptions.find(o => o.value === tableSpeed);
  const base = opt ? opt.baseRounds : 120;
  // Each additional player reduces speed by ~25%
  return Math.round(base / (1 + (numberOfPlayers - 1) * 0.28));
}

// Split Aces options
export const splitAcesOptions = [
  { value: 'resplit', label: 'As à redistribuer' },
  { value: 'no-resplit', label: 'Pas de redistribution' },
  { value: 'one-card', label: 'Une carte seulement' }
];

// Surrender options
export const surrenderOptions = [
  { value: 'none', label: 'Non autorisé' },
  { value: 'late', label: 'Autorisé' },
  { value: 'early', label: 'Early Surrender' },
  { value: 'es10', label: 'ES10 (vs 10 only)' }
];

// Max split hands
export const maxSplitHandsOptions = [
  { value: 2, label: 'Max 2 Mains' },
  { value: 3, label: 'Max 3 Mains' },
  { value: 4, label: 'Max 4 Mains' }
];

// Deck divisor options
export const deckDivisorOptions = [
  { value: 'full', label: 'Diviser par jeu entier' },
  { value: 'half', label: 'Par demi-jeu' },
  { value: 'quarter', label: 'Par quart de jeu' }
];

// True count methods
export const trueCountMethods = [
  { value: 'truncate', label: 'Truncate ★ (la plus utilisée)' },
  { value: 'floor', label: 'Floor (arrondi vers le bas)' },
  { value: 'round', label: 'Round (arrondi classique)' }
];

// Card suits and values for deck generation
export const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
export const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Generate a full deck
export const generateDeck = (numDecks = 6) => {
  const deck = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of suits) {
      for (const value of cardValues) {
        deck.push({ suit, value, id: `${value}-${suit}-${d}` });
      }
    }
  }
  return deck;
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get card value for blackjack
export const getCardValue = (card) => {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
};

// Get Hi-Lo count value
export const getHiLoValue = (card) => {
  const value = card.value;
  if (['2', '3', '4', '5', '6'].includes(value)) return 1;
  if (['7', '8', '9'].includes(value)) return 0;
  return -1; // 10, J, Q, K, A
};

// Calculate hand total
export const calculateHandTotal = (cards) => {
  let total = 0;
  let aces = 0;
  
  for (const card of cards) {
    const value = getCardValue(card);
    total += value;
    if (card.value === 'A') aces++;
  }
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
};

// Check if hand is soft (at least one ace still counting as 11)
export const isSoftHand = (cards) => {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += getCardValue(card);
    if (card.value === 'A') aces++;
  }

  // Mirror the ace-reduction logic of calculateHandTotal
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  // Soft = at least one ace still counted as 11, and not bust
  return aces > 0 && total <= 21;
};
