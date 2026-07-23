import React, { useState, useEffect, useCallback } from 'react';
import SessionResults from './SessionResults';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useLang } from '../../contexts/LanguageContext';
import StrategyCharts from '../charts/StrategyCharts';

const TOTAL_CARDS = 312; // fallback for sub-functions; component uses tableRules.numberOfDecks * 52

function precisionStep(p) {
  return p === 'quarter' ? 0.25 : p === 'half' ? 0.5 : 1.0;
}
function roundDecks(exact, step) {
  return Math.max(step, Math.round(exact / step) * step);
}
function applyTC(rc, est, method) {
  const raw = rc / est;
  return method === 'floor' ? Math.floor(raw) : method === 'round' ? Math.round(raw) : Math.trunc(raw);
}
function fmtN(n) { return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''); }
function fmtRC(n) { return n > 0 ? `+${n}` : String(n); }
function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function realisticRC(cardsInTray, totalCards = TOTAL_CARDS) {
  const variance = (cardsInTray * (totalCards - cardsInTray)) / totalCards * (40 / 52);
  const std = Math.sqrt(variance);
  const u1 = Math.max(1e-10, Math.random());
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
  return Math.round(z * std);
}

// ─── Card Shoe (sabot) SVG — transparent acrylic, 3/4 perspective ──────────
function CardShoe({ cardsRemaining, showHelpers }) {
  const { t } = useLang();
  const fill = cardsRemaining / TOTAL_CARDS;

  const F = { tl: [30, 52], tr: [170, 52], br: [166, 310], bl: [34, 310] };
  const dX = 24, dY = -16;
  const R = { tl: F.tr, tr: [F.tr[0]+dX, F.tr[1]+dY], br: [F.br[0]+dX, F.br[1]+dY], bl: F.br };
  const T = { fl: F.tl, fr: F.tr, br: [F.tr[0]+dX, F.tr[1]+dY], bl: [F.tl[0]+dX, F.tl[1]+dY] };

  const iL = F.tl[0] + 6, iR = F.tr[0] - 6;
  const iW = iR - iL;
  const iTop = F.tl[1] + 4;
  const iBot = F.bl[1] - 4;
  const iH = iBot - iTop;

  const stackH = Math.round(fill * iH);
  const stackTop = iBot - stackH;

  const cardEdgePx = Math.max(0.7, Math.min(2.8, stackH / Math.max(1, cardsRemaining)));
  const numLines = stackH > 0 ? Math.min(cardsRemaining, Math.floor(stackH / cardEdgePx)) : 0;
  const topH = Math.min(18, stackH);

  const pts = (...coords) => coords.map(([x, y]) => `${x},${y}`).join(' ');

  const exactDecksRemaining = cardsRemaining / 52;
  const zoneColor = exactDecksRemaining >= 3.5 ? '#4ade80' : exactDecksRemaining >= 2 ? '#c9a84c' : '#f87171';

  const deckMarkers = [5, 4, 3, 2, 1].map(n => {
    const markerFill = n / 6;
    const y = iBot - Math.round(markerFill * iH);
    const color = n >= 4 ? '#4ade80' : n === 3 ? '#c9a84c' : '#f87171';
    return { n, y, color };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
        {t('tc_shoe')}
      </p>

      <svg viewBox="0 0 220 365" width={185} height={310} xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <pattern id="sPat" x="0" y="0" width="11" height="11" patternUnits="userSpaceOnUse">
            <rect width="11" height="11" fill="#173096"/>
            <polygon points="5.5,1.2 9.8,5.5 5.5,9.8 1.2,5.5" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="0.85"/>
            <circle cx="5.5" cy="5.5" r="0.9" fill="rgba(255,255,255,0.38)"/>
          </pattern>
          <linearGradient id="sacrylL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.55"/>
            <stop offset="8%" stopColor="white" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.02"/>
          </linearGradient>
          <linearGradient id="sacrylR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.02"/>
            <stop offset="90%" stopColor="white" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.32"/>
          </linearGradient>
          <linearGradient id="sacrylTop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.03"/>
          </linearGradient>
          <linearGradient id="sstackShadL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="black" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="sstackShadR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="0"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.14"/>
          </linearGradient>
          <radialGradient id="sfloorShad" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="black" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="black" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="sinnerTint" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8bb8d4" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#8bb8d4" stopOpacity="0.02"/>
          </linearGradient>
          <linearGradient id="stcShine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          {/* Slot opening at bottom of shoe */}
          <linearGradient id="slotGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#111" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        <ellipse cx={108} cy={330} rx={86} ry={9} fill="url(#sfloorShad)"/>

        {/* Base */}
        <polygon points={pts([F.bl[0]-3,F.bl[1]+1],[F.br[0]+3,F.br[1]+1],[F.br[0]+3,F.br[1]+13],[F.bl[0]-3,F.bl[1]+13])} fill="#111"/>
        <polygon points={pts([F.br[0]+3,F.br[1]+1],[R.br[0]+3,R.br[1]+1],[R.br[0]+3,R.br[1]+13],[F.br[0]+3,F.br[1]+13])} fill="#0a0a0a"/>
        <line x1={F.bl[0]-3} y1={F.bl[1]+1} x2={F.br[0]+3} y2={F.br[1]+1} stroke="#333" strokeWidth="1"/>

        {/* Slot at bottom front — where cards exit */}
        <rect x={iL+6} y={F.bl[1]-8} width={iW-12} height={12} fill="url(#slotGrad)" rx="1"/>
        <line x1={iL+6} y1={F.bl[1]-8} x2={iR-6} y2={F.bl[1]-8} stroke="rgba(0,0,0,0.6)" strokeWidth="1"/>

        {/* Right face */}
        <polygon points={pts([R.tl[0],R.tl[1]],[R.tr[0],R.tr[1]],[R.br[0],R.br[1]],[R.bl[0],R.bl[1]])} fill="rgba(160,195,230,0.07)" stroke="rgba(200,225,255,0.22)" strokeWidth="1.2"/>
        {stackH > 0 && Array.from({ length: Math.min(numLines, 60) }).map((_, i) => {
          const t = (i + 1) / Math.min(numLines, 60);
          const yF = iBot - t * stackH;
          const yR = yF + dY * 0.9;
          return <line key={`rs${i}`} x1={F.tr[0]} y1={yF} x2={R.tr[0]} y2={yR} stroke={i % 4 === 0 ? '#aaa' : '#ccc'} strokeWidth="0.4" opacity="0.6"/>;
        })}
        <polygon points={pts([R.tl[0],R.tl[1]],[R.tr[0],R.tr[1]],[R.br[0],R.br[1]],[R.bl[0],R.bl[1]])} fill="url(#sacrylR)"/>

        {/* Top face */}
        <polygon points={pts([T.fl[0],T.fl[1]],[T.fr[0],T.fr[1]],[T.br[0],T.br[1]],[T.bl[0],T.bl[1]])} fill="rgba(180,215,255,0.14)" stroke="rgba(220,235,255,0.35)" strokeWidth="1.2"/>
        <polygon points={pts([T.fl[0],T.fl[1]],[T.fr[0],T.fr[1]],[T.br[0],T.br[1]],[T.bl[0],T.bl[1]])} fill="url(#sacrylTop)"/>

        {/* Front interior */}
        <polygon points={pts([F.tl[0],F.tl[1]],[F.tr[0],F.tr[1]],[F.br[0],F.br[1]],[F.bl[0],F.bl[1]])} fill="url(#sinnerTint)"/>

        {/* Card stack */}
        {stackH > 0 && (
          <>
            <rect x={iL} y={stackTop} width={iW} height={stackH} fill="#e6e2dc"/>
            {Array.from({ length: numLines }).map((_, i) => {
              const y = iBot - Math.round((i + 1) * (stackH / numLines));
              if (y <= stackTop) return null;
              const major = i % 13 === 12;
              return <line key={`ce${i}`} x1={iL} y1={y} x2={iR} y2={y} stroke={major ? '#8a8682' : (i % 2 === 0 ? '#ccc9c4' : '#dedad5')} strokeWidth={major ? 0.7 : 0.45}/>;
            })}
            <rect x={iL} y={stackTop} width={16} height={stackH} fill="url(#sstackShadL)"/>
            <rect x={iR-14} y={stackTop} width={14} height={stackH} fill="url(#sstackShadR)"/>
            {topH > 0 && (
              <>
                <rect x={iL} y={stackTop} width={iW} height={topH} fill="url(#sPat)" rx="1"/>
                <rect x={iL+3} y={stackTop+2} width={iW-6} height={topH-4} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" rx="0.5"/>
                <rect x={iL} y={stackTop} width={iW} height={topH} fill="url(#stcShine)" rx="1"/>
                <rect x={iL} y={stackTop+topH-2} width={iW} height={3} fill="rgba(0,0,0,0.15)"/>
              </>
            )}
          </>
        )}

        {/* Front acrylic walls */}
        <polygon points={pts([F.tl[0],F.tl[1]],[F.tr[0],F.tr[1]],[F.br[0],F.br[1]],[F.bl[0],F.bl[1]])} fill="none" stroke="rgba(200,225,255,0.32)" strokeWidth="1.8"/>
        <rect x={F.tl[0]} y={F.tl[1]} width={10} height={F.bl[1]-F.tl[1]} fill="url(#sacrylL)"/>
        <rect x={F.tr[0]-10} y={F.tr[1]} width={10} height={F.br[1]-F.tr[1]} fill="url(#sacrylR)"/>
        <rect x={F.tl[0]} y={F.tl[1]} width={F.tr[0]-F.tl[0]} height={12} fill="url(#sacrylTop)"/>
        <line x1={F.tl[0]} y1={F.tl[1]} x2={F.bl[0]} y2={F.bl[1]} stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
        <line x1={F.tl[0]} y1={F.tl[1]} x2={F.tr[0]} y2={F.tr[1]} stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
        <line x1={F.bl[0]} y1={F.bl[1]} x2={F.br[0]} y2={F.br[1]} stroke="rgba(200,225,255,0.28)" strokeWidth="1.5"/>
        <line x1={F.tr[0]} y1={F.tr[1]} x2={F.br[0]} y2={F.br[1]} stroke="rgba(200,225,255,0.22)" strokeWidth="1.5"/>
        <line x1={F.tl[0]+18} y1={F.tl[1]+8} x2={F.tl[0]+18} y2={F.bl[1]-20} stroke="rgba(255,255,255,0.1)" strokeWidth="5" strokeLinecap="round"/>
        <circle cx={F.tl[0]+1} cy={F.tl[1]+1} r={2.5} fill="rgba(255,255,255,0.7)"/>
        <circle cx={F.tr[0]-1} cy={F.tr[1]+1} r={2.5} fill="rgba(255,255,255,0.45)"/>

        {/* Deck markers — masqués si showHelpers=false */}
        {showHelpers && deckMarkers.map(({ n, y, color }) => {
          const isActive = stackTop > 0 && stackTop <= y && (n === 5 ? true : stackTop > deckMarkers.find(m => m.n === n + 1)?.y);
          return (
            <g key={n}>
              {isActive && <rect x={iL} y={y-1} width={iW} height={Math.min(22, iBot-y)} fill={color} opacity={0.06} rx={1}/>}
              <line x1={iL} y1={y} x2={iR} y2={y} stroke={color} strokeWidth={isActive ? 1.2 : 0.7} strokeDasharray={isActive ? '5,2' : '3,3'} opacity={isActive ? 0.9 : 0.45}/>
              <text x={iL+4} y={y-2} fontSize={isActive ? 9 : 7.5} fontWeight={isActive ? '800' : '600'} fill={color} textAnchor="start" opacity={isActive ? 1 : 0.55} style={{ letterSpacing: '0.02em' }}>{n}J</text>
            </g>
          );
        })}
      </svg>

      {showHelpers && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: 0, letterSpacing: '0.08em' }}>
            {cardsRemaining} {t('tc_cards_remaining')} · {(cardsRemaining / 52).toFixed(1)} {t('tc_decks')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${zoneColor}12`, border: `1px solid ${zoneColor}35`, borderRadius: 8, padding: '4px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: zoneColor }}/>
            <span style={{ color: zoneColor, fontSize: 11, fontWeight: 700 }}>
              ~{exactDecksRemaining.toFixed(1)} {t('tc_decks_in_shoe')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Casino Discard Tray — photo-realistic ───────────────────────────────────
function DiscardTray({ cardsInTray, showHelpers }) {
  const { t } = useLang();
  const pts = (...coords) => coords.map(([x, y]) => `${x},${y}`).join(' ');

  // ── Geometry — tall tray, clear 3/4 perspective ──
  // Outer front face
  const oL=20, oR=188, oT=36, oB=386;
  // Depth vector
  const dX=34, dY=-26;
  // Acrylic wall thickness (visible as inset)
  const W=8;
  // Inner card area
  const iL=oL+W, iR=oR-W, iT=oT+W, iB=oB-W;
  const iW=iR-iL;  // ~142
  const iH=iB-iT;  // ~334 — full height for 312 cards

  const fill = cardsInTray / TOTAL_CARDS;
  const stackH = Math.round(fill * iH);
  const stackTop = iB - stackH;

  const exactDecksRemaining = (TOTAL_CARDS - cardsInTray) / 52;
  const zoneHigh = Math.ceil(exactDecksRemaining);
  const zoneLow  = Math.floor(exactDecksRemaining);
  const zoneColor = exactDecksRemaining >= 3.5 ? '#4ade80' : exactDecksRemaining >= 2 ? '#c9a84c' : '#f87171';

  // ── Card edge rendering ──
  // Real card = ~0.28mm; 312 cards ≈ 87mm stack → at iH=334px → 1.07px/card
  // We render visible stripe groups (1 stripe ≈ 2–3 cards)
  const pxPerCard = stackH / Math.max(1, cardsInTray);
  const stripeH   = Math.max(1.2, pxPerCard * 2.5);
  const numStripes = stackH > 0 ? Math.min(130, Math.floor(stackH / stripeH)) : 0;

  // Cut card position: 52 cards from bottom (deck 1 marker area)
  const cutCardIdx = Math.round(52 / cardsInTray * numStripes);

  // ── Deck markers (etched lines at 1/6, 2/6 … 5/6 of inner height from bottom) ──
  const deckMarkers = [1,2,3,4,5].map(n => {
    const frac  = n / 6;
    const y     = iB - Math.round(frac * iH);
    const color = n <= 2 ? '#f87171' : n === 3 ? '#c9a84c' : '#4ade80';
    const decksLeft = 6 - n;
    const isActive  = stackTop <= y && stackTop > (n < 5 ? iB - Math.round((n+1)/6*iH) : iT);
    return { n, y, color, decksLeft, isActive };
  });

  // Right-face corners
  const Rtl = [oR, oT], Rtr = [oR+dX, oT+dY], Rbr = [oR+dX, oB+dY], Rbl = [oR, oB];
  // Top-face corners
  const Ttl = [oL, oT], Ttr = [oR, oT], Tbr = [oR+dX, oT+dY], Tbl = [oL+dX, oT+dY];

  const W2 = 260, H2 = 450;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
        {t('tc_discard')}
      </p>

      <svg viewBox={`0 0 ${W2} ${H2}`} width={210} height={360}
           xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          {/* Blue casino card-back diamond pattern */}
          <pattern id="cardBack" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#1a34a8"/>
            <polygon points="5,0.8 9.2,5 5,9.2 0.8,5"
              fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8"/>
            <circle cx="5" cy="5" r="0.8" fill="rgba(255,255,255,0.35)"/>
          </pattern>

          {/* Acrylic wall: left bright edge */}
          <linearGradient id="wallL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.7"/>
            <stop offset="15%"  stopColor="#d8ecff" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#a8d4f0" stopOpacity="0.04"/>
          </linearGradient>
          {/* Acrylic wall: right edge */}
          <linearGradient id="wallR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#a8d4f0" stopOpacity="0.03"/>
            <stop offset="80%"  stopColor="#c0e0ff" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#fff" stopOpacity="0.55"/>
          </linearGradient>
          {/* Top face gradient */}
          <linearGradient id="wallTop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#c0d8f0" stopOpacity="0.05"/>
          </linearGradient>
          {/* Right face side */}
          <linearGradient id="sideR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#b8d8f0" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="#90bce0" stopOpacity="0.06"/>
          </linearGradient>
          {/* Card stack body: warm white paper */}
          <linearGradient id="paperBody" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#dedad5" stopOpacity="1"/>
            <stop offset="8%"   stopColor="#f0ece6" stopOpacity="1"/>
            <stop offset="92%"  stopColor="#ede9e3" stopOpacity="1"/>
            <stop offset="100%" stopColor="#d8d4ce" stopOpacity="1"/>
          </linearGradient>
          {/* Stack top-card shine */}
          <linearGradient id="topCardShine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
          </linearGradient>
          {/* Drop shadow under tray */}
          <radialGradient id="dropShadow" cx="50%" cy="20%" r="50%">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
          {/* Left inner shadow (wall edge cast on cards) */}
          <linearGradient id="innerShadL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </linearGradient>
          {/* Right inner shadow */}
          <linearGradient id="innerShadR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#000" stopOpacity="0"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.18"/>
          </linearGradient>
          {/* Base plastic */}
          <linearGradient id="baseFront" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#2a2a2a"/>
            <stop offset="40%"  stopColor="#111"/>
            <stop offset="100%" stopColor="#0a0a0a"/>
          </linearGradient>
          <linearGradient id="baseSide" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#1a1a1a"/>
            <stop offset="100%" stopColor="#080808"/>
          </linearGradient>
          {/* Clip path for card area */}
          <clipPath id="cardClip">
            <rect x={iL} y={iT} width={iW} height={iH}/>
          </clipPath>
        </defs>

        {/* ── Drop shadow ── */}
        <ellipse cx={oL+(oR-oL)/2+dX/2} cy={oB+dY+28} rx={100} ry={11} fill="url(#dropShadow)"/>

        {/* ══ BASE PLATFORM (heavy black plastic) ══ */}
        {/* Base front face */}
        <polygon points={pts([oL-4,oB+2],[oR+4,oB+2],[oR+4,oB+16],[oL-4,oB+16])} fill="url(#baseFront)"/>
        {/* Base right side */}
        <polygon points={pts([oR+4,oB+2],[oR+dX+2,oB+dY+2],[oR+dX+2,oB+dY+16],[oR+4,oB+16])} fill="url(#baseSide)"/>
        {/* Base top sheen */}
        <line x1={oL-4} y1={oB+2} x2={oR+4} y2={oB+2} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
        {/* Base screw details */}
        <circle cx={oL+10} cy={oB+9} r={2.2} fill="#1a1a1a" stroke="#333" strokeWidth="0.6"/>
        <circle cx={oR-10} cy={oB+9} r={2.2} fill="#1a1a1a" stroke="#333" strokeWidth="0.6"/>

        {/* ══ RIGHT SIDE FACE ══ */}
        <polygon points={pts(Rtl, Rtr, Rbr, Rbl)} fill="url(#sideR)" stroke="rgba(180,215,250,0.2)" strokeWidth="1"/>
        {/* Card edges visible through right acrylic wall */}
        {stackH > 0 && Array.from({ length: Math.min(numStripes, 80) }).map((_, i) => {
          const t  = (i + 0.5) / Math.min(numStripes, 80);
          const yF = iB - t * stackH;
          const yR = yF + dY * 0.85;
          const isDeckBoundary = (i % Math.round(numStripes / 6) === 0);
          return (
            <line key={`rse${i}`}
              x1={oR} y1={yF} x2={oR+dX} y2={yR}
              stroke={isDeckBoundary ? 'rgba(140,130,120,0.7)' : 'rgba(200,195,188,0.45)'}
              strokeWidth={isDeckBoundary ? 0.7 : 0.35}
            />
          );
        })}
        {/* Right face acrylic overlay */}
        <polygon points={pts(Rtl, Rtr, Rbr, Rbl)} fill="url(#wallR)" opacity="0.9"/>
        <line x1={Rtr[0]} y1={Rtr[1]} x2={Rbr[0]} y2={Rbr[1]} stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>

        {/* ══ TOP FACE ══ */}
        <polygon points={pts(Ttl, Ttr, Tbr, Tbl)} fill="rgba(180,220,255,0.16)" stroke="rgba(200,230,255,0.3)" strokeWidth="1"/>
        <polygon points={pts(Ttl, Ttr, Tbr, Tbl)} fill="url(#wallTop)"/>
        {/* Top edge highlight */}
        <line x1={Ttl[0]} y1={Ttl[1]} x2={Ttr[0]} y2={Ttr[1]} stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>

        {/* ══ FRONT FACE INTERIOR TINT (empty space above cards) ══ */}
        {stackH < iH && (
          <rect x={iL} y={iT} width={iW} height={iH - stackH}
            fill="rgba(150,200,240,0.04)"/>
        )}

        {/* ══ CARD STACK ══ */}
        {stackH > 0 && (
          <g clipPath="url(#cardClip)">
            {/* Card body — warm white paper */}
            <rect x={iL} y={stackTop} width={iW} height={stackH} fill="url(#paperBody)"/>

            {/* ── Card edge stripes ──
                Real cards: white paper edges with hairline dark gaps.
                We render alternating light/shadow bands. */}
            {Array.from({ length: numStripes }).map((_, i) => {
              const yBase = iB - ((i + 1) / numStripes) * stackH;
              if (yBase <= stackTop) return null;

              // Card index this stripe represents
              const cardIdx = Math.round((i / numStripes) * cardsInTray);
              const isDeckBoundary = cardIdx > 0 && cardIdx % 52 < Math.ceil(cardsInTray / numStripes);
              const isSuitGroup    = cardIdx % 13 === 0 && !isDeckBoundary;

              if (isDeckBoundary) {
                // Deck separator: a 2px dark band — very visible
                return (
                  <g key={`ce${i}`}>
                    <rect x={iL+1} y={yBase-1.2} width={iW-2} height={2.4}
                      fill="rgba(90,84,76,0.75)"/>
                    <line x1={iL+1} y1={yBase-1.2} x2={iR-1} y2={yBase-1.2}
                      stroke="rgba(255,255,255,0.3)" strokeWidth="0.4"/>
                  </g>
                );
              }
              if (isSuitGroup) {
                // Suit group (13 cards): slightly more visible line
                return (
                  <line key={`ce${i}`}
                    x1={iL+1} y1={yBase} x2={iR-1} y2={yBase}
                    stroke="rgba(150,144,136,0.55)" strokeWidth="0.7"/>
                );
              }
              // Normal card gap: alternating very subtle lines
              const shade = i % 3 === 0
                ? 'rgba(168,162,154,0.35)'
                : i % 3 === 1
                  ? 'rgba(200,195,188,0.2)'
                  : 'rgba(180,175,168,0.28)';
              return (
                <line key={`ce${i}`}
                  x1={iL+1} y1={yBase} x2={iR-1} y2={yBase}
                  stroke={shade} strokeWidth="0.5"/>
              );
            })}

            {/* ── Cut card (yellow plastic) — placed 52 cards from bottom ── */}
            {cardsInTray >= 52 && (() => {
              const cutY = iB - (52 / cardsInTray) * stackH;
              return cutY > stackTop && cutY < iB ? (
                <g key="cut">
                  <rect x={iL} y={cutY-1.5} width={iW} height={3} fill="#f5c800" opacity="0.85"/>
                  <rect x={iL} y={cutY-1.5} width={iW} height={1} fill="rgba(255,255,200,0.6)"/>
                </g>
              ) : null;
            })()}

            {/* ── Top card (face-down, blue diamond pattern) ── */}
            {stackH >= 4 && (
              <g>
                <rect x={iL} y={stackTop} width={iW} height={Math.min(20, stackH)}
                  fill="url(#cardBack)" rx="1.5"/>
                {/* White border frame (casino card detail) */}
                <rect x={iL+3} y={stackTop+2.5} width={iW-6} height={Math.min(16, stackH-4)}
                  fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="0.8"/>
                {/* Shine */}
                <rect x={iL} y={stackTop} width={iW} height={Math.min(20, stackH)}
                  fill="url(#topCardShine)" rx="1.5"/>
                {/* Bottom shadow under top card */}
                <rect x={iL} y={stackTop+Math.min(19,stackH)-2} width={iW} height={3}
                  fill="rgba(0,0,0,0.18)"/>
              </g>
            )}

            {/* Inner wall shadows (acrylic edge cast on card surface) */}
            <rect x={iL} y={stackTop} width={14} height={stackH} fill="url(#innerShadL)"/>
            <rect x={iR-12} y={stackTop} width={12} height={stackH} fill="url(#innerShadR)"/>
          </g>
        )}

        {/* ══ FRONT ACRYLIC WALLS (rendered OVER cards) ══ */}

        {/* Left wall — thick acrylic (W px wide), bright */}
        <rect x={oL} y={oT} width={W} height={oB-oT} fill="rgba(200,230,255,0.08)"/>
        {/* Left outer bright edge */}
        <line x1={oL} y1={oT} x2={oL} y2={oB} stroke="rgba(255,255,255,0.75)" strokeWidth="2.2"/>
        {/* Left inner edge (wall thickness boundary) */}
        <line x1={iL} y1={iT} x2={iL} y2={iB} stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
        {/* Left wall gradient fill */}
        <rect x={oL} y={oT} width={W} height={oB-oT} fill="url(#wallL)"/>

        {/* Right wall */}
        <rect x={iR} y={oT} width={W} height={oB-oT} fill="rgba(200,230,255,0.06)"/>
        <line x1={oR} y1={oT} x2={oR} y2={oB} stroke="rgba(255,255,255,0.42)" strokeWidth="1.8"/>
        <line x1={iR} y1={iT} x2={iR} y2={iB} stroke="rgba(255,255,255,0.18)" strokeWidth="0.7"/>
        <rect x={iR} y={oT} width={W} height={oB-oT} fill="url(#wallR)"/>

        {/* Top wall */}
        <rect x={oL} y={oT} width={oR-oL} height={W} fill="rgba(200,230,255,0.10)"/>
        <line x1={oL} y1={oT} x2={oR} y2={oT} stroke="rgba(255,255,255,0.7)" strokeWidth="2.2"/>
        <line x1={iL} y1={iT} x2={iR} y2={iT} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
        <rect x={oL} y={oT} width={oR-oL} height={W} fill="url(#wallTop)"/>

        {/* Bottom wall (card insertion slot area) */}
        <rect x={oL} y={iB} width={oR-oL} height={W} fill="rgba(0,0,0,0.35)"/>
        {/* Slot opening */}
        <rect x={iL+12} y={iB+1} width={iW-24} height={W-2} fill="rgba(0,0,0,0.6)" rx="1"/>
        <line x1={iL+12} y1={iB+1} x2={iR-12} y2={iB+1} stroke="rgba(0,0,0,0.5)" strokeWidth="0.8"/>

        {/* Front face outer outline */}
        <rect x={oL} y={oT} width={oR-oL} height={oB-oT}
          fill="none" stroke="rgba(180,215,255,0.25)" strokeWidth="1.5"/>

        {/* Corner refraction dots */}
        <circle cx={oL+1.5} cy={oT+1.5} r={3} fill="rgba(255,255,255,0.8)"/>
        <circle cx={oR-1.5} cy={oT+1.5} r={2} fill="rgba(255,255,255,0.5)"/>
        <circle cx={oL+1.5} cy={oB-1.5} r={1.8} fill="rgba(255,255,255,0.3)"/>

        {/* Diagonal glare streak (casino overhead lighting) */}
        <line x1={oL+22} y1={oT+12} x2={oL+22} y2={oB-30}
          stroke="rgba(255,255,255,0.07)" strokeWidth="7" strokeLinecap="round"/>
        <line x1={oL+32} y1={oT+8} x2={oL+32} y2={oT+80}
          stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeLinecap="round"/>

        {/* ══ DECK MARKERS (etched into acrylic, shown on inner wall edges) ══ */}
        {showHelpers && deckMarkers.map(({ n, y, color, decksLeft, isActive }) => (
          <g key={n}>
            {isActive && (
              <rect x={iL+1} y={y} width={iW-2} height={Math.min(28, iB - y)}
                fill={color} opacity={0.05} rx={1}/>
            )}
            <line x1={iL+1} y1={y} x2={iR-1} y2={y}
              stroke={color}
              strokeWidth={isActive ? 1.4 : 0.8}
              strokeDasharray={isActive ? '6,2.5' : '3.5,3'}
              opacity={isActive ? 0.95 : 0.4}/>
            <rect x={oL+1} y={y-2} width={W-2} height={4}
              fill={color} opacity={isActive ? 0.6 : 0.25} rx={1}/>
            <text x={iL+6} y={y-3}
              fontSize={isActive ? 9.5 : 7.5}
              fontWeight={isActive ? '900' : '600'}
              fill={color}
              opacity={isActive ? 1 : 0.5}
              style={{ letterSpacing: '0.04em', fontFamily: 'monospace' }}>
              {decksLeft}J↑
            </text>
            <circle cx={iR-4} cy={y} r={isActive ? 2.5 : 1.5}
              fill={color} opacity={isActive ? 0.9 : 0.35}/>
          </g>
        ))}
      </svg>

      {/* Indicateurs masquables */}
      {showHelpers && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em' }}>
            {cardsInTray} {t('tc_cards_in_discard')} · {(cardsInTray / 52).toFixed(1)} {t('tc_decks_discarded')}
          </p>
          <div style={{ width: 210, background: '#151515', borderRadius: 6, overflow: 'hidden', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 7px 0' }}>
              {[6,5,4,3,2,1,0].map(n => (
                <span key={n} style={{ fontSize: 8, color: '#2e2e2e', fontWeight: 700 }}>{n}</span>
              ))}
            </div>
            <div style={{ position: 'relative', height: 11, margin: '2px 7px 5px' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    flex: 1,
                    background: i < 2 ? 'rgba(248,113,113,0.12)' : i < 4 ? 'rgba(201,168,76,0.12)' : 'rgba(74,222,128,0.12)',
                    borderRight: i < 5 ? '1px solid #1e1e1e' : 'none',
                  }}/>
                ))}
              </div>
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${(exactDecksRemaining / 6) * 100}%`,
                width: 3, background: zoneColor, borderRadius: 2,
                boxShadow: `0 0 7px ${zoneColor}80`,
                transform: 'translateX(-50%)',
              }}/>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${zoneColor}12`, border: `1px solid ${zoneColor}30`, borderRadius: 8, padding: '4px 12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: zoneColor, boxShadow: `0 0 5px ${zoneColor}` }}/>
            <span style={{ color: zoneColor, fontSize: 11, fontWeight: 700 }}>
              {t('tc_zone')} {zoneLow}–{zoneHigh} {t('tc_decks_left')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TC Input ────────────────────────────────────────────────────────────────
function TCInput({ value, onChange, onSubmit }) {
  const { t } = useLang();
  return (
    <div className="bg-[#2a2a2d] rounded-xl p-6 space-y-5">
      <p className="text-center text-gray-400 text-xs uppercase tracking-widest">{t('tc_your_tc')}</p>
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => onChange(value - 1)} className="w-11 h-11 rounded-full bg-[#1a1a1d] border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-white"/>
        </button>
        <div className="w-20 h-14 bg-[#1a1a1d] border border-gray-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl font-bold tabular-nums">{fmtRC(value)}</span>
        </div>
        <button onClick={() => onChange(value + 1)} className="w-11 h-11 rounded-full bg-[#1a1a1d] border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-white"/>
        </button>
      </div>
      <button onClick={onSubmit} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
        {t('tc_validate')}
      </button>
    </div>
  );
}

function ProgressPanel({ correct, total }) {
  const { t } = useLang();
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="bg-[#2a2a2d] rounded-xl p-4">
      <div className="flex justify-between items-center">
<span className="text-gray-400 text-sm">{correct} / {total} {t('tc_correctes')}</span>
        <span className={`font-bold text-sm ${pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
      </div>
    </div>
  );
}

