'use client'

import jwt from "jsonwebtoken";
import { useEffect, useState, useCallback, useRef, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navigationbar";


export default function Table() {
  const [filters, setFilters] = useState({
    phonenumber: "",Passportnumber:"",
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

      const response = await fetch(`/api/availablelist?${queryParams}`, {
        method: "GET",
        headers: {
          authorization:`bearer ${storage}`,

          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

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

  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Function to update the screen width
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set the initial screen width
    handleResize();

    // Add event listener for resizing
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  return (
    <div className={` ${width > 600 ? "flex flex-row" : ""}   `}>
    
    {width > 600 ?<Sidebar/>:<div>
      
      <Navbar/>
      </div>}
      <div className="container mx-auto p-6 mr-2">

        <h1
          className={`text-left font-medium text-2xl mb-4 `}
        >
          Available Homemaids
        </h1>
        {/* Filter Section */}
        <div className="lg:flex sm:justify-between md:gap-10 sm:gap-10 lg:gap-3  mb-4 lg:flex-row md:flex-column sm:flex-column">
          <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.Name}
              onChange={(e) => handleFilterChange(e, "Name")}
              placeholder="بحث باسم العاملة"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.Passportnumber}
              onChange={(e) => handleFilterChange(e, "Passportnumber")}
              placeholder="بحث برقم الجواز"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
{/* 
          <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.id}
              onChange={(e) => handleFilterChange(e, "id")}
              placeholder="بحث برقم العاملة"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div> */}
          <div className="flex flex-row justify-center">
          <div className="flex  px-1">
            <button
              className={
                "text-[#EFF7F9]  bg-[#3D4C73]  text-lg py-2 px-4 rounded-md transition-all duration-300"
              }
              onClick={() => {
                isFetchingRef.current = false;
                setHasMore(true);
                setFilters({
                  age: "",
                  id: "",
                  Passportnumber: "",
                  Name: "",
                });
                setData([]);
                pageRef.current = 1;
                fetchData();
              }}
            >
              <h1>اعادة ضبط</h1>
            </button>
          </div>
          <div className="flex px-1">
            <button
              className={
                "text-[#EFF7F9]  bg-[#3D4C73]  text-lg py-2 px-4 rounded-md transition-all duration-300"
              }
              onClick={() => {
                isFetchingRef.current = false;
                setHasMore(true);
                setData([]);
                pageRef.current = 1;
                fetchData();
              }}
            >
              <h1 >بحث</h1>
            </button>
          </div>
          </div>
        </div>



  {/* Table */}
  <div className="grid overflow-y-scroll grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4  ">
  {state.data.length === 0 ? (
    <div className="col-span-full p-3 text-center text-sm text-gray-500">
      No results found
    </div>
  ) : (
    state.data.map((item) => (
      <div
        key={item.id}
        className=" bg-gray-100 p-4  shadow-md rounded-md flex flex-col"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">رقم العاملة:</span>
          <span className="text-gray-600">{item.id}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">اسم العاملة:</span>
          <span className="text-gray-600">{item.Name}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">جوال العاملة:</span>
          <span className="text-gray-600">{item.phone}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">الجنسية:</span>
          <span className="text-gray-600">{item.Nationalitycopy}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">رقم جواز السفر:</span>
          <span className="text-gray-600">{item.Passportnumber}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">بداية الجواز:</span>
          <span className="text-gray-600">
            {item?.PassportStart ? item?.PassportStart : null}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">نهاية الجواز:</span>
          <span className="text-gray-600">
            {item?.PassportEnd ? item?.PassportEnd : null}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">الحالة الاجتماعية:</span>
          <span className="text-gray-600">{item.maritalstatus}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">المكتب:</span>
          <span className="text-gray-600">{item.officeName}</span>
        </div>
        <div className="mt-auto text-center">
          <button
            className="text-[#EFF7F9] bg-[#3D4C73] text-lg py-2 px-4 rounded-md transition-all duration-300"
            onClick={() => {
              const url = "/admin/cvdetails/" + item.id;
              window.open(url, "_blank"); // Open in new window
            }}
          >
            <h1>عرض</h1>
          </button>
        </div>
      </div>
    ))
  )}
</div>
        {/* Infinite scroll trigger */}
        {state.hasMore && (
          <div ref={loadMoreRef} className="flex justify-center mt-6">
            {state.loading && (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4V1m0 22v-3m8-6h3m-22 0H4m16.243-7.757l2.121-2.121m-16.97 0L5.757 5.757M12 9v3m0 0v3m0-3h3m-3 0H9"
                  />
                </svg>
                Loading...
              </div>
            )}
          </div>
        )}
      </div>
      </div>
  );
}

