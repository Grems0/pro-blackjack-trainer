import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LangPicker from '../components/ui/LangPicker';

// ── Entrance Scene — video background + two hotspots ────────────────────────
function EntranceScene({ onChoose }) {
  const [hovered, setHovered]   = useState(null);
  const [zooming, setZooming]   = useState(null);
  const [ready,   setReady]     = useState(false);
  const videoRef = useRef(null);

  useEffect(() => { setTimeout(() => setReady(true), 200); }, []);

  const handleClick = (choice) => {
    setZooming(choice);
    setTimeout(() => onChoose(choice), 1000);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>

      {/* ── Background video ── */}
      <video
        ref={videoRef}
        src="/videos/shuffle.mp4"
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: ready ? 1 : 0,
          transform: zooming === 'table'   ? 'scale(1.6) translate(8%, -4%)'
                   : zooming === 'toilet'  ? 'scale(1.6) translate(-10%, 5%)'
                   : 'scale(1)',
          transition: zooming
            ? 'transform 1s cubic-bezier(0.4,0,1,1), opacity 1s ease, filter 1s ease'
            : 'opacity 1.2s ease',
          filter: zooming ? 'brightness(0)' : 'brightness(0.55)',
        }}
      />

      {/* ── Cinematic vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)',
      }}/>

      {/* ── Top title ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '40px 0 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: ready && !zooming ? 1 : 0,
        transform: ready && !zooming ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'all 1s ease 0.4s',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          color: 'rgba(201,168,76,0.55)', fontSize: 10,
          letterSpacing: '0.45em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', margin: 0, fontWeight: 400,
        }}>
          Pro Blackjack Trainer — Royal Casino
        </h1>
        <p style={{
          color: 'rgba(201,168,76,0.35)', fontSize: 9,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', margin: '6px 0 0', maxWidth: 320, textAlign: 'center',
        }}>
          Apprends le comptage de cartes Hi-Lo et la stratégie de base au blackjack
        </p>
      </div>

      {/* ── Two clickable zones ── */}

      {/* LEFT — Toilettes */}
      <div
        onClick={() => handleClick('toilet')}
        onMouseEnter={() => setHovered('toilet')}
        onMouseLeave={() => setHovered(null)}
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0, width: '50%',
          cursor: 'pointer',
          background: hovered === 'toilet'
            ? 'linear-gradient(to right, rgba(100,140,200,0.18), transparent)'
            : 'transparent',
          transition: 'background 0.4s ease',
          display: 'flex', alignItems: 'flex-end',
          padding: '0 0 60px 48px',
        }}
      >
        <div style={{
          opacity: ready && !zooming ? 1 : 0,
          transform: ready && !zooming ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.9s ease 0.6s',
        }}>
          {/* Glowing dot indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: hovered === 'toilet' ? '#a0c8f0' : 'rgba(140,180,220,0.5)',
              boxShadow: hovered === 'toilet' ? '0 0 12px #a0c8f0' : 'none',
              transition: 'all 0.3s',
            }}/>
            <span style={{
              color: hovered === 'toilet' ? '#c0dcf8' : 'rgba(180,210,240,0.45)',
              fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
              fontFamily: 'Georgia, serif', transition: 'color 0.3s',
            }}>
              Toilettes
            </span>
          </div>
          <p style={{
            color: hovered === 'toilet' ? 'rgba(200,225,255,0.7)' : 'rgba(180,210,240,0.25)',
            fontSize: 13, fontFamily: 'Georgia, serif', fontStyle: 'italic',
            margin: '0 0 6px', transition: 'color 0.3s',
          }}>
            ← Couloir du fond
          </p>
          <p style={{
            color: hovered === 'toilet' ? 'rgba(201,168,76,0.8)' : 'rgba(201,168,76,0.3)',
            fontSize: 11, fontFamily: 'Georgia, serif',
            margin: 0, transition: 'color 0.3s', letterSpacing: '0.05em',
          }}>
            Quelqu'un veut vous parler...
          </p>
        </div>
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute', top: '20%', bottom: '20%',
        left: '50%', width: 1,
        background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.25), transparent)',
        pointerEvents: 'none',
      }}/>

      {/* RIGHT — Table de Blackjack */}
      <div
        onClick={() => handleClick('table')}
        onMouseEnter={() => setHovered('table')}
        onMouseLeave={() => setHovered(null)}
        style={{
          position: 'absolute',
          right: 0, top: 0, bottom: 0, width: '50%',
          cursor: 'pointer',
          background: hovered === 'table'
            ? 'linear-gradient(to left, rgba(30,120,70,0.2), transparent)'
            : 'transparent',
          transition: 'background 0.4s ease',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: '0 48px 60px 0',
        }}
      >
        <div style={{
          textAlign: 'right',
          opacity: ready && !zooming ? 1 : 0,
          transform: ready && !zooming ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.9s ease 0.8s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 8 }}>
            <span style={{
              color: hovered === 'table' ? '#6dffaa' : 'rgba(80,180,120,0.45)',
              fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
              fontFamily: 'Georgia, serif', transition: 'color 0.3s',
            }}>
              Table de Blackjack
            </span>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: hovered === 'table' ? '#4ade80' : 'rgba(74,222,128,0.45)',
              boxShadow: hovered === 'table' ? '0 0 12px #4ade80' : 'none',
              transition: 'all 0.3s',
            }}/>
          </div>
          <p style={{
            color: hovered === 'table' ? 'rgba(150,255,180,0.7)' : 'rgba(80,180,120,0.25)',
            fontSize: 13, fontFamily: 'Georgia, serif', fontStyle: 'italic',
            margin: 0, transition: 'color 0.3s',
          }}>
            Salle principale →
          </p>
        </div>
      </div>

      {/* ── Center bottom — "Où allez-vous ?" ── */}
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        opacity: ready && !zooming ? 1 : 0,
        transition: 'opacity 1s ease 1s',
        pointerEvents: 'none',
      }}>
        <p style={{
          color: 'rgba(201,168,76,0.35)', fontSize: 10,
          letterSpacing: '0.4em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', margin: 0,
        }}>
          Où allez-vous ?
        </p>
      </div>
    </div>
  );
}

