'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { HOMEMAID_LEVEL_KEYS, pickHomemaidString } from '@/app/lib/homemaidLevels';
import {
  skillLevels,
  educationOptions,
  experienceOptions,
  maritalStatusOptions,
  religionOptions,
  selectOptionsWithCurrent,
} from '@/app/lib/homemaidFormOptions';
// Translation dictionary
const translations = {
  en: {
    title: 'Edit CV',
    loading: 'Loading...',
    notFound: 'CV not found',
    saveButton: 'Save Changes',
    personalInfo: 'Personal Information',
    skills: 'Skills',
    experienceEducation: 'Experience & Education',
    fields: {
      Name: 'Name',
      Nationalitycopy: 'Nationality',
      dateofbirth: 'Date of Birth',
      age: 'Age',
      Passportnumber: 'Passport Number',
      phone: 'Phone',
      maritalstatus: 'Marital Status',
      Religion: 'Religion',
      ArabicLanguageLeveL: 'Arabic Language Level',
      EnglishLanguageLevel: 'English Language Level',
      LaundryLevel: 'Laundry Level',
      WashingLevel: 'Washing Level',
      IroningLevel: 'Ironing Level',
      CleaningLevel: 'Cleaning Level',
      CookingLevel: 'Cooking Level',
      SewingLevel: 'Sewing Level',
      ChildcareLevel: 'Childcare / Babysitting',
      ElderlycareLevel: 'Elderly Care Level',
      ExperienceYears: 'Years of Experience',
      Experience: 'Experience level',
      experienceType: 'Experience Type',
      Education: 'Education',
      Salary: 'Salary',
    },
    errors: {
      fetchFailed: 'Error fetching CV',
      updateFailed: 'Error updating CV',
    },
    success: {
      updateSuccess: 'CV updated successfully!',
    },
    selectPlaceholder: 'Select…',
  },
  fra: {
    title: 'Modifier le CV',
    loading: 'Chargement...',
    notFound: 'CV non trouvé',
    saveButton: 'Enregistrer les modifications',
    personalInfo: 'Informations personnelles',
    skills: 'Compétences',
    experienceEducation: 'Expérience et éducation',
    fields: {
      Name: 'Nom',
      Nationalitycopy: 'Nationalité',
      dateofbirth: 'Date de naissance',
      age: 'Âge',
      Passportnumber: 'Numéro de passeport',
      phone: 'Téléphone',
      maritalstatus: 'État civil',
      Religion: 'Religion',
      ArabicLanguageLeveL: 'Niveau de langue arabe',
      EnglishLanguageLevel: 'Niveau de langue anglaise',
      LaundryLevel: 'Niveau de lessive',
      WashingLevel: 'Niveau de lavage',
      IroningLevel: 'Niveau de repassage',
      CleaningLevel: 'Niveau de nettoyage',
      CookingLevel: 'Niveau de cuisine',
      SewingLevel: 'Niveau de couture',
      ChildcareLevel: 'Garde d’enfants',
      ElderlycareLevel: 'Soin des personnes âgées',
      ExperienceYears: 'Années d’expérience',
      Experience: 'Niveau d’expérience',
      experienceType: 'Type d’expérience',
      Education: 'Éducation',
      Salary: 'Salaire',
    },
    errors: {
      fetchFailed: 'Erreur lors de la récupération du CV',
      updateFailed: 'Erreur lors de la mise à jour du CV',
    },
    success: {
      updateSuccess: 'CV mis à jour avec succès !',
    },
    selectPlaceholder: 'Choisir…',
  },
  ur: {
    title: 'سی وی میں ترمیم کریں',
    loading: 'لوڈ ہو رہا ہے...',
    notFound: 'سی وی نہیں ملا',
    saveButton: 'تبدیلیاں محفوظ کریں',
    personalInfo: 'ذاتی معلومات',
    skills: 'ہنر',
    experienceEducation: 'تجربہ اور تعلیم',
    fields: {
      Name: 'نام',
      Nationalitycopy: 'قومیت',
      dateofbirth: 'تاریخ پیدائش',
      age: 'عمر',
      Passportnumber: 'پاسپورٹ نمبر',
      phone: 'فون',
      maritalstatus: 'ازدواجی حیثیت',
      Religion: 'مذہب',
      ArabicLanguageLeveL: 'عربی زبان کی سطح',
      EnglishLanguageLevel: 'انگریزی زبان کی سطح',
      LaundryLevel: 'لانڈری کی سطح',
      WashingLevel: 'دھونے کی سطح',
      IroningLevel: 'استری کی سطح',
      CleaningLevel: 'صفائی کی سطح',
      CookingLevel: 'کھانا پکانے کی سطح',
      SewingLevel: 'سلائی کی سطح',
      ChildcareLevel: 'بچوں کی دیکھ بھال',
      ElderlycareLevel: 'بزرگوں کی دیکھ بھال',
      ExperienceYears: 'تجربے کے سال',
      Experience: 'تجربے کی سطح',
      experienceType: 'تجربے کی قسم',
      Education: 'تعلیم',
      Salary: 'تنخواہ',
    },
    errors: {
      fetchFailed: 'سی وی حاصل کرنے میں خرابی',
      updateFailed: 'سی وی اپ ڈیٹ کرنے میں خرابی',
    },
    success: {
      updateSuccess: 'سی وی کامیابی سے اپ ڈیٹ ہو گیا!',
    },
    selectPlaceholder: 'منتخب کریں…',
  },
};

