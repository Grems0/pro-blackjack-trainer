import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useLang } from '../../contexts/LanguageContext';
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
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">

      {/* Paramètres avancés */}
      <div className="bg-[#2a2a2d] rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <h3 className="text-emerald-400 font-semibold">{t('as_title')}</h3>
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-xs">{open ? t('as_collapse') : t('as_expand')}</span>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-700 pt-4">

            {/* Règle de double */}
            <Row
              label={t('as_double_rule')}
              tooltip={t('as_tip_double')}
            >
              <Select
                value={additionalSettings.doubleRule || 'any2'}
                onValueChange={(v) => setAdditionalSettings({ doubleRule: v })}
              >
                <SelectTrigger className="w-48 bg-[#1a1a1d] border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  <SelectItem value="any2" className="text-white">{t('as_double_any')}</SelectItem>
                  <SelectItem value="9-10-11" className="text-white">{t('as_double_9')}</SelectItem>
                  <SelectItem value="10-11" className="text-white">{t('as_double_10')}</SelectItem>
                </SelectContent>
              </Select>
            </Row>

            {/* Spread par défaut — jouer toutes les mains */}
            <Row
              label={t('as_play_all')}
              tooltip={t('as_tip_play_all')}
            >
              <Switch
                checked={additionalSettings.defaultBetSpreadsPlayAll || false}
                onCheckedChange={(v) => setAdditionalSettings({ defaultBetSpreadsPlayAll: v })}
              />
            </Row>

            {/* Flexible 1 ou 2 mains */}
            <Row
              label={t('as_flex_hands')}
              tooltip={t('as_tip_flex')}
            >
              <Switch
                checked={additionalSettings.flexibleOneOrTwoHands !== false}
                onCheckedChange={(v) => setAdditionalSettings({ flexibleOneOrTwoHands: v })}
              />
            </Row>

            <div className="border-t border-gray-800" />

            {/* Système de comptage */}
            <Row
              label={t('as_count_system')}
              tooltip={t('as_tip_system')}
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
              label={t('as_tc_method')}
              tooltip={t('as_tip_tc_method')}
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
              label={t('as_shoe_prec')}
              tooltip={t('as_tip_shoe')}
            >
              <Select
                value={additionalSettings.deckEstimationPrecision}
                onValueChange={(v) => setAdditionalSettings({ deckEstimationPrecision: v })}
              >
                <SelectTrigger className="w-40 bg-[#1a1a1d] border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2d] border-gray-700">
                  <SelectItem value="full" className="text-white">{t('as_shoe_whole')}</SelectItem>
                  <SelectItem value="half" className="text-white">{t('as_shoe_half')}</SelectItem>
                  <SelectItem value="quarter" className="text-white">{t('as_shoe_quarter')}</SelectItem>
                </SelectContent>
              </Select>
            </Row>

          </div>
        )}
      </div>

    </div>
  );
}
