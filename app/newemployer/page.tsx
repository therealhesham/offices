'use client';

import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PDFProcessor from '../components/PDFProcessor';
import imageCompression from 'browser-image-compression';
import AWS from 'aws-sdk';
import { useLanguage } from '../contexts/LanguageContext';
import {
  skillLevels,
  educationOptions,
  maritalStatusOptions,
  religionOptions,
  selectOptionsWithCurrent,
} from '@/app/lib/homemaidFormOptions';

// Translation dictionary
const translations = {
  en: {
    title: 'Add New Worker',
    completionPercentage: 'Completion Percentage',
    completed: 'Completed',
    successMessage: 'Profile created successfully!',
    selectPlaceholder: 'Select…',
    submitButton: 'Create Profile',
    processing: 'Processing...',
    uploadPDFButton: 'Upload CV Automatically',
    uploadPDFButtonTooltip: 'Upload PDF file and extract data automatically using AI',
    automaticMethod: 'Automatic Method',
    manualMethod: 'Manual Method',
    tabManual: 'Manual Entry',
    tabAutomatic: 'Automatic Upload',
    reviewExtractedData: 'Review extracted data from PDF',
    uploadNewPDF: 'Upload New PDF',
    backToManual: 'Back to Manual Method',
    changeMethod: 'Change Method',
    dataExtractionSuccess: 'Data extracted successfully!',
    missingDataAlert: 'The following data is missing or incorrect:',
    pleaseReviewData: 'Please review the extracted data and complete the missing fields.',
    imagesSection: 'Upload Images',
    fullBodyImage: 'Full Body Image',
    personalImage: 'Personal Image',
    dragDrop: 'Drag and drop or click to upload',
    fileTypes: 'JPEG/PNG, max 32MB',
    chooseImage: 'Choose Image',
    uploadClearImage: 'Upload a clear image',
    personalInfoSection: 'Personal Information',
    passportFinancialSection: 'Passport & Financial Information',
    skillsLanguagesSection: 'Skills & Languages',
    fields: {
      Name: 'Full Name',
      nationality: 'Nationality',
      Religion: 'Religion',
      phone: 'Phone Number',
      email: 'Email Address',
      dateOfbirth: 'Date of Birth',
      maritalStatus: 'Marital Status',
      education: 'Education',
      PassportStart: 'Passport Start Date',
      PassportEnd: 'Passport End Date',
      salary: 'Salary in USD',
      experienceYears: 'Experience (Years)',
      // Additional fields
      age: 'Age',
      birthPlace: 'Birth Place',
      passportNumber: 'Passport Number',
      jobTitle: 'Job Title',
      livingTown: 'Living Town',
      childrenCount: 'Children Count',
      weight: 'Weight',
      height: 'Height',
      languageSkills: {
        arabic: 'Arabic Proficiency',
        english: 'English Proficiency',
      },
      skills: {
        laundry: 'Laundry Skill',
        ironing: 'Ironing Skill',
        cleaning: 'Cleaning Skill',
        cooking: 'Cooking Skill',
        sewing: 'Sewing Skill',
        babySitting: 'Babysitting Skill',
      },
    },
    tooltips: {
      Name: 'Legal full name',
      nationality: 'Country of nationality',
      Religion: 'Religious affiliation (optional)',
      phone: 'Include country code',
      email: 'Valid email address',
      dateOfbirth: 'Must be 18+ years old',
      maritalStatus: 'Single, married, etc.',
      education: 'Highest level of education',
      PassportStart: 'Passport issue date',
      PassportEnd: 'Passport expiry date',
      salary: 'Expected monthly salary',
      experienceYears: 'Relevant years of experience',
      // Additional tooltips
      age: 'Current age in years',
      birthPlace: 'City/country of birth',
      passportNumber: 'Passport number',
      jobTitle: 'Current or desired job title',
      livingTown: 'Current city of residence',
      childrenCount: 'Number of children',
      weight: 'Weight in kg',
      height: 'Height in cm',
      languageSkills: 'Proficiency level',
      skills: 'Skill level',
    },
    errors: {
      Name: 'Name is required',
      nationality: 'Nationality is required',
      phone: 'Phone number is required',
      email: 'Email is required',
      dateOfbirth: 'Date of birth is required',
      fullBodyImage: 'Full body image is required',
      personalImage: 'Personal image is required',
      invalidEmail: 'Invalid email format',
      invalidPhone: 'Phone must be 8-15 digits',
      invaliddateOfbirth: 'Date of birth must be in the past',
      ageUnder18: 'Must be at least 18 years old',
      invalidPassportDates: 'Passport end date must be after start date',
      invalidSalary: 'Salary must be a positive number',
      invalidExperience: 'Experience years must be non-negative',
      imageCompressionFailed: 'Failed to compress image.',
      invalidFileType: 'Invalid file type. Please upload JPEG or PNG.',
      imageSizeExceeded: 'Image size exceeds 32MB.',
      // Additional error messages
      age: 'Age is required',
      birthPlace: 'Birth place is required',
      passportNumber: 'Passport number is required',
      livingTown: 'Living town is required',
      weight: 'Weight is required',
      height: 'Height is required',
    },
  },
  fra: {
    title: 'Ajouter un nouveau travailleur',
    completionPercentage: 'Pourcentage d’achèvement',
    completed: 'Complété',
    successMessage: 'Profil créé avec succès !',
    selectPlaceholder: 'Choisir…',
    submitButton: 'Créer le profil',
    processing: 'Traitement en cours...',
    uploadPDFButton: 'Télécharger CV Automatiquement',
    uploadPDFButtonTooltip: 'Télécharger un fichier PDF et extraire les données automatiquement avec l\'IA',
    automaticMethod: 'Méthode Automatique',
    manualMethod: 'Méthode Manuelle',
    tabManual: 'Saisie Manuelle',
    tabAutomatic: 'Téléchargement Automatique',
    reviewExtractedData: 'Examiner les données extraites du PDF',
    uploadNewPDF: 'Télécharger Nouveau PDF',
    backToManual: 'Retour à la Méthode Manuelle',
    changeMethod: 'Changer de Méthode',
    dataExtractionSuccess: 'Données extraites avec succès !',
    missingDataAlert: 'Les données suivantes sont manquantes ou incorrectes :',
    pleaseReviewData: 'Veuillez examiner les données extraites et compléter les champs manquants.',
    imagesSection: 'Télécharger des images',
    fullBodyImage: 'Image du corps entier',
    personalImage: 'Image personnelle',
    dragDrop: 'Glisser-déposer ou cliquer pour télécharger',
    fileTypes: 'JPEG/PNG, max 32 Mo',
    chooseImage: 'Choisir une image',
    uploadClearImage: 'Téléchargez une image claire',
    personalInfoSection: 'Informations personnelles',
    passportFinancialSection: 'Informations sur le passeport et financières',
    skillsLanguagesSection: 'Compétences et langues',
    fields: {
      Name: 'Nom complet',
      nationality: 'Nationalité',
      Religion: 'Religion',
      phone: 'Numéro de téléphone',
      email: 'Adresse e-mail',
      dateOfbirth: 'Date de naissance',
      maritalStatus: 'État civil',
      education: 'Éducation',
      PassportStart: 'Date de début du passeport',
      PassportEnd: 'Date de fin du passeport',
      salary: 'Salaire en USD',
      experienceYears: 'Expérience (années)',
      languageSkills: {
        arabic: 'Maîtrise de l’arabe',
        english: 'Maîtrise de l’anglais',
      },
      skills: {
        laundry: 'Compétence en lessive',
        ironing: 'Compétence en repassage',
        cleaning: 'Compétence en nettoyage',
        cooking: 'Compétence en cuisine',
        sewing: 'Compétence en couture',
        babySitting: 'Compétence en garde d’enfants',
      },
    },
    tooltips: {
      Name: 'Nom légal complet',
      nationality: 'Pays de nationalité',
      Religion: 'Affiliation religieuse (facultatif)',
      phone: 'Inclure le code du pays',
      email: 'Adresse e-mail valide',
      dateOfbirth: 'Doit avoir 18 ans ou plus',
      maritalStatus: 'Célibataire, marié, etc.',
      education: 'Niveau d’éducation le plus élevé',
      PassportStart: 'Date d’émission du passeport',
      PassportEnd: 'Date d’expiration du passeport',
      salary: 'Salaire mensuel attendu',
      experienceYears: 'Années d’expérience pertinentes',
      languageSkills: 'Niveau de maîtrise',
      skills: 'Niveau de compétence',
    },
    errors: {
      Name: 'Le nom est requis',
      nationality: 'La nationalité est requise',
      phone: 'Le numéro de téléphone est requis',
      email: 'L’e-mail est requis',
      dateOfbirth: 'La date de naissance est requise',
      fullBodyImage: 'L’image du corps entier est requise',
      personalImage: 'L’image personnelle est requise',
      invalidEmail: 'Format d’e-mail invalide',
      invalidPhone: 'Le téléphone doit comporter 8 à 15 chiffres',
      invaliddateOfbirth: 'La date de naissance doit être dans le passé',
      ageUnder18: 'Doit avoir au moins 18 ans',
      invalidPassportDates: 'La date de fin du passeport doit être postérieure à la date de début',
      invalidSalary: 'Le salaire doit être un nombre positif',
      invalidExperience: 'Les années d’expérience doivent être non négatives',
      imageCompressionFailed: 'Échec de la compression de l’image.',
      invalidFileType: 'Type de fichier invalide. Veuillez télécharger JPEG ou PNG.',
      imageSizeExceeded: 'La taille de l’image dépasse 32 Mo.',
    },
  },
  ar: {
    title: 'إضافة عاملة جديدة',
    completionPercentage: 'نسبة الإكمال',
    completed: 'مكتمل',
    successMessage: 'تم إنشاء الملف الشخصي بنجاح!',
    selectPlaceholder: 'اختر…',
    submitButton: 'إضافة عاملة',
    processing: 'جاري المعالجة...',
    uploadPDFButton: 'رفع سيرة ذاتية تلقائياً',
    uploadPDFButtonTooltip: 'رفع ملف PDF واستخراج البيانات تلقائياً باستخدام الذكاء الاصطناعي',
    automaticMethod: 'الطريقة التلقائية',
    manualMethod: 'الطريقة اليدوية',
    tabManual: 'الإدخال اليدوي',
    tabAutomatic: 'الرفع التلقائي',
    reviewExtractedData: 'مراجعة البيانات المستخرجة من PDF',
    uploadNewPDF: 'رفع PDF جديد',
    backToManual: 'العودة للطريقة اليدوية',
    changeMethod: 'تغيير الطريقة',
    dataExtractionSuccess: 'تم استخراج البيانات بنجاح!',
    missingDataAlert: 'البيانات التالية مفقودة أو غير صحيحة:',
    pleaseReviewData: 'يرجى مراجعة البيانات المستخرجة وإكمال الحقول المفقودة.',
    imagesSection: 'رفع الصور',
    fullBodyImage: 'صورة الجسم كاملاً',
    personalImage: 'الصورة الشخصية',
    dragDrop: 'اسحب وأفلت أو انقر للرفع',
    fileTypes: 'JPEG/PNG، حد أقصى 32 ميجابايت',
    chooseImage: 'اختر صورة',
    uploadClearImage: 'ارفع صورة واضحة',
    personalInfoSection: 'المعلومات الشخصية',
    passportFinancialSection: 'معلومات الجواز والمالية',
    skillsLanguagesSection: 'المهارات واللغات',
    fields: {
      Name: 'الاسم الكامل',
      nationality: 'الجنسية',
      Religion: 'الدين',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      dateOfbirth: 'تاريخ الميلاد',
      maritalStatus: 'الحالة الاجتماعية',
      education: 'التعليم',
      PassportStart: 'تاريخ بداية الجواز',
      PassportEnd: 'تاريخ انتهاء الجواز',
      salary: 'الراتب',
      experienceYears: 'سنوات الخبرة',
      age: 'العمر',
      birthPlace: 'مكان الميلاد',
      passportNumber: 'رقم الجواز',
      jobTitle: 'المسمى الوظيفي',
      livingTown: 'المدينة',
      childrenCount: 'عدد الأطفال',
      weight: 'الوزن',
      height: 'الطول',
      'languageSkills.arabic': 'العربية',
      'languageSkills.english': 'الإنجليزية',
      'skills.laundry': 'الغسيل',
      'skills.ironing': 'الكي',
      'skills.cleaning': 'التنظيف',
      'skills.cooking': 'الطبخ',
      'skills.sewing': 'الخياطة',
      'skills.babySitting': 'رعاية الأطفال'
    },
    tooltips: {
      Name: 'أدخل الاسم الكامل للعاملة',
      nationality: 'اختر الجنسية',
      Religion: 'اختر الدين',
      phone: 'أدخل رقم الهاتف',
      email: 'أدخل البريد الإلكتروني',
      dateOfbirth: 'اختر تاريخ الميلاد',
      maritalStatus: 'اختر الحالة الاجتماعية',
      education: 'أدخل مستوى التعليم',
      PassportStart: 'اختر تاريخ بداية الجواز',
      PassportEnd: 'اختر تاريخ انتهاء الجواز',
      salary: 'أدخل الراتب المطلوب',
      experienceYears: 'أدخل سنوات الخبرة',
      age: 'أدخل العمر',
      birthPlace: 'أدخل مكان الميلاد',
      passportNumber: 'أدخل رقم الجواز',
      jobTitle: 'أدخل المسمى الوظيفي',
      livingTown: 'أدخل المدينة',
      childrenCount: 'أدخل عدد الأطفال',
      weight: 'أدخل الوزن',
      height: 'أدخل الطول',
      'languageSkills.arabic': 'مستوى اللغة العربية',
      'languageSkills.english': 'مستوى اللغة الإنجليزية',
      'skills.laundry': 'مستوى مهارة الغسيل',
      'skills.ironing': 'مستوى مهارة الكي',
      'skills.cleaning': 'مستوى مهارة التنظيف',
      'skills.cooking': 'مستوى مهارة الطبخ',
      'skills.sewing': 'مستوى مهارة الخياطة',
      'skills.babySitting': 'مستوى مهارة رعاية الأطفال'
    },
    errors: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      invalidPhone: 'رقم الهاتف غير صحيح',
      ageUnder18: 'العمر يجب أن يكون 18 سنة أو أكثر',
      invalidPassportDates: 'تاريخ انتهاء الجواز يجب أن يكون بعد تاريخ البداية',
      invalidSalary: 'الراتب يجب أن يكون رقم صحيح',
      invalidExperience: 'سنوات الخبرة يجب أن تكون رقم صحيح'
    }
  },
  ur: {
    title: 'نئی ورکر شامل کریں',
    completionPercentage: 'مکمل ہونے کا فیصد',
    completed: 'مکمل',
    successMessage: 'پروفائل کامیابی سے بنایا گیا!',
    selectPlaceholder: 'منتخب کریں…',
    submitButton: 'پروفائل بنائیں',
    processing: 'پروسیسنگ جاری ہے...',
    uploadPDFButton: 'CV خودکار اپ لوڈ کریں',
    uploadPDFButtonTooltip: 'PDF فائل اپ لوڈ کریں اور AI کا استعمال کرتے ہوئے ڈیٹا خودکار نکالیں',
    automaticMethod: 'خودکار طریقہ',
    manualMethod: 'دستی طریقہ',
    tabManual: 'دستی انٹری',
    tabAutomatic: 'خودکار اپ لوڈ',
    reviewExtractedData: 'PDF سے نکالے گئے ڈیٹا کا جائزہ لیں',
    uploadNewPDF: 'نیا PDF اپ لوڈ کریں',
    backToManual: 'دستی طریقے پر واپس جائیں',
    changeMethod: 'طریقہ تبدیل کریں',
    dataExtractionSuccess: 'ڈیٹا کامیابی سے نکالا گیا!',
    missingDataAlert: 'مندرجہ ذیل ڈیٹا غائب یا غلط ہے:',
    pleaseReviewData: 'براہ کرم نکالے گئے ڈیٹا کا جائزہ لیں اور غائب فیلڈز کو مکمل کریں۔',
    imagesSection: 'تصاویر اپ لوڈ کریں',
    fullBodyImage: 'مکمل جسم کی تصویر',
    personalImage: 'ذاتی تصویر',
    dragDrop: 'ڈریگ اینڈ ڈراپ کریں یا کلک کریں اپ لوڈ کرنے کے لیے',
    fileTypes: 'JPEG/PNG، زیادہ سے زیادہ 32MB',
    chooseImage: 'تصویر منتخب کریں',
    uploadClearImage: 'صاف تصویر اپ لوڈ کریں',
    personalInfoSection: 'ذاتی معلومات',
    passportFinancialSection: 'پاسپورٹ اور مالی معلومات',
    skillsLanguagesSection: 'ہنر اور زبانیں',
    fields: {
      Name: 'مکمل نام',
      nationality: 'قومیت',
      Religion: 'مذہب',
      phone: 'فون نمبر',
      email: 'ای میل ایڈریس',
      dateOfbirth: 'تاریخ پیدائش',
      maritalStatus: 'ازدواجی حیثیت',
      education: 'تعلیم',
      PassportStart: 'پاسپورٹ شروع ہونے کی تاریخ',
      PassportEnd: 'پاسپورٹ ختم ہونے کی تاریخ',
      salary: 'امریکی ڈالر میں تنخواہ',
      experienceYears: 'تجربہ (سال)',
      languageSkills: {
        arabic: 'عربی زبان کی مہارت',
        english: 'انگریزی زبان کی مہارت',
      },
      skills: {
        laundry: 'لانڈری کی مہارت',
        ironing: 'استری کی مہارت',
        cleaning: 'صفائی کی مہارت',
        cooking: 'کھانا پکانے کی مہارت',
        sewing: 'سلائی کی مہارت',
        babySitting: 'بچوں کی دیکھ بھال کی مہارت',
      },
    },
    tooltips: {
      Name: 'قانونی مکمل نام',
      nationality: 'قومیت کا ملک',
      Religion: 'مذہبی وابستگی (اختیاری)',
      phone: 'ملک کا کوڈ شامل کریں',
      email: 'درست ای میل ایڈریس',
      dateOfbirth: '18 سال یا اس سے زیادہ ہونا چاہیے',
      maritalStatus: 'غیر شادی شدہ، شادی شدہ، وغیرہ',
      education: 'اعلیٰ تعلیمی سطح',
      PassportStart: 'پاسپورٹ جاری ہونے کی تاریخ',
      PassportEnd: 'پاسپورٹ کی میعاد ختم ہونے کی تاریخ',
      salary: 'متوقع ماہانہ تنخواہ',
      experienceYears: 'متعلقہ تجربے کے سال',
      languageSkills: 'مہارت کی سطح',
      skills: 'ہنر کی سطح',
    },
    errors: {
      Name: 'نام درکار ہے',
      nationality: 'قومیت درکار ہے',
      phone: 'فون نمبر درکار ہے',
      email: 'ای میل درکار ہے',
      dateOfbirth: 'تاریخ پیدائش درکار ہے',
      fullBodyImage: 'مکمل جسم کی تصویر درکار ہے',
      personalImage: 'ذاتی تصویر درکار ہے',
      invalidEmail: 'غلط ای میل فارمیٹ',
      invalidPhone: 'فون نمبر 8-15 ہندسوں کا ہونا چاہیے',
      invaliddateOfbirth: 'تاریخ پیدائش ماضی میں ہونی چاہیے',
      ageUnder18: 'کم از کم 18 سال کا ہونا چاہیے',
      invalidPassportDates: 'پاسپورٹ کی اختتامی تاریخ شروع کی تاریخ کے بعد ہونی چاہیے',
      invalidSalary: 'تنخواہ مثبت عدد ہونی چاہیے',
      invalidExperience: 'تجربے کے سال منفی نہیں ہو سکتے',
      imageCompressionFailed: 'تصویر کمپریس کرنے میں ناکامی۔',
      invalidFileType: 'غلط فائل کی قسم۔ براہ کرم JPEG یا PNG اپ لوڈ کریں۔',
      imageSizeExceeded: 'تصویر کا سائز 32MB سے زیادہ ہے۔',
    },
  },
};

