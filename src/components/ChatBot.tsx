import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageSquare, Send } from 'lucide-react';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyDMzitqIAEbZd4MpjjhgoNTMCXAsOhlYck');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash', // Using the free tier model
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hello! I\'m your MedFit assistant. I can help you with medical-related questions about conditions, diseases, diagnoses, and treatments. I\'m powered by Gemini\'s free tier, so there may be occasional usage limits. How can I assist you today?'
};

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = `You are a medical assistant for MedFit. Provide accurate, helpful, and concise responses to medical questions. Only answer questions related to medical conditions, diseases, diagnoses, and treatments. If the question is not medical-related, politely decline to answer and remind the user that you can only help with medical topics.

Current question: ${userMessage}

Please provide a clear and accurate response based on medical knowledge. If you're unsure about something, acknowledge the uncertainty and suggest consulting a healthcare professional.`;

      // Add retry mechanism for API calls
      let attempts = 0;
      const maxAttempts = 3;
      let result;
      let response;
      
      while (attempts < maxAttempts) {
        try {
          result = await model.generateContent(prompt);
          response = await result.response;
          
          if (response.text()) {
            break; // Success, exit the retry loop
          }
          throw new Error('Empty response received');
        } catch (apiError) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw apiError; // Rethrow if we've exhausted our retries
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
        }
      }
      
      if (!response || !response.text()) {
        throw new Error('Failed to get a valid response after multiple attempts');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text() 
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorMessage = 'I apologize, but I encountered an error processing your request. ';
      
      // Check for specific API errors
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          errorMessage += 'You may have reached the API rate limit for the free tier. Please try again in a moment.';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage += 'There might be an issue with API access permissions. Please try a different question.';
        } else {
          errorMessage += 'Please try asking your question again, or rephrase it if the issue persists.';
        }
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex items-center gap-2 bg-indigo-50">
        <MessageSquare className="text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">MedFit Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about medical conditions..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}