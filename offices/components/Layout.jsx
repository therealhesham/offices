'use client'

import React from "react";
import Sidebar from "./Sidebar";
import LanguageSwitcher from "./LanguageSwitcher"
const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-row justify-start">
      <Sidebar />    

      <div className="bg-primary flex-1 p-4 text-white">
          {children}
      </div>
    </div>
  );
};

export default Layout;
