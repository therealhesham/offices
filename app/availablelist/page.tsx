'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SunIcon,
  MoonIcon,
  StarIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  IdentificationIcon,
  CalendarIcon,
  HeartIcon,
  
  BuildingOffice2Icon,
  ArrowPathIcon,
  XMarkIcon,
  EyeIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';
import { useLanguage } from '../contexts/LanguageContext';

// Translation object for all text
const translations = {
  en: {
    title: 'Available',
    searchByName: 'Search by name',
    searchByPassport: 'Search by passport number',
    reset: 'Reset',
    search: 'Search',
    error: 'Failed to load data. Please try again.',
    retry: 'Retry',
    noResults: 'No results found',
    loading: 'Loading...',
    workerId: 'Worker ID',
    workerName: 'Worker Name',
    workerPhone: 'Worker Phone',
    nationality: 'Nationality',
    passportNumber: 'Passport Number',
    passportStart: 'Passport Start',
    passportEnd: 'Passport End',
    maritalStatus: 'Marital Status',
    office: 'Office',
    viewDetails: 'View Details',
    close: 'Close',
    viewMore: 'View More',
    detailsTitle: 'Worker Details',
    notAvailable: 'Not Available',
  },
  fra: {
    title: 'Disponible',
    searchByName: 'Rechercher par nom',
    searchByPassport: 'Rechercher par numéro de passeport',
    reset: 'Réinitialiser',
    search: 'Recherche',
    error: 'Échec du chargement des données. Veuillez réessayer.',
    retry: 'Réessayer',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    workerId: 'ID de l’employé',
    workerName: 'Nom de l’employé',
    workerPhone: 'Téléphone de l’employé',
    nationality: 'Nationalité',
    passportNumber: 'Numéro de passeport',
    passportStart: 'Début du passeport',
    passportEnd: 'Fin du passeport',
    maritalStatus: 'État civil',
    office: 'Bureau',
    viewDetails: 'Voir les détails',
    close: 'Fermer',
    viewMore: 'Voir plus',
    detailsTitle: 'Détails de l’employé',
    notAvailable: 'Non disponible',
  },
  ur: {
    title: 'دست یاب',
    searchByName: 'نام سے تلاش کریں',
    searchByPassport: 'پاسپورٹ نمبر سے تلاش کریں',
    reset: 'ری سیٹ',
    search: 'تلاش',
    error: 'ڈیٹا لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔',
    retry: 'دوبارہ کوشش کریں',
    noResults: 'کوئی نتائج نہیں ملے',
    loading: 'لوڈ ہو رہا ہے...',
    workerId: 'ورکر آئی ڈی',
    workerName: 'ورکر کا نام',
    workerPhone: 'ورکر کا فون',
    nationality: 'قومیت',
    passportNumber: 'پاسپورٹ نمبر',
    passportStart: 'پاسپورٹ شروع',
    passportEnd: 'پاسپورٹ ختم',
    maritalStatus: 'ازدواجی حیثیت',
    office: 'دفتر',
    viewDetails: 'تفصیلات دیکھیں',
    close: 'بند کریں',
    viewMore: 'مزید دیکھیں',
    detailsTitle: 'ورکر کی تفصیلات',
    notAvailable: 'دستیاب نہیں',
  },
};

const INITIAL_FILTERS = {
  phonenumber: '',
  Passportnumber: '',
  fullname: '',
};

const INITIAL_STATE = {
  data: [],
  loading: false,
  hasMore: true,
  error: null,
};

