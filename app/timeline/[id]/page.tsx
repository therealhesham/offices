'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaInfoCircle,
  FaUpload,
  FaTimes,
} from 'react-icons/fa';
import AWS from 'aws-sdk';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { isStageVisibleOnExternalOffice, type TimelineStage } from '@/app/lib/timelineStage';
import { fetchCustomTimelineForOffice } from '@/app/lib/officeCustomTimeline';
import { getSpacesPublicObjectUrl } from '@/app/lib/spacesPublicUrl';
import { normalizeCustomStagesPrev } from '@/app/lib/customTimelineStagesJson';

/** أزرار الرفع والإجراءات الرئيسية — تباين عالٍ ووضوح */
const BTN_UPLOAD_PRIMARY =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl text-base font-bold text-white shadow-lg shadow-indigo-600/40 bg-gradient-to-b from-indigo-500 to-indigo-700 ring-2 ring-white/40 hover:from-indigo-600 hover:to-indigo-900 hover:shadow-xl hover:ring-indigo-200/80 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-400/70 disabled:opacity-60 disabled:cursor-not-allowed transition';

const BTN_SAVE_DATE =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md shadow-emerald-600/35 bg-gradient-to-b from-emerald-500 to-emerald-700 ring-2 ring-white/30 hover:from-emerald-600 hover:to-emerald-900 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-emerald-400/60 disabled:opacity-60 transition';

const INPUT_FILE_PROMINENT =
  'mt-2 block w-full cursor-pointer text-sm file:mr-4 file:cursor-pointer file:rounded-xl file:border-2 file:border-indigo-500 file:bg-indigo-50 file:px-5 file:py-3 file:text-sm file:font-bold file:text-indigo-900 file:shadow-md hover:file:bg-indigo-100 hover:file:border-indigo-600';

/** زر × صغير لإزالة الملف المرفوع */
const BTN_REMOVE_UPLOADED_FILE =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-400 bg-white text-red-600 shadow-sm hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50';

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

