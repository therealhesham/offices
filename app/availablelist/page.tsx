'use client'

import jwt from "jsonwebtoken";
import { useEffect, useState, useCallback, useRef, useContext } from "react";
import Sidebar from "../components/Sidebar";


export default function Table() {
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

  return (
    <div className="flex   h-screen flex-row">
<Sidebar/>
      <div className=" mx-auto p-6 w-full">
        <h1
          className={`text-left font-medium text-2xl mb-4 `}
        >
          Available Homemaids
        </h1>

        {/* Filter Section */}
        <div className="flex justify-between mb-4">
          <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.fullname}
              onChange={(e) => handleFilterChange(e, "fullname")}
              placeholder="بحث بالاسم"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.phonenumber}
              onChange={(e) => handleFilterChange(e, "phonenumber")}
              placeholder="بحث برقم الجوال"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.Nationality}
              onChange={(e) => handleFilterChange(e, "email")}
              placeholder="بحث برقم الجوال"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div> */}

          {/* <div className="flex-1 px-2">
            <input
              type="text"
              value={filters.HomemaidId}
              onChange={(e) => handleFilterChange(e, "HomemaidId")}
              placeholder="Filter by CV"
              className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div> */}
          <div className="flex-1 px-1">
            <button
              className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 hover:shadow-lg focus:outline-none transition-all duration-200 ease-in-out"
              onClick={() => {
                isFetchingRef.current = false;
                setState({ data: [], hasMore: true, loading: false });
                setFilters({
                  fullname: "",
                  phonenumber: "",
                });
                pageRef.current = 1;
                fetchData();
              }}
            >
              اعادة ضبط
            </button>
          </div>
          <div className="flex-1 px-1">
            <button
              className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 hover:shadow-lg focus:outline-none transition-all duration-200 ease-in-out"
              // variant="contained"
              // color="info"
              onClick={() => {
                isFetchingRef.current = false;
                setState({ data: [], hasMore: true, loading: false });
                pageRef.current = 1;
                fetchData();
              }}
            >
              بحث
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-md">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3 text-center text-sm font-medium">م</th>
              <th className="p-3 text-center text-sm font-medium">الاسم</th>
              <th className="p-3 text-center text-sm font-medium">
                جواز السفر
              </th>
              <th className="p-3 text-center text-sm font-medium">الجوال</th>
              <th className="p-3 text-center text-sm font-medium">
                تاريخ اضافة العاملة
              </th>
              <th className="p-3 text-center text-sm font-medium">
                عدد الطلبات
              </th>
            </tr>
          </thead>
          <tbody>
            {state.data.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-3 text-center text-sm text-gray-500"
                >
                  No results found
                </td>
              </tr>
            ) : (
              state.data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3 text-sm text-pretty text-gray-600">
                    {item.id}
                  </td>
                  <td className="p-3 text-sm text-center text-gray-600">
                    {item.Name}
                  </td>
                  <td className="p-3 text-sm text-center text-gray-600">
                    {item.Passportnumber}
                  </td>
                  <td className="p-3 text-sm text-center text-gray-600">
                    {item.phone}
                  </td>
                  <td className="p-3 text-sm text-center text-gray-600">
                    {item?.createdat ? getDate(item.createdat) : null}
                  </td>
                  <td className="p-3 text-sm text-center text-gray-600">
                    <button
                      color="warning"
                      
                    >
                      {/* {item._count.orders} */}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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

