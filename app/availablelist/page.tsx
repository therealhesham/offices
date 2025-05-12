'use client';
import jwt from 'jsonwebtoken';
import { useEffect, useState, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Table() {
  const [filters, setFilters] = useState({
    phonenumber: '',
    Passportnumber: '',
    fullname: '',
  });

  const [state, setState] = useState({
    data: [],
    loading: false,
    hasMore: true,
    error: null,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const debounceTimeoutRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current || !state.hasMore) return;

    isFetchingRef.current = true;
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    try {
      const queryParams = new URLSearchParams({
        fullname: filters.fullname,
        phonenumber: filters.phonenumber,
        Passportnumber: filters.Passportnumber,
        page: String(pageRef.current),
      });
      const storage = typeof window !== 'undefined' ? localStorage.getItem('_item') : null;

      const response = await fetch(`/api/availablelist?${queryParams}`, {
        method: 'GET',
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const res = await response.json();

      if (res && res.length > 0) {
        setState((prevState) => ({
          ...prevState,
          data: [...prevState.data, ...res],
        }));
        pageRef.current += 1;
      } else {
        setState((prevState) => ({ ...prevState, hasMore: false }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setState((prevState) => ({ ...prevState, error: 'فشل في تحميل البيانات. حاول مرة أخرى.' }));
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
      isFetchingRef.current = false;
    }
  }, [filters, state.hasMore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e, column) => {
    const value = e.target.value;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));

    debounceTimeoutRef.current = setTimeout(() => {
      pageRef.current = 1;
      setState((prevState) => ({ ...prevState, data: [], hasMore: true }));
      fetchData();
    }, 500);
  };

  function getDate(date) {
    const currentDate = new Date(date);
    const form = currentDate.toISOString().split('T')[0];
    return form;
  }

  const loadMoreRef = useCallback(
    (node) => {
      if (state.loading || !state.hasMore) return;
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
    [fetchData, state.loading, state.hasMore]
  );

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${width > 768 ? 'flex flex-row' : 'flex flex-col'} font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-indigo-50'}`}>
<Sidebar/>
      <div className="flex-1 p-4 md:p-8 overflow-auto relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-indigo-900 dark:text-indigo-200 mb-8 text-center tracking-tight"
        >
          العاملات المتوفرات
        </motion.h1>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl sticky top-0 z-10 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
              <input
                type="text"
                value={filters.fullname}
                onChange={(e) => handleFilterChange(e, 'fullname')}
                placeholder=" "
                aria-label="Search by name"
                className="w-full p-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 peer"
              />
              <label className="absolute right-12 top-4 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                بحث باسم العاملة
              </label>
              <svg className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={filters.Passportnumber}
                onChange={(e) => handleFilterChange(e, 'Passportnumber')}
                placeholder=" "
                aria-label="Search by passport number"
                className="w-full p-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 peer"
              />
              <label className="absolute right-12 top-4 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                بحث برقم الجواز
              </label>
              <svg className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  isFetchingRef.current = false;
                  setState((prevState) => ({ ...prevState, hasMore: true, data: [] }));
                  setFilters({
                    phonenumber: '',
                    Passportnumber: '',
                    fullname: '',
                  });
                  pageRef.current = 1;
                  fetchData();
                }}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white py-4 rounded-lg hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300"
                aria-label="Reset filters"
              >
                إعادة ضبط
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  isFetchingRef.current = false;
                  setState((prevState) => ({ ...prevState, hasMore: true, data: [] }));
                  pageRef.current = 1;
                  fetchData();
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300"
                aria-label="Search"
              >
                بحث
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
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{state.error}</span>
              <button
                onClick={() => fetchData()}
                className="ml-4 text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                إعادة المحاولة
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {state.data.length === 0 && !state.loading && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="mt-2">لا توجد نتائج</p>
            </div>
          )}
          {state.loading && !state.data.length ? (
            // Skeleton Loader
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
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4" />
                      </svg>
                      رقم العاملة:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{item.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      اسم العاملة:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{item.Name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      جوال العاملة:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{item.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      الجنسية:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{item.Nationalitycopy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      رقم جواز السفر:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{item.Passportnumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">بداية الجواز:</span>
                    <span className="text-gray-600 dark:text-gray-400">{item?.PassportStart || 'غير متوفر'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">نهاية الجواز:</span>
                    <span className="text-gray-600 dark:text-gray-400">{item?.PassportEnd || 'غير متوفر'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">الحالة الاجتماعية:</span>
                    <span className="text-gray-600 dark:text-gray-400">{item.maritalstatus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">المكتب:</span>
                    <span className="text-gray-600 dark:text-gray-400">{item.officeName}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedItem(item)}
                  className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300"
                  aria-label={`View details for ${item.Name}`}
                >
                  عرض التفاصيل
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
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v-3m0 22v-3m8-6h3m-22 0H4m16.243-7.757l2.121-2.121m-16.97 0L5.757 5.757M12 9v3m0 0v3m0-3h3m-3 0H9"
                  />
                </svg>
                <span className="text-lg">جار التحميل...</span>
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
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">تفاصيل العاملة</h2>
                <div className="space-y-3">
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">رقم العاملة:</span> {selectedItem.id}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">اسم العاملة:</span> {selectedItem.Name}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">جوال العاملة:</span> {selectedItem.phone}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">الجنسية:</span> {selectedItem.Nationalitycopy}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">رقم جواز السفر:</span> {selectedItem.Passportnumber}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">بداية الجواز:</span> {selectedItem?.PassportStart || 'غير متوفر'}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">نهاية الجواز:</span> {selectedItem?.PassportEnd || 'غير متوفر'}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">الحالة الاجتماعية:</span> {selectedItem.maritalstatus}</p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">المكتب:</span> {selectedItem.officeName}</p>
                </div>
                <div className="flex space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    إغلاق
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = `/admin/cvdetails/${selectedItem.id}`;
                      window.open(url, '_blank');
                      setSelectedItem(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300"
                  >
                    عرض المزيد
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