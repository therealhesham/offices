'use client'

import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import imageCompression from 'browser-image-compression';
import AWS from 'aws-sdk';

const FormPage = () => {
  const [formData, setFormData] = useState({
    Name: "",
    Religion: "",
    nationality: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    salary: "",
    PassportStart: "",
    PassportEnd: "",
    experienceYears: "",
    maritalStatus: "",
    education: "",
    languageSkills: { arabic: "", english: "" },
    skills: { laundry: "", ironing: "", cleaning: "", cooking: "", sewing: "", babySitting: "" },
    fullBodyImage: "",
    personalImage: "",
  });

  const [errors, setErrors] = useState({});
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({ fullBody: null, personal: null });
  const [imageErrors, setImageErrors] = useState({ fullBody: "", personal: "" });
  const [formProgress, setFormProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    images: true,
    personal: true,
    passport: true,
    skills: true,
  });
  const fullBodyInputRef = useRef(null);
  const personalInputRef = useRef(null);

  // DigitalOcean Spaces Configuration
  const s3 = new AWS.S3({
    accessKeyId: "DO801JJ6VK8NVWKDVZ8M",
    secretAccessKey: "XYYRqI632DCboid1FyE+DJrQa9fZuXKjcoGEGkZlWnY",
    endpoint: 'https://recruitmentrawaes.sgp1.digitaloceanspaces.com',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  // Calculate form progress
  useEffect(() => {
    const totalFields = Object.keys(formData).length - 2 +
      Object.keys(formData.languageSkills).length +
      Object.keys(formData.skills).length;
    let filledFields = 0;

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'languageSkills' || key === 'skills') return;
      if (value) filledFields++;
    });

    Object.values(formData.languageSkills).forEach(value => {
      if (value) filledFields++;
    });

    Object.values(formData.skills).forEach(value => {
      if (value) filledFields++;
    });

    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [formData]);

  // Validate Form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.Name.trim()) newErrors.Name = "الاسم مطلوب";
    if (!formData.nationality.trim()) newErrors.nationality = "الجنسية مطلوبة";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "تاريخ الميلاد مطلوب";
    if (!formData.fullBodyImage) newErrors.fullBodyImage = "صورة الجسم بالكامل مطلوبة";
    if (!formData.personalImage) newErrors.personalImage = "الصورة الشخصية مطلوبة";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    const phoneRegex = /^\+?\d{8,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "يجب أن يتكون الهاتف من 8-15 رقمًا";
    }

    const today = new Date();
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (dob >= today) newErrors.dateOfBirth = "يجب أن يكون تاريخ الميلاد في الماضي";
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) newErrors.dateOfBirth = "يجب أن يكون العمر 18 عامًا على الأقل";
    }

    if (formData.PassportStart && formData.PassportEnd) {
      const start = new Date(formData.PassportStart);
      const end = new Date(formData.PassportEnd);
      if (start >= end) newErrors.PassportEnd = "يجب أن يكون تاريخ انتهاء الجواز بعد تاريخ البداية";
    }

    if (formData.salary && (isNaN(formData.salary) || Number(formData.salary) <= 0)) {
      newErrors.salary = "الراتب يجب أن يكون رقمًا إيجابيًا";
    }

    if (formData.experienceYears && (isNaN(formData.experienceYears) || Number(formData.experienceYears) < 0)) {
      newErrors.experienceYears = "سنوات الخبرة يجب أن تكون غير سالبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Compress Image
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], `${Date.now()}.jpg`, { type: 'image/jpeg' });
    } catch (error) {
      throw new Error('فشل في ضغط الصورة.');
    }
  };

  // Upload Image to DigitalOcean Spaces
  const uploadImageToDigitalOcean = async (file, type) => {
    const fileName = `${Date.now()}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const params = {
      Bucket: 'recruitmentrawaes',
      Key: `officespics/${fileName}`,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('نوع الملف غير صالح. يرجى رفع JPEG أو PNG.');
      }
      if (file.size > 32 * 1024 * 1024) {
        throw new Error('حجم الصورة يتجاوز 32 ميغابايت.');
      }

      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location;
    } catch (error) {
      throw error;
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file);
      const imageUrl = await uploadImageToDigitalOcean(compressedFile, type);
      setFormData((prev) => ({ ...prev, [`${type}Image`]: imageUrl }));
      setImagePreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
      setImageErrors((prev) => ({ ...prev, [type]: "" }));
    } catch (error) {
      setImageErrors((prev) => ({ ...prev, [type]: error.message }));
    }
  };

  // Handle Form Submission
  const postNewEmployer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const storage = localStorage.getItem("_item");
      const newData = await fetch("/api/newemployer", {
        method: "POST",
        headers: {
          authorization: `bearer ${storage}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const post = await newData.json();
      if (newData.status === 201) {
        setResponse(post);
        alert("تم تقديم النموذج بنجاح!");
        setFormData({
          Name: "",
          Religion: "",
          nationality: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          salary: "",
          PassportStart: "",
          PassportEnd: "",
          experienceYears: "",
          maritalStatus: "",
          education: "",
          languageSkills: { arabic: "", english: "" },
          skills: { laundry: "", ironing: "", cleaning: "", cooking: "", sewing: "", babySitting: "" },
          fullBodyImage: "",
          personalImage: "",
        });
        setImagePreviews({ fullBody: null, personal: null });
        fullBodyInputRef.current.value = null;
        personalInputRef.current.value = null;
      } else {
        alert("فشل التقديم. حاول مرة أخرى.");
      }
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("languageSkills.")) {
      const lang = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        languageSkills: { ...prevData.languageSkills, [lang]: value },
      }));
    } else if (name.includes("skills.")) {
      const skill = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        skills: { ...prevData.skills, [skill]: value },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Handle Window Resize
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and Drop Handlers
  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-gray-500', 'bg-gray-100');
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-gray-500', 'bg-gray-100');
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-gray-500', 'bg-gray-100');
    const file = e.dataTransfer.files[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } };
      await handleImageUpload(syntheticEvent, type);
    }
  };

  // Toggle Section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E5E5E5] text-gray-800 ${width > 640 ? "flex flex-row" : "flex flex-col"}`}>
      <Sidebar />
      <div className="flex-1 p-4 sm:p-8 md:p-12 overflow-auto">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 sm:p-10 md:p-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-800 tracking-tight">إضافة خادمة جديدة</h1>
            <div className="w-full sm:w-64">
              <p className="text-sm text-gray-600 mb-2">نسبة الإكمال</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-700 transition-all duration-500" 
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{formProgress}% مكتمل</p>
            </div>
          </div>

          {response && (
            <div className="mb-8 p-4 bg-green-100 border border-green-400 rounded-lg animate-fade-in">
              <p className="text-green-700 font-medium">تم إنشاء الملف بنجاح!</p>
            </div>
          )}

          <form onSubmit={postNewEmployer} className="space-y-8">
            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300">
              <button
                type="button"
                onClick={() => toggleSection('images')}
                className="w-full flex justify-between items-center text-2xl font-semibold text-gray-700 mb-4"
              >
                <span>رفع الصور</span>
                <svg className={`w-6 h-6 transform transition-transform ${expandedSections.images ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.images && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-in">
                  {['fullBody', 'personal'].map((type, index) => (
                    <div key={type} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                      <label className="block text-sm font-medium text-gray-600 mb-3 capitalize">{type === 'fullBody' ? 'صورة الجسم بالكامل' : 'الصورة الشخصية'}</label>
                      <div
                        className={`relative w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
                          errors[`${type}Image`] || imageErrors[type]
                            ? "border-red-500"
                            : "border-gray-300 group-hover:border-gray-500 group-hover:bg-gray-100"
                        }`}
                        onDragOver={(e) => handleDragOver(e, type)}
                        onDragLeave={(e) => handleDragLeave(e, type)}
                        onDrop={(e) => handleDrop(e, type)}
                      >
                        {imagePreviews[type] ? (
                          <img 
                            src={imagePreviews[type]} 
                            alt={`${type} preview`} 
                            className="mx-auto h-56 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <p className="text-gray-500 mt-2">اسحب وأفلت أو انقر للرفع</p>
                            <p className="text-xs text-gray-400 mt-1">JPEG/PNG، الحد الأقصى 32 ميغابايت</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={(e) => handleImageUpload(e, type)}
                          className="hidden"
                          ref={type === 'fullBody' ? fullBodyInputRef : personalInputRef}
                          aria-label={`${type} image upload`}
                        />
                        <button
                          type="button"
                          onClick={() => (type === 'fullBody' ? fullBodyInputRef : personalInputRef).current.click()}
                          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-sm"
                        >
                          اختر صورة
                        </button>
                      </div>
                      {(errors[`${type}Image`] || imageErrors[type]) && (
                        <p className="text-red-500 text-xs mt-2 animate-pulse">
                          {errors[`${type}Image`] || imageErrors[type]}
                        </p>
                      )}
                      <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded">ارفع صورة واضحة</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300">
              <button
                type="button"
                onClick={() => toggleSection('personal')}
                className="w-full flex justify-between items-center text-2xl font-semibold text-gray-700 mb-4"
              >
                <span>المعلومات الشخصية</span>
                <svg className={`w-6 h-6 transform transition-transform ${expandedSections.personal ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.personal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {[
                    { name: "Name", type: "text", required: true, tooltip: "الاسم الكامل القانوني" },
                    { name: "nationality", label: "الجنسية", type: "text", required: true, tooltip: "بلد الجنسية" },
                    { name: "Religion", type: "text", tooltip: "الانتماء الديني (اختياري)" },
                    { name: "phone", label: "رقم الهاتف", type: "text", required: true, tooltip: "أدخل رمز البلد" },
                    { name: "email", label: "البريد الإلكتروني", type: "email", required: true, tooltip: "عنوان بريد إلكتروني صالح" },
                    { name: "dateOfBirth", label: "تاريخ الميلاد", type: "date", required: true, tooltip: "يجب أن يكون العمر 18+" },
                    { name: "maritalStatus", label: "الحالة الاجتماعية", type: "text", tooltip: "أعزب، متزوج، إلخ" },
                    { name: "education", label: "التعليم", type: "text", tooltip: "أعلى مستوى دراسي" },
                  ].map((field, index) => (
                    <div key={field.name} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative">
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className={`peer w-full p-3 pt-5 bg-white border ${
                            errors[field.name] ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-transparent`}
                          placeholder={field.label || field.name}
                          aria-invalid={errors[field.name] ? "true" : "false"}
                          id={field.name}
                        />
                        <label
                          htmlFor={field.name}
                          className={`absolute left-3 top-1 text-xs text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-600 ${
                            formData[field.name] ? 'top-1 text-xs text-gray-600' : ''
                          }`}
                        >
                          {field.label || field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                      </div>
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1 animate-pulse">{errors[field.name]}</p>
                      )}
                      {field.tooltip && (
                        <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded">{field.tooltip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Passport & Financial Information */}
            <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300">
              <button
                type="button"
                onClick={() => toggleSection('passport')}
                className="w-full flex justify-between items-center text-2xl font-semibold text-gray-700 mb-4"
              >
                <span>معلومات الجواز والمالية</span>
                <svg className={`w-6 h-6 transform transition-transform ${expandedSections.passport ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.passport && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {[
                    { name: "PassportStart", label: "تاريخ بداية الجواز", type: "date", tooltip: "تاريخ الإصدار" },
                    { name: "PassportEnd", label: "تاريخ انتهاء الجواز", type: "date", tooltip: "تاريخ الانتهاء" },
                    { name: "salary", label: "الراتب", type: "text", tooltip: "الراتب الشهري المتوقع" },
                    { name: "experienceYears", label: "الخبرة (سنوات)", type: "text", tooltip: "سنوات الخبرة ذات الصلة" },
                  ].map((field, index) => (
                    <div key={field.name} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative">
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className={`peer w-full p-3 pt-5 bg-white border ${
                            errors[field.name] ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-transparent`}
                          placeholder={field.label}
                          aria-invalid={errors[field.name] ? "true" : "false"}
                          id={field.name}
                        />
                        <label
                          htmlFor={field.name}
                          className={`absolute left-3 top-1 text-xs text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-600 ${
                            formData[field.name] ? 'top-1 text-xs text-gray-600' : ''
                          }`}
                        >
                          {field.label}
                        </label>
                      </div>
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1 animate-pulse">{errors[field.name]}</p>
                      )}
                      {field.tooltip && (
                        <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded">{field.tooltip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills & Languages */}
            <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300">
              <button
                type="button"
                onClick={() => toggleSection('skills')}
                className="w-full flex justify-between items-center text-2xl font-semibold text-gray-700 mb-4"
              >
                <span>المهارات واللغات</span>
                <svg className={`w-6 h-6 transform transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.skills && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {[
                    { name: "languageSkills.arabic", label: "مستوى اللغة العربية", tooltip: "مستوى الإتقان" },
                    { name: "languageSkills.english", label: "مستوى اللغة الإنجليزية", tooltip: "مستوى الإتقان" },
                    { name: "skills.laundry", label: "مستوى الغسيل", tooltip: "مستوى المهارة" },
                    { name: "skills.ironing", label: "مستوى الكي", tooltip: "مستوى المهارة" },
                    { name: "skills.cleaning", label: "مستوى التنظيف", tooltip: "مستوى المهارة" },
                    { name: "skills.cooking", label: "مستوى الطبخ", tooltip: "مستوى المهارة" },
                    { name: "skills.sewing", label: "مستوى الخياطة", tooltip: "مستوى المهارة" },
                    { name: "skills.babySitting", label: "مستوى رعاية الأطفال", tooltip: "مستوى المهارة" },
                  ].map((field, index) => (
                    <div key={field.name} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative">
                        <input
                          type="text"
                          name={field.name}
                          value={field.name.includes("languageSkills") 
                            ? formData.languageSkills[field.name.split(".")[1]]
                            : formData.skills[field.name.split(".")[1]]}
                          onChange={handleChange}
                          className="peer w-full p-3 pt-5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-transparent"
                          placeholder={field.label}
                          id={field.name}
                        />
                        <label
                          htmlFor={field.name}
                          className={`absolute left-3 top-1 text-xs text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-600 ${
                            (field.name.includes("languageSkills") && formData.languageSkills[field.name.split(".")[1]]) ||
                            (field.name.includes("skills") && formData.skills[field.name.split(".")[1]])
                              ? 'top-1 text-xs text-gray-600'
                              : ''
                          }`}
                        >
                          {field.label}
                        </label>
                      </div>
                      {field.tooltip && (
                        <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded">{field.tooltip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-3 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-gray-500/50 ${
                  isSubmitting 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                }`}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جارٍ المعالجة...
                  </span>
                ) : (
                  "إنشاء الملف"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FormPage;