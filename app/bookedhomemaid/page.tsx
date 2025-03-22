'use client'
// import { BookFilled } from "@ant-design/icons";
// import Layout from "example/containers/Layout";
import { useRouter } from "next/navigation";
import translate from "translate";
import { useEffect, useState, useCallback, useRef } from "react";
import jwt from "jsonwebtoken";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navigationbar";
// import { Button } from "@mui/material";
// import Style from "styles/Home.module.css";

export default function Table() {
  const [filters, setFilters] = useState({
    Name: "",
    age: "",
    Passportnumber: "",
    id: "",
  });

  function getDate(date) {
    const currentDate = new Date(date); // Original date
    // currentDate.setDate(currentDate.getDate() + 90); // Add 90 days
    const form = currentDate.toISOString().split("T")[0];
    console.log(currentDate);
    return form;
  }
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMore, setHasMore] = useState(true); // To check if there is more data to load

  const pageRef = useRef(1); // Use a ref to keep track of the current page number
  const isFetchingRef = useRef(false); // Ref to track whether data is being fetched
  var storage;
  var lang;
    const ISSERVER = typeof window === "undefined";
    if (!ISSERVER) {  
      var storage =localStorage.getItem("_item")
    var lang=  localStorage.getItem("language")
  
  }
  // Fetch data with pagination
  const fetchData = async () => {
    if (isFetchingRef.current || !hasMore) return; // Prevent duplicate fetches if already loading
    isFetchingRef.current = true;
    setLoading(true);

    try {
      // Build the query string for filters
      const queryParams = new URLSearchParams({
        Name: filters.Name,
        age: filters.age,
        id: filters.id,
        Passportnumber: filters.Passportnumber,
        // Nationalitycopy: filters.Nationality,
        page: String(pageRef.current),
      });

      const response = await fetch(`/api/bookedhomemaid?${queryParams}`, {
        headers: {
          authorization:`bearer ${storage}`,

          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "get",
      });

      const res = await response.json();
      if (res && res.length > 0) {
        setData((prevData) => [...prevData, ...res]); // Append new data
        pageRef.current += 1; // Increment page using ref
      } else {
        setHasMore(false); // No more data to load
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const makeRequest = async (url: string, body: object) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.status === 200;
  };

  const restore = async (id: string, homeMaidId: string) => {
    const success = await makeRequest("/api/restoreorders", {
      id,
      homeMaidId,
    });
    if (success) router.push("/admin/neworders");
  };

  // Use a callback to call fetchData when the user reaches the bottom
  const loadMoreRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || !hasMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchData(); // Fetch next page of data
          }
        },
        { threshold: 1.0 }
      );

      if (node) observer.observe(node);

      return () => observer.disconnect();
    },
    [loading, hasMore]
  );

  // useEffect to fetch the first page of data on mount
  useEffect(() => {
    fetchData(); // Fetch the first page of data
  }, []); // Only run once on mount

  // useEffect to fetch data when filters change
  // useEffect(() => {
  //   // Reset page and data on filter change
  //   pageRef.current = 1;
  //   setData([]);
  //   setHasMore(true);
  //   fetchData();
  // }, [filters]); // Only re-run when filters change

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const router = useRouter();
  const handleUpdate = (id) => {
    router.push("./neworder/" + id);
  };


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
    // <Layout>
<div className={` ${width > 600 ? "flex flex-row" : ""}   `}>

{width > 600 ?<Sidebar/>:<div>
  
  <Navbar/>
  </div>}
      
      <div className="container mx-auto p-6 mr-2">
        <h1
          className={`text-center font-medium text-2xl mb-4 `}
        >
         Booked Homemaids
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

          <div className="flex-1 px-1">
            <button
              className={
                "text-[#EFF7F9]  bg-[#3D4C73]  text-sm py-2 px-4 rounded-md transition-all duration-300"
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
          <div className="flex-1 px-1">
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
        <div className="grid overflow-y-scroll grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
  {data.length === 0 ? (
    <div className="col-span-full p-3 text-center text-sm text-gray-500">
      No results found
    </div>
  ) : (
    data.map((item) => (
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
          <span className="font-medium text-gray-700">حالة الطلب:</span>
          <span className="text-gray-600">{item.NewOrder[0].bookingstatus}</span>
        </div>
        {/* <div className="mt-auto text-center">
          <button
            className="text-[#EFF7F9] bg-[#3D4C73] text-lg py-2 px-4 rounded-md transition-all duration-300"
            onClick={() => {
              const url = "/admin/cvdetails/" + item.id;
              window.open(url, "_blank"); // Open in new window
            }}
          >
            <h1>عرض</h1>
          </button> */}
        {/* </div> */}
      </div>
    ))
  )}
</div>

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div
            ref={loadMoreRef} // Use IntersectionObserver to trigger load more
            className="flex justify-center mt-6"
          >
            {loading && (
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

    // </Layout>
  );
}
