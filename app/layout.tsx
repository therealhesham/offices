

//@ts-nocheck
//@ts-ignore
// 'use client'
// import React, { useState } from 'react';
import "./globals.css";
import Sidebar from "../app/components/Sidebar"
import ClientProviders from "./ClientProviders";
import SplashScreen from "./components/plashscreen";
// import LanguageSwitcher from '@/components/LanguageSwitcher';
// import { getLocale } from 'next-intl/server';
import { Inter } from 'next/font/google'

// import {NextIntlClientProvider} from 'next-intl';
const Page = async ({children}) => {
  // const locale = await getLocale();


  return (
    <html >
      <body>
        <SplashScreen/>
        <ClientProviders>
    <div className={`flex `}>


      <div className="flex-1 ">
        {/* <NextIntlClientProvider locale={locale}> */}
        {/* <LanguageSwitcher/> */}
        {children}
        {/* </NextIntlClientProvider> */}
        {/* Main content of the page */}
      </div>
    </div>
    </ClientProviders>
    </body>
    </html>
  );
};

export default Page;