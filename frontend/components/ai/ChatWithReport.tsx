'use client';

import { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatWithReportProps {
  reportContext: any;
}

export function ChatWithReport({ reportContext }: ChatWithReportProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hi! I'm your AI Fairness Consultant. I've analyzed your report. Ask me anything about the bias detected, potential causes, or how to fix it." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          report_context: reportContext
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error communicating with the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-border-default rounded-xl bg-background-elevated overflow-hidden">
      <div className="p-4 border-b border-border-default bg-background-primary flex items-center gap-2">
        <Bot className="text-maroon" size={20}  strokeWidth={1.5}/>
        <h3 className="font-semibold text-text-primary">Chat with AI Consultant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-maroon/10 text-maroon'}`}>
              {msg.role === 'user' ? <User size={16} className="text-text-secondary"  strokeWidth={1.5}/> : <Bot size={16}  strokeWidth={1.5}/>}
            </div>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-white/5 text-text-primary border border-white/5 shadow-sm' : 'bg-background-primary border border-border-default text-text-secondary'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 flex-row">
             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-maroon/10 text-maroon">
              <Bot size={16}  strokeWidth={1.5}/>
            </div>
            <div className="p-3 rounded-xl bg-background-primary border border-border-default text-text-secondary flex items-center gap-2">
              <Loader2 className="animate-spin" size={16}  strokeWidth={1.5}/>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background-primary border-t border-border-default">
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your fairness report..."
            className="flex-1 bg-background-elevated border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-red/50 transition-colors"
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-maroon text-white rounded-lg hover:bg-red transition-all disabled:opacity-50 shadow-lg shadow-maroon-glow"
          >
            <Send size={18}  strokeWidth={1.5}/>
          </button>
        </div>
      </div>
    </div>
  );
}
