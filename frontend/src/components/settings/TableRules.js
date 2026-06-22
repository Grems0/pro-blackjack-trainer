import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Switch } from '../ui/switch';
import InfoTooltip from '../ui/InfoTooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  deckConfigs, penetrationOptions, splitAcesOptions, maxSplitHandsOptions
} from '../../data/mockData';

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

export default function TableRules() {
  const { tableRules, setTableRules } = useGame();

  return (
    <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-emerald-400 font-semibold">Règles de la table</h2>
        <p className="text-xs text-gray-500 mt-0.5">Configurez selon le casino que vous jouez</p>
      </div>

      <div className="p-4 space-y-4">

        {/* Nombre de jeux */}
        <Row
          label="Nombre de jeux"
          tooltip="Nombre de jeux de 52 cartes dans le sabot. En Europe : 6 ou 8 jeux sont standards. Moins de jeux = avantage compteur légèrement meilleur, mais rare en casino européen. Impact sur le True Count : TC = RC ÷ jeux restants."
        >
          <Select
            value={String(tableRules.numberOfDecks)}
            onValueChange={(v) => setTableRules({ numberOfDecks: parseInt(v) })}
          >
            <SelectTrigger className="w-28 bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              {deckConfigs.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)} className="text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        {/* Pénétration */}
        <Row
          label="Pénétration"
          tooltip="Pourcentage du sabot distribué avant le reshuffling. Plus la pénétration est élevée, plus vous avez de mains favorables à exploiter. En dessous de 65% : très mauvais. 75%+ : correct. 85%+ : excellent. C'est le facteur le plus important après les règles."
        >
          <Select
            value={String(tableRules.penetration)}
            onValueChange={(v) => setTableRules({ penetration: v })}
          >
            <SelectTrigger className="w-64 bg-[#1a1a1d] border border-gray-600 text-white text-sm rounded-md px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              {penetrationOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        {/* S17 / H17 */}
        <Row
          label="Croupier tire sur 17 mou (H17)"
          tooltip="H17 = le croupier tire une carte supplémentaire sur Soft 17 (As + 6). S17 = il s'arrête. H17 augmente légèrement l'avantage du casino (~0.2%). En Europe, S17 est plus courant. Ce réglage modifie aussi votre Basic Strategy (ex : A,7 vs croupier)."
        >
          <Switch
            checked={tableRules.dealerHitsSoft17}
            onCheckedChange={(v) => setTableRules({ dealerHitsSoft17: v })}
          />
        </Row>

        {/* DAS */}
        <Row
          label="Doubler après séparation (DAS)"
          tooltip="Permet de doubler votre mise après avoir séparé une paire. En votre faveur (+0.14%). Peu courant dans les casinos européens — vérifiez avant de jouer. Modifie la stratégie de certaines paires (ex : 4,4 vs 5 ou 6)."
        >
          <Switch
            checked={tableRules.doubleAfterSplit}
            onCheckedChange={(v) => setTableRules({ doubleAfterSplit: v })}
          />
        </Row>

        {/* Resplit Aces */}
        <Row
          label="Re-séparation des As"
          tooltip="Permet de séparer à nouveau une paire d'As si vous recevez un troisième As après la première séparation. Très avantageux (+0.08%). Rare en casino européen — la plupart n'autorisent qu'une séparation et une seule carte par As."
        >
          <Select
            value={tableRules.splitAces}
            onValueChange={(v) => setTableRules({ splitAces: v })}
          >
            <SelectTrigger className="w-44 bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              {splitAcesOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        {/* Max split hands */}
        <Row
          label="Séparations maximales"
          tooltip="Nombre maximum de mains que vous pouvez créer en séparant des paires. Ex : Max 4 mains = vous pouvez séparer jusqu'à 3 fois de suite si vous recevez des paires consécutives. Plus de mains = plus avantageux pour le joueur."
        >
          <Select
            value={String(tableRules.maxSplitHands)}
            onValueChange={(v) => setTableRules({ maxSplitHands: parseInt(v) })}
          >
            <SelectTrigger className="w-36 bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              {maxSplitHandsOptions.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)} className="text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        {/* Abandon */}
        <Row
          label="Abandon"
          tooltip="Récupérez la moitié de votre mise en abandonnant votre main. 'Autorisé' = vous pouvez abandonner après avoir joué (mais perdez tout si BJ croupier). 'ES10' = abandon uniquement contre une carte 10 visible, avant que le croupier tire sa 2e carte — vous récupérez la moitié même si BJ croupier (+0.24%)."
        >
          <Select
            value={tableRules.surrender || 'none'}
            onValueChange={(v) => setTableRules({ surrender: v, es10: v === 'es10' ? 'allowed' : 'none' })}
          >
            <SelectTrigger className="w-36 bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              <SelectItem value="none" className="text-white">Non autorisé</SelectItem>
              <SelectItem value="late" className="text-white">Autorisé</SelectItem>
              <SelectItem value="es10" className="text-white">
                <span>ES10 <span className="text-gray-400 text-xs">vs 10 seulement</span></span>
              </SelectItem>
            </SelectContent>
          </Select>
        </Row>

        {/* Blackjack payout */}
        <Row
          label="Paiement Blackjack"
          tooltip="3:2 = paiement standard (une mise de 10€ rapporte 15€). 6:5 = paiement réduit présent dans certains casinos lowcost (+1.39% d'avantage pour le casino). Ne jamais jouer en 6:5 — l'avantage du comptage ne suffit pas à compenser."
        >
          <Select
            value={tableRules.blackjackPayout || '3:2'}
            onValueChange={(v) => setTableRules({ blackjackPayout: v })}
          >
            <SelectTrigger className="w-28 bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              <SelectItem value="3:2" className="text-white">3 : 2 ★</SelectItem>
              <SelectItem value="6:5" className="text-white">6 : 5</SelectItem>
            </SelectContent>
          </Select>
        </Row>

      </div>
    </div>
  );
}
