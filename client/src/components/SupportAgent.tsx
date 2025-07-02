import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const SupportAgent: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your enhanced Support Agent with memory and multilingual capabilities. I can help you with:\n• Client searches\n• Creating new clients\n• Order status checks\n• Creating new orders\n• Class schedules\n• Payment information\n\nI remember our conversation context and can understand queries in multiple languages. Try asking me something like "Create client John Smith with email john@example.com"',
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const exampleQueries = [
    'Create client John Smith with email john@example.com and phone +1234567890',
    'Create an order for Yoga Beginner for client priya.sharma@email.com',
    'Find client with email john.doe@email.com',
    'What is the status of order ABC123?',
    'Show me classes this week',
    'Check payment status for order XYZ789',
    'Search for client with name Sarah Johnson',
    'इस सप्ताह कौन सी कक्षाएं उपलब्ध हैं?',
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/agents/support/query`, {
        query: inputText,
        sessionId: sessionId,
      });

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.data,
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
      
      // Update sessionId if server provides a new one
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setInputText(query);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm">Agent is thinking...</span>
            </div>
          </div>
        )}
        
        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Try these examples:</h3>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(query)}
              className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              {query.length > 40 ? query.substring(0, 40) + '...' : query}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything about clients, orders, classes, or payments..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SupportAgent;
