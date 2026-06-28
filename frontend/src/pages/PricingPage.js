import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Check, X, Zap, Crown, ChevronDown, ChevronUp } from 'lucide-react';

const FEATURES = [
  { label: 'Module Running Count',                        free: true,  pro: true  },
  { label: 'Module Stratégie de base',                    free: true,  pro: true  },
  { label: 'Academy (toute la théorie)',                  free: true,  pro: true  },
  { label: 'Tableaux de stratégie S17/H17',               free: true,  pro: true  },
  { label: 'Module True Count',                           free: false, pro: true  },
  { label: 'Module Déviations (Illustrious 18 + Fab 4)', free: false, pro: true  },
  { label: 'Simulation Casino — paramètres joueur',       free: false, pro: true  },
  { label: 'Simulation Casino — règles de la table',      free: false, pro: true  },
  { label: 'Simulation Casino — grille de mises',         free: false, pro: true  },
  { label: 'Statistiques EV de session',                  free: false, pro: true  },
  { label: 'Mode révision type Anki',                     free: false, pro: true  },
];

const FAQS = [
  {
    q: 'Puis-je annuler à tout moment ?',
    a: "Oui. L'abonnement mensuel peut être annulé avant la prochaine date de facturation, sans frais. L'annuel est remboursable dans les 14 jours suivant l'achat.",
  },
  {
    q: "Quelle est la différence entre l'abonnement mensuel et annuel ?",
    a: "Les fonctionnalités sont identiques. L'annuel est facturé en une seule fois (99 €) et revient à 8,25 €/mois — soit une économie de 57 € par rapport au mensuel.",
  },
  {
    q: "À qui s'adresse Pro Blackjack Trainer ?",
    a: "Aux joueurs sérieux qui veulent maîtriser le comptage de cartes Hi-Lo en ENHC. Que tu démarres ou que tu affines ta technique, les modules couvrent tout — du Running Count à la Simulation Casino.",
  },
  {
    q: 'Est-ce que le plan gratuit restera gratuit ?',
    a: "Oui. Les modules Running Count et True Count ainsi que l'Academy restent gratuits indéfiniment.",
  },
  {
    q: 'Puis-je passer du mensuel à l\'annuel plus tard ?',
    a: "Oui, tu peux changer de formule à tout moment depuis le portail client Stripe. Le solde restant est automatiquement appliqué en crédit.",
  },
];

