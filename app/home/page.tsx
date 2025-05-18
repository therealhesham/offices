'use client'


import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiMessageSquare, FiList, FiSun, FiMoon, FiX } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import Sidebar from '../components/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/navigationbar';
import { jwtDecode } from "jwt-decode";
import ChatWidget from '@/components/chat_widget';

export default function Home() {
  const [url,setUrl]=useState("")
  const ISSERVER = typeof window === 'undefined';
  
  // let storage: string | null , lang: string | null, user: Record<string, unknown> | null;
  // lang = localStorage.getItem('language');

  // function name() {
  //   if (!ISSERVER) { // or 
  //     storage = localStorage.getItem('_item');

  //    // const user = JSON.parse(localStorage.getItem('user') || '{}');
  //    const payload = storage ? jwtDecode(storage) : null;
  //    setUrl(payload?.url);
  //  }    
  // }
  let storage, lang, user;
  if (!ISSERVER) {
    storage = localStorage.getItem('_item');
    lang = localStorage.getItem('language');
    // user = JSON.parse(localStorage.getItem('user') || '{}');
  }

  useEffect(() => {
    // name()

    if ( !ISSERVER) { // or !ISSERVER
       storage = localStorage.getItem('_item');
      // const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = storage ? jwtDecode(storage) : null;
      setUrl(payload?.url);
    }
  }, []); // 
  const [colorScheme, setColorScheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('colorScheme') || 'default';
    }
    return 'default'})
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [counting, setCounting] = useState({});
  const [width, setWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set RTL for Arabic and Urdu
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr';
  }, [lang]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?type=inbox`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const dates = Date.now();
  const [ss, setSs] = useState(dates);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [counterRes, recentRes, messagesList] = await Promise.all([
          fetch('/api/counter', {
            method: 'GET',
            headers: {
              authorization: `bearer ${storage}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/recentlist', {
            method: 'GET',
            headers: {
              authorization: `bearer ${storage}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }),
          fetch(`/api/recentmessages?type=inbox`, {
            method: 'GET',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          }),
        ]);
        const [counters, recentList, messaging] = await Promise.all([
          counterRes.json(),
          recentRes.json(),
          messagesList.json(),
        ]);
        setCounting(counters);
        setDataList(recentList);
        setMessages(messaging);
        toast.success('Dashboard data loaded');
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ss]);

  const updateMessageStatus = async (id) => {
    try {
      const response = await fetch(`/api/recentmessages?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('message');
      setSs(Date.now());
    } catch (error) {
      console.log(error);
    }
  };

  // Format date for display
  const getDate = (date) => {
    const currentDate = new Date(date);
    return currentDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Memoize widget data
  const widgets = useMemo(
    () => [
      {
        title:
          lang === 'fra'
            ? 'Nouvelles réservations'
            : lang === 'ur'
            ? 'نئے تحفظات'
            : lang === 'ar'
            ? 'الحجوزات الجديدة'
            : 'New Reservations',
        value: counting?.recent,
        icon: <FiList />,
        id: 'new-reservations',
        link: '/bookedhomemaid',
      },
      {
        title:
         

 lang === 'fra'
            ? 'Femmes de ménage disponibles'
            : lang === 'ur'
            ? 'دستیاب گھریلو ملازمہ'
            : lang === 'ar'
            ? 'الخادمات المتاحة'
            : 'Available Homemaids',
        value: counting?.countAvailable,
        icon: <FiUserPlus />,
        id: 'available-homemaids',
        link: '/availablelist',
      },
      {
        title:
          lang === 'fra'
            ? 'Réservée'
            : lang === 'ur'
            ? 'بک کروایا'
            : lang === 'ar'
            ? 'محجوز'
            : 'Booked',
        value: counting?.countRelated,
        icon: <FiList />,
        id: 'booked',
        link: '/bookedhomemaid',
      },
      {
        title:
          lang === 'fra'
            ? 'Total'
            : lang === 'ur'
            ? 'کل'
            : lang === 'ar'
            ? 'الإجمالي'
            : 'Total',
        value: counting?.total,
        icon: <FiList />,
        id: 'total',
        link: '/workerlist',
      },
    ],
    [counting, lang]
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  // Open modal with message details
  const openModal = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className={`min-h-screen scheme-${colorScheme}   ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} ${width > 600 ? 'flex flex-row' : ''}`} dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
      <Sidebar />
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
          <div className="flex items-center space-x-4">
            <img src={url ? url :""} alt="Company Logo" className="h-10 rounded-md w-10" />
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                {lang === 'fra' ? 'Bienvenu' : lang === 'ur' ? 'خوش امديد' : lang === 'ar' ? 'مرحبًا' : 'Welcome'}
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {/* Connecting Care */}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/newemployer">
              <motion.button
                className="flex items-center  bg-purple-600  text-white px-6 py-3 rounded-lg shadow-md hover:from-purple-600 hover:to-purple-800 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-tooltip-id="add-homemaid-tooltip"
                data-tooltip-content={
                  lang === 'fra'
                    ? 'Ajouter une femme de ménage au système'
                    : lang === 'ur'
                    ? 'نظام میں نئی گھریلو ملازمہ شامل کریں'
                    : lang === 'ar'
                    ? 'إضافة خادمة جديدة إلى النظام'
                    : 'Add a new homemaid to the system'
                }
                aria-describedby="add-homemaid-tooltip"
              >
                <FiUserPlus className="mr-2" aria-label="Add homemaid" />
                {lang === 'fra'
                  ? 'Ajouter une femme de ménage'
                  : lang === 'ur'
                  ? 'گھریلو ملازمہ شامل کریں'
                  : lang === 'ar'
                  ? 'إضافة خادمة'
                  : 'Add Homemaid'}
              </motion.button>
              <Tooltip id="add-homemaid-tooltip" className="bg-purple-600 text-white" />
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
            {lang === 'fra'
              ? 'Tableau de bord'
              : lang === 'ur'
              ? 'ڈیش بورڈ'
              : lang === 'ar'
              ? '  لوحة التحكم'
              : 'Dashboard Overview'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array(4)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl shadow-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } animate-pulse h-32`}
                    >
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))
              : widgets.map((item) => (
                  <Link href={item.link} key={item.id}>
                    <motion.div
                      className={`p-6 rounded-2xl shadow-xl border bg-gradient-to-br h-32 ${
                        theme === 'dark'
                          ? 'from-gray-800 to-gray-900 border-gray-700'
                          : 'from-white to-gray-50 border-gray-200'
                      } flex items-center space-x-4 cursor-pointer`}
                      variants={cardVariants}
                      whileHover="hover"
                      role="region"
                      aria-labelledby={item.id}
                      data-tooltip-id={item.id}
                      data-tooltip-content={item.title}
                      aria-label={`View ${item.title}`}
                    >
                      <div className="text-purple-500 text-4xl">{item.icon}</div>
                      <div>
                        <h3
                          id={item.id}
                          className={`text-md font-semibold text-nowrap   ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                          } hover:text-purple-600 transition`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}
                        >
                          {item.value || 0}
                        </p>
                      </div>
                      <Tooltip id={item.id} className="bg-purple-600 text-white" />
                    </motion.div>
                  </Link>
                ))}
          </div>
        </motion.div>

        {/* Messages Section */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2
            className={`text-2xl font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            <FiMessageSquare className="mr-2 text-purple-500" />
            {lang === 'fra'
              ? 'Messages'
              : lang === 'ur'
              ? 'پیغامات'
              : lang === 'ar'
              ? 'الرسائل الجديدة'
              : 'New Messages'}
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
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer`}
                    role="listitem"
                    onClick={() => {
                      updateMessageStatus(reservation?.id);
                      openModal(reservation);
                    }}
                    aria-label={`View message from ${reservation.name}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        {reservation.title}
                      </div>
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
                          } truncate w-48`}
                        >
                          {reservation.message || (lang === 'ar' ? 'لا يوجد معاينة للرسالة' : 'No message preview')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {getDate(reservation.createdAt)}
                      </p>
                      <div
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          reservation.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {reservation.status === 'Confirmed'
                          ? lang === 'ar'
                            ? 'مؤكد'
                            : lang === 'fra'
                            ? 'Confirmé'
                            : lang === 'ur'
                            ? 'تصدیق شدہ'
                            : 'Confirmed'
                          : lang === 'ar'
                          ? 'قيد الانتظار'
                          : lang === 'fra'
                          ? 'En attente'
                          : lang === 'ur'
                          ? 'زیر التوا'
                          : 'Pending'}
                      </div>
                    </div>
                  </li>
                ))}
                <div className="mt-4 text-right">
                  <Link href="/messages">
                    <button className="text-purple-600 hover:text-purple-800 font-medium">
                      {lang === 'fra'
                        ? 'Voir tous les messages'
                        : lang === 'ur'
                        ? 'تمام پیغامات دیکھیں'
                        : lang === 'ar'
                        ? 'عرض جميع الرسائل'
                        : 'View All Messages'}
                    </button>
                  </Link>
                </div>
              </ul>
            ) : (
              <div className="text-center py-8">
                <FiMessageSquare className="mx-auto text-4xl text-gray-400 mb-4" />
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  } mb-4`}
                >
                  {lang === 'fra'
                    ? 'Aucun message disponible.'
                    : lang === 'ur'
                    ? 'کوئی پیغامات موجود نہیں ہیں۔'
                    : lang === 'ar'
                    ? 'لا توجد رسائل متاحة.'
                    : 'No messages available.'}
                </p>
                <Link href="/messages">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    {lang === 'fra'
                      ? 'Démarrer une conversation'
                      : lang === 'ur'
                      ? 'گفتگو شروع کریں'
                      : lang === 'ar'
                      ? 'بدء محادثة'
                      : 'Start a Conversation'}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal for Message Details */}
        <AnimatePresence>
          {isModalOpen && selectedMessage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className={`rounded-2xl p-6 max-w-md w-full ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
                }`}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    {lang === 'fra'
                      ? 'Détails du message'
                      : lang === 'ur'
                      ? 'پیغام کی تفصیلات'
                      : lang === 'ar'
                      ? 'تفاصيل الرسالة'
                      : 'Message Details'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className={`p-2 rounded-full ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                    aria-label="Close modal"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {lang === 'fra'
                        ? 'De'
                        : lang === 'ur'
                        ? 'منجانب'
                        : lang === 'ar'
                        ? 'من'
                        : 'From'}
                    </p>
                    <p className="font-semibold">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {lang === 'fra'
                        ? 'Message'
                        : lang === 'ur'
                        ? 'پیغام'
                        : lang === 'ar'
                        ? 'الرسالة'
                        : 'Message'}
                    </p>
                    <p>
                      {selectedMessage.message ||
                        (lang === 'ar' ? 'لا يوجد محتوى للرسالة' : 'No message content')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {lang === 'fra'
                        ? 'Date'
                        : lang === 'ur'
                        ? 'تاریخ'
                        : lang === 'ar'
                        ? 'التاريخ'
                        : 'Date'}
                    </p>
                    <p>{getDate(selectedMessage.createdAt)}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {lang === 'fra'
                        ? 'Statut'
                        : lang === 'ur'
                        ? 'حالت'
                        : lang === 'ar'
                        ? 'الحالة'
                        : 'Status'}
                    </p>
                    <div
                      className={`inline-block text-sm font-medium px-2 py-1 rounded ${
                        selectedMessage.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedMessage.status === 'Confirmed'
                        ? lang === 'ar'
                          ? 'مؤكد'
                          : lang === 'fra'
                          ? 'Confirmé'
                          : lang === 'ur'
                          ? 'تصدیق شدہ'
                          : 'Confirmed'
                        : lang === 'ar'
                        ? 'قيد الانتظار'
                        : lang === 'fra'
                        ? 'En attente'
                        : lang === 'ur'
                        ? 'زیر التوا'
                        : 'Pending'}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Link href={`/messages`}>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                      {lang === 'fra'
                        ? 'Voir plus'
                        : lang === 'ur'
                        ? 'مزید دیکھیں'
                        : lang === 'ar'
                        ? 'عرض المزيد'
                        : 'View More'}
                    </button>
                  </Link>
                  <button
                    onClick={closeModal}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    {lang === 'fra'
                      ? 'Fermer'
                      : lang === 'ur'
                      ? 'بند کریں'
                      : lang === 'ar'
                      ? 'إغلاق'
                      : 'Close'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent List Section */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2
            className={`text-2xl font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            <FiList className="mr-2 text-purple-500" />
            {lang === 'fra'
              ? 'Liste récente'
              : lang === 'ur'
              ? 'نئے تحفظات'
              : lang === 'ar'
              ? 'القائمة الحديثة'
              : 'Recent List'}
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
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer`}
                    role="listitem"
                    onClick={() => router.push(`/homemaid/${reservation.id}`)}
                    aria-label={`View reservation for ${reservation.Name}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        {reservation.Name[0]}
                      </div>
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
                    </div>
                    <div
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        reservation.NewOrder[0].bookingstatus === 'حجز جديد'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {reservation.NewOrder[0].bookingstatus === 'حجز جديد'
                        ? lang === 'ar'
                          ? 'حجز جديد'
                          : lang === 'fra'
                          ? 'Nouvelle réservation'
                          : lang === 'ur'
                          ? 'نیا تحفظ'
                          : 'New Booking'
                        : lang === 'ar'
                        ? 'قيد الانتظار'
                        : lang === 'fra'
                        ? 'En attente'
                        : lang === 'ur'
                        ? 'زیر التوا'
                        : 'Pending'}
                    </div>
                  </li>
                ))}
                <div className="mt-4 text-right">
                  <Link href="/bookedhomemaid">
                    <button className="text-purple-600 hover:text-purple-800 font-medium">
                      {lang === 'fra'
                        ? 'Voir toutes les réservations'
                        : lang === 'ur'
                        ? 'تمام تحفظات دیکھیں'
                        : lang === 'ar'
                        ? 'عرض جميع الحجوزات'
                        : 'View All Reservations'}
                    </button>
                  </Link>
                </div>
              </ul>
            ) : (
              <div className="text-center py-8">
                <FiList className="mx-auto text-4xl text-gray-400 mb-4" />
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  } mb-4`}
                >
                  {lang === 'fra'
                    ? 'Aucune réservation récente disponible.'
                    : lang === 'ur'
                    ? 'کوئی حالیہ تحفظات موجود نہیں ہیں۔'
                    : lang === 'ar'
                    ? 'لا توجد حجوزات حديثة متاحة.'
                    : 'No recent reservations available.'}
                </p>
                <Link href="/bookedhomemaid">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    {lang === 'fra'
                      ? 'Voir toutes les réservations'
                      : lang === 'ur'
                      ? 'تمام تحفظات دیکھیں'
                      : lang === 'ar'
                      ? 'عرض جميع الحجوزات'
                      : 'View All Reservations'}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
<ChatWidget/>
    </div>
  );
}