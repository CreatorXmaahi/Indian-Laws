import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { createLegalChatSession } from '../services/geminiService';
import { Send, Bot, User, RefreshCw, MessageSquare } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Namaste! I am your NyayaSetu legal assistant. I can help explain Indian laws, specific sections, or legal concepts. What would you like to know today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    try {
      chatSessionRef.current = createLegalChatSession();
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      const botMsgId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Add initial empty bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: ''
      }]);

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
            fullText += text;
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: fullText } : msg
            ));
        }
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I apologize, but I encountered an error connecting to the legal database. Please try again.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gov-50">
            <div className="bg-gov-600 p-2 rounded-lg text-white">
                <MessageSquare size={20} />
            </div>
            <div>
                <h2 className="font-bold text-slate-800">Legal Assistant</h2>
                <p className="text-xs text-slate-500">Powered by Gemini AI</p>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-gov-600 text-white'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    } ${msg.isError ? 'border-red-300 bg-red-50 text-red-700' : ''}`}>
                        {msg.text ? (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : (
                            <div className="flex gap-1 items-center h-5 px-2">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a legal question... (e.g., 'What is anticipatory bail?')"
                    className="flex-grow bg-slate-100 text-slate-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gov-400 transition-all placeholder:text-slate-400"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 bg-gov-900 text-white rounded-lg disabled:opacity-50 hover:bg-gov-800 transition-colors"
                >
                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">
                    NyayaSetu AI can make mistakes. Please consult a qualified lawyer for professional legal advice.
                </p>
            </div>
        </div>
    </div>
  );
};

export default ChatInterface;