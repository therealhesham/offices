//@ts-ignore
//@ts-noCheck

// pages/index.js


// import { useState } from 'react';

'use client'


import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/navigationbar";

export default function Home() {

  
  var storage;
var lang;
  const ISSERVER = typeof window === "undefined";
  if (!ISSERVER) {  
    var storage =localStorage.getItem("_item")
  var lang=  localStorage.getItem("language")

}
// alert(storage)
  const [messages,setMessages]=useState([])
  // Example new reservations data (you can replace this with dynamic data)
 
  function getDate(date) {
    const currentDate = new Date(date); // Original date
    // currentDate.setDate(currentDate.getDate() + 90); // Add 90 days
    const form = currentDate.toISOString().split("T")[0];
    console.log(currentDate);
    return form;
  }
 
const router = useRouter()
const [dataList,setDataList]=useState([])

const [counting,setCounting]=useState({})
  const fetchCounter =async()=>{
    if(!storage) return router.push("/login")
const fetcher = await fetch("/api/counter", {
  method: "GET",
  headers: {
    authorization:`bearer ${storage}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
}) 

const counters = await fetcher.json()
setCounting(counters)

}
// var storage;

// var storage =      localStorage.getItem("_item")
const fetchRecentData = async ()=>{
  if(!storage) return router.push("/login")

const fetchList= await fetch("/api/recentlist",{method:"GET",headers:{
  authorization:`bearer ${storage}`,
  
            Accept: "application/json",
            "Content-Type": "application/json"}})
            const jsonifyList = await fetchList.json();
            setDataList(jsonifyList)

}
useEffect(()=>{

  fetchCounter();
  fetchRecentData();
},[])
// alert(lang)



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
    <div className={` ${width > 600 ? "flex  flex-row" : ""}  h-screen `}>
    
    {width > 600 ?<Sidebar/>:<div>
      
      <Navbar/>
      </div>}
      <div  className=" mx-auto p-6 mr-2 min-h-screen  bg-gray-100 flex-1  overflow-auto">

        {/* Dashboard Widgets */}
        <div className="p-6 w-full">

        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="text-xl font-semibold text-black">{lang=="fra"?"bienvenu":lang=="ur"?"خوش امديد":"welcome"}</div>
          <div className="flex items-center space-x-4">
            {/* <Link legacyBehavior href='/newemployer'>  */}
                       <button 
             onClick={()=>router.push("/newemployer")}
            className="text-white cursor-pointer hover:text-gray-700 bg-purple-500 p-3 rounded-md">{lang=="fra"?"Ajouter une femme de ménage":lang=="ur"?"گھریلو ملازمہ شامل کریں۔":"Add Homemaid"}</button>
            {/* </Link> */}

          </div>
        </div>

          <h1 className="text-3xl font-bold mb-8">{lang=="fra"?"tableau de bord":lang=="ur"?"ڈیش بورڈ":"Dashboard Overview"}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Widget 1 */}
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h2 className="font-semibold text-lg text-purple-500">{lang=="fra"?"Nouvelles réservations":lang=="ur"?"نئے تحفظات":"New Reservations"}</h2>
              <p className="text-xl">{counting?.recent}</p>
            </div>

            {/* Widget 2 */}
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h2 className="font-semibold text-lg text-purple-500">{lang=="fra"?"Femmes de ménage disponibles":lang=="ur"?"دستیاب گھریلو ملازمہ":"Available Homemaids"}</h2>
              <p className="text-xl">{counting?.countAvailable}</p>
            </div>

            {/* Widget 3 */}
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h2 className="font-semibold text-lg text-purple-500">{lang=="fra"?"réservée":lang=="ur"?"بک کروایا":"Booked"}</h2>
              <p className="text-xl">{counting?.countRelated}</p>
            </div>

            {/* New Reservations Widget */}
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h2 className="font-semibold text-lg">{lang=="fra"?"Total":lang=="ur"?"کل":"Total"}</h2>
              <p className="text-xl">{counting?.total}</p>


            </div>
          </div>


          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">{lang=="fra"?"messages":lang=="ur"?"پیغامات":"Messages"}</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
              <ul>
                {messages?.map((reservation) => (
                  <li key={reservation.id} className="flex justify-between p-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold">{reservation.name}</p>
                      <p className="text-sm text-gray-600">{reservation.date}</p>
                    </div>
                    <div className={`text-sm ${reservation.status === "Confirmed" ? "text-green-500" : "text-yellow-500"}`}>
                      {reservation.status}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>


          {/* New Reservations List */}
          <div className="mb-10  ">
            <h2 className="text-2xl font-semibold mb-4">{lang=="fra"?"liste récente":lang=="ur"?"نئے تحفظات":"Recent List"}</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
              <ul>
                {dataList?.map((reservation) => (
                  <li key={reservation.id} className="flex justify-between p-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold">{reservation.Name}</p>
                      <p className="text-sm text-gray-600">{getDate( reservation.NewOrder[0].createdAt)}</p>
                    </div>
                    <div className={`text-sm ${reservation.NewOrder[0].bookingstatus === "حجز جديد" ? "text-green-500" : "text-yellow-500"}`}>
                      {reservation.NewOrder[0].bookingstatus}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