function PlanCard({ billing, onSubscribe, loading }) {
  const isAnnual = billing === 'annual';
  const monthlyPrice = 12.99;
  const annualTotal  = 99;
  const annualMonthly = (annualTotal / 12).toFixed(2);
  const saving = Math.round((1 - annualTotal / (monthlyPrice * 12)) * 100);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
      border: '1px solid rgba(201,168,76,0.35)',
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 0 40px rgba(201,168,76,0.08)',
      flex: 1,
      maxWidth: 420,
    }}>
      {/* Glow top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

      {/* Badge */}
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={18} color="#c9a84c" />
            </div>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Pro</span>
          </div>
          {isAnnual && (
            <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '4px 12px', color: '#c9a84c', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
              -{saving}% sur l'année
            </span>
          )}
        </div>

        {/* Prix */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ color: '#c9a84c', fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>
              {isAnnual ? annualMonthly : monthlyPrice.toFixed(2)}
            </span>
            <span style={{ color: '#555', fontSize: 16 }}>€</span>
            <span style={{ color: '#555', fontSize: 14, marginLeft: 2 }}>/mois</span>
          </div>
          {isAnnual && (
            <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>
              Facturé {annualTotal} € par an · économise 57 €
            </p>
          )}
          {!isAnnual && (
            <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>
              Facturé {monthlyPrice.toFixed(2)} € par mois · annulable à tout moment
            </p>
          )}
        </div>

        <p style={{ color: '#666', fontSize: 13, margin: '12px 0 20px', lineHeight: 1.5 }}>
          Accès complet aux 5 modules, statistiques de session et mode révision Anki.
        </p>

        {/* CTA */}
        <button
          onClick={() => onSubscribe(isAnnual ? 'annual' : 'monthly')}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: loading ? '#333' : 'linear-gradient(135deg, #c9a84c, #a8823a)',
            border: 'none', color: '#000', fontWeight: 800, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity .15s', letterSpacing: 0.3,
            marginBottom: 20,
          }}
        >
          {loading ? 'Chargement…' : `S'abonner ${isAnnual ? 'à l\'annuel' : 'au mensuel'} →`}
        </button>
      </div>

      {/* Features */}
      <div style={{ borderTop: '1px solid #1e1e1e', padding: '20px 28px 24px' }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.pro ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {f.pro ? <Check size={11} color="#4ade80" strokeWidth={3} /> : <X size={11} color="#444" strokeWidth={3} />}
            </div>
            <span style={{ color: f.pro ? '#ccc' : '#444', fontSize: 13 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreeCard() {
  return (
    <div style={{
      background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 20,
      overflow: 'hidden', flex: 1, maxWidth: 380,
    }}>
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#4ade80" />
          </div>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Gratuit</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ color: '#4ade80', fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>0</span>
          <span style={{ color: '#555', fontSize: 16 }}>€</span>
          <span style={{ color: '#555', fontSize: 14, marginLeft: 2 }}>pour toujours</span>
        </div>
        <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>Sans carte bancaire · sans engagement</p>
        <p style={{ color: '#555', fontSize: 13, margin: '12px 0 20px', lineHeight: 1.5 }}>
          Commence par les bases. Accès permanent aux modules Running Count et Stratégie de base.
        </p>

        <Link to="/" style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: 'transparent', border: '1px solid #2a2a2a',
            color: '#888', fontWeight: 700, fontSize: 14,
            textAlign: 'center', letterSpacing: 0.3, marginBottom: 20,
            cursor: 'pointer',
          }}>
            Commencer gratuitement
          </div>
        </Link>
      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', padding: '20px 28px 24px' }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.free ? 'rgba(74,222,128,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {f.free ? <Check size={11} color="#4ade80" strokeWidth={3} /> : <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />}
            </div>
            <span style={{ color: f.free ? '#888' : '#333', fontSize: 13 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
          >
            <span style={{ color: open === i ? '#e0e0e0' : '#888', fontSize: 14, fontWeight: 600 }}>{faq.q}</span>
            {open === i ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
          </button>
          {open === i && (
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7, margin: '0 0 16px', paddingRight: 28 }}>{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const navigate   = useNavigate();
  const [billing, setBilling] = useState('annual'); // 'monthly' | 'annual'
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const PAYMENT_LINKS = {
    monthly: 'https://buy.stripe.com/3cIfZg8mRg3UgNy72penS01',
    annual:  'https://buy.stripe.com/14A9AS8mRcRI1SE86tenS02',
  };

  const handleSubscribe = (plan) => {
    window.location.href = PAYMENT_LINKS[plan];
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px' }}>
        <div style={{ display: 'inline-block', marginBottom: 16, padding: '4px 14px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20 }}>
          <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Tarifs</span>
        </div>
        <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 900, margin: '0 0 12px', letterSpacing: -1.5, lineHeight: 1.1 }}>
          Maîtrisez le comptage de cartes.<br />
          <span style={{ color: '#c9a84c' }}>Commencez dès aujourd'hui.</span>
        </h1>
        <p style={{ color: '#666', fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Running Count et Stratégie de base gratuits pour démarrer. Pro débloque True Count, Déviations et la Simulation Casino complète.
        </p>

        {/* Toggle mensuel / annuel */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, marginTop: 32, background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 4 }}>
          <button
            onClick={() => setBilling('monthly')}
            style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: billing === 'monthly' ? '#1e1e1e' : 'transparent', color: billing === 'monthly' ? '#fff' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling('annual')}
            style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: billing === 'annual' ? '#1e1e1e' : 'transparent', color: billing === 'annual' ? '#fff' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Annuel
            <span style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 6, padding: '1px 6px', color: '#4ade80', fontSize: 10, fontWeight: 800 }}>-36%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 24px 64px', flexWrap: 'wrap', maxWidth: 960, margin: '0 auto' }}>
        <FreeCard />
        <PlanCard billing={billing} onSubscribe={handleSubscribe} loading={loading} />
      </div>

      {error && (
        <div style={{ textAlign: 'center', marginTop: -40, marginBottom: 32 }}>
          <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Tableau comparatif */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ color: '#444', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 28 }}>Comparaison détaillée</h2>
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, overflow: 'hidden' }}>
          {/* En-tête */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '12px 24px', borderBottom: '1px solid #1a1a1a' }}>
            <span style={{ color: '#333', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Fonctionnalité</span>
            <span style={{ color: '#333', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>Gratuit</span>
            <span style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>Pro</span>
          </div>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '11px 24px', borderBottom: i < FEATURES.length - 1 ? '1px solid #111' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <span style={{ color: '#888', fontSize: 13 }}>{f.label}</span>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {f.free ? <Check size={14} color="#4ade80" strokeWidth={2.5} /> : <span style={{ color: '#2a2a2a', fontSize: 16, lineHeight: 1 }}>—</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {f.pro ? <Check size={14} color="#c9a84c" strokeWidth={2.5} /> : <span style={{ color: '#2a2a2a', fontSize: 16 }}>—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ color: '#444', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 32 }}>Questions fréquentes</h2>
        <FAQ />
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', padding: '48px 24px 80px', borderTop: '1px solid #111' }}>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 20 }}>
          Pas encore convaincu ? Commence gratuitement — pas de carte bancaire requise.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ textDecoration: 'none', padding: '12px 28px', borderRadius: 12, border: '1px solid #222', color: '#888', fontWeight: 700, fontSize: 14 }}>
            Essayer gratuitement
          </Link>
          <button
            onClick={() => handleSubscribe(billing === 'annual' ? 'annual' : 'monthly')}
            disabled={loading}
            style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Chargement…' : 'Démarrer Pro →'}
          </button>
        </div>
      </div>
    </div>
  );
}
