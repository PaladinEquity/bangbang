'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! How can I help you with your wallpaper design today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputValue.trim()),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Simple bot response logic - in a real app, this would connect to a backend API
  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi')) {
      return 'Hello! How can I help you with your wallpaper design today?';
    } else if (input.includes('custom') || input.includes('design')) {
      return 'We offer fully customizable wallpaper designs. You can create your own pattern or choose from our curated collection.';
    } else if (input.includes('price') || input.includes('cost')) {
      return 'Our pricing depends on the size and material you choose. You can see detailed pricing on the product page after selecting your design.';
    } else if (input.includes('shipping') || input.includes('delivery')) {
      return 'We ship worldwide! Standard shipping takes 5-7 business days, and express shipping is available for 2-3 business days.';
    } else if (input.includes('material') || input.includes('quality')) {
      return 'We use premium eco-friendly materials for all our wallpapers. They are durable, easy to install, and removable.';
    } else {
      return "Thank you for your message. If you have specific questions about our wallpapers, please let me know and I'll be happy to help!";
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className="bg-[#6200ea] text-white rounded-full p-3 shadow-lg hover:bg-[#3700b3] transition-all duration-300 flex items-center justify-center w-14 h-14"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-200">
          {/* Chat header */}
          <div className="bg-[#6200ea] text-white p-4">
            <h3 className="font-medium">BangBang Wallpaper Support</h3>
            <p className="text-xs opacity-80">We typically reply within a few minutes</p>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' 
                    ? 'bg-[#6200ea] text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6200ea] focus:border-transparent"
            />
            <button 
              type="submit" 
              className="bg-[#6200ea] text-white px-4 py-2 rounded-r-lg hover:bg-[#3700b3] transition-colors duration-300 disabled:opacity-50"
              disabled={!inputValue.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;