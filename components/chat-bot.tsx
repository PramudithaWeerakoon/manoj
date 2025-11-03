'use client';

import { useState, useRef, useEffect } from 'react';
import { FaRegComment, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Function to get responses from the API instead of directly using the Gemini util
async function getChatResponse(message: string): Promise<string> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error with chatbot API:', error);
    return 'Sorry, I encountered an issue processing your request. Please try again later.';
  }
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! How can I help you with information about our radio site today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get response from API endpoint
      const response = await getChatResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an issue. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Toggle Button */}
      <button 
        onClick={toggleChat}
        className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <FaTimes size={20} /> : <FaRegComment size={20} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl flex flex-col max-h-[600px] border border-gray-200">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Radioo Assistant</h3>
            <button onClick={toggleChat} aria-label="Close chat">
              <FaTimes size={16} />
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "mb-3 p-3 rounded-lg max-w-[90%]",
                  message.role === 'user' 
                    ? "ml-auto bg-primary text-white" 
                    : "mr-auto bg-gray-100"
                )}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto bg-gray-100 p-3 rounded-lg animate-pulse">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t p-4 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our radio site..."
              className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-primary text-white px-4 py-2 rounded-r-md disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <FaPaperPlane size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}