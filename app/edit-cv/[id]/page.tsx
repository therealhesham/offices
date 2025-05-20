'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
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
      LaundryLeveL: 'Laundry Level',
      CookingLeveL: 'Cooking Level',
      BabySitterLevel: 'Babysitting Level',
      OldPeopleCare: 'Old People Care',
      ExperienceYears: 'Years of Experience',
      experienceType: 'Experience Type',
      Education: 'Education',
      Salary: 'Salary',
    },
    options: {
      maritalStatus: {
        select: 'Select',
        Single: 'Single',
        Married: 'Married',
        Divorced: 'Divorced',
        Widowed: 'Widowed',
      },
      skillLevels: {
        select: 'Select',
        Beginner: 'Beginner',
        Intermediate: 'Intermediate',
        Advanced: 'Advanced',
      },
      laundryCookingLevels: {
        select: 'Select',
        Basic: 'Basic',
        Intermediate: 'Intermediate',
        Advanced: 'Advanced',
      },
    },
    errors: {
      fetchFailed: 'Error fetching CV',
      updateFailed: 'Error updating CV',
    },
    success: {
      updateSuccess: 'CV updated successfully!',
    },
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
      LaundryLeveL: 'Niveau de lessive',
      CookingLeveL: 'Niveau de cuisine',
      BabySitterLevel: 'Niveau de garde d’enfants',
      OldPeopleCare: 'Soin des personnes âgées',
      ExperienceYears: 'Années d’expérience',
      experienceType: 'Type d’expérience',
      Education: 'Éducation',
      Salary: 'Salaire',
    },
    options: {
      maritalStatus: {
        select: 'Sélectionner',
        Single: 'Célibataire',
        Married: 'Marié',
        Divorced: 'Divorcé',
        Widowed: 'Veuf/Veuve',
      },
      skillLevels: {
        select: 'Sélectionner',
        Beginner: 'Débutant',
        Intermediate: 'Intermédiaire',
        Advanced: 'Avancé',
      },
      laundryCookingLevels: {
        select: 'Sélectionner',
        Basic: 'Basique',
        Intermediate: 'Intermédiaire',
        Advanced: 'Avancé',
      },
    },
    errors: {
      fetchFailed: 'Erreur lors de la récupération du CV',
      updateFailed: 'Erreur lors de la mise à jour du CV',
    },
    success: {
      updateSuccess: 'CV mis à jour avec succès !',
    },
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
      LaundryLeveL: 'لانڈری کی سطح',
      CookingLeveL: 'کھانا پکانے کی سطح',
      BabySitterLevel: 'بچوں کی دیکھ بھال کی سطح',
      OldPeopleCare: 'بزرگوں کی دیکھ بھال',
      ExperienceYears: 'تجربے کے سال',
      experienceType: 'تجربے کی قسم',
      Education: 'تعلیم',
      Salary: 'تنخواہ',
    },
    options: {
      maritalStatus: {
        select: 'منتخب کریں',
        Single: 'غیر شادی شدہ',
        Married: 'شادی شدہ',
        Divorced: 'طلاق یافتہ',
        Widowed: 'بیوہ/بیوہ',
      },
      skillLevels: {
        select: 'منتخب کریں',
        Beginner: 'ابتدائی',
        Intermediate: 'درمیانی',
        Advanced: 'اعلیٰ',
      },
      laundryCookingLevels: {
        select: 'منتخب کریں',
        Basic: 'بنیادی',
        Intermediate: 'درمیانی',
        Advanced: 'اعلیٰ',
      },
    },
    errors: {
      fetchFailed: 'سی وی حاصل کرنے میں خرابی',
      updateFailed: 'سی وی اپ ڈیٹ کرنے میں خرابی',
    },
    success: {
      updateSuccess: 'سی وی کامیابی سے اپ ڈیٹ ہو گیا!',
    },
  },
};

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
  OldPeopleCare?: boolean;
  ArabicLanguageLeveL?: string;
  EnglishLanguageLevel?: string;
  Salary?: string;
  LaundryLeveL?: string;
  IroningLevel?: string;
  CleaningLeveL?: string;
  CookingLeveL?: string;
  SewingLeveL?: string;
  BabySitterLevel?: string;
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
        setFormData(data);
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
      const response = await fetch(`/api/homemaid/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
                { name: 'dateofbirth', type: 'text' },
                { name: 'age', type: 'number' },
                { name: 'Passportnumber', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'maritalstatus', type: 'select', options: t.options.maritalStatus },
                { name: 'Religion', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.fields[field.name]}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-label={t.fields[field.name]}
                    >
                      <option value="">{field.options.select}</option>
                      <option value="Single">{field.options.Single}</option>
                      <option value="Married">{field.options.Married}</option>
                      <option value="Divorced">{field.options.Divorced}</option>
                      <option value="Widowed">{field.options.Widowed}</option>
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              {[
                { name: 'ArabicLanguageLeveL', type: 'select', options: t.options.skillLevels },
                { name: 'EnglishLanguageLevel', type: 'select', options: t.options.skillLevels },
                { name: 'LaundryLeveL', type: 'select', options: t.options.laundryCookingLevels },
                { name: 'CookingLeveL', type: 'select', options: t.options.laundryCookingLevels },
                { name: 'BabySitterLevel', type: 'select', options: t.options.laundryCookingLevels },
                { name: 'OldPeopleCare', type: 'checkbox' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.fields[field.name]}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-label={t.fields[field.name]}
                    >
                      <option value="">{field.options.select}</option>
                      <option value="Beginner">{field.options.Beginner}</option>
                      <option value="Intermediate">{field.options.Intermediate}</option>
                      <option value="Advanced">{field.options.Advanced}</option>
                    </select>
                  ) : (
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      aria-label={t.fields[field.name]}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience & Education */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.experienceEducation}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'ExperienceYears', type: 'text' },
                { name: 'experienceType', type: 'text' },
                { name: 'Education', type: 'text' },
                { name: 'Salary', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.fields[field.name]}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label={t.fields[field.name]}
                  />
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