import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, Zap, LogIn, LogOut } from 'lucide-react';
import { useAuth, isProActive } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
          <Link to="/charts" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" title="Tableaux de stratégie">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-300 text-sm font-semibold hidden sm:inline">Tableaux</span>
          </Link>

          <Link to="/academy" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" title="Académie">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="text-gray-300 text-sm font-semibold hidden sm:inline">Académie</span>
          </Link>

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title={`Connecté : ${user.email}`}
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-semibold hidden sm:inline">Déconnexion</span>
              </button>
              {/* Statut discret sous le bouton */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingRight: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isPro ? '#4ade80' : '#f87171', display: 'inline-block', flexShrink: 0 }} />
                {isPro ? (
                  <>
                    <span style={{ color: '#3a3a3a', fontSize: 10, fontWeight: 600 }}>Pro</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>expire {expiryStr}</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>
                    <a href="https://billing.stripe.com/p/login/bpc_1TnLrRCmcZpRfkmYplYUxjUU" target="_blank" rel="noreferrer" style={{ color: '#333', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>
                      Gérer →
                    </a>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#f87171', fontSize: 10, fontWeight: 600 }}>Expiré</span>
                    <span style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>
                    <button onClick={() => navigate('/pricing')} style={{ color: '#c9a84c', fontSize: 10, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Renouveler →
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <LogIn className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-semibold hidden sm:inline">Connexion</span>
            </Link>
          )}

          {!user && (
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a8823a)', color: '#000' }}
            >
              <Zap className="w-4 h-4" />
              <span>Pro</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
