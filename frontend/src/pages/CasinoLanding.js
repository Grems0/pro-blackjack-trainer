import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ── POV Casino Corridor ──────────────────────────────────────────────────────
function CasinoCorridorScene({ onChoose }) {
  const [hovered, setHovered] = useState(null);
  const [zooming, setZooming] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 80); }, []);

  const handleClick = (choice) => {
    setZooming(choice);
    setTimeout(() => onChoose(choice), 900);
  };

  // ── Geometry ───────────────────────────────────────────────────────────────
  const W = 1000, H = 620;
  const VP = { x: 500, y: 260 }; // vanishing point — center of far wall

  // Far corridor opening (rectangle around VP)
  const farL = 340, farR = 660, farT = 170, farB = 350;

  // Floor corners: bottom of screen → far bottom
  const floorTL = [farL, farB], floorTR = [farR, farB];
  const floorBL = [0, H],       floorBR = [W, H];

  // Ceiling corners: top of screen → far top
  const ceilBL = [farL, farT], ceilBR = [farR, farT];
  const ceilTL = [0, 0],       ceilTR = [W, 0];

  // Left wall: between ceiling left edge and floor left edge
  const lwTL = [0, 0], lwTR = [farL, farT], lwBR = [farL, farB], lwBL = [0, H];

  // Right wall
  const rwTL = [farR, farT], rwTR = [W, 0], rwBR = [W, H], rwBL = [farR, farB];

  const poly = (...pts) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  // Perspective lines on floor (converge to VP)
  const floorLines = [80, 200, 350, 650, 800, 920].map(bx => ({
    x1: bx, y1: H,
    x2: VP.x + (bx - VP.x) * ((farB - VP.y) / (H - VP.y)),
    y2: farB,
  }));

  // Ceiling lights (4 pendants getting smaller toward VP)
  const lights = [
    { x: 500, y: 38, r: 28, glow: 60 },
    { x: 500, y: 88, r: 18, glow: 40 },
    { x: 500, y: 122, r: 11, glow: 25 },
    { x: 500, y: 146, r: 6,  glow: 14 },
  ];

  // Slot machine shapes on walls (simplified rectangles with light dots)
  const leftSlots = [
    { x: 30,  y: 180, w: 130, h: 220 },
    { x: 185, y: 250, w: 90,  h: 170 },
  ];
  const rightSlots = [
    { x: 840, y: 180, w: 130, h: 220 },
    { x: 725, y: 250, w: 90,  h: 170 },
  ];

  // Far end: two zones split at center x
  const midX = (farL + farR) / 2; // 500

  const isHovToilet = hovered === 'toilet';
  const isHovTable  = hovered === 'table';

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#03030a',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%', height: '100%',
          display: 'block',
          opacity: entered ? 1 : 0,
          transform: entered
            ? zooming === 'toilet' ? 'scale(2.5) translate(-12%, 5%)'
            : zooming === 'table'  ? 'scale(2.5) translate(12%, 5%)'
            : 'scale(1)'
            : 'scale(0.94)',
          transition: zooming
            ? 'transform 0.9s cubic-bezier(0.4,0,1,1), opacity 0.9s ease'
            : 'opacity 1s ease, transform 1s ease',
          filter: zooming ? 'brightness(0)' : 'brightness(1)',
        }}
      >
        <defs>
          {/* Bathroom zone glow */}
          <radialGradient id="toiletGlow" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor={isHovToilet ? '#b0d4ff' : '#7ab0e8'} stopOpacity={isHovToilet ? 0.55 : 0.25}/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>

          {/* Table zone glow */}
          <radialGradient id="tableGlow" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor={isHovTable ? '#6dffb0' : '#3a9b6a'} stopOpacity={isHovTable ? 0.6 : 0.28}/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>

          {/* Floor material */}
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0c0c"/>
            <stop offset="100%" stopColor="#0a0608"/>
          </linearGradient>

          {/* Ceiling material */}
          <linearGradient id="ceilGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1a1614"/>
            <stop offset="100%" stopColor="#0c0a08"/>
          </linearGradient>

          {/* Wall material */}
          <linearGradient id="wallLeftGrad" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#1e1a18"/>
            <stop offset="100%" stopColor="#0e0c0a"/>
          </linearGradient>
          <linearGradient id="wallRightGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e1a18"/>
            <stop offset="100%" stopColor="#0e0c0a"/>
          </linearGradient>

          {/* Chandelier glow */}
          <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5d98a" stopOpacity="0.9"/>
            <stop offset="40%" stopColor="#e8b84a" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#c9830a" stopOpacity="0"/>
          </radialGradient>

          {/* Ambient floor light from chandeliers */}
          <radialGradient id="floorLight" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </radialGradient>

          {/* Far-end vignette */}
          <radialGradient id="farVignette" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.7"/>
          </radialGradient>

          {/* Slot machine screen */}
          <radialGradient id="slotScreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8a020" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#8b5010" stopOpacity="0.4"/>
          </radialGradient>

          {/* Carpet pattern */}
          <pattern id="carpet" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent"/>
            <rect x="10" y="10" width="20" height="20" fill="none" stroke="#3d1a1a" strokeWidth="0.8" opacity="0.4"/>
            <circle cx="20" cy="20" r="3" fill="none" stroke="#4a2020" strokeWidth="0.6" opacity="0.3"/>
          </pattern>

          <clipPath id="floorClip">
            <polygon points={poly(floorTL, floorTR, floorBR, floorBL)}/>
          </clipPath>
          <clipPath id="leftZoneClip">
            <polygon points={`${farL},${farT} ${midX},${farT} ${midX},${farB} ${farL},${farB}`}/>
          </clipPath>
          <clipPath id="rightZoneClip">
            <polygon points={`${midX},${farT} ${farR},${farT} ${farR},${farB} ${midX},${farB}`}/>
          </clipPath>
        </defs>

        {/* ── 1. FLOOR ─────────────────────────────────────────── */}
        <polygon points={poly(floorTL, floorTR, floorBR, floorBL)} fill="url(#floorGrad)"/>
        {/* Carpet pattern overlay */}
        <polygon points={poly(floorTL, floorTR, floorBR, floorBL)} fill="url(#carpet)" opacity="0.6"/>
        {/* Ambient chandelier light on floor */}
        <polygon points={poly(floorTL, floorTR, floorBR, floorBL)} fill="url(#floorLight)"/>
        {/* Floor perspective lines */}
        {floorLines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#3a1a1a" strokeWidth="0.7" opacity="0.5"/>
        ))}
        {/* Baseboard left */}
        <line x1={floorBL[0]} y1={floorBL[1]} x2={floorTL[0]} y2={floorTL[1]}
          stroke="#c9a84c" strokeWidth="2" opacity="0.25"/>
        {/* Baseboard right */}
        <line x1={floorBR[0]} y1={floorBR[1]} x2={floorTR[0]} y2={floorTR[1]}
          stroke="#c9a84c" strokeWidth="2" opacity="0.25"/>

        {/* ── 2. CEILING ───────────────────────────────────────── */}
        <polygon points={poly(ceilTL, ceilTR, ceilBR, ceilBL)} fill="url(#ceilGrad)"/>
        {/* Crown molding lines */}
        {[0.25, 0.5, 0.75].map((t, i) => {
          const x1 = 0, y1 = H * 0 + (H * 0) * t;
          return (
            <line key={i}
              x1={0} y1={H * 0.05 + i * 15}
              x2={W} y2={H * 0.05 + i * 15}
              stroke="#c9a84c" strokeWidth="0.5" opacity={0.08 - i * 0.02}/>
          );
        })}
        {/* Crown molding at ceiling-wall edge */}
        <line x1={ceilTL[0]} y1={ceilTL[1]} x2={ceilBL[0]} y2={ceilBL[1]}
          stroke="#c9a84c" strokeWidth="1.5" opacity="0.3"/>
        <line x1={ceilTR[0]} y1={ceilTR[1]} x2={ceilBR[0]} y2={ceilBR[1]}
          stroke="#c9a84c" strokeWidth="1.5" opacity="0.3"/>

        {/* ── 3. LEFT WALL ─────────────────────────────────────── */}
        <polygon points={poly([lwTL[0],lwTL[1]], [lwTR[0],lwTR[1]], [lwBR[0],lwBR[1]], [lwBL[0],lwBL[1]])}
          fill="url(#wallLeftGrad)"/>
        {/* Wall paneling lines */}
        {[0.3, 0.6, 0.9].map((t, i) => {
          const y = lwTL[1] + (lwBL[1] - lwTL[1]) * t;
          const yr = lwTR[1] + (lwBR[1] - lwTR[1]) * t;
          return <line key={i} x1={lwTL[0]} y1={y} x2={lwTR[0]} y2={yr}
            stroke="#c9a84c" strokeWidth="0.6" opacity="0.12"/>;
        })}
        {/* Slot machines on left wall */}
        {leftSlots.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={6}
              fill="#1a1610" stroke="#c9a84c" strokeWidth="1.2" opacity="0.7"/>
            {/* Screen */}
            <rect x={s.x+10} y={s.y+12} width={s.w-20} height={(s.h*0.4)} rx={3}
              fill="url(#slotScreen)" opacity="0.6"/>
            {/* Buttons */}
            {[0.2,0.5,0.8].map((bx, j) => (
              <circle key={j} cx={s.x + s.w*bx} cy={s.y+s.h-22} r={7}
                fill={['#e84040','#c9a84c','#4ade80'][j]} opacity="0.8"/>
            ))}
            {/* Side light strip */}
            <rect x={s.x-3} y={s.y+20} width={3} height={s.h-40} rx={1}
              fill="#c9a84c" opacity="0.4"/>
          </g>
        ))}

        {/* ── 4. RIGHT WALL ────────────────────────────────────── */}
        <polygon points={poly([rwTL[0],rwTL[1]], [rwTR[0],rwTR[1]], [rwBR[0],rwBR[1]], [rwBL[0],rwBL[1]])}
          fill="url(#wallRightGrad)"/>
        {[0.3, 0.6, 0.9].map((t, i) => {
          const y = rwTL[1] + (rwBL[1] - rwTL[1]) * t;
          const yr = rwTR[1] + (rwBR[1] - rwTR[1]) * t;
          return <line key={i} x1={rwTL[0]} y1={y} x2={rwTR[0]} y2={yr}
            stroke="#c9a84c" strokeWidth="0.6" opacity="0.12"/>;
        })}
        {rightSlots.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={6}
              fill="#1a1610" stroke="#c9a84c" strokeWidth="1.2" opacity="0.7"/>
            <rect x={s.x+10} y={s.y+12} width={s.w-20} height={(s.h*0.4)} rx={3}
              fill="url(#slotScreen)" opacity="0.6"/>
            {[0.2,0.5,0.8].map((bx, j) => (
              <circle key={j} cx={s.x + s.w*bx} cy={s.y+s.h-22} r={7}
                fill={['#e84040','#c9a84c','#4ade80'][j]} opacity="0.8"/>
            ))}
            <rect x={s.x+s.w} y={s.y+20} width={3} height={s.h-40} rx={1}
              fill="#c9a84c" opacity="0.4"/>
          </g>
        ))}

        {/* ── 5. CHANDELIERS ───────────────────────────────────── */}
        {lights.map((l, i) => (
          <g key={i}>
            {/* Glow */}
            <circle cx={l.x} cy={l.y} r={l.glow} fill="url(#lightGlow)" opacity="0.9"/>
            {/* Chain */}
            <line x1={l.x} y1={0} x2={l.x} y2={l.y - l.r + 2}
              stroke="#c9a84c" strokeWidth={Math.max(0.5, 2 - i*0.4)} opacity="0.35"/>
            {/* Bulb */}
            <circle cx={l.x} cy={l.y} r={l.r}
              fill="#f5e4a0" opacity={0.9 - i*0.12}
              style={{ filter: `blur(${i * 0.5}px)` }}/>
            <circle cx={l.x} cy={l.y} r={l.r * 0.5}
              fill="#fff" opacity={0.8 - i*0.15}/>
          </g>
        ))}

        {/* ── 6. FAR END — two zones ────────────────────────────── */}
        {/* Dark base for the far end */}
        <rect x={farL} y={farT} width={farR-farL} height={farB-farT} fill="#030308"/>

        {/* LEFT ZONE — Toilettes */}
        <rect x={farL} y={farT} width={midX-farL} height={farB-farT}
          fill="url(#toiletGlow)"
          style={{ cursor: 'pointer', transition: 'fill 0.3s' }}
          onMouseEnter={() => setHovered('toilet')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick('toilet')}
        />
        {/* Bathroom corridor perspective depth */}
        <line x1={farL} y1={farT} x2={midX} y2={farT} stroke="#aacced" strokeWidth="1" opacity="0.2"/>
        <line x1={farL} y1={farB} x2={midX} y2={farB} stroke="#aacced" strokeWidth="1" opacity="0.2"/>
        {/* Bathroom door frame */}
        <rect x={farL+22} y={farT+18} width={60} height={farB-farT-18} rx={2}
          fill="none" stroke={isHovToilet ? '#b0d4ff' : '#5580a0'} strokeWidth={isHovToilet ? 1.5 : 0.8}
          opacity={isHovToilet ? 0.8 : 0.35}
          style={{ pointerEvents: 'none' }}/>
        {/* Bathroom light crack under door */}
        <line x1={farL+22} y1={farB-18} x2={farL+82} y2={farB-18}
          stroke="#b0d4ff" strokeWidth={isHovToilet ? 2 : 1}
          opacity={isHovToilet ? 0.9 : 0.4}
          style={{ pointerEvents: 'none' }}/>
        {/* Toilet sign */}
        <text x={farL + (midX-farL)/2} y={farT + 14}
          textAnchor="middle" fontSize="9" fill="#7ab0e8"
          opacity={isHovToilet ? 0.95 : 0.5}
          style={{ pointerEvents: 'none', letterSpacing: '0.12em', fontFamily: 'monospace', fontWeight: 700 }}>
          TOILETTES
        </text>
        {/* Arrow sign */}
        <text x={farL + (midX-farL)/2} y={farT + 26}
          textAnchor="middle" fontSize="14" fill="#7ab0e8"
          opacity={isHovToilet ? 0.9 : 0.35}
          style={{ pointerEvents: 'none' }}>
          ←
        </text>
        {/* Hover label */}
        {isHovToilet && (
          <text x={farL + (midX-farL)/2} y={farB - 14}
            textAnchor="middle" fontSize="10" fill="#b0d4ff"
            fontFamily="system-ui" fontWeight="700" opacity="0.9"
            style={{ pointerEvents: 'none' }}>
            Vous approcher
          </text>
        )}

        {/* RIGHT ZONE — Table de Blackjack */}
        <rect x={midX} y={farT} width={farR-midX} height={farB-farT}
          fill="url(#tableGlow)"
          style={{ cursor: 'pointer', transition: 'fill 0.3s' }}
          onMouseEnter={() => setHovered('table')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick('table')}
        />
        {/* Felt texture hint */}
        <rect x={midX+8} y={farB-50} width={farR-midX-16} height={30} rx={3}
          fill={isHovTable ? '#1a6b42' : '#0e3d26'} opacity={isHovTable ? 0.9 : 0.5}
          style={{ pointerEvents: 'none' }}/>
        {/* Table arc (top of felt) */}
        <ellipse cx={(midX + farR)/2} cy={farB-50} rx={(farR-midX-16)/2} ry={8}
          fill="none" stroke={isHovTable ? '#4ade80' : '#1a6b42'} strokeWidth={isHovTable ? 1.2 : 0.7}
          opacity={isHovTable ? 0.9 : 0.4}
          style={{ pointerEvents: 'none' }}/>
        {/* Cards on table (simple shapes) */}
        {[[-15,0],[0,-4],[15,2]].map(([dx, dy], i) => (
          <rect key={i}
            x={(midX+farR)/2 + dx - 5} y={farB - 46 + dy}
            width={10} height={14} rx={1}
            fill="#f5f0e8" opacity={isHovTable ? 0.85 : 0.35}
            style={{ pointerEvents: 'none' }}/>
        ))}
        {/* Dealer sign */}
        <text x={midX + (farR-midX)/2} y={farT + 14}
          textAnchor="middle" fontSize="9" fill="#3a9b6a"
          opacity={isHovTable ? 0.95 : 0.5}
          style={{ pointerEvents: 'none', letterSpacing: '0.1em', fontFamily: 'monospace', fontWeight: 700 }}>
          BLACKJACK
        </text>
        <text x={midX + (farR-midX)/2} y={farT + 26}
          textAnchor="middle" fontSize="14" fill="#3a9b6a"
          opacity={isHovTable ? 0.9 : 0.35}
          style={{ pointerEvents: 'none' }}>
          →
        </text>
        {isHovTable && (
          <text x={midX + (farR-midX)/2} y={farB - 14}
            textAnchor="middle" fontSize="10" fill="#4ade80"
            fontFamily="system-ui" fontWeight="700" opacity="0.9"
            style={{ pointerEvents: 'none' }}>
            Jouer
          </text>
        )}

        {/* Divider line between zones */}
        <line x1={midX} y1={farT} x2={midX} y2={farB}
          stroke="#333" strokeWidth="1" opacity="0.6"/>

        {/* Far-end border frame */}
        <rect x={farL} y={farT} width={farR-farL} height={farB-farT}
          fill="none" stroke="#c9a84c" strokeWidth="1.5" opacity="0.3"
          style={{ pointerEvents: 'none' }}/>

        {/* ── 7. AMBIENT VIGNETTE ──────────────────────────────── */}
        <rect x="0" y="0" width={W} height={H}
          fill="url(#farVignette)" style={{ pointerEvents: 'none' }}/>

        {/* ── 8. HOVER — corridor darkens on one side ──────────── */}
        {hovered === 'table' && (
          <polygon points={poly([lwTL[0],lwTL[1]], [farL,farT], [farL,farB], [lwBL[0],lwBL[1]])}
            fill="rgba(0,0,0,0.35)" style={{ pointerEvents: 'none' }}
            className="transition-opacity"/>
        )}
        {hovered === 'toilet' && (
          <polygon points={poly([rwTL[0],rwTL[1]], [rwTR[0],rwTR[1]], [rwBR[0],rwBR[1]], [rwBL[0],rwBL[1]])}
            fill="rgba(0,0,0,0.35)" style={{ pointerEvents: 'none' }}/>
        )}
      </svg>

      {/* Text overlay at bottom */}
      <div style={{
        position: 'absolute', bottom: 32, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        opacity: entered ? 1 : 0, transition: 'opacity 1.5s ease 0.5s',
        pointerEvents: 'none',
      }}>
        <p style={{
          color: 'rgba(201,168,76,0.4)', fontSize: 11,
          letterSpacing: '0.35em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', margin: 0,
        }}>
          Où allez-vous ?
        </p>
      </div>
    </div>
  );
}