function toDateInputValue(iso: string | Date | null | undefined): string {
  if (iso == null || iso === '') return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Keeps YYYY-MM-DD from the date picker; parses ISO only when loading from API. */
function dateOfBirthInputValue(raw: string | undefined): string {
  if (!raw) return '';
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return toDateInputValue(s);
}

/** Full years since DOB (calendar), using local date parts for YYYY-MM-DD. */
function computeAgeFromDobString(dob: string | undefined | null): number | null {
  if (!dob?.trim()) return null;
  const s = dob.trim();
  let birth: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    birth = new Date(y, m - 1, d);
  } else {
    birth = new Date(s);
  }
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const todayMd = today.getMonth() * 32 + today.getDate();
  const birthMd = birth.getMonth() * 32 + birth.getDate();
  if (todayMd < birthMd) years -= 1;
  return years >= 0 ? years : null;
}

interface Homemaid {
  id: number;
  Nationalitycopy?: string;
  Name?: string;
  Religion?: string;
  Passportnumber?: string;
  clientphonenumber?: string;
  ExperienceYears?: string;
  maritalstatus?: string;
  Experience?: string;
  dateofbirth?: string;
  age?: number;
  phone?: string;
  bookingstatus?: string;
  ages?: string;
  officeName?: string;
  experienceType?: string;
  PassportStart?: string;
  PassportEnd?: string;
  ArabicLanguageLeveL?: string;
  EnglishLanguageLevel?: string;
  Salary?: string;
  LaundryLevel?: string;
  WashingLevel?: string;
  IroningLevel?: string;
  CleaningLevel?: string;
  CookingLevel?: string;
  SewingLevel?: string;
  ChildcareLevel?: string;
  ElderlycareLevel?: string;
  Education?: string;
}

