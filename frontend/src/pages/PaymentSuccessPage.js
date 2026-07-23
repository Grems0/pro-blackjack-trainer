import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff, Crown, XCircle } from 'lucide-react';
import { useAuth, validatePassword } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';
const PLAN_LABELS = { monthly: 'mensuel', annual: 'annuel' };
const PLAN_DURATIONS = { monthly: '30 jours', annual: '1 an' };

export default function PaymentSuccessPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // La session Stripe est la SEULE preuve de paiement acceptée — jamais une valeur
  // de localStorage, qui peut être falsifiée par n'importe qui depuis la console.
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [plan, setPlan] = useState('monthly');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);

  // Vérification côté serveur du paiement Stripe avant d'afficher quoi que ce soit
  useEffect(() => {
    if (!sessionId) {
      setSessionError("Aucun paiement détecté. Merci de t'abonner depuis la page Tarifs.");
      setChecking(false);
      return;
    }
    fetch(`${API_BASE}/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Paiement non confirmé.');
        setVerifiedEmail(data.email);
        setPlan(data.plan);
        setChecking(false);
      })
      .catch((e) => {
        setSessionError(e.message || 'Impossible de vérifier ton paiement.');
        setChecking(false);
      });
  }, [sessionId]);

  // Countdown après création de compte
  useEffect(() => {
    if (!done) return;
    if (countdown <= 0) { navigate('/training'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [done, countdown, navigate]);

  const pwError = validatePassword(password);
  const rules = [
    { label: '1 majuscule',          ok: /[A-Z]/.test(password) },
    { label: '1 minuscule',          ok: /[a-z]/.test(password) },
    { label: '1 chiffre',            ok: /[0-9]/.test(password) },
    { label: '6 caractères minimum', ok: password.length >= 6   },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    const err = await register(verifiedEmail, password, sessionId);
    if (err) { setError(err); return; }
    setDone(true);
  };

  const circumference = 2 * Math.PI * 28;
  const progress = circumference * (1 - countdown / 30);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontSize: 14 }}>Vérification du paiement…</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: '2px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <XCircle size={40} color="#f87171" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: '0 0 12px' }}>Paiement non confirmé</h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>{sessionError}</p>
          <button
            onClick={() => navigate('/pricing')}
            style={{ padding: '13px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            Voir les tarifs
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="#4ade80" />
          </div>

          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 8px' }}>Compte créé avec succès !</h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: '0 0 6px' }}>
            Ton abonnement <strong style={{ color: '#c9a84c' }}>Pro {PLAN_LABELS[plan]}</strong> est actif pour{' '}
            <strong style={{ color: '#fff' }}>{PLAN_DURATIONS[plan]}</strong>.
          </p>
          <p style={{ color: '#555', fontSize: 13, margin: '0 0 6px' }}>Tous les modules sont débloqués.</p>
          {user?.referralBonusApplied && (
            <p style={{ color: '#4ade80', fontSize: 13, margin: '0 0 20px', fontWeight: 700 }}>
              🎁 +1 mois offert grâce au parrainage !
            </p>
          )}

          {user?.referralCode && (
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 18px', margin: '0 0 28px', textAlign: 'left' }}>
              <p style={{ color: '#c9a84c', fontSize: 12, fontWeight: 800, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🎁 Parraine un ami
              </p>
              <p style={{ color: '#666', fontSize: 12.5, margin: '0 0 10px', lineHeight: 1.5 }}>
                Partage ton lien : vous recevez chacun <strong style={{ color: '#fff' }}>1 mois offert</strong> quand il s'abonne.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  readOnly
                  value={`${window.location.origin}/pricing?ref=${user.referralCode}`}
                  onClick={(e) => e.target.select()}
                  style={{ flex: 1, padding: '9px 11px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#999', fontSize: 12, outline: 'none' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/pricing?ref=${user.referralCode}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ padding: '9px 16px', borderRadius: 8, background: copied ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg, #c9a84c, #a8823a)', border: copied ? '1px solid rgba(74,222,128,0.4)' : 'none', color: copied ? '#4ade80' : '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
              </div>
            </div>
          )}

          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="28" fill="none" stroke="#1a1a1a" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="28" fill="none"
                stroke="#c9a84c" strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#c9a84c', fontSize: 22, fontWeight: 900 }}>{countdown}</span>
            </div>
          </div>

          <p style={{ color: '#444', fontSize: 12, margin: '0 0 20px' }}>
            Redirection automatique dans {countdown} seconde{countdown !== 1 ? 's' : ''}…
          </p>

          <button
            onClick={() => navigate('/training')}
            style={{ padding: '13px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            Commencer maintenant →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <CheckCircle size={17} color="#4ade80" />
          <div>
            <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, margin: 0 }}>Paiement confirmé</p>
            <p style={{ color: '#555', fontSize: 12, margin: 0 }}>
              Abonnement <strong style={{ color: '#c9a84c' }}>Pro {PLAN_LABELS[plan]}</strong> — valable {PLAN_DURATIONS[plan]}
            </p>
          </div>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 20, padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Crown size={18} color="#c9a84c" />
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: 0 }}>Créer ton compte</h1>
          </div>
          <p style={{ color: '#555', fontSize: 13, margin: '0 0 22px' }}>
            Choisis un mot de passe pour te reconnecter lors de tes prochaines visites.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 7 }}>
                Adresse email (vérifiée via Stripe)
              </label>
              <input
                type="email" value={verifiedEmail} disabled
                style={{ width: '100%', padding: '11px 13px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 9, color: '#888', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
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

            {password.length > 0 && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
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

            <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: 11, background: 'linear-gradient(135deg, #c9a84c, #a8823a)', border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              Créer mon compte →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
