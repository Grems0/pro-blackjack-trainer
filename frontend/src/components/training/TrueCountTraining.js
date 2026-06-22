import React, { useState, useEffect, useCallback } from 'react';
import SessionResults from './SessionResults';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import StrategyCharts from '../charts/StrategyCharts';

const TOTAL_CARDS = 312;

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

// Brownian bridge distribution — realistic RC for Hi-Lo, 6-deck shoe
function realisticRC(cardsInTray) {
  const variance = (cardsInTray * (TOTAL_CARDS - cardsInTray)) / TOTAL_CARDS * (40 / 52);
  const std = Math.sqrt(variance);
  const u1 = Math.max(1e-10, Math.random());
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
  return Math.round(z * std);
}

// ─── Casino Discard Tray — photo-faithful SVG ─────────────────────────────────
// Transparent acrylic shoe holder, 3/4 perspective (slightly above + right).
// Cards stack from bottom; height proportional to cardsInTray.

function DiscardTray({ cardsInTray }) {
  const fill = cardsInTray / TOTAL_CARDS; // 0..1

  // ── Geometry ──────────────────────────────────────────────────────────────
  // Front face (trapezoid — slightly wider at top due to perspective angle)
  const F = { tl: [26, 50], tr: [174, 50], br: [170, 318], bl: [30, 318] };
  // Right-side depth (perspective offset)
  const dX = 26, dY = -18;
  // Right face
  const R = {
    tl: F.tr, tr: [F.tr[0]+dX, F.tr[1]+dY],
    br: [F.br[0]+dX, F.br[1]+dY], bl: F.br,
  };
  // Top face
  const T = {
    fl: F.tl, fr: F.tr,
    br: [F.tr[0]+dX, F.tr[1]+dY],
    bl: [F.tl[0]+dX, F.tl[1]+dY],
  };

  // Inner card area (inset from walls)
  const iL = F.tl[0] + 6, iR = F.tr[0] - 6;
  const iW = iR - iL;       // ~142
  const iTop = F.tl[1] + 4;
  const iBot = F.bl[1] - 4; // ~314
  const iH = iBot - iTop;   // total inner height

  // Card stack (grows from bottom)
  const stackH = Math.round(fill * iH);
  const stackTop = iBot - stackH;

  // Card edge lines (individual card slices visible through acrylic)
  const cardEdgePx = Math.max(0.7, Math.min(2.8, stackH / Math.max(1, cardsInTray)));
  const numLines   = stackH > 0 ? Math.min(cardsInTray, Math.floor(stackH / cardEdgePx)) : 0;

  // Top card visible (face-down with blue diamond pattern)
  const topH = Math.min(18, stackH);

  // ── Helper: polygon point string ──────────────────────────────────────────
  const pts = (...coords) => coords.map(([x, y]) => `${x},${y}`).join(' ');

  // ── Deck markers: où serait le haut de la pile si N jeux restaient ───────
  const deckMarkers = [5, 4, 3, 2, 1].map(n => {
    const markerFill = (6 - n) / 6;
    const y = iBot - Math.round(markerFill * iH);
    const color = n >= 4 ? '#4ade80' : n === 3 ? '#c9a84c' : '#f87171';
    return { n, y, color };
  });

  // Zone actuelle : entre quels marqueurs se trouve le haut de la pile ?
  const exactDecksRemaining = (TOTAL_CARDS - cardsInTray) / 52;
  const zoneHigh = Math.ceil(exactDecksRemaining);
  const zoneLow  = Math.floor(exactDecksRemaining);
  const zoneColor = exactDecksRemaining >= 3.5 ? '#4ade80' : exactDecksRemaining >= 2 ? '#c9a84c' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
        Bac de défausse
      </p>

      <svg
        viewBox="0 0 220 370"
        width={190}
        height={320}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          {/* Classic casino card-back: blue + white diamond grid (matching photo) */}
          <pattern id="dPat" x="0" y="0" width="11" height="11" patternUnits="userSpaceOnUse">
            <rect width="11" height="11" fill="#173096"/>
            <polygon points="5.5,1.2 9.8,5.5 5.5,9.8 1.2,5.5"
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="0.85"/>
            <circle cx="5.5" cy="5.5" r="0.9" fill="rgba(255,255,255,0.38)"/>
          </pattern>

          {/* Card-back border frame overlay */}
          <pattern id="dPatFr" x="0" y="0" width="11" height="11" patternUnits="userSpaceOnUse">
            <rect width="11" height="11" fill="#1c38a8"/>
            <polygon points="5.5,1.2 9.8,5.5 5.5,9.8 1.2,5.5"
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.9"/>
            <circle cx="5.5" cy="5.5" r="1" fill="rgba(255,255,255,0.45)"/>
          </pattern>

          {/* Acrylic edge gradient (bright left highlight) */}
          <linearGradient id="acrylL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0.55"/>
            <stop offset="8%"   stopColor="white" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.02"/>
          </linearGradient>
          <linearGradient id="acrylR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0.02"/>
            <stop offset="90%"  stopColor="white" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.32"/>
          </linearGradient>
          <linearGradient id="acrylTop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.03"/>
          </linearGradient>

          {/* Card stack side shadow (depth illusion on stack body) */}
          <linearGradient id="stackShadL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="black" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="black" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="stackShadR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="black" stopOpacity="0"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.14"/>
          </linearGradient>

          {/* Bottom shadow under base */}
          <radialGradient id="floorShad" cx="50%" cy="30%" r="50%">
            <stop offset="0%"   stopColor="black" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="black" stopOpacity="0"/>
          </radialGradient>

          {/* Inner wall tint (very subtle blue tint of acrylic body, top portion) */}
          <linearGradient id="innerTint" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#8bb8d4" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#8bb8d4" stopOpacity="0.02"/>
          </linearGradient>

          {/* Top-card shine */}
          <linearGradient id="tcShine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* ── Floor shadow ── */}
        <ellipse cx={110} cy={335} rx={90} ry={10} fill="url(#floorShad)"/>

        {/* ══ BLACK BASE ══ */}
        {/* Front base plate */}
        <polygon
          points={pts(
            [F.bl[0]-3, F.bl[1]+1], [F.br[0]+3, F.br[1]+1],
            [F.br[0]+3, F.br[1]+13], [F.bl[0]-3, F.bl[1]+13]
          )}
          fill="#111"
        />
        {/* Base right side */}
        <polygon
          points={pts(
            [F.br[0]+3, F.br[1]+1], [R.br[0]+3, R.br[1]+1],
            [R.br[0]+3, R.br[1]+13], [F.br[0]+3, F.br[1]+13]
          )}
          fill="#0a0a0a"
        />
        {/* Base top edge highlight */}
        <line x1={F.bl[0]-3} y1={F.bl[1]+1} x2={F.br[0]+3} y2={F.br[1]+1}
          stroke="#333" strokeWidth="1"/>

        {/* ══ RIGHT SIDE FACE ══ */}
        <polygon
          points={pts([R.tl[0], R.tl[1]], [R.tr[0], R.tr[1]], [R.br[0], R.br[1]], [R.bl[0], R.bl[1]])}
          fill="rgba(160,195,230,0.07)"
          stroke="rgba(200,225,255,0.22)"
          strokeWidth="1.2"
        />
        {/* Right-side stack (card edges visible through right wall) */}
        {stackH > 0 && Array.from({ length: Math.min(numLines, 60) }).map((_, i) => {
          // Project card line from front-right edge to back-right edge
          const t   = (i + 1) / Math.min(numLines, 60);
          const yF  = iBot - t * stackH;
          const yR  = yF + dY * 0.9;
          const xR  = F.tr[0];
          const xRb = R.tr[0];
          return (
            <line key={`rs${i}`}
              x1={xR} y1={yF}
              x2={xRb} y2={yR}
              stroke={i % 4 === 0 ? '#aaa' : '#ccc'}
              strokeWidth="0.4"
              opacity="0.6"
            />
          );
        })}
        {/* Right-side acrylic overlay */}
        <polygon
          points={pts([R.tl[0], R.tl[1]], [R.tr[0], R.tr[1]], [R.br[0], R.br[1]], [R.bl[0], R.bl[1]])}
          fill="url(#acrylR)"
        />

        {/* ══ TOP FACE ══ */}
        <polygon
          points={pts([T.fl[0], T.fl[1]], [T.fr[0], T.fr[1]], [T.br[0], T.br[1]], [T.bl[0], T.bl[1]])}
          fill="rgba(180,215,255,0.14)"
          stroke="rgba(220,235,255,0.35)"
          strokeWidth="1.2"
        />
        <polygon
          points={pts([T.fl[0], T.fl[1]], [T.fr[0], T.fr[1]], [T.br[0], T.br[1]], [T.bl[0], T.bl[1]])}
          fill="url(#acrylTop)"
        />

        {/* ══ FRONT FACE — empty interior tint ══ */}
        <polygon
          points={pts([F.tl[0], F.tl[1]], [F.tr[0], F.tr[1]], [F.br[0], F.br[1]], [F.bl[0], F.bl[1]])}
          fill="url(#innerTint)"
        />

        {/* ══ CARD STACK ══ */}
        {stackH > 0 && (
          <>
            {/* ── Stack body (compressed card material — cream/white) ── */}
            <rect
              x={iL} y={stackTop}
              width={iW} height={stackH}
              fill="#e6e2dc"
            />

            {/* ── Individual card-edge lines (horizontal slices, visible through front acrylic) ── */}
            {Array.from({ length: numLines }).map((_, i) => {
              const y = iBot - Math.round((i + 1) * (stackH / numLines));
              if (y <= stackTop) return null;
              // Vary tone: thicker separator every ~13 cards (one card group)
              const major = i % 13 === 12;
              return (
                <line key={`ce${i}`}
                  x1={iL} y1={y} x2={iR} y2={y}
                  stroke={major ? '#8a8682' : (i % 2 === 0 ? '#ccc9c4' : '#dedad5')}
                  strokeWidth={major ? 0.7 : 0.45}
                />
              );
            })}

            {/* ── Left edge shadow on stack ── */}
            <rect x={iL} y={stackTop} width={16} height={stackH} fill="url(#stackShadL)"/>
            <rect x={iR - 14} y={stackTop} width={14} height={stackH} fill="url(#stackShadR)"/>

            {/* ── Top card — face-down, classic blue diamond pattern ── */}
            {topH > 0 && (
              <>
                {/* Card body */}
                <rect
                  x={iL} y={stackTop}
                  width={iW} height={topH}
                  fill="url(#dPatFr)"
                  rx="1"
                />
                {/* White border frame (classic casino card detail) */}
                <rect
                  x={iL + 3} y={stackTop + 2}
                  width={iW - 6} height={topH - 4}
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.9"
                  rx="0.5"
                />
                {/* Shine streak on top card */}
                <rect
                  x={iL} y={stackTop}
                  width={iW} height={topH}
                  fill="url(#tcShine)"
                  rx="1"
                />
                {/* Bottom shadow under top card (separation from rest of stack) */}
                <rect
                  x={iL} y={stackTop + topH - 2}
                  width={iW} height={3}
                  fill="rgba(0,0,0,0.15)"
                />
              </>
            )}
          </>
        )}

        {/* ══ FRONT ACRYLIC WALLS (drawn OVER card stack for realism) ══ */}

        {/* Main front face outline */}
        <polygon
          points={pts([F.tl[0], F.tl[1]], [F.tr[0], F.tr[1]], [F.br[0], F.br[1]], [F.bl[0], F.bl[1]])}
          fill="none"
          stroke="rgba(200,225,255,0.32)"
          strokeWidth="1.8"
        />

        {/* Left wall highlight (bright strip — acrylic edge effect) */}
        <rect x={F.tl[0]} y={F.tl[1]} width={10} height={F.bl[1] - F.tl[1]}
          fill="url(#acrylL)" />
        {/* Right wall highlight */}
        <rect x={F.tr[0] - 10} y={F.tr[1]} width={10} height={F.br[1] - F.tr[1]}
          fill="url(#acrylR)" />
        {/* Top wall highlight */}
        <rect x={F.tl[0]} y={F.tl[1]} width={F.tr[0] - F.tl[0]} height={12}
          fill="url(#acrylTop)" />

        {/* Left edge bright line */}
        <line x1={F.tl[0]} y1={F.tl[1]} x2={F.bl[0]} y2={F.bl[1]}
          stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
        {/* Top edge bright line */}
        <line x1={F.tl[0]} y1={F.tl[1]} x2={F.tr[0]} y2={F.tr[1]}
          stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
        {/* Bottom edge */}
        <line x1={F.bl[0]} y1={F.bl[1]} x2={F.br[0]} y2={F.br[1]}
          stroke="rgba(200,225,255,0.28)" strokeWidth="1.5"/>
        {/* Right edge */}
        <line x1={F.tr[0]} y1={F.tr[1]} x2={F.br[0]} y2={F.br[1]}
          stroke="rgba(200,225,255,0.22)" strokeWidth="1.5"/>

        {/* Diagonal shine streak across front face (acrylic reflection) */}
        <line x1={F.tl[0] + 18} y1={F.tl[1] + 8} x2={F.tl[0] + 18} y2={F.bl[1] - 20}
          stroke="rgba(255,255,255,0.1)" strokeWidth="5" strokeLinecap="round"/>

        {/* Corner highlight dots (acrylic corner refraction) */}
        <circle cx={F.tl[0]+1} cy={F.tl[1]+1} r={2.5} fill="rgba(255,255,255,0.7)"/>
        <circle cx={F.tr[0]-1} cy={F.tr[1]+1} r={2.5} fill="rgba(255,255,255,0.45)"/>

        {/* ══ REPÈRES DE JEUX (deck markers) — dessinés EN DERNIER pour être au-dessus ══ */}
        {deckMarkers.map(({ n, y, color }) => {
          const isActive = stackTop > 0 && stackTop <= y && (
            n === 5 ? true : stackTop > deckMarkers.find(m => m.n === n + 1)?.y
          );
          return (
            <g key={n}>
              {/* Zone highlight (bande colorée entre ce marqueur et le suivant) */}
              {isActive && (
                <rect
                  x={iL} y={y - 1}
                  width={iW} height={Math.min(22, iBot - y)}
                  fill={color} opacity={0.06} rx={1}
                />
              )}
              {/* Ligne pointillée à travers la largeur intérieure */}
              <line
                x1={iL} y1={y} x2={iR} y2={y}
                stroke={color}
                strokeWidth={isActive ? 1.2 : 0.7}
                strokeDasharray={isActive ? '5,2' : '3,3'}
                opacity={isActive ? 0.9 : 0.45}
              />
              {/* Label gravé sur le mur gauche intérieur */}
              <text
                x={iL + 4} y={y - 2}
                fontSize={isActive ? 9 : 7.5}
                fontWeight={isActive ? '800' : '600'}
                fill={color}
                textAnchor="start"
                opacity={isActive ? 1 : 0.55}
                style={{ letterSpacing: '0.02em' }}
              >
                {n}J↑
              </text>
            </g>
          );
        })}
      </svg>

      {/* Indicateur de zone */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em' }}>
          {cardsInTray} cartes défaussées · {(cardsInTray / 52).toFixed(1)} jeux
        </p>

        {/* Barre de progression des jeux restants */}
        <div style={{ width: 190, background: '#1a1a1a', borderRadius: 6, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
          {/* Étiquettes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px 0', marginBottom: 2 }}>
            {[6,5,4,3,2,1,0].map(n => (
              <span key={n} style={{ fontSize: 8, color: '#333', fontWeight: 700, lineHeight: 1 }}>{n}</span>
            ))}
          </div>
          {/* Barre */}
          <div style={{ position: 'relative', height: 10, margin: '0 6px 5px' }}>
            {/* Fond segmenté */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ flex: 1, background: i < 2 ? 'rgba(248,113,113,0.15)' : i < 4 ? 'rgba(201,168,76,0.15)' : 'rgba(74,222,128,0.15)', borderRight: i < 5 ? '1px solid #222' : 'none' }} />
              ))}
            </div>
            {/* Curseur position actuelle */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${(exactDecksRemaining / 6) * 100}%`,
              width: 3, background: zoneColor, borderRadius: 2,
              boxShadow: `0 0 6px ${zoneColor}`,
              transform: 'translateX(-50%)',
            }} />
          </div>
        </div>

        {/* Badge de zone */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `${zoneColor}12`, border: `1px solid ${zoneColor}35`,
          borderRadius: 8, padding: '4px 10px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: zoneColor }} />
          <span style={{ color: zoneColor, fontSize: 11, fontWeight: 700 }}>
            Zone {zoneLow}–{zoneHigh} jeux restants
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── TC Input ────────────────────────────────────────────────────────────────

function TCInput({ value, onChange, onSubmit }) {
  return (
    <div className="bg-[#2a2a2d] rounded-xl p-6 space-y-5">
      <p className="text-center text-gray-400 text-xs uppercase tracking-widest">
        Votre True Count
      </p>
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => onChange(value - 1)}
          className="w-11 h-11 rounded-full bg-[#1a1a1d] border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-white"/>
        </button>
        <div className="w-20 h-14 bg-[#1a1a1d] border border-gray-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl font-bold tabular-nums">{fmtRC(value)}</span>
        </div>
        <button onClick={() => onChange(value + 1)}
          className="w-11 h-11 rounded-full bg-[#1a1a1d] border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-white"/>
        </button>
      </div>
      <button onClick={onSubmit}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
        Valider
      </button>
    </div>
  );
}

// ─── Progress (score only) ───────────────────────────────────────────────────

function ProgressPanel({ correct, total }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="bg-[#2a2a2d] rounded-xl p-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">{correct} / {total} correctes</span>
        <span className={`font-bold text-sm ${pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Wrong breakdown ─────────────────────────────────────────────────────────

function WrongBreakdown({ scenario, onNext }) {
  const { rc, cardsInTray, exactDecksRemaining, estimatedDecks, exactTC, expectedTC, step } = scenario;
  const divLabel = step === 1 ? 'jeu entier' : step === 0.5 ? 'demi-jeu' : 'quart de jeu';
  const rows = [
    { l: 'Running Count (RC)',                      v: fmtRC(rc) },
    { l: 'Cartes dans la défausse',                 v: `${cardsInTray}` },
    { l: 'Jeux dans la défausse',                   v: (cardsInTray/52).toFixed(2) },
    { l: 'Cartes restantes',                        v: `${TOTAL_CARDS - cardsInTray}` },
    { l: 'Jeux restants (exact)',                   v: exactDecksRemaining.toFixed(3), hi: true },
    { l: `Jeux estimés (÷ ${divLabel})`,            v: fmtN(estimatedDecks), hi: true },
    { l: 'TC exact (non arrondi)',                  v: exactTC.toFixed(3) },
    { l: 'TC attendu (tronqué vers zéro)',          v: fmtRC(expectedTC), ans: true },
  ];
  return (
    <div className="bg-[#2a2a2d] rounded-xl overflow-hidden">
      <div className="bg-orange-500/20 border-b border-orange-500/30 px-5 py-3 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm leading-none">!</span>
        </div>
        <p className="text-orange-300 font-semibold text-sm">Mauvaise réponse — Détail</p>
      </div>
      <div className="px-5 pt-3 pb-2">
        {rows.map(({ l, v, hi, ans }) => (
          <div key={l} className="flex justify-between items-center py-1 border-b border-gray-700/40 last:border-0">
            <span className="text-gray-400 text-xs pr-3">{l}</span>
            <span className={`font-semibold tabular-nums text-sm flex-shrink-0 ${
              ans ? 'text-emerald-400 text-base font-bold' : hi ? 'text-amber-300' : 'text-white'
            }`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4 pt-2">
        <p className="text-gray-500 text-xs mb-3 text-center font-mono">
          {fmtRC(rc)} ÷ {fmtN(estimatedDecks)} = {exactTC.toFixed(3)} → <span className="text-emerald-400 font-bold">{fmtRC(expectedTC)}</span>
        </p>
        <button onClick={onNext}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
          Suivant →
        </button>
      </div>
    </div>
  );
}

function CorrectFlash() {
  return (
    <div className="bg-[#2a2a2d] rounded-xl p-6 flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <p className="text-emerald-400 text-xl font-bold">CORRECT !</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TrueCountTraining() {
  const navigate = useNavigate();
  const { currentModule, additionalSettings } = useGame();
  const [showChart, setShowChart] = useState(false);

  const duration = currentModule?.config?.duration || '1:30';
  const [dM, dS] = duration.split(':').map(Number);
  const maxTime  = dM * 60 + (dS || 0);

  const precision = additionalSettings?.deckEstimationPrecision || 'half';
  const tcMethod  = additionalSettings?.trueCountMethod         || 'truncate';
  const step      = precisionStep(precision);

  const [timer,       setTimer]       = useState(0);
  const [running,     setRunning]     = useState(true);
  const [stats,       setStats]       = useState({ correct: 0, total: 0 });
  const [screen,      setScreen]      = useState('question');
  const [userAnswer,  setUserAnswer]  = useState(0);
  const [scenario,    setScenario]    = useState(null);
  const [rcMistakes,  setRcMistakes]  = useState([]);
  const [showResults, setShowResults] = useState(false);

  const generate = useCallback(() => {
    const step26      = Math.floor(Math.random() * 11) + 1; // 1..11 → 26..286 cards
    const cardsInTray = step26 * 26;
    const exact       = (TOTAL_CARDS - cardsInTray) / 52;
    const rc          = realisticRC(cardsInTray);
    const est         = roundDecks(exact, step);
    const exactTC     = rc / exact;
    const expectedTC  = applyTC(rc, est, tcMethod);
    setScenario({ rc, cardsInTray, exactDecksRemaining: exact, estimatedDecks: est, exactTC, expectedTC, step });
    setUserAnswer(0);
  }, [step, tcMethod]);

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

  const divLabel = step === 1 ? 'jeu entier' : step === 0.5 ? 'demi-jeu' : 'quart de jeu';

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
        onHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Overlay tableau de stratégie */}
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setShowChart(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="p-5">
              <StrategyCharts />
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0" style={{
        backgroundColor: '#1a5c3a',
        backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }}/>

      <header className="relative z-10 bg-black/30 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white"/>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">True Count</h1>
              <p className="text-sm text-gray-500">Début de l'exercice</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowChart(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-colors">
              <BookOpen className="w-4 h-4 text-amber-400"/>
              <span className="text-amber-300 text-sm font-semibold hidden sm:inline">Tableaux</span>
            </button>
            <button
              onClick={() => { setRunning(false); setShowResults(true); }}
              disabled={stats.total === 0}
              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Terminer
            </button>
            <button onClick={restart} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <RotateCcw className="w-5 h-5 text-white"/>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: Tray + RC */}
          <div className="flex flex-col items-center gap-6">
            <DiscardTray cardsInTray={scenario.cardsInTray}/>
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-8 py-4 text-center w-full max-w-xs">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Running Count</p>
              <p className="text-4xl font-bold text-white tabular-nums">{fmtRC(scenario.rc)}</p>
            </div>
          </div>

          {/* Right: Input / Result / Progress */}
          <div className="space-y-4">
            {screen === 'question' && <TCInput value={userAnswer} onChange={setUserAnswer} onSubmit={submit}/>}
            {screen === 'correct'  && <CorrectFlash/>}
            {screen === 'wrong'    && <WrongBreakdown scenario={scenario} onNext={next}/>}

            <ProgressPanel correct={stats.correct} total={stats.total}/>
          </div>
        </div>
      </main>
    </div>
  );
}
