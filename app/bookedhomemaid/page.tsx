'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added for animations
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';

// Utility to format date
function getDate(date) {
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const storage = typeof window !== 'undefined' ? localStorage.getItem('_item') : null;

  const fetchData = async () => {
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
        setData((prevData) => [...prevData, ...res]);
        pageRef.current += 1;
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
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
    [loading, hasMore]
  );

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced filter change handler
  const handleFilterChange = (e, column) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  const router = useRouter();
  const handleUpdate = (id) => {
    router.push(`./neworder/${id}`);
  };

  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Status color mapping for booking status
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

  return (

        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className={`flex ${width > 600 ? 'flex-row' : 'flex-col'}`}>
           <Sidebar />
    
            <div className="container mx-auto p-6 flex-1">
        {/* Page Title with Animation */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight"
        >
          Booked Homemaids
        </motion.h1>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                value={filters.Name}
                onChange={(e) => handleFilterChange(e, 'Name')}
                placeholder="Search by name"
                aria-label="Search by name"
                className="w-full p-4 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="relative">
              <input
                type="text"
                value={filters.Passportnumber}
                onChange={(e) => handleFilterChange(e, 'Passportnumber')}
                placeholder="Search by passport number"
                aria-label="Search by passport number"
                className="w-full p-4 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  isFetchingRef.current = false;
                  setHasMore(true);
                  setFilters({ age: '', id: '', Passportnumber: '', Name: '' });
                  setData([]);
                  pageRef.current = 1;
                  fetchData();
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-sm"
                aria-label="Reset filters"
              >
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  isFetchingRef.current = false;
                  setHasMore(true);
                  setData([]);
                  pageRef.current = 1;
                  fetchData();
                }}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm"
                aria-label="Search"
              >
                Search
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 bg-red-50 p-4 rounded-lg text-center mb-6 shadow-sm"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {data.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-500 py-10"
              >
                No results found
              </motion.div>
            )}
            {loading && !data.length ? (
              // Enhanced Skeleton Loader with Shimmer
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
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">ID:</span>
                      <span className="text-gray-600">{item.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-gray-600">{item.Name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Phone:</span>
                      <span className="text-gray-600">{item.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Nationality:</span>
                      <span className="text-gray-600">{item.Nationalitycopy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Passport:</span>
                      <span className="text-gray-600">{item.Passportnumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Passport Start:</span>
                      <span className="text-gray-600">{item?.PassportStart || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Passport End:</span>
                      <span className="text-gray-600">{item?.PassportEnd || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Marital Status:</span>
                      <span className="text-gray-600">{item.maritalstatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Booking Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                          item.NewOrder[0].bookingstatus
                        )}`}
                      >
                        {item.NewOrder[0].bookingstatus}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = `/homemaid/${item.id}`;
                      window.open(url, '_blank');
                    }}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm"
                    aria-label={`View details for ${item.Name}`}
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = `/timeline/${item?.NewOrder[0].id}`;
                      window.open(url, '_blank');
                    }}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm"
                    aria-label={`View details for ${item.Name}`}
                  >
                    Order Details
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Infinite Scroll Trigger */}
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
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v-3m0 22v-3m8-6h3m-22 0H4m16.243-7.757l2.121-2.121m-16.97 0L5.757 5.757M12 9v3m0 0v3m0-3h3m-3 0H9"
                  />
                </svg>
                <span>Loading...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>
      </div>

    </div>
  );
}