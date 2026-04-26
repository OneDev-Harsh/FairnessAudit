'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ChevronRight } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface FloatingChatbotProps {
  step: string;
  context: any;
}

export function FloatingChatbot({ step, context }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load suggestions and initial message when step changes
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${baseUrl}/chat/suggestions/${step}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to load suggestions', error);
      }
    }

    const greetings: Record<string, string> = {
      upload: "I can help you understand your data. Not sure which columns are sensitive or what to upload?",
      mapping: "Correct mapping is the foundation of a good audit. Need help deciding which columns are which?",
      analyze: "I've analyzed the fairness results. Want me to explain what these scores mean for your model?",
      explain: "We're looking 'under the hood' now. Ask me about SHAP values or those proxy warnings.",
      mitigate: "Mitigation is about balance. I can help you decide which algorithm is best for your use case.",
      report: "Your audit is complete! I can help you interpret the final report or suggest next steps.",
    };

    setMessages([
      { role: 'ai', content: greetings[step] || "How can I help you with your fairness audit today?" }
    ]);
    loadSuggestions();
  }, [step]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (query?: string) => {
    const text = query || input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          report_context: context,
          step: step
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[550px] bg-background-elevated border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-background-primary border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-maroon/20 flex items-center justify-center text-red border border-maroon/30">
                  <Bot size={22}  strokeWidth={1.5}/>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AI Consultant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                    <span className="text-[10px] text-accent-success font-bold uppercase tracking-wider">Step: {step}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X size={20}  strokeWidth={1.5}/>
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
               {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-maroon/20 text-red border border-maroon/30' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                    {msg.role === 'user' ? <User size={16}  strokeWidth={1.5}/> : <Bot size={16}  strokeWidth={1.5}/>}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-maroon text-white shadow-sm' : 'bg-background-primary border border-border-default text-white/80'}`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-white/40">
                    <Bot size={16}  strokeWidth={1.5}/>
                  </div>
                  <div className="p-3 rounded-2xl bg-background-primary border border-border-default text-white/40 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin"  strokeWidth={1.5}/>
                    <span className="text-xs font-medium">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length < 3 && suggestions.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 mb-2">
                {suggestions.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[10px] bg-white/5 border border-white/10 hover:border-red/50 hover:bg-maroon/10 text-white/60 hover:text-white px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1"
                  >
                    <Sparkles size={10} className="text-red"  strokeWidth={1.5}/>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-background-primary border-t border-border-default">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-background-elevated border border-border-default rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red/50 transition-colors"
                  disabled={loading}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-maroon text-white rounded-xl flex items-center justify-center hover:bg-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-maroon-glow"
                >
                  <Send size={18}  strokeWidth={1.5}/>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-white text-maroon rotate-90 shadow-white-glow' : 'bg-maroon text-white shadow-maroon-glow'}`}
      >
        {isOpen ? <X size={24}  strokeWidth={1.5}/> : <MessageSquare size={24}  strokeWidth={1.5}/>}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-success rounded-full border-2 border-background-primary" />
        )}
      </motion.button>
    </div>
  );
}
