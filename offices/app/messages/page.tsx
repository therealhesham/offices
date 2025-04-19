'use client'
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const MessagesPage = () => {
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleString(),
      };
      setMessages([newMsg, ...messages]);
      setNewMessage('');
    }
  };
const [messages,setMessages]=useState([])
  return (
    <div className="flex flex-row">
      <Sidebar/>
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6 w-full">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Messages</h2>
        <div className="space-y-4">
          {messages?.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {message.sender[0]}
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 p-3 rounded-lg shadow-md">
                  <div className="text-sm font-semibold">{message.sender}</div>
                  <div className="text-gray-600">{message.content}</div>
                  <div className="text-xs text-gray-400">{message.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-6">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-4 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
    </div>
  );
};

export default MessagesPage;
