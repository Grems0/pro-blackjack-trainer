import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Switch } from '../ui/switch';
import InfoTooltip from '../ui/InfoTooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { tableSpeedOptions, deckDivisorOptions, estimateRoundsPerHour } from '../../data/mockData';

const SPREAD_OPTIONS = [
  { value: '1-5', label: '1 — 5' },
  { value: '1-5-2mains', label: '1 — 5 (2 mains)' },
  { value: '1-8', label: '1 — 8' },
  { value: '1-8-2mains', label: '1 — 8 (2 mains)' },
  { value: '1-10', label: '1 — 10' },
  { value: '1-10-2mains', label: '1 — 10 (2 mains)' },
  { value: '1-12', label: '1 — 12' },
  { value: '1-12-2mains', label: '1 — 12 (2 mains)' },
  { value: '1-15', label: '1 — 15' },
  { value: '1-15-2mains', label: '1 — 15 (2 mains)' },
  { value: '1-20', label: '1 — 20' },
  { value: '1-20-2mains', label: '1 — 20 (2 mains)' },
];

function FieldLabel({ children, tooltip }) {
  return (
    <label className="flex items-center text-sm text-gray-300">
      {children}
      {tooltip && <InfoTooltip text={tooltip} />}
    </label>
  );
}

function Row({ label, tooltip, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <FieldLabel tooltip={tooltip}>{label}</FieldLabel>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function PlayerSettings() {
  const {
    playerSettings,
    setPlayerSettings,
    betSpread,
    tableRules,
    additionalSettings,
    savedTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useGame();
  const [templateName, setTemplateName] = useState('');

  // Auto-calcul : mise unitaire = bankroll / nombre d'unités
  const handleBankrollChange = (val) => {
    const bankroll = parseInt(val.replace(/[^0-9]/g, '')) || 0;
    const unit = playerSettings.numberOfUnits > 0
      ? Math.round(bankroll / playerSettings.numberOfUnits)
      : playerSettings.unitQuantity;
    setPlayerSettings({ availableFunds: bankroll, unitQuantity: unit });
  };

  const handleUnitsChange = (val) => {
    const units = parseInt(val) || 0;
    const unit = units > 0
      ? Math.round(playerSettings.availableFunds / units)
      : playerSettings.unitQuantity;
    setPlayerSettings({ numberOfUnits: units, unitQuantity: unit });
  };

  const handleUnitChange = (val) => {
    const unit = parseInt(val.replace(/[^0-9]/g, '')) || 0;
    const units = unit > 0
      ? Math.round(playerSettings.availableFunds / unit)
      : playerSettings.numberOfUnits;
    setPlayerSettings({ unitQuantity: unit, numberOfUnits: units });
  };

  return (
    <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-emerald-400 font-semibold">Paramètres du joueur</h2>
        <p className="text-xs text-gray-500 mt-0.5">Configurez votre bankroll et vos paramètres de session</p>
      </div>

      <div className="p-4 space-y-4">

        {/* Modèles sauvegardés */}
        <div>
          <FieldLabel tooltip="Sauvegardez vos configurations (bankroll, spread, règles) pour les recharger rapidement selon le casino visé.">
            Modèles sauvegardés
          </FieldLabel>

          {/* Enregistrer un nouveau modèle */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Nom du modèle..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="flex-1 bg-[#1a1a1d] border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-600"
            />
            <button
              onClick={() => {
                if (!templateName.trim()) return;
                saveTemplate({
                  id: Date.now().toString(),
                  name: templateName.trim(),
                  playerSettings,
                  betSpread,
                  tableRules,
                  additionalSettings,
                  createdAt: new Date().toISOString(),
                });
                setTemplateName('');
              }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded transition-colors whitespace-nowrap"
            >
              Enregistrer
            </button>
          </div>

          {/* Liste des modèles */}
          {savedTemplates.length > 0 && (
            <div className="mt-2 space-y-1">
              {savedTemplates.map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-[#1a1a1d] rounded px-3 py-2">
                  <button
                    onClick={() => loadTemplate(t.id)}
                    className="flex-1 text-left text-sm text-gray-200 hover:text-emerald-400 transition-colors"
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {savedTemplates.length === 0 && (
            <p className="mt-1 text-xs text-gray-600">Aucun modèle enregistré</p>
          )}
        </div>

        <div className="border-t border-gray-800" />

        {/* Bankroll */}
        <div>
          <FieldLabel tooltip="Votre bankroll totale dédiée au blackjack. Ne jouez jamais avec de l'argent dont vous avez besoin. Règle : une bankroll saine = 200 à 300 unités minimum.">
            Bankroll disponible
          </FieldLabel>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="text"
              value={playerSettings.availableFunds.toLocaleString('fr-FR')}
              onChange={(e) => handleBankrollChange(e.target.value)}
              className="w-full bg-[#1a1a1d] border border-gray-700 rounded px-3 py-2 pl-7 text-white"
            />
          </div>
        </div>

        {/* Mise unitaire + Nombre d'unités */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel tooltip="Votre mise de base (1 unité). Règle d'or : 1/200e à 1/300e de votre bankroll. Ex : bankroll 3 000 € → unité 10-15 €. Se calcule automatiquement depuis la bankroll et le nombre d'unités.">
              Mise unitaire (1u)
            </FieldLabel>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              <input
                type="text"
                value={playerSettings.unitQuantity}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full bg-[#1a1a1d] border border-gray-700 rounded px-3 py-2 pl-7 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <FieldLabel tooltip="Nombre d'unités que représente votre bankroll. Minimum recommandé : 200 unités pour un risque de ruine acceptable (< 5 %). Plus ce nombre est élevé, plus votre bankroll est solide.">
              Nombre d'unités
            </FieldLabel>
            <input
              type="number"
              value={playerSettings.numberOfUnits}
              onChange={(e) => handleUnitsChange(e.target.value)}
              className="w-full mt-2 bg-[#1a1a1d] border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
        </div>

        {/* Indicateur santé bankroll */}
        <div className={`text-xs px-3 py-2 rounded-md border ${
          playerSettings.numberOfUnits >= 200
            ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400'
            : playerSettings.numberOfUnits >= 100
            ? 'bg-amber-900/20 border-amber-800 text-amber-400'
            : 'bg-red-900/20 border-red-800 text-red-400'
        }`}>
          {playerSettings.numberOfUnits >= 200
            ? `✓ Bankroll solide — ${playerSettings.numberOfUnits} unités (risque de ruine faible)`
            : playerSettings.numberOfUnits >= 100
            ? `⚠ Bankroll limite — ${playerSettings.numberOfUnits} unités (risque modéré, visez 200+)`
            : `✗ Bankroll insuffisante — ${playerSettings.numberOfUnits} unités (risque de ruine élevé)`}
        </div>

        <div className="border-t border-gray-800" />

        {/* Spread de mise */}
        <Row
          label="Spread de mise"
          tooltip="Ratio entre votre mise minimum et maximum. Ex : 1-10 = vous misez 1u quand le TC est négatif, 10u quand il est très positif. Un spread plus élevé = plus de gain, mais plus de visibilité pour le casino."
        >
          <Select
            value={playerSettings.spreadType}
            onValueChange={(value) => setPlayerSettings({ spreadType: value })}
          >
            <SelectTrigger className="w-48 bg-[#1a1a1d] border border-emerald-700/60 text-emerald-300 text-sm font-semibold rounded-md px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              {SPREAD_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <div className="border-t border-gray-800" />

        {/* Estimation auto des tours */}
        <Row
          label="Estimation auto tours/heure"
          tooltip="Activez pour que l'app calcule automatiquement votre nombre de mains par heure selon la vitesse de table et le nombre de joueurs assis. Désactivez pour entrer manuellement."
        >
          <Switch
            checked={playerSettings.estimateRoundsPerHour}
            onCheckedChange={(checked) => setPlayerSettings({ estimateRoundsPerHour: checked })}
          />
        </Row>

        {playerSettings.estimateRoundsPerHour ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <FieldLabel tooltip="Nombre de joueurs assis à votre table (vous inclus). Plus il y a de joueurs, moins vous recevez de mains par heure — mais plus de cartes passent, ce qui est utile pour le comptage.">
                Joueurs à la table
              </FieldLabel>
              <Select
                value={String(playerSettings.numberOfPlayers)}
                onValueChange={(v) => {
                  const n = parseInt(v);
                  setPlayerSettings({
                    numberOfPlayers: n,
                    roundsPerHour: estimateRoundsPerHour(playerSettings.tableSpeed, n),
                  });
                }}
              >
                <SelectTrigger className="mt-1 bg-[#1a1a1d] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  {[1,2,3,4,5,6,7].map(n => (
                    <SelectItem key={n} value={String(n)} className="text-white">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel tooltip="Vitesse du croupier. Lente ≈ 70 mains/h seul, Moyenne ≈ 90 mains/h seul, Rapide ≈ 120 mains/h seul. En casino européen à 2-3 joueurs, comptez 60-90 mains/h.">
                Vitesse de table
              </FieldLabel>
              <Select
                value={playerSettings.tableSpeed}
                onValueChange={(v) => {
                  setPlayerSettings({
                    tableSpeed: v,
                    roundsPerHour: estimateRoundsPerHour(v, playerSettings.numberOfPlayers),
                  });
                }}
              >
                <SelectTrigger className="mt-1 bg-[#1a1a1d] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  {tableSpeedOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel tooltip="Résultat estimé : nombre de mains que vous jouez par heure dans cette configuration. Utilisé pour calculer l'EV horaire.">
                Mains/heure (estimé)
              </FieldLabel>
              <div className="mt-1 bg-[#1a1a1d] border border-gray-700 rounded px-3 py-2 text-emerald-400 font-bold text-sm">
                ~{playerSettings.roundsPerHour}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <FieldLabel tooltip="Entrez manuellement votre estimation de mains jouées par heure dans votre casino habituel. En Europe : ~60-80 mains/h est typique.">
              Mains jouées / heure
            </FieldLabel>
            <input
              type="number"
              value={playerSettings.roundsPerHour}
              onChange={(e) => setPlayerSettings({ roundsPerHour: parseInt(e.target.value) || 0 })}
              className="mt-2 w-full bg-[#1a1a1d] border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
        )}

        <div className="border-t border-gray-800" />

        {/* Diviseur de sabot */}
        <Row
          label="Précision True Count"
          tooltip="Définit la précision d'estimation des jeux restants pour calculer le True Count. Par demi-jeu = vous arrondissez au 0,5 le plus proche (recommandé en casino). Jeu entier = arrondi à l'entier (plus simple, moins précis). Quart de jeu = très précis, difficile en conditions réelles."
        >
          <Select
            value={playerSettings.deckDivisor}
            onValueChange={(v) => setPlayerSettings({ deckDivisor: v })}
          >
            <SelectTrigger className="w-48 bg-[#1a1a1d] border border-emerald-700/60 text-emerald-300 text-sm font-semibold rounded-md px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              {deckDivisorOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

      </div>
    </div>
  );
}
