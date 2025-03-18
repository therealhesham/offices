// pages/settings.js

'use client'
import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
const setLangauge=(e)=>{
localStorage.setItem("language",e)

}
  return (
    <div className='flex flex-row'>
      <Sidebar/>
    <div className="min-h-screen bg-gray-100 w-full text-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Settings</h1>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-medium">General</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="notifications" className="text-lg font-medium">
              Change Languages
              </label>
            </div>
<div className="custom-radio-group">
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
