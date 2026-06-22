import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, HelpCircle } from 'lucide-react';
import { HardChart, SoftChart, PairsChart, DeviationsChart } from '../components/charts/StrategyCharts';

// ─── Onglets principaux ────────────────────────────────────────────────────────
const CHART_TABS = [
  { id: 'hard',  label: 'Mains dures' },
  { id: 'soft',  label: 'Mains souples' },
  { id: 'pairs', label: 'Paires' },
  { id: 'devs',  label: 'Déviations' },
];

// ─── Helpers UI ────────────────────────────────────────────────────────────────
function InfoBox({ color = 'amber', title, children }) {
  const colors = {
    amber:  { bg: 'rgba(201,168,76,0.08)',  border: 'rgba(201,168,76,0.25)',  title: '#c9a84c' },
    blue:   { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)', title: '#60a5fa' },
    green:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',  title: '#4ade80' },
    red:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',  title: '#f87171' },
    purple: { bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.25)', title: '#c084fc' },
  };
  const c = colors[color] || colors.amber;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: '14px 18px', marginBottom: 14,
    }}>
      {title && <p style={{ color: c.title, fontWeight: 700, fontSize: 12, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</p>}
      <div style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{children}</h2>
      {sub && <p style={{ color: '#666', fontSize: 12, margin: 0 }}>{sub}</p>}
      <div style={{ height: 3, width: 40, background: '#c9a84c', borderRadius: 2, marginTop: 8 }} />
    </div>
  );
}

function Divider() { return <div style={{ height: 1, background: '#1e1e1e', margin: '36px 0' }} />; }

