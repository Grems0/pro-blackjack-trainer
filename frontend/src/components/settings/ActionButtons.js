import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export default function ActionButtons() {
  const { resetToDefaults, saveTemplate, playerSettings, betSpread, tableRules, additionalSettings } = useGame();
  
  const handleSaveTemplate = () => {
    const templateName = prompt('Nom du modèle:');
    if (templateName) {
      saveTemplate({
        id: Date.now().toString(),
        name: templateName,
        playerSettings,
        betSpread,
        tableRules,
        additionalSettings,
        createdAt: new Date().toISOString()
      });
    }
  };
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => alert('Visualisation de variance - Fonctionnalité à venir')}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
      >
        Visualiseur de variance
      </button>
      
      <button
        onClick={handleSaveTemplate}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
      >
        Enregistrer le modèle actuel
      </button>
      
      <button
        onClick={resetToDefaults}
        className="w-full py-3 border border-red-500 text-red-500 hover:bg-red-500/10 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Réinitialiser les paramètres par défaut
      </button>
    </div>
  );
}
