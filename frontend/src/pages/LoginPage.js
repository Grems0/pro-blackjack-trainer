import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = await login(email.trim(), password);
    if (err) { setError(err); return; }
    navigate('/training');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>♠</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Pro Blackjack Trainer</span>
        </Link>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 20, padding: '32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <LogIn size={20} color="#c9a84c" />
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: 0 }}>Connexion Pro</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                style={{
                  width: '100%', padding: '12px 14px', background: '#0a0a0a',
                  border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', background: '#0a0a0a',
                    border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={16} color="#555" /> : <Eye size={16} color="#555" />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: 'linear-gradient(135deg, #c9a84c, #a8823a)',
              border: 'none', color: '#000', fontWeight: 800, fontSize: 15,
              cursor: 'pointer', marginBottom: 16,
            }}>
              Se connecter →
            </button>
          </form>

          <p style={{ color: '#444', fontSize: 12, textAlign: 'center', margin: 0 }}>
            Pas encore de compte ?{' '}
            <Link to="/pricing" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 700 }}>
              S'abonner Pro →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
