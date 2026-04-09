'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaInfoCircle,
  FaUpload,
} from 'react-icons/fa';
import AWS from 'aws-sdk';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { isStageVisibleOnExternalOffice, type TimelineStage } from '@/app/lib/timelineStage';
import { fetchCustomTimelineForOffice } from '@/app/lib/officeCustomTimeline';
import { getSpacesPublicObjectUrl } from '@/app/lib/spacesPublicUrl';
import { normalizeCustomStagesPrev } from '@/app/lib/customTimelineStagesJson';

// ——— نفس ترتيب ومنطق pages/admin/track_order/[id].tsx ———
export const TRACK_ORDER_STEPS = [
  'officeLinkInfo',
  'officeLinkApproval',
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
] as const;

export type TrackOrderStep = (typeof TRACK_ORDER_STEPS)[number];

/** حقول مطابقة لـ prisma arrivallist المستخدمة في track_order API */
export interface ArrivalTimeline {
  InternalmusanedContract?: string | null;
  DateOfApplication?: string | Date | null;
  externalmusanedContract?: string | null;
  ExternalDateLinking?: string | Date | null;
  externalOfficeStatus?: string | null;
  ExternalOFficeApproval?: string | Date | null;
  externalOfficeFile?: string | null;
  medicalCheckDate?: string | Date | null;
  medicalCheckFile?: string | null;
  foreignLaborApproval?: boolean | null;
  foreignLaborApprovalDate?: string | Date | null;
  approvalPayment?: string | null;
  EmbassySealing?: string | Date | null;
  visaIssuanceDate?: string | Date | null;
  VisaFile?: string | null;
  travelPermit?: string | null;
  deparatureCityCountry?: string | null;
  arrivalSaudiAirport?: string | null;
  deparatureCityCountryDate?: string | Date | null;
  deparatureCityCountryTime?: string | null;
  KingdomentryDate?: string | Date | null;
  KingdomentryTime?: string | null;
  DeliveryDate?: string | Date | null;
  receiptMethod?: string | null;
  ticketFile?: string | null;
  visaNumber?: string | null;
  receivingFile?: string | null;
  /** مراحل مخصصة: سؤال (answer) أو ملف (fileUrl) */
  customTimelineStages?: Record<
    string,
    { completed?: boolean; date?: string; answer?: string; fileUrl?: string }
  > | null;
}

export interface OrderForTimeline {
  ClientName?: string;
  bookingstatus?: string;
  visa?: { visaNumber?: string | null } | null;
  HomeMaid?: { officeName?: string | null } | null;
}

function depDateTime(a: ArrivalTimeline | null): string {
  if (!a?.deparatureCityCountryDate) return 'N/A';
  const d = a.deparatureCityCountryDate;
  const date =
    typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0];
  return `${date} ${a.deparatureCityCountryTime || ''}`.trim();
}

function arrDateTime(a: ArrivalTimeline | null): string {
  if (!a?.KingdomentryDate) return 'N/A';
  const d = a.KingdomentryDate;
  const date =
    typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0];
  return `${date} ${a.KingdomentryTime || ''}`.trim();
}

/** أي قيمة تُعرض كمعلومة فعلية (ليس فراغاً ولا N/A) */
function hasPresent(v: unknown): boolean {
  if (v === true) return true;
  if (v === false || v == null) return false;
  if (typeof v === 'boolean') return false;
  if (v instanceof Date) return !Number.isNaN(v.getTime());
  const s = String(v).trim();
  if (s === '' || s === 'N/A') return false;
  return true;
}

/** المرحلة مكتملة إذا وُجدت أي معلومة واحدة ضمن حقول هذه المرحلة */
function isStepCompleted(
  step: TrackOrderStep,
  ctx: {
    arrival: ArrivalTimeline | null;
    visaNumber?: string | null;
    homemaidOfficeName?: string | null;
  }
): boolean {
  const a = ctx.arrival;
  const visa = ctx.visaNumber ?? a?.visaNumber ?? null;

  switch (step) {
    case 'officeLinkInfo':
      return [visa, a?.InternalmusanedContract, a?.DateOfApplication].some(hasPresent);
    case 'officeLinkApproval':
      return hasPresent(a?.ExternalDateLinking);
    case 'externalOfficeInfo':
      return [ctx.homemaidOfficeName, a?.externalmusanedContract].some(hasPresent);
    case 'externalOfficeApproval':
      return [a?.externalOfficeStatus, a?.ExternalOFficeApproval, a?.externalOfficeFile].some(hasPresent);
    case 'medicalCheck':
      return [a?.medicalCheckDate, a?.medicalCheckFile].some(hasPresent);
    case 'foreignLaborApproval':
      return a?.foreignLaborApproval === true || hasPresent(a?.foreignLaborApprovalDate);
    case 'agencyPayment':
      return hasPresent(a?.approvalPayment);
    case 'saudiEmbassyApproval':
      return hasPresent(a?.EmbassySealing);
    case 'visaIssuance':
      return [a?.visaIssuanceDate, a?.VisaFile].some(hasPresent);
    case 'travelPermit':
      return hasPresent(a?.travelPermit);
    case 'destinations':
      return (
        (depDateTime(a) !== 'N/A' && depDateTime(a) !== '') ||
        (arrDateTime(a) !== 'N/A' && arrDateTime(a) !== '') ||
        [a?.deparatureCityCountry, a?.arrivalSaudiAirport, a?.ticketFile].some(hasPresent)
      );
    case 'receipt':
      return [a?.DeliveryDate, a?.receiptMethod, a?.receivingFile].some(hasPresent);
    default:
      return false;
  }
}

