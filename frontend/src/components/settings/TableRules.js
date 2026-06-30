import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useLang } from '../../contexts/LanguageContext';
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
  const { t } = useLang();

  return (
    <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-emerald-400 font-semibold">{t('tr_title')}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{t('tr_subtitle')}</p>
      </div>

      <div className="p-4 space-y-4">

        {/* Nombre de jeux */}
        <Row
          label={t('tr_num_decks')}
          tooltip={t('tr_tip_decks')}
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
          label={t('tr_penetration')}
          tooltip={t('tr_tip_pen')}
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
          label={t('tr_h17')}
          tooltip={t('tr_tip_h17')}
        >
          <Switch
            checked={tableRules.dealerHitsSoft17}
            onCheckedChange={(v) => setTableRules({ dealerHitsSoft17: v })}
          />
        </Row>

        {/* DAS */}
        <Row
          label={t('tr_das')}
          tooltip={t('tr_tip_das')}
        >
          <Switch
            checked={tableRules.doubleAfterSplit}
            onCheckedChange={(v) => setTableRules({ doubleAfterSplit: v })}
          />
        </Row>

        {/* Resplit Aces */}
        <Row
          label={t('tr_rsa')}
          tooltip={t('tr_tip_rsa')}
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
          label={t('tr_max_splits')}
          tooltip={t('tr_tip_splits')}
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
          label={t('tr_surrender')}
          tooltip={t('tr_tip_surrender')}
        >
          <Select
            value={tableRules.surrender || 'none'}
            onValueChange={(v) => setTableRules({ surrender: v, es10: v === 'es10' ? 'allowed' : 'none' })}
          >
            <SelectTrigger className="w-36 bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2d] border-gray-700">
              <SelectItem value="none" className="text-white">{t('tr_surrender_no')}</SelectItem>
              <SelectItem value="late" className="text-white">{t('tr_surrender_yes')}</SelectItem>
              <SelectItem value="es10" className="text-white">
                <span>{t('tr_surrender_es10')} <span className="text-gray-400 text-xs">vs 10 seulement</span></span>
              </SelectItem>
            </SelectContent>
          </Select>
        </Row>

        {/* Blackjack payout */}
        <Row
          label={t('tr_bj_payout')}
          tooltip={t('tr_tip_bj')}
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
