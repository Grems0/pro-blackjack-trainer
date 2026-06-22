import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, Zap, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#1a1a1d] border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">♠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pro Blackjack Trainer</h1>
            <p className="text-xs text-gray-400">Système Hi-Lo • Entraînement Professionnel</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/charts"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Tableaux de stratégie"
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-300 text-sm font-semibold hidden sm:inline">Tableaux</span>
          </Link>

          <Link
            to="/academy"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Académie"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="text-gray-300 text-sm font-semibold hidden sm:inline">Académie</span>
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title={`Connecté : ${user.email}`}
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-semibold hidden sm:inline">Déconnexion</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
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
