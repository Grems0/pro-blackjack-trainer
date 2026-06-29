import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import Header from '../components/layout/Header';
import PlayerSettings from '../components/settings/PlayerSettings';
import BetSpread from '../components/settings/BetSpread';
import TableRules from '../components/settings/TableRules';
import AdditionalSettings from '../components/settings/AdditionalSettings';
import EVStats from '../components/settings/EVStats';
import TrainingModules from '../components/modules/TrainingModules';
import TrainingModals from '../components/modules/TrainingModals';
import VarianceVisualizer from '../components/visualizer/VarianceVisualizer';
import { useProAccess } from '../hooks/useProAccess';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const isPro = useProAccess();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetToDefaults } = useGame();
  const { t } = useLang();
  const [showVarianceVisualizer, setShowVarianceVisualizer] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#1a1a1d] relative">
      {/* Background texture */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff6b6b' fill-opacity='0.03'%3E%3Cpath d='M20 20l-5-5 5-5 5 5-5 5zm0 10l-5-5 5-5 5 5-5 5z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* ENHC Banner */}
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-emerald-900/20 border border-emerald-800/50">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-600/40 flex-shrink-0">
              <span className="text-emerald-400 font-black text-xs">ENHC</span>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold text-sm">{t('enhc_title')}</p>
              <p className="text-gray-500 text-xs mt-0.5">{t('enhc_desc')}</p>
            </div>
          </div>

          {/* Top Section: Settings Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <PlayerSettings />
              <TableRules />
              <AdditionalSettings />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <BetSpread />
              
              {/* EV Statistics */}
              <div style={{ position: 'relative' }}>
                <div style={{ filter: isPro ? 'none' : 'blur(6px)', pointerEvents: isPro ? 'auto' : 'none', userSelect: isPro ? 'auto' : 'none' }}>
                  <EVStats />
                </div>
                {!isPro && (
                  <div
                    onClick={() => navigate('/pricing')}
                    style={{
                      position: 'absolute', inset: 0, zIndex: 10,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 10, cursor: 'pointer', borderRadius: 12,
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={18} color="#c9a84c" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 800, margin: '0 0 4px' }}>{t('pro_required')}</p>
                      <p style={{ color: '#888', fontSize: 11, margin: '0 0 10px', lineHeight: 1.6, maxWidth: 260 }}>
                        En fonction de tes paramètres du dessus, analyse ta rentabilité : gain attendu par heure, risque de ruine, précision de tes décisions et de tes mises. Pour savoir si ta stratégie est vraiment gagnante.
                      </p>
                      <span style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', color: '#000', fontSize: 12, fontWeight: 800 }}>
                        {t('pro_see_offers')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowVarianceVisualizer(true)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {t('btn_variance')}
                </button>
                
                <button
                  onClick={resetToDefaults}
                  className="w-full py-3 border border-red-500 text-red-500 hover:bg-red-500/10 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  {t('btn_reset')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-800 my-8"></div>
          
          {/* Parcours recommandé */}
          <div className="mb-8" style={{ position: 'relative' }}>
            <div style={{ filter: isPro ? 'none' : 'blur(4px)', pointerEvents: isPro ? 'auto' : 'none', userSelect: isPro ? 'auto' : 'none' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">{t('section_recommended')}</p>
              <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
                {[
                  { step: 1, nameKey: 'mod_rc_name',  subKey: 'mod_rc_sub',  color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)',  pro: false },
                  { step: 2, nameKey: 'mod_tc_name',  subKey: 'mod_tc_sub',  color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  pro: true  },
                  { step: 3, nameKey: 'mod_bs_name',  subKey: 'mod_bs_sub',  color: '#fcd34d', bg: 'rgba(252,211,77,0.08)',  border: 'rgba(252,211,77,0.2)',  pro: false },
                  { step: 4, nameKey: 'mod_dev_name', subKey: 'mod_dev_sub', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)', pro: true  },
                  { step: 5, nameKey: 'mod_sim_name', subKey: 'mod_sim_sub', color: '#f87171', bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.2)', pro: true  },
                ].map((s, i, arr) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'stretch', flex: i === arr.length - 1 ? '1.4' : '1', minWidth: 120 }}>
                    <div style={{
                      flex: 1, background: s.bg, border: `1px solid ${s.border}`,
                      borderRadius: i === 0 ? '10px 0 0 10px' : i === arr.length - 1 ? '0 10px 10px 0' : 0,
                      borderLeft: i > 0 ? 'none' : undefined,
                      padding: '12px 14px', cursor: 'default',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#000', flexShrink: 0 }}>{s.step}</span>
                        <span style={{ color: s.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{t(s.nameKey)}</span>
                        {s.pro && <Lock size={10} color="#c9a84c" style={{ flexShrink: 0 }} />}
                      </div>
                      <p style={{ color: '#444', fontSize: 11, margin: 0, lineHeight: 1.4 }}>{t(s.subKey)}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e0e', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5h6M5 2l3 3-3 3" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {!isPro && (
              <div onClick={() => navigate('/pricing')} style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', borderRadius: 12 }}>
                <div style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(2px)', borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(201,168,76,0.25)' }}>
                  <Lock size={14} color="#c9a84c" />
                  <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 800 }}>{t('section_recommended')} — Pro</span>
                  <span style={{ color: '#888', fontSize: 11 }}>{t('pro_see_offers')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Training Modules Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">{t('section_settings')}</h2>
            <TrainingModules />
          </section>
        </main>
        
        {/* Modals */}
        <TrainingModals />
        
        {/* Variance Visualizer */}
        <VarianceVisualizer
          isOpen={showVarianceVisualizer}
          onClose={() => setShowVarianceVisualizer(false)}
        />

        {/* Statut abonnement */}
        {user && (
          <div style={{ borderTop: '1px solid #111', padding: '16px 24px', background: '#0a0a0a' }}>
            <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPro ? '#4ade80' : '#f87171', flexShrink: 0 }} />
                <span style={{ color: '#666', fontSize: 12 }}>
                  Connecté en tant que <strong style={{ color: '#888' }}>{user.email}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {isPro ? (
                  <>
                    <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 700 }}>
                      ✓ Abonnement Pro actif
                    </span>
                    <span style={{ color: '#444', fontSize: 11 }}>
                      Expire le {new Date(user.expiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {user.plan && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', fontWeight: 700, textTransform: 'capitalize' }}>
                        {user.plan === 'annual' ? 'Annuel' : 'Mensuel'}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span style={{ color: '#f87171', fontSize: 12, fontWeight: 700 }}>Abonnement expiré</span>
                    <button onClick={() => navigate('/pricing')} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer' }}>
                      Renouveler →
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