function getFirstIncompleteIndex(ctx: {
  arrival: ArrivalTimeline | null;
  visaNumber?: string | null;
  homemaidOfficeName?: string | null;
}): number {
  for (let i = 0; i < TRACK_ORDER_STEPS.length; i++) {
    if (!isStepCompleted(TRACK_ORDER_STEPS[i], ctx)) return i;
  }
  return TRACK_ORDER_STEPS.length;
}

function isArrivalDatePassed(a: ArrivalTimeline | null): boolean {
  if (!a?.KingdomentryDate) return false;
  const dt = new Date(a.KingdomentryDate as Date);
  const t = a.KingdomentryTime?.trim();
  if (t) {
    const parts = t.split(':').map((x) => parseInt(x, 10));
    if (!Number.isNaN(parts[0])) dt.setHours(parts[0], parts[1] || 0, 0, 0);
  }
  return Date.now() >= dt.getTime();
}

function canCompleteStep(
  step: TrackOrderStep,
  ctx: {
    arrival: ArrivalTimeline | null;
    visaNumber?: string | null;
    homemaidOfficeName?: string | null;
  }
): boolean {
  const idx = TRACK_ORDER_STEPS.indexOf(step);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (!isStepCompleted(TRACK_ORDER_STEPS[i], ctx)) return false;
  }
  if (step === 'receipt' && !isArrivalDatePassed(ctx.arrival)) return false;
  return true;
}

type TimelineCtx = {
  arrival: ArrivalTimeline | null;
  visaNumber?: string | null;
  homemaidOfficeName?: string | null;
};

function isTrackOrderStep(s: string): s is TrackOrderStep {
  return (TRACK_ORDER_STEPS as readonly string[]).includes(s);
}

function getCustomStageEntry(arrival: ArrivalTimeline | null, field: string) {
  const stages = normalizeCustomStagesPrev(arrival?.customTimelineStages ?? null);
  return stages[field] as
    | { completed?: boolean; date?: string; answer?: string; fileUrl?: string }
    | undefined;
}

function isCustomStageComplete(stage: TimelineStage, ctx: TimelineCtx, arrival: ArrivalTimeline | null): boolean {
  const entry = getCustomStageEntry(arrival, stage.field);
  if (entry?.completed === true) return true;
  const it = stage.interactionType ?? 'none';
  if (it === 'question') {
    return !!(entry?.answer && String(entry.answer).trim());
  }
  if (it === 'file') {
    return !!(entry?.fileUrl && String(entry.fileUrl).trim());
  }
  if (isTrackOrderStep(stage.field)) {
    return isStepCompleted(stage.field, ctx);
  }
  return false;
}

function getFirstIncompleteCustomIndex(
  sortedStages: TimelineStage[],
  ctx: TimelineCtx,
  arrival: ArrivalTimeline | null
): number {
  for (let i = 0; i < sortedStages.length; i++) {
    if (!isCustomStageComplete(sortedStages[i], ctx, arrival)) return i;
  }
  return sortedStages.length;
}

function canCompleteCustomMedical(
  sortedStages: TimelineStage[],
  currentIndex: number,
  ctx: TimelineCtx,
  arrival: ArrivalTimeline | null
): boolean {
  if (currentIndex <= 0) return true;
  for (let i = 0; i < currentIndex; i++) {
    if (!isCustomStageComplete(sortedStages[i], ctx, arrival)) return false;
  }
  if (sortedStages[currentIndex]?.field === 'receipt' && !isArrivalDatePassed(arrival)) return false;
  return true;
}

// ——— عناوين المراحل ———
const STEP_LABELS: Record<
  'en' | 'fra' | 'ur' | 'ar',
  Record<TrackOrderStep, string>