/** قيمة input type="date" (محلي) */
function formatDateForInput(d: string | Date | null | undefined): string {
  if (!d) return '';
  const x = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return '';
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  /** الفحص الطبي: أعمدة السجل فقط، لا ملف/سؤال من JSON */
  if (stage.field === 'medicalCheck') {
    return isStepCompleted('medicalCheck', ctx);
  }
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

type StageDetailsOptions = {
  /** معاينة عند الضغط بدل فتح تبويب جديد (يُستخدم لملف الفحص الطبي) */
  onPreviewFile?: (url: string) => void;
  /** عناوين صفوف تفاصيل الفحص الطبي */
  medicalLabels?: {
    dateLabel: string;
    medicalFile: string;
  };
};

function getStageDetails(
  stage: TrackOrderStep,
  arrival: ArrivalTimeline | null,
  viewFileLabel: string,
  options?: StageDetailsOptions
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

  const previewableFile = (url?: string | null) => {
    if (!url) return 'N/A' as const;
    const onPrev = options?.onPreviewFile;
    if (onPrev) {
      return (
        <button
          type="button"
          className="font-bold text-indigo-700 underline decoration-2 underline-offset-2 hover:text-indigo-900"
          onClick={(e) => {
            e.stopPropagation();
            onPrev(url);
          }}
        >
          {viewFileLabel}
        </button>
      );
    }
    return link(url);
  };

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
    case 'medicalCheck': {
      const dbFile = arrival.medicalCheckFile?.trim() || null;
      const L = options?.medicalLabels;
      const dateKey = L?.dateLabel ?? 'Medical check date';
      const fileKey = L?.medicalFile ?? 'Medical file';

      return {
        [dateKey]: arrival.medicalCheckDate?.toString() || 'N/A',
        [fileKey]: previewableFile(dbFile),
      };
    }
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
    replaceMedicalFileLabel: 'Upload a new file (replaces the current one)',
    uploadButton: 'Upload',
    uploading: 'Uploading...',
    uploadSuccess: 'Uploaded successfully. ',
    uploadError: 'Upload failed.',
    uploadOkDbFailed: 'File uploaded to storage, but the database did not save.',
    viewFile: 'View file',
    medicalFileUploaded: 'Medical file already uploaded. ',
    orderNotFound: 'Order not found',
    saveAnswer: 'Save answer',
    savingAnswer: 'Saving...',
    answerSaved: 'Answer saved.',
    answerError: 'Could not save answer.',
    customFileLabel: 'Upload file',
    customFileSaved: 'File uploaded.',
    selectOption: 'Choose an option',
    medicalCheckDateLabel: 'Medical exam date',
    saveMedicalDate: 'Save date',
    savingMedicalDate: 'Saving...',
    medicalCheckDateHint: 'You can set the date without uploading a file. Clearing the date removes it.',
    previewFileTitle: 'File preview',
    previewNoEmbed: 'This file type cannot be shown here.',
    openInNewTab: 'Open in new tab',
    removeFileAria: 'Remove uploaded file',
    medicalDetailDate: 'Medical check date',
    medicalDetailFile: 'Medical file',
  },
  ar: {
    title: 'الجدول الزمني للطلب: {name}',
    subtitle: 'تتبع التقدم لحظياً',
    progress: 'التقدم: {percentage}%',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    pending: 'معلق',
    uploadLabel: 'رفع ملف الفحص الطبي',
    replaceMedicalFileLabel: 'رفع ملف جديد (يستبدل الملف الحالي)',
    uploadButton: 'رفع',
    uploading: 'جارٍ الرفع...',
    uploadSuccess: 'تم الرفع بنجاح. ',
    uploadError: 'فشل الرفع.',
    uploadOkDbFailed: 'تم رفع الملف للتخزين لكن لم يُحفظ في قاعدة البيانات.',
    viewFile: 'عرض الملف',
    medicalFileUploaded: 'تم رفع الملف مسبقاً. ',
    orderNotFound: 'الطلب غير موجود',
    saveAnswer: 'حفظ الإجابة',
    savingAnswer: 'جارٍ الحفظ...',
    answerSaved: 'تم حفظ الإجابة.',
    answerError: 'تعذر حفظ الإجابة.',
    customFileLabel: 'رفع ملف للمرحلة',
    customFileSaved: 'تم رفع الملف.',
    selectOption: 'اختر خياراً',
    medicalCheckDateLabel: 'تاريخ الفحص الطبي',
    saveMedicalDate: 'حفظ التاريخ',
    savingMedicalDate: 'جارٍ الحفظ...',
    medicalCheckDateHint: 'يمكنك حفظ التاريخ دون رفع ملف. لمسح التاريخ اترك الحقل فارغاً ثم احفظ.',
    previewFileTitle: 'معاينة الملف',
    previewNoEmbed: 'لا يمكن عرض هذا النوع من الملفات هنا.',
    openInNewTab: 'فتح في تبويب جديد',
    removeFileAria: 'إزالة الملف المرفوع',
    medicalDetailDate: 'تاريخ الفحص الطبي',
    medicalDetailFile: 'ملف الفحص الطبي',
  },
  fra: {
    title: 'Chronologie: {name}',
    subtitle: 'Suivi en temps réel',
    progress: 'Progression : {percentage}%',
    completed: 'Terminé',
    inProgress: 'En cours',
    pending: 'En attente',
    uploadLabel: 'Télécharger le fichier médical',
    replaceMedicalFileLabel: 'Nouveau fichier (remplace l’actuel)',
    uploadButton: 'Envoyer',
    uploading: 'Envoi...',
    uploadSuccess: 'Envoyé. ',
    uploadError: 'Échec.',
    uploadOkDbFailed: 'Fichier envoyé au stockage, mais pas enregistré en base.',
    viewFile: 'Voir',
    medicalFileUploaded: 'Fichier déjà envoyé. ',
    orderNotFound: 'Commande introuvable',
    saveAnswer: 'Enregistrer la réponse',
    savingAnswer: 'Enregistrement...',
    answerSaved: 'Réponse enregistrée.',
    answerError: 'Échec de l’enregistrement.',
    customFileLabel: 'Télécharger un fichier',
    customFileSaved: 'Fichier envoyé.',
    selectOption: 'Choisir une option',
    medicalCheckDateLabel: 'Date de l’examen médical',
    saveMedicalDate: 'Enregistrer la date',
    savingMedicalDate: 'Enregistrement...',
    medicalCheckDateHint: 'Vous pouvez enregistrer la date sans fichier. Videz le champ puis enregistrer pour effacer.',
    previewFileTitle: 'Aperçu du fichier',
    previewNoEmbed: 'Ce type de fichier ne peut pas être affiché ici.',
    openInNewTab: 'Ouvrir dans un nouvel onglet',
    removeFileAria: 'Retirer le fichier',
    medicalDetailDate: 'Date de l’examen médical',
    medicalDetailFile: 'Fichier médical',
    medicalDetailFile1: 'Fichier médical 1',
    medicalDetailFile2: 'Fichier médical 2',
    medicalDetailStageAnswer: 'Réponse',
  },
  ur: {
    title: 'ٹائم لائن: {name}',
    subtitle: 'ریک ٹائم میں پیشرفت',
    progress: 'پیشرفت: {percentage}%',
    completed: 'مکمل',
    inProgress: 'جاری',
    pending: 'زیر التواء',
    uploadLabel: 'طبی فائل',
    replaceMedicalFileLabel: 'نیا فائل اپ لوڈ (موجودہ کی جگہ)',
    uploadButton: 'اپ لوڈ',
    uploading: 'اپ لوڈ...',
    uploadSuccess: 'کامیاب۔ ',
    uploadError: 'ناکام۔',
    uploadOkDbFailed: 'فائل اپ لوڈ ہو گئی مگر ڈیٹا بیس میں نہیں۔',
    viewFile: 'دیکھیں',
    medicalFileUploaded: 'پہلے سے موجود۔ ',
    orderNotFound: 'نہیں ملا',
    saveAnswer: 'جواب محفوظ کریں',
    savingAnswer: 'محفوظ ہو رہا ہے...',
    answerSaved: 'جواب محفوظ ہو گیا۔',
    answerError: 'محفوظ نہیں ہو سکا۔',
    customFileLabel: 'فائل اپ لوڈ',
    customFileSaved: 'فائل اپ لوڈ ہو گئی۔',
    selectOption: 'منتخب کریں',
    medicalCheckDateLabel: 'طبی معائنہ کی تاریخ',
    saveMedicalDate: 'تاریخ محفوظ کریں',
    savingMedicalDate: 'محفوظ ہو رہا ہے...',
    medicalCheckDateHint: 'بغیر فائل کے تاریخ محفوظ کر سکتے ہیں۔ خالی کر کے محفوظ کریں تو تاریخ ہٹ جائے گی۔',
    previewFileTitle: 'فائل کا پیش منظر',
    previewNoEmbed: 'یہ فائل یہاں نہیں دکھائی جا سکتی۔',
    openInNewTab: 'نئی ٹیب میں کھولیں',
    removeFileAria: 'فائل ہٹائیں',
    medicalDetailDate: 'طبی معائنہ کی تاریخ',
    medicalDetailFile: 'طبی فائل',
  },
};

