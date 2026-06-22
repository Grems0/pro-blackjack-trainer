import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword } from '../contexts/AuthContext';

export default function PaymentSuccessPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const pwError = validatePassword(password);
  const rules = [
    { label: '1 majuscule', ok: /[A-Z]/.test(password) },
    { label: '1 minuscule', ok: /[a-z]/.test(password) },
    { label: '1 chiffre',   ok: /[0-9]/.test(password) },
    { label: '6 caractères minimum', ok: password.length >= 6 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    const err = register(email.trim(), password);
    if (err) { setError(err); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#4ade80" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 10px' }}>Compte créé !</h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
            Ton accès Pro est activé. Tous les modules sont débloqués.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
          >
            Commencer l'entraînement →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        {/* Confirmation paiement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
          <CheckCircle size={18} color="#4ade80" />
          <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>Paiement confirmé — crée ton compte pour accéder à Pro</span>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 20, padding: '28px 24px' }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 6px' }}>Créer ton compte</h1>
          <p style={{ color: '#555', fontSize: 13, margin: '0 0 24px' }}>Email + mot de passe pour te connecter lors de tes prochaines visites.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 7 }}>
                Adresse email
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                style={{ width: '100%', padding: '11px 13px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 9, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 7 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 40px 11px 13px', background: '#0a0a0a', border: `1px solid ${password && pwError ? 'rgba(248,113,113,0.4)' : password && !pwError ? 'rgba(74,222,128,0.4)' : '#2a2a2a'}`, borderRadius: 9, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={15} color="#555" /> : <Eye size={15} color="#555" />}
                </button>
              </div>
            </div>

            {/* Règles mot de passe */}
            {password.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {rules.map(r => (
                  <span key={r.label} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: r.ok ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.08)', color: r.ok ? '#4ade80' : '#f87171', border: `1px solid ${r.ok ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.2)'}` }}>
                    {r.ok ? '✓' : '✗'} {r.label}
                  </span>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 7 }}>
                Confirmer le mot de passe
              </label>
              <input
                type={showPw ? 'text' : 'password'} required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 13px', background: '#0a0a0a', border: `1px solid ${confirm && confirm !== password ? 'rgba(248,113,113,0.4)' : confirm && confirm === password ? 'rgba(74,222,128,0.4)' : '#2a2a2a'}`, borderRadius: 9, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '9px 13px', marginBottom: 14 }}>
                <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" style={{
              width: '100%', padding: '13px', borderRadius: 11,
              background: 'linear-gradient(135deg, #c9a84c, #a8823a)',
              border: 'none', color: '#000', fontWeight: 800, fontSize: 14,
              cursor: 'pointer',
            }}>
              Créer mon compte →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
