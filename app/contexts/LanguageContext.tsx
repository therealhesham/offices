// app/contexts/LanguageContext.js
'use client';
import { createContext, useContext, useState } from 'react';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('language') || '' : ''
  );

  const changeLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setLanguage(lang); // Triggers rerender for all components using the context
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}