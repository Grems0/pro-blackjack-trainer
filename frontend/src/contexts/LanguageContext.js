import React, { createContext, useContext, useState } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('bj_lang') || 'fr');

  const setLanguage = (l) => {
    localStorage.setItem('bj_lang', l);
    setLang(l);
  };

  const t = (key) => translations[lang]?.[key] ?? translations['fr']?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