export default function Table() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [state, setState] = useState(INITIAL_STATE);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [width, setWidth] = useState(0);
  const { language } = useLanguage();
  const t = translations[language] || translations.en; // Fallback to English
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const debounceTimeoutRef = useRef(null);
  const router = useRouter();

  // Set document direction for RTL languages
  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  // Fetch data with error handling and token validation
  const fetchData = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current || !state.hasMore) return;

      isFetchingRef.current = true;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const queryParams = new URLSearchParams({
          fullname: filters.fullname,
          phonenumber: filters.phonenumber,
          Passportnumber: filters.Passportnumber,
          page: String(pageRef.current),
        });

        const token = localStorage.getItem('_item');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/availablelist?${queryParams}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch data');
        }

        const res = await response.json();
        if (res.message === 'not available token') {
          router.push('/login');
          return;
        }

        setState((prev) => ({
          ...prev,
          data: reset ? res : [...prev.data, ...res],
          hasMore: res.length > 0,
        }));

        if (res.length > 0) {
          pageRef.current += 1;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: t.error,
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
        isFetchingRef.current = false;
      }
    },
    [filters, state.hasMore, router, t.error]
  );

  // Debounced filter change handler
  const handleFilterChange = useCallback(
    (e, column) => {
      const value = e.target.value;

      setFilters((prev) => ({
        ...prev,
        [column]: value,
      }));

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        pageRef.current = 1;
        setState((prev) => ({ ...prev, data: [], hasMore: true }));
        fetchData(true);
      }, 500);
    },
    [fetchData]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setState((prev) => ({ ...prev, data: [], hasMore: true }));
    pageRef.current = 1;
    isFetchingRef.current = false;
    fetchData(true);
  }, [fetchData]);

  // Infinite scroll observer
  const loadMoreRef = useCallback(
    (node) => {
      if (!node || state.loading || !state.hasMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchData();
          }
        },
        { threshold: 1.0 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [fetchData, state.loading, state.hasMore]
  );

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return t.notAvailable;
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        width > 768 ? 'flex flex-row' : 'flex flex-col'
      } ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-indigo-50'}`}
    >
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto relative">
        {/* Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-indigo-900 dark:text-indigo-200 mb-8 text-center tracking-tight"
        >
          {t.title}
        </motion.h1>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl sticky top-0 z-10 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                key: 'fullname',
                label: t.searchByName,
                icon: <StarIcon className="h-5 w-5" />,
              },
              {
                key: 'Passportnumber',
                label: t.searchByPassport,
                icon: <DocumentTextIcon className="h-5 w-5" />,
              },
            ].map(({ key, label, icon }) => (
              <div key={key} className="relative group">
                <input
                  type="text"
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(e, key)}
                  placeholder=" "
                  aria-label={label}
                  className="w-full p-4 pl-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 peer"
                />
                <label className="absolute right-12 top-4 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {label}
                </label>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="absolute left-3 top-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                >
                  {icon}
                </motion.div>
              </div>
            ))}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white py-4 rounded-lg hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300"
                aria-label={t.reset}
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                {t.reset}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchData(true)}
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300"
                aria-label={t.search}
              >
                <StarIcon className="h-5 w-5 mr-2" />
                {t.search}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center mb-8 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg"
              role="alert"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{state.error}</span>
              <button
                onClick={() => fetchData(true)}
                className="ml-4 text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
              >
                <ArrowPathIcon className="h-5 w-5 mr-1" />
                {t.retry}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {state.data.length === 0 && !state.loading && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              <FolderOpenIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-2">{t.noResults}</p>
            </div>
          )}
          {state.loading && !state.data.length ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            state.data.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className="space-y-3">
                  {[
                    { label: t.workerId, value: item.id, icon: <IdentificationIcon className="h-5 w-5" /> },
                    { label: t.workerName, value: item.Name, icon: <UserIcon className="h-5 w-5" /> },
                    { label: t.workerPhone, value: item.phone, icon: <PhoneIcon className="h-5 w-5" /> },
                    { label: t.nationality, value: item.Nationalitycopy, icon: <GlobeAltIcon className="h-5 w-5" /> },
                    { label: t.passportNumber, value: item.Passportnumber, icon: <DocumentTextIcon className="h-5 w-5" /> },
                    { label: t.passportStart, value: formatDate(item.PassportStart), icon: <CalendarIcon className="h-5 w-5" /> },
                    { label: t.passportEnd, value: formatDate(item.PassportEnd), icon: <CalendarIcon className="h-5 w-5" /> },
                    { label: t.maritalStatus, value: item.maritalstatus, icon: <HeartIcon className="h-5 w-5" /> },
                    { label: t.office, value: item.officeName, icon: <BuildingOffice2Icon className="h-5 w-5" /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="mr-2 text-indigo-500 dark:text-indigo-400"
                        >
                          {icon}
                        </motion.div>
                        {label}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{value}</span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedItem(item)}
                  className="mt-6 w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300"
                  aria-label={`${t.viewDetails} for ${item.Name}`}
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  {t.viewDetails}
                </motion.button>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Infinite Scroll Trigger */}
        {state.hasMore && (
          <div ref={loadMoreRef} className="flex justify-center mt-10">
            {state.loading && state.data.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3 text-gray-600 dark:text-gray-400"
              >
                <svg
                  className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v-3m0 22v-3m8-6h3m-22 0H4m16.243-7.757l2.121-2.121m-16.97 0L5.757 5.757M12 9v3m0 0v3m0-3h3m-3 0H9"
                  />
                </svg>
                <span className="text-lg">{t.loading}</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-lg w-full m-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
                    {t.detailsTitle}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    aria-label={t.close}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {[
                    { label: t.workerId, value: selectedItem.id },
                    { label: t.workerName, value: selectedItem.Name },
                    { label: t.workerPhone, value: selectedItem.phone },
                    { label: t.nationality, value: selectedItem.Nationalitycopy },
                    { label: t.passportNumber, value: selectedItem.Passportnumber },
                    { label: t.passportStart, value: formatDate(selectedItem.PassportStart) },
                    { label: t.passportEnd, value: formatDate(selectedItem.PassportEnd) },
                    { label: t.maritalStatus, value: selectedItem.maritalstatus },
                    { label: t.office, value: selectedItem.officeName },
                  ].map(({ label, value }) => (
                    <p key={label}>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {label}:
                      </span>{' '}
                      {value}
                    </p>
                  ))}
                </div>
                <div className="flex space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 flex items-center justify-center bg-gray-500 dark:bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    {t.close}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      window.open(`/homemaid/${selectedItem.id}`, '_blank');
                      setSelectedItem(null);
                    }}
                    className="flex-1 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300"
                  >
                    <EyeIcon className="h-5 w-5 mr-2" />
                    {t.viewMore}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}