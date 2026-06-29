import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../../contexts/LanguageContext';
import { LANGUAGES } from '../../data/translations';

export default function LangPicker({ dark = false }) {
  const { lang, setLanguage } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 1000 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', borderRadius: 8,
          background: open
            ? (dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.18)')
            : (dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.08)'),
          border: dark ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', transition: 'background 0.15s',
          backdropFilter: 'blur(8px)',
        }}
        title="Language / Langue"
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{current.flag}</span>
        <span style={{ color: dark ? '#c9a84c' : '#ccc', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
          {current.code.toUpperCase()}
        </span>
        <span style={{ color: dark ? '#c9a84c' : '#555', fontSize: 9, marginLeft: 1 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#1e1e21',
          border: dark ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          minWidth: 140,
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px',
                background: l.code === lang ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'background 0.12s',
                borderLeft: l.code === lang ? '2px solid #c9a84c' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span style={{ color: l.code === lang ? '#c9a84c' : '#ccc', fontSize: 13, fontWeight: l.code === lang ? 700 : 500 }}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