> = {
  en: {
    officeLinkInfo: 'Link with office administration (Musaned)',
    officeLinkApproval: 'Office link approval',
    externalOfficeInfo: 'External office',
    externalOfficeApproval: 'External office approval',
    medicalCheck: 'Medical check',
    foreignLaborApproval: 'Foreign labor approval',
    agencyPayment: 'Agency payment',
    saudiEmbassyApproval: 'Saudi embassy approval',
    visaIssuance: 'Visa issuance',
    travelPermit: 'Travel permit',
    destinations: 'Destinations / ticket',
    receipt: 'Worker handover completed',
  },
  fra: {
    officeLinkInfo: 'Liaison avec l’administration (Musaned)',
    officeLinkApproval: 'Approbation du lien bureau',
    externalOfficeInfo: 'Bureau externe',
    externalOfficeApproval: 'Approbation du bureau externe',
    medicalCheck: 'Examen médical',
    foreignLaborApproval: 'Approbation main-d’œuvre étrangère',
    agencyPayment: 'Paiement agence',
    saudiEmbassyApproval: 'Approbation ambassade saoudienne',
    visaIssuance: 'Délivrance du visa',
    travelPermit: 'Permis de voyage',
    destinations: 'Destinations / billet',
    receipt: 'Remise de la travailleuse effectuée',
  },
  ur: {
    officeLinkInfo: 'دفتر انتظامیہ سے ربط (مساند)',
    officeLinkApproval: 'دفتر لنک کی منظوری',
    externalOfficeInfo: 'بیرونی دفتر',
    externalOfficeApproval: 'بیرونی دفتر کی منظوری',
    medicalCheck: 'طبی معائنہ',
    foreignLaborApproval: 'غیر ملکی لیبر کی منظوری',
    agencyPayment: 'ایجنسی کی ادائیگی',
    saudiEmbassyApproval: 'سعودی سفارت کی منظوری',
    visaIssuance: 'ویزا جاری کرنا',
    travelPermit: 'سفر کی اجازت',
    destinations: 'منزلیں / ٹکٹ',
    receipt: 'ملازمہ کی حوالگی مکمل',
  },
  ar: {
    officeLinkInfo: 'الربط مع إدارة المكاتب',
    officeLinkApproval: 'اعتماد الربط',
    externalOfficeInfo: 'المكتب الخارجي',
    externalOfficeApproval: 'موافقة المكتب الخارجي',
    medicalCheck: 'الفحص الطبي',
    foreignLaborApproval: 'موافقة وزارة العمل الأجنبية',
    agencyPayment: 'دفع الوكالة',
    saudiEmbassyApproval: 'موافقة السفارة السعودية',
    visaIssuance: 'إصدار التأشيرة',
    travelPermit: 'تصريح السفر',
    destinations: 'الوجهات / التذكرة',
    receipt: 'اكتمال تسليم العاملة',
  },
};

function getStageDetails(
  stage: TrackOrderStep,
  arrival: ArrivalTimeline | null,
  viewFileLabel: string
): Record<string, React.ReactNode> | null {
  if (!arrival) return null;

  const link = (url?: string | null) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600">
        {viewFileLabel}
      </a>
    ) : (
      'N/A'
    );

  switch (stage) {
    case 'officeLinkInfo':
      return {
        'Visa / رقم التأشيرة': arrival.visaNumber || 'N/A',
        'Internal Musaned Contract': arrival.InternalmusanedContract || 'N/A',
        'Date of Application': arrival.DateOfApplication?.toString() || 'N/A',
      };
    case 'officeLinkApproval':
      return {
        'External Date Linking': arrival.ExternalDateLinking?.toString() || 'N/A',
      };
    case 'externalOfficeInfo':
      return {
        'External Musaned Contract': arrival.externalmusanedContract || 'N/A',
      };
    case 'externalOfficeApproval':
      return {
        Status: arrival.externalOfficeStatus || 'N/A',
        'External Office Approval': arrival.ExternalOFficeApproval?.toString() || 'N/A',
        'External Office File': link(arrival.externalOfficeFile),
      };
    case 'medicalCheck':
      return {
        'Medical Check Date': arrival.medicalCheckDate?.toString() || 'N/A',
        'Medical Check File': link(arrival.medicalCheckFile),
      };
    case 'foreignLaborApproval':
      return {
        'foreignLaborApprovalDate': arrival.foreignLaborApprovalDate?.toString() || 'N/A',
      };
    case 'agencyPayment':
      return {
        approvalPayment: arrival.approvalPayment || 'N/A',
      };
    case 'saudiEmbassyApproval':
      return {
        EmbassySealing: arrival.EmbassySealing?.toString() || 'N/A',
      };
    case 'visaIssuance':
      return {
        visaIssuanceDate: arrival.visaIssuanceDate?.toString() || 'N/A',
        VisaFile: link(arrival.VisaFile),
      };
    case 'travelPermit':
      return {
        travelPermit: arrival.travelPermit || 'N/A',
      };
    case 'destinations':
      return {
        'Departure': depDateTime(arrival),
        'Arrival': arrDateTime(arrival),
        'Departure city': arrival.deparatureCityCountry || 'N/A',
        'Arrival airport': arrival.arrivalSaudiAirport || 'N/A',
        'Ticket file': link(arrival.ticketFile),
      };
    case 'receipt':
      return {
        DeliveryDate: arrival.DeliveryDate?.toString() || 'N/A',
        receiptMethod: arrival.receiptMethod || 'N/A',
        receivingFile: arrival.receivingFile || 'N/A',
      };
    default:
      return null;
  }
}

