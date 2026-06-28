import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase, hashPassword } from '../lib/supabase';

const AuthContext = createContext(null);

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

  // ── Register : sauvegarde localStorage + Supabase ────────────────────────
  const register = useCallback(async (email, password, plan = 'monthly') => {
    const err = validatePassword(password);
    if (err) return err;

    const now    = new Date();
    const expiry = new Date(now);
    if (plan === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);

    const hashed = await hashPassword(password);

    const u = {
      email:        email.toLowerCase(),
      password:     hashed,
      plan,
      subscribedAt: now.toISOString(),
      expiryDate:   expiry.toISOString(),
    };

    // Sauvegarde Supabase (persistance inter-appareils / après vidage navigateur)
    const { error } = await supabase.from('users').upsert({
      email:       u.email,
      password:    hashed,
      plan:        plan,
      expiry_date: expiry.toISOString(),
    }, { onConflict: 'email' });

    if (error) console.error('Supabase register error:', error.message);

    saveLocal(u);
    localStorage.removeItem('pending_plan');
    setUser(u);
    return null;
  }, []);

  // ── Login : localStorage d'abord, sinon restauration depuis Supabase ─────
  const login = useCallback(async (email, password) => {
    const hashed = await hashPassword(password);
    const emailLower = email.toLowerCase();

    // 1. Chercher en local
    let stored = loadUser();

    // 2. Si rien en local (navigateur vidé) → chercher dans Supabase
    if (!stored || stored.email !== emailLower) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', emailLower)
        .single();

      if (error || !data) return 'Aucun compte trouvé pour cet email.';

      if (data.password !== hashed) return 'Mot de passe incorrect.';

      // Reconstruire la session locale depuis Supabase
      stored = {
        email:        data.email,
        password:     data.password,
        plan:         data.plan,
        subscribedAt: data.created_at,
        expiryDate:   data.expiry_date,
      };

      saveLocal(stored);
      setUser(stored);

      if (!isProActive(stored)) return 'Ton abonnement a expiré. Renouvelle-le sur la page Tarifs.';
      return null;
    }

    // 3. Compte trouvé en local — vérifier mot de passe
    if (stored.password !== hashed) return 'Mot de passe incorrect.';
    if (!isProActive(stored)) return 'Ton abonnement a expiré. Renouvelle-le sur la page Tarifs.';

    saveLocal(stored);
    setUser(stored);
    return null;
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
