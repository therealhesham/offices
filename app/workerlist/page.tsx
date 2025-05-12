'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RefreshCw } from 'lucide-react'; // Using Lucide icons
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';
import { PencilIcon } from '@heroicons/react/24/solid';

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

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const router = useRouter();

  const ISSERVER = typeof window === 'undefined';
  let storage: string | null, lang: string | null;
  if (!ISSERVER) {
    storage = localStorage.getItem('_item');
    lang = localStorage.getItem('language');
  }

  // Fetch data with pagination
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

  // Infinite scroll observer
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
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    // Reset and fetch on filter change
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

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
    <div className={`flex ${width > 600 ? 'flex-row' : 'flex-col'}`}>
     <Sidebar />

      <div className="container mx-auto p-6 flex-1">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-3xl font-bold text-indigo-800 mb-6"
          >
            قائمة العاملات
          </motion.h1>

          {/* Filter Section */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.Name}
                  onChange={(e) => handleFilterChange(e, 'Name')}
                  placeholder="بحث باسم العاملة"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.Passportnumber}
                  onChange={(e) => handleFilterChange(e, 'Passportnumber')}
                  placeholder="بحث برقم الجواز"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.id}
                  onChange={(e) => handleFilterChange(e, 'id')}
                  placeholder="بحث برقم العاملة"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                إعادة ضبط
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                <Filter className="mr-2" size={16} />
                بحث
              </motion.button>
            </div>
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
                  <img
                    src="/empty-state-illustration.svg" // Add your own illustration
                    alt="No results"
                    className="mx-auto h-40 mb-4"
                  />
                  <p className="text-gray-500 text-lg">لا توجد نتائج لعرضها</p>
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
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">رقم العاملة:</span>
                        <span className="text-gray-600">{item.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">اسم العاملة:</span>
                        <span className="text-gray-600">{item.Name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">جوال العاملة:</span>
                        <span className="text-gray-600">{item.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">الجنسية:</span>
                        <span className="text-gray-600">{item.Nationalitycopy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">رقم جواز السفر:</span>
                        <span className="text-gray-600">{item.Passportnumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">بداية الجواز:</span>
                        <span className="text-gray-600">{item.PassportStart || 'غير متوفر'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">نهاية الجواز:</span>
                        <span className="text-gray-600">{item.PassportEnd || 'غير متوفر'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">الحالة الاجتماعية:</span>
                        <span className="text-gray-600">{item.maritalstatus}</span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => router.push(`/edit-cv/${item.id}`)}
                      className="mt-4 w-full px-4 py-2 flex flex-row justify-between  bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilIcon className="w-5 h-5" />
              <span>Edit Profile</span>
            </motion.button>
                    
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
                  <span className="text-gray-600">جارٍ التحميل...</span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}