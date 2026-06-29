import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function TrainingModals() {
  const { showModal, setShowModal, setCurrentModule, startTraining, initializeDeck, tableRules } = useGame();
  const navigate = useNavigate();

  // Redirect to casino simulation without a modal (triggered when showModal = 'in-casino')
  useEffect(() => {
    if (showModal === 'in-casino') {
      setShowModal(null);
      navigate('/training/in-casino');
    }
  }, [showModal, setShowModal, navigate]);

  if (!showModal || showModal === 'in-casino') return null;

  const handleStartModule = (moduleId, config) => {
    setCurrentModule({ id: moduleId, config });
    localStorage.setItem('trainingModuleConfig', JSON.stringify({ id: moduleId, config }));
    initializeDeck();
    startTraining();
    setShowModal(null);
    navigate(`/training/${moduleId}`);
  };

  const renderModal = () => {
    switch (showModal) {
      case 'running-count':
        return <RunningCountModal onStart={handleStartModule} onClose={() => setShowModal(null)} />;
      case 'true-count':
        return <TrueCountModal onStart={handleStartModule} onClose={() => setShowModal(null)} />;
      case 'basic-strategy':
        return <BasicStrategyModal onStart={handleStartModule} onClose={() => setShowModal(null)} />;
      case 'deviations':
        return <DeviationsModal onStart={handleStartModule} onClose={() => setShowModal(null)} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {renderModal()}
    </div>
  );
}

// Running Count Modal
function RunningCountModal({ onStart, onClose }) {
  const [speed, setSpeed] = useState(6);
  const [askEvery, setAskEvery] = useState('1');
  
  return (
    <div className="bg-[#2a2a2d] rounded-xl max-w-md w-full relative">
      <button
        onClick={onClose}
        className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-1">Module de comptage en cours</h2>
        <div className="h-1 bg-emerald-500 w-full mb-6"></div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-white">Demandez le décompte à chaque fois</label>
            <Select value={askEvery} onValueChange={setAskEvery}>
              <SelectTrigger className="w-28 bg-transparent border border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2d] border-gray-600">
                <SelectItem value="1" className="text-white">1 tour</SelectItem>
                <SelectItem value="2" className="text-white">2 tours</SelectItem>
                <SelectItem value="3" className="text-white">3 tours</SelectItem>
                <SelectItem value="5" className="text-white">5 tours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-white block mb-3">Vitesse de maniement : <span className="font-bold">{speed}</span></label>
            <Slider
              value={[speed]}
              onValueChange={(val) => setSpeed(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onStart('running-count', { speed, askEvery: parseInt(askEvery) })}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-b-xl transition-colors"
      >
        Module de démarrage
      </button>
    </div>
  );
}

// True Count Modal
function TrueCountModal({ onStart, onClose }) {
  const [duration, setDuration] = useState('1:30');

  return (
    <div className="bg-[#2a2a2d] rounded-xl max-w-md w-full relative">
      <button
        onClick={onClose}
        className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-1">Module de comptage réel</h2>
        <div className="h-1 bg-emerald-500 w-full mb-6"></div>

        <div className="space-y-5">
          <p className="text-gray-400 text-sm">
            Sabot fixe de <span className="text-white font-semibold">6 jeux</span> (312 cartes). La précision du diviseur est celle définie dans vos réglages joueur.
          </p>

          <div className="flex items-center justify-between">
            <label className="text-white">Durée du jeu</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-24 bg-transparent border border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2d] border-gray-600">
                <SelectItem value="1:00" className="text-white">1:00</SelectItem>
                <SelectItem value="1:30" className="text-white">1:30</SelectItem>
                <SelectItem value="2:00" className="text-white">2:00</SelectItem>
                <SelectItem value="3:00" className="text-white">3:00</SelectItem>
                <SelectItem value="4:00" className="text-white">4:00</SelectItem>
                <SelectItem value="5:00" className="text-white">5:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <button
        onClick={() => onStart('true-count', { duration })}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-b-xl transition-colors"
      >
        Démarrer
      </button>
    </div>
  );
}

// Basic Strategy Modal
function BasicStrategyModal({ onStart, onClose }) {
  const [mode, setMode] = useState('all');
  const [ruleVariant, setRuleVariant] = useState('S17');
  const [surrenderAllowed, setSurrenderAllowed] = useState(false);

  return (
    <div className="bg-[#2a2a2d] rounded-xl max-w-md w-full relative">
      <button
        onClick={onClose}
        className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-1">Stratégie de base</h2>
        <div className="h-1 bg-emerald-500 w-full mb-6"></div>

        <div className="space-y-6">
          {/* Règle S17 / H17 */}
          <div className="flex items-center justify-between">
            <label className="text-white">Règle croupier</label>
            <div className="flex bg-[#1a1a1d] rounded-lg p-1 border border-gray-700">
              {['S17', 'H17'].map(v => (
                <button
                  key={v}
                  onClick={() => setRuleVariant(v)}
                  className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all ${
                    ruleVariant === v
                      ? 'bg-amber-500 text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white">Mode d'entraînement</label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-36 bg-transparent border border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2d] border-gray-600">
                <SelectItem value="all" className="text-white">Toutes les mains</SelectItem>
                <SelectItem value="hard" className="text-white">Mains dures</SelectItem>
                <SelectItem value="soft" className="text-white">Mains souples</SelectItem>
                <SelectItem value="pairs" className="text-white">Paires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white">Abandon (Surrender)</label>
            <div className="flex bg-[#1a1a1d] rounded-lg p-1 border border-gray-700">
              {[{ label: 'Autorisé', value: true }, { label: 'Non autorisé', value: false }].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSurrenderAllowed(opt.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    surrenderAllowed === opt.value
                      ? opt.value ? 'bg-amber-500 text-black' : 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onStart('basic-strategy', { mode, ruleVariant, surrenderAllowed })}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-b-xl transition-colors"
      >
        Module de démarrage
      </button>
    </div>
  );
}

// Deviations Modal
function DeviationsModal({ onStart, onClose }) {
  const [ruleVariant, setRuleVariant] = useState('S17');
  const [surrenderAllowed, setSurrenderAllowed] = useState(false);

  return (
    <div className="bg-[#2a2a2d] rounded-xl max-w-md w-full relative">
      <button
        onClick={onClose}
        className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-1">Déviations</h2>
        <div className="h-1 bg-emerald-500 w-full mb-6"></div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-white">Règle croupier</label>
            <div className="flex bg-[#1a1a1d] rounded-lg p-1 border border-gray-700">
              {['S17', 'H17'].map(v => (
                <button
                  key={v}
                  onClick={() => setRuleVariant(v)}
                  className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all ${
                    ruleVariant === v ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white">Abandon (Surrender)</label>
            <div className="flex bg-[#1a1a1d] rounded-lg p-1 border border-gray-700">
              {[{ label: 'Autorisé', value: true }, { label: 'Non autorisé', value: false }].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSurrenderAllowed(opt.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    surrenderAllowed === opt.value
                      ? opt.value ? 'bg-amber-500 text-black' : 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg px-4 py-3 text-sm text-gray-400">
            Entraînement sur les <span className="text-white font-semibold">déviations {ruleVariant}</span> ENHC — Hi-Lo 6 jeux.
            {surrenderAllowed && <span className="text-amber-300"> Surrender inclus.</span>}
          </div>
        </div>
      </div>

      <button
        onClick={() => onStart('deviations', { ruleVariant, surrenderAllowed })}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-b-xl transition-colors"
      >
        Module de démarrage
      </button>
    </div>
  );
}


// In Casino Modal
function InCasinoModal({ onStart, onClose }) {
  const [sessionDuration, setSessionDuration] = useState('60');
  const [spotCheckFrequency, setSpotCheckFrequency] = useState('5');
  
  return (
    <div className="bg-[#2a2a2d] rounded-xl max-w-md w-full relative">
      <button
        onClick={onClose}
        className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-1">Simulation Casino</h2>
        <div className="h-1 bg-amber-500 w-full mb-6"></div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-white">Durée de session (min)</label>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger className="w-24 bg-transparent border border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2d] border-gray-600">
                <SelectItem value="30" className="text-white">30 min</SelectItem>
                <SelectItem value="60" className="text-white">60 min</SelectItem>
                <SelectItem value="120" className="text-white">120 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-white">Vérification tous les X tours</label>
            <Select value={spotCheckFrequency} onValueChange={setSpotCheckFrequency}>
              <SelectTrigger className="w-24 bg-transparent border border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2d] border-gray-600">
                <SelectItem value="3" className="text-white">3 tours</SelectItem>
                <SelectItem value="5" className="text-white">5 tours</SelectItem>
                <SelectItem value="10" className="text-white">10 tours</SelectItem>
                <SelectItem value="0" className="text-white">Jamais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onStart('in-casino', { sessionDuration: parseInt(sessionDuration), spotCheckFrequency: parseInt(spotCheckFrequency) })}
        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-b-xl transition-colors"
      >
        Entrez dans le casino
      </button>
    </div>
  );
}
