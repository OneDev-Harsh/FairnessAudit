'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, BarChart3, Brain, Zap, CheckCircle,
  Scale, Eye, GitCompare, FileText, Sparkles, ChevronRight,
  UploadCloud, Settings, Search, LayoutPanelLeft, ShieldAlert, ShieldCheck, Play
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Fairness Metrics',
    description: 'Demographic parity, equalized odds, and equal opportunity computed instantly with clear severity scores.',
    color: '#58a6ff',
  },
  {
    icon: Brain,
    title: 'SHAP Explainability',
    description: "Understand why your model makes biased predictions. Peek 'under the hood' with feature attributions.",
    color: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'Bias Mitigation',
    description: 'Apply state-of-the-art algorithms to fix discriminatory patterns and see before/after improvements.',
    color: '#10b981',
  },
  {
    icon: Scale,
    title: 'Legal Compliance',
    description: 'Automatically check against the "80% Rule" and other standard fairness thresholds.',
    color: '#f59e0b',
  },
  {
    icon: Eye,
    title: 'Proxy Detection',
    description: 'Detect hidden features (like zip codes) that might be acting as proxies for protected classes.',
    color: '#ef4444',
  },
  {
    icon: FileText,
    title: 'Audit Reports',
    description: 'Generate comprehensive JSON or PDF reports for stakeholders and regulators with one click.',
    color: '#3b82f6',
  },
];

const mainSteps = [
  { 
    icon: <UploadCloud size={24} />, 
    title: '1. Ingest Data', 
    desc: 'Upload your CSV or try our pre-built sample datasets to see fairness audit in action.',
    color: 'var(--accent-primary)'
  },
  { 
    icon: <Settings size={24} />, 
    title: '2. Define Rules', 
    desc: 'Tell us which columns are sensitive (like Gender or Race) and what you want to predict.',
    color: '#8b5cf6'
  },
  { 
    icon: <Search size={24} />, 
    title: '3. Audit & Fix', 
    desc: 'Instantly view bias metrics, explain the root cause, and apply automated fixes.',
    color: '#10b981'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 transition-all"
        style={{ background: 'rgba(10, 11, 15, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform" 
               style={{ background: 'linear-gradient(135deg, var(--accent-primary), #818cf8)' }}>
            <Shield size={20} color="white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">FairnessAudit</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
          </div>
          <Link href="/audit">
            <button className="btn-primary text-sm shadow-xl shadow-indigo-500/20 py-2.5 px-6">
              Launch Console <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with 3D Dash Preview */}
      <section className="relative pt-48 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Google Solution Challenge 2026</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tight text-white">
              Trustworthy AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                Built for Everyone.
              </span>
            </h1>
            <p className="text-lg text-white/60 mb-10 leading-relaxed max-w-xl">
              Detect bias, explain decisions, and mitigate discrimination with our 
              enterprise-grade fairness suite. Secure, compliant, and powered by Gemini 2.0.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/audit">
                <button className="btn-primary text-lg px-10 py-5 shadow-2xl shadow-indigo-500/30 group">
                  Start Full Audit 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/audit?demo=true">
                <button className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                  <Play size={18} fill="currentColor" /> Try Demo
                </button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-8 text-white/40 grayscale opacity-50">
               <div className="flex items-center gap-2 font-bold italic"><Shield size={16}/> SOC2 READY</div>
               <div className="flex items-center gap-2 font-bold italic"><GitCompare size={16}/> ISO 27001</div>
               <div className="flex items-center gap-2 font-bold italic"><Scale size={16}/> GDPR COMPLIANT</div>
            </div>
          </motion.div>

          {/* 3D Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, rotateY: 20, rotateX: 10, scale: 0.9 }}
            whileInView={{ opacity: 1, rotateY: 15, rotateX: 5, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block perspective-2000"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full -z-10 animate-pulse" />
            <div className="glass-card p-2 rounded-3xl border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform-gpu hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
               <div className="bg-[#0f1117] rounded-2xl overflow-hidden aspect-[4/3] relative">
                  {/* Mock UI Elements */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 flex items-center px-4 gap-2 border-b border-white/10">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="p-6 pt-16">
                     <div className="flex justify-between items-end mb-8">
                        <div>
                           <div className="w-32 h-2 bg-white/10 rounded mb-2" />
                           <div className="w-48 h-6 bg-indigo-500/20 rounded" />
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin-slow" />
                     </div>
                     <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                     </div>
                     <div className="h-40 bg-indigo-500/5 rounded-xl border border-indigo-500/10 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent" />
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass-card p-4 rounded-2xl border-indigo-500/30 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle size={18} />
                 </div>
                 <div>
                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Compliance</div>
                    <div className="text-xs font-bold text-white">98% FAIRNESS</div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Numbers */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
               { label: 'Latency', val: '<200ms' },
               { label: 'Uptime', val: '99.9%' },
               { label: 'Security', val: 'AES-256' },
               { label: 'Datasets', val: '∞' },
            ].map(s => (
               <div key={s.label} className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{s.val}</div>
                  <div className="text-xs font-bold text-white/30 uppercase tracking-widest">{s.label}</div>
               </div>
            ))}
         </div>
      </section>

      {/* Quick Visual Steps */}
      <section id="workflow" className="py-32 px-8 max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
           <h2 className="text-4xl font-black mb-4 text-white">The Audit Workflow</h2>
           <p className="text-white/40">From raw data to certified fairness in minutes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10 hidden md:block" />
          {mainSteps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-10 text-center flex flex-col items-center group relative bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                style={{ background: `linear-gradient(135deg, ${s.color}20, ${s.color}40)`, border: `1px solid ${s.color}40`, color: s.color }}>
                {s.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{s.desc}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full -z-10" />
        
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-6 tracking-tight text-white">
            Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Toolkit</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Everything you need to ensure your machine learning lifecycle is ethical, 
            transparent, and legally compliant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card p-10 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:scale-110"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                <f.icon size={28} style={{ color: f.color }} />
              </div>
              <h3 className="font-black text-xl mb-4 text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison/CTA Section */}
      <section id="compliance" className="py-32 px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[40px] overflow-hidden p-px bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-emerald-500/40"
        >
          <div className="bg-[#0a0b0f] p-20 text-center rounded-[inherit] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[30%] bg-indigo-500/10 mb-10 border border-indigo-500/20 shadow-2xl transform rotate-12">
                 <ShieldCheck className="text-indigo-400" size={48} />
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter text-white">
                Verify Your AI Integrity.
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/60">
                Join forward-thinking organizations using FairnessAudit to build trust, reduce risk, and 
                ensure their automated decisions are truly fair for everyone.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link href="/audit">
                  <button className="btn-primary text-xl px-12 py-6 shadow-2xl shadow-indigo-500/40 rounded-3xl hover:scale-105 transition-transform">
                    Launch Console Now
                  </button>
                </Link>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle size={16} /> NO CREDIT CARD REQUIRED
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Open Source Core · GSC 2026</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 text-center border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                 <Shield size={20} className="text-indigo-500" />
              </div>
              <span className="font-black text-2xl text-white">FairnessAudit</span>
            </div>
            <div className="flex items-center gap-12 text-sm font-bold text-white/40 uppercase tracking-widest">
               <a href="#" className="hover:text-white transition-colors">Safety</a>
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <p className="text-sm text-white/20 mb-2">Built with passion for the Google Solution Challenge 2026</p>
          <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">Empowering Responsible AI Worldwide</p>
        </div>
      </footer>
    </div>
  );
}

