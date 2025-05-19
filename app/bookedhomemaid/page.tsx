'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  IdentificationIcon,
  CalendarIcon,
  HeartIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  FolderOpenIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';
import { useLanguage } from '../contexts/LanguageContext';

// Translation object for all text
const translations = {
  en: {
    title: 'Booked Homemaids',
    searchByName: 'Search by name',
    searchByPassport: 'Search by passport number',
    reset: 'Reset',
    search: 'Search',
    error: 'Failed to load data. Please try again.',
    noResults: 'No results found',
    loading: 'Loading...',
    id: 'ID',
    name: 'Name',
    phone: 'Phone',
    nationality: 'Nationality',
    passportNumber: 'Passport Number',
    passportStart: 'Passport Start',
    passportEnd: 'Passport End',
    maritalStatus: 'Marital Status',
    bookingStatus: 'Booking Status',
    details: 'Details',
    timeline: 'Application Timeline',
    notAvailable: 'N/A',
  },
  fra: {
    title: 'Réservée',
    searchByName: 'Rechercher par nom',
    searchByPassport: 'Rechercher par numéro de passeport',
    reset: 'Réinitialiser',
    search: 'Recherche',
    error: 'Échec du chargement des données. Veuillez réessayer.',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    id: 'ID',
    name: 'Nom',
    phone: 'Téléphone',
    nationality: 'Nationalité',
    passportNumber: 'Numéro de passeport',
    passportStart: 'Début du passeport',
    passportEnd: 'Fin du passeport',
    maritalStatus: 'État civil',
    bookingStatus: 'Statut de réservation',
    details: 'Les détails',
    timeline: "Timeline de l'app",
    notAvailable: 'Non disponible',
  },
  ur: {
    title: 'بک کروایا',
    searchByName: 'نام سے تلاش کریں',
    searchByPassport: 'پاسپورٹ نمبر سے تلاش کریں',
    reset: 'ری سیٹ',
    search: 'تلاش',
    error: 'ڈیٹا لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔',
    noResults: 'کوئی نتائج نہیں ملے',
    loading: 'لوڈ ہو رہا ہے...',
    id: 'آئی ڈی',
    name: 'نام',
    phone: 'فون',
    nationality: 'قومیت',
    passportNumber: 'پاسپورٹ نمبر',
    passportStart: 'پاسپورٹ شروع',
    passportEnd: 'پاسپورٹ ختم',
    maritalStatus: 'ازدواجی حیثیت',
    bookingStatus: 'بکنگ کی حالت',
    details: 'تفصيلات',
    timeline: 'وقتِ درخواست',
    notAvailable: 'دستیاب نہیں',
  },
};

// Utility to format date
function getDate(date) {
  if (!date) return translations.en.notAvailable;
  const currentDate = new Date(date);
  return currentDate.toISOString().split('T')[0];
}

