import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, Zap, LogIn, LogOut, Gift, X } from 'lucide-react';
import { useAuth, isProActive } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LanguageContext';
import LangPicker from '../ui/LangPicker';

function ReferralModal({ code, onClose }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/pricing?ref=${code}`;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, padding: '24px 22px', maxWidth: 380, width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={18} color="#555" />
        </button>
        <p style={{ color: '#c9a84c', fontSize: 12, fontWeight: 800, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          🎁 Parraine un ami
        </p>
        <p style={{ color: '#777', fontSize: 12.5, margin: '0 0 14px', lineHeight: 1.5 }}>
          Partage ton lien : vous recevez chacun <strong style={{ color: '#fff' }}>1 mois offert</strong> quand il s'abonne.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            readOnly
            value={link}
            onClick={(e) => e.target.select()}
            style={{ flex: 1, padding: '9px 11px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#999', fontSize: 12, outline: 'none' }}
          />
          <button
            onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ padding: '9px 16px', borderRadius: 8, background: copied ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg, #c9a84c, #a8823a)', border: copied ? '1px solid rgba(74,222,128,0.4)' : 'none', color: copied ? '#4ade80' : '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const isPro = user ? isProActive(user) : false;
  const [showReferral, setShowReferral] = useState(false);

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

          {user && (
            <button
              onClick={() => setShowReferral(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Parrainer un ami"
            >
              <Gift className="w-4 h-4 text-amber-500" />
              <span className="text-gray-300 text-sm font-semibold hidden sm:inline">Parrainer</span>
            </button>
          )}

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

      {showReferral && user?.referralCode && (
        <ReferralModal code={user.referralCode} onClose={() => setShowReferral(false)} />
      )}
    </header>
  );
}
