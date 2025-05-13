// app/ClientProviders.js
'use client';
import { LanguageProvider } from './contexts/LanguageContext';

import { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}