// ── Table Scene — second video plays, then navigate ─────────────────────────
function TableScene({ onDone }) {
  const [phase, setPhase] = useState('fade-in'); // fade-in → playing → fade-out
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    setTimeout(() => setOpacity(1), 100);
    // Show prompt after 1.5s
    setTimeout(() => setPhase('playing'), 1500);
  }, []);

  const handleEnter = () => {
    setPhase('fade-out');
    setOpacity(0);
    setTimeout(onDone, 900);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <video
        src="/videos/deal.mp4"
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: opacity * 0.65,
          transition: 'opacity 0.9s ease',
          filter: 'brightness(0.7)',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 60%, transparent 25%, rgba(0,0,0,0.8) 100%)',
      }}/>

      {phase === 'playing' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.8s ease',
        }}>
          <p style={{
            color: 'rgba(201,168,76,0.5)', fontSize: 10,
            letterSpacing: '0.4em', textTransform: 'uppercase',
            fontFamily: 'Georgia, serif', margin: '0 0 20px',
          }}>
            Salle principale
          </p>
          <h2 style={{
            color: '#fff', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 400,
            fontFamily: 'Georgia, serif', textAlign: 'center',
            margin: '0 0 12px', letterSpacing: '0.04em',
            textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}>
            La table vous attend.
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 15,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            margin: '0 0 44px', textAlign: 'center',
          }}>
            Accédez à vos modules d'entraînement.
          </p>
          <button
            onClick={handleEnter}
            style={{
              padding: '16px 44px',
              background: 'linear-gradient(135deg, #1a6b42, #0e4a2c)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 14, cursor: 'pointer',
              color: '#4ade80', fontSize: 15, fontWeight: 700,
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.05em',
              boxShadow: '0 0 30px rgba(74,222,128,0.15)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1e7d4e,#115933)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(74,222,128,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1a6b42,#0e4a2c)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(74,222,128,0.15)'; }}
          >
            Prendre place →
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Bathroom screen ─────────────────────────────────────────────────────────
function BathroomScreen({ onNext }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #080c12 0%, #0a0f18 60%, #060810 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: 2,
        background: 'linear-gradient(90deg,transparent,rgba(160,200,255,0.8),transparent)',
        boxShadow: '0 0 40px 8px rgba(160,200,255,0.18)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 44px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 44px)',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 480, textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.9s ease',
      }}>
        <div style={{
          width: 150, height: 190, margin: '0 auto 36px',
          background: 'linear-gradient(135deg,rgba(190,215,245,0.1),rgba(160,190,220,0.18),rgba(140,170,200,0.08))',
          border: '2px solid rgba(160,195,235,0.2)',
          borderRadius: 4,
          boxShadow: '0 0 50px rgba(160,200,255,0.07),inset 0 0 40px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 6, right: 6, height: '35%',
            background: 'linear-gradient(180deg,rgba(255,255,255,0.06),transparent)',
            borderRadius: '2px 2px 0 0',
          }}/>
          <div style={{ fontSize: 62 }}>👴</div>
        </div>

        <p style={{ color: 'rgba(160,195,235,0.32)', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', margin: '0 0 18px' }}>
          Couloir B — Toilettes
        </p>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, lineHeight: 1.75, margin: '0 0 10px', fontStyle: 'italic' }}>
          Un vieil homme se tient devant le miroir.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 14, margin: '0 0 44px', lineHeight: 1.6 }}>
          Il vous regarde dans le reflet.<br/>Il semble vous attendre.
        </p>

        <button onClick={onNext} style={{
          padding: '13px 38px', background: 'rgba(160,200,255,0.07)',
          border: '1px solid rgba(160,200,255,0.2)', borderRadius: 12, cursor: 'pointer',
          color: 'rgba(190,220,255,0.75)', fontSize: 14, letterSpacing: '0.1em',
          fontFamily: 'Georgia, serif', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background='rgba(160,200,255,0.14)'; e.target.style.borderColor='rgba(160,200,255,0.45)'; }}
          onMouseLeave={e => { e.target.style.background='rgba(160,200,255,0.07)'; e.target.style.borderColor='rgba(160,200,255,0.2)'; }}
        >
          S'approcher →
        </button>
      </div>
    </div>
  );
}

