'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassCircleIcon,
  ArrowPathIcon,
  FolderIcon,
  PencilIcon,
  IdentificationIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CalendarIcon,
  HeartIcon,
  FolderOpenIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

// Translation dictionary
const translations = {
  en: {
    title: 'Workers List',
    searchName: 'Search by name',
    searchPassport: 'Search by passport number',
    searchId: 'Search by worker ID',

    reset: 'Reset',
    search: 'Search',
    noResults: 'No results found',
    loading: 'Loading...',
    workerId: 'Worker ID',
    workerName: 'Worker Name',
    phone: 'Phone',
    nationality: 'Nationality',
    passportNumber: 'Passport Number',
    passportStart: 'Passport Start',
    passportEnd: 'Passport End',
    maritalStatus: 'Marital Status',
    editProfile: 'Edit Profile',
    notAvailable: 'Not Available',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this worker?',
    cancel: 'Cancel',
    delete: 'Delete',
  },
  fra: {
    title: 'Liste des travailleurs',
    searchName: 'Rechercher par nom',
    searchPassport: 'Rechercher par numéro de passeport',
    searchId: 'Rechercher par ID du travailleur',
    reset: 'Réinitialiser',
    search: 'Recherche',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    workerId: 'ID du travailleur',
    workerName: 'Nom du travailleur',
    phone: 'Téléphone',
    nationality: 'Nationalité',
    passportNumber: 'Numéro de passeport',
    passportStart: 'Début du passeport',
    passportEnd: 'Fin du passeport',
    maritalStatus: 'État civil',
    editProfile: 'Modifier le profil',
    notAvailable: 'Non disponible',
    confirmDelete: 'Confirmer la suppression',
    confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer ce travailleur ?',
    cancel: 'Annuler',
    delete: 'Supprimer',
  },
  ur: {
    title: 'ورکرز کی فہرست',
    searchName: 'نام سے تلاش کریں',
    searchPassport: 'پاسپورٹ نمبر سے تلاش کریں',
    searchId: 'ورکر آئی ڈی سے تلاش کریں',
    reset: 'ری سیٹ',
    search: 'تلاش',
    noResults: 'کوئی نتائج نہیں ملے',
    loading: 'لوڈ ہو رہا ہے...',
    workerId: 'ورکر آئی ڈی',
    workerName: 'ورکر کا نام',
    phone: 'فون',
    nationality: 'قومیت',
    passportNumber: 'پاسپورٹ نمبر',
    passportStart: 'پاسپورٹ شروع',
    passportEnd: 'پاسپورٹ ختم',
    maritalStatus: 'ازدواجی حیثیت',
    editProfile: 'پروفائل ایڈٹ کریں',
    notAvailable: 'دستیاب نہیں',
    confirmDelete: 'حذف کی تصدیق کریں',
    confirmDeleteMessage: 'کیا آپ واقعی اس ورکر کو حذف کرنا چاہتے ہیں؟',
    cancel: 'منسوخ کریں',
    delete: 'حذف کریں',
  },
};

