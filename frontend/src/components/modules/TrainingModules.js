import React from 'react';
import { useGame } from '../../contexts/GameContext';

const MODULES = [
  {
    id: 'running-count',
    name: 'Running Count',
    sub: 'Hi-Lo · Système de comptage',
    desc: 'Entraîne-toi à maintenir le Running Count carte par carte au rythme d\'un vrai sabot.',
    accent: '#4ade80',
    accentBg: 'rgba(74,222,128,0.08)',
    accentBorder: 'rgba(74,222,128,0.2)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="4" y="8" width="40" height="32" rx="6" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5"/>
        <text x="24" y="30" textAnchor="middle" fontSize="16" fontWeight="800" fill="#4ade80">+1</text>
      </svg>
    ),
    buttonText: "Début de l'exercice",
  },
  {
    id: 'true-count',
    name: 'True Count',
    sub: 'Hi-Lo · Conversion RC → TC',
    desc: 'Convertis le Running Count en True Count en estimant les jeux restants dans le sabot.',
    accent: '#60a5fa',
    accentBg: 'rgba(96,165,250,0.08)',
    accentBorder: 'rgba(96,165,250,0.2)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="8" y="4" width="32" height="40" rx="5" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.4)" strokeWidth="1.5"/>
        <text x="24" y="20" textAnchor="middle" fontSize="9" fontWeight="700" fill="#60a5fa">RC÷jeux</text>
        <line x1="12" y1="26" x2="36" y2="26" stroke="rgba(96,165,250,0.3)" strokeWidth="1"/>
        <text x="24" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill="#60a5fa">= TC</text>
      </svg>
    ),
    buttonText: "Début de l'exercice",
  },
  {
    id: 'basic-strategy',
    name: 'Stratégie de base',
    sub: 'ENHC · S17 / H17 · 6 jeux',
    desc: 'Maîtrise chaque décision — mains dures, souples et paires — sans commetre d\'erreur.',
    accent: '#fcd34d',
    accentBg: 'rgba(252,211,77,0.08)',
    accentBorder: 'rgba(252,211,77,0.2)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="4" y="4" width="40" height="40" rx="6" fill="rgba(252,211,77,0.12)" stroke="rgba(252,211,77,0.35)" strokeWidth="1.5"/>
        {[0,1,2].map(r => [0,1,2].map(c => (
          <rect key={`${r}-${c}`} x={10+c*11} y={10+r*11} width={8} height={8} rx="2"
            fill={r===1&&c===1 ? 'rgba(252,211,77,0.5)' : 'rgba(252,211,77,0.15)'}
            stroke="rgba(252,211,77,0.3)" strokeWidth="0.5"/>
        )))}
      </svg>
    ),
    buttonText: "Début de l'exercice",
  },
  {
    id: 'deviations',
    name: 'Déviations',
    sub: 'Illustrious 18 · Fab 4',
    desc: 'Apprends à t\'écarter de la stratégie de base quand le True Count le justifie.',
    accent: '#c084fc',
    accentBg: 'rgba(192,132,252,0.08)',
    accentBorder: 'rgba(192,132,252,0.2)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="4" y="4" width="40" height="40" rx="6" fill="rgba(192,132,252,0.12)" stroke="rgba(192,132,252,0.35)" strokeWidth="1.5"/>
        <polyline points="8,36 18,28 26,32 40,14" stroke="rgba(192,132,252,0.4)" strokeWidth="1.5" fill="none"/>
        <polyline points="8,36 18,24 28,20 40,10" stroke="#c084fc" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="10" r="3" fill="#c084fc"/>
      </svg>
    ),
    buttonText: "Début de l'exercice",
  },
  {
    id: 'in-casino',
    name: 'Simulation Casino',
    sub: 'Mode complet · Bankroll réelle',
    desc: 'Simule une vraie session casino — stratégie, mises, comptage — avec ta bankroll en temps réel.',
    accent: '#f87171',
    accentBg: 'rgba(248,113,113,0.08)',
    accentBorder: 'rgba(248,113,113,0.2)',
    wide: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="4" y="10" width="18" height="26" rx="3" fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5"/>
        <text x="13" y="28" textAnchor="middle" fontSize="11" fill="#c9a84c">♠</text>
        <rect x="24" y="6" width="20" height="28" rx="3" fill="rgba(201,168,76,0.25)" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5" transform="rotate(8 34 20)"/>
        <text x="35" y="24" textAnchor="middle" fontSize="11" fill="#c9a84c" transform="rotate(8 35 24)">♥</text>
        <circle cx="24" cy="42" r="5" fill="rgba(201,168,76,0.2)" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5"/>
      </svg>
    ),
    buttonText: 'Entrer dans le casino',
  },
];

