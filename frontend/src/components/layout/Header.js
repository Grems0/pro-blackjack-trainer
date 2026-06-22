import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Zap } from 'lucide-react';

export default function Header() {
  
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
        
        <div className="flex items-center gap-4">
          <Link
            to="/charts"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Tableaux de stratégie"
          >
            <BarChart3 className="w-5 h-5 text-emerald-500" />
          </Link>
          
          <Link
            to="/academy"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Académie"
          >
            <BookOpen className="w-5 h-5 text-amber-500" />
          </Link>

          <Link
            to="/pricing"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #a8823a)', color: '#000' }}
            title="Tarifs Pro"
          >
            <Zap className="w-4 h-4" />
            <span>Pro</span>
          </Link>

        </div>
      </div>
    </header>
  );
}
