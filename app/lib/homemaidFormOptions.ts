/** Unified dropdown values for homemaid add/edit (matches DB bilingual labels). */

export const skillLevels = [
  'Expert - ممتاز',
  'Advanced - جيد جداً',
  'Intermediate - جيد',
  'Beginner - مبتدأ',
  'Non - لا تجيد',
] as const;

export const educationOptions = [
  'Diploma - دبلوم',
  'High school - ثانوي',
  'Illiterate - غير متعلم',
  'Literate - القراءة والكتابة',
  'Primary school - ابتدائي',
  'University level - جامعي',
] as const;

export const experienceOptions = [
  'Novice | مدربة بدون خبرة',
  'Intermediate | مدربة بخبرة متوسطة',
  'Well-experienced | خبرة جيدة',
  'Expert | خبرة ممتازة',
] as const;

export const maritalStatusOptions = [
  'Single - عازبة',
  'Married - متزوجة',
  'Divorced - مطلقة',
  'Widowed - أرملة',
] as const;

export const religionOptions = [
  'Islam - الإسلام',
  'Non-Muslim - غير مسلم',
] as const;

/** Keeps a legacy/free value visible in the dropdown when it is not in the canonical list. */
export function selectOptionsWithCurrent(
  current: string | undefined | null,
  list: readonly string[]
): string[] {
  const c = String(current ?? '').trim();
  if (!c) return [...list];
  if (list.includes(c)) return [...list];
  return [c, ...list];
}
