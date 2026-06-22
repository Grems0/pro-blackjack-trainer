import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

// ─── Données ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'bases',       label: 'Les bases du jeu' },
  { id: 'enhc',        label: 'La règle ENHC' },
  { id: 's17h17',      label: 'S17 vs H17' },
  { id: 'strategie',   label: 'Stratégie de base' },
  { id: 'hilo',        label: 'Comptage Hi-Lo' },
  { id: 'deviations',  label: 'Déviations' },
  { id: 'betspread',   label: 'Grille de mises' },
  { id: 'bankroll',    label: 'Gestion de bankroll' },
  { id: 'modules',     label: 'Les modules' },
  { id: 'parametres',  label: 'Paramètres du site' },
  { id: 'glossaire',   label: 'Glossaire complet' },
];

// ─── Composants ───────────────────────────────────────────────────────────────
function Tag({ children, color = 'gray' }) {
  const c = {
    gray:   { bg: 'rgba(255,255,255,0.05)', b: 'rgba(255,255,255,0.1)',  t: '#888' },
    green:  { bg: 'rgba(74,222,128,0.1)',   b: 'rgba(74,222,128,0.25)', t: '#4ade80' },
    amber:  { bg: 'rgba(201,168,76,0.1)',   b: 'rgba(201,168,76,0.25)', t: '#c9a84c' },
    blue:   { bg: 'rgba(96,165,250,0.1)',   b: 'rgba(96,165,250,0.25)', t: '#60a5fa' },
    red:    { bg: 'rgba(248,113,113,0.1)',  b: 'rgba(248,113,113,0.25)',t: '#f87171' },
    purple: { bg: 'rgba(192,132,252,0.1)',  b: 'rgba(192,132,252,0.25)',t: '#c084fc' },
  }[color];
  return (
    <span style={{ display:'inline-block', background: c.bg, border:`1px solid ${c.b}`,
      color: c.t, borderRadius:5, padding:'2px 8px', fontSize:11, fontWeight:700,
      marginRight:5, marginBottom:3 }}>
      {children}
    </span>
  );
}

