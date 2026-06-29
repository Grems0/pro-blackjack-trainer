import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, Zap, LogIn, LogOut } from 'lucide-react';
import { useAuth, isProActive } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LanguageContext';
import { LANGUAGES } from '../../data/translations';

function LangPicker() {
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', borderRadius: 8,
          background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        title="Changer de langue"
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{current.flag}</span>
        <span style={{ color: '#ccc', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{current.code.toUpperCase()}</span>
        <span style={{ color: '#555', fontSize: 9, marginLeft: 1 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#1e1e21', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, overflow: 'hidden', zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 140,
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', background: l.code === lang ? 'rgba(201,168,76,0.12)' : 'transparent',
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

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const isPro = user ? isProActive(user) : false;

  const handleLogout = () => {
    logout();
    navigate('/training');
  };

  const expiryStr = user?.expiryDate
    ? new Date(user.expiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <header className="bg-[#1a1a1d] border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/training" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">♠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pro Blackjack Trainer</h1>
            <p className="text-xs text-gray-400">Système Hi-Lo • Entraînement Professionnel</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LangPicker />

          <Link to="/charts" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" title={t('nav_charts')}>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-300 text-sm font-semibold hidden sm:inline">{t('nav_charts')}</span>
          </Link>

          <Link to="/academy" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" title={t('nav_academy')}>
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="text-gray-300 text-sm font-semibold hidden sm:inline">{t('nav_academy')}</span>
          </Link>

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title={`Connecté : ${user.email}`}
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-semibold hidden sm:inline">{t('nav_logout')}</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingRight: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isPro ? '#4ade80' : '#f87171', display: 'inline-block', flexShrink: 0 }} />
                {isPro ? (
                  <>
                    <span style={{ color: '#3a3a3a', fontSize: 10, fontWeight: 600 }}>{t('status_pro')}</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>{t('status_expires')} {expiryStr}</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>
                    <a href="https://billing.stripe.com/p/login/bpc_1TnLrRCmcZpRfkmYplYUxjUU" target="_blank" rel="noreferrer" style={{ color: '#333', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>
                      {t('status_manage')}
                    </a>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#f87171', fontSize: 10, fontWeight: 600 }}>{t('status_expired')}</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>
                    <button onClick={() => navigate('/pricing')} style={{ color: '#c9a84c', fontSize: 10, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {t('status_renew')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <LogIn className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-semibold hidden sm:inline">{t('nav_login')}</span>
            </Link>
          )}

          {!user && (
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a8823a)', color: '#000' }}
            >
              <Zap className="w-4 h-4" />
              <span>{t('nav_pro')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
