'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiMessageSquare, FiList, FiGrid, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const ISSERVER = typeof window === 'undefined';
  let storage, lang;
  if (!ISSERVER) {
    storage = localStorage.getItem('_item');
    lang = localStorage.getItem('language');
  }

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [counting, setCounting] = useState({});
  const [width, setWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch counters for dashboard widgets
  const fetchCounter = async () => {
    if (!storage) {
      toast.error('Please log in to continue');
      return router.push('/login');
    }
    try {
      setIsLoading(true);
      const fetcher = await fetch('/api/counter', {
        method: 'GET',
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const counters = await fetcher.json();
      setCounting(counters);
      toast.success('Dashboard data loaded');
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent data for the list
  const fetchRecentData = async () => {
    if (!storage) {
      toast.error('Please log in to continue');
      return router.push('/login');
    }
    try {
      setIsLoading(true);
      const fetchList = await fetch('/api/recentlist', {
        method: 'GET',
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const jsonifyList = await fetchList.json();
      setDataList(jsonifyList);
    } catch (error) {
      toast.error('Failed to load recent list');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchCounter();
    fetchRecentData();
  }, []);

  // Format date for display
  const getDate = (date) => {
    const currentDate = new Date(date);
    return currentDate.toISOString().split('T')[0];
  };

  // Memoize widget data to optimize re-renders
const widgets = useMemo(
  () => [
    {
      title: lang === 'fra' ? 'Nouvelles réservations' : lang === 'ur' ? 'نئے تحفظات' : 'New Reservations',
      value: counting?.recent,
      icon: <FiList />,
      id: 'new-reservations',
      link: '/bookedhomemaid', // Link for New Reservations
    },
    {
      title: lang === 'fra' ? 'Femmes de ménage disponibles' : lang === 'ur' ? 'دستیاب گھریلو ملازمہ' : 'Available Homemaids',
      value: counting?.countAvailable,
      icon: <FiUserPlus />,
      id: 'available-homemaids',
      link: '/availablelist', // Link for Available Homemaids
    },
    {
      title: lang === 'fra' ? 'Réservée' : lang === 'ur' ? 'بک کروایا' : 'Booked',
      value: counting?.countRelated,
      icon: <FiGrid />,
      id: 'booked',
      link: '/bookedhomemaid', // Link for Booked (reusing bookedhomemaid)
    },
    {
      title: lang === 'fra' ? 'Total' : lang === 'ur' ? 'کل' : 'Total',
      value: counting?.total,
      icon: <FiGrid />,
      id: 'total',
      link: '/workerlist', // Link for Total
    },
  ],
  [counting, lang]
);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} ${width > 600 ? 'flex flex-row' : ''}`}>
      <Toaster position="top-right" />
      {width > 600 ? <Sidebar /> : <Navbar />}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header Section */}
        <motion.div
          className={`${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-xl rounded-2xl p-6 mb-8 flex justify-between items-center`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            {lang === 'fra' ? 'Bienvenu' : lang === 'ur' ? 'خوش امديد' : 'Welcome'}
          </h1>
          <div className="flex items-center space-x-4">
            {/* <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
              data-tooltip-id="theme-tooltip"
              data-tooltip-content={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button> */}
            <Tooltip id="theme-tooltip" />
            <Link href="/newemployer">
              <motion.button
                className="flex items-center bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 py-2 rounded-lg hover:from-purple-600 hover:to-purple-800 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-tooltip-id="add-homemaid-tooltip"
                data-tooltip-content="Add a new homemaid to the system"
              >
                <FiUserPlus className="mr-2" />
                {lang === 'fra' ? 'Ajouter une femme de ménage' : lang === 'ur' ? 'گھریلو ملازمہ شامل کریں۔' : 'Add Homemaid'}
              </motion.button>
              <Tooltip id="add-homemaid-tooltip" />
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Widgets */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <h2
            className={`text-2xl md:text-3xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            {lang === 'fra' ? 'Tableau de bord' : lang === 'ur' ? 'ڈیش بورڈ' : 'Dashboard Overview'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {isLoading
    ? Array(4)
        .fill()
        .map((_, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } animate-pulse`}
          >
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))
    : widgets.map((item) => (
        <Link href={item.link} key={item.id}>
          <motion.div
            className={`p-6 rounded-2xl shadow-xl bg-gradient-to-br ${
              theme === 'dark'
                ? 'from-gray-800 to-gray-900'
                : 'from-white to-gray-50'
            } flex items-center space-x-4 cursor-pointer`}
            variants={cardVariants}
            whileHover="hover"
            role="region"
            aria-labelledby={item.id}
            data-tooltip-id={item.id}
            data-tooltip-content={item.title}
          >
            <div className="text-purple-500 text-3xl">{item.icon}</div>
            <div>
              <h3
                id={item.id}
                className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                {item.value || 0}
              </p>
            </div>
            <Tooltip id={item.id} />
          </motion.div>
        </Link>
      ))}
</div>
        </motion.div>

        {/* Messages Section */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2
            className={`text-2xl font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            <FiMessageSquare className="mr-2 text-purple-500" />
            {lang === 'fra' ? 'Messages' : lang === 'ur' ? 'پیغامات' : 'Messages'}
          </h2>
          <div
            className={`shadow-xl rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse"
                    >
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  ))}
              </div>
            ) : messages.length > 0 ? (
              <ul role="list" aria-label="Messages list">
                {messages.map((reservation) => (
                  <li
                    key={reservation.id}
                    className={`flex justify-between p-4 border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                    role="listitem"
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        {reservation.name}
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {reservation.date}
                      </p>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        reservation.status === 'Confirmed'
                          ? 'text-green-500'
                          : 'text-yellow-500'
                      }`}
                    >
                      {reservation.status}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                No messages available.
              </p>
            )}
          </div>
        </motion.div>

        {/* Recent List Section */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2
            className={`text-2xl font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            <FiList className="mr-2 text-purple-500" />
            {lang === 'fra' ? 'Liste récente' : lang === 'ur' ? 'نئے تحفظات' : 'Recent List'}
          </h2>
          <div
            className={`shadow-xl rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse"
                    >
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  ))}
              </div>
            ) : dataList.length > 0 ? (
              <ul role="list" aria-label="Recent reservations list">
                {dataList.map((reservation) => (
                  <li
                    key={reservation.id}
                    className={`flex justify-between p-4 border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                    role="listitem"
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        {reservation.Name}
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {getDate(reservation.NewOrder[0].createdAt)}
                      </p>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        reservation.NewOrder[0].bookingstatus === 'حجز جديد'
                          ? 'text-green-500'
                          : 'text-yellow-500'
                      }`}
                    >
                      {reservation.NewOrder[0].bookingstatus}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                No recent reservations available.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}