// ── Écran 1 — Toilettes ─────────────────────────────────────────────────────
function BathroomScreen({ onNext }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #080c12 0%, #0a0f18 60%, #060810 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif", padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Neon light strip */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(160,200,255,0.8), transparent)',
        boxShadow: '0 0 40px 8px rgba(160,200,255,0.2)',
      }}/>
      {/* Tile grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.035,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 44px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 44px)',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 480, textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.9s ease',
      }}>
        {/* Mirror */}
        <div style={{
          width: 150, height: 190, margin: '0 auto 36px',
          background: 'linear-gradient(135deg, rgba(190,215,245,0.1), rgba(160,190,220,0.18), rgba(140,170,200,0.08))',
          border: '2px solid rgba(160,195,235,0.22)',
          borderRadius: 4,
          boxShadow: '0 0 50px rgba(160,200,255,0.07), inset 0 0 40px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 6, right: 6, height: '35%',
            background: 'linear-gradient(180deg,rgba(255,255,255,0.06),transparent)',
            borderRadius: '2px 2px 0 0',
          }}/>
          <div style={{ fontSize: 62 }}>👴</div>
        </div>

        <p style={{ color: 'rgba(160,195,235,0.35)', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', margin: '0 0 18px' }}>
          Couloir B — Toilettes
        </p>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, lineHeight: 1.75, margin: '0 0 10px', fontStyle: 'italic' }}>
          Un vieil homme se tient devant le miroir.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, margin: '0 0 44px', lineHeight: 1.6 }}>
          Il vous regarde dans le reflet.<br/>Il semble vous attendre.
        </p>

        <button onClick={onNext} style={{
          padding: '13px 38px',
          background: 'rgba(160,200,255,0.07)', border: '1px solid rgba(160,200,255,0.22)',
          borderRadius: 12, cursor: 'pointer', color: 'rgba(190,220,255,0.75)', fontSize: 14,
          letterSpacing: '0.1em', fontFamily: "'Georgia', serif", transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background='rgba(160,200,255,0.14)'; e.target.style.borderColor='rgba(160,200,255,0.45)'; }}
          onMouseLeave={e => { e.target.style.background='rgba(160,200,255,0.07)'; e.target.style.borderColor='rgba(160,200,255,0.22)'; }}
        >
          S'approcher →
        </button>
      </div>
    </div>
  );
}

