'use client';

import { jwtDecode } from 'jwt-decode';
import type { TimelineStage } from '@/app/lib/timelineStage';

type OfficeJwtPayload = {
  id?: number;
  office?: string | null;
  url?: string | null;
  country?: string | null;
};

/** رقم المكتب من JWT */
export function getOfficeIdFromToken(): number | null {
  if (typeof window === 'undefined') return null;
  const tok = localStorage.getItem('_item');
  if (!tok) return null;
  try {
    const p = jwtDecode<OfficeJwtPayload>(tok);
    return typeof p.id === 'number' ? p.id : null;
  } catch {
    return null;
  }
}

/**
 * يطابق `offices.id` مع `CustomTimeline.officeId` عبر الـ API.
 * يحدّث `localStorage`: `officeId`، `useCustomTimeline` = '1' فقط إن وُجد سجل نشط بنفس الرقم.
 */
export async function fetchCustomTimelineForOffice(): Promise<{
  stages: TimelineStage[] | null;
  officeId: number | null;
}> {
  const officeId = getOfficeIdFromToken();
  if (!officeId) {
    localStorage.removeItem('officeId');
    localStorage.removeItem('useCustomTimeline');
    return { stages: null, officeId: null };
  }

  localStorage.setItem('officeId', officeId.toString());

  try {
    const res = await fetch(
      `/api/custom-timeline/by-office/${encodeURIComponent(officeId)}`
    );
    if (res.ok) {
      const data = (await res.json()) as { stages?: unknown };
      const stages = Array.isArray(data.stages)
        ? (data.stages as TimelineStage[])
        : [];
      if (stages.length > 0) {
        localStorage.setItem('useCustomTimeline', '1');
        return { stages, officeId };
      }
    }
  } catch {
    // ignore network errors
  }

  localStorage.removeItem('useCustomTimeline');
  return { stages: null, officeId };
}

/** مزامنة العلم فقط (للصفحة الرئيسية وغيرها) */
export async function syncOfficeCustomTimelineFlag(): Promise<boolean> {
  const { stages } = await fetchCustomTimelineForOffice();
  return stages !== null && stages.length > 0;
}
