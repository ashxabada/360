import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const botIcon = (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      S
    </div>
  );

  const userIcon = (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      U
    </div>
  );

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && botIcon}
      <div
        className={`px-4 py-3 rounded-2xl max-w-sm md:max-w-md break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}
      >
        {isUser ? (
            <p className="text-sm">{message.text}</p>
        ) : (
            <div className="text-sm prose prose-invert" dangerouslySetInnerHTML={{ __html: message.text }} />
        )}
      </div>
       {isUser && userIcon}
    </div>
  );
};

export default ChatMessage;
