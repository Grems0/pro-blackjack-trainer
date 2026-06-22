import { useState, useEffect } from 'react';

export function useProAccess() {
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem('pro_access') === 'true';
  });

  useEffect(() => {
    const handler = () => setIsPro(localStorage.getItem('pro_access') === 'true');
    window.addEventListener('pro_access_changed', handler);
    return () => window.removeEventListener('pro_access_changed', handler);
  }, []);

  return isPro;
}

export function activateProAccess() {
  localStorage.setItem('pro_access', 'true');
  window.dispatchEvent(new Event('pro_access_changed'));
}
