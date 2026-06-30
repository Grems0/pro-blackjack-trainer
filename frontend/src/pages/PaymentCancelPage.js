import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: '2px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={40} color="#f87171" />
        </div>

        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 12px', letterSpacing: -0.5 }}>
          Paiement annulé
        </h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>
          Aucun montant n'a été débité. Tu peux réessayer quand tu veux depuis la page des tarifs.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/pricing" style={{ textDecoration: 'none', padding: '13px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', color: '#000', fontWeight: 800, fontSize: 14 }}>
            Voir les tarifs
          </Link>
          <Link to="/training" style={{ textDecoration: 'none', padding: '13px 28px', borderRadius: 12, background: 'transparent', border: '1px solid #222', color: '#888', fontWeight: 700, fontSize: 14 }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
