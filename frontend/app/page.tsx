'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, BarChart3, Brain, Zap, CheckCircle,
  Scale, Eye, GitCompare, FileText, Sparkles, ChevronRight,
  UploadCloud, Settings, Search, LayoutPanelLeft, ShieldAlert, ShieldCheck
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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20" style={{ background: 'var(--accent-primary)' }}>
            <Shield size={18} color="white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>FairnessAudit</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/audit">
            <button className="btn-primary text-sm shadow-lg shadow-indigo-500/20">
              Launch Audit <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-8 text-center max-w-6xl mx-auto relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
            Responsible AI <br />
            <span className="gradient-text">Auditing Simplified.</span>
          </h1>

          <p className="text-xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            FairnessAudit detects discriminatory patterns in your AI models,
            explains the root causes using SHAP, and applies automated mitigation—all 
            in one seamless, enterprise-ready workflow.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/audit">
              <button className="btn-primary text-lg px-8 py-5 shadow-xl shadow-indigo-500/30">
                Start Full Audit <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/audit?demo=true">
              <button className="btn-secondary text-lg px-8 py-5 group">
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> Try One-Click Demo
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Quick Visual Steps */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mainSteps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 text-center flex flex-col items-center group hover:border-indigo-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                {s.icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-6xl mx-auto relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -z-10" />
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Industry-Grade <span className="gradient-text">Fairness Kit</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            A comprehensive suite of tools to ensure your machine learning models are ethical and compliant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card p-8 group hover:bg-white/[0.04]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:bg-opacity-30"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                <f.icon size={24} style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison/CTA Section */}
      <section className="py-24 px-8 max-w-5xl mx-auto">
        <div className="glass-card overflow-hidden p-1 bg-gradient-to-br from-indigo-500/20 via-transparent to-emerald-500/20">
          <div className="bg-[var(--bg-secondary)] p-12 text-center rounded-[inherit]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 mb-8 border border-indigo-500/20 shadow-xl">
               <ShieldCheck className="text-indigo-400" size={40} />
            </div>
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight">
              Ready to verify your AI?
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Join forward-thinking organizations using FairnessAudit to build trust, reduce risk, and 
              ensure their automated decisions are truly fair for everyone.
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Link href="/audit">
                <button className="btn-primary text-xl px-12 py-5 shadow-2xl shadow-indigo-500/40">
                  Launch Audit Now
                </button>
              </Link>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Free to use</span>
                <span className="text-[10px] text-white/40">GSC 2026 PROTOTYPE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 text-center border-t border-white/5" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield size={20} className="text-indigo-500" />
          <span className="font-bold text-lg text-white/90">FairnessAudit</span>
        </div>
        <p className="text-sm mb-6">Built for Google Solution Challenge 2026 · Ensuring Fairness in Automated Decisions</p>
        <div className="flex items-center justify-center gap-6 text-xs font-medium">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
