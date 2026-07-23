import React from 'react';

/**
 * CasinoTable — surface de table de blackjack réaliste :
 * rail en bois d'acajou + accoudoir cuir, feutre bombé, jonc laiton,
 * halo de lumière chaude, inscription sérigraphiée, arc de mise décoratif.
 *
 * Props :
 *  - inscription : texte gravé en arc au centre (ex. "BLACKJACK PAYS 3:2")
 *  - subline     : ligne réglementaire sous l'inscription (ex. "Dealer must stand on 17")
 *  - glow        : true → le laiton s'illumine (bonne réponse)
 *  - className   : classes utilitaires supplémentaires
 */
export default function CasinoTable({ inscription, subline, glow = false, className = '', children }) {
  return (
    <div
      className={`relative rounded-[150px/100px] p-2.5 sm:p-3 ${glow ? 'brass-glow' : ''} ${className}`}
      style={{
        // Rail en bois d'acajou verni
        background:
          'linear-gradient(160deg, #5a3a1e 0%, #3d2410 30%, #2a1808 60%, #43290f 100%)',
        boxShadow: [
          'inset 0 2px 3px rgba(255,220,160,0.25)',   // vernis, reflet du spot
          'inset 0 -2px 4px rgba(0,0,0,0.6)',         // dessous du rail
          '0 45px 90px -20px rgba(0,0,0,0.8)',        // ombre portée de la table
        ].join(', '),
      }}
    >
      {/* Accoudoir cuir entre le bois et le feutre */}
      <div
        className="relative rounded-[140px/92px] p-2 sm:p-2.5"
        style={{
          background:
            'linear-gradient(155deg, #2a2018 0%, #1a1512 45%, #12100c 100%)',
          boxShadow: [
            'inset 0 1px 2px rgba(255,255,255,0.12)',  // couture haut
            'inset 0 -1px 2px rgba(0,0,0,0.7)',
          ].join(', '),
        }}
      >
        {/* Feutre */}
        <div
          className="casino-table relative rounded-[132px/86px] px-6 py-10 sm:px-12 sm:py-12 overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse 90% 120% at 50% -10%, #2f8f56 0%, #1c6a3c 35%, #0f4527 70%, #0a331d 100%)',
            boxShadow: [
              'inset 0 0 0 2.5px rgba(201,168,76,0.6)',       // jonc laiton
              'inset 0 0 0 4px rgba(0,0,0,0.35)',
              'inset 0 55px 85px -40px rgba(255,240,200,0.2)', // lumière chaude haut
              'inset 0 -50px 90px -30px rgba(0,0,0,0.65)',     // vignettage bas
              'inset 60px 0 90px -70px rgba(0,0,0,0.5)',       // vignettage côtés
              'inset -60px 0 90px -70px rgba(0,0,0,0.5)',
            ].join(', '),
          }}
        >
          {/* Texture feutre */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.08,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Halo du plafonnier */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 45% at 50% 20%, rgba(255,240,200,0.16) 0%, transparent 60%)',
            }}
          />

          {/* Arc de mise décoratif (bas de table, côté joueur) */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -30,
              width: '85%',
              height: 130,
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              border: '1.5px solid rgba(201,168,76,0.28)',
              borderBottom: 'none',
            }}
          />

          {/* Inscription sérigraphiée */}
          {inscription && (
            <div className="pointer-events-none absolute left-0 right-0 top-5 flex flex-col items-center">
              <span
                className="text-center font-bold uppercase"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(12px, 2.8vw, 18px)',
                  letterSpacing: '0.3em',
                  color: 'rgba(201,168,76,0.8)',
                  textShadow: '0 1px 0 rgba(0,0,0,0.55), 0 -1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {inscription}
              </span>
              {subline && (
                <span
                  className="mt-1 text-center uppercase"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 'clamp(8px, 1.8vw, 11px)',
                    letterSpacing: '0.24em',
                    color: 'rgba(201,168,76,0.45)',
                  }}
                >
                  {subline}
                </span>
              )}
              <div
                className="mt-2"
                style={{
                  width: 130,
                  height: 1,
                  background:
                    'linear-gradient(90deg, transparent, rgba(201,168,76,0.55), transparent)',
                }}
              />
            </div>
          )}

          {/* Contenu (cartes, mains, boutons) posé sur le feutre */}
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