function Block({ color = 'gray', title, children }) {
  const c = {
    gray:   { bg:'rgba(255,255,255,0.03)', b:'rgba(255,255,255,0.08)', t:'#888' },
    green:  { bg:'rgba(74,222,128,0.06)',  b:'rgba(74,222,128,0.2)',  t:'#4ade80' },
    amber:  { bg:'rgba(201,168,76,0.06)',  b:'rgba(201,168,76,0.2)',  t:'#c9a84c' },
    blue:   { bg:'rgba(96,165,250,0.06)',  b:'rgba(96,165,250,0.2)',  t:'#60a5fa' },
    red:    { bg:'rgba(248,113,113,0.06)', b:'rgba(248,113,113,0.2)', t:'#f87171' },
    purple: { bg:'rgba(192,132,252,0.06)', b:'rgba(192,132,252,0.2)', t:'#c084fc' },
  }[color];
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.b}`, borderRadius:10,
      padding:'14px 18px', marginBottom:12 }}>
      {title && <p style={{ color:c.t, fontWeight:700, fontSize:11, margin:'0 0 6px',
        textTransform:'uppercase', letterSpacing:1 }}>{title}</p>}
      <div style={{ color:'#888', fontSize:13, lineHeight:1.75 }}>{children}</div>
    </div>
  );
}

function Term({ word, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:'1px solid #1a1a1a' }}>
      <button onClick={() => setOpen(p=>!p)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
        <span style={{ color:'#e0e0e0', fontWeight:700, fontSize:14 }}>{word}</span>
        {open ? <ChevronDown size={15} color="#555"/> : <ChevronRight size={15} color="#555"/>}
      </button>
      {open && (
        <div style={{ color:'#777', fontSize:13, lineHeight:1.75, paddingBottom:14 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SectionAnchor({ id }) { return <div id={id} style={{ scrollMarginTop: 80 }} />; }

function H2({ children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h2 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:'0 0 4px' }}>{children}</h2>
      <div style={{ height:3, width:40, background:'#c9a84c', borderRadius:2, marginTop:8 }}/>
    </div>
  );
}

function H3({ children }) {
  return <h3 style={{ color:'#e0e0e0', fontSize:16, fontWeight:800, margin:'20px 0 10px' }}>{children}</h3>;
}

function P({ children }) {
  return <p style={{ color:'#777', fontSize:13, lineHeight:1.8, margin:'0 0 12px' }}>{children}</p>;
}

function Div() { return <div style={{ height:1, background:'#111', margin:'36px 0' }}/>; }

function Formula({ children }) {
  return (
    <div style={{ background:'#0d0d0d', border:'1px solid #222', borderRadius:8,
      padding:'12px 20px', fontFamily:'monospace', fontSize:15, color:'#c9a84c',
      textAlign:'center', margin:'12px 0' }}>
      {children}
    </div>
  );
}

// ─── Contenu principal ────────────────────────────────────────────────────────
export default function Academy() {
  const [activeSection, setActiveSection] = useState('bases');
  const contentRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ background:'#0a0a0a' }}>
      {/* Header */}
      <header style={{ background:'#111', borderBottom:'1px solid #1e1e1e',
        padding:'16px 24px', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', justifyContent:'center',
              width:36, height:36, background:'rgba(255,255,255,0.05)', borderRadius:8,
              border:'1px solid #1e1e1e', textDecoration:'none' }}>
              <ArrowLeft size={16} color="#fff"/>
            </Link>
            <div>
              <h1 style={{ color:'#fff', fontSize:17, fontWeight:800, margin:0 }}>Académie</h1>
              <p style={{ color:'#444', fontSize:11, margin:0 }}>Guide complet — Blackjack & comptage de cartes</p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', gap:32, padding:'32px 24px' }}>

        {/* Sidebar navigation */}
        <aside style={{ width:200, flexShrink:0, position:'sticky', top:88, alignSelf:'flex-start', height:'fit-content' }}>
          <p style={{ color:'#333', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, margin:'0 0 12px' }}>Sommaire</p>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              style={{
                display:'block', width:'100%', textAlign:'left', padding:'7px 10px',
                background: activeSection === s.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                border:'none', borderRadius:6, cursor:'pointer', marginBottom:2,
                color: activeSection === s.id ? '#c9a84c' : '#444',
                fontSize:12, fontWeight: activeSection === s.id ? 700 : 500,
                borderLeft: activeSection === s.id ? '2px solid #c9a84c' : '2px solid transparent',
                transition:'all .15s',
              }}>
              {s.label}
            </button>
          ))}
        </aside>

        {/* Contenu */}
        <main ref={contentRef} style={{ flex:1, minWidth:0, color:'#e0e0e0' }}>

          {/* ════════════════════════════════════════════ */}
          {/* 1. BASES DU JEU                             */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="bases"/>
          <H2>Les bases du jeu</H2>

          <P>Le blackjack est un jeu de cartes où tu joues contre le croupier. Le but est d'avoir une main dont la valeur se rapproche de 21 sans la dépasser, et qui bat celle du croupier. Contrairement au poker, tu ne joues pas contre les autres joueurs — seulement contre la banque.</P>

          <H3>Valeur des cartes</H3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
            {[
              { cards:'2 à 9', val:'Valeur nominale', color:'gray' },
              { cards:'10, V, D, R', val:'10 points', color:'gray' },
              { cards:'As (A)', val:'1 ou 11 au choix', color:'amber' },
            ].map(r => (
              <div key={r.cards} style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:8, padding:'12px 14px' }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:14, margin:'0 0 4px' }}>{r.cards}</p>
                <p style={{ color:'#555', fontSize:12, margin:0 }}>{r.val}</p>
              </div>
            ))}
          </div>

          <H3>Déroulement d'une main</H3>
          <P>Le joueur et le croupier reçoivent chacun deux cartes. En ENHC, le croupier n'a qu'<strong style={{color:'#e0e0e0'}}>une seule carte face visible</strong>. Le joueur joue en premier. Ensuite le croupier complète sa main en suivant des règles fixes : il tire jusqu'à atteindre 17 ou plus.</P>

          <H3>Les actions possibles</H3>
          {[
            { action:'Tirer (Hit — H)',           desc:'Demander une carte supplémentaire. Tu peux tirer autant de fois que tu veux sans dépasser 21.' },
            { action:'Rester (Stand — S)',          desc:"Ne plus tirer. Ta main est figée, c'est au croupier de jouer." },
            { action:'Doubler (Double Down — D)',  desc:"Doubler ta mise initiale. Tu ne reçois qu'une seule carte supplémentaire, puis tu t'arrêtes automatiquement. Réservé à certaines mains." },
            { action:'Séparer (Split — P)',         desc:"Quand tu as une paire, tu peux séparer les deux cartes en deux mains indépendantes. Tu places une mise égale sur la deuxième main et tu joues chacune séparément." },
            { action:'Abandonner (Surrender — R)', desc:"Renoncer à jouer ta main en échange de la moitié de ta mise. Tu perds 50% au lieu de continuer sur une main très défavorable. Uniquement disponible si le casino l'autorise." },
            { action:'Assurance (Insurance)',       desc:"Side bet disponible quand le croupier montre un As. Tu mises jusqu'à la moitié de ta mise initiale sur le fait que le croupier a un blackjack. Conseillé uniquement quand le TC ≥ +3." },
          ].map(r => (
            <div key={r.action} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.action}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>Résultats possibles</H3>
          <P><strong style={{color:'#e0e0e0'}}>Blackjack</strong> : As + carte de valeur 10 en deux cartes. Payé 3:2 (tu gagnes 1,5× ta mise). Si le croupier a aussi un blackjack : égalité (push), tu récupères ta mise.</P>
          <P><strong style={{color:'#e0e0e0'}}>Gagner</strong> : Ta main bat celle du croupier sans dépasser 21. Payé 1:1.</P>
          <P><strong style={{color:'#e0e0e0'}}>Bust</strong> : Tu dépasses 21. Tu perds immédiatement, même si le croupier buste ensuite.</P>
          <P><strong style={{color:'#e0e0e0'}}>Push (égalité)</strong> : Même total que le croupier. Tu récupères ta mise.</P>

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 2. ENHC                                     */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="enhc"/>
          <H2>La règle ENHC</H2>

          <P><strong style={{color:'#e0e0e0'}}>ENHC = European No Hole Card.</strong> C'est la règle en vigueur dans la quasi-totalité des casinos européens et français. Elle change fondamentalement la façon de jouer par rapport au blackjack américain.</P>

          <H3>Ce qui change</H3>
          <Block color="amber" title="En blackjack américain (avec trou)">
            Le croupier reçoit ses deux cartes dès le début. Si sa première carte est un As ou un 10, il regarde immédiatement sa deuxième carte. S'il a un blackjack, la donne se termine instantanément — les joueurs perdent uniquement leur mise initiale, les doubles et splits sont remboursés.
          </Block>
          <Block color="red" title="En ENHC (sans trou)">
            Le croupier ne reçoit sa deuxième carte qu'<strong style={{color:'#e0e0e0'}}>après que tous les joueurs aient joué</strong>. Si tu doubles ou sépares et que le croupier révèle ensuite un blackjack, tu perds <strong style={{color:'#e0e0e0'}}>toute ta mise</strong> — la mise initiale et les mises supplémentaires.
          </Block>

          <H3>Impact sur la stratégie</H3>
          <P>Le risque de perdre une mise doublée face à un blackjack croupier rend certains doubles non rentables. C'est pourquoi la stratégie ENHC diffère du standard américain sur trois cas précis :</P>
          {[
            { main:'10 vs 10', us:'Doubler (D)', enhc:'Tirer (H)', why:"Le risque de perdre double mise face au BJ non visible dépasse l'avantage du double." },
            { main:'10 vs As', us:'Doubler (D)', enhc:'Tirer (H)', why:"Idem. Le croupier a trop de chances d'avoir un BJ." },
            { main:'11 vs As', us:'Doubler (D) en H17', enhc:'Tirer (H)', why:"La pénalité ENHC annule le gain espéré, même avec une excellente main de départ." },
          ].map(r => (
            <div key={r.main} style={{ display:'flex', gap:12, background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8, flexWrap:'wrap' }}>
              <div style={{ flexShrink:0 }}>
                <p style={{ color:'#e0e0e0', fontWeight:800, fontSize:14, margin:0 }}>{r.main}</p>
              </div>
              <div style={{ display:'flex', gap:16, flex:1, flexWrap:'wrap' }}>
                <div><p style={{ color:'#555', fontSize:10, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:1 }}>US</p><Tag color="gray">{r.us}</Tag></div>
                <div><p style={{ color:'#555', fontSize:10, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:1 }}>ENHC</p><Tag color="red">{r.enhc}</Tag></div>
                <div style={{ flex:1 }}><p style={{ color:'#555', fontSize:12, lineHeight:1.6, margin:0 }}>{r.why}</p></div>
              </div>
            </div>
          ))}

          <Block color="blue" title="Lose Original Only (LOO)">
            Certains casinos appliquent une variante ENHC plus favorable : en cas de BJ croupier, tu ne perds que ta mise initiale (les mises de double/split sont remboursées). Cette règle réduit l'avantage de la maison d'environ 0.11%. Si ton casino applique LOO, quelques cases de la stratégie changent.
          </Block>

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 3. S17 vs H17                               */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="s17h17"/>
          <H2>S17 vs H17</H2>

          <P>Ces deux sigles désignent la règle que suit le croupier sur un <strong style={{color:'#e0e0e0'}}>soft 17</strong> (= main souple de valeur 17, typiquement As + 6).</P>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <Block color="green" title="S17 — Stand on Soft 17">
              Le croupier <strong style={{color:'#e0e0e0'}}>s'arrête</strong> sur tous les 17, y compris A+6. C'est la règle la plus favorable au joueur car le croupier ne peut pas améliorer son soft 17. Avantage maison réduit d'environ 0.20% par rapport à H17.
            </Block>
            <Block color="amber" title="H17 — Hit on Soft 17">
              Le croupier <strong style={{color:'#e0e0e0'}}>tire</strong> sur A+6 (et tout soft 17 en général) jusqu'à atteindre un hard 17 ou plus. Cela lui donne des chances supplémentaires d'atteindre 18, 19, 20 ou 21 — légèrement moins favorable pour le joueur.
            </Block>
          </div>

          <H3>Ce qui change entre S17 et H17</H3>
          {[
            { situation:'Hard 17 vs As', s17:'Rester (S)', h17:'Abandonner (R)', why:'En H17, le croupier peut améliorer son soft 17 → ton 17 perd plus souvent.' },
            { situation:'A,6 vs 2 (soft 17)', s17:'Tirer (H)', h17:'Doubler (D)', why:'En H17, le croupier tire aussi sur soft 17 → tu peux toi-même te permettre de doubler.' },
            { situation:'10 vs As (déviation)', s17:'TC ≥ +4', h17:'TC ≥ +3', why:"En H17, l'avantage arrive un cran plus tôt car le croupier est légèrement plus faible." },
            { situation:'8,8 vs As (surrender)', s17:'TC ≥ +6', h17:'TC ≥ +5', why:'Même logique : le croupier étant plus vulnérable, le seuil de surrender est abaissé.' },
          ].map(r => (
            <div key={r.situation} style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 1.5fr', gap:12, alignItems:'center', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'10px 14px', marginBottom:6 }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:12, margin:0 }}>{r.situation}</p>
              <div><p style={{ color:'#4ade80', fontSize:12, fontWeight:700, margin:0 }}>S17 : {r.s17}</p></div>
              <div><p style={{ color:'#c9a84c', fontSize:12, fontWeight:700, margin:0 }}>H17 : {r.h17}</p></div>
              <p style={{ color:'#555', fontSize:11, margin:0 }}>{r.why}</p>
            </div>
          ))}

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 4. STRATÉGIE DE BASE                        */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="strategie"/>
          <H2>Stratégie de base</H2>

          <P>La stratégie de base est l'ensemble des décisions mathématiquement optimales pour chaque combinaison possible (ta main × carte visible du croupier), calculées sans aucune information supplémentaire sur le contenu du sabot.</P>
          <P>Elle a été calculée par ordinateur en simulant des milliards de mains. En la suivant parfaitement, tu réduis l'avantage de la maison à environ <strong style={{color:'#e0e0e0'}}>0.3–0.6%</strong> selon les règles de la table. C'est la base absolue — sans elle, le comptage ne sert à rien.</P>

          <H3>Les 3 types de mains</H3>
          <Block color="blue" title="Main dure (Hard hand)">
            Une main <strong style={{color:'#e0e0e0'}}>sans As</strong>, ou avec un As compté pour 1 (car compter l'As pour 11 ferait dépasser 21). Exemple : 10+6 = 16 dur. 10+As+5 = 16 dur (l'As vaut 1 car 10+11+5 = 26 → buste). Les mains dures sont les plus fréquentes.
          </Block>
          <Block color="green" title="Main souple (Soft hand)">
            Une main avec un As compté pour <strong style={{color:'#e0e0e0'}}>11</strong> sans risque de buste. Exemple : As+6 = soft 17 (l'As vaut 11). Si tu tires un 10, tu obtiens 17 dur (l'As revient à 1). L'avantage : tu peux tirer sans risquer de buster, ce qui justifie des doubles plus agressifs.
          </Block>
          <Block color="purple" title="Paire (Pair)">
            Deux cartes de même valeur. Tu as alors le choix de séparer (split) ou de jouer la main comme une main classique. Les paires ont leur propre tableau car l'option de séparer change radicalement la décision optimale.
          </Block>

          <H3>Principes clés à retenir</H3>
          {[
            { rule:"Toujours séparer A,A et 8,8", why:"Deux As = deux mains à 11. Une paire de 8 = 16 (pire main), séparée en deux 8 jouables." },
            { rule:"Jamais séparer 10,10", why:"20 est la meilleure main après blackjack. Ne jamais risquer de la gâcher." },
            { rule:"Jamais séparer 5,5", why:"5+5 = 10, excellent pour doubler. Séparer donnerait deux mains faibles à 5." },
            { rule:"Doubler sur 11 vs 2-10", why:"11 est la meilleure main pour doubler avant de voir la carte du croupier." },
            { rule:"Rester sur 12-16 vs croupier faible (2-6)", why:"Le croupier a de fortes chances de buster — laisse-le faire." },
            { rule:"Tirer sur 12-16 vs croupier fort (7-As)", why:"Le croupier est favorisé, minimise la perte en tirant." },
            { rule:"Abandonner 16 vs 9/10/As et 15 vs 10", why:"Tu perds ~70% de ces mains en jouant. En abandonnant, tu ne perds que 50%." },
          ].map(r => (
            <div key={r.rule} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #111' }}>
              <span style={{ color:'#c9a84c', flexShrink:0, fontSize:14, marginTop:1 }}>›</span>
              <div>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 3px' }}>{r.rule}</p>
                <p style={{ color:'#555', fontSize:12, margin:0 }}>{r.why}</p>
              </div>
            </div>
          ))}

          <Block color="amber" title="Ds — Doubler ou Rester">
            Certaines cases indiquent "Ds". Cela signifie : <strong style={{color:'#e0e0e0'}}>Doubler si c'est ton premier geste</strong> (2 cartes initiales). Si tu as déjà tiré une carte, Rester. Exemple typique : A,7 (soft 18) vs 3 → Ds.
          </Block>
          <Block color="red" title="Rh — Abandonner ou Tirer">
            "Rh" signifie : Abandonner si le surrender est autorisé à la table ET c'est ton premier geste. Sinon, Tirer. Exemple : 16 vs As → Rh.
          </Block>

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 5. Hi-Lo                                    */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="hilo"/>
          <H2>Comptage Hi-Lo</H2>

          <P>Le comptage de cartes est une technique légale qui consiste à suivre mentalement la composition du sabot pour ajuster ses mises et ses décisions. Hi-Lo est le système le plus populaire au monde — efficace, simple à apprendre, redoutable à maîtriser.</P>

          <H3>Pourquoi ça marche</H3>
          <P>Un sabot riche en grosses cartes (10, As) est <strong style={{color:'#e0e0e0'}}>favorable au joueur</strong> pour plusieurs raisons : les blackjacks (payés 3:2) sont plus fréquents, les doubles sur 10 et 11 rapportent plus, le croupier buste plus souvent (il doit tirer jusqu'à 17).</P>
          <P>À l'inverse, un sabot riche en petites cartes (2–6) favorise le croupier, car ces cartes l'aident à améliorer ses mains faibles sans buster.</P>

          <H3>Valeurs Hi-Lo</H3>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {[
              { cards:['2','3','4','5','6'], val:'+1', color:'#4ade80', bg:'rgba(74,222,128,0.08)', b:'rgba(74,222,128,0.2)', label:'Basses — avantage joueur' },
              { cards:['7','8','9'],        val:'0',  color:'#666',    bg:'rgba(255,255,255,0.03)', b:'rgba(255,255,255,0.08)', label:'Neutres — ignorées' },
              { cards:['10','V','D','R','A'], val:'−1', color:'#f87171', bg:'rgba(248,113,113,0.08)', b:'rgba(248,113,113,0.2)', label:'Hautes — avantage croupier' },
            ].map(g => (
              <div key={g.val} style={{ background:g.bg, border:`1px solid ${g.b}`, borderRadius:10, padding:'12px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:'#555', fontSize:11 }}>{g.label}</span>
                  <span style={{ color:g.color, fontSize:20, fontWeight:900 }}>{g.val}</span>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {g.cards.map(c => <span key={c} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:4, color:'#ddd', fontSize:13, fontWeight:700, padding:'3px 10px' }}>{c}</span>)}
                </div>
              </div>
            ))}
          </div>

          <H3>Running Count (RC)</H3>
          <P>À chaque carte vue, tu ajoutes sa valeur Hi-Lo à ton total courant. Le Running Count part de 0 au début du sabot et évolue au fil des cartes.</P>
          <Block color="gray" title="Exemple">
            Tu vois les cartes : 5, Roi, 3, As, 7, 6<br/>
            RC = +1 (5) − 1 (Roi) + 1 (3) − 1 (As) + 0 (7) + 1 (6) = <strong style={{color:'#e0e0e0'}}>+1</strong>
          </Block>
          <P>Un RC positif = plus de grosses cartes restent. Un RC négatif = le sabot est riche en petites cartes.</P>

          <H3>True Count (TC)</H3>
          <P>Le RC seul ne suffit pas pour comparer des situations à des profondeurs différentes. Un RC de +6 sur un sabot neuf (300 cartes restantes) ne vaut pas la même chose que +6 sur un sabot presque vide (50 cartes). Le True Count normalise le RC.</P>
          <Formula>TC = RC ÷ nombre de jeux restants</Formula>
          <P>Le nombre de jeux restants s'estime en regardant la hauteur du sabot. Sur ce site, tu peux choisir la précision : demi-jeu, quart de jeu, ou jeu entier.</P>
          <Block color="green" title="Exemple">
            RC = +8. Il reste environ 3 jeux dans le sabot.<br/>
            TC = 8 ÷ 3 = <strong style={{color:'#e0e0e0'}}>+2</strong> (arrondi à l'inférieur = trucation)
          </Block>

          <H3>Méthodes de calcul du TC</H3>
          {[
            { m:'Truncation (Troncature)', desc:"Arrondit vers zéro. +2.7 → +2 / −2.7 → −2. Méthode recommandée, la plus conservative et la plus précise pour le jeu réel.", rec:true },
            { m:'Floor (Plancher)',        desc:"Arrondit vers le bas. +2.7 → +2 / −2.7 → −3. Défavorise légèrement les TC négatifs.", rec:false },
            { m:'Round (Arrondi)',         desc:"Arrondi classique. +2.7 → +3 / −2.7 → −3. Surestime le TC dans les deux sens.", rec:false },
          ].map(r => (
            <div key={r.m} style={{ background:'#0e0e0e', border:`1px solid ${r.rec ? 'rgba(74,222,128,0.25)' : '#1a1a1a'}`, borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:0 }}>{r.m}</p>
                {r.rec && <Tag color="green">Recommandé</Tag>}
              </div>
              <p style={{ color:'#555', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>Pénétration</H3>
          <P>La pénétration désigne <strong style={{color:'#e0e0e0'}}>la profondeur de jeu avant le mélange</strong>. Si le croupier mélange après 4 jeux sur 6, la pénétration est de 4 jeux (ou 66%). Plus la pénétration est élevée, plus le comptage est précis et rentable — les counts extrêmes (très positifs ou très négatifs) ont plus de temps pour se développer.</P>
          <P>Sur ce site, la pénétration se configure en nombre de jeux (4 / 4,5 / 5 / 5,5 jeux sur 6). Un casino avec pénétration à 5 jeux est beaucoup plus favorable qu'un casino à 4 jeux.</P>

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 6. DÉVIATIONS                               */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="deviations"/>
          <H2>Déviations</H2>

          <P>La stratégie de base est optimale quand tu n'as aucune information sur le contenu du sabot. Mais quand tu comptes, tu <em>sais</em> que le sabot est riche ou pauvre en grosses cartes. Les déviations sont les <strong style={{color:'#e0e0e0'}}>ajustements à apporter à la stratégie de base</strong> en fonction du True Count.</P>

          <H3>Illustrious 18</H3>
          <P>Don Schlesinger a identifié les 18 déviations les plus rentables dans son livre <em>Blackjack Attack</em> — les "Illustrious 18". Ce sont les 18 situations où s'écarter de la stratégie de base rapporte le plus d'argent supplémentaire sur le long terme.</P>

          <H3>Déviations montantes (≥ TC)</H3>
          <P>Quand le TC monte, le sabot est riche en grosses cartes. Certaines actions deviennent plus rentables que l'action de base :</P>
          {[
            { dev:'Assurance (Insurance)', base:'Non', deviation:'Prendre l\'assurance', tc:'TC ≥ +3', why:"À TC ≥ +3, il y a statistiquement assez de 10 dans le sabot pour rendre l'assurance rentable." },
            { dev:'16 vs 10', base:'H (Tirer)', deviation:'S (Rester)', tc:'TC ≥ 0', why:"Le sabot riche en grosses cartes fait buster le croupier plus souvent — rester vaut mieux." },
            { dev:'15 vs 10', base:'H (Tirer)', deviation:'S (Rester)', tc:'TC ≥ +4', why:"Même logique mais le seuil est plus élevé car 15 est une main encore plus faible que 16." },
            { dev:'10 vs 10', base:'H', deviation:'D (Doubler)', tc:'TC ≥ +4', why:"Quand le TC est très positif, doubler sur 10 contre un 10 devient rentable." },
            { dev:'12 vs 3', base:'H', deviation:'S (Rester)', tc:'TC ≥ +2', why:"Sabot riche → le croupier buste plus souvent, ton 12 vaut la peine d'être conservé." },
            { dev:'12 vs 2', base:'H', deviation:'S (Rester)', tc:'TC ≥ +3', why:"Même principe, seuil plus élevé car le 2 est légèrement moins dangereux pour le croupier." },
          ].map(r => (
            <div key={r.dev} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.dev}</p>
                  <p style={{ color:'#555', fontSize:12, margin:0 }}>Base : <span style={{color:'#aaa'}}>{r.base}</span> → Déviation : <span style={{color:'#4ade80', fontWeight:700}}>{r.deviation}</span></p>
                </div>
                <Tag color="green">{r.tc}</Tag>
              </div>
              <p style={{ color:'#555', fontSize:11, lineHeight:1.6, margin:'8px 0 0' }}>{r.why}</p>
            </div>
          ))}

          <H3>Déviations descendantes (≤ TC)</H3>
          <P>Quand le TC est bas, le sabot est riche en petites cartes. Certaines actions de base ne tiennent plus :</P>
          {[
            { dev:'12 vs 4', base:'S (Rester)', deviation:'H (Tirer)', tc:'TC ≤ 0', why:"Les petites cartes ne font pas buster le croupier autant — tirer est préférable." },
            { dev:'12 vs 5', base:'S (Rester)', deviation:'H (Tirer)', tc:'TC ≤ −1', why:"Même logique, seuil plus bas car le 5 est déjà une carte croupier assez faible." },
            { dev:'12 vs 6', base:'S (Rester)', deviation:'H (Tirer)', tc:'TC ≤ −1', why:"Idem. Le croupier avec 6 buste moins en sabot riche en petites cartes." },
            { dev:'13 vs 2', base:'S (Rester)', deviation:'H (Tirer)', tc:'TC ≤ −1', why:"En sabot pauvre, le croupier améliore mieux ses mains faibles." },
          ].map(r => (
            <div key={r.dev} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.dev}</p>
                  <p style={{ color:'#555', fontSize:12, margin:0 }}>Base : <span style={{color:'#aaa'}}>{r.base}</span> → Déviation : <span style={{color:'#f87171', fontWeight:700}}>{r.deviation}</span></p>
                </div>
                <Tag color="red">{r.tc}</Tag>
              </div>
              <p style={{ color:'#555', fontSize:11, lineHeight:1.6, margin:'8px 0 0' }}>{r.why}</p>
            </div>
          ))}

          <H3>Fab 4 — Surrenders par déviation</H3>
          <P>Les "Fab 4" sont quatre surrenders conditionnels identifiés par Don Schlesinger. Ils s'ajoutent au surrender de base quand le TC monte :</P>
          {[
            { hand:'16 vs 9',  tc:'TC ≥ +5 (S17) / ≥ +4 (H17)', why:"Ta main souffre encore plus quand le sabot est riche en grosses cartes." },
            { hand:'15 vs As', tc:'TC ≥ +1 (S17) / ≥ +2 (H17)', why:"L'As croupier combiné à un sabot riche est très dangereux." },
            { hand:'15 vs 10', tc:'TC ≥ +4', why:"Le croupier va souvent atteindre 20 — abandonner vaut mieux." },
            { hand:'8,8 vs As',tc:'TC ≥ +6 (S17) / ≥ +5 (H17)', why:"Même si on sépare normalement les 8, contre un As en sabot très riche, abandon." },
          ].map(r => (
            <div key={r.hand} style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:0 }}>{r.hand}</p>
                <Tag color="amber">{r.tc}</Tag>
              </div>
              <p style={{ color:'#666', fontSize:11, lineHeight:1.6, margin:'6px 0 0' }}>{r.why}</p>
            </div>
          ))}

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 7. BET SPREAD                               */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="betspread"/>
          <H2>Grille de mises (Bet Spread)</H2>

          <P>Le comptage de cartes n'a de valeur que si tu adaptes tes mises au True Count. Quand tu as l'avantage (TC élevé), tu mises plus. Quand le casino a l'avantage (TC bas), tu mises le minimum. C'est la <strong style={{color:'#e0e0e0'}}>grille de mises</strong>.</P>

          <H3>Spread</H3>
          <P>Le spread est le <strong style={{color:'#e0e0e0'}}>rapport entre ta mise maximale et ta mise minimale</strong>. Un spread 1:8 signifie que tu mises jusqu'à 8× la mise min. En pratique, un spread de 1:8 à 1:12 est raisonnable et discret dans un vrai casino.</P>

          <H3>Unités</H3>
          <P>Une <strong style={{color:'#e0e0e0'}}>unité</strong> est ta mise de base (mise minimum). Toutes tes mises sont exprimées en multiples d'unités. Si une unité = 10€, une mise de 3 unités = 30€. Travailler en unités te permet de raisonner indépendamment du montant réel.</P>

          <H3>Tableau de mise recommandé</H3>
          <div style={{ overflowX:'auto', marginBottom:16 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e1e1e' }}>
                  {['True Count','Avantage joueur','Mise','Action'].map(h => (
                    <th key={h} style={{ color:'#444', fontWeight:700, padding:'8px 12px', textAlign:'left', textTransform:'uppercase', fontSize:10, letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { tc:'≤ 0',   edge:'−0.5% ou moins', mise:'1 unité (min)', action:'Jouer le minimum', color:'#f87171' },
                  { tc:'+1',    edge:'~0%',             mise:'1–2 unités',   action:'Jeu neutre',        color:'#888' },
                  { tc:'+2',    edge:'~+0.5%',          mise:'2–4 unités',   action:'Augmenter',         color:'#4ade80' },
                  { tc:'+3',    edge:'~+1%',            mise:'4–6 unités',   action:'Miser + Assurance', color:'#4ade80' },
                  { tc:'+4',    edge:'~+1.5%',          mise:'6–8 unités',   action:'Mise élevée',       color:'#4ade80' },
                  { tc:'≥ +5',  edge:'≥ +2%',           mise:'Max',          action:'Mise maximale',     color:'#4ade80' },
                ].map(r => (
                  <tr key={r.tc} style={{ borderBottom:'1px solid #0e0e0e' }}>
                    <td style={{ padding:'10px 12px', color:r.color, fontWeight:700 }}>{r.tc}</td>
                    <td style={{ padding:'10px 12px', color:'#666' }}>{r.edge}</td>
                    <td style={{ padding:'10px 12px', color:'#e0e0e0', fontWeight:600 }}>{r.mise}</td>
                    <td style={{ padding:'10px 12px', color:'#666' }}>{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>DAS — Double After Split</H3>
          <P>Si le casino autorise le DAS, tu peux doubler sur une main issue d'un split. Exemple : tu sépares 3,3 et tu reçois un 8 → tu as 3+8=11 et tu peux doubler. C'est une règle favorable qui réduit l'avantage de la maison d'environ 0.14%.</P>

          <H3>RSA — Resplit Aces</H3>
          <P>Normalement, une fois les As séparés, tu ne peux pas séparer à nouveau si tu obtiens un autre As. Si le casino autorise le RSA, tu peux séparer les As jusqu'à 4 fois. Règle rare mais favorable (~0.08%).</P>

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 8. BANKROLL                                 */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="bankroll"/>
          <H2>Gestion de bankroll</H2>

          <P>Même avec un avantage mathématique, la variance du blackjack est élevée. Sans une bankroll adaptée à tes mises, tu risques de te retrouver à zéro avant que la loi des grands nombres joue en ta faveur.</P>

          <H3>EV — Expected Value (Espérance de gain)</H3>
          <P>L'EV est le gain ou la perte <strong style={{color:'#e0e0e0'}}>attendu en moyenne</strong> sur le long terme pour chaque euro misé. Un EV de +0.5% signifie qu'en moyenne, pour 100€ misés, tu espères gagner 0.50€.</P>
          <Formula>EV (par heure) = EV% × Mise moyenne × Mains/heure</Formula>
          <P>Exemple : EV = +0.8%, mise moyenne = 30€, 80 mains/heure → EV/heure = 0.8% × 30 × 80 = <strong style={{color:'#e0e0e0'}}>19.20€/heure</strong></P>

          <H3>Risk of Ruin (RoR)</H3>
          <P>Le Risk of Ruin est la <strong style={{color:'#e0e0e0'}}>probabilité de perdre toute ta bankroll</strong> avant d'atteindre tes objectifs. Il dépend du ratio bankroll / mise unitaire et de ta variance.</P>
          <P>Pour un jeu professionnel, vise un RoR inférieur à <strong style={{color:'#e0e0e0'}}>5%</strong>. En pratique :</P>
          {[
            { br:'200 unités', ror:'~13%', risk:'Risqué' },
            { br:'300 unités', ror:'~5%',  risk:'Acceptable' },
            { br:'500 unités', ror:'~1%',  risk:'Conservateur' },
          ].map(r => (
            <div key={r.br} style={{ display:'flex', gap:16, alignItems:'center', padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:6, marginBottom:6 }}>
              <span style={{ color:'#e0e0e0', fontWeight:700, fontSize:13 }}>{r.br}</span>
              <span style={{ color: r.ror === '~1%' ? '#4ade80' : r.ror === '~5%' ? '#c9a84c' : '#f87171', fontWeight:700 }}>RoR {r.ror}</span>
              <span style={{ color:'#555', fontSize:12 }}>{r.risk}</span>
            </div>
          ))}

          <H3>N-Zero (N0)</H3>
          <P>N0 est le <strong style={{color:'#e0e0e0'}}>nombre de mains nécessaires</strong> pour que ton avantage cumulé dépasse l'écart-type. C'est une mesure du "long terme" — avant N0 mains, la chance peut encore dominer les résultats.</P>
          <Formula>N0 = Variance / EV²</Formula>
          <P>Pour un compteur Hi-Lo typique, N0 se situe entre 15 000 et 25 000 mains. À 100 mains/heure, ça représente 150–250 heures de jeu. C'est pourquoi la patience est indispensable.</P>

          <H3>Critère de Kelly</H3>
          <P>Le critère de Kelly détermine la mise optimale pour maximiser la croissance de la bankroll à long terme.</P>
          <Formula>Mise = Bankroll × (Edge / Variance)</Formula>
          {[
            { k:'Full Kelly', desc:'Croissance maximale théorique. Variance très élevée — risqué en pratique.', rec:false },
            { k:'Half Kelly', desc:'Bon compromis : 75% de la croissance Kelly avec 25% de la variance. Approche populaire.', rec:true },
            { k:'Quarter Kelly', desc:"Très conservateur. Croissance réduite mais risque minimal. Pour les bankrolls modestes.", rec:false },
          ].map(r => (
            <div key={r.k} style={{ background:'#0e0e0e', border:`1px solid ${r.rec ? 'rgba(74,222,128,0.25)' : '#1a1a1a'}`, borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:0 }}>{r.k}</p>
                {r.rec && <Tag color="green">Recommandé</Tag>}
              </div>
              <p style={{ color:'#555', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 9. MODULES                                  */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="modules"/>
          <H2>Les modules d'entraînement</H2>

          {[
            {
              name:'Running Count', color:'green',
              desc:"Le module te présente des cartes une par une au rythme choisi. Tu dois maintenir mentalement le Running Count Hi-Lo. Périodiquement, le module te demande ton RC actuel — tu vérifies ta précision. L'objectif : arriver à compter sans effort, sans délai, sans erreur.",
              tips:["Commence lentement (vitesse 3-4) et augmente progressivement.", "Ne murmure pas les cartes — entraîne-toi à voir +1 ou −1 directement.", "Annule les paires : un +1 et un −1 vus ensemble = 0, ignore-les."],
            },
            {
              name:'True Count', color:'blue',
              desc:"Tu vois le Running Count et la position dans le sabot (via le bac à défausse visuel). Tu dois calculer le True Count en estimant le nombre de jeux restants, puis entrer ta réponse. Le module vérifie si tu utilises la bonne méthode d'arrondi (truncation recommandée).",
              tips:["Compte les jeux restants par tranches de 52 cartes (épaisseur visuelle).", "La précision demi-jeu est le meilleur compromis précision/vitesse.", "Entraîne-toi jusqu'à calculer le TC en moins de 2 secondes."],
            },
            {
              name:'Stratégie de base', color:'amber',
              desc:"Le module génère des mains aléatoires (ou ciblées : dures/souples/paires) avec une carte croupier. Tu dois répondre avec l'action optimale selon la stratégie ENHC pour la variante choisie (S17 ou H17). En cas d'erreur, le module affiche la bonne réponse.",
              tips:["Commence par les mains dures (les plus courantes).", "Les mains souples (avec As) sont souvent contre-intuitives — travaille-les séparément.", "Vise 100% de précision avant de passer au module suivant."],
            },
            {
              name:'Déviations', color:'purple',
              desc:"Le module tire une situation (main + carte croupier + True Count) et te demande si tu appliques une déviation, et laquelle. Il couvre les Illustrious 18 et les Fab 4 Surrender, adaptées à la variante et aux règles de ta table.",
              tips:["Commence par les 4 déviations les plus rentables (Insurance, 16v10, 15v10, 10v10).", "Distingue bien montantes (≥ TC) et descendantes (≤ TC).", "Mémorise les seuils — une erreur de seuil coûte plus cher qu'une erreur de stratégie de base."],
            },
            {
              name:'Simulation Casino', color:'amber',
              desc:"Le mode le plus complet. Tu joues une vraie session de blackjack avec ta bankroll configurée, tes règles de table, ton bet spread. Le module surveille tes décisions de jeu ET tes mises. Tu vois ton bankroll évoluer en temps réel avec le P&L (profit & loss).",
              tips:["Configure tes vraies règles de table avant de commencer.", "Active les déviations seulement si tu les maîtrises parfaitement.", "Le bouton Voir/Cacher permet de révéler RC et TC si tu te perds — mais évite-le en entraînement sérieux."],
            },
          ].map(m => (
            <div key={m.name} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:12, padding:'20px', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <h3 style={{ color:'#fff', fontSize:16, fontWeight:800, margin:0 }}>{m.name}</h3>
                <Tag color={m.color}>Module</Tag>
              </div>
              <P>{m.desc}</P>
              <div style={{ marginTop:10 }}>
                <p style={{ color:'#444', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, margin:'0 0 8px' }}>Conseils</p>
                {m.tips.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}>
                    <span style={{ color:'#c9a84c', flexShrink:0, fontSize:13 }}>›</span>
                    <p style={{ color:'#666', fontSize:12, lineHeight:1.6, margin:0 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 10. PARAMÈTRES DU SITE                      */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="parametres"/>
          <H2>Paramètres du site</H2>

          <H3>Paramètres du joueur</H3>
          {[
            { param:'Bankroll de départ',        desc:"Le capital total que tu alloues au blackjack. Sert de référence pour calculer la taille de tes unités et le Risk of Ruin. Recommandation : au moins 300 unités pour un RoR acceptable." },
            { param:'Estimation des jeux restants', desc:"La précision avec laquelle tu estimes les jeux restants pour calculer le TC. Options : jeu entier (moins précis, plus simple), demi-jeu (recommandé), quart de jeu (très précis, plus difficile)." },
            { param:'Méthode de calcul du TC',   desc:"Comment arrondir le True Count. Truncation (vers zéro) est la méthode standard recommandée. Floor et Round sont des alternatives moins utilisées en pratique." },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>Règles de la table</H3>
          {[
            { param:'S17 / H17',       desc:"La règle du croupier sur le soft 17. S17 = croupier s'arrête sur tous les 17. H17 = croupier tire sur A+6. Impact sur la stratégie et les déviations." },
            { param:'DAS',             desc:"Double After Split — autorisation de doubler après avoir séparé une paire. Règle favorable, réduit l'avantage maison de ~0.14%." },
            { param:'RSA',             desc:"Resplit Aces — autorisation de reséparer les As si tu en reçois un nouveau. Règle rare et favorable (~0.08%)." },
            { param:'Surrender',       desc:"Abandon tardif — possibilité de céder sa main pour récupérer la moitié de sa mise. Réduit l'avantage maison de ~0.08%. Nécessaire pour les Fab 4." },
            { param:'Pénétration',     desc:"Nombre de jeux joués avant le mélange. 4 jeux = pénétration faible (66%). 5,5 jeux = pénétration élevée (92%). Plus c'est élevé, mieux c'est pour le comptage." },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>Grille de mises</H3>
          {[
            { param:'Mise minimale',   desc:"Ta mise quand tu n'as pas l'avantage (TC ≤ 0). C'est ton unité de base. Toutes tes mises sont des multiples de cette valeur." },
            { param:'Spread (ratio)',  desc:"Le rapport mise max / mise min. Ex : spread 1:8 avec mise min 10€ → mise max 80€. Un spread plus élevé augmente l'EV mais attire plus l'attention du casino." },
            { param:'Mises par TC',    desc:"Pour chaque niveau de True Count, tu définis le nombre d'unités à miser. Le site calcule automatiquement l'EV et le RoR en fonction de ta grille." },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>Paramètres additionnels</H3>
          {[
            { param:'Déviations (Simulation)', desc:"Active l'évaluation des déviations dans la Simulation Casino. Le module vérifiera si tu appliques les bonnes déviations au bon TC. Désactive si tu travailles uniquement la stratégie de base." },
            { param:'Nombre de bots',          desc:"Dans la Simulation Casino, nombre de joueurs virtuels à la table (1 ou 2). Ils jouent mécaniquement la stratégie de base et permettent de voir plus de cartes par main — utile pour l'entraînement au comptage." },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <Div/>

          {/* ════════════════════════════════════════════ */}
          {/* 11. GLOSSAIRE                               */}
          {/* ════════════════════════════════════════════ */}
          <SectionAnchor id="glossaire"/>
          <H2>Glossaire complet</H2>
          <P>Tous les termes du blackjack et du comptage de cartes, classés par ordre alphabétique.</P>

          <div style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:12, padding:'4px 20px' }}>
            {[
              { w:'Ace (As)', d:"Carte valant 1 ou 11 selon les besoins. L'As est la carte la plus puissante : il permet les blackjacks et les mains souples." },
              { w:'Action (mise totale)', d:"La somme totale misée sur une session ou une période. Terme utilisé pour calculer l'EV attendu." },
              { w:'Advantage Player (AP)', d:"Joueur qui utilise des techniques légales (comptage, shuffle tracking, edge sorting…) pour obtenir un avantage mathématique sur le casino." },
              { w:'Assurance (Insurance)', d:"Side bet disponible quand le croupier montre un As. Tu paries jusqu'à la moitié de ta mise que le croupier a un blackjack (carte de valeur 10 en dessous). Payé 2:1. Mathématiquement rentable uniquement à TC ≥ +3 en Hi-Lo." },
              { w:'Back-counting', d:"Technique consistant à compter les cartes debout derrière une table sans jouer, puis à s'asseoir uniquement quand le TC est favorable. Aussi appelé 'Wonging'." },
              { w:'Bet Spread', d:"Rapport entre ta mise maximale et ta mise minimale. Ex : 1:8 = tu mises entre 1 et 8 unités. Un spread élevé augmente l'EV mais attire l'attention des casinos." },
              { w:'Blackjack (BJ)', d:"As + carte de valeur 10 en deux cartes initiales. Payé 3:2 (1.5× la mise). Si le croupier a aussi un BJ : push." },
              { w:'Burn card', d:"Carte retirée et mise de côté juste après le mélange, avant que le jeu commence. Non visible, elle affecte marginalement le comptage." },
              { w:'Bust', d:"Dépasser 21. Le joueur qui buste perd immédiatement. Si le croupier buste après le joueur, cela n'aide pas — tu as déjà perdu." },
              { w:'Camouflage', d:"Technique visant à dissimuler le comptage : varier son jeu artificiellement, faire semblant d'hésiter, gérer son image de joueur ordinaire." },
              { w:'Composition-dependent (CD)', d:"Stratégie qui tient compte de la composition exacte de la main (pas juste le total). Ex : 7+7 vs 8+6 = même total (14) mais stratégie différente dans certaines situations rares." },
              { w:'Count', d:"Le décompte courant, qu'il soit Running Count ou True Count. 'Le count' = la valeur Hi-Lo actuelle." },
              { w:'Croupier', d:"Le représentant du casino qui distribue les cartes et joue sa main selon des règles fixes : tirer jusqu'à 17 ou plus, puis s'arrêter (S17) ou continuer sur soft 17 (H17)." },
              { w:'DAS (Double After Split)', d:"Règle autorisant de doubler sur une main issue d'un split. Favorable pour le joueur (~0.14%)." },
              { w:'Déviations', d:"Ajustements à la stratégie de base en fonction du True Count. Les Illustrious 18 de Schlesinger sont les 18 déviations les plus rentables." },
              { w:'Double Down (Doubler)', d:"Doubler sa mise initiale en échange d'une et une seule carte supplémentaire. Disponible sur les deux premières cartes (parfois uniquement sur 10 ou 11 selon le casino)." },
              { w:'EV (Expected Value)', d:"Espérance mathématique de gain ou perte sur chaque mise. Un EV positif signifie un avantage joueur. S'exprime en % ou en montant par heure." },
              { w:'ENHC (European No Hole Card)', d:"Règle où le croupier ne reçoit sa deuxième carte qu'après que tous les joueurs aient joué. En cas de blackjack croupier, le joueur perd toutes ses mises (initiale + doubles/splits)." },
              { w:'Fab 4', d:"Les 4 surrenders conditionnels Hi-Lo identifiés par Don Schlesinger : 16v9, 15vA, 15v10, 8,8vA. Ils s'appliquent au-delà d'un seuil de TC." },
              { w:'Floor Count', d:"Méthode de calcul du TC qui arrondit vers le bas (ex : +2.7 → +2, −2.7 → −3). Moins utilisée que la truncation." },
              { w:'H17 (Hit on Soft 17)', d:"Règle où le croupier tire sur A+6. Moins favorable que S17 pour le joueur. Modifie quelques décisions de stratégie de base et les seuils de certaines déviations." },
              { w:'Hard Hand (Main dure)', d:"Main sans As, ou avec un As compté pour 1 (pour ne pas buster). Ex : 10+6 = 16 dur." },
              { w:'Hi-Lo', d:"Système de comptage de cartes. 2-6 = +1, 7-9 = 0, 10-A = −1. Le plus populaire au monde : simple, efficace, bien documenté." },
              { w:'Hole Card (Carte trou)', d:"La deuxième carte du croupier, face cachée (blackjack américain). Inexistante en ENHC (No Hole Card)." },
              { w:'House Edge (Avantage maison)', d:"L'avantage mathématique du casino sur le joueur, exprimé en %. Avec stratégie de base parfaite sur 6 jeux ENHC S17 : ~0.45%. Le comptage peut l'inverser à +0.5–1%." },
              { w:'Illustrious 18', d:"Les 18 déviations Hi-Lo les plus rentables, identifiées par Don Schlesinger dans 'Blackjack Attack'. Apprendre ces 18 déviations suffit à capturer l'essentiel du gain lié aux déviations." },
              { w:'Kelly Criterion', d:"Formule mathématique pour calculer la mise optimale : Mise = Bankroll × (Edge / Variance). En pratique, on utilise Half Kelly pour réduire la variance." },
              { w:'LOO (Lose Original Only)', d:"Variante ENHC plus favorable : en cas de BJ croupier, le joueur ne perd que sa mise initiale (doubles/splits remboursés). Réduit l'avantage maison d'environ 0.11%." },
              { w:'Main souple (Soft Hand)', d:"Main avec un As compté pour 11. Ex : As+6 = soft 17. Avantage : on peut tirer sans risque de buster (si on dépasse, l'As repasse à 1)." },
              { w:'Mélange continu (CSM)', d:"Continuous Shuffle Machine. Le casino mélange les cartes en permanence, rendant le comptage inefficace." },
              { w:'N-Zero (N0)', d:"Nombre de mains nécessaires pour que l'EV cumulée dépasse l'écart-type. Le vrai 'long terme'. Typiquement 15 000–25 000 mains pour Hi-Lo." },
              { w:'Paire', d:"Deux cartes de même valeur. Peut être séparée en deux mains distinctes (split)." },
              { w:'Pénétration', d:"Proportion du sabot jouée avant le mélange. 5 jeux sur 6 = 83% de pénétration. Plus c'est élevé, mieux c'est pour le comptage." },
              { w:'Push (Égalité)', d:"Même total entre le joueur et le croupier. La mise est remboursée sans gain ni perte." },
              { w:'RC (Running Count)', d:"La somme cumulée des valeurs Hi-Lo de toutes les cartes vues depuis le dernier mélange." },
              { w:'Risk of Ruin (RoR)', d:"Probabilité de perdre toute sa bankroll avant d'atteindre son objectif. À 300 unités de bankroll, RoR ≈ 5%. Vise moins de 5% pour un jeu sérieux." },
              { w:'RSA (Resplit Aces)', d:"Possibilité de reséparer les As si un autre As est reçu. Règle rare et favorable pour le joueur." },
              { w:'Sabot (Shoe)', d:"Le dispositif contenant plusieurs jeux de cartes mélangés ensemble. Typiquement 6 ou 8 jeux en casino européen." },
              { w:'S17 (Stand on Soft 17)', d:"Règle où le croupier s'arrête sur tous les 17, y compris A+6. La règle la plus favorable pour le joueur." },
              { w:'Spread', d:"Voir Bet Spread." },
              { w:'Split (Séparer)', d:"Séparer une paire en deux mains distinctes, avec une mise égale sur chaque. Obligatoire pour A,A et 8,8. Jamais pour 10,10 et 5,5." },
              { w:'Stand (Rester)', d:"Ne plus demander de carte. La main est figée." },
              { w:'Surrender (Abandonner)', d:"Renoncer à jouer une main contre une mise de 50%. Uniquement en surrender tardif (après que le croupier ait vérifié son blackjack ou, en ENHC, à tout moment)." },
              { w:'TC (True Count)', d:"RC divisé par le nombre de jeux restants dans le sabot. Normalise le count quel que soit l'avancement dans le sabot." },
              { w:'Tapis (Bankroll)', d:"Ton capital total disponible pour jouer au blackjack." },
              { w:'Truncation (Troncature)', d:"Arrondi vers zéro. +2.7 → +2, −2.7 → −2. Méthode recommandée pour le calcul du TC." },
              { w:'Unité', d:"Ta mise minimale de base. Toutes tes mises s'expriment en multiples d'unités. Permet de raisonner indépendamment du montant en euros." },
              { w:'Variance', d:"Mesure de la dispersion des résultats autour de l'espérance. En blackjack, la variance est élevée — même avec un avantage, tu peux perdre plusieurs sessions de suite. N0 quantifie quand l'EV dépasse la variance." },
              { w:'Wonging', d:"Stratégie de back-counting : compter les cartes sans jouer, puis s'asseoir seulement quand le TC est positif. Très efficace mais souvent banni par les casinos (règle 'no mid-shoe entry')." },
            ].map(g => <Term key={g.w} word={g.w}>{g.d}</Term>)}
          </div>

          <div style={{ height:60 }}/>
        </main>
      </div>
    </div>
  );
}
