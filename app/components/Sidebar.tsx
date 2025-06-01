'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  CalendarIcon,
  ListBulletIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon, // Added for logout
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageSquareIcon, SettingsIcon } from 'lucide-react';
import { verify } from 'crypto';

const ISSERVER = typeof window === 'undefined';
let storage, lang;
if (!ISSERVER) {
  storage = localStorage.getItem('_item');
  lang = localStorage.getItem('language');
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();
  const [officeName,setOfficeName]=useState("")
  const translation = useLanguage();
  const checkCAr = async()=>{
    const check = await fetch("/api/checklogin")

    if(check.redirected){
    router.push("/login")
    return
  }
  const awaiter = await check.json()
  setOfficeName(awaiter?.office)
// alert(awaiter?.name)
  }
  useEffect(() => {
    checkCAr()
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
const router = useRouter()
  // Handle logout functionality
  const handleLogout = async() => {
    // Add your logout logic here, e.g., clear tokens, redirect to login page
    

const loggingOut = await fetch("/api/logout")
const waiter = await loggingOut.json()
if(loggingOut.ok){

localStorage.removeItem("_item")

router.push("/login")

}
  };

  const navItems = [
    { name: translation.language === 'fra' ? "PAGE D'ACCUEIL" : translation.language === 'ur' ? "گھر کا صفحہ" :translation.language ==='ar'? "الصفحة الرئيسية" : "Home", href: '/home', icon: HomeIcon },
    { name: translation.language === 'fra' ? 'Réservée' : translation.language === 'ur' ? "بک کروایا" :translation.language ==='ar'? "العاملات المحجوزة" : "Booked Homemaid", href: '/bookedhomemaid', icon: CalendarIcon },
    { name: translation.language === 'fra' ? 'Femmes de ménage disponibles' : translation.language === 'ur' ? 'دستیاب گھریلو ملازمہ' :translation.language ==='ar'? "العاملات المتاحة" : 'Available Homemaids', href: '/availablelist', icon: UsersIcon },
    { name: translation.language === 'fra' ? 'Liste complète ' : translation.language === 'ur' ? 'مکمل فہرست' :translation.language ==='ar'? "كل العاملات" : 'Full List', href: '/workerlist', icon: ListBulletIcon },

    { name: translation.language === 'fra' ? 'paramètres' : translation.language === 'ur' ? 'ترتیبات' :translation.language ==='ar'? "الاعدادات" : 'settings', href: '/settings', icon: SettingsIcon },
    { name: translation.language === 'fra' ? 'messages' : translation.language === 'ur' ? 'پیغامات' : translation.language ==='ar'? "الرسائل" :'messages', href: '/messages', icon: MessageSquareIcon },


  ];

  return (
    <>
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? (
          <ChevronLeftIcon className="h-6 w-6" />
        ) : (
          <ChevronRightIcon className="h-6 w-6" />
        )}
      </button>
      <div className={`flex ${isCollapsed ? 'mr-9' : 'mr-[256px]'}`}>
        <motion.aside
          initial={{ width: isCollapsed ? 64 : 256 }}
          animate={{ width: isCollapsed ? 64 : 256 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed top-0 ${translation.language === "ur" || translation.language === "ar" ? "right-0" : "left-0"} h-screen bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 text-white shadow-lg flex flex-col justify-between overflow-y-auto z-40 ${
            isMobileOpen ? 'block md:block' : 'hidden md:block'
          }`}
        >
          <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
  {!isCollapsed && (
    <div className="flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-sm font-bold tracking-tight"
        style={{ whiteSpace: 'nowrap' }} 
      >
        {officeName}
      </motion.h1>
      <p className="text-xs text-gray-500">Powered By Rawaes</p>
    </div>
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
                  <Link
                    href={item.href}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors group ${
                      pathname === item.href
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-700'
                    } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                    aria-label={item.name}
                  >
                    <item.icon className="h-6 w-6" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium flex-1 text-left">
                        {item.name}
                      </span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t  border-gray-700">
            <div className="flex items-center  justify-between">
              {!isCollapsed ? (
                <div className="flex items-center space-x-3">
                  {/* <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-semibold">RQ</span>
                  </div> */}
                  <div>
                    {/* User info can be added here */}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  {/* <UsersIcon className="h-6 w-6" /> */}
                </div>
              )}
              <div className="flex items-center  space-x-2">
                {/* Uncomment if you want to keep the theme toggle */}
                {/* <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button> */}
                {/* <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                  {isCollapsed && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                      Logout
                    </div>
                  )}
                </button> */}
              </div>
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="mt-2 w-full flex items-center  space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
          </div>
        </motion.aside>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-none md:hidden z-30"
          onClick={toggleMobileSidebar}
        ></div>
      )}
    </>
  );
}