// ─── Légende compacte inline ───────────────────────────────────────────────────
function CompactLegend({ isS17 }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '5px 12px',
      marginBottom: 14, padding: '10px 14px',
      background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 8,
    }}>
      {[
        { code: 'H',  c: '#93c5fd', bg: '#1e3a5f', b: '#2a5a9f', lbl: 'Tirer' },
        { code: 'S',  c: '#86efac', bg: '#14401e', b: '#1a6b2a', lbl: 'Rester' },
        { code: 'D',  c: '#fcd34d', bg: '#4a2d00', b: '#7a4d00', lbl: 'Doubler' },
        { code: 'Ds', c: '#fb923c', bg: '#5a3300', b: '#9a5500', lbl: 'Dbl/Rester' },
        { code: 'P',  c: '#c4b5fd', bg: '#2d1f4a', b: '#5a3a9a', lbl: 'Séparer' },
        { code: 'R',  c: '#fca5a5', bg: '#4a0f0f', b: '#8a1f1f', lbl: 'Abandonner' },
        { code: 'Rh', c: '#fca5a5', bg: '#3d1010', b: '#7a1818', lbl: 'Aband/Tirer' },
      ].map(({ code, c, bg, b, lbl }) => (
        <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 28, height: 20, background: bg, border: `1px solid ${b}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{code}</span>
          </div>
          <span style={{ color: '#555', fontSize: 10 }}>{lbl}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 28, height: 20, background: '#1e3a5f', border: '2px solid #ef4444', borderRadius: 3 }}/>
        <span style={{ color: '#555', fontSize: 10 }}>Diff. ENHC</span>
      </div>
      {!isS17 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 28, height: 20, background: '#1e3a5f', border: '2px solid #f97316', borderRadius: 3 }}/>
          <span style={{ color: '#555', fontSize: 10 }}>Diff. S17</span>
        </div>
      )}
    </div>
  );
}

// ─── Légende des actions (guide) ──────────────────────────────────────────────
function ActionLegend() {
  const items = [
    { code: 'H',  color: '#93c5fd', bg: '#1e3a5f', border: '#2a5a9f', label: 'Tirer (Hit)',          desc: 'Demander une carte.' },
    { code: 'S',  color: '#86efac', bg: '#14401e', border: '#1a6b2a', label: 'Rester (Stand)',        desc: 'Garder sa main.' },
    { code: 'D',  color: '#fcd34d', bg: '#4a2d00', border: '#7a4d00', label: 'Doubler (Double)',      desc: 'Doubler la mise, 1 seule carte.' },
    { code: 'Ds', color: '#fb923c', bg: '#5a3300', border: '#9a5500', label: 'Doubler / Rester',      desc: 'Doubler si possible, sinon Rester.' },
    { code: 'P',  color: '#c4b5fd', bg: '#2d1f4a', border: '#5a3a9a', label: 'Séparer (Split)',       desc: 'Séparer la paire.' },
    { code: 'R',  color: '#fca5a5', bg: '#4a0f0f', border: '#8a1f1f', label: 'Abandonner (Surrender)', desc: 'Céder la moitié de la mise.' },
    { code: 'Rh', color: '#fca5a5', bg: '#3d1010', border: '#7a1818', label: 'Abandonner / Tirer',    desc: 'Abandonner si possible, sinon Tirer.' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, marginBottom: 16 }}>
      {items.map(({ code, color, bg, border, label, desc }) => (
        <div key={code} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 8, padding: '8px 12px',
        }}>
          <div style={{
            width: 32, height: 26, background: bg, border: `1px solid ${border}`,
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color, fontSize: 11, fontWeight: 700 }}>{code}</span>
          </div>
          <div>
            <p style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 700, margin: '0 0 1px' }}>{label}</p>
            <p style={{ color: '#555', fontSize: 11, margin: 0 }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tableau Hi-Lo ─────────────────────────────────────────────────────────────
function HiLoTable() {
  const groups = [
    { cards: ['2','3','4','5','6'],   val: '+1', color: '#4ade80', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.22)',  label: 'Cartes basses — favorables au joueur' },
    { cards: ['7','8','9'],           val: '0',  color: '#888',    bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', label: 'Cartes neutres' },
    { cards: ['10','V','D','R','A'],  val: '−1', color: '#f87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.22)',  label: 'Cartes hautes — favorables au croupier' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {groups.map(({ cards, val, color, bg, border, label }) => (
        <div key={val} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ color: '#666', fontSize: 11 }}>{label}</span>
            <span style={{ color, fontSize: 18, fontWeight: 900 }}>{val}</span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {cards.map(c => (
              <span key={c} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#ddd', fontSize: 12, fontWeight: 700, padding: '3px 9px' }}>{c}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET TABLEAUX
// ══════════════════════════════════════════════════════════════════════════════
function TablesView({ variant }) {
  const [chartTab, setChartTab] = useState('hard');
  const isS17 = variant === 'S17';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Sous-onglets type de main */}
      <div style={{ display: 'flex', gap: 4, background: '#111', borderRadius: 10, padding: 4, border: '1px solid #1e1e1e', marginBottom: 16 }}>
        {CHART_TABS.map(t => (
          <button key={t.id} onClick={() => setChartTab(t.id)}
            style={{
              flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer', borderRadius: 7,
              background: chartTab === t.id ? '#1e1e1e' : 'transparent',
              color: chartTab === t.id ? '#e0e0e0' : '#444',
              transition: 'all .15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <CompactLegend isS17={isS17} />

      {/* Tableau */}
      <div style={{ background: '#0d0d0d', borderRadius: 12, border: '1px solid #1a1a1a', padding: '16px 12px', overflowX: 'auto' }}>
        {chartTab === 'hard'  && <HardChart  isS17={isS17} />}
        {chartTab === 'soft'  && <SoftChart  isS17={isS17} />}
        {chartTab === 'pairs' && <PairsChart />}
        {chartTab === 'devs'  && <DeviationsChart isS17={isS17} />}
      </div>

      {/* Note contextuelle */}
      <div style={{ marginTop: 10, padding: '10px 14px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 8 }}>
        {chartTab === 'hard'  && <p style={{ color: '#555', fontSize: 11, margin: 0 }}>Mains dures · Aucun As (ou As valant 1). Les cases encadrées en rouge diffèrent du blackjack américain (règle ENHC).</p>}
        {chartTab === 'soft'  && <p style={{ color: '#555', fontSize: 11, margin: 0 }}>Mains souples · As compté pour 11 sans risque de buste. {!isS17 && 'En H17 : A,6 vs 2 → Doubler (croupier tire aussi sur soft 17).'}</p>}
        {chartTab === 'pairs' && <p style={{ color: '#555', fontSize: 11, margin: 0 }}>Paires · Toujours séparer A,A et 8,8. Jamais séparer 10,10 (= 20) ni 5,5 (doubler à la place).</p>}
        {chartTab === 'devs'  && <p style={{ color: '#555', fontSize: 11, margin: 0 }}>Déviations Hi-Lo · S'écarter de la stratégie de base quand le TC franchit le seuil. Illustrious 18 + Fab 4 Surrender.</p>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET GUIDE
// ══════════════════════════════════════════════════════════════════════════════
function GuideView({ variant }) {
  const isS17 = variant === 'S17';
  return (
    <div className="max-w-3xl mx-auto px-4 py-8" style={{ color: '#e0e0e0' }}>

      <SectionTitle sub="European No Hole Card — la règle qui change tout">La règle ENHC</SectionTitle>
      <InfoBox color="amber" title="Définition">
        En Europe, le croupier reçoit <strong style={{ color: '#e0e0e0' }}>une seule carte</strong> face visible.
        Sa deuxième carte n'est tirée qu'<strong style={{ color: '#e0e0e0' }}>après que tous les joueurs aient joué</strong>.
        Il n'y a donc pas de vérification anticipée du blackjack — d'où le nom No Hole Card.
      </InfoBox>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <InfoBox color="red" title="Le piège ENHC">
          Si tu doubles ou sépares et que le croupier a un blackjack,
          tu perds <strong style={{ color: '#e0e0e0' }}>toute ta mise</strong> — initiale + supplémentaire.
          En blackjack américain, tu ne perdrais que la mise initiale.
        </InfoBox>
        <InfoBox color="blue" title="Impact sur la stratégie">
          Il ne faut jamais doubler ni séparer contre un As dans la plupart des cas — le risque de perdre double mise face à un BJ non vu est trop élevé.
        </InfoBox>
      </div>
      <InfoBox color="green" title="3 règles ENHC à mémoriser">
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 2 }}>
          <li><strong style={{ color: '#e0e0e0' }}>10 vs 10 → H</strong> : la stratégie US dit Doubler, mais en ENHC c'est perdant.</li>
          <li><strong style={{ color: '#e0e0e0' }}>10 vs As → H</strong> : le risque BJ croupier annule l'avantage du double.</li>
          <li><strong style={{ color: '#e0e0e0' }}>11 vs As → H</strong> : la pénalité ENHC dépasse le gain espéré.</li>
        </ol>
      </InfoBox>

      <Divider />

      <SectionTitle sub="Deux règles de croupier, deux stratégies différentes">S17 vs H17</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: variant === 'S17' ? 'rgba(201,168,76,0.08)' : '#0e0e0e', border: variant === 'S17' ? '2px solid rgba(201,168,76,0.4)' : '1px solid #1a1a1a', borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ color: '#c9a84c', fontWeight: 800, fontSize: 14, margin: '0 0 6px' }}>S17 — Stand on Soft 17</p>
          <p style={{ color: '#777', fontSize: 12, lineHeight: 1.6, margin: 0 }}>Le croupier s'arrête sur tous les 17, y compris A+6. La règle <strong style={{ color: '#e0e0e0' }}>la plus favorable</strong> au joueur.</p>
        </div>
        <div style={{ background: variant === 'H17' ? 'rgba(201,168,76,0.08)' : '#0e0e0e', border: variant === 'H17' ? '2px solid rgba(201,168,76,0.4)' : '1px solid #1a1a1a', borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ color: '#c9a84c', fontWeight: 800, fontSize: 14, margin: '0 0 6px' }}>H17 — Hit on Soft 17</p>
          <p style={{ color: '#777', fontSize: 12, lineHeight: 1.6, margin: 0 }}>Le croupier tire sur A+6. Augmente ses chances d'améliorer — légèrement moins favorable au joueur.</p>
        </div>
      </div>
      <InfoBox color={isS17 ? 'blue' : 'amber'} title={`Différences clés en ${variant}`}>
        {isS17 ? (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 2 }}>
            <li>Hard 17 vs As → <strong style={{ color: '#e0e0e0' }}>Rester (S)</strong> — le croupier ne peut pas améliorer son soft 17.</li>
            <li>11 vs As → <strong style={{ color: '#e0e0e0' }}>Tirer (H)</strong> — pas de double en ENHC S17.</li>
          </ul>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 2 }}>
            <li>Hard 17 vs As → <strong style={{ color: '#e0e0e0' }}>Abandonner (R)</strong> — le croupier peut améliorer, ton 17 perd souvent.</li>
            <li>A,6 vs 2 → <strong style={{ color: '#e0e0e0' }}>Doubler (D)</strong> — tu profites du fait que le croupier tire aussi sur A,6.</li>
            <li>10 vs As → Déviation possible dès TC ≥ +3 (vs +4 en S17).</li>
          </ul>
        )}
      </InfoBox>

      <Divider />

      <SectionTitle sub="Codes couleur et structure des tableaux">Lire les tableaux</SectionTitle>
      <p style={{ color: '#777', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
        Chaque cellule = action optimale pour <strong style={{ color: '#e0e0e0' }}>ta main (ligne) × carte visible du croupier (colonne)</strong>.
        Trouve ta ligne, trouve la colonne du croupier, applique l'action.
      </p>
      <ActionLegend />

      <Divider />

      <SectionTitle sub="Le système de comptage derrière les déviations">Le système Hi-Lo</SectionTitle>
      <p style={{ color: '#777', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
        Hi-Lo attribue une valeur à chaque carte sortie pour estimer l'avantage restant dans le sabot.
        Plus le count est élevé, plus les grosses cartes dominent — avantage au joueur, tu mises davantage.
      </p>
      <HiLoTable />
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <InfoBox color="green" title="Running Count (RC)">
          Somme cumulée de toutes les cartes vues depuis le mélange.
          Ex : 5, 10, 3, As → RC = +1 −1 +1 −1 = <strong style={{ color: '#e0e0e0' }}>0</strong>.
        </InfoBox>
        <InfoBox color="amber" title="True Count (TC)">
          RC ÷ jeux restants dans le sabot (arrondi à l'inférieur).
          Ex : RC = +6, 2 jeux restants → TC = <strong style={{ color: '#e0e0e0' }}>+3</strong>.
        </InfoBox>
      </div>

      <Divider />

      <SectionTitle sub={`Hi-Lo · ENHC · ${variant} · 6 jeux`}>Les déviations (Illustrious 18)</SectionTitle>
      <p style={{ color: '#777', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
        La stratégie de base est optimale sans information sur le sabot. Avec le comptage, tu sais si les grosses ou les petites cartes dominent.
        Les <strong style={{ color: '#e0e0e0' }}>déviations</strong> sont les ajustements à la stratégie de base quand le True Count franchit un seuil précis.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10, marginBottom: 14 }}>
        <InfoBox color="green" title="Déviation montante (≥ TC)">
          Sabot riche en grosses cartes → certaines actions changent.
          Ex : Rester sur 16 vs 10 dès TC ≥ 0.
        </InfoBox>
        <InfoBox color="red" title="Déviation descendante (≤ TC)">
          Sabot riche en petites cartes → certaines actions de base ne tiennent plus.
          Ex : Tirer sur 12 vs 4 si TC ≤ 0.
        </InfoBox>
        <InfoBox color="amber" title="Surrender Fab 4">
          4 abandons conditionnels qui s'ajoutent au surrender de base, chacun à un seuil TC précis.
        </InfoBox>
      </div>
      <InfoBox color="blue" title="Ordre d'apprentissage recommandé">
        Commence par :{' '}
        <strong style={{ color: '#e0e0e0' }}>Assurance (TC ≥ +3)</strong>,{' '}
        <strong style={{ color: '#e0e0e0' }}>16 vs 10 (TC ≥ 0)</strong>,{' '}
        <strong style={{ color: '#e0e0e0' }}>15 vs 10 (TC ≥ +4)</strong>,{' '}
        <strong style={{ color: '#e0e0e0' }}>10 vs 10 (TC ≥ +4)</strong>.
        Ces 4 déviations représentent la majorité du gain théorique.
      </InfoBox>

      <Divider />
      <div style={{ background: '#0e0e0e', borderRadius: 8, border: '1px solid #1a1a1a', padding: '12px 16px' }}>
        <p style={{ color: '#333', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Sources</p>
        <p style={{ color: '#444', fontSize: 11, lineHeight: 1.7, margin: 0 }}>
          Don Schlesinger — <em>Blackjack Attack, 3e éd.</em> ·
          Stanford Wong — <em>Basic Blackjack</em> ·
          Michael Shackleford (Wizard of Odds) · Eliot Jacobson — Analyses ENHC Hi-Lo.
        </p>
      </div>
      <div style={{ height: 50 }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function ChartsPage() {
  const [mainTab, setMainTab] = useState('tables');
  const [variant, setVariant] = useState('S17');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header sticky */}
      <header className="bg-[#111] border-b border-[#1e1e1e] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          {/* Retour + titre */}
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Tableaux de référence</h1>
              <p className="text-gray-600 text-xs mt-0.5">ENHC · 6 jeux · Hi-Lo</p>
            </div>
          </div>

          {/* Onglets principaux */}
          <div style={{ display: 'flex', background: '#0a0a0a', borderRadius: 9, padding: 3, border: '1px solid #1e1e1e', gap: 2 }}>
            {[
              { id: 'tables', label: 'Tableaux',  icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'guide',  label: 'Guide',     icon: <HelpCircle className="w-3.5 h-3.5" /> },
            ].map(t => (
              <button key={t.id} onClick={() => setMainTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 16px', fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', borderRadius: 7,
                  background: mainTab === t.id ? '#1e1e1e' : 'transparent',
                  color: mainTab === t.id ? '#e0e0e0' : '#444',
                  transition: 'all .15s',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Toggle S17 / H17 */}
          <div style={{ display: 'flex', background: '#0a0a0a', borderRadius: 8, padding: 3, border: '1px solid #1e1e1e' }}>
            {['S17', 'H17'].map(v => (
              <button key={v} onClick={() => setVariant(v)}
                style={{
                  padding: '5px 16px', fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', borderRadius: 6,
                  background: variant === v ? '#c9a84c' : 'transparent',
                  color: variant === v ? '#000' : '#444',
                  transition: 'all .15s',
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      {mainTab === 'tables' ? (
        <TablesView variant={variant} />
      ) : (
        <GuideView variant={variant} />
      )}
    </div>
  );
}
