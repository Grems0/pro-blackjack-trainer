import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function loadUser() {
  try {
    const raw = localStorage.getItem('bj_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function validatePassword(password) {
  if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins 1 majuscule.';
  if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins 1 minuscule.';
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins 1 chiffre.';
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const register = useCallback((email, password) => {
    const err = validatePassword(password);
    if (err) return err;
    const u = { email, password: btoa(password), isPro: true };
    localStorage.setItem('bj_user', JSON.stringify(u));
    localStorage.setItem('pro_access', 'true');
    window.dispatchEvent(new Event('pro_access_changed'));
    setUser(u);
    return null;
  }, []);

  const login = useCallback((email, password) => {
    const stored = loadUser();
    if (!stored) return 'Aucun compte trouvé.';
    if (stored.email !== email) return 'Email incorrect.';
    if (stored.password !== btoa(password)) return 'Mot de passe incorrect.';
    localStorage.setItem('pro_access', 'true');
    window.dispatchEvent(new Event('pro_access_changed'));
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
    <AuthContext.Provider value={{ user, register, login, logout, validatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { validatePassword };