const FormPage = () => {
  const [formData, setFormData] = useState<any>({
    Name: '',
    Religion: '',
    nationality: '',
    phone: '',
    email: '',
    dateOfbirth: '',
    salary: '',
    PassportStart: '',
    PassportEnd: '',
    experienceYears: '',
    maritalStatus: '',
    education: '',
    languageSkills: { arabic: '', english: '' },
    skills: { laundry: '', ironing: '', cleaning: '', cooking: '', sewing: '', babySitting: '' },
    fullBodyImage: '',
    personalImage: '',
    // Additional fields
    age: '',
    birthPlace: '',
    passportNumber: '',
    jobTitle: '',
    livingTown: '',
    childrenCount: '',
    weight: '',
    height: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<any>({ fullBody: null, personal: null });
  const [imageErrors, setImageErrors] = useState<any>({ fullBody: '', personal: '' });
  const [formProgress, setFormProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<any>({
    images: true,
    personal: true,
    passport: true,
    skills: true,
    pdfProcessor: true,
  });
  const fullBodyInputRef = useRef<any>(null);
  const personalInputRef = useRef<any>(null);
  const [width, setWidth] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<'automatic' | 'manual' | null>('manual');
  const [activeTab, setActiveTab] = useState<'manual' | 'automatic'>('manual');

  const { language } = useLanguage();
  // Fallback to English if language is invalid
  const validLanguages = ['en', 'fra', 'ur'];
  const t = validLanguages.includes(language) ? translations[language] : translations['en'];

  // Set text direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  // DigitalOcean Spaces Configuration
  const s3 = new AWS.S3({
    accessKeyId: 'DO801JJ6VK8NVWKDVZ8M',
    secretAccessKey: 'XYYRqI632DCboid1FyE+DJrQa9fZuXKjcoGEGkZlWnY',
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

    Object.values(formData.languageSkills).forEach((value) => {
      if (value) filledFields++;
    });

    Object.values(formData.skills).forEach((value) => {
      if (value) filledFields++;
    });

    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [formData]);

  // Validate Form
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.Name.trim()) newErrors.Name = t.errors.Name;
    if (!formData.nationality.trim()) newErrors.nationality = t.errors.nationality;
    if (!formData.phone.trim()) newErrors.phone = t.errors.phone;
    if (!formData.email.trim()) newErrors.email = t.errors.email;
    if (!formData.dateOfbirth) newErrors.dateOfbirth = t.errors.dateOfbirth;
    if (!formData.fullBodyImage) newErrors.fullBodyImage = t.errors.fullBodyImage;
    if (!formData.personalImage) newErrors.personalImage = t.errors.personalImage;
    
    // Validate additional required fields
    if (!formData.age.trim()) newErrors.age = t.errors.age;
    if (!formData.birthPlace.trim()) newErrors.birthPlace = t.errors.birthPlace;
    if (!formData.passportNumber.trim()) newErrors.passportNumber = t.errors.passportNumber;
    if (!formData.livingTown.trim()) newErrors.livingTown = t.errors.livingTown;
    if (!formData.weight.trim()) newErrors.weight = t.errors.weight;
    if (!formData.height.trim()) newErrors.height = t.errors.height;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t.errors.invalidEmail;
    }

    const phoneRegex = /^\+?\d{8,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = t.errors.invalidPhone;
    }

    const today = new Date();
    if (formData.dateOfbirth) {
      const dob = new Date(formData.dateOfbirth);
      if (dob >= today) newErrors.dateOfbirth = t.errors.invaliddateOfbirth;
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) newErrors.dateOfbirth = t.errors.ageUnder18;
    }

    if (formData.PassportStart && formData.PassportEnd) {
      const start = new Date(formData.PassportStart);
      const end = new Date(formData.PassportEnd);
      if (start >= end) newErrors.PassportEnd = t.errors.invalidPassportDates;
    }

    if (formData.salary && (isNaN(formData.salary) || Number(formData.salary) <= 0)) {
      newErrors.salary = t.errors.invalidSalary;
    }

    if (formData.experienceYears && (isNaN(formData.experienceYears) || Number(formData.experienceYears) < 0)) {
      newErrors.experienceYears = t.errors.invalidExperience;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Compress Image
  const compressImage = async (file: any) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], `${Date.now()}.jpg`, { type: 'image/jpeg' });
    } catch (error) {
      throw new Error(t.errors.imageCompressionFailed);
    }
  };

  // Upload Image to DigitalOcean Spaces
  const uploadImageToDigitalOcean = async (file: any, type: any) => {
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
        throw new Error(t.errors.invalidFileType);
      }
      if (file.size > 32 * 1024 * 1024) {
        throw new Error(t.errors.imageSizeExceeded);
      }

      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location;
    } catch (error) {
      throw error;
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e: any, type: any) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file);
      const imageUrl = await uploadImageToDigitalOcean(compressedFile, type);
      setFormData((prev: any) => ({ ...prev, [`${type}Image`]: imageUrl }));
      setImagePreviews((prev: any) => ({ ...prev, [type]: URL.createObjectURL(file) }));
      setImageErrors((prev: any) => ({ ...prev, [type]: '' }));
    } catch (error: any) {
      setImageErrors((prev: any) => ({ ...prev, [type]: error.message }));
    }
  };

  // Handle Form Submission
  const postNewEmployer = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const storage = localStorage.getItem('_item');
      const newData = await fetch('/api/save-automatic-employee', {
        method: 'POST',
        headers: {
          authorization: `bearer ${storage}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const post = await newData.json();
      if (newData.status === 200) {
        setResponse(post);
        setFormData({
          Name: '',
          Religion: '',
          nationality: '',
          phone: '',
          email: '',
          dateOfbirth: '',
          salary: '',
          PassportStart: '',
          PassportEnd: '',
          experienceYears: '',
          maritalStatus: '',
          education: '',
          languageSkills: { arabic: '', english: '' },
          skills: { laundry: '', ironing: '', cleaning: '', cooking: '', sewing: '', babySitting: '' },
          fullBodyImage: '',
          personalImage: '',
          // Additional fields
          age: '',
          birthPlace: '',
          passportNumber: '',
          jobTitle: '',
          livingTown: '',
          childrenCount: '',
          weight: '',
          height: '',
        });
        setImagePreviews({ fullBody: null, personal: null });
        if (fullBodyInputRef.current) fullBodyInputRef.current.value = null;
        if (personalInputRef.current) personalInputRef.current.value = null;
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Input Changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('languageSkills.')) {
      const lang = name.split('.')[1];
      setFormData((prevData: any) => ({
        ...prevData,
        languageSkills: { ...prevData.languageSkills, [lang]: value },
      }));
    } else if (name.includes('skills.')) {
      const skill = name.split('.')[1];
      setFormData((prevData: any) => ({
        ...prevData,
        skills: { ...prevData.skills, [skill]: value },
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setErrors((prevErrors: any) => ({ ...prevErrors, [name]: '' }));
  };

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and Drop Handlers
  const handleDragOver = (e: any, type: any) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-gray-500', 'bg-gray-100');
  };

  const handleDragLeave = (e: any, type: any) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-gray-500', 'bg-gray-100');
  };

  const handleDrop = async (e: any, type: any) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-gray-500', 'bg-gray-100');
    const file = e.dataTransfer.files[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } };
      await handleImageUpload(syntheticEvent, type);
    }
  };

  // Toggle Section
  const toggleSection = (section: any) => {
    setExpandedSections((prev: any) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle PDF Data Extraction
  const handlePDFDataExtracted = (extractedData: any) => {
    // Validate extracted data first
    const validationErrors = validateExtractedData(extractedData);
    
    // Store missing fields for visual indication
    setMissingFields(validationErrors);
    
    if (validationErrors.length > 0) {
      // Show validation errors to user
      alert(`${t.dataExtractionSuccess}\n\n${t.missingDataAlert}\n${validationErrors.join('\n')}\n\n${t.pleaseReviewData}`);
    }
    
    setFormData((prevData: any) => ({
      ...prevData,
      ...extractedData
    }));
    
    // Close PDF processor and show the form for review
    setExpandedSections((prev: any) => ({ ...prev, pdfProcessor: false }));
    // Switch to manual tab to show the form for review
    setActiveTab('manual');
  };

  // Handle PDF Images Extracted
  const handlePDFImagesExtracted = (images: any) => {
    if (images.length >= 2) {
      setFormData((prevData: any) => ({
        ...prevData,
        personalImage: images[0],
        fullBodyImage: images[1]
      }));
      setImagePreviews({
        personal: images[0],
        fullBody: images[1]
      });
    }
  };


  // دالة التحقق من صحة البيانات المستخرجة
  const validateExtractedData = (data: any): string[] => {
    const errors: string[] = [];
    
    // Required fields validation
    const requiredFields = [
      { key: 'Name', label: 'الاسم الكامل' },
      { key: 'dateOfbirth', label: 'تاريخ الميلاد' },
      { key: 'age', label: 'العمر' },
      { key: 'nationality', label: 'الجنسية' },
      { key: 'birthPlace', label: 'مكان الميلاد' },
      { key: 'PassportStart', label: 'تاريخ إصدار جواز السفر' },
      { key: 'PassportEnd', label: 'تاريخ انتهاء جواز السفر' },
      { key: 'Religion', label: 'الدين' },
      { key: 'passportNumber', label: 'رقم جواز السفر' },
      { key: 'salary', label: 'الراتب' },
      { key: 'livingTown', label: 'المدينة' },
      { key: 'childrenCount', label: 'عدد الأطفال' },
      { key: 'weight', label: 'الوزن' },
      { key: 'height', label: 'الطول' },
      { key: 'maritalStatus', label: 'الحالة الاجتماعية' }
    ];

    requiredFields.forEach(field => {
      if (!data[field.key] || data[field.key].toString().trim() === '') {
        errors.push(field.label);
      }
    });

    // Validate skills
    const skills = data.skills || {};
    const hasAnySkill = Object.values(skills).some((skill: any) => skill && skill.toString().trim() !== '');
    if (!hasAnySkill) {
      errors.push('المهارات');
    }

    // Validate languages
    const languages = data.languageSkills || {};
    const hasAnyLanguage = Object.values(languages).some((lang: any) => lang && lang.toString().trim() !== '');
    if (!hasAnyLanguage) {
      errors.push('اللغات');
    }

    return errors;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E5E5E5] text-gray-800 ${width > 640 ? 'flex flex-row' : 'flex flex-col'}`}>
      <Sidebar />
      <div className="flex-1 p-4 sm:p-8 md:p-12 overflow-auto">

        {/* Form Content - Always show */}
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 sm:p-10 md:p-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-800 tracking-tight">
                  {t.title}
                </h1>
              </div>

              <div className="w-full sm:w-64">
                <p className="text-sm text-gray-600 mb-2">{t.completionPercentage}</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-500 to-gray-700 transition-all duration-500"
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{formProgress}% {t.completed}</p>
              </div>
            </div>
            {/* Tab System for Method Selection */}
            {/* <div className="mb-8">
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => {
                    setActiveTab('manual');
                    setInputMethod('manual');
                  }}
                  className={`flex-1 py-3 px-6 rounded-lg cursor-pointer font-medium transition-all duration-300 ${
                    activeTab === 'manual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{t.tabManual}</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('automatic');
                    setInputMethod('automatic');
                  }}
                  className={`flex-1 py-3 px-6 rounded-lg cursor-pointer font-medium transition-all duration-300 ${
                    activeTab === 'automatic'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{t.tabAutomatic}</span>
                  </div>
                </button>
              </div>
            </div> */}

            {/* Method Indicator - Only show when using automatic method and have extracted data */}
            {inputMethod === 'automatic' && formData.Name && (
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{t.automaticMethod}</h3>
                      <p className="text-sm text-gray-600">{t.reviewExtractedData}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedSections((prev: any) => ({ ...prev, pdfProcessor: true }))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      📄 {t.uploadNewPDF}
                    </button>
                    <button
                      onClick={() => setInputMethod('manual')}
                      className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 border border-gray-300"
                    >
                      {t.backToManual}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {response && (
            <div className="mb-8 p-4 bg-green-100 border border-green-400 rounded-lg animate-fade-in">
              <p className="text-green-700 font-medium">{t.successMessage}</p>
            </div>
          )}

          {/* Missing Fields Warning */}
          {missingFields.length > 0 && (
            <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded-lg animate-fade-in">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    بيانات مفقودة من استخراج PDF
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p className="mb-2">يرجى إكمال الحقول التالية:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {missingFields.map((field, index) => (
                        <li key={index} className="font-medium">{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setMissingFields([])}
                    className="text-yellow-400 hover:text-yellow-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show form only when manual tab is active */}
          {activeTab === 'manual' && (
            <form onSubmit={postNewEmployer} className="space-y-8">
            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('images')}
                  className="flex justify-between items-center text-2xl font-semibold text-gray-700 flex-1"
                >
                  <span>{t.imagesSection}</span>
                  <svg
                    className={`w-6 h-6 transform transition-transform ${expandedSections.images ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {expandedSections.images && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-in">
                  {['fullBody', 'personal'].map((type, index) => (
                    <div key={type} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                      <label className="block text-sm font-medium text-gray-600 mb-3 capitalize">
                        {type === 'fullBody' ? t.fullBodyImage : t.personalImage}
                      </label>
                      <div
                        className={`relative w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
                          errors[`${type}Image`] || imageErrors[type]
                            ? 'border-red-500'
                            : 'border-gray-300 group-hover:border-gray-500 group-hover:bg-gray-100'
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
                            <svg
                              className="mx-auto h-10 w-10 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            <p className="text-gray-500 mt-2">{t.dragDrop}</p>
                            <p className="text-xs text-gray-400 mt-1">{t.fileTypes}</p>
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
                          {t.chooseImage}
                        </button>
                      </div>
                      {(errors[`${type}Image`] || imageErrors[type]) && (
                        <p className="text-red-500 text-xs mt-2 animate-pulse">
                          {errors[`${type}Image`] || imageErrors[type]}
                        </p>
                      )}
                      <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded">{t.uploadClearImage}</span>
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
                <span>{t.personalInfoSection}</span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${expandedSections.personal ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.personal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {[
                    { name: 'Name', type: 'text', required: true, tooltip: t.tooltips.Name },
                    { name: 'nationality', type: 'text', required: true, tooltip: t.tooltips.nationality },
                    {
                      name: 'Religion',
                      fieldType: 'select',
                      options: religionOptions,
                      tooltip: t.tooltips.Religion,
                    },
                    { name: 'phone', type: 'text', required: true, tooltip: t.tooltips.phone },
                    { name: 'email', type: 'email', required: true, tooltip: t.tooltips.email },
                    { name: 'dateOfbirth', type: 'date', required: true, tooltip: t.tooltips.dateOfbirth },
                    {
                      name: 'maritalStatus',
                      fieldType: 'select',
                      options: maritalStatusOptions,
                      tooltip: t.tooltips.maritalStatus,
                    },
                    {
                      name: 'education',
                      fieldType: 'select',
                      options: educationOptions,
                      tooltip: t.tooltips.education,
                    },
                    // Additional fields
                    { name: 'age', type: 'text', required: true, tooltip: 'العمر' },
                    { name: 'birthPlace', type: 'text', required: true, tooltip: 'مكان الميلاد' },
                    { name: 'passportNumber', type: 'text', required: true, tooltip: 'رقم جواز السفر' },
                    { name: 'jobTitle', type: 'text', tooltip: 'المسمى الوظيفي' },
                    { name: 'livingTown', type: 'text', required: true, tooltip: 'المدينة' },
                    { name: 'childrenCount', type: 'text', tooltip: 'عدد الأطفال' },
                    { name: 'weight', type: 'text', required: true, tooltip: 'الوزن' },
                    { name: 'height', type: 'text', required: true, tooltip: 'الطول' },
                  ].map((field, index) => {
                    const isSelect = (field as any).fieldType === 'select';
                    const selectOpts = (field as any).options as readonly string[] | undefined;
                    const rawVal = String((formData as any)[field.name] ?? '');
                    const opts = isSelect && selectOpts
                      ? selectOptionsWithCurrent(rawVal, selectOpts)
                      : [];
                    return (
                    <div key={field.name} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative">
                        {isSelect && selectOpts ? (
                          <select
                            name={field.name}
                            value={rawVal}
                            onChange={handleChange}
                            className={`peer w-full p-3 pt-5 bg-white border ${
                              errors[field.name] ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800`}
                            aria-invalid={errors[field.name] ? 'true' : 'false'}
                            id={field.name}
                          >
                            <option value="">{(t as any).selectPlaceholder}</option>
                            {opts.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={(field as any).type}
                            name={field.name}
                            value={(formData as any)[field.name]}
                            onChange={handleChange}
                            className={`peer w-full p-3 pt-5 bg-white border ${
                              errors[field.name] ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-transparent`}
                            placeholder={(t.fields as any)[field.name]}
                            aria-invalid={errors[field.name] ? 'true' : 'false'}
                            id={field.name}
                          />
                        )}
                        <label
                          htmlFor={field.name}
                          className={`absolute left-3 top-1 text-xs text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-600 ${
                            (formData as any)[field.name] ? 'top-1 text-xs text-gray-600' : ''
                          }`}
                        >
                          {(t.fields as any)[field.name]} {(field as any).required && <span className="text-red-500">*</span>}
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
                    );
                  })}
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
                <span>{t.passportFinancialSection}</span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${expandedSections.passport ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.passport && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {[
                    { name: 'PassportStart', type: 'date', tooltip: t.tooltips.PassportStart },
                    { name: 'PassportEnd', type: 'date', tooltip: t.tooltips.PassportEnd },
                    { name: 'salary', type: 'text', tooltip: t.tooltips.salary },
                    { name: 'experienceYears', type: 'text', tooltip: t.tooltips.experienceYears },
                  ].map((field, index) => (
                    <div key={field.name} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative">
                        <input
                          type={field.type}
                          name={field.name}
                          value={(formData as any)[field.name]}
                          onChange={handleChange}
                          className={`peer w-full p-3 pt-5 bg-white border ${
                            errors[field.name] ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-transparent`}
                          placeholder={(t.fields as any)[field.name]}
                          aria-invalid={errors[field.name] ? 'true' : 'false'}
                          id={field.name}
                        />
                        <label
                          htmlFor={field.name}
                          className={`absolute left-3 top-1 text-xs text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-600 ${
                            (formData as any)[field.name] ? 'top-1 text-xs text-gray-600' : ''
                          }`}
                        >
                          {(t.fields as any)[field.name]}
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
                <span>{t.skillsLanguagesSection}</span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.skills && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {[
                    { name: 'languageSkills.arabic', tooltip: t.tooltips.languageSkills },
                    { name: 'languageSkills.english', tooltip: t.tooltips.languageSkills },
                    { name: 'skills.laundry', tooltip: t.tooltips.skills },
                    { name: 'skills.ironing', tooltip: t.tooltips.skills },
                    { name: 'skills.cleaning', tooltip: t.tooltips.skills },
                    { name: 'skills.cooking', tooltip: t.tooltips.skills },
                    { name: 'skills.sewing', tooltip: t.tooltips.skills },
                    { name: 'skills.babySitting', tooltip: t.tooltips.skills },
                  ].map((field, index) => {
                    const rawVal =
                      field.name.includes('languageSkills')
                        ? (formData.languageSkills as any)[field.name.split('.')[1]]
                        : (formData.skills as any)[field.name.split('.')[1]];
                    const rawStr = String(rawVal ?? '');
                    const skillOpts = selectOptionsWithCurrent(rawStr, skillLevels);
                    const labelText = field.name.includes('languageSkills')
                      ? (t.fields as any).languageSkills?.[field.name.split('.')[1]] ??
                        (t.fields as any)[field.name]
                      : (t.fields as any).skills?.[field.name.split('.')[1]] ??
                        (t.fields as any)[field.name];
                    return (
                    <div key={field.name} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative">
                        <select
                          name={field.name}
                          value={rawStr}
                          onChange={handleChange}
                          className="peer w-full p-3 pt-5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-800"
                          id={field.name}
                        >
                          <option value="">{(t as any).selectPlaceholder}</option>
                          {skillOpts.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <label
                          htmlFor={field.name}
                          className={`absolute left-3 top-1 text-xs text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-600 ${
                            rawStr ? 'top-1 text-xs text-gray-600' : ''
                          }`}
                        >
                          {labelText}
                        </label>
                      </div>
                      {field.tooltip && (
                        <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded">{field.tooltip}</span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {/* <div>
                  <p className="text-sm font-medium text-blue-800">
                    سيتم حفظ جميع البيانات في جدول AutomaticEmployee
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    هذا الجدول مخصص لحفظ بيانات العاملات سواء كانت مدخلة يدوياً أو مستخرجة من PDF
                  </p>
                </div> */}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-3 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-gray-500/50 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900'
                }`}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t.processing}
                  </span>
                ) : (
                  t.submitButton
                )}
              </button>
            </div>
            </form>
          )}

          {/* Show automatic method content when automatic tab is active */}
          {activeTab === 'automatic' && (
            
             
                <div className="animate-slide-in">
                  <PDFProcessor
                    onDataExtracted={handlePDFDataExtracted}
                    onImagesExtracted={handlePDFImagesExtracted}
                    onClose={() => setExpandedSections((prev: any) => ({ ...prev, pdfProcessor: false }))}
                    language={language}
                  />
                </div>
              
          )}
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
        
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FormPage;