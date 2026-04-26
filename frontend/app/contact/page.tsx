'use client';

import { Mail, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-maroon/30 flex flex-col">
      <header className="px-10 py-6 flex items-center justify-between relative z-10">
         <Link href="/" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={18}  strokeWidth={1.5}/>
         </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 relative">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-maroon/10 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red/10 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="text-center mb-16 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-maroon to-red">
               Get in touch.
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed font-medium max-w-2xl mx-auto">
               Whether you need help implementing FairnessAudit in your enterprise or have questions about our methodology, our team is ready to assist.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-8">
               <div className="glass-card p-8 rounded-3xl border border-white/5">
                  <Mail className="text-red mb-6" size={32}  strokeWidth={1.5}/>
                  <h3 className="text-xl font-black mb-2">Enterprise Support</h3>
                  <p className="text-text-secondary text-sm mb-6">SLA-backed support for production deployments.</p>
                  <a href="mailto:support@fairnessaudit.example" className="text-red font-bold hover:text-red transition-colors">
                     support@fairnessaudit.example
                  </a>
               </div>

               <div className="glass-card p-8 rounded-3xl border border-white/5">
                  <MessageSquare className="text-maroon mb-6" size={32}  strokeWidth={1.5}/>
                  <h3 className="text-xl font-black mb-2">Community Discord</h3>
                  <p className="text-text-secondary text-sm mb-6">Join thousands of ML engineers discussing ethical AI.</p>
                  <a href="#" className="text-maroon font-bold hover:text-red transition-colors">
                     Join the Server →
                  </a>
               </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/10 bg-background-surface/50">
               <h3 className="text-2xl font-black mb-6">Send a Message</h3>
               <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Name</label>
                     <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-maroon/50 transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Email</label>
                     <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-maroon/50 transition-colors" placeholder="jane@example.com" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Message</label>
                     <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-maroon/50 transition-colors resize-none" placeholder="How can we help?" />
                  </div>
                  <button type="button" className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                     Submit Inquiry <Send size={16}  strokeWidth={1.5}/>
                  </button>
               </form>
            </div>
         </div>
      </main>
    </div>
  );
}