// ── Écran 2 — Il parle ──────────────────────────────────────────────────────
function ManSpeaksScreen({ onNext }) {
  const [phase, setPhase] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #080c12 0%, #0a0f18 60%, #060810 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif", padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: 2,
        background: 'linear-gradient(90deg,transparent,rgba(160,200,255,0.8),transparent)',
        boxShadow: '0 0 40px 8px rgba(160,200,255,0.2)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.035,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 44px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 44px)',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%' }}>
        {phase === 0 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>👴</div>
            <div style={{
              background: 'rgba(10,15,22,0.92)', border: '1px solid rgba(160,200,255,0.12)',
              borderRadius: 16, padding: '26px 30px', marginBottom: 28,
              boxShadow: '0 4px 40px rgba(0,0,0,0.7)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                "J'ai gagné{' '}
                <span style={{ color: '#c9a84c', fontStyle: 'normal', fontWeight: 700 }}>340 000€</span>
                {' '}en 18 mois dans ce casino.
                Ils m'ont banni à vie."
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, margin: '0 0 36px', lineHeight: 1.6 }}>
              Il marque une pause. Son regard reste fixé sur le vôtre.
            </p>
            <button onClick={() => setPhase(1)} style={{
              padding: '13px 38px', background: 'rgba(160,200,255,0.07)',
              border: '1px solid rgba(160,200,255,0.22)', borderRadius: 12, cursor: 'pointer',
              color: 'rgba(190,220,255,0.75)', fontSize: 14, letterSpacing: '0.1em',
              fontFamily: "'Georgia',serif", transition: 'all 0.2s',
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
              background: 'rgba(10,15,22,0.92)', border: '1px solid rgba(160,200,255,0.12)',
              borderRadius: 16, padding: '26px 30px', marginBottom: 28,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.8, margin: '0 0 22px', fontStyle: 'italic' }}>
                "Si tu veux savoir comment... lis ça."
              </p>
              {/* Papier froissé */}
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
              border: '1px solid rgba(160,200,255,0.22)', borderRadius: 12, cursor: 'pointer',
              color: 'rgba(190,220,255,0.75)', fontSize: 14, letterSpacing: '0.1em',
              fontFamily: "'Georgia',serif", transition: 'all 0.2s',
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

// ── Écran 3 — Révélation ────────────────────────────────────────────────────
function RevelationScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 40%,#0a180a 0%,#070d07 50%,#000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif", padding: 24,
      position: 'relative', overflow: 'hidden',
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
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)',
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
            transition: 'transform 0.2s,box-shadow 0.2s',
            marginBottom: 18,
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
            fontFamily: "'Georgia',serif", letterSpacing: '0.05em',
          }}>
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
  const [path, setPath] = useState(null);
  const [step, setStep] = useState(0);

  function handleChoose(choice) {
    if (choice === 'table') {
      navigate('/training');
    } else {
      setPath('toilettes');
      setStep(1);
    }
  }

  if (!path) return <CasinoCorridorScene onChoose={handleChoose} />;

  if (step === 1) return <BathroomScreen onNext={() => setStep(2)} />;
  if (step === 2) return <ManSpeaksScreen onNext={() => setStep(3)} />;
  if (step === 3) return <RevelationScreen />;

  return null;
}
