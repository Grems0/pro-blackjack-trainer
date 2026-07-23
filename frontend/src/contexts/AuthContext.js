import React, { createContext, useContext, useState, useCallback } from 'react';
import { hashPassword } from '../lib/supabase';

const AuthContext = createContext(null);

// Backend sécurisé qui vérifie chaque paiement auprès de Stripe avant de créer un compte.
// À configurer sur Vercel : REACT_APP_API_URL = URL du backend déployé (ex. Railway).
const API_BASE = process.env.REACT_APP_API_URL || '';

function loadUser() {
  try {
    const raw = localStorage.getItem('bj_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(u) {
  localStorage.setItem('bj_user', JSON.stringify(u));
  localStorage.setItem('pro_access', 'true');
  window.dispatchEvent(new Event('pro_access_changed'));
}

export function validatePassword(password) {
  if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins 1 majuscule.';
  if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins 1 minuscule.';
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins 1 chiffre.';
  return null;
}

export function isProActive(user) {
  if (!user) return false;
  if (!user.expiryDate) return false;
  return new Date(user.expiryDate) > new Date();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  // ── Register : nécessite une session Stripe payée, vérifiée côté serveur ────
  // sessionId = id de la session Stripe Checkout (transmis par la page de succès)
  const register = useCallback(async (email, password, sessionId) => {
    const err = validatePassword(password);
    if (err) return err;
    if (!sessionId) return 'Session de paiement introuvable. Merci de payer via la page Tarifs.';

    let res, data;
    try {
      res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password, session_id: sessionId }),
      });
      data = await res.json();
    } catch {
      return 'Impossible de contacter le serveur. Vérifie ta connexion et réessaie.';
    }

    if (!res.ok) return data.detail || 'Erreur lors de la création du compte.';

    const hashedLocal = await hashPassword(password);
    const u = {
      email:        data.email,
      password:     hashedLocal,
      plan:         data.plan,
      subscribedAt: new Date().toISOString(),
      expiryDate:   data.expiry_date,
      token:        data.token,
    };
    saveLocal(u);
    setUser(u);
    return null;
  }, []);

  // ── Login : vérifie auprès du serveur, avec repli hors ligne sur le cache local ──
  const login = useCallback(async (email, password) => {
    const emailLower = email.toLowerCase();
    const hashedLocal = await hashPassword(password);
    const cached = loadUser();

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.detail || 'Email ou mot de passe incorrect.';

      const u = {
        email:      data.email,
        password:   hashedLocal,
        plan:       data.plan,
        expiryDate: data.expiry_date,
        token:      data.token,
      };
      saveLocal(u);
      setUser(u);
      if (!isProActive(u)) return 'Ton abonnement a expiré. Renouvelle-le sur la page Tarifs.';
      return null;
    } catch {
      // Hors ligne : on retombe sur le compte mis en cache localement si les identifiants correspondent
      if (cached && cached.email === emailLower && cached.password === hashedLocal) {
        setUser(cached);
        if (!isProActive(cached)) return 'Ton abonnement a expiré. Renouvelle-le sur la page Tarifs.';
        return null;
      }
      return 'Impossible de se connecter (hors ligne et aucun compte local).';
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pro_access');
    localStorage.removeItem('bj_user');
    window.dispatchEvent(new Event('pro_access_changed'));
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isProActive: () => isProActive(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
