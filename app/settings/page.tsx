// pages/settings.js

'use client'
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
const setLangauge=(e)=>{
localStorage.setItem("language",e)

}



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
      
    <div className="min-h-screen bg-gray-100 w-full text-gray-800 ml-9">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Settings</h1>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 flex justify-center">
          {/* <h2 className="text-xl font-medium">General</h2> */}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="notifications" className="text-lg font-medium">
              Change Languages
              </label>
            </div>
<div className="custom-radio-group ">
  <label className="custom-radio-container">
    <input type="radio" name="custom-radio" value="" onChange={()=>setLangauge("")} />
    <span className="custom-radio-checkmark"></span>
    English
  </label>
  <label className="custom-radio-container">
    <input type="radio" name="custom-radio" value="fra" onChange={(e)=>setLangauge(e.target.value)}/>
    <span className="custom-radio-checkmark"></span>
    français
  </label>
  <label className="custom-radio-container">
    <input type="radio" name="custom-radio" value="ur" onChange={(e)=>setLangauge(e.target.value)}/>
    <span className="custom-radio-checkmark"></span>
    اردو
  </label>
</div>

            {/* <div className="flex justify-between items-center">
              <label htmlFor="darkMode" className="text-lg font-medium">
                Enable Dark Mode
              </label>
              <input
                type="checkbox"
                id="darkMode"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="toggle toggle-accent"
              />
            </div> */}
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}
