'use client';

import { useState, useRef, useEffect } from 'react';

// Translation dictionary
const translations = {
  en: {
    title: 'PDF Document Processor',
    stepUpload: 'Upload File',
    stepSelectImages: 'Select Images',
    stepUploadImages: 'Upload Images',
    stepExtractData: 'Extract Data',
    stepSave: 'Save Data',
    step1Title: 'Step 1: Upload PDF File',
    step2Title: 'Step 2: Select Images',
    step3Title: 'Step 3: Upload Images to Digital Ocean',
    step4Title: 'Step 4: Extract Data',
    step5Title: 'Step 5: Save Data',
    uploadPDF: 'Upload PDF File',
    clickToSelect: 'Click to select or drag file here',
    selectedFile: 'Selected file:',
    processing: 'Processing...',
    extractImagesFromPDF: 'Extract Images from PDF',
    extractedImagesCount: 'Extracted {count} images from file. Please select two images:',
    personalImage: 'Personal Image',
    fullBodyImage: 'Full Body Image',
    continueToExtract: 'Continue to Extract Data',
    imagesSelectedSuccessfully: 'Images selected successfully. Click the button below to upload images to Digital Ocean.',
    selectedImagesForUpload: 'Selected Images for Upload:',
    uploadingImages: 'Uploading Images...',
    uploadToDigitalOcean: 'Upload Images to Digital Ocean',
    imagesSelectedForExtraction: 'Images selected successfully. Click the button below to extract data...',
    selectedImages: 'Selected Images:',
    extractingData: 'Extracting Data...',
    extractDataWithGemini: 'Extract Data using Gemini',
    modelUsed: 'Model Used:',
    dataExtractedSuccessfully: 'Data extracted successfully using {model}',
    tryingAgain: 'Trying Again...',
    tryWithLatestModel: 'Try with Latest Model (Pro)',
    extractedData: 'Extracted Data',
    field: 'Field',
    value: 'Value',
    noDataExtracted: 'No data extracted',
    uploadedImagesToDigitalOcean: 'Images Uploaded to Digital Ocean',
    uploaded: 'Uploaded',
    saving: 'Saving...',
    saveData: 'Save Data',
    restart: 'Restart',
    dataExtractedSuccessfullyMessage: 'Data extracted successfully!',
    uploadFailed: 'Failed to upload selected images: {error}',
    pleaseSelectAtLeastOneImage: 'Please select at least one image to save',
    noDataToSave: 'No data to save',
    pleaseSelectBothImages: 'Please select both profile image and full image',
    errorOccurred: 'An error occurred',
    failedToExtractImages: 'Failed to extract images from PDF',
    noImagesFound: 'No images found in the PDF',
    failedToExtractData: 'Failed to extract data using Gemini',
    errorOccurredDuringExtraction: 'An error occurred during data extraction',
    errorOccurredDuringProModel: 'An error occurred during pro model extraction',
    errorOccurredWhileSaving: 'An error occurred while saving',
    latestModelUsed: 'Latest model used',
    retryWithLatestModel: 'Retry with Latest Model (Pro)',
    profileImageAlt: 'Profile image {index}',
    fullImageAlt: 'Full image {index}',
    personalImageAlt: 'Personal Image',
    fullBodyImageAlt: 'Full Body Image'
  },
  fra: {
    title: 'Processeur de Documents PDF',
    stepUpload: 'Télécharger Fichier',
    stepSelectImages: 'Sélectionner Images',
    stepUploadImages: 'Télécharger Images',
    stepExtractData: 'Extraire Données',
    stepSave: 'Sauvegarder Données',
    step1Title: 'Étape 1: Télécharger Fichier PDF',
    step2Title: 'Étape 2: Sélectionner Images',
    step3Title: 'Étape 3: Télécharger Images vers Digital Ocean',
    step4Title: 'Étape 4: Extraire Données',
    step5Title: 'Étape 5: Sauvegarder Données',
    uploadPDF: 'Télécharger Fichier PDF',
    clickToSelect: 'Cliquez pour sélectionner ou glissez le fichier ici',
    selectedFile: 'Fichier sélectionné:',
    processing: 'Traitement en cours...',
    extractImagesFromPDF: 'Extraire Images du PDF',
    extractedImagesCount: 'Extrait {count} images du fichier. Veuillez sélectionner deux images:',
    personalImage: 'Image Personnelle',
    fullBodyImage: 'Image Corps Entier',
    continueToExtract: 'Continuer vers Extraction Données',
    imagesSelectedSuccessfully: 'Images sélectionnées avec succès. Cliquez sur le bouton ci-dessous pour télécharger les images vers Digital Ocean.',
    selectedImagesForUpload: 'Images Sélectionnées pour Téléchargement:',
    uploadingImages: 'Téléchargement Images...',
    uploadToDigitalOcean: 'Télécharger Images vers Digital Ocean',
    imagesSelectedForExtraction: 'Images sélectionnées avec succès. Cliquez sur le bouton ci-dessous pour extraire les données...',
    selectedImages: 'Images Sélectionnées:',
    extractingData: 'Extraction Données...',
    extractDataWithGemini: 'Extraire Données avec Gemini',
    modelUsed: 'Modèle Utilisé:',
    dataExtractedSuccessfully: 'Données extraites avec succès en utilisant {model}',
    tryingAgain: 'Nouvelle Tentative...',
    tryWithLatestModel: 'Essayer avec Modèle Plus Récent (Pro)',
    extractedData: 'Données Extraites',
    field: 'Champ',
    value: 'Valeur',
    noDataExtracted: 'Aucune donnée extraite',
    uploadedImagesToDigitalOcean: 'Images Téléchargées vers Digital Ocean',
    uploaded: 'Téléchargé',
    saving: 'Sauvegarde...',
    saveData: 'Sauvegarder Données',
    restart: 'Recommencer',
    dataExtractedSuccessfullyMessage: 'Données extraites avec succès!',
    uploadFailed: 'Échec du téléchargement des images sélectionnées: {error}',
    pleaseSelectAtLeastOneImage: 'Veuillez sélectionner au moins une image à sauvegarder',
    noDataToSave: 'Aucune donnée à sauvegarder',
    pleaseSelectBothImages: 'Veuillez sélectionner l\'image de profil et l\'image complète',
    errorOccurred: 'Une erreur s\'est produite',
    failedToExtractImages: 'Échec de l\'extraction des images du PDF',
    noImagesFound: 'Aucune image trouvée dans le PDF',
    failedToExtractData: 'Échec de l\'extraction des données avec Gemini',
    errorOccurredDuringExtraction: 'Une erreur s\'est produite lors de l\'extraction des données',
    errorOccurredDuringProModel: 'Une erreur s\'est produite lors de l\'extraction avec le modèle pro',
    errorOccurredWhileSaving: 'Une erreur s\'est produite lors de la sauvegarde',
    latestModelUsed: 'Modèle le plus récent utilisé',
    retryWithLatestModel: 'Réessayer avec Modèle Plus Récent (Pro)',
    profileImageAlt: 'Image de profil {index}',
    fullImageAlt: 'Image complète {index}',
    personalImageAlt: 'Image Personnelle',
    fullBodyImageAlt: 'Image Corps Entier'
  },
  ur: {
    title: 'PDF دستاویز پروسیسر',
    stepUpload: 'فائل اپ لوڈ کریں',
    stepSelectImages: 'تصاویر منتخب کریں',
    stepUploadImages: 'تصاویر اپ لوڈ کریں',
    stepExtractData: 'ڈیٹا نکالیں',
    stepSave: 'ڈیٹا محفوظ کریں',
    step1Title: 'مرحلہ 1: PDF فائل اپ لوڈ کریں',
    step2Title: 'مرحلہ 2: تصاویر منتخب کریں',
    step3Title: 'مرحلہ 3: Digital Ocean پر تصاویر اپ لوڈ کریں',
    step4Title: 'مرحلہ 4: ڈیٹا نکالیں',
    step5Title: 'مرحلہ 5: ڈیٹا محفوظ کریں',
    uploadPDF: 'PDF فائل اپ لوڈ کریں',
    clickToSelect: 'منتخب کرنے کے لیے کلک کریں یا فائل یہاں ڈریگ کریں',
    selectedFile: 'منتخب شدہ فائل:',
    processing: 'پروسیسنگ جاری ہے...',
    extractImagesFromPDF: 'PDF سے تصاویر نکالیں',
    extractedImagesCount: 'فائل سے {count} تصاویر نکالی گئیں۔ براہ کرم دو تصاویر منتخب کریں:',
    personalImage: 'ذاتی تصویر',
    fullBodyImage: 'مکمل جسم کی تصویر',
    continueToExtract: 'ڈیٹا نکالنے کے لیے جاری رکھیں',
    imagesSelectedSuccessfully: 'تصاویر کامیابی سے منتخب ہو گئیں۔ Digital Ocean پر تصاویر اپ لوڈ کرنے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔',
    selectedImagesForUpload: 'اپ لوڈ کے لیے منتخب شدہ تصاویر:',
    uploadingImages: 'تصاویر اپ لوڈ ہو رہی ہیں...',
    uploadToDigitalOcean: 'Digital Ocean پر تصاویر اپ لوڈ کریں',
    imagesSelectedForExtraction: 'تصاویر کامیابی سے منتخب ہو گئیں۔ ڈیٹا نکالنے کے لیے نیچے دیے گئے بٹن پر کلک کریں...',
    selectedImages: 'منتخب شدہ تصاویر:',
    extractingData: 'ڈیٹا نکالا جا رہا ہے...',
    extractDataWithGemini: 'Gemini استعمال کرتے ہوئے ڈیٹا نکالیں',
    modelUsed: 'استعمال شدہ ماڈل:',
    dataExtractedSuccessfully: '{model} استعمال کرتے ہوئے ڈیٹا کامیابی سے نکالا گیا',
    tryingAgain: 'دوبارہ کوشش کر رہے ہیں...',
    tryWithLatestModel: 'تازہ ترین ماڈل کے ساتھ کوشش کریں (Pro)',
    extractedData: 'نکالا گیا ڈیٹا',
    field: 'فیلڈ',
    value: 'قیمت',
    noDataExtracted: 'کوئی ڈیٹا نہیں نکالا گیا',
    uploadedImagesToDigitalOcean: 'Digital Ocean پر اپ لوڈ شدہ تصاویر',
    uploaded: 'اپ لوڈ شدہ',
    saving: 'محفوظ ہو رہا ہے...',
    saveData: 'ڈیٹا محفوظ کریں',
    restart: 'دوبارہ شروع کریں',
    dataExtractedSuccessfullyMessage: 'ڈیٹا کامیابی سے نکالا گیا!',
    uploadFailed: 'منتخب شدہ تصاویر اپ لوڈ کرنے میں ناکامی: {error}',
    pleaseSelectAtLeastOneImage: 'محفوظ کرنے کے لیے کم از کم ایک تصویر منتخب کریں',
    noDataToSave: 'محفوظ کرنے کے لیے کوئی ڈیٹا نہیں',
    pleaseSelectBothImages: 'براہ کرم پروفائل تصویر اور مکمل تصویر دونوں منتخب کریں',
    errorOccurred: 'ایک خرابی ہوئی',
    failedToExtractImages: 'PDF سے تصاویر نکالنے میں ناکامی',
    noImagesFound: 'PDF میں کوئی تصویر نہیں ملی',
    failedToExtractData: 'Gemini استعمال کرتے ہوئے ڈیٹا نکالنے میں ناکامی',
    errorOccurredDuringExtraction: 'ڈیٹا نکالنے کے دوران خرابی ہوئی',
    errorOccurredDuringProModel: 'Pro ماڈل نکالنے کے دوران خرابی ہوئی',
    errorOccurredWhileSaving: 'محفوظ کرتے وقت خرابی ہوئی',
    latestModelUsed: 'تازہ ترین ماڈل استعمال شدہ',
    retryWithLatestModel: 'تازہ ترین ماڈل کے ساتھ دوبارہ کوشش کریں (Pro)',
    profileImageAlt: 'پروفائل تصویر {index}',
    fullImageAlt: 'مکمل تصویر {index}',
    personalImageAlt: 'ذاتی تصویر',
    fullBodyImageAlt: 'مکمل جسم کی تصویر'
  },
  ar: {
    title: 'معالج المستندات PDF',
    stepUpload: 'رفع الملف',
    stepSelectImages: 'اختيار الصور',
    stepUploadImages: 'رفع الصور',
    stepExtractData: 'استخراج البيانات',
    stepSave: 'حفظ البيانات',
    step1Title: 'الخطوة 1: رفع ملف PDF',
    step2Title: 'الخطوة 2: اختيار الصور',
    step3Title: 'الخطوة 3: رفع الصور إلى Digital Ocean',
    step4Title: 'الخطوة 4: استخراج البيانات',
    step5Title: 'الخطوة 5: حفظ البيانات',
    uploadPDF: 'رفع ملف PDF',
    clickToSelect: 'اضغط للاختيار أو اسحب الملف هنا',
    selectedFile: 'الملف المختار:',
    processing: 'جاري المعالجة...',
    extractImagesFromPDF: 'استخراج الصور من PDF',
    extractedImagesCount: 'تم استخراج {count} صورة من الملف. يرجى اختيار صورتين:',
    personalImage: 'الصورة الشخصية',
    fullBodyImage: 'صورة الجسم كاملاً',
    continueToExtract: 'المتابعة لاستخراج البيانات',
    imagesSelectedSuccessfully: 'تم اختيار الصور بنجاح. اضغط على الزر أدناه لرفع الصور إلى Digital Ocean.',
    selectedImagesForUpload: 'الصور المختارة للرفع:',
    uploadingImages: 'جاري رفع الصور...',
    uploadToDigitalOcean: 'رفع الصور إلى Digital Ocean',
    imagesSelectedForExtraction: 'تم اختيار الصور بنجاح. اضغط على الزر أدناه لاستخراج البيانات...',
    selectedImages: 'الصور المختارة:',
    extractingData: 'جاري استخراج البيانات...',
    extractDataWithGemini: 'استخراج البيانات باستخدام Gemini',
    modelUsed: 'النموذج المستخدم:',
    dataExtractedSuccessfully: 'تم استخراج البيانات بنجاح باستخدام {model}',
    tryingAgain: 'جاري المحاولة...',
    tryWithLatestModel: 'جرب بالنموذج الأحدث (Pro)',
    extractedData: 'البيانات المستخرجة',
    field: 'الحقل',
    value: 'القيمة',
    noDataExtracted: 'لم يتم استخراج أي بيانات',
    uploadedImagesToDigitalOcean: 'الصور المرفوعة إلى Digital Ocean',
    uploaded: 'مرفوعة',
    saving: 'جاري الحفظ...',
    saveData: 'حفظ البيانات',
    restart: 'إعادة البدء',
    dataExtractedSuccessfullyMessage: 'تم استخراج البيانات بنجاح!',
    uploadFailed: 'فشل في رفع الصور المختارة: {error}',
    pleaseSelectAtLeastOneImage: 'يرجى اختيار صورة واحدة على الأقل',
    noDataToSave: 'لا توجد بيانات للحفظ',
    pleaseSelectBothImages: 'يرجى اختيار الصورة الشخصية وصورة الجسم كاملاً',
    errorOccurred: 'حدث خطأ',
    failedToExtractImages: 'فشل في استخراج الصور من PDF',
    noImagesFound: 'لم يتم العثور على صور في PDF',
    failedToExtractData: 'فشل في استخراج البيانات باستخدام Gemini',
    errorOccurredDuringExtraction: 'حدث خطأ أثناء استخراج البيانات',
    errorOccurredDuringProModel: 'حدث خطأ أثناء استخراج البيانات بالنموذج المحسن',
    errorOccurredWhileSaving: 'حدث خطأ أثناء الحفظ',
    latestModelUsed: 'تم استخدام النموذج الأحدث',
    retryWithLatestModel: 'جرب بالنموذج الأحدث (Pro)',
    profileImageAlt: 'صورة شخصية {index}',
    fullImageAlt: 'صورة بالطول {index}',
    personalImageAlt: 'الصورة الشخصية',
    fullBodyImageAlt: 'صورة الجسم كاملاً'
  }
};

