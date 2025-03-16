
'use client'


import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';

const employers = [
  { id: 1, name: 'John Doe', position: 'Software Engineer', email: 'john.doe@example.com', imageUrl: '/images/john_doe.jpg' },
  { id: 2, name: 'Jane Smith', position: 'Product Manager', email: 'jane.smith@example.com', imageUrl: '/images/jane_smith.jpg' },
  { id: 3, name: 'Sam Johnson', position: 'UX Designer', email: 'sam.johnson@example.com', imageUrl: '/images/sam_johnson.jpg' },
  // Add more employers as needed
];

const EmployerCard: React.FC<{ employer: { id: number; name: string; position: string; email: string; imageUrl: string } }> = ({ employer }) => {
//   const router = useRouter();


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <img src={employer?.imageUrl} alt={employer?.Name} className="w-full h-32 object-cover rounded-t-lg mb-4" />
      <h2 className="text-xl font-semibold mb-2">{employer?.Name}</h2>
      <p className="text-gray-600 mb-2">{employer.Passportnumber}</p>
      <p className="text-gray-600 mb-4">{employer.phone}</p>
      <button
        className="text-blue-500 underline cursor-pointer"
      >
        View Details
      </button>
    </div>
  );
};

const WorkerListPage: React.FC = () => {

  const [filters, setFilters] = useState({
    phonenumber: "",
    fullname: "",
  });



  const [state, setState] = useState({
    data: [],
    loading: false,
    hasMore: true,
  });

  const pageRef = useRef(1); // Keep track of current page
  const isFetchingRef = useRef(false); // Prevent duplicate fetches

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for debouncing timeout

  // Fetch data function with pagination
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current || !state.hasMore) return;

    isFetchingRef.current = true;
    setState((prevState) => ({ ...prevState, loading: true }));

    try {
      const queryParams = new URLSearchParams({
        fullname: filters.fullname,
        phonenumber: filters.phonenumber,

        page: String(pageRef.current),
      });
const storage =      localStorage.getItem("_item")

      const response = await fetch(`/api/list?${queryParams}`, 
        {
        method: "GET",
        headers: {
          authorization:`bearer ${storage}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

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
      console.error("Error fetching data:", error);
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
      isFetchingRef.current = false;
    }
  }, [filters, state.hasMore]);

  useEffect(() => {
    fetchData(); // Fetch initial data on mount
  }, [fetchData]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = e.target.value;

    // Clear any previous debounce timeout if it's still running
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set the new filter value
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  function getDate(date) {
    const currentDate = new Date(date); // Original date
    // currentDate.setDate(currentDate.getDate() + 90); // Add 90 days
    const form = currentDate.toISOString().split("T")[0];
    console.log(currentDate);
    return form;
  }


  const loadMoreRef = useCallback(
    (node: HTMLDivElement) => {
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
// useCallback

  return (
    <div className="flex   h-screen flex-row">
<Sidebar/>
    
    <div className="min-h-screen w-full bg-gray-100 p-4">
      
<div className="flex rounded-md border-2 border-blue-500 overflow-hidden max-w-md mx-auto font-[sans-serif]">
        <input type="email" placeholder="بحث عن عاملة"
          className="w-full outline-none bg-white text-gray-600 text-sm px-4 py-3" />
        <button type='button' className="flex items-center justify-center bg-[#007bff] px-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="16px" className="fill-white">
            <path
              d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
            </path>
          </svg>
        </button>
      </div>
     
      <header className="bg-white shadow p-4 mb-6">
     
        <h1 className="text-2xl font-semibold">Full list</h1>
      </header>
     
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     
        {state.data.map(employer => (
          <EmployerCard key={employer?.id} employer={employer} />
        ))}
      </main>
    </div>
    </div>
  );
};

export default WorkerListPage;