import React, { useState } from 'react';
import { useLang } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import {
  basicStrategyHardENHCS17,
  basicStrategyHardENHCH17,
  basicStrategySoftENHCS17,
  basicStrategySoftENHCH17,
  basicStrategyPairsENHCDAS,
  basicStrategyPairsENHCNoDAS,
  deviationsS17,
  deviationsH17,
  surrenderDeviationsS17,
  surrenderDeviationsH17,
} from '../../data/mockData';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DK = ['2','3','4','5','6','7','8','9','10','A'];

const CELL_COLORS = {
  H:  { bg: '#1e3a5f', border: '#2a5a9f', text: '#93c5fd', label: 'H — Tirer' },
  S:  { bg: '#14401e', border: '#1a6b2a', text: '#86efac', label: 'S — Rester' },
  D:  { bg: '#4a2d00', border: '#7a4d00', text: '#fcd34d', label: 'D — Doubler' },
  Ds: { bg: '#5a3300', border: '#9a5500', text: '#fb923c', label: 'Ds — Doubler / Rester' },
  P:  { bg: '#2d1f4a', border: '#5a3a9a', text: '#c4b5fd', label: 'P — Séparer' },
  R:  { bg: '#4a0f0f', border: '#8a1f1f', text: '#fca5a5', label: 'R — Abandonner' },
  Rh: { bg: '#3d1010', border: '#7a1818', text: '#fca5a5', label: 'Rh — Abandonner / Tirer' },
  Rs: { bg: '#3d1010', border: '#7a1818', text: '#fca5a5', label: 'Rs — Abandonner / Rester' },
};

// Cases qui diffèrent du standard américain à cause du no hole card
const ENHC_DIFF_HARD = new Set(['10-10','10-A','11-A','5,5-10','5,5-A']);
// Case qui diffère entre S17 et H17
const H17_DIFF_HARD = new Set(['17-A']);
const H17_DIFF_SOFT = new Set(['A,6-2', 'A,7-2', 'A,8-6']);

// ─── Composants de base ───────────────────────────────────────────────────────
function Cell({ action, isEnhcDiff = false, isH17Diff = false }) {
  const c = CELL_COLORS[action] || CELL_COLORS.H;
  let outlineStyle = {};
  if (isEnhcDiff)  outlineStyle = { outline: '2px solid #ef4444', outlineOffset: -2 };
  if (isH17Diff)   outlineStyle = { outline: '2px solid #f97316', outlineOffset: -2 };

  return (
    <td style={{ padding: 2, textAlign: 'center' }}>
      <div style={{
        width: 34, height: 28, background: c.bg,
        border: `1px solid ${c.border}`, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', ...outlineStyle,
      }}>
        <span style={{ color: c.text, fontSize: 11, fontWeight: 700 }}>{action}</span>
      </div>
    </td>
  );
}