// ——— ترجمة واجهة عامة ———
const ui = {
  en: {
    title: 'Order timeline: {name}',
    subtitle: 'Track progress in real time',
    progress: 'Progress: {percentage}%',
    completed: 'Completed',
    inProgress: 'In progress',
    pending: 'Pending',
    uploadLabel: 'Upload medical check file',
    uploadButton: 'Upload',
    uploading: 'Uploading...',
    uploadSuccess: 'Uploaded successfully. ',
    uploadError: 'Upload failed.',
    uploadOkDbFailed: 'File uploaded to storage, but the database did not save.',
    viewFile: 'View file',
    medicalFileUploaded: 'Medical file already uploaded. ',
    medicalFileRestricted: 'Upload is only allowed for the current stage when previous steps are done.',
    orderNotFound: 'Order not found',
    saveAnswer: 'Save answer',
    savingAnswer: 'Saving...',
    answerSaved: 'Answer saved.',
    answerError: 'Could not save answer.',
    customFileLabel: 'Upload file',
    customFileSaved: 'File uploaded.',
    selectOption: 'Choose an option',
  },
  ar: {
    title: 'الجدول الزمني للطلب: {name}',
    subtitle: 'تتبع التقدم لحظياً',
    progress: 'التقدم: {percentage}%',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    pending: 'معلق',
    uploadLabel: 'رفع ملف الفحص الطبي',
    uploadButton: 'رفع',
    uploading: 'جارٍ الرفع...',
    uploadSuccess: 'تم الرفع بنجاح. ',
    uploadError: 'فشل الرفع.',
    uploadOkDbFailed: 'تم رفع الملف للتخزين لكن لم يُحفظ في قاعدة البيانات.',
    viewFile: 'عرض الملف',
    medicalFileUploaded: 'تم رفع الملف مسبقاً. ',
    medicalFileRestricted: 'الرفع متاح للمرحلة الحالية بعد إكمال المراحل السابقة.',
    orderNotFound: 'الطلب غير موجود',
    saveAnswer: 'حفظ الإجابة',
    savingAnswer: 'جارٍ الحفظ...',
    answerSaved: 'تم حفظ الإجابة.',
    answerError: 'تعذر حفظ الإجابة.',
    customFileLabel: 'رفع ملف للمرحلة',
    customFileSaved: 'تم رفع الملف.',
    selectOption: 'اختر خياراً',
  },
  fra: {
    title: 'Chronologie: {name}',
    subtitle: 'Suivi en temps réel',
    progress: 'Progression : {percentage}%',
    completed: 'Terminé',
    inProgress: 'En cours',
    pending: 'En attente',
    uploadLabel: 'Télécharger le fichier médical',
    uploadButton: 'Envoyer',
    uploading: 'Envoi...',
    uploadSuccess: 'Envoyé. ',
    uploadError: 'Échec.',
    uploadOkDbFailed: 'Fichier envoyé au stockage, mais pas enregistré en base.',
    viewFile: 'Voir',
    medicalFileUploaded: 'Fichier déjà envoyé. ',
    medicalFileRestricted: 'Envoi réservé à l’étape en cours.',
    orderNotFound: 'Commande introuvable',
    saveAnswer: 'Enregistrer la réponse',
    savingAnswer: 'Enregistrement...',
    answerSaved: 'Réponse enregistrée.',
    answerError: 'Échec de l’enregistrement.',
    customFileLabel: 'Télécharger un fichier',
    customFileSaved: 'Fichier envoyé.',
    selectOption: 'Choisir une option',
  },
  ur: {
    title: 'ٹائم لائن: {name}',
    subtitle: 'ریک ٹائم میں پیشرفت',
    progress: 'پیشرفت: {percentage}%',
    completed: 'مکمل',
    inProgress: 'جاری',
    pending: 'زیر التواء',
    uploadLabel: 'طبی فائل',
    uploadButton: 'اپ لوڈ',
    uploading: 'اپ لوڈ...',
    uploadSuccess: 'کامیاب۔ ',
    uploadError: 'ناکام۔',
    uploadOkDbFailed: 'فائل اپ لوڈ ہو گئی مگر ڈیٹا بیس میں نہیں۔',
    viewFile: 'دیکھیں',
    medicalFileUploaded: 'پہلے سے موجود۔ ',
    medicalFileRestricted: 'موجودہ مرحلے کے لیے۔',
    orderNotFound: 'نہیں ملا',
    saveAnswer: 'جواب محفوظ کریں',
    savingAnswer: 'محفوظ ہو رہا ہے...',
    answerSaved: 'جواب محفوظ ہو گیا۔',
    answerError: 'محفوظ نہیں ہو سکا۔',
    customFileLabel: 'فائل اپ لوڈ',
    customFileSaved: 'فائل اپ لوڈ ہو گئی۔',
    selectOption: 'منتخب کریں',
  },
};

