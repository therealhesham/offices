'use client'

// app/form/page.js

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const FormPage = () => {
  const [formData, setFormData] = useState({
    Name: "",Religion:"",
    nationality: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    salary: "",
    PassportStart:"",PassportEnd:"",
    experienceYears: "",
    maritalStatus: "",
    education: "",
    languageSkills: {
      arabic: "",
      english: "",
    },
    skills: {
      laundry: "",
      ironing: "",
      cleaning: "",
      cooking: "",
      sewing: "",
      babySitting: "",
    },
  });
const [response,setReponse]=useState("")
const postNewEmployer = async (e)=>{
  try {
    
  const storage =      localStorage.getItem("_item")

  e.preventDefault();
const newData = await fetch("/api/newemployer",{method:"POST",headers:{
authorization:`bearer ${storage}`,

          Accept: "application/json",
          "Content-Type": "application/json",
        

},body:JSON.stringify(formData)})

const post = await newData.json()
if(newData.status == 201){
  return setReponse(post)
}

} catch (error) {
 alert("error")   
}

}

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex   h-screen flex-row">
<Sidebar/>
    <div className="min-h-screen  bg-gray-100 flex-1 overflow-auto  justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">اضافة عاملة</h1>
        <form onSubmit={postNewEmployer} className="grid grid-cols-3  w-full gap-4">
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nationality */}
          <div className="mb-4">
            <label className="block text-gray-700">Nationality</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          
          {/* Nationality */}
          <div className="mb-4">
            <label className="block text-gray-700">Religion</label>
            <input
              type="text"
              name="Religion"
              value={formData.Religion}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div className="mb-4">
            <label className="block text-gray-700">Passport Start</label>
            <input
              type="date"
              name="PassportStart"
              value={formData.PassportStart}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Passport End</label>
            <input
              type="date"
              name="PassportEnd"
              value={formData.PassportEnd}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          {/* Phone */}
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Salary */}
          <div className="mb-4">
            <label className="block text-gray-700">Salary</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Experience Years */}
          <div className="mb-4">
            <label className="block text-gray-700">Experience (in years)</label>
            <input
              type="text"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Marital Status */}
          <div className="mb-4">
            <label className="block text-gray-700">Marital Status</label>
            <input
              type="text"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Education */}
          <div className="mb-4">
            <label className="block text-gray-700">Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Language Skills */}
          <div className="mb-4">
            <label className="block text-gray-700">Arabic Language Level</label>
            <input
              type="text"
              name="ArabicLanguageLevel"
              value={formData.languageSkills.arabic}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">English Language Level</label>
            <input
              type="text"
              name="EnglishLanguageLevel"
              value={formData.languageSkills.english}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills */}
          {["LaundryLeveL", "IroningLevel", "CleaningLeveL", "CookingLeveL", "SewingLeveL", "BabySitterLevel"].map((skill) => (
            <div key={skill} className="mb-4">
              <label className="block text-gray-700 capitalize">{`${skill} `}</label>
              <input
                type="text"
                name={`${skill}`}
                value={formData.skills[skill]}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default FormPage;
