'use client';

import { useActionState, useState, useEffect, useContext } from 'react';
import { authenticate } from '../lib/actions';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock } from 'react-icons/fa';
import { LanguageContext } from '../contexts/LanguageContext';

export default function Login() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [language, setLanguage] = useState('en');
const c = useContext(LanguageContext)
  // Handle language detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('language') || 'en';
      setLanguage(storedLang);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ id, password }),
        headers: { 'accept': 'application/json' },
      });
      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('_item', data.token);
        setError('');
        router.push('/home');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const getLoginText = () => {
    switch (language) {
      case 'fra':
        return 'Se connecter';
      case 'ur':
        return 'سائن ان کریں';
      default:
        return 'Log In';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        {/* HR-themed decorative element */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-20 rounded-2xl pointer-events-none"></div>
        
        {/* Logo placeholder (replace with actual HR company logo) */}
        <div className="flex justify-center mb-6">
          <div className="text-3xl font-bold text-purple-600">Rawaes</div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">{getLoginText()}</h2>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-6 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 sr-only">
              ID
            </label>
            <div className="absolute inset-y-0 left-6 transform -translate-x-1/2 flex items-center">
              <FaUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="id"
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
              placeholder="Enter your ID"
              aria-label="ID"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">
              Password
            </label>
            <div className="absolute inset-y-0 left-6 transform -translate-x-1/2 flex items-center">
              <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
              placeholder="Enter your password"
              aria-label="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Log In"
          >
            {isPending ? 'Logging in...' : getLoginText()}
          </button>
        </form>

        {/* Language toggle (optional, can be moved to a settings page) */}
        <div className="mt-6 text-center">
          <select
            value={language}
            onChange={(e) => {
               c.changeLanguage(e.target.value)
              // setLanguage(e.target.value);
              // if (typeof window !== 'undefined') {
              //   localStorage.setItem('language', e.target.value);
              // }
            }}
            className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="fra">Français</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
      </div>

      {/* Tailwind CSS animation for error fade-in */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}