export default function TrainingModules() {
  const { setShowModal } = useGame();

  const regular = MODULES.filter(m => !m.wide);
  const wide    = MODULES.filter(m => m.wide);

  const Card = ({ m }) => (
    <div
      style={{
        background: '#111',
        border: `1px solid ${m.accentBorder}`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color .2s, box-shadow .2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = m.accent;
        e.currentTarget.style.boxShadow = `0 0 24px ${m.accentBg}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = m.accentBorder;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Corps */}
      <div style={{ padding: '20px 20px 16px', flex: 1 }}>
        {/* Icône + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            width: 56, height: 56, background: m.accentBg,
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${m.accentBorder}`,
          }}>
            {m.icon}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', color: m.accent,
            background: m.accentBg, border: `1px solid ${m.accentBorder}`,
            borderRadius: 6, padding: '3px 8px',
          }}>
            {m.sub.split(' · ')[0]}
          </span>
        </div>

        {/* Nom */}
        <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: '0 0 5px', letterSpacing: -0.3 }}>
          {m.name}
        </h3>

        {/* Sous-titre */}
        <p style={{ color: '#444', fontSize: 11, fontWeight: 600, margin: '0 0 10px', letterSpacing: 0.5 }}>
          {m.sub}
        </p>

        {/* Description */}
        <p style={{ color: '#666', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
          {m.desc}
        </p>
      </div>

      {/* Bouton */}
      <button
        onClick={() => setShowModal(m.id)}
        style={{
          width: '100%', padding: '13px 20px',
          background: m.accentBg, border: 'none',
          borderTop: `1px solid ${m.accentBorder}`,
          color: m.accent, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', letterSpacing: 0.3,
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = m.accentBorder}
        onMouseLeave={e => e.currentTarget.style.background = m.accentBg}
      >
        {m.buttonText} →
      </button>
    </div>
  );

  return (
    <div>
      {/* 4 modules en grille */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 16,
      }}>
        {regular.map(m => <Card key={m.id} m={m} />)}
      </div>

      {/* Simulation Casino — pleine largeur */}
      {wide.map(m => (
        <div key={m.id} style={{
          background: '#111',
          border: `1px solid ${m.accentBorder}`,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          transition: 'border-color .2s, box-shadow .2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = m.accent;
          e.currentTarget.style.boxShadow = `0 0 32px rgba(248,113,113,0.1)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = m.accentBorder;
          e.currentTarget.style.boxShadow = 'none';
        }}>
          {/* Bande accent gauche */}
          <div style={{ width: 4, background: `linear-gradient(to bottom, ${m.accent}, transparent)`, flexShrink: 0 }} />

          {/* Contenu */}
          <div style={{ padding: '20px 24px', flex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 60, height: 60, background: m.accentBg,
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${m.accentBorder}`, flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>{m.name}</h3>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  color: m.accent, background: m.accentBg, border: `1px solid ${m.accentBorder}`,
                  borderRadius: 6, padding: '2px 8px',
                }}>
                  Complet
                </span>
              </div>
              <p style={{ color: '#555', fontSize: 11, fontWeight: 600, margin: '0 0 6px', letterSpacing: 0.5 }}>{m.sub}</p>
              <p style={{ color: '#666', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
            </div>
          </div>

          {/* Bouton côté droit */}
          <button
            onClick={() => setShowModal(m.id)}
            style={{
              padding: '0 28px', background: m.accentBg,
              border: 'none', borderLeft: `1px solid ${m.accentBorder}`,
              color: m.accent, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 0.3,
              transition: 'background .15s', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = m.accentBg}
          >
            {m.buttonText} →
          </button>
        </div>
      ))}
    </div>
  );
}
