import React from 'react';

// Couleurs casino classiques : corps, edge spots (inserts), texte
const chipColors = {
  1:    { body: '#e8e6e0', spot: '#b8b4aa', text: '#333' },
  5:    { body: '#b3202c', spot: '#f5f0e6', text: '#fff' },
  10:   { body: '#1e4f9c', spot: '#f5f0e6', text: '#fff' },
  25:   { body: '#1a7a3c', spot: '#f5f0e6', text: '#fff' },
  50:   { body: '#d2691e', spot: '#f5f0e6', text: '#fff' },
  100:  { body: '#1a1a1a', spot: '#c9a84c', text: '#fff' },
  500:  { body: '#5b2d8e', spot: '#f5f0e6', text: '#fff' },
  1000: { body: '#c9a84c', spot: '#1a1a1a', text: '#1a1a1a' },
};

const sizePx = { sm: 32, md: 48, lg: 64 };

/**
 * Chip — jeton de casino réaliste : bord strié avec edge spots, centre imprimé,
 * relief 3D (épaisseur + ombre sur le feutre).
 * API historique conservée : value, size, onClick, className.
 */
export default function Chip({ value, size = 'md', onClick, className = '', disabled = false, style = {} }) {
  const colors = chipColors[value] || chipColors[1];
  const px = sizePx[size] || sizePx.md;

  // Bord strié : 8 edge spots alternés via conic-gradient
  const edge = `repeating-conic-gradient(${colors.spot} 0deg 18deg, ${colors.body} 18deg 45deg)`;

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={`relative rounded-full flex items-center justify-center font-bold select-none ${onClick ? 'transition-transform hover:scale-110 active:scale-95 cursor-pointer' : ''} ${className}`}
      style={{
        width: px,
        height: px,
        background: edge,
        // Relief : lumière du spot en haut, épaisseur en bas, ombre portée sur le feutre
        boxShadow: [
          'inset 0 2px 3px rgba(255,255,255,0.35)',
          'inset 0 -2px 3px rgba(0,0,0,0.45)',
          '0 3px 1px rgba(0,0,0,0.25)',
          '0 6px 10px -3px rgba(0,0,0,0.5)',
        ].join(', '),
        border: 'none',
        padding: 0,
        opacity: disabled ? 0.35 : 1,
        ...style,
      }}
    >
      {/* Centre imprimé */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          inset: px * 0.16,
          background: `radial-gradient(circle at 35% 30%, ${colors.body} 0%, ${colors.body} 60%, rgba(0,0,0,0.25) 100%)`,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.35)',
        }}
      >
        {/* Anneau pointillé imprimé */}
        <div
          className="absolute rounded-full border border-dashed"
          style={{ inset: 3, borderColor: colors.text, opacity: 0.4 }}
        />
        <span
          style={{
            color: colors.text,
            fontSize: px * (value >= 1000 ? 0.24 : 0.3),
            textShadow: colors.text === '#fff' ? '0 1px 1px rgba(0,0,0,0.5)' : 'none',
            zIndex: 1,
          }}
        >
          {value}
        </span>
      </div>
      {/* Reflet satiné */}
      <div className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 45%)' }} />
    </Tag>
  );
}

/**
 * ChipStack — pile de jetons avec léger décalage irrégulier, comme posée à la main.
 */
export function ChipStack({ total, size = 'md' }) {
  const denominations = [1000, 500, 100, 50, 25, 10, 5, 1];
  const chips = [];
  let remaining = total;

  for (const denom of denominations) {
    while (remaining >= denom) {
      chips.push(denom);
      remaining -= denom;
    }
  }

  const displayChips = chips.slice(0, 5);
  const hasMore = chips.length > 5;
  const px = sizePx[size] || sizePx.md;

  return (
    <div className="relative" style={{ width: px + 8, height: px + displayChips.length * 6 }}>
      {displayChips.map((value, idx) => (
        <Chip
          key={idx}
          value={value}
          size={size}
          className="absolute"
          style={{
            bottom: idx * 6,
            // Décalage pseudo-aléatoire mais stable pour un empilement naturel
            left: (idx * 7) % 5 - 2,
            transform: `rotate(${((idx * 53) % 21) - 10}deg)`,
          }}
        />
      ))}
      {hasMore && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-white bg-black/50 px-1 rounded">
          +{chips.length - 5}
        </div>
      )}
    </div>
  );
}
