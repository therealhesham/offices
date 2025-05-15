'use client';
import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navigationbar';
import { LanguageContext } from '../contexts/LanguageContext';
import AWS from 'aws-sdk';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function Settings() {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications') !== 'false';
    }
    return true;
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [colorScheme, setColorScheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('colorScheme') || 'default';
    }
    return 'default';
  });
  const [width, setWidth] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const c = useContext(LanguageContext);

   const s3 = new AWS.S3({
     accessKeyId: "DO801JJ6VK8NVWKDVZ8M",
     secretAccessKey: "XYYRqI632DCboid1FyE+DJrQa9fZuXKjcoGEGkZlWnY",
     endpoint: 'https://recruitmentrawaes.sgp1.digitaloceanspaces.com',
     s3ForcePathStyle: true,
     signatureVersion: 'v4',
   });
 
  // Persist settings in local storage and apply color scheme
  useEffect(() => {
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('colorScheme', colorScheme);

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply color scheme
    document.documentElement.classList.remove('scheme-default', 'scheme-blue', 'scheme-green', 'scheme-purple');
    document.documentElement.classList.add(`scheme-${colorScheme}`);
  }, [notifications, darkMode, colorScheme]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Set RTL for Arabic and Urdu
  useEffect(() => {
    document.documentElement.dir = c?.language === 'ar' || c?.language === 'ur' ? 'rtl' : 'ltr';
  }, [c?.language]);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogoFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus(
        c?.language === 'fra'
          ? 'Veuillez sélectionner une image PNG ou JPEG valide.'
          : c?.language === 'ur'
          ? 'براہ کرم ایک درست PNG یا JPEG تصویر منتخب کریں۔'
          : c?.language === 'ar'
          ? 'يرجى اختيار صورة PNG أو JPEG صالحة.'
          : 'Please select a valid PNG or JPEG image.'
      );
      setLogoFile(null);
    }
  };

  // Handle drag-and-drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogoFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus(
        c?.language === 'fra'
          ? 'Veuillez déposer une image PNG ou JPEG valide.'
          : c?.language === 'ur'
          ? 'براہ کرم ایک درست PNG یا JPEG تصویر ڈراپ کریں۔'
          : c?.language === 'ar'
          ? 'يرجى إسقاط صورة PNG أو JPEG صالحة.'
          : 'Please drop a valid PNG or JPEG image.'
      );
      setLogoFile(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle logo upload with progress simulation
  const handleLogoUpload = async () => {
    if (!logoFile) {
      setUploadStatus(
        c?.language === 'fra'
          ? 'Aucun fichier sélectionné.'
          : c?.language === 'ur'
          ? 'کوئی فائل منتخب نہیں کی گئی۔'
          : c?.language === 'ar'
          ? 'لم يتم اختيار ملف.'
          : 'No file selected.'
      );
      return;
    }
    if (!logoFile) {
      throw new Error('No file selected');
    }
    const buffer = Buffer.from(await logoFile.arrayBuffer());

    const params = {
      Bucket: 'recruitmentrawaes',
      Key: `officespics/${Date.now()}${logoFile}.jpg`,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    try {
      setUploadStatus(
        c?.language === 'fra'
          ? 'Téléchargement en cours...'
          : c?.language === 'ur'
          ? 'اپ لوڈ ہو رہا ہے...'
          : c?.language === 'ar'
          ? 'جارٍ الرفع...'
          : 'Uploading...'
      );
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);


      const data = await s3.upload(params).promise();

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus(
        c?.language === 'fra'
          ? `Logo téléchargé avec succès ! URL : ${data.Location}`
          : c?.language === 'ur'
          ? `لوگو کامیابی سے اپ لوڈ ہو گیا! URL: ${data.Location}`
          : c?.language === 'ar'
          ? `تم رفع الشعار بنجاح! الرابط: ${data.Location}`
          : `Logo uploaded successfully! URL: ${data.Location}`
      );
      updateData(data.Location)


      // setLogoFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(
        c?.language === 'fra'
          ? 'Échec du téléchargement du logo. Veuillez réessayer.'
          : c?.language === 'ur'
          ? 'لوگو اپ لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔'
          : c?.language === 'ar'
          ? 'فشل رفع الشعار. يرجى المحاولة مرة أخرى.'
          : 'Failed to upload logo. Please try again.'
      );
      setUploadProgress(0);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const toggleVariants = {
    off: { x: 0 },
    on: { x: 20, transition: { type: 'spring', stiffness: 300 } },
  };

  // Color scheme options
  const colorSchemes = [
    {
      value: 'default',
      label:
        c?.language === 'fra'
          ? 'Défaut'
          : c?.language === 'ur'
          ? 'پہلے سے طے شدہ'
          : c?.language === 'ar'
          ? 'افتراضي'
          : 'Default',
    },
    {
      value: 'blue',
      label:
        c?.language === 'fra'
          ? 'Bleu'
          : c?.language === 'ur'
          ? 'نیلا'
          : c?.language === 'ar'
          ? 'أزرق'
          : 'Blue',
    },
    {
      value: 'green',
      label:
        c?.language === 'fra'
          ? 'Vert'
          : c?.language === 'ur'
          ? 'سبز'
          : c?.language === 'ar'
          ? 'أخضر'
          : 'Green',
    },
    {
      value: 'purple',
      label:
        c?.language === 'fra'
          ? 'Violet'
          : c?.language === 'ur'
          ? 'جامنی'
          : c?.language === 'ar'
          ? 'أرجواني'
          : 'Purple',
    },
  ];

  
  const updateData =async(url)=>{

const updater = await fetch("/api/updateimage", {
  method: "PUT",
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({url})
});
const data = await updater.json()
// if(updateData.ok)
if(updater.ok){

 localStorage.setItem("_item",data.token)
}
  }
  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scheme-${colorScheme} ${
        darkMode ? 'dark' : ''
      }`}
      dir={c?.language === 'ar' || c?.language === 'ur' ? 'rtl' : 'ltr'}
    >
      <Sidebar />
      <div className="flex-1 ml-9 p-6">
        <motion.div
          className="max-w-3xl mx-auto mt-8"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {c?.language === 'fra'
              ? 'Paramètres'
              : c?.language === 'ur'
              ? 'ترتیبات'
              : c?.language === 'ar'
              ? 'الإعدادات'
              : 'Settings'}
          </h1>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 space-y-8">
            {/* Language Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {c?.language === 'fra'
                  ? 'Changer de langue'
                  : c?.language === 'ur'
                  ? 'زبان تبدیل کریں'
                  : c?.language === 'ar'
                  ? 'تغيير اللغة'
                  : 'Change Language'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: '', label: c?.language === 'ar' ? 'الإنجليزية' : 'English' },
                  { value: 'fra', label: c?.language === 'ar' ? 'الفرنسية' : 'Français' },
                  { value: 'ur', label: c?.language === 'ar' ? 'الأردية' : 'اردو' },
                  { value: 'ar', label: 'عربي' },
                ].map((lang) => (
                  <motion.label
                    key={lang.value}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      c.language === lang.value ? 'bg-indigo-100 dark:bg-indigo-700' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.value}
                      checked={c.language === lang.value}
                      onChange={() => c.changeLanguage(lang.value)}
                      className="hidden"
                    />
                    <span className="w-5 h-5 mr-3 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                      {c.language === lang.value && <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{lang.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Color Scheme Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {c?.language === 'fra'
                  ? 'Changer le schéma de couleurs'
                  : c?.language === 'ur'
                  ? 'رنگ سکیم تبدیل کریں'
                  : c?.language === 'ar'
                  ? 'تغيير نظام الألوان'
                  : 'Change Color Scheme'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {colorSchemes.map((scheme) => (
                  <motion.label
                    key={scheme.value}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      colorScheme === scheme.value ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="colorScheme"
                      value={scheme.value}
                    
                      checked={colorScheme === scheme.value}
                      onChange={() => setColorScheme(scheme.value)}
                      className="hidden"
                    />
                    <span className="w-5 h-5 mr-3 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                      {colorScheme === scheme.value && <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{scheme.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {c?.language === 'fra'
                  ? 'Télécharger un logo personnalisé'
                  : c?.language === 'ur'
                  ? 'اپنی مرضی کا لوگو اپ لوڈ کریں'
                  : c?.language === 'ar'
                  ? 'رفع شعار مخصص'
                  : 'Upload Custom Logo'}
              </h2>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="block text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                >
                  {logoFile ? (
                    <span className="text-indigo-600 dark:text-indigo-400">{logoFile.name}</span>
                  ) : (
                    <>
                      {c?.language === 'fra'
                        ? 'Glissez et déposez une image PNG ou JPEG ici, ou '
                        : c?.language === 'ur'
                        ? 'یہاں PNG یا JPEG تصویر ڈراگ اینڈ ڈراپ کریں، یا '
                        : c?.language === 'ar'
                        ? 'اسحب وأسقط صورة PNG أو JPEG هنا، أو '
                        : 'Drag and drop a PNG or JPEG image here, or '}
                      <span className="text-indigo-600 dark:text-indigo-400 underline">
                        {c?.language === 'fra'
                          ? 'parcourir'
                          : c?.language === 'ur'
                          ? 'براؤز کریں'
                          : c?.language === 'ar'
                          ? 'تصفح'
                          : 'browse'}
                      </span>
                    </>
                  )}
                </label>
              </div>
              {logoFile && (
                <>
                  <button
                    onClick={handleLogoUpload}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
                    disabled={uploadStatus === (c?.language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...')}
                  >
                    {uploadStatus === (c?.language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...') ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {c?.language === 'fra'
                          ? 'Téléchargement en cours...'
                          : c?.language === 'ur'
                          ? 'اپ لوڈ ہو رہا ہے...'
                          : c?.language === 'ar'
                          ? 'جارٍ الرفع...'
                          : 'Uploading...'}
                      </span>
                    ) : (
                      c?.language === 'fra'
                        ? 'Télécharger le logo'
                        : c?.language === 'ur'
                        ? 'لوگو اپ لوڈ کریں'
                        : c?.language === 'ar'
                        ? 'رفع الشعار'
                        : 'Upload Logo'
                    )}
                  </button>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%`, transition: 'width 0.5s ease-in-out' }}
                      ></div>
                    </div>
                  )}
                </>
              )}
              {uploadStatus && (
                <p className="mt-2 text-sm flex items-center">
                  {uploadStatus.includes(
                    c?.language === 'ar'
                      ? 'تم رفع الشعار بنجاح'
                      : c?.language === 'fra'
                      ? 'Logo téléchargé avec succès'
                      : c?.language === 'ur'
                      ? 'لوگو کامیابی سے اپ لوڈ ہو گیا'
                      : 'Logo uploaded successfully'
                  ) ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : uploadStatus.includes(
                    c?.language === 'ar'
                      ? 'فشل'
                      : c?.language === 'fra'
                      ? 'Échec'
                      : c?.language === 'ur'
                      ? 'ناکامی'
                      : 'Failed'
                  ) ||
                    uploadStatus.includes(
                      c?.language === 'ar'
                        ? 'صالحة'
                        : c?.language === 'fra'
                        ? 'valide'
                        : c?.language === 'ur'
                        ? 'درست'
                        : 'valid'
                    ) ||
                    uploadStatus.includes(
                      c?.language === 'ar'
                        ? 'لم يتم اختيار ملف'
                        : c?.language === 'fra'
                        ? 'Aucun fichier sélectionné'
                        : c?.language === 'ur'
                        ? 'کوئی فائل منتخب نہیں کی گئی'
                        : 'No file selected'
                    ) ? (
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  ) : null}
                  <span
                    className={`${
                      uploadStatus.includes(
                        c?.language === 'ar'
                          ? 'تم رفع الشعار بنجاح'
                          : c?.language === 'fra'
                          ? 'Logo téléchargé avec succès'
                          : c?.language === 'ur'
                          ? 'لوگو کامیابی سے اپ لوڈ ہو گیا'
                          : 'Logo uploaded successfully'
                      )
                        ? 'text-green-600'
                        : uploadStatus.includes(
                            c?.language === 'ar'
                              ? 'فشل'
                              : c?.language === 'fra'
                              ? 'Échec'
                              : c?.language === 'ur'
                              ? 'ناکامی'
                              : 'Failed'
                          ) ||
                          uploadStatus.includes(
                            c?.language === 'ar'
                              ? 'صالحة'
                              : c?.language === 'fra'
                              ? 'valide'
                              : c?.language === 'ur'
                              ? 'درست'
                              : 'valid'
                          ) ||
                          uploadStatus.includes(
                            c?.language === 'ar'
                              ? 'لم يتم اختيار ملف'
                              : c?.language === 'fra'
                              ? 'Aucun fichier sélectionné'
                              : c?.language === 'ur'
                              ? 'کوئی فائل منتخب نہیں کی گئی'
                              : 'No file selected'
                          )
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {uploadStatus}
                  </span>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}