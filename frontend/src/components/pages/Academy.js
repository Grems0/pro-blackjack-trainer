import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

// ─── Données ──────────────────────────────────────────────────────────────────
const SECTION_IDS = ['bases','enhc','s17h17','strategie','hilo','deviations','betspread','bankroll','modules','parametres','glossaire'];
const SECTION_KEYS = {
  bases: 'academy_sect_bases', enhc: 'academy_sect_enhc', s17h17: 'academy_sect_s17h17',
  strategie: 'academy_sect_strategie', hilo: 'academy_sect_hilo', deviations: 'academy_sect_deviations',
  betspread: 'academy_sect_betspread', bankroll: 'academy_sect_bankroll', modules: 'academy_sect_modules',
  parametres: 'academy_sect_parametres', glossaire: 'academy_sect_glossaire',
};

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
  const { t } = useLang();
  const [activeSection, setActiveSection] = useState('bases');
  const contentRef = useRef(null);
  const SECTIONS = SECTION_IDS.map(id => ({ id, label: t(SECTION_KEYS[id]) }));

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
            <Link to="/training" style={{ display:'flex', alignItems:'center', justifyContent:'center',
              width:36, height:36, background:'rgba(255,255,255,0.05)', borderRadius:8,
              border:'1px solid #1e1e1e', textDecoration:'none' }}>
              <ArrowLeft size={16} color="#fff"/>
            </Link>
            <div>
              <h1 style={{ color:'#fff', fontSize:17, fontWeight:800, margin:0 }}>{t('academy_title')}</h1>
              <p style={{ color:'#444', fontSize:11, margin:0 }}>{t('academy_subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', gap:32, padding:'32px 24px' }}>

        {/* Sidebar navigation */}
        <aside style={{ width:200, flexShrink:0, position:'sticky', top:88, alignSelf:'flex-start', height:'fit-content' }}>
          <p style={{ color:'#333', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, margin:'0 0 12px' }}>{t('academy_toc')}</p>
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

          {/* 1. BASES */}
          <SectionAnchor id="bases"/>
          <H2>{t('acad_bases_h2')}</H2>
          <P>{t('acad_bases_intro')}</P>

          <H3>{t('acad_bases_cards_h3')}</H3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
            {[
              { cards: t('acad_bases_card_2_9'), val: t('acad_bases_card_2_9_val') },
              { cards: t('acad_bases_card_10'),  val: t('acad_bases_card_10_val') },
              { cards: t('acad_bases_card_ace'), val: t('acad_bases_card_ace_val') },
            ].map(r => (
              <div key={r.cards} style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:8, padding:'12px 14px' }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:14, margin:'0 0 4px' }}>{r.cards}</p>
                <p style={{ color:'#555', fontSize:12, margin:0 }}>{r.val}</p>
              </div>
            ))}
          </div>

          <H3>{t('acad_bases_deal_h3')}</H3>
          <P>{t('acad_bases_deal_p1')}<strong style={{color:'#e0e0e0'}}>{t('acad_bases_deal_p1_strong')}</strong>{t('acad_bases_deal_p1_end')}</P>

          <H3>{t('acad_bases_actions_h3')}</H3>
          {[
            { action: t('acad_bases_action_hit'),       desc: t('acad_bases_action_hit_desc') },
            { action: t('acad_bases_action_stand'),     desc: t('acad_bases_action_stand_desc') },
            { action: t('acad_bases_action_double'),    desc: t('acad_bases_action_double_desc') },
            { action: t('acad_bases_action_split'),     desc: t('acad_bases_action_split_desc') },
            { action: t('acad_bases_action_surrender'), desc: t('acad_bases_action_surrender_desc') },
            { action: t('acad_bases_action_insurance'), desc: t('acad_bases_action_insurance_desc') },
          ].map(r => (
            <div key={r.action} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.action}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>{t('acad_bases_results_h3')}</H3>
          <P><strong style={{color:'#e0e0e0'}}>{t('acad_bases_result_bj')}</strong>{t('acad_bases_result_bj_desc')}</P>
          <P><strong style={{color:'#e0e0e0'}}>{t('acad_bases_result_win')}</strong>{t('acad_bases_result_win_desc')}</P>
          <P><strong style={{color:'#e0e0e0'}}>{t('acad_bases_result_bust')}</strong>{t('acad_bases_result_bust_desc')}</P>
          <P><strong style={{color:'#e0e0e0'}}>{t('acad_bases_result_push')}</strong>{t('acad_bases_result_push_desc')}</P>

          <Div/>

          {/* 2. ENHC */}
          <SectionAnchor id="enhc"/>
          <H2>{t('acad_enhc_h2')}</H2>
          <P><strong style={{color:'#e0e0e0'}}>{t('acad_enhc_intro_strong')}</strong>{t('acad_enhc_intro')}</P>

          <H3>{t('acad_enhc_changes_h3')}</H3>
          <Block color="amber" title={t('acad_enhc_us_title')}>
            {t('acad_enhc_us_desc')}
          </Block>
          <Block color="red" title={t('acad_enhc_eu_title')}>
            {t('acad_enhc_eu_desc_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_enhc_eu_desc_strong')}</strong>{t('acad_enhc_eu_desc_mid')}<strong style={{color:'#e0e0e0'}}>{t('acad_enhc_eu_desc_strong2')}</strong>{t('acad_enhc_eu_desc_end')}
          </Block>

          <H3>{t('acad_enhc_impact_h3')}</H3>
          <P>{t('acad_enhc_impact_p')}</P>
          {[
            { main: t('acad_enhc_hand1'), us: t('acad_enhc_hand1_us'), enhc: t('acad_enhc_hand1_enhc'), why: t('acad_enhc_hand1_why') },
            { main: t('acad_enhc_hand2'), us: t('acad_enhc_hand2_us'), enhc: t('acad_enhc_hand2_enhc'), why: t('acad_enhc_hand2_why') },
            { main: t('acad_enhc_hand3'), us: t('acad_enhc_hand3_us'), enhc: t('acad_enhc_hand3_enhc'), why: t('acad_enhc_hand3_why') },
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

          <Block color="blue" title={t('acad_enhc_loo_title')}>
            {t('acad_enhc_loo_desc')}
          </Block>

          <Div/>

          {/* 3. S17 vs H17 */}
          <SectionAnchor id="s17h17"/>
          <H2>{t('acad_s17h17_h2')}</H2>
          <P>{t('acad_s17h17_intro_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_s17h17_intro_strong')}</strong>{t('acad_s17h17_intro_end')}</P>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <Block color="green" title={t('acad_s17h17_s17_title')}>
              {t('acad_s17h17_s17_desc_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_s17h17_s17_desc_strong')}</strong>{t('acad_s17h17_s17_desc_end')}
            </Block>
            <Block color="amber" title={t('acad_s17h17_h17_title')}>
              {t('acad_s17h17_h17_desc_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_s17h17_h17_desc_strong')}</strong>{t('acad_s17h17_h17_desc_end')}
            </Block>
          </div>

          <H3>{t('acad_s17h17_diff_h3')}</H3>
          {[
            { situation: t('acad_s17h17_sit1'), s17: t('acad_s17h17_sit1_s17'), h17: t('acad_s17h17_sit1_h17'), why: t('acad_s17h17_sit1_why') },
            { situation: t('acad_s17h17_sit2'), s17: t('acad_s17h17_sit2_s17'), h17: t('acad_s17h17_sit2_h17'), why: t('acad_s17h17_sit2_why') },
            { situation: t('acad_s17h17_sit3'), s17: t('acad_s17h17_sit3_s17'), h17: t('acad_s17h17_sit3_h17'), why: t('acad_s17h17_sit3_why') },
            { situation: t('acad_s17h17_sit4'), s17: t('acad_s17h17_sit4_s17'), h17: t('acad_s17h17_sit4_h17'), why: t('acad_s17h17_sit4_why') },
          ].map(r => (
            <div key={r.situation} style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 1.5fr', gap:12, alignItems:'center', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'10px 14px', marginBottom:6 }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:12, margin:0 }}>{r.situation}</p>
              <div><p style={{ color:'#4ade80', fontSize:12, fontWeight:700, margin:0 }}>S17 : {r.s17}</p></div>
              <div><p style={{ color:'#c9a84c', fontSize:12, fontWeight:700, margin:0 }}>H17 : {r.h17}</p></div>
              <p style={{ color:'#555', fontSize:11, margin:0 }}>{r.why}</p>
            </div>
          ))}

          <Div/>

          {/* 4. STRATÉGIE DE BASE */}
          <SectionAnchor id="strategie"/>
          <H2>{t('acad_strat_h2')}</H2>
          <P>{t('acad_strat_p1')}</P>
          <P>{t('acad_strat_p2_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_strat_p2_strong')}</strong>{t('acad_strat_p2_end')}</P>

          <H3>{t('acad_strat_hands_h3')}</H3>
          <Block color="blue" title={t('acad_strat_hard_title')}>
            {t('acad_strat_hard_desc_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_strat_hard_desc_strong')}</strong>{t('acad_strat_hard_desc_end')}
          </Block>
          <Block color="green" title={t('acad_strat_soft_title')}>
            {t('acad_strat_soft_desc_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_strat_soft_desc_strong')}</strong>{t('acad_strat_soft_desc_end')}
          </Block>
          <Block color="purple" title={t('acad_strat_pair_title')}>
            {t('acad_strat_pair_desc')}
          </Block>

          <H3>{t('acad_strat_keys_h3')}</H3>
          {[
            { rule: t('acad_strat_rule1'), why: t('acad_strat_rule1_why') },
            { rule: t('acad_strat_rule2'), why: t('acad_strat_rule2_why') },
            { rule: t('acad_strat_rule3'), why: t('acad_strat_rule3_why') },
            { rule: t('acad_strat_rule4'), why: t('acad_strat_rule4_why') },
            { rule: t('acad_strat_rule5'), why: t('acad_strat_rule5_why') },
            { rule: t('acad_strat_rule6'), why: t('acad_strat_rule6_why') },
            { rule: t('acad_strat_rule7'), why: t('acad_strat_rule7_why') },
          ].map(r => (
            <div key={r.rule} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #111' }}>
              <span style={{ color:'#c9a84c', flexShrink:0, fontSize:14, marginTop:1 }}>›</span>
              <div>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 3px' }}>{r.rule}</p>
                <p style={{ color:'#555', fontSize:12, margin:0 }}>{r.why}</p>
              </div>
            </div>
          ))}

          <Block color="amber" title={t('acad_strat_ds_title')}>
            {t('acad_strat_ds_desc_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_strat_ds_desc_strong')}</strong>{t('acad_strat_ds_desc_end')}
          </Block>
          <Block color="red" title={t('acad_strat_rh_title')}>
            {t('acad_strat_rh_desc')}
          </Block>

          <Div/>

          {/* 5. HI-LO */}
          <SectionAnchor id="hilo"/>
          <H2>{t('acad_hilo_h2')}</H2>
          <P>{t('acad_hilo_intro')}</P>

          <H3>{t('acad_hilo_why_h3')}</H3>
          <P>{t('acad_hilo_why_p1_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_hilo_why_p1_strong')}</strong>{t('acad_hilo_why_p1_end')}</P>
          <P>{t('acad_hilo_why_p2')}</P>

          <H3>{t('acad_hilo_vals_h3')}</H3>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {[
              { cards:['2','3','4','5','6'], val:'+1', color:'#4ade80', bg:'rgba(74,222,128,0.08)', b:'rgba(74,222,128,0.2)', label: t('acad_hilo_low_label') },
              { cards:['7','8','9'],        val:'0',  color:'#666',    bg:'rgba(255,255,255,0.03)', b:'rgba(255,255,255,0.08)', label: t('acad_hilo_neutral_label') },
              { cards:['10','V','D','R','A'], val:'−1', color:'#f87171', bg:'rgba(248,113,113,0.08)', b:'rgba(248,113,113,0.2)', label: t('acad_hilo_high_label') },
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

          <H3>{t('acad_hilo_rc_h3')}</H3>
          <P>{t('acad_hilo_rc_p')}</P>
          <Block color="gray" title={t('acad_hilo_rc_example_title')}>
            {t('acad_hilo_rc_example').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
            <strong style={{color:'#e0e0e0'}}>+1</strong>
          </Block>
          <P>{t('acad_hilo_rc_p2')}</P>

          <H3>{t('acad_hilo_tc_h3')}</H3>
          <P>{t('acad_hilo_tc_p1')}</P>
          <Formula>{t('acad_hilo_tc_formula')}</Formula>
          <P>{t('acad_hilo_tc_p2')}</P>
          <Block color="green" title={t('acad_hilo_tc_example_title')}>
            {t('acad_hilo_tc_example').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
            <strong style={{color:'#e0e0e0'}}>+2</strong> {t('acad_hilo_tc_example_end')}
          </Block>

          <H3>{t('acad_hilo_methods_h3')}</H3>
          {[
            { m: t('acad_hilo_method_trunc'), desc: t('acad_hilo_method_trunc_desc'), rec: true },
            { m: t('acad_hilo_method_floor'),  desc: t('acad_hilo_method_floor_desc'), rec: false },
            { m: t('acad_hilo_method_round'),  desc: t('acad_hilo_method_round_desc'), rec: false },
          ].map(r => (
            <div key={r.m} style={{ background:'#0e0e0e', border:`1px solid ${r.rec ? 'rgba(74,222,128,0.25)' : '#1a1a1a'}`, borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:0 }}>{r.m}</p>
                {r.rec && <Tag color="green">{t('acad_hilo_recommended')}</Tag>}
              </div>
              <p style={{ color:'#555', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>{t('acad_hilo_pen_h3')}</H3>
          <P>{t('acad_hilo_pen_p1_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_hilo_pen_p1_strong')}</strong>{t('acad_hilo_pen_p1_end')}</P>
          <P>{t('acad_hilo_pen_p2')}</P>

          <Div/>

          {/* 6. DÉVIATIONS */}
          <SectionAnchor id="deviations"/>
          <H2>{t('acad_dev_h2')}</H2>
          <P>{t('acad_dev_intro_pre')}<em>{t('acad_dev_intro_em')}</em>{t('acad_dev_intro_end')}<strong style={{color:'#e0e0e0'}}>{t('acad_dev_intro_strong')}</strong>{t('acad_dev_intro_end2')}</P>

          <H3>{t('acad_dev_i18_h3')}</H3>
          <P>{t('acad_dev_i18_p')}</P>

          <H3>{t('acad_dev_up_h3')}</H3>
          <P>{t('acad_dev_up_p')}</P>
          {[
            { dev: t('acad_dev_up1_dev'), base: t('acad_dev_up1_base'), deviation: t('acad_dev_up1_deviation'), tc: t('acad_dev_up1_tc'), why: t('acad_dev_up1_why') },
            { dev: t('acad_dev_up2_dev'), base: t('acad_dev_up2_base'), deviation: t('acad_dev_up2_deviation'), tc: t('acad_dev_up2_tc'), why: t('acad_dev_up2_why') },
            { dev: t('acad_dev_up3_dev'), base: t('acad_dev_up3_base'), deviation: t('acad_dev_up3_deviation'), tc: t('acad_dev_up3_tc'), why: t('acad_dev_up3_why') },
            { dev: t('acad_dev_up4_dev'), base: t('acad_dev_up4_base'), deviation: t('acad_dev_up4_deviation'), tc: t('acad_dev_up4_tc'), why: t('acad_dev_up4_why') },
            { dev: t('acad_dev_up5_dev'), base: t('acad_dev_up5_base'), deviation: t('acad_dev_up5_deviation'), tc: t('acad_dev_up5_tc'), why: t('acad_dev_up5_why') },
            { dev: t('acad_dev_up6_dev'), base: t('acad_dev_up6_base'), deviation: t('acad_dev_up6_deviation'), tc: t('acad_dev_up6_tc'), why: t('acad_dev_up6_why') },
          ].map(r => (
            <div key={r.dev} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.dev}</p>
                  <p style={{ color:'#555', fontSize:12, margin:0 }}>{t('acad_dev_base_lbl')} : <span style={{color:'#aaa'}}>{r.base}</span> → {t('acad_dev_dev_lbl')} : <span style={{color:'#4ade80', fontWeight:700}}>{r.deviation}</span></p>
                </div>
                <Tag color="green">{r.tc}</Tag>
              </div>
              <p style={{ color:'#555', fontSize:11, lineHeight:1.6, margin:'8px 0 0' }}>{r.why}</p>
            </div>
          ))}

          <H3>{t('acad_dev_down_h3')}</H3>
          <P>{t('acad_dev_down_p')}</P>
          {[
            { dev: t('acad_dev_down1_dev'), base: t('acad_dev_down1_base'), deviation: t('acad_dev_down1_deviation'), tc: t('acad_dev_down1_tc'), why: t('acad_dev_down1_why') },
            { dev: t('acad_dev_down2_dev'), base: t('acad_dev_down2_base'), deviation: t('acad_dev_down2_deviation'), tc: t('acad_dev_down2_tc'), why: t('acad_dev_down2_why') },
            { dev: t('acad_dev_down3_dev'), base: t('acad_dev_down3_base'), deviation: t('acad_dev_down3_deviation'), tc: t('acad_dev_down3_tc'), why: t('acad_dev_down3_why') },
            { dev: t('acad_dev_down4_dev'), base: t('acad_dev_down4_base'), deviation: t('acad_dev_down4_deviation'), tc: t('acad_dev_down4_tc'), why: t('acad_dev_down4_why') },
          ].map(r => (
            <div key={r.dev} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.dev}</p>
                  <p style={{ color:'#555', fontSize:12, margin:0 }}>{t('acad_dev_base_lbl')} : <span style={{color:'#aaa'}}>{r.base}</span> → {t('acad_dev_dev_lbl')} : <span style={{color:'#f87171', fontWeight:700}}>{r.deviation}</span></p>
                </div>
                <Tag color="red">{r.tc}</Tag>
              </div>
              <p style={{ color:'#555', fontSize:11, lineHeight:1.6, margin:'8px 0 0' }}>{r.why}</p>
            </div>
          ))}

          <H3>{t('acad_dev_fab4_h3')}</H3>
          <P>{t('acad_dev_fab4_p')}</P>
          {[
            { hand: t('acad_dev_fab1_hand'), tc: t('acad_dev_fab1_tc'), why: t('acad_dev_fab1_why') },
            { hand: t('acad_dev_fab2_hand'), tc: t('acad_dev_fab2_tc'), why: t('acad_dev_fab2_why') },
            { hand: t('acad_dev_fab3_hand'), tc: t('acad_dev_fab3_tc'), why: t('acad_dev_fab3_why') },
            { hand: t('acad_dev_fab4_hand'), tc: t('acad_dev_fab4_tc'), why: t('acad_dev_fab4_why') },
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

          {/* 7. BET SPREAD */}
          <SectionAnchor id="betspread"/>
          <H2>{t('acad_bet_h2')}</H2>
          <P>{t('acad_bet_p1_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bet_p1_strong')}</strong>{t('acad_bet_p1_end')}</P>

          <H3>{t('acad_bet_spread_h3')}</H3>
          <P>{t('acad_bet_spread_p_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bet_spread_p_strong')}</strong>{t('acad_bet_spread_p_end')}</P>

          <H3>{t('acad_bet_units_h3')}</H3>
          <P>{t('acad_bet_units_p_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bet_units_p_strong')}</strong>{t('acad_bet_units_p_end')}</P>

          <H3>{t('acad_bet_table_h3')}</H3>
          <div style={{ overflowX:'auto', marginBottom:16 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e1e1e' }}>
                  {[t('acad_bet_col_tc'), t('acad_bet_col_edge'), t('acad_bet_col_bet'), t('acad_bet_col_action')].map(h => (
                    <th key={h} style={{ color:'#444', fontWeight:700, padding:'8px 12px', textAlign:'left', textTransform:'uppercase', fontSize:10, letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { tc: t('acad_bet_row1_tc'), edge: t('acad_bet_row1_edge'), mise: t('acad_bet_row1_bet'), action: t('acad_bet_row1_action'), color:'#f87171' },
                  { tc: t('acad_bet_row2_tc'), edge: t('acad_bet_row2_edge'), mise: t('acad_bet_row2_bet'), action: t('acad_bet_row2_action'), color:'#888' },
                  { tc: t('acad_bet_row3_tc'), edge: t('acad_bet_row3_edge'), mise: t('acad_bet_row3_bet'), action: t('acad_bet_row3_action'), color:'#4ade80' },
                  { tc: t('acad_bet_row4_tc'), edge: t('acad_bet_row4_edge'), mise: t('acad_bet_row4_bet'), action: t('acad_bet_row4_action'), color:'#4ade80' },
                  { tc: t('acad_bet_row5_tc'), edge: t('acad_bet_row5_edge'), mise: t('acad_bet_row5_bet'), action: t('acad_bet_row5_action'), color:'#4ade80' },
                  { tc: t('acad_bet_row6_tc'), edge: t('acad_bet_row6_edge'), mise: t('acad_bet_row6_bet'), action: t('acad_bet_row6_action'), color:'#4ade80' },
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

          <H3>{t('acad_bet_das_h3')}</H3>
          <P>{t('acad_bet_das_p')}</P>

          <H3>{t('acad_bet_rsa_h3')}</H3>
          <P>{t('acad_bet_rsa_p')}</P>

          <Div/>

          {/* 8. BANKROLL */}
          <SectionAnchor id="bankroll"/>
          <H2>{t('acad_bank_h2')}</H2>
          <P>{t('acad_bank_intro')}</P>

          <H3>{t('acad_bank_ev_h3')}</H3>
          <P>{t('acad_bank_ev_p_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bank_ev_p_strong')}</strong>{t('acad_bank_ev_p_end')}</P>
          <Formula>{t('acad_bank_ev_formula')}</Formula>
          <P>{t('acad_bank_ev_example_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bank_ev_example_strong')}</strong></P>

          <H3>{t('acad_bank_ror_h3')}</H3>
          <P>{t('acad_bank_ror_p1_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bank_ror_p1_strong')}</strong>{t('acad_bank_ror_p1_end')}</P>
          <P>{t('acad_bank_ror_p2_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bank_ror_p2_strong')}</strong>{t('acad_bank_ror_p2_end')}</P>
          {[
            { br: t('acad_bank_ror1_br'), ror: t('acad_bank_ror1_ror'), risk: t('acad_bank_ror1_risk') },
            { br: t('acad_bank_ror2_br'), ror: t('acad_bank_ror2_ror'), risk: t('acad_bank_ror2_risk') },
            { br: t('acad_bank_ror3_br'), ror: t('acad_bank_ror3_ror'), risk: t('acad_bank_ror3_risk') },
          ].map((r, i) => (
            <div key={r.br} style={{ display:'flex', gap:16, alignItems:'center', padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:6, marginBottom:6 }}>
              <span style={{ color:'#e0e0e0', fontWeight:700, fontSize:13 }}>{r.br}</span>
              <span style={{ color: i === 2 ? '#4ade80' : i === 1 ? '#c9a84c' : '#f87171', fontWeight:700 }}>RoR {r.ror}</span>
              <span style={{ color:'#555', fontSize:12 }}>{r.risk}</span>
            </div>
          ))}

          <H3>{t('acad_bank_n0_h3')}</H3>
          <P>{t('acad_bank_n0_p1_pre')}<strong style={{color:'#e0e0e0'}}>{t('acad_bank_n0_p1_strong')}</strong>{t('acad_bank_n0_p1_end')}</P>
          <Formula>{t('acad_bank_n0_formula')}</Formula>
          <P>{t('acad_bank_n0_p2')}</P>

          <H3>{t('acad_bank_kelly_h3')}</H3>
          <P>{t('acad_bank_kelly_p')}</P>
          <Formula>{t('acad_bank_kelly_formula')}</Formula>
          {[
            { k: t('acad_bank_kelly1'), desc: t('acad_bank_kelly1_desc'), rec: false },
            { k: t('acad_bank_kelly2'), desc: t('acad_bank_kelly2_desc'), rec: true },
            { k: t('acad_bank_kelly3'), desc: t('acad_bank_kelly3_desc'), rec: false },
          ].map(r => (
            <div key={r.k} style={{ background:'#0e0e0e', border:`1px solid ${r.rec ? 'rgba(74,222,128,0.25)' : '#1a1a1a'}`, borderRadius:8, padding:'12px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:0 }}>{r.k}</p>
                {r.rec && <Tag color="green">{t('acad_hilo_recommended')}</Tag>}
              </div>
              <p style={{ color:'#555', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <Div/>

          {/* 9. MODULES */}
          <SectionAnchor id="modules"/>
          <H2>{t('acad_mods_h2')}</H2>

          {[
            {
              name: t('acad_mod_rc_name'), color:'green',
              desc: t('acad_mod_rc_desc'),
              tips: [t('acad_mod_rc_tip1'), t('acad_mod_rc_tip2'), t('acad_mod_rc_tip3')],
            },
            {
              name: t('acad_mod_tc_name'), color:'blue',
              desc: t('acad_mod_tc_desc'),
              tips: [t('acad_mod_tc_tip1'), t('acad_mod_tc_tip2'), t('acad_mod_tc_tip3')],
            },
            {
              name: t('acad_mod_bs_name'), color:'amber',
              desc: t('acad_mod_bs_desc'),
              tips: [t('acad_mod_bs_tip1'), t('acad_mod_bs_tip2'), t('acad_mod_bs_tip3')],
            },
            {
              name: t('acad_mod_dev_name'), color:'purple',
              desc: t('acad_mod_dev_desc'),
              tips: [t('acad_mod_dev_tip1'), t('acad_mod_dev_tip2'), t('acad_mod_dev_tip3')],
            },
            {
              name: t('acad_mod_sim_name'), color:'amber',
              desc: t('acad_mod_sim_desc'),
              tips: [t('acad_mod_sim_tip1'), t('acad_mod_sim_tip2'), t('acad_mod_sim_tip3')],
            },
          ].map(m => (
            <div key={m.name} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:12, padding:'20px', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <h3 style={{ color:'#fff', fontSize:16, fontWeight:800, margin:0 }}>{m.name}</h3>
                <Tag color={m.color}>{t('acad_mod_module_lbl')}</Tag>
              </div>
              <P>{m.desc}</P>
              <div style={{ marginTop:10 }}>
                <p style={{ color:'#444', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, margin:'0 0 8px' }}>{t('acad_mod_tips_lbl')}</p>
                {m.tips.map((tip, i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}>
                    <span style={{ color:'#c9a84c', flexShrink:0, fontSize:13 }}>›</span>
                    <p style={{ color:'#666', fontSize:12, lineHeight:1.6, margin:0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Div/>

          {/* 10. PARAMÈTRES */}
          <SectionAnchor id="parametres"/>
          <H2>{t('acad_params_h2')}</H2>

          <H3>{t('acad_params_player_h3')}</H3>
          {[
            { param: t('acad_params_p1_param'), desc: t('acad_params_p1_desc') },
            { param: t('acad_params_p2_param'), desc: t('acad_params_p2_desc') },
            { param: t('acad_params_p3_param'), desc: t('acad_params_p3_desc') },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>{t('acad_params_table_h3')}</H3>
          {[
            { param: t('acad_params_t1_param'), desc: t('acad_params_t1_desc') },
            { param: t('acad_params_t2_param'), desc: t('acad_params_t2_desc') },
            { param: t('acad_params_t3_param'), desc: t('acad_params_t3_desc') },
            { param: t('acad_params_t4_param'), desc: t('acad_params_t4_desc') },
            { param: t('acad_params_t5_param'), desc: t('acad_params_t5_desc') },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>{t('acad_params_bet_h3')}</H3>
          {[
            { param: t('acad_params_b1_param'), desc: t('acad_params_b1_desc') },
            { param: t('acad_params_b2_param'), desc: t('acad_params_b2_desc') },
            { param: t('acad_params_b3_param'), desc: t('acad_params_b3_desc') },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <H3>{t('acad_params_add_h3')}</H3>
          {[
            { param: t('acad_params_a1_param'), desc: t('acad_params_a1_desc') },
            { param: t('acad_params_a2_param'), desc: t('acad_params_a2_desc') },
          ].map(r => (
            <div key={r.param} style={{ padding:'12px 0', borderBottom:'1px solid #111' }}>
              <p style={{ color:'#e0e0e0', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{r.param}</p>
              <p style={{ color:'#666', fontSize:12, lineHeight:1.7, margin:0 }}>{r.desc}</p>
            </div>
          ))}

          <Div/>

          {/* 11. GLOSSAIRE */}
          <SectionAnchor id="glossaire"/>
          <H2>{t('acad_gloss_h2')}</H2>
          <P>{t('acad_gloss_intro')}</P>

          <div style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:12, padding:'4px 20px' }}>
            {[
              { w: t('acad_gloss_ace'),         d: t('acad_gloss_ace_def') },
              { w: t('acad_gloss_action'),       d: t('acad_gloss_action_def') },
              { w: t('acad_gloss_ap'),           d: t('acad_gloss_ap_def') },
              { w: t('acad_gloss_insurance'),    d: t('acad_gloss_insurance_def') },
              { w: t('acad_gloss_backcounting'), d: t('acad_gloss_backcounting_def') },
              { w: t('acad_gloss_betspread'),    d: t('acad_gloss_betspread_def') },
              { w: t('acad_gloss_bj'),           d: t('acad_gloss_bj_def') },
              { w: t('acad_gloss_burncard'),     d: t('acad_gloss_burncard_def') },
              { w: t('acad_gloss_bust'),         d: t('acad_gloss_bust_def') },
              { w: t('acad_gloss_camouflage'),   d: t('acad_gloss_camouflage_def') },
              { w: t('acad_gloss_cd'),           d: t('acad_gloss_cd_def') },
              { w: t('acad_gloss_count'),        d: t('acad_gloss_count_def') },
              { w: t('acad_gloss_croupier'),     d: t('acad_gloss_croupier_def') },
              { w: t('acad_gloss_das'),          d: t('acad_gloss_das_def') },
              { w: t('acad_gloss_deviations'),   d: t('acad_gloss_deviations_def') },
              { w: t('acad_gloss_double'),       d: t('acad_gloss_double_def') },
              { w: t('acad_gloss_ev'),           d: t('acad_gloss_ev_def') },
              { w: t('acad_gloss_enhc'),         d: t('acad_gloss_enhc_def') },
              { w: t('acad_gloss_fab4'),         d: t('acad_gloss_fab4_def') },
              { w: t('acad_gloss_floorcount'),   d: t('acad_gloss_floorcount_def') },
              { w: t('acad_gloss_h17'),          d: t('acad_gloss_h17_def') },
              { w: t('acad_gloss_hardhand'),     d: t('acad_gloss_hardhand_def') },
              { w: t('acad_gloss_hilo'),         d: t('acad_gloss_hilo_def') },
              { w: t('acad_gloss_holecard'),     d: t('acad_gloss_holecard_def') },
              { w: t('acad_gloss_houseedge'),    d: t('acad_gloss_houseedge_def') },
              { w: t('acad_gloss_illustrious'),  d: t('acad_gloss_illustrious_def') },
              { w: t('acad_gloss_kelly'),        d: t('acad_gloss_kelly_def') },
              { w: t('acad_gloss_loo'),          d: t('acad_gloss_loo_def') },
              { w: t('acad_gloss_softhand'),     d: t('acad_gloss_softhand_def') },
              { w: t('acad_gloss_csm'),          d: t('acad_gloss_csm_def') },
              { w: t('acad_gloss_n0'),           d: t('acad_gloss_n0_def') },
              { w: t('acad_gloss_pair'),         d: t('acad_gloss_pair_def') },
              { w: t('acad_gloss_penetration'),  d: t('acad_gloss_penetration_def') },
              { w: t('acad_gloss_push'),         d: t('acad_gloss_push_def') },
              { w: t('acad_gloss_rc'),           d: t('acad_gloss_rc_def') },
              { w: t('acad_gloss_ror'),          d: t('acad_gloss_ror_def') },
              { w: t('acad_gloss_rsa'),          d: t('acad_gloss_rsa_def') },
              { w: t('acad_gloss_shoe'),         d: t('acad_gloss_shoe_def') },
              { w: t('acad_gloss_s17'),          d: t('acad_gloss_s17_def') },
              { w: t('acad_gloss_spread'),       d: t('acad_gloss_spread_def') },
              { w: t('acad_gloss_split'),        d: t('acad_gloss_split_def') },
              { w: t('acad_gloss_stand'),        d: t('acad_gloss_stand_def') },
              { w: t('acad_gloss_surrender'),    d: t('acad_gloss_surrender_def') },
              { w: t('acad_gloss_tc'),           d: t('acad_gloss_tc_def') },
              { w: t('acad_gloss_bankroll'),     d: t('acad_gloss_bankroll_def') },
              { w: t('acad_gloss_truncation'),   d: t('acad_gloss_truncation_def') },
              { w: t('acad_gloss_unit'),         d: t('acad_gloss_unit_def') },
              { w: t('acad_gloss_variance'),     d: t('acad_gloss_variance_def') },
              { w: t('acad_gloss_wonging'),      d: t('acad_gloss_wonging_def') },
            ].map(g => <Term key={g.w} word={g.w}>{g.d}</Term>)}
          </div>

          <div style={{ height:60 }}/>
        </main>
      </div>
    </div>
  );
}