// ── Man speaks ──────────────────────────────────────────────────────────────
function ManSpeaksScreen({ onNext }) {
  const [phase, setPhase] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#080c12 0%,#0a0f18 60%,#060810 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: 2,
        background: 'linear-gradient(90deg,transparent,rgba(160,200,255,0.8),transparent)',
        boxShadow: '0 0 40px 8px rgba(160,200,255,0.18)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 44px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 44px)',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%' }}>

        {phase === 0 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>👴</div>
            <div style={{
              background: 'rgba(10,15,22,0.92)', border: '1px solid rgba(160,200,255,0.1)',
              borderRadius: 16, padding: '26px 30px', marginBottom: 28,
              boxShadow: '0 4px 40px rgba(0,0,0,0.7)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                "J'ai gagné{' '}
                <span style={{ color: '#c9a84c', fontStyle: 'normal', fontWeight: 700 }}>340 000€</span>
                {' '}en 18 mois dans ce casino. Ils m'ont banni à vie."
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 14, margin: '0 0 36px', lineHeight: 1.6 }}>
              Il marque une pause. Son regard reste fixé sur le vôtre.
            </p>
            <button onClick={() => setPhase(1)} style={{
              padding: '13px 38px', background: 'rgba(160,200,255,0.07)',
              border: '1px solid rgba(160,200,255,0.2)', borderRadius: 12, cursor: 'pointer',
              color: 'rgba(190,220,255,0.75)', fontSize: 14, letterSpacing: '0.1em',
              fontFamily: 'Georgia, serif', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background='rgba(160,200,255,0.14)'; }}
              onMouseLeave={e => { e.target.style.background='rgba(160,200,255,0.07)'; }}
            >
              Écouter →
            </button>
          </div>
        )}

        {phase === 1 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{
              background: 'rgba(10,15,22,0.92)', border: '1px solid rgba(160,200,255,0.1)',
              borderRadius: 16, padding: '26px 30px', marginBottom: 28,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.8, margin: '0 0 22px', fontStyle: 'italic' }}>
                "Si tu veux savoir comment... lis ça."
              </p>
              <div style={{
                background: 'linear-gradient(135deg,#f5f0e8,#ede8d8)',
                borderRadius: 5, padding: '18px 22px',
                transform: 'rotate(-1.5deg)',
                boxShadow: '2px 5px 24px rgba(0,0,0,0.5)',
                border: '1px solid rgba(180,160,120,0.4)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.05, borderRadius: 5,
                  backgroundImage: 'repeating-linear-gradient(47deg,#000 0,#000 1px,transparent 1px,transparent 6px)',
                }}/>
                <p style={{ color: '#3a2a1a', fontSize: 11, fontFamily: 'monospace', margin: '0 0 10px', fontWeight: 700, letterSpacing: '0.1em' }}>
                  SYSTÈME HI-LO
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                  {[['2–6','+1','#1a6b42'],['7–9','0','#7a7060'],['10–A','-1','#8b1a1a']].map(([cards,val,col]) => (
                    <div key={cards} style={{ textAlign: 'center' }}>
                      <div style={{ color: '#5a4a3a', fontSize: 10, marginBottom: 2 }}>{cards}</div>
                      <div style={{ color: col, fontSize: 16, fontWeight: 900, fontFamily: 'monospace' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#6a5a4a', fontSize: 10, fontStyle: 'italic', margin: 0 }}>
                  RC élevé = avantage sur le casino
                </p>
              </div>
            </div>
            <button onClick={onNext} style={{
              padding: '13px 38px', background: 'rgba(160,200,255,0.07)',
              border: '1px solid rgba(160,200,255,0.2)', borderRadius: 12, cursor: 'pointer',
              color: 'rgba(190,220,255,0.75)', fontSize: 14, letterSpacing: '0.1em',
              fontFamily: 'Georgia, serif', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background='rgba(160,200,255,0.14)'; }}
              onMouseLeave={e => { e.target.style.background='rgba(160,200,255,0.07)'; }}
            >
              Continuer →
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Revelation ──────────────────────────────────────────────────────────────
function RevelationScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 40%,#0a180a 0%,#070d07 50%,#000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 250,
        background: 'radial-gradient(ellipse,rgba(74,222,128,0.07) 0%,transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 540, textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.9s ease',
      }}>
        <div style={{ fontSize: 32, marginBottom: 20 }}>⚠️</div>
        <h2 style={{
          color: '#fff', fontSize: 'clamp(18px,4vw,28px)', fontWeight: 400,
          margin: '0 0 32px', lineHeight: 1.5, letterSpacing: '0.03em',
        }}>
          Le comptage de cartes est{' '}
          <span style={{ color: '#4ade80', fontWeight: 700 }}>légal</span>.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44, textAlign: 'left' }}>
          {[
            { icon: '📖', text: "Ça s'apprend en 2 semaines avec la bonne méthode." },
            { icon: '🎯', text: 'Le Hi-Lo donne un avantage de +1% à +3% sur le casino.' },
            { icon: '🤫', text: 'Le casino compte sur le fait que vous ne le sachiez jamais.' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: '14px 18px',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 15, margin: 0, lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/pricing')}
          style={{
            padding: '17px 46px',
            background: 'linear-gradient(135deg,#c9a84c,#a8823a)',
            border: 'none', borderRadius: 14, cursor: 'pointer',
            color: '#000', fontSize: 16, fontWeight: 800,
            fontFamily: 'system-ui,sans-serif', letterSpacing: '0.02em',
            boxShadow: '0 8px 32px rgba(201,168,76,0.35)',
            transition: 'transform 0.2s,box-shadow 0.2s', marginBottom: 18,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(201,168,76,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(201,168,76,0.35)'; }}
        >
          Je veux apprendre →
        </button>

        <div>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.2)', fontSize: 12,
            fontFamily: 'Georgia,serif', letterSpacing: '0.05em',
          }}>
            J'ai déjà un compte →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function CasinoLanding() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('entrance');

  function handleChoose(choice) {
    if (choice === 'table') setScreen('table');
    else setScreen('bathroom');
  }

  return (
    <>
      {/* Sélecteur de langue — fixe en haut à droite sur toutes les scènes */}
      <div style={{ position: 'fixed', top: 18, right: 20, zIndex: 9999 }}>
        <LangPicker dark />
      </div>

      {screen === 'entrance'   && <EntranceScene onChoose={handleChoose} />}
      {screen === 'table'      && <TableScene onDone={() => navigate('/training')} />}
      {screen === 'bathroom'   && <BathroomScreen onNext={() => setScreen('man')} />}
      {screen === 'man'        && <ManSpeaksScreen onNext={() => setScreen('revelation')} />}
      {screen === 'revelation' && <RevelationScreen />}
    </>
  );
}
