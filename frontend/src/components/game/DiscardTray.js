import React from 'react';
import PlayingCard from './PlayingCard';

export default function DiscardTray({ cards, maxVisible = 50 }) {
  const cardCount = cards.length;
  const displayCards = cards.slice(-maxVisible);
  
  // Calculate stack height based on card count
  const stackHeight = Math.min(cardCount * 0.5, 30);
  
  return (
    <div className="bg-[#1a1a1d] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-gray-400">Bac de défausse</h3>
        <span className="text-sm text-emerald-500 font-mono">{cardCount} cartes</span>
      </div>
      
      <div 
        className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg min-h-[100px] flex items-end justify-center p-4"
        style={{ paddingTop: `${stackHeight + 20}px` }}
      >
        {/* Stack visualization */}
        <div className="relative" style={{ height: `${stackHeight + 80}px` }}>
          {displayCards.slice(-5).map((card, idx) => (
            <div
              key={card.id || idx}
              className="absolute"
              style={{
                bottom: idx * 2,
                left: idx * 1,
                zIndex: idx,
                transform: `rotate(${(idx - 2) * 2}deg)`
              }}
            >
              <PlayingCard card={card} size="sm" />
            </div>
          ))}
        </div>
        
        {/* Deck estimation guide */}
        <div className="absolute right-2 top-2 bottom-2 w-6 flex flex-col justify-between">
          {[6, 5, 4, 3, 2, 1, 0].map(deck => (
            <div key={deck} className="flex items-center gap-1">
              <div className="h-px w-2 bg-gray-600"></div>
              <span className="text-[8px] text-gray-500">{deck}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
