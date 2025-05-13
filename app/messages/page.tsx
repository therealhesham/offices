'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

const translations: Record<string, { title: string; inbox: string; sent: string; placeholder: string; send: string; you: string; noMessages: string }> = {
  en: {
    title: 'Messages',
    inbox: 'Inbox',
    sent: 'Sent',
    placeholder: 'Type your message...',
    send: 'Send',
    you: 'You',
    noMessages: 'No messages yet',
  },
  fra: {
    title: 'Messages',
    inbox: 'Boîte de réception',
    sent: 'Envoyé',
    placeholder: 'Tapez votre message...',
    send: 'Envoyer',
    you: 'Vous',
    noMessages: "Aucun message pour l'instant",
  },
  ur: {
    title: 'الرسائل',
    inbox: 'بريد وارد',
    sent: 'بريد مرسل',
    placeholder: 'اكتب رسالتك...',
    send: 'إرسال',
    you: 'أنت',
    noMessages: 'لا توجد رسائل بعد',
  },
};

const MessagesPage = () => {
  const [newMessage, setNewMessage] = useState('');
  interface Message {
    id: string;
    sender?: string;
    title: string;
    message: string;
    createdAt: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const { language } = useLanguage();
  // Fallback to English if language is invalid
  const validLanguages = ['en', 'fra', 'ur'];
  const t = validLanguages.includes(language) ? translations[language] : translations['en'];

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?type=${activeTab}`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const handleSendMessage = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          type: 'sent',
          title: 'New Message',
          sender: 'Current User',
        }),
      });
      const data = await response.json();
      setNewMessage('');
      if (activeTab === 'sent') fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-gradient-to-br from-purple-400 to-gray-200">
      <Sidebar />
      <div
        className="flex flex-col items-center p-6 w-full"
        dir={language === 'ur' ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.title}</h2>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-6 py-3 text-lg cursor-pointer font-semibold transition-colors duration-300 ${
                activeTab === 'inbox'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t.inbox}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-3 text-lg font-semibold cursor-pointer transition-colors duration-300 ${
                activeTab === 'sent'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t.sent}
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">{t.noMessages}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                      {message.sender?.[0]?.toUpperCase() || t.you[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">
                      {message.title}
                    </div>
                    <div className="text-gray-700">{message.message}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full max-w-5xl mt-8">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-4 border-none rounded-lg shadow-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 placeholder-gray-400"
            rows={5}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
          />
          <button
            onClick={handleSendMessage}
            className="mt-4 w-full p-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none transition-colors duration-300"
            aria-label={t.send}
          >
            {t.send}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;