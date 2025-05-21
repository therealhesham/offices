'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaInfoCircle, FaUpload } from 'react-icons/fa';
import AWS from 'aws-sdk';
import { NewOrder, ArrivalList } from '@/app/lib/types';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com');

const s3 = new AWS.S3({
  accessKeyId: "DO801JJ6VK8NVWKDVZ8M",
  secretAccessKey: "XYYRqI632DCboid1FyE+DJrQa9fZuXKjcoGEGkZlWnY",
  endpoint: 'https://recruitmentrawaes.sgp1.digitaloceanspaces.com',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// Define translations for stages and UI text
const translations = {
  en: {
    stages: [
      'Link with Musaned',
      'Link with External Musaned',
      'Link with External Office',
      'Medical Check',
      'Link with Agency',
      'Embassy Sealing',
      'Ticket Booking',
      'Receiving',
    ],
    title: 'Order Timeline: {name}',
    subtitle: 'Track the progress of your order in real-time',
    progress: 'Progress: {percentage}%',
    completed: 'Completed',
    inProgress: 'In Progress',
    pending: 'Pending',
    uploadLabel: 'Upload Medical Check File',
    uploadButton: 'Upload File',
    uploading: 'Uploading...',
    uploadSuccess: 'File uploaded successfully! ',
    uploadError: 'Error uploading file. Please try again.',
    viewFile: 'View File',
    medicalFileUploaded: 'Medical file already uploaded. ',
    medicalFileRestricted: 'Medical file upload is only allowed during current stage.',
    orderNotFound: 'Order not found',
    stageDetails: {
      'Link with Musaned': {
        'Internal Musaned Contract': 'Internal Musaned Contract',
        'Date of Application': 'Date of Application',
      },
      'Link with External Musaned': {
        'External Musaned Contract': 'External Musaned Contract',
        'External Date Linking': 'External Date Linking',
      },
      'Link with External Office': {
        'External Office Approval': 'External Office Approval',
        'External Office File': 'External Office File',
      },
      'Medical Check': {
        'Medical Check File': 'Medical Check File',
      },
      'Link with Agency': {
        'Agency Date': 'Agency Date',
      },
      'Embassy Sealing': {
        'Embassy Sealing': 'Embassy Sealing',
      },
      'Ticket Booking': {
        'Ticket File': 'Ticket File',
        'Booking Date': 'Booking Date',
      },
      'Receiving': {
        'Receiving File': 'Receiving File',
        'Delivery Date': 'Delivery Date',
      },
    },
  },
  fra: {
    stages: [
      'Lien avec Musaned',
      'Lien avec Musaned externe',
      'Lien avec le bureau externe',
      'Examen médical',
      'Lien avec l’agence',
      'Scellage à l’ambassade',
      'Réservation de billet',
      'Réception',
    ],
    title: 'Chronologie de la commande : {name}',
    subtitle: 'Suivez la progression de votre commande en temps réel',
    progress: 'Progression : {percentage}%',
    completed: 'Terminé',
    inProgress: 'En cours',
    pending: 'En attente',
    uploadLabel: 'Télécharger le fichier d’examen médical',
    uploadButton: 'Télécharger le fichier',
    uploading: 'Téléchargement en cours...',
    uploadSuccess: 'Fichier téléchargé avec succès ! ',
    uploadError: 'Erreur lors du téléchargement du fichier. Veuillez réessayer.',
    viewFile: 'Voir le fichier',
    medicalFileUploaded: 'Fichier médical déjà téléchargé. ',
    medicalFileRestricted: 'Le téléchargement du fichier médical n’est autorisé que pendant l’étape en cours.',
    orderNotFound: 'Commande non trouvée',
    stageDetails: {
      'Lien avec Musaned': {
        'Internal Musaned Contract': 'Contrat Musaned interne',
        'Date of Application': 'Date de candidature',
      },
      'Lien avec Musaned externe': {
        'External Musaned Contract': 'Contrat Musaned externe',
        'External Date Linking': 'Date de liaison externe',
      },
      'Lien avec le bureau externe': {
        'External Office Approval': 'Approbation du bureau externe',
        'External Office File': 'Fichier du bureau externe',
      },
      'Examen médical': {
        'Medical Check File': 'Fichier d’examen médical',
      },
      'Lien avec l’agence': {
        'Agency Date': 'Date de l’agence',
      },
      'Scellage à l’ambassade': {
        'Embassy Sealing': 'Scellage à l’ambassade',
      },
      'Réservation de billet': {
        'Ticket File': 'Fichier de billet',
        'Booking Date': 'Date de réservation',
      },
      'Réception': {
        'Receiving File': 'Fichier de réception',
        'Delivery Date': 'Date de livraison',
      },
    },
  },
  ur: {
    stages: [
      'مساند کے ساتھ ربط',
      'خارجی مساند کے ساتھ ربط',
      'خارجی دفتر کے ساتھ ربط',
      'طبی معائنہ',
      'ایجنسی کے ساتھ ربط',
      'سفارتخانے میں مہر لگانا',
      'ٹکٹ کی بکنگ',
      'وصول کرنا',
    ],
    title: 'آرڈر ٹائم لائن: {name}',
    subtitle: 'اپنے آرڈر کی پیشرفت کو حقیقی وقت میں ٹریک کریں',
    progress: 'پیشرفت: {percentage}%',
    completed: 'مکمل',
    inProgress: 'جاری',
    pending: 'زیر التواء',
    uploadLabel: 'طبی معائنہ فائل اپ لوڈ کریں',
    uploadButton: 'فائل اپ لوڈ کریں',
    uploading: 'اپ لوڈ ہو رہا ہے...',
    uploadSuccess: 'فائل کامیابی سے اپ لوڈ ہو گئی! ',
    uploadError: 'فائل اپ لوڈ کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔',
    viewFile: 'فائل دیکھیں',
    medicalFileUploaded: 'طبی فائل پہلے ہی اپ لوڈ کی جا چکی ہے۔ ',
    medicalFileRestricted: 'طبی فائل اپ لوڈ صرف موجودہ مرحلے کے دوران کی جا سکتی ہے۔',
    orderNotFound: 'آرڈر نہیں ملا',
    stageDetails: {
      'مساند کے ساتھ ربط': {
        'Internal Musaned Contract': 'اندرونی مساند معاہدہ',
        'Date of Application': 'درخواست کی تاریخ',
      },
      'خارجی مساند کے ساتھ ربط': {
        'External Musaned Contract': 'خارجی مساند معاہدہ',
        'External Date Linking': 'خارجی ربط کی تاریخ',
      },
      'خارجی دفتر کے ساتھ ربط': {
        'External Office Approval': 'خارجی دفتر کی منظوری',
        'External Office File': 'خارجی دفتر کی فائل',
      },
      'طبی معائنہ': {
        'Medical Check File': 'طبی معائنہ فائل',
      },
      'ایجنسی کے ساتھ ربط': {
        'Agency Date': 'ایجنسی کی تاریخ',
      },
      'سفارتخانے میں مہر لگانا': {
        'Embassy Sealing': 'سفارتخانے میں مہر',
      },
      'ٹکٹ کی بکنگ': {
        'Ticket File': 'ٹکٹ کی فائل',
        'Booking Date': 'بکنگ کی تاریخ',
      },
      'وصول کرنا': {
        'Receiving File': 'وصول کی فائل',
        'Delivery Date': 'ترسیل کی تاریخ',
      },
    },
  },
  ar: {
    stages: [
      'الربط مع مساند',
      'الربط مع مساند الخارجي',
      'الربط مع المكتب الخارجي',
      'الفحص الطبي',
      'الربط مع الوكالة',
      'ختم السفارة',
      'حجز التذكرة',
      'الاستلام',
    ],
    title: 'الجدول الزمني للطلب',
    subtitle: 'تتبع تقدم طلبك في الوقت الفعلي',
    progress: 'التقدم: {percentage}%',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    pending: 'معلق',
    uploadLabel: 'رفع ملف الفحص الطبي',
    uploadButton: 'رفع الملف',
    uploading: 'جارٍ الرفع...',
    uploadSuccess: 'تم رفع الملف بنجاح!',
    uploadError: 'خطأ أثناء رفع الملف. الرجاء المحاولة مرة أخرى.',
    viewFile: 'عرض الملف',
    medicalFileUploaded: 'تم رفع الملف الطبي بالفعل.',
    medicalFileRestricted: 'رفع الملف الطبي مسموح فقط خلال المرحلة الحالية.',
    orderNotFound: 'الطلب غير موجود',
    stageDetails: {
      'الربط مع مساند': {
        'Internal Musaned Contract': 'عقد مساند الداخلي',
        'Date of Application': 'تاريخ التقديم',
      },
      'الربط مع مساند الخارجي': {
        'External Musaned Contract': 'عقد مساند الخارجي',
        'External Date Linking': 'تاريخ الربط الخارجي',
      },
      'الربط مع المكتب الخارجي': {
        'External Office Approval': 'موافقة المكتب الخارجي',
        'External Office File': 'ملف المكتب الخارجي',
      },
      'الفحص الطبي': {
        'Medical Check File': 'ملف الفحص الطبي',
      },
      'الربط مع الوكالة': {
        'Agency Date': 'تاريخ الوكالة',
      },
      'ختم السفارة': {
        'Embassy Sealing': 'ختم السفارة',
      },
      'حجز التذكرة': {
        'Ticket File': 'ملف التذكرة',
        'Booking Date': 'تاريخ الحجز',
      },
      'الاستلام': {
        'Receiving File': 'ملف الاستلام',
        'Delivery Date': 'تاريخ التسليم',
      },
    },
  },
};

export default function TimelinePage() {
  const { id } = useParams();
  const { language } = useLanguage(); // Get language from context
  const [order, setOrder] = useState<NewOrder | null>(null);
  const [arrival, setArrival] = useState<ArrivalList | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Get language from local storage if context is not available
  const ISSERVER = typeof window === 'undefined';
  let lang: string = language;
  if (!ISSERVER && !language) {
    lang = localStorage.getItem('language') || 'en';
  }

  // Set RTL for Urdu
  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    // alert(lang)
  }, [lang]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/neworder/${id}`);
        const data = await response.json();
        setOrder(data.order);
        setArrival(data.arrival);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    const fileName = `medical-check/${id}/${Date.now()}_${file.name}`;

    try {
      await s3.upload({
        Bucket: process.env.DO_SPACES_BUCKET || 'your-bucket-name',
        Key: fileName,
        Body: file,
        ACL: 'public-read',
        ContentType: file.type,
      }).promise();

      const fileUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${fileName}`;
      setUploadedFileUrl(fileUrl);
      setUploadStatus('success');

      await fetch(`/api/neworder/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalCheckFile: fileUrl }),
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="rounded-full h-16 w-16 border-t-4 border-indigo-500"
        ></motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-red-500 text-xl font-semibold py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        {translations[lang]?.orderNotFound}
      </div>
    );
  }

  const currentStageIndex = order.bookingstatus ? translations[lang]?.stages.indexOf(order?.bookingstatus) : -1;
  const progressPercentage = ((currentStageIndex + 1) / translations[lang]?.stages.length) * 100;

  return (
    <div className="min-h-screen flex font-sans" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div 
      
      className="min-h-screen flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              {translations[lang]?.title.replace('{name}', order.ClientName)}
            </h1>
            <p className="mt-4 text-lg text-gray-600">{translations[lang]?.subtitle}</p>
          </motion.div>

          <div className="mb-12">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                    {translations[lang].progress.replace('{percentage}', Math.round(progressPercentage).toString())}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-indigo-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                ></motion.div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className={`absolute ${lang === 'ur' ? 'right-8' : 'left-8'} top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600`}></div>

            {translations[lang].stages.map((stage, index) => {
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const stageDetails = getStageDetails(stage, arrival, lang);
              const isExpanded = expandedStage === stage;
              const isUploadStage = stage === translations[lang].stages[3]; // 'Medical Check' stage

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: lang === 'ur' ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="mb-10 flex items-start"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-white border-4 border-indigo-200 shadow-lg z-10"
                  >
                    {isCompleted ? (
                      <FaCheckCircle className="text-green-500 text-2xl" />
                    ) : isCurrent ? (
                      <FaHourglassHalf className="text-yellow-500 text-2xl" />
                    ) : (
                      <FaTimesCircle className="text-gray-400 text-2xl" />
                    )}
                  </motion.div>

                  <div className="ml-8 w-full">
                    <motion.div
                      className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => setExpandedStage(isExpanded ? null : stage)}
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">{stage}</h2>
                        <FaInfoCircle className="text-indigo-500 text-lg" />
                      </div>
                      <p className="text-gray-600 mt-2 font-medium">
                        {isCompleted ? translations[lang].completed : isCurrent ? translations[lang].inProgress : translations[lang].pending}
                      </p>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 text-gray-700"
                          >
                            {stageDetails &&
                              Object.entries(stageDetails).map(([key, value]) => (
                                <p key={key} className="flex items-center space-x-2">
                                  <span className="font-semibold text-indigo-600">{translations[lang].stageDetails[stage][key]}:</span>
                                  <span>{value}</span>
                                </p>
                              ))}
                            {isUploadStage && (
                              <div className="mt-4">
                                {arrival?.medicalCheckFile ? (
                                  <p className="text-green-600 font-medium">
                                    {translations[lang].medicalFileUploaded}
                                    <a href={arrival.medicalCheckFile} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600">
                                      {translations[lang].viewFile}
                                    </a>
                                  </p>
                                ) : isCurrent ? (
                                  <>
                                    <label className="block text-sm font-medium text-gray-700">
                                      {translations[lang].uploadLabel}
                                    </label>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.png"
                                      onChange={handleFileChange}
                                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {file && (
                                      <button
                                        onClick={handleFileUpload}
                                        disabled={uploadStatus === 'uploading'}
                                        className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${uploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        <FaUpload className="mr-2" />
                                        {uploadStatus === 'uploading' ? translations[lang].uploading : translations[lang].uploadButton}
                                      </button>
                                    )}
                                    {uploadStatus === 'success' && (
                                      <p className="mt-2 text-green-600">
                                        {translations[lang].uploadSuccess}
                                        <a href={uploadedFileUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline">
                                          {translations[lang].viewFile}
                                        </a>
                                      </p>
                                    )}
                                    {uploadStatus === 'error' && (
                                      <p className="mt-2 text-red-600">{translations[lang].uploadError}</p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-gray-500 italic">{translations[lang].medicalFileRestricted}</p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const getStageDetails = (stage: string, arrival: ArrivalList | null, lang: string) => {
  if (!arrival) return null;

  switch (stage) {
    case translations[lang].stages[0]: // 'Link with Musaned'
      return {
        'Internal Musaned Contract': arrival.InternalmusanedContract || 'N/A',
        'Date of Application': arrival.DateOfApplication?.toString() || 'N/A',
      };
    case translations[lang].stages[1]: // 'Link with External Musaned'
      return {
        'External Musaned Contract': arrival.externalmusanedContract || 'N/A',
        'External Date Linking': arrival.ExternalDateLinking?.toString() || 'N/A',
      };
    case translations[lang].stages[2]: // 'Link with External Office'
      return {
        'External Office Approval': arrival.ExternalOFficeApproval?.toString() || 'N/A',
        'External Office File': arrival.externalOfficeFile ? (
          <a href={arrival.externalOfficeFile} target="_blank" rel="noopener noreferrer" className="underline">
            {translations[lang].viewFile}
          </a>
        ) : (
          'N/A'
        ),
      };
    case translations[lang].stages[3]: // 'Medical Check'
      return {
        'Medical Check File': arrival.medicalCheckFile ? (
          <a href={arrival.medicalCheckFile} target="_blank" rel="noopener noreferrer" className="underline">
            {translations[lang].viewFile}
          </a>
        ) : (
          'N/A'
        ),
      };
    case translations[lang].stages[4]: // 'Link with Agency'
      return {
        'Agency Date': arrival.AgencyDate?.toString() || 'N/A',
      };
    case translations[lang].stages[5]: // 'Embassy Sealing'
      return {
        'Embassy Sealing': arrival.EmbassySealing?.toString() || 'N/A',
      };
    case translations[lang].stages[6]: // 'Ticket Booking'
      return {
        'Ticket File': arrival.ticketFile || 'N/A',
        'Booking Date': arrival.BookinDate?.toString() || 'N/A',
      };
    case translations[lang].stages[7]: // 'Receiving'
      return {
        'Receiving File': arrival.receivingFile || 'N/A',
        'Delivery Date': arrival.DeliveryDate?.toString() || 'N/A',
      };
    default:
      return null;
  }
};