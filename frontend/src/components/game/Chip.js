import React from 'react';

const chipColors = {
  1: { bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-800' },
  5: { bg: 'bg-red-600', border: 'border-red-400', text: 'text-white' },
  10: { bg: 'bg-blue-600', border: 'border-blue-400', text: 'text-white' },
  25: { bg: 'bg-green-600', border: 'border-green-400', text: 'text-white' },
  50: { bg: 'bg-orange-500', border: 'border-orange-300', text: 'text-white' },
  100: { bg: 'bg-black', border: 'border-gray-600', text: 'text-white' },
  500: { bg: 'bg-purple-600', border: 'border-purple-400', text: 'text-white' },
  1000: { bg: 'bg-amber-400', border: 'border-amber-300', text: 'text-gray-900' }
};

export default function Chip({ value, size = 'md', onClick, className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };
  
  const colors = chipColors[value] || chipColors[1];
  
  return (
    <button
      onClick={onClick}
      className={`
        ${sizes[size]}
        ${colors.bg}
        ${colors.text}
        rounded-full
        border-4
        ${colors.border}
        font-bold
        shadow-lg
        hover:scale-110
        transition-transform
        flex items-center justify-center
        relative
        ${className}
      `}
    >
      {/* Inner ring pattern */}
      <div className="absolute inset-2 border border-current rounded-full border-dashed opacity-50"></div>
      <span className="relative z-10">${value}</span>
    </button>
  );
}

export function ChipStack({ total, size = 'md' }) {
  // Break down total into chips
  const denominations = [1000, 500, 100, 50, 25, 10, 5, 1];
  const chips = [];
  let remaining = total;
  
  for (const denom of denominations) {
    while (remaining >= denom) {
      chips.push(denom);
      remaining -= denom;
    }
  }
  
  // Limit display to 5 chips max
  const displayChips = chips.slice(0, 5);
  const hasMore = chips.length > 5;
  
  return (
    <div className="relative">
      {displayChips.map((value, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{ bottom: idx * 4, left: idx * 2 }}
        >
          <Chip value={value} size={size} />
        </div>
      ))}
      {hasMore && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-1 rounded">
          +{chips.length - 5}
        </div>
      )}
    </div>
  );
}