function WrongBreakdown({ scenario, onNext }) {
  const { t } = useLang();
  const { rc, cardsInTray, exactDecksRemaining, estimatedDecks, exactTC, expectedTC, step } = scenario;
  const divLabel = step === 1 ? t('tc_whole_deck') : step === 0.5 ? t('tc_half_deck') : t('tc_quarter_deck');
  const rows = [
    { l: t('tc_running_count'),             v: fmtRC(rc) },
    { l: t('tc_cards_in_discard'),        v: `${cardsInTray}` },
    { l: t('tc_decks_in_tray'),          v: (cardsInTray/52).toFixed(2) },
    { l: t('tc_cards_left_detail'),               v: `${totalCards - cardsInTray}` },
    { l: t('tc_exact_decks'),          v: exactDecksRemaining.toFixed(3), hi: true },
    { l: `${t('tc_estimated_decks')} (÷ ${divLabel})`,   v: fmtN(estimatedDecks), hi: true },
    { l: t('tc_exact_tc'),         v: exactTC.toFixed(3) },
    { l: t('tc_expected_tc'), v: fmtRC(expectedTC), ans: true },
  ];
  return (
    <div className="bg-[#2a2a2d] rounded-xl overflow-hidden">
      <div className="bg-orange-500/20 border-b border-orange-500/30 px-5 py-3 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm leading-none">!</span>
        </div>
<p className="text-orange-300 font-semibold text-sm">{t('tc_wrong_detail')}</p>
      </div>
      <div className="px-5 pt-3 pb-2">
        {rows.map(({ l, v, hi, ans }) => (
          <div key={l} className="flex justify-between items-center py-1 border-b border-gray-700/40 last:border-0">
            <span className="text-gray-400 text-xs pr-3">{l}</span>
            <span className={`font-semibold tabular-nums text-sm flex-shrink-0 ${ans ? 'text-emerald-400 text-base font-bold' : hi ? 'text-amber-300' : 'text-white'}`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4 pt-2">
        <p className="text-gray-500 text-xs mb-3 text-center font-mono">
          {fmtRC(rc)} ÷ {fmtN(estimatedDecks)} = {exactTC.toFixed(3)} → <span className="text-emerald-400 font-bold">{fmtRC(expectedTC)}</span>
        </p>
<button onClick={onNext} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
          {t('tc_next')}
        </button>
      </div>
    </div>
  );
}

function CorrectFlash() {
  const { t } = useLang();
  return (
    <div className="bg-[#2a2a2d] rounded-xl p-6 flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <p className="text-emerald-400 text-xl font-bold">{t('tc_correct')}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TrueCountTraining() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { currentModule, additionalSettings, tableRules } = useGame();
  const totalCards = (tableRules?.numberOfDecks || 6) * 52;
  const [showChart, setShowChart] = useState(false);

  const duration = currentModule?.config?.duration || '1:30';
  const [dM, dS] = duration.split(':').map(Number);
  const maxTime = dM * 60 + (dS || 0);

  const precision = additionalSettings?.deckEstimationPrecision || 'half';
  const tcMethod  = additionalSettings?.trueCountMethod         || 'truncate';
  const step      = precisionStep(precision);

  const [timer,        setTimer]       = useState(0);
  const [running,      setRunning]     = useState(true);
  const [stats,        setStats]       = useState({ correct: 0, total: 0 });
  const [screen,       setScreen]      = useState('question');
  const [userAnswer,   setUserAnswer]  = useState(0);
  const [scenario,     setScenario]    = useState(null);
  const [rcMistakes,   setRcMistakes]  = useState([]);
  const [showResults,  setShowResults] = useState(false);
  const [showHelpers,  setShowHelpers] = useState(true);

  const generate = useCallback(() => {
    const maxStep     = Math.floor((totalCards - 26) / 13);
    const step13      = Math.floor(Math.random() * maxStep) + 1;
    const cardsInTray = step13 * 13;
    const exact       = (totalCards - cardsInTray) / 52;
    const rc          = realisticRC(cardsInTray, totalCards);
    const est         = roundDecks(exact, step);
    const exactTC     = rc / exact;
    const expectedTC  = applyTC(rc, est, tcMethod);
    setScenario({ rc, cardsInTray, exactDecksRemaining: exact, estimatedDecks: est, exactTC, expectedTC, step });
    setUserAnswer(0);
  }, [step, tcMethod, totalCards]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    if (!running || screen === 'wrong') return;
    if (timer >= maxTime) { setRunning(false); return; }
    const id = setInterval(() => {
      setTimer(t => { if (t + 1 >= maxTime) { setRunning(false); return maxTime; } return t + 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [running, screen, timer, maxTime]);

  const submit = () => {
    if (!scenario) return;
    const ok = userAnswer === scenario.expectedTC;
    setStats(p => ({ correct: p.correct + (ok ? 1 : 0), total: p.total + 1 }));
    if (ok) { setScreen('correct'); setTimeout(() => { setScreen('question'); generate(); }, 900); }
    else    { setScreen('wrong'); setRcMistakes(prev => [...prev, { userAnswer, correctAnswer: scenario.expectedTC }]); }
  };

  const next    = () => { setScreen('question'); generate(); };
  const restart = () => { setTimer(0); setRunning(true); setStats({ correct:0, total:0 }); setRcMistakes([]); setShowResults(false); setScreen('question'); generate(); };

  if (!scenario) return null;

  if (showResults) {
    return (
      <SessionResults
        moduleName="True Count"
        accentColor="#60a5fa"
        stats={{ correct: stats.correct, incorrect: stats.total - stats.correct, total: stats.total }}
        timeSeconds={timer}
        rcMistakes={rcMistakes}
        onReplay={restart}
        onHome={() => navigate('/training')}
      />
    );
  }

  const cardsRemaining = totalCards - scenario.cardsInTray;
  const timeLeft = maxTime - timer;
  const timerColor = timeLeft <= 30 ? '#f87171' : timeLeft <= 60 ? '#c9a84c' : '#4ade80';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowChart(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 text-white"/>
            </button>
            <div className="p-5"><StrategyCharts/></div>
          </div>
        </div>
      )}

      {/* Casino felt background */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, #1a5c35 0%, #0f3d22 50%, #071508 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}/>
      <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '120%', height: 200, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', border: '3px solid rgba(201,168,76,0.2)', borderBottom: 'none', pointerEvents: 'none' }}/>
      {/* Subtle felt texture */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)',
        pointerEvents: 'none',
      }}/>
      {/* Casino table oval arc at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '45%', background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.3) 0%, transparent 60%)', pointerEvents: 'none' }}/>

      <header className="relative z-10 bg-black/40 backdrop-blur-sm px-6 py-4 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/training')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white"/>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">True Count</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('tc_estimation')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${timerColor}40`, borderRadius: 10, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: timerColor, boxShadow: `0 0 6px ${timerColor}` }}/>
              <span style={{ color: timerColor, fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
                {fmtTime(timeLeft)}
              </span>
            </div>
            <button onClick={() => setShowChart(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors">
              <BookOpen className="w-4 h-4 text-amber-400"/>
<span className="text-amber-300 text-sm font-semibold hidden sm:inline">{t('rc_charts')}</span>
            </button>
            <button onClick={() => { setRunning(false); setShowResults(true); }} disabled={stats.total === 0} className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {t('tc_terminate')}
            </button>
            <button
              onClick={() => setShowHelpers(h => !h)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
              style={{
                background: showHelpers ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.06)',
                borderColor: showHelpers ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)',
              }}
              title={showHelpers ? t('tc_help_off') : t('tc_help_on')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showHelpers ? '#60a5fa' : '#555'} strokeWidth="2" strokeLinecap="round">
                {showHelpers
                  ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                }
              </svg>
              <span className="text-sm font-semibold hidden sm:inline" style={{ color: showHelpers ? '#60a5fa' : '#555' }}>
                {showHelpers ? t('tc_help_on') : t('tc_help_off')}
              </span>
            </button>
            <button onClick={restart} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <RotateCcw className="w-5 h-5 text-white"/>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* RC prominently at center top — like a casino display */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Running Count</p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '10px 40px',
            boxShadow: '0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <span style={{
              fontSize: 52, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
              color: scenario.rc > 0 ? '#4ade80' : scenario.rc < 0 ? '#f87171' : '#fff',
              textShadow: scenario.rc > 0 ? '0 0 20px rgba(74,222,128,0.4)' : scenario.rc < 0 ? '0 0 20px rgba(248,113,113,0.4)' : 'none',
            }}>
              {fmtRC(scenario.rc)}
            </span>
          </div>
        </div>

        {/* Sabot + Bac de défausse + Question */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Sabot */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CardShoe cardsRemaining={cardsRemaining} showHelpers={showHelpers}/>
          </div>

          {/* Input / Result / Progress au centre */}
          <div className="space-y-4">
            {screen === 'question' && <TCInput value={userAnswer} onChange={setUserAnswer} onSubmit={submit}/>}
            {screen === 'correct'  && <CorrectFlash/>}
            {screen === 'wrong'    && <WrongBreakdown scenario={scenario} onNext={next}/>}
            <ProgressPanel correct={stats.correct} total={stats.total}/>
          </div>

          {/* Bac de défausse */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DiscardTray cardsInTray={scenario.cardsInTray} showHelpers={showHelpers}/>
          </div>
        </div>
      </main>
    </div>
  );
}
