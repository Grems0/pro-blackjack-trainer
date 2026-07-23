import React from 'react';

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

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

// Relief physique de la carte : épaisseur, ombre portée sur le feutre,
// léger vernis satiné en surface.
const cardSurfaceStyle = {
  background: 'linear-gradient(145deg, #ffffff 0%, #fdfdfb 55%, #f2f0ea 100%)',
  boxShadow: [
    '0 1px 0 rgba(255,255,255,0.9) inset',      // liseré lumineux du vernis
    '0 -1px 2px rgba(0,0,0,0.06) inset',        // épaisseur bord bas
    '0 2px 3px rgba(0,0,0,0.25)',               // contact avec le feutre
    '0 8px 18px -6px rgba(0,0,0,0.45)',         // ombre douce du spot
  ].join(', '),
};

// Dos guilloché doré sur fond bordeaux profond
const cardBackStyle = {
  background: 'linear-gradient(150deg, #5c1220 0%, #450d18 55%, #300810 100%)',
  boxShadow: [
    '0 1px 0 rgba(255,255,255,0.25) inset',
    '0 2px 3px rgba(0,0,0,0.3)',
    '0 8px 18px -6px rgba(0,0,0,0.5)',
  ].join(', '),
};

const guillochePattern = {
  backgroundImage: [
    'repeating-linear-gradient(45deg, rgba(201,168,76,0.28) 0 1px, transparent 1px 7px)',
    'repeating-linear-gradient(-45deg, rgba(201,168,76,0.28) 0 1px, transparent 1px 7px)',
    'radial-gradient(circle at 50% 50%, rgba(201,168,76,0.18) 0%, transparent 65%)',
  ].join(', '),
};

/**
 * PlayingCard — carte premium avec relief, vernis et ombre sur le feutre.
 * Props :
 *  - card { value, suit } / faceDown / size / className (API historique)
 *  - dealt : true → animation de distribution depuis le sabot (haut-droite)
 *  - dealIndex : décale l'animation de ~120ms par carte
 */
export default function PlayingCard({ card, faceDown = false, size = 'md', className = '', dealt = false, dealIndex = 0 }) {
  const dealStyle = dealt ? { animationDelay: `${dealIndex * 120}ms` } : undefined;
  const dealClass = dealt ? 'card-deal-in' : '';

  if (faceDown) {
    return (
      <div
        className={`${sizes[size]} rounded-lg relative overflow-hidden ${dealClass} ${className}`}
        style={{ ...cardBackStyle, ...dealStyle }}
      >
        {/* Marge blanche du dos */}
        <div className="absolute inset-[3px] rounded-md border border-[rgba(201,168,76,0.55)]">
          {/* Guilloché doré */}
          <div className="absolute inset-[3px] rounded-sm overflow-hidden" style={guillochePattern}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-bold"
                style={{
                  fontSize: size === 'sm' ? 14 : 20,
                  color: 'rgba(201,168,76,0.85)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                ♠
              </span>
            </div>
          </div>
        </div>
        {/* Reflet satiné */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.14) 0%, transparent 40%)' }} />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-lg relative overflow-hidden ${dealClass} ${className}`}
      style={{ ...cardSurfaceStyle, ...dealStyle }}
    >
      {/* Coin haut-gauche */}
      <div className={`absolute top-1 left-1.5 ${fontSizes[size]} font-bold ${suitColors[card.suit]} leading-none`}>
        <div>{card.value}</div>
        <div className="text-xs -mt-0.5">{suitSymbols[card.suit]}</div>
      </div>

      {/* Symbole central avec très léger relief d'impression */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${suitColors[card.suit]} text-3xl`}
        style={{ textShadow: '0 1px 1px rgba(0,0,0,0.12)' }}
      >
        {suitSymbols[card.suit]}
      </div>

      {/* Coin bas-droit (retourné) */}
      <div className={`absolute bottom-1 right-1.5 ${fontSizes[size]} font-bold ${suitColors[card.suit]} leading-none transform rotate-180`}>
        <div>{card.value}</div>
        <div className="text-xs -mt-0.5">{suitSymbols[card.suit]}</div>
      </div>

      {/* Vernis : reflet diagonal discret */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.35) 0%, transparent 35%)' }} />
    </div>
  );
}

// Dos de carte seul (sabot, pile de défausse)
export function CardBack({ size = 'md', className = '' }) {
  return <PlayingCard faceDown size={size} className={className} />;
}
