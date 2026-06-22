import React from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0
    ? `${m} min ${String(s).padStart(2, '0')} s`
    : `${s} s`;
}

function ScoreLine({ pct }) {
  const color = pct >= 90 ? '#4ade80' : pct >= 75 ? '#c9a84c' : pct >= 50 ? '#f97316' : '#f87171';
  const label = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Bien' : pct >= 50 ? 'À améliorer' : 'À reprendre';
  return (
    <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
      <div style={{ fontSize: 80, fontWeight: 900, color, lineHeight: 1, letterSpacing: -2 }}>
        {pct}<span style={{ fontSize: 40 }}>%</span>
      </div>
      <div style={{
        display: 'inline-block', marginTop: 10, padding: '3px 14px',
        background: `${color}18`, border: `1px solid ${color}50`,
        borderRadius: 20, color, fontSize: 12, fontWeight: 700, letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );
}

function StatPill({ label, value, color = '#555' }) {
  return (
    <div style={{
      flex: 1, minWidth: 80, background: '#0e0e0e', border: '1px solid #1a1a1a',
      borderRadius: 10, padding: '12px 10px', textAlign: 'center',
    }}>
      <p style={{ color, fontSize: 20, fontWeight: 900, margin: 0 }}>{value}</p>
      <p style={{ color: '#444', fontSize: 10, fontWeight: 600, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    </div>
  );
}

/**
 * Composant de résultats de session partagé entre tous les modules.
 *
 * Props:
 *   moduleName    string           Nom du module
 *   accentColor   string           Couleur hex du module (pour l'en-tête)
 *   stats         { correct, incorrect, total }
 *   timeSeconds   number           Durée en secondes
 *   topMistakes   Array<{ label, sublabel?, count }>   Optionnel
 *   reviewCount   number           Optionnel — nb d'items en file révision
 *   rcMistakes    Array<{ userAnswer, correctAnswer }>  Optionnel (RC/TC)
 *   onReplay      fn
 *   onReview      fn               Optionnel
 *   onHome        fn
 */
export default function SessionResults({
  moduleName,
  accentColor = '#c9a84c',
  stats,
  timeSeconds = 0,
  topMistakes = [],
  reviewCount = 0,
  rcMistakes = [],
  onReplay,
  onReview,
  onHome,
}) {
  const total = stats.total ?? (stats.correct + (stats.incorrect || 0));
  const pct   = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

  // Calcule l'écart moyen pour RC/TC
  const avgDelta = rcMistakes.length > 0
    ? (rcMistakes.reduce((s, m) => s + Math.abs(m.userAnswer - m.correctAnswer), 0) / rcMistakes.length).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 16px 60px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Module badge */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            background: `${accentColor}15`, border: `1px solid ${accentColor}40`,
            color: accentColor, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            {moduleName} — Fin de session
          </span>
        </div>

        {/* Score principal */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, marginTop: 16, overflow: 'hidden' }}>
          <ScoreLine pct={pct} />

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px', flexWrap: 'wrap' }}>
            <StatPill label="Correctes"  value={stats.correct}             color="#4ade80" />
            <StatPill label="Erreurs"    value={stats.incorrect ?? (total - stats.correct)} color="#f87171" />
            <StatPill label="Total"      value={total}                      color="#e0e0e0" />
            <StatPill label="Durée"      value={formatTime(timeSeconds)}    color="#60a5fa" />
          </div>

          {/* Vitesse */}
          {timeSeconds > 0 && total > 0 && (
            <div style={{ margin: '0 20px 20px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#444', fontSize: 12 }}>Vitesse</span>
              <span style={{ color: '#888', fontSize: 13, fontWeight: 700 }}>
                {(total / (timeSeconds / 60)).toFixed(0)} questions / min
                <span style={{ color: '#333', fontWeight: 400 }}> · {(timeSeconds / total).toFixed(1)}s / question</span>
              </span>
            </div>
          )}
        </div>

        {/* RC/TC — Écart moyen */}
        {avgDelta !== null && (
          <div style={{ marginTop: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ color: '#444', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Analyse des erreurs</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <p style={{ color: '#f97316', fontSize: 22, fontWeight: 900, margin: 0 }}>{avgDelta}</p>
                <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Écart moyen</p>
              </div>
              <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <p style={{ color: '#888', fontSize: 22, fontWeight: 900, margin: 0 }}>
                  {rcMistakes.length > 0
                    ? (rcMistakes.filter(m => Math.abs(m.userAnswer - m.correctAnswer) <= 1).length / rcMistakes.length * 100).toFixed(0)
                    : 0}%
                </p>
                <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Erreurs ≤ 1</p>
              </div>
              {rcMistakes.some(m => m.userAnswer > m.correctAnswer) && (
                <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <p style={{ color: '#60a5fa', fontSize: 22, fontWeight: 900, margin: 0 }}>
                    +{(rcMistakes.filter(m => m.userAnswer > m.correctAnswer).length / rcMistakes.length * 100).toFixed(0)}%
                  </p>
                  <p style={{ color: '#444', fontSize: 10, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Surestimés</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session parfaite */}
        {topMistakes.length === 0 && rcMistakes.length === 0 && total > 0 && (
          <div style={{ marginTop: 12, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
            <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>Session parfaite !</p>
            <p style={{ color: '#555', fontSize: 12, margin: 0 }}>Aucune erreur sur {total} question{total > 1 ? 's' : ''}.</p>
          </div>
        )}

        {/* Erreurs les plus fréquentes */}
        {topMistakes.length > 0 && (
          <div style={{ marginTop: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: '#e0e0e0', fontWeight: 800, fontSize: 14, margin: 0 }}>Erreurs les plus fréquentes</p>
              <span style={{
                padding: '2px 10px', borderRadius: 20, background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: 11, fontWeight: 700,
              }}>
                {topMistakes.reduce((s, m) => s + m.count, 0)} erreur{topMistakes.reduce((s, m) => s + m.count, 0) > 1 ? 's' : ''}
              </span>
            </div>
            {topMistakes.map((m, i) => {
              const maxCount = topMistakes[0].count;
              const bar = Math.round((m.count / maxCount) * 100);
              return (
                <div key={i} style={{ padding: '12px 20px', borderBottom: i < topMistakes.length - 1 ? '1px solid #0e0e0e' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <p style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 700, margin: 0 }}>{m.label}</p>
                      {m.sublabel && <p style={{ color: '#555', fontSize: 11, margin: '2px 0 0', fontStyle: 'italic' }}>{m.sublabel}</p>}
                    </div>
                    <span style={{
                      flexShrink: 0, marginLeft: 12,
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                      color: '#f87171', fontSize: 12, fontWeight: 800,
                      padding: '2px 8px', borderRadius: 6,
                    }}>
                      {m.count}×
                    </span>
                  </div>
                  {/* Barre de fréquence */}
                  <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${bar}%`, background: '#f87171', borderRadius: 2, transition: 'width .4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* File de révision */}
        {reviewCount > 0 && (
          <div style={{ marginTop: 12, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ color: '#c9a84c', fontWeight: 700, fontSize: 13, margin: '0 0 2px' }}>File de révision</p>
              <p style={{ color: '#555', fontSize: 11, margin: 0 }}>
                {reviewCount} situation{reviewCount > 1 ? 's' : ''} enregistrée{reviewCount > 1 ? 's' : ''} — rejoue-les pour les effacer
              </p>
            </div>
            {onReview && (
              <button
                onClick={onReview}
                style={{ flexShrink: 0, padding: '8px 16px', background: '#c9a84c', border: 'none', borderRadius: 10, color: '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
              >
                Réviser →
              </button>
            )}
          </div>
        )}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={onReplay}
            style={{ flex: 1, padding: '14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#222'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
          >
            ↺ Rejouer
          </button>
          <button
            onClick={onHome}
            style={{ flex: 1, padding: '14px', background: `${accentColor}20`, border: `1px solid ${accentColor}40`, borderRadius: 12, color: accentColor, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = `${accentColor}30`}
            onMouseLeave={e => e.currentTarget.style.background = `${accentColor}20`}
          >
            Accueil
          </button>
        </div>

      </div>
    </div>
  );
}
