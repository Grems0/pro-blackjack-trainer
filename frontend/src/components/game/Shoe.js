import React from 'react';

export default function Shoe({ totalCards, remainingCards, penetration }) {
  const usedCards = totalCards - remainingCards;
  const usedPercentage = (usedCards / totalCards) * 100;
  const penetrationLine = penetration * 100;
  
  return (
    <div className="bg-[#1a1a1d] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-gray-400">Sabot (Shoe)</h3>
        <span className="text-sm text-emerald-500 font-mono">
          {remainingCards} / {totalCards}
        </span>
      </div>
      
      {/* Shoe Visualization */}
      <div className="relative h-32 bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg overflow-hidden border-2 border-amber-700">
        {/* Cards remaining visualization */}
        <div 
          className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-blue-900 to-blue-800 transition-all duration-300"
          style={{ width: `${100 - usedPercentage}%` }}
        >
          {/* Card edge lines */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.min(20, Math.floor(remainingCards / 10)) }).map((_, i) => (
              <div 
                key={i} 
                className="h-full border-r border-blue-700/30"
                style={{ width: `${100 / 20}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Penetration marker */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-red-500"
          style={{ left: `${penetrationLine}%` }}
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45"></div>
        </div>
        
        {/* Labels */}
        <div className="absolute bottom-2 left-2 text-xs text-amber-200 opacity-70">Défausse</div>
        <div className="absolute bottom-2 right-2 text-xs text-blue-200 opacity-70">Cartes restantes</div>
        
        {/* Deck count overlay */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          ~{(remainingCards / 52).toFixed(1)} decks
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
          style={{ width: `${usedPercentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0%</span>
        <span>{usedPercentage.toFixed(0)}% utilisé</span>
        <span>100%</span>
      </div>
    </div>
  );
}
