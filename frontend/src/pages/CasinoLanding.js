import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ── Particules de lumière ambiante ──────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 3,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {dots.map(d => (
        <div key={d.id} style={{
          position: 'absolute',
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: 'rgba(201,168,76,0.6)',
          animation: `floatDot ${d.dur}s ${d.delay}s ease-in-out infinite alternate`,
        }}/>
      ))}
    </div>
  );
}

// ── Écran 0 — Entrée du casino ───────────────────────────────────────────────
function EntranceScreen({ onChoose }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #1a1200 0%, #0d0d0d 60%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      position: 'relative', overflow: 'hidden',
      padding: '24px',
    }}>
      <Particles />

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>♠</div>
        <p style={{ color: 'rgba(201,168,76,0.5)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', margin: 0 }}>
          Royal Casino — Las Vegas
        </p>
      </div>

      <h1 style={{
        color: '#fff', fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: 400,
        textAlign: 'center', margin: '0 0 12px',
        letterSpacing: '0.05em', position: 'relative', zIndex: 1,
        textShadow: '0 0 40px rgba(201,168,76,0.3)',
      }}>
        Vous entrez dans le casino.
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, textAlign: 'center', margin: '0 0 64px', position: 'relative', zIndex: 1 }}>
        Où allez-vous ?
      </p>

      {/* Deux portes */}
      <div style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Porte toilettes */}
        <button
          onClick={() => onChoose('toilettes')}
          onMouseEnter={() => setHovered('toilettes')}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: 200, padding: '32px 20px',
            background: hovered === 'toilettes'
              ? 'rgba(180,160,130,0.12)'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hovered === 'toilettes' ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 16, cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            transform: hovered === 'toilettes' ? 'translateY(-4px)' : 'none',
            boxShadow: hovered === 'toilettes' ? '0 12px 40px rgba(201,168,76,0.15)' : 'none',
          }}
        >
          <div style={{ fontSize: 40 }}>🚻</div>
          <div>
            <p style={{ color: hovered === 'toilettes' ? '#c9a84c' : 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 600, margin: '0 0 4px', letterSpacing: '0.05em' }}>
              Toilettes
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: 0, fontStyle: 'italic' }}>
              Couloir du fond
            </p>
          </div>
        </button>

        {/* Porte table BJ */}
        <button
          onClick={() => onChoose('table')}
          onMouseEnter={() => setHovered('table')}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: 200, padding: '32px 20px',
            background: hovered === 'table'
              ? 'rgba(16,80,50,0.25)'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hovered === 'table' ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 16, cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            transform: hovered === 'table' ? 'translateY(-4px)' : 'none',
            boxShadow: hovered === 'table' ? '0 12px 40px rgba(74,222,128,0.1)' : 'none',
          }}
        >
          <div style={{ fontSize: 40 }}>🃏</div>
          <div>
            <p style={{ color: hovered === 'table' ? '#4ade80' : 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 600, margin: '0 0 4px', letterSpacing: '0.05em' }}>
              Table de Blackjack
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: 0, fontStyle: 'italic' }}>
              Salle principale
            </p>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes floatDot {
          from { opacity: 0.1; transform: translateY(0px); }
          to   { opacity: 0.7; transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

// ── Écran 1 — Les toilettes ─────────────────────────────────────────────────
function BathroomScreen({ onNext }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0f14 0%, #0d1117 50%, #080c10 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Lumière néon froide */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: 3,
        background: 'linear-gradient(90deg, transparent, rgba(180,220,255,0.6), transparent)',
        boxShadow: '0 0 30px 10px rgba(180,220,255,0.15)',
      }}/>

      {/* Carrelage effet */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 480, textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease',
      }}>
        {/* Miroir */}
        <div style={{
          width: 160, height: 200, margin: '0 auto 40px',
          background: 'linear-gradient(135deg, rgba(200,220,240,0.08) 0%, rgba(180,200,220,0.15) 50%, rgba(160,180,200,0.06) 100%)',
          border: '2px solid rgba(180,200,220,0.2)',
          borderRadius: 8,
          boxShadow: '0 0 40px rgba(180,220,255,0.08), inset 0 0 30px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Reflet */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)',
            borderRadius: '6px 6px 0 0',
          }}/>
          {/* Silhouette vieux monsieur */}
          <div style={{ fontSize: 64, filter: 'grayscale(0.3)' }}>👴</div>
        </div>

        <p style={{ color: 'rgba(180,200,220,0.4)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 20px' }}>
          Toilettes — Couloir B
        </p>

        <p style={{
          color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.7,
          margin: '0 0 12px', fontStyle: 'italic',
        }}>
          Un vieil homme se tient devant le miroir.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: '0 0 48px', lineHeight: 1.6 }}>
          Il vous regarde dans le reflet.<br/>
          Il semble vous attendre.
        </p>

        <button
          onClick={onNext}
          style={{
            padding: '14px 40px',
            background: 'rgba(180,200,220,0.08)',
            border: '1px solid rgba(180,200,220,0.25)',
            borderRadius: 12, cursor: 'pointer',
            color: 'rgba(200,220,240,0.8)', fontSize: 14,
            letterSpacing: '0.1em', fontFamily: "'Georgia', serif",
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(180,200,220,0.15)'; e.target.style.borderColor = 'rgba(180,200,220,0.5)'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(180,200,220,0.08)'; e.target.style.borderColor = 'rgba(180,200,220,0.25)'; }}
        >
          S'approcher →
        </button>
      </div>
    </div>
  );
}

