'use client';

import { jwtDecode } from 'jwt-decode';
import type { TimelineStage } from '@/app/lib/timelineStage';

type OfficeJwtPayload = {
  id?: number;
  office?: string | null;
  url?: string | null;
  country?: string | null;
};

/** دولة المكتب من JWT (نفس `offices.Country` المُخزَّنة عند تسجيل الدخول) */
export function getOfficeCountryFromToken(): string | null {
  if (typeof window === 'undefined') return null;
  const tok = localStorage.getItem('_item');
  if (!tok) return null;
  try {
    const p = jwtDecode<OfficeJwtPayload>(tok);
    const c = typeof p.country === 'string' ? p.country.trim() : '';
    return c || null;
  } catch {
    return null;
  }
}

/**
 * يطابق `offices.Country` مع `CustomTimeline.country` عبر الـ API.
 * يحدّث `localStorage`: `officeCountry`، `useCustomTimeline` = '1' فقط إن وُجد سجل نشط بنفس النص.
 */
export async function fetchCustomTimelineForOffice(): Promise<{
  stages: TimelineStage[] | null;
  country: string | null;
}> {
  const country = getOfficeCountryFromToken();
  if (!country) {
    localStorage.removeItem('officeCountry');
    localStorage.removeItem('useCustomTimeline');
    return { stages: null, country: null };
  }

  localStorage.setItem('officeCountry', country);

  try {
    const res = await fetch(
      `/api/custom-timeline/by-country/${encodeURIComponent(country)}`
    );
    if (res.ok) {
      const data = (await res.json()) as { stages?: unknown };
      const stages = Array.isArray(data.stages)
        ? (data.stages as TimelineStage[])
        : [];
      if (stages.length > 0) {
        localStorage.setItem('useCustomTimeline', '1');
        return { stages, country };
      }
    }
  } catch {
    // ignore network errors
  }

  localStorage.removeItem('useCustomTimeline');
  return { stages: null, country };
}

/** مزامنة العلم فقط (للصفحة الرئيسية وغيرها) */
export async function syncOfficeCustomTimelineFlag(): Promise<boolean> {
  const { stages } = await fetchCustomTimelineForOffice();
  return stages !== null && stages.length > 0;
}