export default function Table() {
  const [filters, setFilters] = useState({
    Name: '',
    age: '',
    Passportnumber: '',
    id: '',
  });
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [storage, setStorage] = useState(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('_item');
      setStorage(token);
    }
  }, []);

  const fetchData = async (reset = false) => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        Name: filters.Name,
        age: filters.age,
        id: filters.id,
        Passportnumber: filters.Passportnumber,
        page: String(pageRef.current),
      });

      const response = await fetch(`/api/bookedhomemaid?${queryParams}`, {
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'get',
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      const res = await response.json();
      if (res && res.length > 0) {
        setData((prevData) => (reset ? res : [...prevData, ...res]));
        pageRef.current += 1;
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(t.error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const makeRequest = async (url, body) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.status === 200;
  };

  const restore = async (id, homeMaidId) => {
    const success = await makeRequest('/api/restoreorders', { id, homeMaidId });
    if (success) router.push('/admin/neworders');
  };

  const loadMoreRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) fetchData();
        },
        { threshold: 1.0 }
      );
      if (node) observer.observe(node);
      return () => observer.disconnect();
    },
    [loading, hasMore, storage, filters]
  );

  useEffect(() => {
    if (storage) fetchData(true);
  }, [storage, filters]);

  const handleFilterChange = (e, column) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, [column]: value }));
    isFetchingRef.current = false;
    setHasMore(true);
    pageRef.current = 1;
  };

  const handleUpdate = (id) => {
    router.push(`./neworder/${id}`);
  };

  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWidth(window.innerWidth);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ur' || language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`flex ${width > 600 ? 'flex-row' : 'flex-col'}`}>
        <Sidebar />
        <div className="container mx-auto p-6 flex-1">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight"
          >
            {t.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: 'Name',
                  label: t.searchByName,
                  icon: <MagnifyingGlassIcon className="h-5 w-5" />,
                }
              ].map(({ key, label, icon }) => (
                <div key={key} className="relative group">
                  <input
                    type="text"
                    id={`filter-${key}`}
                    value={filters[key]}
                    onChange={(e) => handleFilterChange(e, key)}
                    placeholder=" "
                    aria-label={label}
                    className="w-full p-4 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50 peer"
                  />
                  <label
                    htmlFor={`filter-${key}`}
                    className="absolute left-12 top-4 text-gray-500 transition-all duration-300
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600
                      group-hover:text-indigo-600"
                  >
                    {label}
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute left-3 top-4 text-gray-400 group-hover:text-indigo-600"
                  >
                    {icon}
                  </motion.div>
                </div>
              ))}
              {/* <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    isFetchingRef.current = false;
                    setHasMore(true);
                    setFilters({ age: '', id: '', Passportnumber: '', Name: '' });
                    setData([]);
                    pageRef.current = 1;
                    fetchData(true);
                  }}
                  className="flex-1 flex items-center justify-center bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-sm"
                  aria-label={t.reset}
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  <span>{t.reset}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    isFetchingRef.current = false;
                    setHasMore(true);
                    setData([]);
                    pageRef.current = 1;
                    fetchData(true);
                  }}
                  className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm"
                  aria-label={t.search}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  <span>{t.search}</span>
                </motion.button>
              </div> */}
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center text-red-600 bg-red-50 p-4 rounded-lg text-center mb-6 shadow-sm"
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
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {data.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center text-gray-500 py-10"
                >
                  <FolderOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">{t.noResults}</p>
                </motion.div>
              )}
              {loading && !data.length ? (
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-white p-6 rounded-xl shadow-lg relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </motion.div>
                ))
              ) : (
                data.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="space-y-3">
                      {[
                        { label: t.id, value: item.id, icon: <IdentificationIcon className="h-5 w-5" /> },
                        { label: t.name, value: item.Name, icon: <UserIcon className="h-5 w-5" /> },
                        { label: t.phone, value: item.phone, icon: <PhoneIcon className="h-5 w-5" /> },
                        { label: t.nationality, value: item.Nationalitycopy, icon: <GlobeAltIcon className="h-5 w-5" /> },
                        { label: t.passportNumber, value: item.Passportnumber, icon: <DocumentTextIcon className="h-5 w-5" /> },
                        { label: t.passportStart, value: getDate(item.PassportStart), icon: <CalendarIcon className="h-5 w-5" /> },
                        { label: t.passportEnd, value: getDate(item.PassportEnd), icon: <CalendarIcon className="h-5 w-5" /> },
                        { label: t.maritalStatus, value: item.maritalstatus, icon: <HeartIcon className="h-5 w-5" /> },
                        {
                          label: t.bookingStatus,
                          value: item.NewOrder[0].bookingstatus,
                          icon: <TagIcon className="h-5 w-5" />,
                          isStatus: true,
                        },
                      ].map(({ label, value, icon, isStatus }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700 flex items-center">
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              className="mr-2 text-indigo-500"
                            >
                              {icon}
                            </motion.div>
                            {label}:
                          </span>
                          {isStatus ? (
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${getStatusColor(value)}`}
                            >
                              {value}
                            </span>
                          ) : (
                            <span className="text-gray-600">{value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const url = `/homemaid/${item.id}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full flex items-center justify-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm"
                        aria-label={`${t.details} for ${item.Name}`}
                      >
                        <EyeIcon className="h-5 w-5 mr-2" />
                        <span>{t.details}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const url = `/timeline/${item?.NewOrder[0].id}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full flex items-center justify-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm"
                        aria-label={`${t.timeline} for ${item.Name}`}
                      >
                        <ClockIcon className="h-5 w-5 mr-2" />
                        <span>{t.timeline}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center mt-8">
              {loading && data.length > 0 && (
                <motion.div
                  className="flex items-center space-x-2 text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <svg
                    className="animate-spin h-5 w-5 text-indigo-600"
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
                  <span>{t.loading}</span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}