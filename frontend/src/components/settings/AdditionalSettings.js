import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Switch } from '../ui/switch';
import InfoTooltip from '../ui/InfoTooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { trueCountMethods } from '../../data/mockData';

function Row({ label, tooltip, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="flex items-center text-sm text-gray-300">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function AdditionalSettings() {
  const { additionalSettings, setAdditionalSettings } = useGame();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">

      {/* Paramètres avancés */}
      <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <h3 className="text-emerald-400 font-semibold">Paramètres avancés</h3>
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-xs">{open ? 'Réduire' : 'Déplier'}</span>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-700 pt-4">

            {/* Règle de double */}
            <Row
              label="Règle de double"
              tooltip="Définit sur quelles mains vous pouvez doubler. 'Sur 2 premières cartes' = toujours autorisé (règle standard en Europe). '9-10-11 seulement' = restriction qui vous désavantage légèrement. '10-11 seulement' = encore plus restrictif. Vérifiez au casino."
            >
              <Select
                value={additionalSettings.doubleRule || 'any2'}
                onValueChange={(v) => setAdditionalSettings({ doubleRule: v })}
              >
                <SelectTrigger className="w-48 bg-[#1a1a1d] border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  <SelectItem value="any2" className="text-white">Sur 2 premières cartes ★</SelectItem>
                  <SelectItem value="9-10-11" className="text-white">9, 10 ou 11 seulement</SelectItem>
                  <SelectItem value="10-11" className="text-white">10 ou 11 seulement</SelectItem>
                </SelectContent>
              </Select>
            </Row>

            {/* Spread par défaut — jouer toutes les mains */}
            <Row
              label="Jouer toutes les mains"
              tooltip="Désactivé : vous ne jouez que les mains définies dans votre bet spread (vous pouvez quitter la table aux counts négatifs). Activé : vous jouez toutes les mains quelle que soit la mise. En casino, il est souvent préférable de rester assis pour ne pas attirer l'attention."
            >
              <Switch
                checked={additionalSettings.defaultBetSpreadsPlayAll || false}
                onCheckedChange={(v) => setAdditionalSettings({ defaultBetSpreadsPlayAll: v })}
              />
            </Row>

            {/* Flexible 1 ou 2 mains */}
            <Row
              label="1 ou 2 mains (flexible)"
              tooltip="Activé : votre bet spread peut inclure des entrées à 2 mains simultanées aux True Counts élevés — vous misez sur deux cases à la fois pour maximiser l'avantage. Désactivé : vous ne jouez qu'une seule main à la fois. Jouer 2 mains augmente l'EV mais attire l'attention."
            >
              <Switch
                checked={additionalSettings.flexibleOneOrTwoHands !== false}
                onCheckedChange={(v) => setAdditionalSettings({ flexibleOneOrTwoHands: v })}
              />
            </Row>

            <div className="border-t border-gray-800" />

            {/* Système de comptage */}
            <Row
              label="Système de comptage"
              tooltip="Hi-Lo est le système recommandé : simple, efficace, et base de toutes les déviations enseignées ici. 2-6 = +1 | 7-9 = 0 | 10-A = -1. KO (Knockout) est non-balancé : pas de True Count nécessaire, plus simple mais moins précis. Hi-Opt II et Omega II sont plus puissants mais complexes."
            >
              <Select
                value={additionalSettings.countingSystem}
                onValueChange={(v) => setAdditionalSettings({ countingSystem: v })}
              >
                <SelectTrigger className="w-36 bg-[#1a1a1d] border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  <SelectItem value="hi-lo" className="text-white">Hi-Lo ★</SelectItem>
                  <SelectItem value="ko" className="text-white">KO (Knockout)</SelectItem>
                  <SelectItem value="hi-opt-i" className="text-white">Hi-Opt I</SelectItem>
                  <SelectItem value="hi-opt-ii" className="text-white">Hi-Opt II</SelectItem>
                  <SelectItem value="omega-ii" className="text-white">Omega II</SelectItem>
                </SelectContent>
              </Select>
            </Row>

            {/* Méthode True Count */}
            <Row
              label="Méthode True Count"
              tooltip="Comment convertir le Running Count en True Count. Truncate (vers zéro) = méthode BJA recommandée : RC 7 ÷ 2.5 sabots = TC 2 (pas 3). Plus conservateur. Floor (vers le bas) = identique aux positifs. Round = arrondi classique, légèrement plus agressif mais moins précis."
            >
              <Select
                value={additionalSettings.trueCountMethod}
                onValueChange={(v) => setAdditionalSettings({ trueCountMethod: v })}
              >
                <SelectTrigger className="w-48 bg-[#1a1a1d] border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  {trueCountMethods.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            {/* Précision estimation sabot */}
            <Row
              label="Précision estimation sabot"
              tooltip="Granularité pour estimer les sabots restants. Demi-sabot = arrondi au 0.5 (ex : 2.5, 3.0, 3.5) — recommandé en conditions réelles. Quart de sabot = plus précis mais difficile en casino. Sabot complet = entiers seulement, moins précis mais plus simple."
            >
              <Select
                value={additionalSettings.deckEstimationPrecision}
                onValueChange={(v) => setAdditionalSettings({ deckEstimationPrecision: v })}
              >
                <SelectTrigger className="w-40 bg-[#1a1a1d] border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  <SelectItem value="full" className="text-white">Diviser par jeu entier</SelectItem>
                  <SelectItem value="half" className="text-white">Par demi-jeu ★</SelectItem>
                  <SelectItem value="quarter" className="text-white">Par quart de jeu</SelectItem>
                </SelectContent>
              </Select>
            </Row>

          </div>
        )}
      </div>

    </div>
  );
}