type AppLanguage = 'en' | 'fra' | 'ur' | 'ar';

function isAppLanguage(v: string | null | undefined): v is AppLanguage {
  return v === 'en' || v === 'fra' || v === 'ur' || v === 'ar';
}

// ⚠️ استخدم متغيرات بيئة؛ لا تضع مفاتيح في الكود
const s3 =
  typeof window !== 'undefined'
    ? new AWS.S3({
        accessKeyId: process.env.NEXT_PUBLIC_DO_SPACES_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_DO_SPACES_SECRET,
        endpoint: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
        region: process.env.NEXT_PUBLIC_DO_SPACES_REGION || 'sgp1',
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      })
    : null;

export default function TimelinePage() {
  const { id } = useParams();
  const orderIdParam = Array.isArray(id) ? id[0] : id;
  const { language } = useLanguage();

  const [order, setOrder] = useState<OrderForTimeline | null>(null);
  const [arrival, setArrival] = useState<ArrivalTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [officeCustomStages, setOfficeCustomStages] = useState<TimelineStage[] | null>(null);
  const [useOfficeCustomTimeline, setUseOfficeCustomTimeline] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [saveErrorDetail, setSaveErrorDetail] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
  const [savingQuestionField, setSavingQuestionField] = useState<string | null>(null);
  const [uploadingCustomField, setUploadingCustomField] = useState<string | null>(null);
  const [customFilePick, setCustomFilePick] = useState<Record<string, File | null>>({});

  let lang: AppLanguage = isAppLanguage(language) ? language : 'en';
  if (typeof window !== 'undefined' && !isAppLanguage(language)) {
    const stored = localStorage.getItem('language');
    if (isAppLanguage(stored)) lang = stored;
  }

  const t = ui[lang];
  const stepLabels = STEP_LABELS[lang];

  const timelineCtx = useMemo(
    () => ({
      arrival,
      visaNumber: order?.visa?.visaNumber ?? arrival?.visaNumber ?? null,
      homemaidOfficeName: order?.HomeMaid?.officeName ?? null,
    }),
    [arrival, order]
  );

  /** مراحل التايم لاين المخصص الظاهرة فقط لواجهة المكتب الخارجي (`visibleOnExternalOffice !== false`) */
  const sortedCustomStages = useMemo(() => {
    if (!officeCustomStages?.length) return [];
    return [...officeCustomStages]
      .filter(isStageVisibleOnExternalOffice)
      .sort((a, b) => a.order - b.order);
  }, [officeCustomStages]);

  const allCustomStagesHiddenForExternal = useMemo(
    () =>
      useOfficeCustomTimeline &&
      (officeCustomStages?.length ?? 0) > 0 &&
      sortedCustomStages.length === 0,
    [useOfficeCustomTimeline, officeCustomStages, sortedCustomStages]
  );

  const firstIncomplete = useMemo(() => {
    if (allCustomStagesHiddenForExternal) return 0;
    if (useOfficeCustomTimeline && sortedCustomStages.length > 0) {
      return getFirstIncompleteCustomIndex(sortedCustomStages, timelineCtx, arrival);
    }
    return getFirstIncompleteIndex(timelineCtx);
  }, [
    allCustomStagesHiddenForExternal,
    useOfficeCustomTimeline,
    sortedCustomStages,
    timelineCtx,
    arrival,
  ]);

  const completedCount = useMemo(() => {
    if (allCustomStagesHiddenForExternal) return 0;
    if (useOfficeCustomTimeline && sortedCustomStages.length > 0) {
      return sortedCustomStages.filter((s) =>
        isCustomStageComplete(s, timelineCtx, arrival)
      ).length;
    }
    return TRACK_ORDER_STEPS.filter((s) => isStepCompleted(s, timelineCtx)).length;
  }, [
    allCustomStagesHiddenForExternal,
    useOfficeCustomTimeline,
    sortedCustomStages,
    timelineCtx,
    arrival,
  ]);

  const totalStepCount = useMemo(() => {
    if (allCustomStagesHiddenForExternal) return 1;
    if (useOfficeCustomTimeline && sortedCustomStages.length > 0) {
      return sortedCustomStages.length;
    }
    return TRACK_ORDER_STEPS.length;
  }, [allCustomStagesHiddenForExternal, useOfficeCustomTimeline, sortedCustomStages]);

  const progressPercentage = (completedCount / totalStepCount) * 100;

  const stepRows = useMemo(() => {
    if (allCustomStagesHiddenForExternal) return [];
    if (useOfficeCustomTimeline && sortedCustomStages.length > 0) {
      return sortedCustomStages.map((stage) => ({ mode: 'custom' as const, stage }));
    }
    return TRACK_ORDER_STEPS.map((key) => ({ mode: 'default' as const, key }));
  }, [allCustomStagesHiddenForExternal, useOfficeCustomTimeline, sortedCustomStages]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ur' || lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { stages } = await fetchCustomTimelineForOffice();
      if (cancelled) return;
      if (stages && stages.length > 0) {
        setOfficeCustomStages(stages);
        setUseOfficeCustomTimeline(true);
      } else {
        setOfficeCustomStages(null);
        setUseOfficeCustomTimeline(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/neworder/${orderIdParam}`);
        const data = await response.json();
        setOrder(data.order ?? data);
        setArrival(data.arrival ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (orderIdParam) fetchOrder();
  }, [orderIdParam]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setSaveErrorDetail(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !s3 || !orderIdParam) return;
    setUploadStatus('uploading');
    setSaveErrorDetail(null);
    const fileName = `medical-check/${orderIdParam}/${Date.now()}_${file.name}`;
    const bucket = process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || '';
    const region = process.env.NEXT_PUBLIC_DO_SPACES_REGION || 'sgp1';

    try {
      await s3
        .upload({
          Bucket: bucket,
          Key: fileName,
          Body: file,
          ACL: 'public-read',
          ContentType: file.type,
        })
        .promise();

      const fileUrl = getSpacesPublicObjectUrl(bucket, region, fileName);

      const patchRes = await fetch(`/api/neworder/${orderIdParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalCheckFile: fileUrl }),
      });
      const patchBody = await patchRes.json().catch(() => ({}));

      if (!patchRes.ok) {
        const msg =
          typeof patchBody.error === 'string' ? patchBody.error : patchRes.statusText || 'PATCH failed';
        setSaveErrorDetail(msg);
        setUploadStatus('error');
        setUploadedFileUrl(fileUrl);
        return;
      }

      if (patchBody.arrival) setArrival(patchBody.arrival as ArrivalTimeline);
      setUploadedFileUrl(fileUrl);
      setUploadStatus('success');
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setSaveErrorDetail(err instanceof Error ? err.message : String(err));
    }
  };

  const saveQuestionAnswer = async (field: string, answer: string) => {
    if (!orderIdParam) return;
    setSavingQuestionField(field);
    try {
      const res = await fetch(`/api/neworder/${orderIdParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchCustomTimelineStage: { field, answer } }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.arrival) setArrival(data.arrival as ArrivalTimeline);
        setAnswerDraft((d) => {
          const n = { ...d };
          delete n[field];
          return n;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingQuestionField(null);
    }
  };

  const uploadCustomStageFile = async (field: string, file: File) => {
    if (!orderIdParam) return;
    setUploadingCustomField(field);
    setSaveErrorDetail(null);
    try {
      const fd = new FormData();
      fd.append('field', field);
      fd.append('file', file);
      const res = await fetch(`/api/neworder/${orderIdParam}/custom-stage-upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveErrorDetail(typeof data.error === 'string' ? data.error : res.statusText);
        setCustomFilePick((m) => ({ ...m, [field]: null }));
        return;
      }
      if (data.arrival) setArrival(data.arrival as ArrivalTimeline);
      setCustomFilePick((m) => ({ ...m, [field]: null }));
    } catch (e) {
      console.error(e);
      setSaveErrorDetail(e instanceof Error ? e.message : String(e));
    } finally {
      setUploadingCustomField(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="rounded-full h-16 w-16 border-t-4 border-indigo-500"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-red-500 text-xl font-semibold py-20">
        {t.orderNotFound}
      </div>
    );
  }

  const clientName = order.ClientName || String(orderIdParam ?? id);

  return (
    <div className="min-h-screen flex font-sans" dir={lang === 'ur' || lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className="min-h-screen flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              {t.title.replace('{name}', clientName)}
            </h1>
            <p className="mt-4 text-lg text-gray-600">{t.subtitle}</p>
          </motion.div>

          <div className="mb-12">
            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-indigo-600 bg-indigo-100">
              {t.progress.replace('{percentage}', Math.round(progressPercentage).toString())}
            </span>
            <div className="overflow-hidden h-4 mt-2 text-xs flex rounded bg-indigo-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8 }}
                className="bg-indigo-500"
              />
            </div>
          </div>

          {saveErrorDetail ? (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <strong className="font-semibold">{t.uploadOkDbFailed}</strong>
              <span className="ms-1 opacity-90">({saveErrorDetail})</span>
            </div>
          ) : null}

          <div className="relative">
            <div
              className={`absolute ${lang === 'ur' || lang === 'ar' ? 'right-8' : 'left-8'} top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600`}
            />

            {allCustomStagesHiddenForExternal && (
              <p className="text-center text-gray-600 py-8 px-4 mb-2 bg-white/60 rounded-xl border border-indigo-100">
                {lang === 'ar' || lang === 'ur'
                  ? 'لا توجد مراحل مفعّلة للعرض في واجهة المكتب الخارجي (جميع المراحل مخفية).'
                  : 'No stages are shown for the external office — all stages are hidden in settings.'}
              </p>
            )}

            {stepRows.map((row, index) => {
              const field = row.mode === 'custom' ? row.stage.field : row.key;
              const label =
                row.mode === 'custom' ? row.stage.label : stepLabels[row.key];
              const stepHasInfo =
                row.mode === 'custom'
                  ? isCustomStageComplete(row.stage, timelineCtx, arrival)
                  : isStepCompleted(row.key, timelineCtx);
              const isCompleted = stepHasInfo;
              const isCurrent =
                !stepHasInfo &&
                index === firstIncomplete &&
                firstIncomplete < stepRows.length;
              const stageDetails =
                row.mode === 'custom' && isTrackOrderStep(row.stage.field)
                  ? getStageDetails(row.stage.field, arrival, t.viewFile)
                  : row.mode === 'default'
                    ? getStageDetails(row.key, arrival, t.viewFile)
                    : null;
              const isExpanded = expandedField === field;
              const stageInteraction =
                row.mode === 'custom' ? row.stage.interactionType ?? 'none' : 'none';

              /** تفاعل سؤال/ملف مخصص: مسموح لأي مرحلة سبقتها مكتملة (بدون اشتراط أن تكون هي أول مرحلة ناقصة — وإلا تبقى مقفولة بعد الإكمال) */
              const allowCustomInteraction =
                row.mode === 'custom' &&
                sortedCustomStages.length > 0 &&
                canCompleteCustomMedical(sortedCustomStages, index, timelineCtx, arrival);

              const showLegacyMedicalUpload =
                field === 'medicalCheck' &&
                !(row.mode === 'custom' && (stageInteraction === 'question' || stageInteraction === 'file'));

              const allowMedicalUpload =
                showLegacyMedicalUpload &&
                isCurrent &&
                canCompleteStep('medicalCheck', timelineCtx);

              const showQuestionUI =
                row.mode === 'custom' &&
                stageInteraction === 'question' &&
                Boolean(row.stage.questionText) &&
                (row.stage.answerOptions?.length ?? 0) >= 2;

              const showCustomFileUI = row.mode === 'custom' && stageInteraction === 'file';

              const savedAnswer = getCustomStageEntry(arrival, field)?.answer;
              const savedFileUrl = getCustomStageEntry(arrival, field)?.fileUrl;

              return (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, x: lang === 'ur' || lang === 'ar' ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="mb-10 flex items-start"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
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

                  <div className={lang === 'ur' || lang === 'ar' ? 'mr-8' : 'ml-8'} style={{ width: '100%' }}>
                    <motion.div
                      className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-xl cursor-pointer"
                      onClick={() => setExpandedField(isExpanded ? null : field)}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">{label}</h2>
                        <FaInfoCircle className="text-indigo-500 text-lg" />
                      </div>
                      <p className="text-gray-600 mt-2 font-medium">
                        {isCompleted ? t.completed : isCurrent ? t.inProgress : t.pending}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 text-gray-700 space-y-1"
                          >
                            {stageDetails &&
                              Object.entries(stageDetails).map(([key, value]) => (
                                <p key={key} className="flex flex-wrap gap-2">
                                  <span className="font-semibold text-indigo-600">{key}:</span>
                                  <span>{value}</span>
                                </p>
                              ))}

                            {row.mode === 'custom' && !stageDetails && !showQuestionUI && !showCustomFileUI && (
                              <p className="text-sm text-gray-500 mt-2">
                                <span className="font-mono">{row.stage.field}</span>
                              </p>
                            )}

                            {showQuestionUI && row.mode === 'custom' && (
                              <div
                                className="mt-4 space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4"
                                onClick={(e) => e.stopPropagation()}
                                role="presentation"
                              >
                                <p className="font-medium text-gray-900">{row.stage.questionText}</p>
                                {row.stage.answerType === 'options' ? (
                                  <select
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                                    value={
                                      answerDraft[field] ??
                                      savedAnswer ??
                                      ''
                                    }
                                    onChange={(e) =>
                                      setAnswerDraft((d) => ({ ...d, [field]: e.target.value }))
                                    }
                                    disabled={!allowCustomInteraction}
                                  >
                                    <option value="">{t.selectOption}</option>
                                    {(row.stage.answerOptions ?? []).map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    {(row.stage.answerOptions ?? []).map((opt) => (
                                      <label
                                        key={opt}
                                        className={`flex items-center gap-2 text-sm ${!allowCustomInteraction ? 'cursor-default' : 'cursor-pointer'}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`timeline-q-${field}`}
                                          value={opt}
                                          checked={
                                            (answerDraft[field] ?? savedAnswer ?? '') === opt
                                          }
                                          onChange={() =>
                                            setAnswerDraft((d) => ({ ...d, [field]: opt }))
                                          }
                                          disabled={!allowCustomInteraction}
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                {allowCustomInteraction && (
                                  <button
                                    type="button"
                                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                                    disabled={savingQuestionField === field}
                                    onClick={() =>
                                      saveQuestionAnswer(
                                        field,
                                        answerDraft[field] ?? savedAnswer ?? ''
                                      )
                                    }
                                  >
                                    {savingQuestionField === field ? t.savingAnswer : t.saveAnswer}
                                  </button>
                                )}
                                {savedAnswer && (
                                  <p className="text-sm text-green-700">
                                    {lang === 'ar' || lang === 'ur'
                                      ? `الإجابة المحفوظة: ${savedAnswer}`
                                      : `Saved: ${savedAnswer}`}
                                  </p>
                                )}
                              </div>
                            )}

                            {showCustomFileUI && row.mode === 'custom' && (
                              <div
                                className="mt-4 space-y-2 rounded-lg border border-amber-100 bg-amber-50/50 p-4"
                                onClick={(e) => e.stopPropagation()}
                                role="presentation"
                              >
                                <label className="block text-sm font-medium text-gray-700">
                                  {t.customFileLabel}
                                </label>
                                {savedFileUrl ? (
                                  <p className="text-green-700">
                                    {t.customFileSaved}{' '}
                                    <a
                                      href={savedFileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline text-indigo-600"
                                    >
                                      {t.viewFile}
                                    </a>
                                  </p>
                                ) : null}
                                {allowCustomInteraction && (
                                  <>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.png"
                                      className="mt-1 block w-full text-sm text-gray-500"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        setCustomFilePick((m) => ({ ...m, [field]: f }));
                                      }}
                                    />
                                    {customFilePick[field] && (
                                      <button
                                        type="button"
                                        className="mt-2 inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                                        disabled={uploadingCustomField === field}
                                        onClick={() => {
                                          const f = customFilePick[field];
                                          if (f) uploadCustomStageFile(field, f);
                                        }}
                                      >
                                        <FaUpload className="me-2" />
                                        {uploadingCustomField === field ? t.uploading : t.uploadButton}
                                      </button>
                                    )}
                                  </>
                                )}
                                {!allowCustomInteraction && !savedFileUrl && (
                                  <p className="text-sm italic text-gray-500">{t.medicalFileRestricted}</p>
                                )}
                              </div>
                            )}

                            {showLegacyMedicalUpload && (
                              <div className="mt-4">
                                {arrival?.medicalCheckFile ? (
                                  <p className="text-green-600 font-medium">
                                    {t.medicalFileUploaded}
                                    <a
                                      href={arrival.medicalCheckFile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline text-indigo-600"
                                    >
                                      {t.viewFile}
                                    </a>
                                  </p>
                                ) : allowMedicalUpload ? (
                                  <>
                                    <label className="block text-sm font-medium text-gray-700">{t.uploadLabel}</label>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.png"
                                      onChange={handleFileChange}
                                      className="mt-1 block w-full text-sm text-gray-500"
                                    />
                                    {file && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleFileUpload();
                                        }}
                                        disabled={uploadStatus === 'uploading'}
                                        className="mt-2 inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white text-sm disabled:opacity-50"
                                      >
                                        <FaUpload className="mr-2" />
                                        {uploadStatus === 'uploading' ? t.uploading : t.uploadButton}
                                      </button>
                                    )}
                                    {uploadStatus === 'success' && (
                                      <p className="mt-2 text-green-600">
                                        {t.uploadSuccess}
                                        <a href={uploadedFileUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline">
                                          {t.viewFile}
                                        </a>
                                      </p>
                                    )}
                                    {uploadStatus === 'error' && !saveErrorDetail ? (
                                      <p className="mt-2 text-red-600">{t.uploadError}</p>
                                    ) : null}
                                  </>
                                ) : (
                                  <p className="text-gray-500 italic">{t.medicalFileRestricted}</p>
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