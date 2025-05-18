'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation('common');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Mock API call to send message
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Replace with your API endpoint
      const response = await axios.post('/api/chat', { message: text });
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response.data.reply || t('chat.botResponse'), // Fallback response
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast.error(t('chat.error'));
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className={classNames(
          'rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
          theme === 'dark'
            ? 'bg-indigo-600 text-white focus:ring-indigo-500'
            : 'bg-indigo-500 text-white focus:ring-indigo-400'
        )}
        aria-label={isOpen ? t('chat.close') : t('chat.open')}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={classNames(
              'mt-4 w-80 rounded-lg shadow-xl overflow-hidden',
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            )}
          >
            {/* Header */}
            <div className="bg-indigo-500 p-4 text-white">
              <h3 className="text-lg font-semibold">{t('chat.title')}</h3>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-sm opacity-60">{t('chat.empty')}</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={classNames(
                      'flex',
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={classNames(
                        'max-w-[70%] rounded-lg p-2 text-sm',
                        msg.sender === 'user'
                          ? 'bg-indigo-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-200 text-gray-900'
                      )}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className={classNames(
                    'flex-1 rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    theme === 'dark'
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  )}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={classNames(
                    'p-2 rounded-full',
                    isLoading || !input.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-indigo-100',
                    theme === 'dark' ? 'text-white' : 'text-indigo-500'
                  )}
                  aria-label={t('chat.send')}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;