function Legend({ showH17Diff = false }) {
  const { t } = useLang();
  const LEGEND_LABELS = {
    H: t('charts_legend_hit'), S: t('charts_legend_stand'), D: t('charts_legend_double'),
    Ds: t('charts_legend_dbl_stand'), P: t('charts_legend_split'), R: t('charts_legend_surr'),
    Rh: t('charts_legend_surr_hit'),
  };
  const items = Object.entries(CELL_COLORS).filter(([k]) => !['Rs'].includes(k));
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {items.map(([key, c]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 13, height: 13, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 2 }} />
            <span style={{ color: '#888', fontSize: 11 }}>{LEGEND_LABELS[key] || c.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 13, height: 13, background: '#1e3a5f', border: '2px solid #ef4444', borderRadius: 2 }} />
          <span style={{ color: '#888', fontSize: 11 }}>{t('sc_enhc_diff')}</span>
        </div>
        {showH17Diff && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 13, height: 13, background: '#1e3a5f', border: '2px solid #f97316', borderRadius: 2 }} />
            <span style={{ color: '#888', fontSize: 11 }}>{t('sc_s17_diff')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartHeader() {
  const { t } = useLang();
  return (
    <tr>
      <th style={{ width: 44, padding: '4px 2px', color: '#555', fontSize: 10, fontWeight: 600, textAlign: 'left' }}>
        <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>{t('sc_dealer_arrow')}</span>
      </th>
      {DK.map(d => (
        <th key={d} style={{ padding: '4px 2px', color: '#aaa', fontSize: 11, fontWeight: 600, textAlign: 'center', width: 38 }}>
          {d}
        </th>
      ))}
    </tr>
  );
}

// ─── Mains dures ──────────────────────────────────────────────────────────────
export function HardChart({ isS17 }) {
  const table = isS17 ? basicStrategyHardENHCS17 : basicStrategyHardENHCH17;
  const rows = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '0 1px' }}>
        <thead><ChartHeader /></thead>
        <tbody>
          {rows.map(n => {
            const actions = table[n] || {};
            return (
              <tr key={n}>
                <td style={{ padding: '2px 8px 2px 2px', color: '#e0e0e0', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {n === 8 ? '8 ou −' : n}
                </td>
                {DK.map(d => {
                  const a = actions[d] || 'S';
                  const key = `${n === 8 ? '5,5' : n}-${d}`;
                  const isEnhc = ENHC_DIFF_HARD.has(key);
                  const isH17  = !isS17 && H17_DIFF_HARD.has(`${n}-${d}`);
                  return <Cell key={d} action={a} isEnhcDiff={isEnhc} isH17Diff={isH17} />;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mains souples ────────────────────────────────────────────────────────────
const SOFT_LABELS = { 20:'A,9', 19:'A,8', 18:'A,7', 17:'A,6', 16:'A,5', 15:'A,4', 14:'A,3', 13:'A,2' };

export function SoftChart({ isS17 }) {
  const table = isS17 ? basicStrategySoftENHCS17 : basicStrategySoftENHCH17;
  const rows = [20, 19, 18, 17, 16, 15, 14, 13];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '0 1px' }}>
        <thead><ChartHeader /></thead>
        <tbody>
          {rows.map(n => {
            const actions = table[n] || {};
            const lbl = SOFT_LABELS[n];
            return (
              <tr key={n}>
                <td style={{ padding: '2px 8px 2px 2px', color: '#e0e0e0', fontSize: 11, fontWeight: 700 }}>{lbl}</td>
                {DK.map(d => {
                  const a = actions[d] || 'S';
                  const isH17 = !isS17 && H17_DIFF_SOFT.has(`${lbl}-${d}`);
                  return <Cell key={d} action={a} isH17Diff={isH17} />;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Paires ───────────────────────────────────────────────────────────────────
const PAIR_ORDER = ['A,A','10,10','9,9','8,8','7,7','6,6','5,5','4,4','3,3','2,2'];

export function PairsChart() {
  const { tableRules } = useGame();
  const pairsTable = tableRules?.doubleAfterSplit ? basicStrategyPairsENHCDAS : basicStrategyPairsENHCNoDAS;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '0 1px' }}>
        <thead><ChartHeader /></thead>
        <tbody>
          {PAIR_ORDER.map(pair => {
            const actions = pairsTable[pair] || {};
            return (
              <tr key={pair}>
                <td style={{ padding: '2px 8px 2px 2px', color: '#e0e0e0', fontSize: 11, fontWeight: 700 }}>{pair}</td>
                {DK.map(d => {
                  const a = actions[d] || 'S';
                  const isEnhc = ENHC_DIFF_HARD.has(`${pair}-${d}`);
                  return <Cell key={d} action={a} isEnhcDiff={isEnhc} />;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tableau des déviations ───────────────────────────────────────────────────
function TcBadge({ tc, direction }) {
  const isUp = direction === 'up';
  const val = tc > 0 ? `+${tc}` : tc === 0 ? '0' : `${tc}`;
  return (
    <span style={{
      display: 'inline-block',
      background: isUp ? 'rgba(134,239,172,0.15)' : 'rgba(252,165,165,0.15)',
      border: `1px solid ${isUp ? 'rgba(134,239,172,0.3)' : 'rgba(252,165,165,0.3)'}`,
      color: isUp ? '#86efac' : '#fca5a5',
      borderRadius: 4, padding: '1px 8px',
      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {isUp ? '≥' : '≤'} {val}
    </span>
  );
}

function SurrenderBadge({ tc }) {
  const val = tc > 0 ? `+${tc}` : `${tc}`;
  return (
    <span style={{
      display: 'inline-block',
      background: 'rgba(252,211,77,0.15)',
      border: '1px solid rgba(252,211,77,0.3)',
      color: '#fcd34d',
      borderRadius: 4, padding: '1px 8px',
      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      ≥ {val}
    </span>
  );
}

function DkBadge({ card }) {
  return (
    <span style={{
      display: 'inline-block',
      background: '#1e1e1e', border: '1px solid #444',
      color: '#e0e0e0', borderRadius: 4,
      padding: '1px 8px', fontSize: 12, fontWeight: 600,
    }}>
      {card}
    </span>
  );
}

function EnhcTag() {
  return (
    <span style={{
      display: 'inline-block', marginLeft: 4,
      background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.25)',
      color: '#86efac', borderRadius: 3, padding: '0 4px', fontSize: 9, fontWeight: 700,
    }}>ENHC</span>
  );
}

function H17Tag() {
  return (
    <span style={{
      display: 'inline-block', marginLeft: 4,
      background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)',
      color: '#fb923c', borderRadius: 3, padding: '0 4px', fontSize: 9, fontWeight: 700,
    }}>H17</span>
  );
}

const TH_STYLE = {
  padding: '6px 10px', textAlign: 'left',
  color: '#555', fontSize: 10, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: 1,
  borderBottom: '1px solid #2a2a2a',
};

function DevTooltip({ playerHand, dealerCard, bsAction, devAction, tc, direction }) {
  const { t } = useLang();
  const [show, setShow] = React.useState(false);
  const isDown = direction === 'down';
  const tcVal = `${tc >= 0 ? '+' : ''}${tc}`;
  const signWord = isDown ? t('dev_lte') : t('dev_gte');

  // Phrase naturelle
  const sentence = `Par défaut avec ${playerHand} vs ${dealerCard}, la stratégie de base est de ${bsAction.toLowerCase()}. Mais quand le TC est ${signWord} ${tcVal}, la bonne décision est de ${devAction.toLowerCase()}.`;

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', marginLeft: 6, verticalAlign: 'middle' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default', fontSize: 9, color: '#777', fontWeight: 700, flexShrink: 0,
      }}>ℹ</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: 20, right: 0, zIndex: 200,
          background: '#1a1a1d', border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 8, padding: '11px 14px', minWidth: 250, maxWidth: 300,
          boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
        }}>
          <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            Par défaut avec <span style={{ color: '#c9a84c', fontWeight: 700 }}>{playerHand} vs {dealerCard}</span>, la stratégie de base est de <span style={{ color: '#f87171', fontWeight: 600 }}>{bsAction.toLowerCase()}</span>. Mais quand le TC est {signWord} <span style={{ color: '#c9a84c', fontWeight: 700 }}>{tcVal}</span>, la bonne décision est de <span style={{ color: '#4ade80', fontWeight: 700 }}>{devAction.toLowerCase()}</span>.
          </p>
        </div>
      )}
    </span>
  );
}

function SeuilTcHeader({ direction = 'up' }) {
  const { t } = useLang();
  const [show, setShow] = React.useState(false);
  const isDown = direction === 'down';
  const sign = isDown ? '≤' : '≥';
  const bsAction = isDown ? t('charts_legend_stand') : t('dev_optimal_action');
  const devAction = isDown ? t('charts_legend_hit') : t('sc_col_dev');
  const color = isDown ? '#fca5a5' : '#86efac';

  return (
    <th style={TH_STYLE}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
        {t('sc_tc_threshold')}
        <span
          style={{ position: 'relative', display: 'inline-flex' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <span style={{
            width: 14, height: 14, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'default', fontSize: 9, color: '#888', fontWeight: 700,
            flexShrink: 0,
          }}>ℹ</span>
          {show && (
            <div style={{
              position: 'absolute', top: 18, right: 0, zIndex: 100,
              background: '#1a1a1d', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8, padding: '10px 12px', minWidth: 220,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              textTransform: 'none', letterSpacing: 0,
            }}>
              <p style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{t('sc_tc_threshold')}</p>
              <p style={{ color: '#aaa', fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                La stratégie de base est de <span style={{ color: '#fff', fontWeight: 600 }}>{bsAction}</span>.
                <br />
                Quand le TC {sign} ce seuil, la déviation correcte est de{' '}
                <span style={{ color, fontWeight: 700 }}>{devAction}</span>.
              </p>
            </div>
          )}
        </span>
      </span>
    </th>
  );
}

const TD_BASE = { padding: '8px 10px', borderBottom: '1px solid #1e1e1e', verticalAlign: 'middle' };

export function DeviationsChart({ isS17 }) {
  const { t } = useLang();
  const devs    = isS17 ? deviationsS17     : deviationsH17;
  const surDevs = isS17 ? surrenderDeviationsS17 : surrenderDeviationsH17;

  const upDevs   = devs.filter(d => d.playerHand !== 'Assurance' && d.trueCount >= 0);
  const downDevs = devs.filter(d => d.playerHand !== 'Assurance' && d.trueCount < 0);

  // Assurance séparé
  const insurance = devs.find(d => d.playerHand === 'Assurance');

  // Tags ENHC / H17 spécifiques
  const enhcHands = new Set(['11', '10']); // vs A = ENHC diff
  const h17SpecificHands = new Set(['A,7']);

  return (
    <div>
      {/* ── Assurance ── */}
      {insurance && (
        <div style={{
          marginBottom: 20, padding: '12px 16px',
          background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.2)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ color: '#fcd34d', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>
                Assurance (Insurance)
              </p>
              <p style={{ color: '#888', fontSize: 12, margin: 0 }}>
{t('sc_ins_desc')}
              </p>
            </div>
            <SurrenderBadge tc={insurance.trueCount} />
          </div>
        </div>
      )}

      {/* ── Déviations montantes ── */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#555', marginBottom: 8 }}>
        {t('sc_devs_up')}
      </p>
      <div style={{ background: '#141414', borderRadius: 10, border: '1px solid #222', marginBottom: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['#', t('sc_col_player'), t('sc_col_dealer'), t('sc_col_bs'), t('sc_col_dev')].map(h => (
                <th key={h} style={TH_STYLE}>{h}</th>
              ))}
              <SeuilTcHeader direction="up" />
            </tr>
          </thead>
          <tbody>
            {upDevs.map((d, i) => {
              const isEnhc = enhcHands.has(d.playerHand) && d.dealerCard === 'A';
              const isH17s = h17SpecificHands.has(d.playerHand);
              const bsAction = t('charts_legend_hit');
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#141414' : '#111' }}>
                  <td style={{ ...TD_BASE, color: '#555', fontWeight: 700, width: 36 }}>{i + 1}</td>
                  <td style={{ ...TD_BASE, color: '#e0e0e0', fontWeight: 600 }}>
                    {d.playerHand}
                    {isEnhc && <EnhcTag />}
                    {isH17s && <H17Tag />}
                  </td>
                  <td style={TD_BASE}><DkBadge card={d.dealerCard} /></td>
                  <td style={{ ...TD_BASE, color: '#666', fontSize: 11 }}>{bsAction}</td>
                  <td style={{ ...TD_BASE, color: '#c9a84c', fontWeight: 600, fontSize: 11 }}>
                    {d.action.replace(' — ENHC S17','').replace(' — TC ≥ +2 en H17','').replace(' — TC ≥ +3 en H17','').replace(' — spécifique H17','')}
                  </td>
                  <td style={TD_BASE}><TcBadge tc={d.trueCount} direction="up" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Déviations descendantes ── */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#555', marginBottom: 8 }}>
        {t('sc_devs_down')}
      </p>
      <div style={{ background: '#141414', borderRadius: 10, border: '1px solid #222', marginBottom: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['#', t('sc_col_player'), t('sc_col_dealer'), t('sc_col_bs'), t('sc_col_dev')].map(h => (
                <th key={h} style={TH_STYLE}>{h}</th>
              ))}
              <SeuilTcHeader direction="down" />
            </tr>
          </thead>
          <tbody>
            {downDevs.map((d, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#141414' : '#111' }}>
                <td style={{ ...TD_BASE, color: '#555', fontWeight: 700, width: 36 }}>{upDevs.length + i + 1}</td>
                <td style={{ ...TD_BASE, color: '#e0e0e0', fontWeight: 600 }}>{d.playerHand}</td>
                <td style={TD_BASE}><DkBadge card={d.dealerCard} /></td>
                <td style={{ ...TD_BASE, color: '#666', fontSize: 11 }}>{t('charts_legend_stand')}</td>
                <td style={{ ...TD_BASE, color: '#fca5a5', fontWeight: 600, fontSize: 11 }}>{t('charts_legend_hit')}</td>
                <td style={TD_BASE}><TcBadge tc={d.trueCount} direction="down" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Surrender ── */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#555', marginBottom: 8 }}>
        {t('sc_devs_surrender')}
      </p>
      <div style={{ background: '#141414', borderRadius: 10, border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {[t('sc_col_player'), t('sc_col_dealer'), t('sc_col_bs'), t('sc_col_dev')].map(h => (
                <th key={h} style={TH_STYLE}>{h}</th>
              ))}
              <SeuilTcHeader direction="up" />
            </tr>
          </thead>
          <tbody>
            {surDevs.map((d, i) => {
              const isEnhc = d.playerHand === '8,8';
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#141414' : '#111' }}>
                  <td style={{ ...TD_BASE, color: '#e0e0e0', fontWeight: 600 }}>
                    {d.playerHand}
                    {isEnhc && <EnhcTag />}
                  </td>
                  <td style={TD_BASE}><DkBadge card={d.dealerCard} /></td>
                  <td style={{ ...TD_BASE, color: '#666', fontSize: 11 }}>
                    {d.playerHand === '8,8' ? t('charts_legend_split') : d.playerHand === '15' || d.playerHand === '14' ? `${t('charts_legend_hit')} / ${t('charts_legend_stand')}` : t('charts_legend_hit')}
                  </td>
                  <td style={{ ...TD_BASE, color: '#fca5a5', fontWeight: 600, fontSize: 11 }}>
                    {d.action.includes('Séparer') ? t('charts_legend_split') : t('charts_legend_surr')}
                  </td>
                  <td style={TD_BASE}><SurrenderBadge tc={d.trueCount} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Export principal (legacy + nouvel usage) ─────────────────────────────────
export default function StrategyCharts({ defaultVariant, locked = false }) {
  const { t } = useLang();
  const HARD_LABEL = t('charts_hard');
  const SOFT_LABEL = t('charts_soft');
  const PAIRS_LABEL = t('charts_pairs');
  const DEV_LABEL = t('charts_dev');
  const BS_TABS = [HARD_LABEL, SOFT_LABEL, PAIRS_LABEL];
  const [tab, setTab]     = useState(HARD_LABEL);
  const [isS17, setIsS17] = useState(defaultVariant !== 'H17');
  const [showDevs, setShowDevs] = useState(false);

  return (
    <div style={{ color: '#e0e0e0' }}>
      {/* Toggle S17/H17 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <p style={{ color: '#555', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>
            Basic Strategy
          </p>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>
            ENHC — {isS17 ? 'S17' : 'H17'} · 6 jeux
          </h2>
        </div>
        {!locked && (
          <div style={{ display: 'flex', background: '#111', borderRadius: 8, padding: 3, border: '1px solid #333' }}>
            {['S17', 'H17'].map(v => (
              <button key={v} onClick={() => setIsS17(v === 'S17')}
                style={{
                  padding: '5px 18px', fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', borderRadius: 6,
                  background: (v === 'S17') === isS17 ? '#c9a84c' : 'transparent',
                  color: (v === 'S17') === isS17 ? '#000' : '#555',
                  transition: 'all .15s',
                }}>
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs stratégie / déviations */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #222', marginBottom: 16 }}>
        {[...BS_TABS, DEV_LABEL].map(tb => (
          <button key={tb}
            onClick={() => { setTab(tb); if (tb === DEV_LABEL) setShowDevs(true); else setShowDevs(false); }}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer', borderRadius: '6px 6px 0 0',
              background: tab === tb ? '#1e1e1e' : 'transparent',
              color: tab === tb ? '#c9a84c' : '#555',
              borderBottom: tab === tb ? '2px solid #c9a84c' : '2px solid transparent',
              transition: 'all .15s',
            }}>
            {tb}
          </button>
        ))}
      </div>

      <div style={{ background: '#141414', borderRadius: 10, padding: 16, border: '1px solid #222' }}>
        {tab === HARD_LABEL   && <HardChart  isS17={isS17} />}
        {tab === SOFT_LABEL && <SoftChart  isS17={isS17} />}
        {tab === PAIRS_LABEL        && <PairsChart />}
        {tab === DEV_LABEL    && <DeviationsChart isS17={isS17} />}

        {tab !== DEV_LABEL && <Legend showH17Diff={!isS17} />}
      </div>
    </div>
  );
}

export function Illustrious18Chart() { return null; }
export function Fab4Chart() { return null; }