export default function EditCV() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { language } = useLanguage();
  // Fallback to English if language is invalid
  const validLanguages = ['en', 'fra', 'ur'];
  const t = validLanguages.includes(language) ? translations[language] : translations['en'];

  const [formData, setFormData] = useState<Homemaid | null>(null);
  const [loading, setLoading] = useState(true);

  // Set text direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch(`/api/homemaid/${id}`);
        if (!response.ok) throw new Error('Failed to fetch CV');
        const data = await response.json();
        const r = data as Record<string, unknown>;
        const lvl = (keys: readonly string[]) =>
          pickHomemaidString(r, keys) ?? '';
        setFormData({
          ...data,
          dateofbirth: toDateInputValue(data.dateofbirth) || undefined,
          ArabicLanguageLeveL: lvl(HOMEMAID_LEVEL_KEYS.arabic),
          EnglishLanguageLevel: lvl(HOMEMAID_LEVEL_KEYS.english),
          LaundryLevel: lvl(HOMEMAID_LEVEL_KEYS.laundry),
          WashingLevel: lvl(HOMEMAID_LEVEL_KEYS.washing),
          IroningLevel: lvl(HOMEMAID_LEVEL_KEYS.ironing),
          CleaningLevel: lvl(HOMEMAID_LEVEL_KEYS.cleaning),
          CookingLevel: lvl(HOMEMAID_LEVEL_KEYS.cooking),
          SewingLevel: lvl(HOMEMAID_LEVEL_KEYS.sewing),
          ChildcareLevel: lvl(HOMEMAID_LEVEL_KEYS.childcare),
          ElderlycareLevel: lvl(HOMEMAID_LEVEL_KEYS.elderly),
        });
      } catch (error) {
        toast.error(t.errors.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchCV();
  }, [id, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dob = dateOfBirthInputValue(formData.dateofbirth);
      const calculatedAge = computeAgeFromDobString(dob);
      const payload = {
        ...formData,
        dateofbirth:
          dob && dob.length > 0 ? `${dob}T00:00:00.000Z` : null,
        age: calculatedAge ?? null,
      };
      const response = await fetch(`/api/homemaid/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update CV');
      toast.success(t.success.updateSuccess);
      router.push(`/homemaid/${id}`);
    } catch (error) {
      toast.error(t.errors.updateFailed);
    }
  };

  if (loading) return <div className="text-center text-white">{t.loading}</div>;

  if (!formData) return <div className="text-center text-white">{t.notFound}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Sidebar />
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {t.title}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.personalInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Name', type: 'text', required: true },
                { name: 'Nationalitycopy', type: 'text' },
                { name: 'dateofbirth', type: 'date' },
                { name: 'age', type: 'computedAge' },
                { name: 'Passportnumber', type: 'text' },
                { name: 'phone', type: 'text' },
                {
                  name: 'maritalstatus',
                  type: 'select',
                  optionList: maritalStatusOptions,
                },
                { name: 'Religion', type: 'select', optionList: religionOptions },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.fields[field.name]}
                  </label>
                  {field.type === 'select' && field.optionList ? (
                    <select
                      name={field.name}
                      value={String(formData[field.name as keyof Homemaid] ?? '')}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-label={t.fields[field.name]}
                    >
                      <option value="">{t.selectPlaceholder}</option>
                      {selectOptionsWithCurrent(
                        formData[field.name as keyof Homemaid] as string | undefined,
                        field.optionList
                      ).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'computedAge' ? (
                    <output
                      className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-800 shadow-inner"
                      aria-label={t.fields.age}
                      aria-live="polite"
                    >
                      {(() => {
                        const n = computeAgeFromDobString(
                          dateOfBirthInputValue(formData.dateofbirth)
                        );
                        return n != null ? String(n) : '—';
                      })()}
                    </output>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={
                        field.type === 'date'
                          ? dateOfBirthInputValue(formData[field.name] as string | undefined)
                          : String(formData[field.name] ?? '')
                      }
                      onChange={handleChange}
                      max={field.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required={field.required}
                      aria-label={t.fields[field.name]}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.skills}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  'ArabicLanguageLeveL',
                  'EnglishLanguageLevel',
                  'LaundryLevel',
                  'WashingLevel',
                  'IroningLevel',
                  'CleaningLevel',
                  'CookingLevel',
                  'SewingLevel',
                  'ChildcareLevel',
                  'ElderlycareLevel',
                ] as const
              ).map((name) => {
                const raw = String(formData[name] ?? '');
                const opts = selectOptionsWithCurrent(raw, skillLevels);
                return (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700">
                      {t.fields[name]}
                    </label>
                    <select
                      name={name}
                      value={raw}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-label={t.fields[name]}
                    >
                      <option value="">{t.selectPlaceholder}</option>
                      {opts.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience & Education */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.experienceEducation}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  { name: 'ExperienceYears', type: 'text' as const },
                  {
                    name: 'Experience',
                    type: 'select' as const,
                    optionList: experienceOptions,
                  },
                  {
                    name: 'experienceType',
                    type: 'select' as const,
                    optionList: experienceOptions,
                  },
                  {
                    name: 'Education',
                    type: 'select' as const,
                    optionList: educationOptions,
                  },
                  { name: 'Salary', type: 'text' as const },
                ] as const
              ).map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.fields[field.name]}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={String(formData[field.name as keyof Homemaid] ?? '')}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-label={t.fields[field.name]}
                    >
                      <option value="">{t.selectPlaceholder}</option>
                      {selectOptionsWithCurrent(
                        formData[field.name as keyof Homemaid] as string | undefined,
                        field.optionList
                      ).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={field.name}
                      value={String(formData[field.name as keyof Homemaid] ?? '')}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-label={t.fields[field.name]}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t.saveButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}