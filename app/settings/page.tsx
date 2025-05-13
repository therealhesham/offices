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
  const [width, setWidth] = useState(0);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const c = useContext(LanguageContext);

  // Configure AWS SDK for DigitalOcean Spaces
  const spacesEndpoint = process.env.DO_SPACES_ENDPOINT;
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  });

  // Persist settings in local storage
  useEffect(() => {
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [notifications, darkMode]);

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

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogoFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a valid PNG or JPEG image.');
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
      setUploadStatus('Please drop a valid PNG or JPEG image.');
      setLogoFile(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle logo upload with progress simulation
  const handleLogoUpload = async () => {
    if (!logoFile) {
      setUploadStatus('No file selected.');
      return;
    }

    const params = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: `logos/${Date.now()}-${logoFile.name}`,
      Body: logoFile,
      ACL: 'public-read',
      ContentType: logoFile.type,
    };

    try {
      setUploadStatus('Uploading...');
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
      setUploadStatus(`Logo uploaded successfully! URL: ${data.Location}`);
      setLogoFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Failed to upload logo. Please try again.');
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

  return (
    <div className={`flex min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${darkMode ? 'dark' : ''}`} dir={c?.language === 'ur' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className="flex-1 ml-9 p-6">
        <motion.div
          className="max-w-3xl mx-auto mt-8"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 space-y-8">
            <div className="flex items-center justify-between">
              {/* <div className="relative group">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Notifications</span>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8">
                  Enable or disable notifications
                </span>
              </div>
              <div
                className={`w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer ${notifications ? 'bg-indigo-600' : ''}`}
                onClick={() => setNotifications(!notifications)}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full shadow"
                  variants={toggleVariants}
                  animate={notifications ? 'on' : 'off'}
                />
              </div> */}
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              {/* <div className="relative group">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Dark Mode</span>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8">
                  Switch to dark theme
                </span>
              </div>
              <div
                className={`w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer ${darkMode ? 'bg-indigo-600' : ''}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full shadow"
                  variants={toggleVariants}
                  animate={darkMode ? 'on' : 'off'}
                />
              </div> */}
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Change Language</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: '', label: 'English' },
                  { value: 'fra', label: 'Français' },
                  { value: 'ur', label: 'اردو' },
                ].map((lang) => (
                  <motion.label
                    key={lang.value}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      c.language === lang.value ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'
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

            {/* Logo Upload */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upload Custom Logo</h2>
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
                      Drag and drop a PNG or JPEG image here, or{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                    </>
                  )}
                </label>
              </div>
              {logoFile && (
                <>
                  <button
                    onClick={handleLogoUpload}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
                    disabled={uploadStatus === 'Uploading...'}
                  >
                    {uploadStatus === 'Uploading...' ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      'Upload Logo'
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
                  {uploadStatus.includes('successfully') ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : uploadStatus.includes('Failed') || uploadStatus.includes('valid') ? (
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  ) : null}
                  <span
                    className={`${
                      uploadStatus.includes('successfully')
                        ? 'text-green-600'
                        : uploadStatus.includes('Failed') || uploadStatus.includes('valid')
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