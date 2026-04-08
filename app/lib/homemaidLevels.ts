/** API / Prisma may expose the same logical field under several key spellings. */
export const HOMEMAID_LEVEL_KEYS = {
  arabic: ['ArabicLanguageLeveL', 'arabicLanguageLeveL'],
  english: ['EnglishLanguageLevel', 'englishLanguageLevel'],
  laundry: ['LaundryLevel', 'laundryLevel', 'LaundryLeveL'],
  ironing: ['IroningLevel', 'ironingLevel'],
  cleaning: ['CleaningLevel', 'cleaningLevel', 'CleaningLeveL'],
  cooking: ['CookingLevel', 'cookingLevel', 'CookingLeveL'],
  washing: ['WashingLevel', 'washingLevel'],
  sewing: ['SewingLevel', 'sewingLevel', 'SewingLeveL'],
  childcare: ['ChildcareLevel', 'childcareLevel', 'BabySitterLevel', 'babySitterLevel'],
  elderly: ['ElderlycareLevel', 'elderlycareLevel'],
} as const;

export type HomemaidLevelKind = keyof typeof HOMEMAID_LEVEL_KEYS;

export function pickHomemaidString(
  record: Record<string, unknown> | null | undefined,
  keys: readonly string[]
): string | null {
  if (!record) return null;
  for (const k of keys) {
    const v = record[k];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return null;
}

export function homemaidLevel(
  record: Record<string, unknown> | null | undefined,
  kind: HomemaidLevelKind
): string {
  return pickHomemaidString(record, HOMEMAID_LEVEL_KEYS[kind]) || 'N/A';
}

export function homemaidDisplayAge(record: Record<string, unknown> | null | undefined): string {
  if (!record) return 'N/A';
  const dobRaw = pickHomemaidString(record, ['dateofbirth']);
  if (dobRaw) {
    const d = new Date(dobRaw);
    if (!Number.isNaN(d.getTime())) {
      const today = new Date();
      let years = today.getFullYear() - d.getFullYear();
      const md = today.getMonth() * 32 + today.getDate();
      const bmd = d.getMonth() * 32 + d.getDate();
      if (md < bmd) years -= 1;
      if (years >= 0 && years <= 130) return String(years);
    }
  }
  const age = record.age;
  if (typeof age === 'number' && age >= 0 && age <= 120) return String(age);
  if (typeof age === 'string' && /^\d{1,3}$/.test(age.trim())) {
    const n = parseInt(age, 10);
    if (n >= 0 && n <= 120) return String(n);
  }
  return 'N/A';
}
