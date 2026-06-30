import React, { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { defaultBetSpread } from '../../data/mockData';
import InfoTooltip from '../ui/InfoTooltip';

// Avantage joueur par TC (Hi-Lo, ENHC S17) — règle des ~0.5% par point de TC
// Base house edge ENHC S17 6 jeux ≈ -0.5%
const TC_EDGE = {
  '-3': -2.0,
  '-2': -1.5,
  '-1': -0.8,
  '0':  -0.5,
  '+1':  0.0,
  '+2':  0.5,
  '+3':  1.0,
  '+4':  1.5,
  '+5':  2.0,
  '+6':  2.5,
  '+7':  3.0,
};

function tcKey(index) {
  return index > 0 ? `+${index}` : String(index);
}

export default function BetSpread() {
  const {
    betSpread,
    updateBetSpreadEntry,
    setBetSpread,
    additionalSettings,
  } = useGame();

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [handsError, setHandsError] = useState(null);

  const canPlayTwoHands = additionalSettings?.flexibleOneOrTwoHands !== false;

  const resetBetSpread = () => setBetSpread(defaultBetSpread);

  const handleSetHands = (index, hands) => {
    if (hands === 2 && !canPlayTwoHands) {
      setHandsError(index);
      setTimeout(() => setHandsError(null), 3000);
      return;
    }
    updateBetSpreadEntry(index, { hands });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div>
          <h2 className="text-emerald-400 font-semibold">Écart de paris</h2>
          <p className="text-xs text-gray-500 mt-0.5">Mise par True Count · 1x = 1 main · 2x = 2 mains simultanées</p>
        </div>
        <button
          onClick={resetBetSpread}
          className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-800 rounded text-xs transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      </div>

      <div className="p-4">
        {/* Colonne headers */}
        <div className="grid grid-cols-[52px_1fr_80px_36px] gap-2 mb-2 text-xs text-gray-500 uppercase tracking-wide">
          <span className="flex items-center justify-center gap-1">
            TC
            <InfoTooltip text="True Count (TC) : comptage courant divisé par le nombre de jeux restants. Le TC détermine votre avantage réel à chaque instant. TC ≥ +2 → avantage joueur, TC ≤ 0 → avantage casino. Adaptez votre mise en conséquence." />
          </span>
          <span className="text-center">Mise (€)</span>
          <span className="text-center">Mains</span>
          <span></span>
        </div>

        {/* Lignes */}
        <div className="space-y-1">
          {betSpread.map((entry) => {
            const key = tcKey(entry.index);
            const isExpanded = expandedIndex === entry.index;
            const showError = handsError === entry.index;

            return (
              <div key={entry.index}>
                <div className="grid grid-cols-[52px_1fr_80px_36px] gap-2 items-center">
                  {/* TC */}
                  <span className={`text-center text-sm font-bold ${
                    entry.index < 0 ? 'text-red-400' : entry.index === 0 ? 'text-gray-300' : 'text-emerald-400'
                  }`}>
                    {key}
                  </span>

                  {/* Mise */}
                  <input
                    type="number"
                    value={entry.value}
                    onChange={(e) => updateBetSpreadEntry(entry.index, { value: parseInt(e.target.value) || 0 })}
                    className="bg-[#1a1a1d] border border-gray-700 rounded px-2 py-1.5 text-white text-center text-sm w-full"
                  />

                  {/* 1x / 2x */}
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    <button
                      onClick={() => handleSetHands(entry.index, 1)}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        entry.hands === 1
                          ? 'bg-emerald-700/50 text-emerald-300 border border-emerald-700'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => handleSetHands(entry.index, 2)}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        !canPlayTwoHands
                          ? 'text-gray-700 cursor-not-allowed'
                          : entry.hands === 2
                          ? 'bg-emerald-700/50 text-emerald-300 border border-emerald-700'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      2x
                    </button>
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => toggleExpand(entry.index)}
                    className="flex items-center justify-center text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Message erreur 2x */}
                {showError && (
                  <div className="mt-1 mx-1 px-3 py-1.5 bg-red-900/30 border border-red-800/50 rounded text-xs text-red-400">
                    Activez "1 ou 2 mains (flexible)" dans les Paramètres avancés pour jouer 2 mains.
                  </div>
                )}

                {/* Stats déroulées */}
                {isExpanded && (
                  <div className="mt-1 mx-1 px-3 py-2 bg-[#1a1a1d] rounded border border-gray-800 text-xs">
                    <p className="text-gray-500">Avantage joueur à ce TC</p>
                    <p className={`font-semibold mt-0.5 ${TC_EDGE[key] >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {TC_EDGE[key] >= 0 ? '+' : ''}{TC_EDGE[key]?.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
