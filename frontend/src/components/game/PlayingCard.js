import React from 'react';

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

export default function PlayingCard({ card, faceDown = false, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-12 h-16',
    md: 'w-16 h-[88px]',
    lg: 'w-20 h-28',
    xl: 'w-24 h-32'
  };

  const fontSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };
  
  if (faceDown) {
    return (
      <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-white shadow-lg flex items-center justify-center ${className}`}>
        <div className="w-3/4 h-3/4 rounded border border-blue-400 bg-blue-700 flex items-center justify-center">
          <div className="text-blue-400 text-2xl font-bold">♣</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${sizes[size]} rounded-lg bg-white border border-gray-300 shadow-lg relative overflow-hidden ${className}`}>
      {/* Top left corner */}
      <div className={`absolute top-1 left-1 ${fontSizes[size]} font-bold ${suitColors[card.suit]} leading-none`}>
        <div>{card.value}</div>
        <div className="text-xs">{suitSymbols[card.suit]}</div>
      </div>
      
      {/* Center symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${suitColors[card.suit]} text-3xl`}>
        {suitSymbols[card.suit]}
      </div>
      
      {/* Bottom right corner (upside down) */}
      <div className={`absolute bottom-1 right-1 ${fontSizes[size]} font-bold ${suitColors[card.suit]} leading-none transform rotate-180`}>
        <div>{card.value}</div>
        <div className="text-xs">{suitSymbols[card.suit]}</div>
      </div>
    </div>
  );
}

// Card Back
export function CardBack({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-12 h-16',
    md: 'w-16 h-[88px]',
    lg: 'w-20 h-28',
    xl: 'w-24 h-32'
  };

  return (
    <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-red-700 to-red-900 border-2 border-white shadow-lg ${className}`}>
      <div className="w-full h-full p-1">
        <div className="w-full h-full rounded border border-red-500 bg-red-800 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-0.5">
            {"♠♥♦♣♠♥♦♣♠".split('').map((s, i) => (
              <span key={i} className="text-red-400 text-xs">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
