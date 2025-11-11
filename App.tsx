
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import type { Message } from './types';
import { getBotResponse } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-bot-message',
      text: '<p>Welcome to the See360 Virtual Assistant!</p><p>How can I help you today? Feel free to ask about reservations, our menu, or working hours.</p>',
      sender: 'bot',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (text: string) => {
    if (showQuickReplies) {
        setShowQuickReplies(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    // Prepare history for Gemini API
    const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    try {
      const botText = await getBotResponse(text, chatHistory);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botText,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
      const errorBotMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: `I'm having trouble connecting right now. Please try again later.`,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingIndicator = () => (
    <div className="flex items-start gap-3 my-4 justify-start">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          S
        </div>
        <div className="px-4 py-3 rounded-2xl max-w-sm md:max-w-md bg-gray-700 text-gray-200 rounded-bl-none flex items-center space-x-2">
            <span className="block w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
            <span className="block w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
            <span className="block w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
        </div>
    </div>
  );

  const QuickReplies = () => {
    const replies = ["Book a table", "View menu", "Working hours?"];
    return (
      <div className="flex flex-wrap justify-center gap-2 p-2 mb-2">
        {replies.map(reply => (
          <button
            key={reply}
            onClick={() => handleSendMessage(reply)}
            className="px-4 py-2 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-gray-700/80 hover:text-white transition-colors duration-200"
            aria-label={`Send message: ${reply}`}
          >
            {reply}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-800 text-white shadow-2xl">
      <header className="p-4 bg-gray-900 border-b border-gray-700 text-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-100">See360 Virtual Assistant</h1>
        <p className="text-sm text-gray-400">Powered by Gemini</p>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingIndicator />}
          {error && (
            <div className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-lg">
                Error: {error}
            </div>
           )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      {showQuickReplies && <QuickReplies />}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
