import { useState, useEffect } from 'react';

function checkProActive() {
  try {
    const raw = localStorage.getItem('bj_user');
    if (!raw) return false;
    const user = JSON.parse(raw);
    if (!user.expiryDate) return false;
    return new Date(user.expiryDate) > new Date();
  } catch { return false; }
}

export function useProAccess() {
  const [isPro, setIsPro] = useState(checkProActive);

  useEffect(() => {
    const handler = () => setIsPro(checkProActive());
    window.addEventListener('pro_access_changed', handler);
    return () => window.removeEventListener('pro_access_changed', handler);
  }, []);

  return isPro;
}
