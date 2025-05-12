'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    subItems: [
      { name: 'Edit Profile', href: '/profile/edit' },
      { name: 'Preferences', href: '/profile/preferences' },
    ],
  },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const pathname = usePathname();

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSubmenu = (name) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4  z-50 p-2 rounded-md bg-gray-800 text-white"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? (
          <ChevronLeftIcon className="h-6 w-6" />
        ) : (
          <ChevronRightIcon className="h-6 w-6" />
        )}
      </button>
<div className={`flex mr-9 ${isCollapsed?"mr-9":"mr-[256]"}`} >    
    <motion.aside
        initial={{ width: isCollapsed ? 64 : 256 }}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 h-screen  bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 text-white shadow-lg flex flex-col justify-between overflow-y-auto z-40
          ${isMobileOpen ? 'block md:block' : 'hidden md:block'}`}
      >
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-bold tracking-tight"
              >
                Rawaes
              </motion.h1>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <div className="relative">
                  <button
                    onClick={() => item.subItems && toggleSubmenu(item.name)}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-700'
                    } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                    aria-expanded={item.subItems ? openSubmenus[item.name] : undefined}
                    aria-label={item.name}
                  >
                    <item.icon className="h-6 w-6" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium flex-1 text-left">
                        {item.name}
                      </span>
                    )}
                    {item.subItems && !isCollapsed && (
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${
                          openSubmenus[item.name] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {isCollapsed && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                      {item.name}
                    </div>
                  )}
                </div>

                {item.subItems && (
                  <AnimatePresence>
                    {openSubmenus[item.name] && !isCollapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 space-y-1 mt-1"
                      >
                        {item.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className={`block p-2 rounded-lg text-sm transition-colors ${
                                pathname === subItem.href
                                  ? 'bg-indigo-500 text-white'
                                  : 'hover:bg-gray-700'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-semibold">JD</span>
                </div>
                <div>
                  {/* User info can be added here */}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.aside>
      </div>


      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={toggleMobileSidebar}
        ></div>
      )}
    </>
  );
}