export default function Table() {
  const [filters, setFilters] = useState({
    Name: '',
    age: '',
    Passportnumber: '',
    id: '',
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [width, setWidth] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const router = useRouter();

  const ISSERVER = typeof window === 'undefined';
  let storage: string | null;
  if (!ISSERVER) {
    storage = localStorage.getItem('_item');
  }

  const { language } = useLanguage();
  // Fallback to English if language is invalid
  const validLanguages = ['en', 'fra', 'ur'];
  const t = validLanguages.includes(language) ? translations[language] : translations['en'];

  useEffect(() => {
    document.documentElement.dir = language === 'ur' || language === 'ar' ? 'rtl' : 'ltr';


  }, [language]);

  const deleteHm = async (id: string) => {
    try {
      const queryParams = new URLSearchParams({ id });
      const response = await fetch(`/api/list?${queryParams}`, {
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });

      if (response.status === 201) {
        // Remove the deleted item from the data array
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setShowModal(false);
        setItemToDelete(null);
      } else {
        console.error('Failed to delete item:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowModal(true);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setItemToDelete(null);
  };

  const fetchData = async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        Name: filters.Name,
        age: filters.age,
        id: filters.id,
        Passportnumber: filters.Passportnumber,
        page: String(pageRef.current),
      });

      const response = await fetch(`/api/list?${queryParams}`, {
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const res = await response.json();
      if (res && res.length > 0) {
        setData((prevData) => [...prevData, ...res]);
        pageRef.current += 1;
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const loadMoreRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchData();
          }
        },
        { threshold: 1.0 }
      );
      if (node) observer.observe(node);
      return () => observer.disconnect();
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e, column) => {
    const value = e.target?.value;
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    pageRef.current = 1;
    setData([]);
    setHasMore(true);
    fetchData();
  };

  const resetFilters = () => {
    setFilters({ Name: '', age: '', Passportnumber: '', id: '' });
    setData([]);
    pageRef.current = 1;
    setHasMore(true);
    fetchData();
  };

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {t.confirmDelete}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.confirmDeleteMessage}
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  {t.cancel}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteHm(itemToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {t.delete}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50">
        <div className={`flex ${width > 600 ? 'flex-row' : 'flex-col'}`}>
          <Sidebar />
          <div className="container mx-auto p-6 flex-1">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-3xl font-bold text-indigo-500 mb-6"
            >
              {t.title}
            </motion.h1>

            {/* Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              {[
                {
                  key: 'Name',
                  placeholder: t.searchName,
                  icon: <MagnifyingGlassCircleIcon className="h-5 w-5" />,
                }
                // ,
                // {
                //   key: 'id',
                //   placeholder: t.searchId,
                //   icon: <IdentificationIcon className="h-5 w-5" />,
                // },
              ].map(({ key, placeholder, icon }) => (
                <div key={key} className="flex-1 relative group">
                <input
                  type="text"
                  id={`filter-${key}`} // عشان نربطه مع label
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(e, key)}
                  placeholder=" "
                  aria-label={placeholder}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all peer"
                />
                <label
                  htmlFor={`filter-${key}`}
                  className="absolute left-10 top-2.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-600 group-hover:text-indigo-600"
                >
                  {placeholder}
                </label>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-600">
                  {icon}
                </div>
              </div>
              
              ))}
              {/* <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                  aria-label="Reset filters"
                >
                  <ArrowPathIcon className="mr-2 h-5 w-5" />
                  {t.reset}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchData}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                  aria-label="Search"
                >
                  <FolderIcon className="mr-2 h-5 w-5" />
                  {t.search}
                </motion.button>
              </div> */}
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {data.length === 0 && !loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-10"
                  >
                    <FolderOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 text-lg">{t.noResults}</p>
                  </motion.div>
                ) : (
                  data.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <div className="space-y-3">
                        {[
                          { label: t.workerId, value: item.id, icon: <IdentificationIcon className="h-5 w-5" /> },
                          { label: t.workerName, value: item.Name, icon: <UserIcon className="h-5 w-5" /> },
                          { label: t.phone, value: item.phone, icon: <PhoneIcon className="h-5 w-5" /> },
                          { label: t.nationality, value: item.Nationalitycopy, icon: <GlobeAltIcon className="h-5 w-5" /> },
                          {
                            label: t.passportNumber,
                            value: item.Passportnumber,
                            icon: <DocumentTextIcon className="h-5 w-5" />,
                          },
                          {
                            label: t.passportStart,
                            value: item.PassportStart || t.notAvailable,
                            icon: <CalendarIcon className="h-5 w-5" />,
                          },
                          {
                            label: t.passportEnd,
                            value: item.PassportEnd || t.notAvailable,
                            icon: <CalendarIcon className="h-5 w-5" />,
                          },
                          { label: t.maritalStatus, value: item.maritalstatus, icon: <HeartIcon className="h-5 w-5" /> },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700 flex items-center">
                              <span className="text-indigo-500 mr-2">{icon}</span>
                              {label}:
                            </span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
  {/* Preview CV Button */}
  <motion.button
    onClick={() => router.push(`/homemaid/${item.id}`)}
    className="flex-1 px-4 py-2 flex flex-row justify-between bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={`Preview CV for ${item.Name}`}
  >
    <DocumentTextIcon className="w-5 h-5 flex text-center" />
    <span>{t.previewCV || 'Preview CV'}</span>
  </motion.button>

  {/* Edit Button */}
  <motion.button
    onClick={() => router.push(`/edit-cv/${item.id}`)}
    className="flex-1 px-4 py-2 flex flex-row justify-between bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={`Edit profile for ${item.Name}`}
  >
    <PencilIcon className="w-5 h-5" />
    <span>{t.editProfile}</span>
  </motion.button>

  {/* Delete Button */}
  <motion.button
    onClick={() => handleDeleteClick(item.id)}
    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all flex items-center justify-center"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={`Delete profile for ${item.Name}`}
  >
    <TrashIcon className="w-5 h-5" />
  </motion.button>
</div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center mt-8">
                {loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="h-6 w-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v1m0 14v1m8-8h1m-14 0H4m15.071-4.071l-1.414 1.414M6.343 17.657l-1.414 1.414M17.657 6.343l1.414-1.414M4.929 19.071l1.414-1.414"
                      />
                    </svg>
                    <span className="text-gray-600">{t.loading}</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}