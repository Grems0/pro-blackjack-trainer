import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>

        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 12px', letterSpacing: -0.5 }}>
          Paiement confirmé !
        </h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>
          Ton abonnement Pro est actif. Tu as maintenant accès à tous les modules — Stratégie de base, Déviations et Simulation Casino.
        </p>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ color: '#444', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Ce qui est débloqué</p>
          {['Module Stratégie de base', 'Module Déviations (I18 + Fab 4)', 'Simulation Casino complète', 'Statistiques de session détaillées', 'Mode révision type Anki'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }} />
              <span style={{ color: '#999', fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>

        <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', color: '#000', fontWeight: 800, fontSize: 15 }}>
          Commencer l'entraînement →
        </Link>

        <p style={{ color: '#333', fontSize: 12, marginTop: 20 }}>
          Un email de confirmation a été envoyé par Stripe.
        </p>
      </div>
    </div>
  );
}