type AppLanguage = 'en' | 'fra' | 'ur' | 'ar';

function isAppLanguage(v: string | null | undefined): v is AppLanguage {
  return v === 'en' || v === 'fra' || v === 'ur' || v === 'ar';
}

function FilePreviewModal({
  url,
  onClose,
  title,
  noEmbed,
  openTab,
}: {
  url: string;
  onClose: () => void;
  title: string;
  noEmbed: string;
  openTab: string;
}) {
  const pure = url.split('?')[0].toLowerCase();
  const isPdf = pure.endsWith('.pdf');
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(pure);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-preview-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-indigo-600 px-4 py-3 text-white">
          <span id="file-preview-title" className="font-semibold">
            {title}
          </span>
          <button
            type="button"
            className="rounded-lg bg-white/20 px-3 py-1 text-xl font-bold leading-none hover:bg-white/30"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-gray-100">
          {isPdf ? (
            <iframe title="PDF preview" src={url} className="h-[min(85vh,800px)] w-full border-0" />
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="mx-auto max-h-[min(85vh,800px)] w-auto max-w-full object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-gray-600">{noEmbed}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                {openTab}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  const [medicalDateDraft, setMedicalDateDraft] = useState('');
  const [savingMedicalDate, setSavingMedicalDate] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string } | null>(null);
  /** 'medical' = legacy column، أو اسم حقل مرحلة مخصصة */
  const [removingFile, setRemovingFile] = useState<string | null>(null);

  const openFilePreview = useCallback((url: string) => {
    const u = url?.trim();
    if (!u) return;
    setPreviewFile({ url: u });
  }, []);

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
    setMedicalDateDraft(formatDateForInput(arrival?.medicalCheckDate));
  }, [arrival?.medicalCheckDate]);

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
      setExpandedField('medicalCheck');
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
      setExpandedField(field);
    } catch (e) {
      console.error(e);
      setSaveErrorDetail(e instanceof Error ? e.message : String(e));
    } finally {
      setUploadingCustomField(null);
    }
  };

  const removeLegacyMedicalFile = async () => {
    if (!orderIdParam) return;
    setRemovingFile('medical');
    setSaveErrorDetail(null);
    try {
      const res = await fetch(`/api/neworder/${orderIdParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalCheckFile: null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveErrorDetail(typeof data.error === 'string' ? data.error : res.statusText);
        return;
      }
      if (data.arrival) setArrival(data.arrival as ArrivalTimeline);
      setFile(null);
      setUploadedFileUrl(null);
      setUploadStatus('idle');
      setPreviewFile(null);
    } catch (e) {
      console.error(e);
      setSaveErrorDetail(e instanceof Error ? e.message : String(e));
    } finally {
      setRemovingFile(null);
    }
  };

  const removeCustomStageFile = async (field: string) => {
    if (!orderIdParam) return;
    setRemovingFile(field);
    setSaveErrorDetail(null);
    try {
      const res = await fetch(`/api/neworder/${orderIdParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchCustomTimelineStage: { field, fileUrl: null } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveErrorDetail(typeof data.error === 'string' ? data.error : res.statusText);
        return;
      }
      if (data.arrival) setArrival(data.arrival as ArrivalTimeline);
      setCustomFilePick((m) => ({ ...m, [field]: null }));
      setPreviewFile(null);
    } catch (e) {
      console.error(e);
      setSaveErrorDetail(e instanceof Error ? e.message : String(e));
    } finally {
      setRemovingFile(null);
    }
  };

  const saveMedicalCheckDate = async () => {
    if (!orderIdParam) return;
    setSavingMedicalDate(true);
    setSaveErrorDetail(null);
    try {
      const res = await fetch(`/api/neworder/${orderIdParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicalCheckDate: medicalDateDraft.trim() ? medicalDateDraft.trim() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveErrorDetail(typeof data.error === 'string' ? data.error : res.statusText);
        return;
      }
      if (data.arrival) setArrival(data.arrival as ArrivalTimeline);
    } finally {
      setSavingMedicalDate(false);
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
    <>
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
              const medicalDetailOpts = {
                onPreviewFile: openFilePreview,
                medicalLabels: {
                  dateLabel: t.medicalDetailDate,
                  medicalFile: t.medicalDetailFile,
                },
              } as const;

              const stageDetails =
                row.mode === 'custom' && isTrackOrderStep(row.stage.field)
                  ? getStageDetails(row.stage.field, arrival, t.viewFile, medicalDetailOpts)
                  : row.mode === 'default'
                    ? getStageDetails(row.key, arrival, t.viewFile, medicalDetailOpts)
                    : null;
              const isExpanded = expandedField === field;
              const stageInteraction =
                row.mode === 'custom' ? row.stage.interactionType ?? 'none' : 'none';

              /** تفاعل سؤال/ملف مخصص: مفتوح بدون اشتراط ترتيب المراحل (يمكن تشديدها لاحقاً) */
              const allowCustomInteraction =
                row.mode === 'custom' && sortedCustomStages.length > 0;

              /** تاريخ + ملف الفحص من أعمدة السجل (دائماً لمرحلة medicalCheck) */
              const showMedicalDbSection = field === 'medicalCheck';

              const showQuestionUI =
                field !== 'medicalCheck' &&
                row.mode === 'custom' &&
                stageInteraction === 'question' &&
                Boolean(row.stage.questionText) &&
                (row.stage.answerOptions?.length ?? 0) >= 2;

              const showCustomFileUI =
                field !== 'medicalCheck' &&
                row.mode === 'custom' &&
                stageInteraction === 'file';

              const savedAnswer = getCustomStageEntry(arrival, field)?.answer;
              const savedFileUrl = getCustomStageEntry(arrival, field)?.fileUrl;

              const showMedicalDatePicker = field === 'medicalCheck';

              /** ملف الفحص في عمود قاعدة البيانات فقط (منفصل عن ملف المرحلة المخصصة) */
              const dbMedicalFileUrl = arrival?.medicalCheckFile?.trim() || null;

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
                            onClick={(e) => e.stopPropagation()}
                            role="presentation"
                          >
                            {stageDetails &&
                              Object.entries(stageDetails).map(([key, value]) => (
                                <p key={key} className="flex flex-wrap gap-2">
                                  <span className="font-semibold text-indigo-600">{key}:</span>
                                  <span>{value}</span>
                                </p>
                              ))}

                            {showMedicalDatePicker && (
                              <div
                                className="mt-4 space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4"
                                onClick={(e) => e.stopPropagation()}
                                role="presentation"
                              >
                                <label className="block text-sm font-medium text-gray-700">
                                  {t.medicalCheckDateLabel}
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="date"
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                    value={medicalDateDraft}
                                    onChange={(e) => setMedicalDateDraft(e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className={BTN_SAVE_DATE}
                                    disabled={savingMedicalDate}
                                    onClick={() => saveMedicalCheckDate()}
                                  >
                                    {savingMedicalDate ? t.savingMedicalDate : t.saveMedicalDate}
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500">{t.medicalCheckDateHint}</p>
                              </div>
                            )}

                            {showMedicalDbSection && (
                              <div className="mt-4 rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-violet-50/90 p-4 shadow-md ring-1 ring-indigo-200/70">
                                {dbMedicalFileUrl ? (
                                  <p className="mb-4 flex flex-wrap items-center gap-2 text-green-700 font-semibold">
                                    <span>{t.medicalFileUploaded}</span>
                                    <button
                                      type="button"
                                      className="font-bold text-indigo-700 underline decoration-2 hover:text-indigo-900"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openFilePreview(dbMedicalFileUrl);
                                      }}
                                    >
                                      {t.viewFile}
                                    </button>
                                    <button
                                      type="button"
                                      className={BTN_REMOVE_UPLOADED_FILE}
                                      aria-label={t.removeFileAria}
                                      disabled={removingFile === 'medical'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeLegacyMedicalFile();
                                      }}
                                    >
                                      <FaTimes className="h-3.5 w-3.5" aria-hidden />
                                    </button>
                                  </p>
                                ) : null}
                                <label className="block text-sm font-bold text-indigo-950">
                                  {dbMedicalFileUrl ? t.replaceMedicalFileLabel : t.uploadLabel}
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.png"
                                  onChange={handleFileChange}
                                  className={INPUT_FILE_PROMINENT}
                                />
                                {file && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFileUpload();
                                    }}
                                    disabled={uploadStatus === 'uploading'}
                                    className={`mt-3 ${BTN_UPLOAD_PRIMARY} w-full sm:w-auto`}
                                  >
                                    <FaUpload className="shrink-0 text-xl" aria-hidden />
                                    {uploadStatus === 'uploading' ? t.uploading : t.uploadButton}
                                  </button>
                                )}
                                {uploadStatus === 'success' && uploadedFileUrl && (
                                  <p className="mt-2 text-green-600">
                                    {t.uploadSuccess}
                                    <button
                                      type="button"
                                      className="ms-1 font-bold text-indigo-700 underline hover:text-indigo-900"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openFilePreview(uploadedFileUrl);
                                      }}
                                    >
                                      {t.viewFile}
                                    </button>
                                  </p>
                                )}
                                {uploadStatus === 'error' && !saveErrorDetail ? (
                                  <p className="mt-2 text-red-600">{t.uploadError}</p>
                                ) : null}
                              </div>
                            )}

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
                                    className={BTN_UPLOAD_PRIMARY}
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
                                className="mt-4 space-y-3 rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 shadow-md ring-1 ring-amber-200/60"
                                onClick={(e) => e.stopPropagation()}
                                role="presentation"
                              >
                                <label className="block text-sm font-bold text-amber-950">
                                  {t.customFileLabel}
                                </label>
                                {savedFileUrl ? (
                                  <p className="flex flex-wrap items-center gap-2 text-green-700">
                                    <span>{t.customFileSaved}</span>
                                    <button
                                      type="button"
                                      className="font-bold text-indigo-700 underline decoration-2 hover:text-indigo-900"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openFilePreview(savedFileUrl);
                                      }}
                                    >
                                      {t.viewFile}
                                    </button>
                                    {allowCustomInteraction ? (
                                      <button
                                        type="button"
                                        className={BTN_REMOVE_UPLOADED_FILE}
                                        aria-label={t.removeFileAria}
                                        disabled={removingFile === field}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeCustomStageFile(field);
                                        }}
                                      >
                                        <FaTimes className="h-3.5 w-3.5" aria-hidden />
                                      </button>
                                    ) : null}
                                  </p>
                                ) : null}
                                {allowCustomInteraction && (
                                  <>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.png"
                                      className={INPUT_FILE_PROMINENT}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        setCustomFilePick((m) => ({ ...m, [field]: f }));
                                      }}
                                    />
                                    {customFilePick[field] && (
                                      <button
                                        type="button"
                                        className={`mt-2 ${BTN_UPLOAD_PRIMARY} w-full sm:w-auto`}
                                        disabled={uploadingCustomField === field}
                                        onClick={() => {
                                          const f = customFilePick[field];
                                          if (f) uploadCustomStageFile(field, f);
                                        }}
                                      >
                                        <FaUpload className="shrink-0 text-xl" aria-hidden />
                                        {uploadingCustomField === field ? t.uploading : t.uploadButton}
                                      </button>
                                    )}
                                  </>
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
    {previewFile ? (
      <FilePreviewModal
        url={previewFile.url}
        onClose={() => setPreviewFile(null)}
        title={t.previewFileTitle}
        noEmbed={t.previewNoEmbed}
        openTab={t.openInNewTab}
      />
    ) : null}
    </>
  );
}