// Helper function to get translation with fallback
const getTranslation = (key: string, lang: string = 'ar', params: Record<string, any> = {}) => {
  const t = translations[lang as keyof typeof translations] || translations.ar;
  let text = t[key as keyof typeof t] || key;
  
  // Replace parameters in the text
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
};

interface ExtractedData {
  jsonResponse: Record<string, string>;
}

interface ProcessingResult {
  extractedImages: string[];
  geminiData: ExtractedData;
  errors?: string[];
}

interface PDFProcessorProps {
  onDataExtracted: (data: any) => void;
  onImagesExtracted: (images: string[]) => void;
  onClose: () => void;
  language?: string;
}

export default function PDFProcessor({ onDataExtracted, onImagesExtracted, onClose, language = 'en' }: PDFProcessorProps) {
  // Get translations for the current language
  const t = translations[language as keyof typeof translations] || translations.en;
  
  // Force re-render when language changes
  useEffect(() => {
    // This will trigger a re-render when language prop changes
    console.log('PDFProcessor language changed to:', language);
  }, [language]);
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string>('');
  const [selectedFullImage, setSelectedFullImage] = useState<string>('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'upload' | 'select-images' | 'upload-images' | 'extract-data' | 'save'>('upload');
  const [currentModel, setCurrentModel] = useState('gemini-2.5-flash');
  const [isRetryingWithPro, setIsRetryingWithPro] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['upload']));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step navigation functions
  const goToNextStep = () => {
    const steps = ['upload', 'select-images', 'upload-images', 'extract-data', 'save'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1] as any;
      setCurrentStep(nextStep);
      setVisitedSteps(prev => new Set([...prev, nextStep]));
    }
  };

  const goToPreviousStep = () => {
    const steps = ['upload', 'select-images', 'upload-images', 'extract-data', 'save'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1] as any;
      setCurrentStep(prevStep);
    }
  };

  const canGoNext = () => {
    const steps = ['upload', 'select-images', 'upload-images', 'extract-data', 'save'];
    const currentIndex = steps.indexOf(currentStep);
    const nextStep = steps[currentIndex + 1];
    
    // Can only go to next step if we've already visited it before
    return currentIndex < steps.length - 1 && visitedSteps.has(nextStep);
  };

  const canGoPrevious = () => {
    const steps = ['upload', 'select-images', 'upload-images', 'extract-data', 'save'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex > 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setError('No file selected');
      setFile(null);
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setProcessingResult(null);
    setSelectedImages([]);
    setSaveMessage('');
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const imageFormData = new FormData();
      imageFormData.append('file', file);

      const imageResponse = await fetch('https://extract.rawaes.com/extract-images', {
        method: 'POST',
        body: imageFormData,
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.detail || 'Failed to extract images from PDF');
      }

      const imageResult = await imageResponse.json();
      const extractedImages = imageResult.image_urls || [];

      if (extractedImages.length === 0) {
        throw new Error('No images found in the PDF');
      }

      setProcessingResult({
        extractedImages,
        geminiData: { jsonResponse: {} },
        errors: [],
      });
      setCurrentStep('select-images');
      setVisitedSteps(prev => new Set([...prev, 'select-images']));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageSelection = () => {
    if (!selectedProfileImage || !selectedFullImage) {
      setError(t.pleaseSelectBothImages);
      return;
    }

    setSelectedImages([selectedProfileImage, selectedFullImage]);
    setCurrentStep('upload-images');
    setVisitedSteps(prev => new Set([...prev, 'upload-images']));
  };

  const uploadSelectedImages = async () => {
    if (selectedImages.length === 0) {
      setError(t.pleaseSelectAtLeastOneImage);
      return;
    }

    setIsUploadingImages(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const imageUrl = selectedImages[i];
        
        try {
          // Fetch the image from the extracted URL
          const imageResponse = await fetchWithTimeout(imageUrl);
          if (!imageResponse.ok) {
            console.error(`Failed to fetch image ${i}:`, imageResponse.status);
            continue;
          }

          const imageBlob = await imageResponse.blob();
          
          // Get presigned URL for Digital Ocean
          const presignedResponse = await fetchWithTimeout(`/api/upload-image-presigned-url/image-${Date.now()}-${i}`);
          if (!presignedResponse.ok) {
            console.error(`Failed to get presigned URL for image ${i}:`, presignedResponse.status);
            continue;
          }

          const { url, filePath } = await presignedResponse.json();

          // Upload to Digital Ocean
          const uploadResponse = await fetchWithTimeout(url, {
            method: 'PUT',
            body: imageBlob,
            headers: {
              'Content-Type': imageBlob.type || 'image/jpeg',
              'x-amz-acl': 'public-read',
            },
          });

          if (uploadResponse.ok) {
            uploadedUrls.push(filePath);
            console.log(`Successfully uploaded image ${i}:`, filePath);
          } else {
            console.error(`Failed to upload image ${i}:`, uploadResponse.status);
          }
        } catch (imageError) {
          console.error(`Error processing image ${i}:`, imageError);
          continue;
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('فشل في رفع جميع الصور');
      }

      setUploadedImageUrls(uploadedUrls);
      setCurrentStep('extract-data');
      setVisitedSteps(prev => new Set([...prev, 'extract-data']));
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setError(t.uploadFailed.replace('{error}', error.message));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleDataExtraction = async (modelName: string = 'gemini-2.5-flash') => {
    if (!file) {
      setError('No file available for data extraction');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const geminiFormData = new FormData();
      geminiFormData.append('image', file);
      geminiFormData.append('model', modelName);

      const geminiResponse = await fetch('https://aidoc.rawaes.com/api/gemini', {
        method: 'POST',
        body: geminiFormData,
      });

      if (!geminiResponse.ok) {
        throw new Error('Failed to extract data using Gemini');
      }

      const geminiResult = await geminiResponse.json();
      const geminiData = { jsonResponse: geminiResult.jsonResponse };

      setProcessingResult((prev) =>
        prev
          ? { ...prev, geminiData }
          : { extractedImages: [], geminiData, errors: [] }
      );
      setCurrentModel(modelName);
      setCurrentStep('save');
      setVisitedSteps(prev => new Set([...prev, 'save']));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during data extraction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProfileImageSelect = (imageUrl: string) => {
    setSelectedProfileImage(imageUrl);
  };

  const handleFullImageSelect = (imageUrl: string) => {
    setSelectedFullImage(imageUrl);
  };

  const handleProModelRetry = async () => {
    setIsRetryingWithPro(true);
    setError('');
    
    try {
      await handleDataExtraction('gemini-2.0-flash-exp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during pro model extraction');
    } finally {
      setIsRetryingWithPro(false);
    }
  };

  const handleSave = async () => {
    if (!processingResult) {
      setError(t.noDataToSave);
      return;
    }

    if (selectedImages.length === 0) {
      setError(t.pleaseSelectAtLeastOneImage);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Map the extracted data to the form format
      const extractedData = processingResult.geminiData.jsonResponse;
      
      // Helper function to parse JSON strings
      const parseJsonField = (value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        }
        return value;
      };

      // Parse skills and languages_spoken if they are JSON strings
      const skills = parseJsonField(extractedData.skills);
      const languagesSpoken = parseJsonField(extractedData.languages_spoken);

      const mappedData = {
        Name: extractedData.full_name || extractedData.Name || extractedData.name || '',
        nationality: extractedData.nationality || extractedData.Nationality || '',
        Religion: extractedData.religion || extractedData.Religion || '',
        phone: extractedData.phone || extractedData.Phone || '',
        email: extractedData.email || extractedData.Email || '',
        dateOfbirth: extractedData.date_of_birth || extractedData.BirthDate || extractedData.birth_date || '',
        maritalStatus: extractedData.marital_status || extractedData.MaritalStatus || extractedData.maritalStatus || '',
        education: extractedData.education || extractedData.Education || '',
        PassportStart: extractedData.passport_issue_date || extractedData.PassportStartDate || extractedData.passport_start_date || '',
        PassportEnd: extractedData.passport_expiration || extractedData.PassportEndDate || extractedData.passport_end_date || '',
        salary: extractedData.salary || extractedData.Salary || '',
        experienceYears: extractedData.experience_years || extractedData.experience || '',
        // Additional fields
        age: extractedData.age || extractedData.Age || '',
        birthPlace: extractedData.birth_place || extractedData.BirthPlace || extractedData.birthPlace || '',
        passportNumber: extractedData.passport_number || extractedData.PassportNumber || extractedData.passportNumber || '',
        jobTitle: extractedData.job_title || extractedData.JobTitle || extractedData.jobTitle || '',
        livingTown: extractedData.living_town || extractedData.LivingTown || extractedData.livingTown || '',
        childrenCount: extractedData.children_count || extractedData.ChildrenCount || extractedData.childrenCount || '',
        weight: extractedData.weight || extractedData.Weight || '',
        height: extractedData.height || extractedData.Height || '',
        languageSkills: {
          arabic: languagesSpoken?.Arabic || languagesSpoken?.arabic || languagesSpoken?.Arabic || '',
          english: languagesSpoken?.English || languagesSpoken?.english || languagesSpoken?.English || ''
        },
        skills: {
          laundry: skills?.LAUNDRY || skills?.laundry || skills?.Laundry || '',
          ironing: skills?.IRONING || skills?.ironing || skills?.Ironing || '',
          cleaning: skills?.CLEANING || skills?.cleaning || skills?.Cleaning || '',
          cooking: skills?.COOKING || skills?.cooking || skills?.Cooking || '',
          sewing: skills?.SEWING || skills?.sewing || skills?.Sewing || '',
          babySitting: skills?.BABYSITTING || skills?.babysitting || skills?.Babysitting || skills?.BABYSETTING || skills?.babysetting || ''
        },
        fullBodyImage: uploadedImageUrls[1] || selectedFullImage,
        personalImage: uploadedImageUrls[0] || selectedProfileImage,
      };

      // Pass the data back to the parent component
      onDataExtracted(mappedData);
      onImagesExtracted(uploadedImageUrls.length > 0 ? uploadedImageUrls : selectedImages);
      
      setSaveMessage(t.dataExtractedSuccessfullyMessage);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProcessingResult(null);
    setSelectedImages([]);
    setSelectedProfileImage('');
    setSelectedFullImage('');
    setUploadedImageUrls([]);
    setNotes('');
    setError('');
    setSaveMessage('');
    setCurrentStep('upload');
    setCurrentModel('gemini-2.5-flash');
    setIsRetryingWithPro(false);
    setVisitedSteps(new Set(['upload']));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 text-right">
              {t.title}
            </h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex justify-between items-center">
              {[
                { step: 'upload', label: t.stepUpload },
                { step: 'select-images', label: t.stepSelectImages },
                { step: 'upload-images', label: t.stepUploadImages },
                { step: 'extract-data', label: t.stepExtractData },
                { step: 'save', label: t.stepSave },
              ].map(({ step, label }, index) => (
                <div
                  key={step}
                  className={`flex items-center transition-all duration-300 ${
                    currentStep === step
                      ? 'text-indigo-600'
                      : ['select-images', 'upload-images', 'extract-data', 'save'].includes(currentStep) &&
                        ['upload', 'select-images', 'upload-images', 'extract-data'].includes(step)
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${
                      currentStep === step
                        ? 'bg-indigo-600 text-white'
                        : ['select-images', 'upload-images', 'extract-data', 'save'].includes(currentStep) &&
                          ['upload', 'select-images', 'upload-images', 'extract-data'].includes(step)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mr-3 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: File Upload */}
          {currentStep === 'upload' && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 text-right">
                {t.step1Title}
              </h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 hover:border-indigo-300 transition-all duration-300">
                <div className="text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-block"
                    >
                      <span className="block text-base font-semibold text-gray-900">
                        {t.uploadPDF}
                      </span>
                      <span className="block text-sm text-gray-500 mt-1">
                        {t.clickToSelect}
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                      aria-label="Upload PDF file"
                    />
                  </div>
                  {file && (
                    <p className="mt-3 text-sm text-green-600 font-medium">
                      {t.selectedFile} {file.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {file && (
                <div className="mt-6 text-right">
                  <button
                    onClick={handleFileUpload}
                    disabled={isProcessing}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin -mr-2 ml-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t.processing}
                      </>
                    ) : (
                      t.extractImagesFromPDF
                    )}
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={!canGoPrevious()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  السابق
                </button>
                
                <button
                  onClick={goToNextStep}
                  disabled={!canGoNext()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  التالي
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Image Selection */}
          {currentStep === 'select-images' && processingResult && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 text-right">
                {t.step2Title}
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-right">
                {t.extractedImagesCount.replace('{count}', processingResult.extractedImages.length.toString())}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Image Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">
                    {t.personalImage}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {processingResult.extractedImages.map((imageUrl, index) => (
                      <div
                        key={`profile-${index}`}
                        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                          selectedProfileImage === imageUrl
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => handleProfileImageSelect(imageUrl)}
                        role="button"
                        aria-label={`Select profile image ${index + 1}`}
                      >
                        <img
                          src={imageUrl}
                          alt={t.profileImageAlt.replace('{index}', (index + 1).toString())}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          {selectedProfileImage === imageUrl ? (
                            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-7 h-7 bg-white rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Image Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">
                    {t.fullBodyImage}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {processingResult.extractedImages.map((imageUrl, index) => (
                      <div
                        key={`full-${index}`}
                        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                          selectedFullImage === imageUrl
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => handleFullImageSelect(imageUrl)}
                        role="button"
                        aria-label={`Select full image ${index + 1}`}
                      >
                        <img
                          src={imageUrl}
                          alt={t.fullImageAlt.replace('{index}', (index + 1).toString())}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          {selectedFullImage === imageUrl ? (
                            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-7 h-7 bg-white rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  onClick={handleImageSelection}
                  disabled={!selectedProfileImage || !selectedFullImage}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {t.continueToExtract}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={!canGoPrevious()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  السابق
                </button>
                
                <button
                  onClick={goToNextStep}
                  disabled={!canGoNext()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  التالي
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Images to Digital Ocean */}
          {currentStep === 'upload-images' && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 text-right">
                {t.step3Title}
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-right">
                {t.imagesSelectedSuccessfully}
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 text-right">
                  {t.selectedImagesForUpload}
                </h3>
                <div className="flex space-x-6 justify-end">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">الصورة الشخصية</p>
                    <img
                      src={selectedProfileImage}
                      alt="الصورة الشخصية"
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">الصورة الكاملة</p>
                    <img
                      src={selectedFullImage}
                      alt="الصورة الكاملة"
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  onClick={uploadSelectedImages}
                  disabled={isUploadingImages}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isUploadingImages ? (
                    <>
                      <svg
                        className="animate-spin -mr-2 ml-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t.uploadingImages}
                    </>
                  ) : (
                    t.uploadToDigitalOcean
                  )}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={!canGoPrevious()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  السابق
                </button>
                
                <button
                  onClick={goToNextStep}
                  disabled={!canGoNext()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  التالي
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Data Extraction */}
          {currentStep === 'extract-data' && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 text-right">
                {t.step4Title}
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-right">
                {t.imagesSelectedForExtraction}
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 text-right">
                  {t.selectedImages}
                </h3>
                <div className="flex space-x-6 justify-end">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">{t.personalImage}</p>
                    <img
                      src={selectedProfileImage}
                      alt="{t.personalImage}"
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">{t.fullBodyImage}</p>
                    <img
                      src={selectedFullImage}
                      alt="{t.fullBodyImage}"
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  onClick={() => handleDataExtraction()}
                  disabled={isProcessing}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin -mr-2 ml-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t.extractingData}
                    </>
                  ) : (
                    t.extractDataWithGemini
                  )}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={!canGoPrevious()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  السابق
                </button>
                
                <button
                  onClick={goToNextStep}
                  disabled={!canGoNext()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  التالي
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Save Data */}
          {currentStep === 'save' && processingResult && processingResult.geminiData && processingResult.geminiData.jsonResponse && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 text-right">
                {t.step5Title}
              </h2>

              {/* Model Information and Retry Button */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-900">
                        {t.modelUsed} {currentModel}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {t.dataExtractedSuccessfully.replace('{model}', currentModel)}
                      </p>
                    </div>
                    <button
                      onClick={handleProModelRetry}
                      disabled={isRetryingWithPro || currentModel === 'gemini-2.0-flash-exp'}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isRetryingWithPro ? (
                        <>
                          <svg
                            className="animate-spin -mr-1 ml-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t.tryingAgain}
                        </>
                      ) : currentModel === 'gemini-2.0-flash-exp' ? (
                        t.latestModelUsed
                      ) : (
                        t.tryWithLatestModel
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Extracted Data Display */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">
                  {t.extractedData}
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  {Object.keys(processingResult.geminiData.jsonResponse).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">
                              {t.field}
                            </th>
                            <th className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">
                              {t.value}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(processingResult.geminiData.jsonResponse).map(([key, value]) => {
                            // Parse JSON strings for skills and languages_spoken
                            const renderValue = (val: any) => {
                              if (key === 'skills' || key === 'languages_spoken') {
                                try {
                                  const parsed = typeof val === 'string' ? JSON.parse(val) : val;
                                  if (typeof parsed === 'object' && parsed !== null) {
                                    return (
                                      <div className="space-y-2">
                                        {Object.entries(parsed).map(([skillKey, skillValue]) => (
                                          <div key={skillKey} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <span className="font-medium text-gray-800">{skillKey}:</span>
                                            <span className="text-gray-600">{String(skillValue)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                } catch (e) {
                                  // If parsing fails, show as string
                                  return String(val);
                                }
                              }
                              return String(val);
                            };

                            return (
                              <tr
                                key={key}
                                className="hover:bg-gray-50 transition-all duration-200"
                              >
                                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                                  {key}
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                                  {renderValue(value)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-right">
                      {t.noDataExtracted}
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Images Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">
                  {t.uploadedImagesToDigitalOcean}
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <div className="flex space-x-6 justify-end">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">{t.personalImage}</p>
                      <img
                        src={uploadedImageUrls[0] || selectedProfileImage}
                        alt="{t.personalImage}"
                        className="w-28 h-28 object-cover rounded-lg shadow-sm"
                      />
                      {uploadedImageUrls[0] && (
                        <p className="text-xs text-green-600 mt-1">✓ {t.uploaded}</p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">{t.fullBodyImage}</p>
                      <img
                        src={uploadedImageUrls[1] || selectedFullImage}
                        alt="{t.fullBodyImage}"
                        className="w-28 h-28 object-cover rounded-lg shadow-sm"
                      />
                      {uploadedImageUrls[1] && (
                        <p className="text-xs text-green-600 mt-1">✓ {t.uploaded}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-4 justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -mr-2 ml-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t.saving}
                    </>
                  ) : (
                    t.saveData
                  )}
                </button>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  {t.restart}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={!canGoPrevious()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  السابق
                </button>
                
                <button
                  onClick={goToNextStep}
                  disabled={!canGoNext()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  التالي
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{saveMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// إضافة timeout للـ fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
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
    { key: 'religion', label: 'الدين' },
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
