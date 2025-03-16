'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LanguageSwitcher = () => {
  const router = useRouter();
// useEffect(()=>{if(!router.isReady)return},[router.isReady])
  const handleLanguageChange = (newLocale: string) => {
    // Update the locale in the URL or a global state
    router.push(router.asPath, router.asPath, { locale: newLocale });
  };

  return (
    <div>
      <button onClick={() => handleLanguageChange('en')}>English</button>
      <button onClick={() => handleLanguageChange('fr')}>Français</button>
    </div>
  );
};

export default LanguageSwitcher;
