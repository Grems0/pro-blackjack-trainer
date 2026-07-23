import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  defaultPlayerSettings,
  defaultBetSpread,
  defaultTableRules,
  additionalSettings,
  generateDeck,
  shuffleDeck,
  getHiLoValue
} from '../data/mockData';

const GameContext = createContext();

const initialState = {
  // Settings
  playerSettings: defaultPlayerSettings,
  betSpread: defaultBetSpread,
  tableRules: defaultTableRules,
  additionalSettings: additionalSettings,
  
  // Game state
  deck: [],
  discardPile: [],
  runningCount: 0,
  trueCount: 0,
  cardsDealt: 0,
  
  // Training mode
  currentModule: null,
  isTrainingActive: false,
  
  // Session stats
  sessionStats: {
    totalHands: 0,
    correctDecisions: 0,
    incorrectDecisions: 0,
    runningCountErrors: 0,
    trueCountErrors: 0,
    bettingErrors: 0,
    bankroll: 10000,
    startTime: null,
    endTime: null
  },
  
  // UI state
  frozenBets: false,
  showModal: null,
  // Saved templates
  savedTemplates: (() => {
    try { return JSON.parse(localStorage.getItem('bj_templates') || '[]'); }
    catch { return []; }
  })()
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_SETTINGS':
      return { ...state, playerSettings: { ...state.playerSettings, ...action.payload } };
    
    case 'SET_BET_SPREAD':
      return { ...state, betSpread: action.payload };
    
    case 'UPDATE_BET_SPREAD_ENTRY':
      return {
        ...state,
        betSpread: state.betSpread.map(entry =>
          entry.index === action.payload.index
            ? { ...entry, ...action.payload.updates }
            : entry
        )
      };
    
    case 'SET_TABLE_RULES':
      return { ...state, tableRules: { ...state.tableRules, ...action.payload } };
    
    case 'SET_ADDITIONAL_SETTINGS':
      return { ...state, additionalSettings: { ...state.additionalSettings, ...action.payload } };
    
    case 'INITIALIZE_DECK':
      const newDeck = shuffleDeck(generateDeck(state.tableRules.numberOfDecks));
      return {
        ...state,
        deck: newDeck,
        discardPile: [],
        runningCount: 0,
        trueCount: 0,
        cardsDealt: 0
      };
    
    case 'DEAL_CARD':
      if (state.deck.length === 0) return state;
      const [dealtCard, ...remainingDeck] = state.deck;
      const newRunningCount = state.runningCount + getHiLoValue(dealtCard);
      const decksRemaining = remainingDeck.length / 52;
      const newTrueCount = decksRemaining > 0 ? Math.trunc(newRunningCount / decksRemaining) : 0;
      
      return {
        ...state,
        deck: remainingDeck,
        discardPile: [...state.discardPile, dealtCard],
        runningCount: newRunningCount,
        trueCount: newTrueCount,
        cardsDealt: state.cardsDealt + 1
      };
    
    case 'SET_CURRENT_MODULE':
      return { ...state, currentModule: action.payload };
    
    case 'START_TRAINING':
      return {
        ...state,
        isTrainingActive: true,
        sessionStats: {
          ...state.sessionStats,
          startTime: new Date().toISOString()
        }
      };
    
    case 'END_TRAINING':
      return {
        ...state,
        isTrainingActive: false,
        sessionStats: {
          ...state.sessionStats,
          endTime: new Date().toISOString()
        }
      };
    
    case 'UPDATE_SESSION_STATS':
      return {
        ...state,
        sessionStats: { ...state.sessionStats, ...action.payload }
      };
    
    case 'TOGGLE_FROZEN_BETS':
      return { ...state, frozenBets: !state.frozenBets };
    
    case 'SET_SHOW_MODAL':
      return { ...state, showModal: action.payload };
    
    case 'SAVE_TEMPLATE':
      return {
        ...state,
        savedTemplates: [...state.savedTemplates, action.payload]
      };
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        savedTemplates: state.savedTemplates.filter(t => t.id !== action.payload)
      };
    
    case 'LOAD_TEMPLATE':
      const template = state.savedTemplates.find(t => t.id === action.payload);
      if (!template) return state;
      return {
        ...state,
        playerSettings: template.playerSettings,
        betSpread: template.betSpread,
        tableRules: template.tableRules,
        additionalSettings: template.additionalSettings
      };
    
    case 'RESET_TO_DEFAULTS':
      return {
        ...state,
        playerSettings: defaultPlayerSettings,
        betSpread: defaultBetSpread,
        tableRules: defaultTableRules,
        additionalSettings: additionalSettings
      };
    
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const setPlayerSettings = useCallback((settings) => {
    dispatch({ type: 'SET_PLAYER_SETTINGS', payload: settings });
  }, []);
  
  const setBetSpread = useCallback((spread) => {
    dispatch({ type: 'SET_BET_SPREAD', payload: spread });
  }, []);
  
  const updateBetSpreadEntry = useCallback((index, updates) => {
    dispatch({ type: 'UPDATE_BET_SPREAD_ENTRY', payload: { index, updates } });
  }, []);
  
  const setTableRules = useCallback((rules) => {
    dispatch({ type: 'SET_TABLE_RULES', payload: rules });
  }, []);
  
  const setAdditionalSettings = useCallback((settings) => {
    dispatch({ type: 'SET_ADDITIONAL_SETTINGS', payload: settings });
  }, []);
  
  const initializeDeck = useCallback(() => {
    dispatch({ type: 'INITIALIZE_DECK' });
  }, []);
  
  const dealCard = useCallback(() => {
    dispatch({ type: 'DEAL_CARD' });
  }, []);
  
  const setCurrentModule = useCallback((module) => {
    dispatch({ type: 'SET_CURRENT_MODULE', payload: module });
  }, []);
  
  const startTraining = useCallback(() => {
    dispatch({ type: 'START_TRAINING' });
  }, []);
  
  const endTraining = useCallback(() => {
    dispatch({ type: 'END_TRAINING' });
  }, []);
  
  const updateSessionStats = useCallback((stats) => {
    dispatch({ type: 'UPDATE_SESSION_STATS', payload: stats });
  }, []);
  
  const toggleFrozenBets = useCallback(() => {
    dispatch({ type: 'TOGGLE_FROZEN_BETS' });
  }, []);
  
  const setShowModal = useCallback((modal) => {
    dispatch({ type: 'SET_SHOW_MODAL', payload: modal });
  }, []);
  
  const saveTemplate = useCallback((template) => {
    dispatch({ type: 'SAVE_TEMPLATE', payload: template });
  }, []);
  
  const deleteTemplate = useCallback((id) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: id });
  }, []);
  
  const loadTemplate = useCallback((id) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: id });
  }, []);
  
  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  useEffect(() => {
    localStorage.setItem('bj_templates', JSON.stringify(state.savedTemplates));
  }, [state.savedTemplates]);
  
  const value = {
    ...state,
    setPlayerSettings,
    setBetSpread,
    updateBetSpreadEntry,
    setTableRules,
    setAdditionalSettings,
    initializeDeck,
    dealCard,
    setCurrentModule,
    startTraining,
    endTraining,
    updateSessionStats,
    toggleFrozenBets,
    setShowModal,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
    resetToDefaults
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
