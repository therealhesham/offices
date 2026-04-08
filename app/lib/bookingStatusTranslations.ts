export const BOOKING_STATUS_ORDER = [
  'officeLinkInfo',
  'travel_permit_issued',
  'foreign_labor_approved',
  'externalOfficeInfo',
  'externalOfficeApproval',
  'medicalCheck',
  'foreignLaborApproval',
  'agencyPayment',
  'saudiEmbassyApproval',
  'visaIssuance',
  'travelPermit',
  'destinations',
  'receipt',
  'pending_external_office',
  'ticketUpload',
] as const;

type SupportedLanguage = 'en' | 'fra' | 'ur' | 'ar';

const BOOKING_STATUS_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    officeLinkInfo: 'Office Management Link',
    travel_permit_issued: 'Travel Permit Issued',
    foreign_labor_approved: 'Foreign Labor Approved',
    externalOfficeInfo: 'External Office',
    externalOfficeApproval: 'External Office Approval',
    medicalCheck: 'Medical Check',
    foreignLaborApproval: 'Foreign Labor Ministry Approval',
    agencyPayment: 'Agency Payment',
    saudiEmbassyApproval: 'Saudi Embassy Approval',
    visaIssuance: 'Visa Issuance',
    travelPermit: 'Travel Permit',
    destinations: 'Destinations',
    receipt: 'Receipt',
    pending_external_office: 'Pending External Office',
    ticketUpload: 'Documents Upload',
  },
  fra: {
    officeLinkInfo: 'Liaison avec la gestion des bureaux',
    travel_permit_issued: 'Permis de voyage délivré',
    foreign_labor_approved: 'Travail étranger approuvé',
    externalOfficeInfo: 'Bureau externe',
    externalOfficeApproval: 'Approbation du bureau externe',
    medicalCheck: 'Examen médical',
    foreignLaborApproval: 'Approbation du ministère du Travail étranger',
    agencyPayment: 'Paiement de l’agence',
    saudiEmbassyApproval: 'Approbation de l’ambassade saoudienne',
    visaIssuance: 'Délivrance du visa',
    travelPermit: 'Permis de voyage',
    destinations: 'Destinations',
    receipt: 'Réception',
    pending_external_office: 'En attente du bureau externe',
    ticketUpload: 'Téléversement des documents',
  },
  ur: {
    officeLinkInfo: 'دفتر انتظامیہ کے ساتھ ربط',
    travel_permit_issued: 'سفری اجازت نامہ جاری ہو گیا',
    foreign_labor_approved: 'غیر ملکی محنت کی منظوری ہو گئی',
    externalOfficeInfo: 'بیرونی دفتر',
    externalOfficeApproval: 'بیرونی دفتر کی منظوری',
    medicalCheck: 'طبی معائنہ',
    foreignLaborApproval: 'وزارتِ محنتِ خارجہ کی منظوری',
    agencyPayment: 'ایجنسی کی ادائیگی',
    saudiEmbassyApproval: 'سعودی سفارت خانے کی منظوری',
    visaIssuance: 'ویزا جاری کرنا',
    travelPermit: 'سفری اجازت نامہ',
    destinations: 'منزلیں',
    receipt: 'وصولی',
    pending_external_office: 'بیرونی دفتر کا انتظار',
    ticketUpload: 'دستاویزات اپ لوڈ',
  },
  ar: {
    officeLinkInfo: 'الربط مع إدارة المكاتب',
    travel_permit_issued: 'تم إصدار تصريح السفر',
    foreign_labor_approved: 'تمت الموافقة من وزارة العمل الأجنبية',
    externalOfficeInfo: 'المكتب الخارجي',
    externalOfficeApproval: 'موافقة المكتب الخارجي',
    medicalCheck: 'الفحص الطبي',
    foreignLaborApproval: 'موافقة وزارة العمل الأجنبية',
    agencyPayment: 'دفع الوكالة',
    saudiEmbassyApproval: 'موافقة السفارة السعودية',
    visaIssuance: 'إصدار التأشيرة',
    travelPermit: 'تصريح السفر',
    destinations: 'الوجهات',
    receipt: 'الاستلام',
    pending_external_office: 'في انتظار المكتب الخارجي',
    ticketUpload: 'رفع المستندات',
  },
};

export const translateBookingStatus = (status: string | null | undefined, language?: string) => {
  if (!status) {
    return 'N/A';
  }
  const lang = (language || 'en') as SupportedLanguage;
  return (
    BOOKING_STATUS_TRANSLATIONS[lang]?.[status] ||
    BOOKING_STATUS_TRANSLATIONS.en[status] ||
    status
  );
};