// ── Écran 2 — Il parle ──────────────────────────────────────────────────────
function ManSpeaksScreen({ onNext }) {
  const [phase, setPhase] = useState(0); // 0: speech, 1: paper

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0f14 0%, #0d1117 50%, #080c10 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: 3,
        background: 'linear-gradient(90deg, transparent, rgba(180,220,255,0.6), transparent)',
        boxShadow: '0 0 30px 10px rgba(180,220,255,0.15)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%' }}>

        {phase === 0 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>👴</div>

            {/* Bulle de dialogue */}
            <div style={{
              background: 'rgba(15,20,25,0.9)',
              border: '1px solid rgba(180,200,220,0.15)',
              borderRadius: 16, padding: '28px 32px',
              marginBottom: 32, position: 'relative',
              boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                width: 16, height: 16, background: 'rgba(15,20,25,0.9)',
                border: '1px solid rgba(180,200,220,0.15)',
                borderRight: 'none', borderBottom: 'none',
                transform: 'translateX(-50%) rotate(45deg)',
              }}/>
              <p style={{
                color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.8,
                margin: 0, fontStyle: 'italic',
              }}>
                "J'ai gagné <span style={{ color: '#c9a84c', fontStyle: 'normal', fontWeight: 700 }}>340 000€</span> en 18 mois dans ce casino.
                Ils m'ont banni à vie."
              </p>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: '0 0 40px', lineHeight: 1.6 }}>
              Il marque une pause. Son regard reste fixé sur le vôtre.
            </p>

            <button
              onClick={() => setPhase(1)}
              style={{
                padding: '14px 40px',
                background: 'rgba(180,200,220,0.08)',
                border: '1px solid rgba(180,200,220,0.25)',
                borderRadius: 12, cursor: 'pointer',
                color: 'rgba(200,220,240,0.8)', fontSize: 14,
                letterSpacing: '0.1em', fontFamily: "'Georgia', serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(180,200,220,0.15)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(180,200,220,0.08)'; }}
            >
              Écouter →
            </button>
          </div>
        )}

        {phase === 1 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{
              background: 'rgba(15,20,25,0.9)',
              border: '1px solid rgba(180,200,220,0.15)',
              borderRadius: 16, padding: '28px 32px',
              marginBottom: 32,
              boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.8,
                margin: '0 0 24px', fontStyle: 'italic',
              }}>
                "Si tu veux savoir comment... lis ça."
              </p>

              {/* Papier froissé */}
              <div style={{
                background: 'linear-gradient(135deg, #f5f0e8, #ede8d8)',
                borderRadius: 6, padding: '20px 24px',
                transform: 'rotate(-1.5deg)',
                boxShadow: '2px 4px 20px rgba(0,0,0,0.4)',
                border: '1px solid rgba(180,160,120,0.4)',
                position: 'relative',
              }}>
                {/* Effet froissé */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  backgroundImage: 'repeating-linear-gradient(47deg, #000 0, #000 1px, transparent 1px, transparent 6px)',
                  borderRadius: 6,
                }}/>
                <p style={{ color: '#3a2a1a', fontSize: 12, fontFamily: 'monospace', margin: '0 0 8px', fontWeight: 700, letterSpacing: '0.1em' }}>
                  SYSTÈME HI-LO
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
                  {[['2-6','➜','+1','#1a6b42'],['7-9','➜','0','#666'],['10-A','➜','-1','#8b1a1a']].map(([cards, arrow, val, col]) => (
                    <div key={cards} style={{ textAlign: 'center' }}>
                      <span style={{ color: col, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{cards}</span>
                      <span style={{ color: '#555', fontSize: 11, margin: '0 3px' }}>{arrow}</span>
                      <span style={{ color: col, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#5a4a3a', fontSize: 10, fontStyle: 'italic', margin: 0 }}>
                  RC élevé = avantage sur le casino
                </p>
              </div>
            </div>

            <button
              onClick={onNext}
              style={{
                padding: '14px 40px',
                background: 'rgba(180,200,220,0.08)',
                border: '1px solid rgba(180,200,220,0.25)',
                borderRadius: 12, cursor: 'pointer',
                color: 'rgba(200,220,240,0.8)', fontSize: 14,
                letterSpacing: '0.1em', fontFamily: "'Georgia', serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(180,200,220,0.15)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(180,200,220,0.08)'; }}
            >
              Continuer →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ── Écran 3 — La révélation ─────────────────────────────────────────────────
function RevelationScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 40%, #0f1a0f 0%, #090d09 50%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Lueur verte */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200,
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 540, textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.9s ease',
      }}>
        <div style={{ fontSize: 36, marginBottom: 24 }}>⚠️</div>

        <h2 style={{
          color: '#fff', fontSize: 'clamp(18px, 4vw, 28px)', fontWeight: 400,
          margin: '0 0 32px', lineHeight: 1.5, letterSpacing: '0.03em',
        }}>
          Le comptage de cartes est{' '}
          <span style={{ color: '#4ade80', fontWeight: 700 }}>légal</span>.
        </h2>

        {/* 3 points clés */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, textAlign: 'left' }}>
          {[
            { icon: '📖', text: 'Ça s\'apprend en 2 semaines avec la bonne méthode.' },
            { icon: '🎯', text: 'Le Hi-Lo donne un avantage de +1% à +3% sur le casino.' },
            { icon: '🤫', text: 'Le casino compte sur le fait que vous ne le sachiez jamais.' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '16px 20px',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: 0, lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/pricing')}
          style={{
            padding: '18px 48px',
            background: 'linear-gradient(135deg, #c9a84c, #a8823a)',
            border: 'none', borderRadius: 14, cursor: 'pointer',
            color: '#000', fontSize: 16, fontWeight: 800,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '0.02em',
            boxShadow: '0 8px 32px rgba(201,168,76,0.35)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            marginBottom: 20,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(201,168,76,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.35)'; }}
        >
          Je veux apprendre →
        </button>

        <div>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.25)', fontSize: 12,
              fontFamily: "'Georgia', serif", letterSpacing: '0.05em',
            }}
          >
            J'ai déjà un compte →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────────────────
export default function CasinoLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [path, setPath] = useState(null);   // null | 'toilettes' | 'table'
  const [step, setStep] = useState(0);       // étape dans le path toilettes

  function handleChoose(choice) {
    if (choice === 'table') {
      navigate('/training');
    } else {
      setPath('toilettes');
      setStep(1);
    }
  }

  if (!path) return <EntranceScreen onChoose={handleChoose} />;

  if (path === 'toilettes') {
    if (step === 1) return <BathroomScreen onNext={() => setStep(2)} />;
    if (step === 2) return <ManSpeaksScreen onNext={() => setStep(3)} />;
    if (step === 3) return <RevelationScreen />;
  }

  return null;
}
