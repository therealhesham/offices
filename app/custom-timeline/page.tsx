'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  isStageVisibleOnExternalOffice,
  type TimelineStage,
} from '@/app/lib/timelineStage';
import { FaCheckCircle, FaHourglassHalf, FaUpload, FaQuestionCircle } from 'react-icons/fa';

type TimelinePayload = {
  id: number;
  country: string;
  name: string | null;
  stages: TimelineStage[];
  isActive: boolean;
};

export default function CustomTimelinePage() {
  const { language } = useLanguage();
  const [country, setCountry] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelinePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = typeof window !== 'undefined' ? localStorage.getItem('officeCountry') : null;
    setCountry(c);
  }, []);

  useEffect(() => {
    if (!country) {
      setLoading(false);
      setError('no_country');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/custom-timeline/by-country/${encodeURIComponent(country)}`
        );
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'fetch_failed');
          return;
        }
        if (!cancelled) setTimeline(data as TimelinePayload);
      } catch {
        if (!cancelled) setError('fetch_failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [country]);

  const visibleStages = useMemo(() => {
    if (!timeline?.stages?.length) return [];
    return [...timeline.stages]
      .filter(isStageVisibleOnExternalOffice)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [timeline]);

  const t = useMemo(() => {
    const ar = language === 'ar' || language === 'ur';
    return {
      title: ar ? 'الجدول الزمني المخصص' : 'Custom timeline',
      subtitle: ar
        ? 'مراحل العمل حسب إعدادات دولة المكتب'
        : 'Workflow stages for your office country',
      noCountry: ar
        ? 'لم يُحدد بلد للمكتب. سجّل الدخول من جديد أو راجع الإعدادات.'
        : 'Office country is not set. Please sign in again.',
      notFound: ar
        ? 'لا يوجد تايم لاين نشط لهذه الدولة.'
        : 'No active timeline for this country.',
      loadError: ar ? 'تعذر تحميل البيانات.' : 'Could not load timeline.',
      stage: ar ? 'مرحلة' : 'Stage',
      fileHint: ar ? 'رفع ملف' : 'File upload',
      questionHint: ar ? 'سؤال' : 'Question',
      pending: ar ? 'قيد المتابعة' : 'In progress',
      intro: ar
        ? 'التفاعلات التفصيلية (رفع ملفات وإجابات) تُربط بالطلبات عند تفعيلها في النظام.'
        : 'Detailed file uploads and answers are tied to orders when enabled.',
    };
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen flex font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="rounded-full h-16 w-16 border-t-4 border-indigo-500"
          />
        </div>
      </div>
    );
  }

  if (error === 'no_country' || !country) {
    return (
      <div className="min-h-screen flex font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-600">
          {t.noCountry}
        </div>
      </div>
    );
  }

  if (error && error !== 'no_country') {
    return (
      <div className="min-h-screen flex font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8 text-center text-red-600">
          {error === 'fetch_failed' || error.includes('No active') ? t.notFound : t.loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-extrabold text-gray-900">{t.title}</h1>
            <p className="mt-2 text-gray-600">{t.subtitle}</p>
            {timeline?.country && (
              <p className="mt-1 text-sm font-medium text-indigo-700">{timeline.country}</p>
            )}
          </motion.div>

          <p className="text-sm text-gray-500 mb-6 text-center">{t.intro}</p>

          <div className="space-y-4">
            {visibleStages.map((stage, index) => (
              <motion.div
                key={`${stage.field}-${stage.order}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-indigo-100 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-indigo-200">
                    <FaHourglassHalf className="text-amber-500 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">
                        {t.stage} {index + 1}
                      </span>
                      {stage.interactionType === 'file' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <FaUpload className="w-3 h-3" /> {t.fileHint}
                        </span>
                      )}
                      {stage.interactionType === 'question' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 inline-flex items-center gap-1">
                          <FaQuestionCircle className="w-3 h-3" /> {t.questionHint}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{stage.label}</h2>
                    {stage.interactionType === 'question' && stage.questionText && (
                      <p className="mt-2 text-gray-700 text-sm">{stage.questionText}</p>
                    )}
                    <p className="mt-2 text-xs font-mono text-gray-400">field: {stage.field}</p>
                  </div>
                  <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 opacity-40" title={t.pending} />
                </div>
              </motion.div>
            ))}
          </div>

          {visibleStages.length === 0 && timeline && (
            <p className="text-center text-gray-500 mt-8">
              {language === 'ar' || language === 'ur'
                ? 'لا توجد مراحل مفعّلة للعرض الخارجي.'
                : 'No stages are enabled for the external office view.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
