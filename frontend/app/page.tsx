'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, BarChart3, Brain, Zap,
  Scale, Eye, FileText, ChevronRight,
  Database, GitCommit, Settings,
  Globe, Server, Sparkles, LayoutDashboard
} from 'lucide-react';

import { MetricsMarquee } from '@/components/landing/MetricsMarquee';

/* ─── Animation Presets ─── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-50px' },
  transition: { staggerChildren: 0.1 },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

/* ─── Data ─── */
const capabilities = [
  {
    icon: BarChart3,
    title: 'Demographic Parity',
    description: 'Measures outcome distribution across protected groups to quantify selection rate disparities.',
    className: 'md:col-span-2 lg:col-span-2'
  },
  {
    icon: Scale,
    title: 'Equalized Odds',
    description: 'Compares true positive and false positive rates across demographic groups.',
    className: 'md:col-span-1 lg:col-span-1'
  },
  {
    icon: Brain,
    title: 'SHAP Attribution',
    description: 'Identifies which input features drive model predictions using Shapley values.',
    className: 'md:col-span-1 lg:col-span-1'
  },
  {
    icon: Eye,
    title: 'Proxy Detection',
    description: 'Detects features acting as proxies for protected attributes through correlation analysis.',
    className: 'md:col-span-1 lg:col-span-1'
  },
  {
    icon: Zap,
    title: 'Bias Mitigation',
    description: 'Applies pre-processing and in-processing techniques to reduce disparities.',
    className: 'md:col-span-1 lg:col-span-1'
  },
];

const workflowSteps = [
  {
    badge: 'Phase 01',
    title: 'Data Integration',
    desc: 'Seamlessly upload your CSV or connect to established benchmark datasets. Built for large-scale tabular data.',
    image: '/1.jpg',
    icon: Database
  },
  {
    badge: 'Phase 02',
    title: 'Attribute Mapping',
    desc: 'Intelligently identify and map target variables, features, and sensitive attributes to prepare for deep fairness analysis.',
    image: '/2.jpg',
    icon: GitCommit
  },
  {
    badge: 'Phase 03',
    title: 'Bias Evaluation',
    desc: 'Quantify disparities across protected groups using industry-standard metrics like Demographic Parity and Equalized Odds.',
    image: '/3.1.jpg',
    icon: BarChart3
  },
  {
    badge: 'Phase 04',
    title: 'Scenario Simulation',
    desc: 'Explore the fairness-accuracy tradeoff dynamically by adjusting decision thresholds and observing real-time metric updates.',
    image: '/3.3.jpg',
    icon: Settings
  },
  {
    badge: 'Phase 05',
    title: 'SHAP Explainability',
    desc: 'Uncover the "why" behind model predictions. Identify exactly which features are driving biased outcomes using Shapley values.',
    image: '/4.jpg',
    icon: Brain
  },
  {
    badge: 'Phase 06',
    title: 'Algorithmic Mitigation',
    desc: 'Apply advanced pre-processing and in-processing techniques from Fairlearn to mathematically reduce bias while preserving accuracy.',
    image: '/5.jpg',
    icon: Zap
  },
  {
    badge: 'Phase 07',
    title: 'AI Consultant',
    desc: 'Interact with our context-aware assistant to interpret audit findings, explore mitigation strategies, and get actionable recommendations.',
    image: '/0.1.jpg',
    icon: Sparkles
  },
  {
    badge: 'Phase 08',
    title: 'Compliance Reporting',
    desc: 'Generate comprehensive executive summaries and detailed technical reports, fully exportable as PDFs for stakeholders.',
    image: '/6.1.jpg',
    icon: FileText
  }
];

const methodologies = [
  {
    title: 'Fairlearn Framework',
    role: 'Bias Detection & Mitigation',
    desc: 'Powered by Microsoft Research\'s open-source toolkit. We leverage its robust implementations of Demographic Parity, Equalized Odds, and advanced mitigation algorithms.',
    link: 'https://fairlearn.org',
  },
  {
    title: 'SHAP Integration',
    role: 'Model Explainability',
    desc: 'Unpacking the black box with Shapley Additive Explanations. By attributing exact contributions to each feature, auditors can pinpoint precisely where bias originates.',
    link: 'https://shap.readthedocs.io',
  },
  {
    title: 'Regulatory Compliance',
    role: 'Evaluation Standards',
    desc: 'Our evaluation metrics and reporting structures are strictly mapped to the latest requirements from the EU AI Act and the NIST AI Risk Management Framework.',
    link: null,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* ── Ambient Background Glow ── */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        <div className="absolute top-[-20%] w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10">
        {/* ══════════════════════════════════════════════
            NAVIGATION
        ══════════════════════════════════════════════ */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-20 border-b border-white/5 bg-black/50 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">FairnessAudit</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/OneDev-Harsh/FairnessAudit" target="_blank" rel="noopener noreferrer" className="hidden lg:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              GitHub
            </a>
            <Link href="/audit">
              <button className="h-10 px-5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                Run Audit <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            
            {/* Left Column - Text Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.8, ease: "easeOut"}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-lg shadow-black/50">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-xs font-semibold tracking-wide text-slate-200 uppercase">Google Solution Challenge 2026</span>
              </motion.div>
              
              <motion.h1 {...fadeUp} className="text-5xl md:text-6xl lg:text-[5rem] font-bold tracking-tighter text-white mb-8 leading-[1.1]">
                Auditing ML Systems <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                  for True Fairness
                </span>
              </motion.h1>
              
              <motion.p {...fadeUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                Quantify bias across sensitive attributes, trace predictions through SHAP explainability, 
                and apply state-of-the-art mitigation algorithms—all with compliance-ready reporting.
              </motion.p>
              
              <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/audit">
                  <button className="h-14 px-8 rounded-full bg-white text-black font-bold text-[15px] hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] w-full sm:w-auto">
                    Start Auditing <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/audit?demo=true">
                  <button className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-[15px] hover:bg-white/10 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                    View Live Demo
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Creative Illustration */}
            <motion.div initial={{opacity:0, x: 40}} animate={{opacity:1, x: 0}} transition={{delay: 0.3, duration: 1, ease: "easeOut"}} className="flex-1 w-full relative z-10 mt-10 lg:mt-0">
              {/* Decorative ambient blur behind the main image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-600/30 to-blue-500/30 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
              
              <div className="relative group" style={{ perspective: "1000px" }}>
                {/* Floating Elements / Micro-interactions */}
                <motion.div 
                  animate={{ y: [-15, 15, -15] }} 
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
                  className="absolute -top-8 -left-4 lg:-top-12 lg:-left-12 w-20 h-20 lg:w-24 lg:h-24 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-2xl flex items-center justify-center z-20 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                >
                  <BarChart3 size={36} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </motion.div>
                
                <motion.div 
                  animate={{ y: [15, -15, 15] }} 
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} 
                  className="absolute -bottom-6 -right-2 lg:-bottom-10 lg:-right-10 w-24 h-24 lg:w-28 lg:h-28 bg-black/40 border border-white/10 rounded-full backdrop-blur-2xl flex items-center justify-center z-20 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                >
                  <Scale size={42} className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                </motion.div>

                {/* Main 3D Mockup Container */}
                <motion.div 
                  whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative rounded-2xl lg:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.2)] bg-[#0a0a0a] ring-1 ring-white/5 z-10"
                >
                  {/* Browser-like Header */}
                  <div className="absolute top-0 w-full h-10 lg:h-12 bg-white/[0.03] border-b border-white/5 flex items-center px-4 gap-2 z-10 backdrop-blur-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  </div>
                  {/* The Image */}
                  <Image 
                    src="/1.jpg" 
                    alt="FairnessAudit Dashboard" 
                    width={1400} 
                    height={800} 
                    className="w-full h-auto pt-10 lg:pt-12 opacity-95 object-cover" 
                    priority 
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none mix-blend-overlay" />
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════
            METRICS MARQUEE
        ══════════════════════════════════════════════ */}
        <div className="border-y border-white/5 bg-black/40 backdrop-blur-md">
          <MetricsMarquee />
        </div>

        {/* ══════════════════════════════════════════════
            TECH STRIP
        ══════════════════════════════════════════════ */}
        <div className="border-b border-white/5 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-wrap justify-center lg:justify-between gap-x-12 gap-y-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              { k: 'Framework', v: 'Fairlearn + Scikit-Learn' },
              { k: 'Explainability', v: 'SHAP Integration' },
              { k: 'Backend', v: 'FastAPI High-Performance' },
              { k: 'Intelligence', v: 'Gemini 2.0 Flash' },
              { k: 'Compliance', v: 'EU AI Act · NIST' },
            ].map(s => (
              <div key={s.k} className="flex flex-col items-center lg:items-start gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.k}</span>
                <span className="text-sm text-slate-300 font-medium">{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CAPABILITIES BENTO GRID
        ══════════════════════════════════════════════ */}
        <section id="capabilities" className="py-32 px-6 lg:px-10 max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="mb-20 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Enterprise Capabilities</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0">
              Core analysis modules designed for evaluating, explaining, and improving model fairness at scale.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{once: true, margin: "-50px"}} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => (
              <motion.div key={i} variants={staggerItem} className={`group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden hover:border-indigo-500/30 ${c.className || ''}`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110">
                   <c.icon size={120} className="text-indigo-400" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <c.icon size={28} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{c.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm md:text-base">{c.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Callout Card */}
            <motion.div variants={staggerItem} className="md:col-span-3 lg:col-span-1 group relative p-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all duration-500 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
               <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mb-8">
                   <FileText size={28} className="text-white" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Compliance Reports</h3>
                   <p className="text-indigo-200/80 leading-relaxed text-sm md:text-base">Generates structured audit reports mapped directly to the EU AI Act and NIST AI RMF standards.</p>
                 </div>
               </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            AUDIT WORKFLOW (THE PLATFORM FLOW)
        ══════════════════════════════════════════════ */}
        <section id="workflow" className="py-32 px-6 lg:px-10 max-w-7xl mx-auto border-t border-white/5 relative">
          {/* Subtle line connecting the steps */}
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent hidden lg:block" />

          <motion.div {...fadeUp} className="text-center mb-32 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">The Audit Pipeline</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">A rigorous, end-to-end workflow that transforms raw data into a mitigated, compliance-ready model.</p>
          </motion.div>

          <div className="space-y-32 md:space-y-40 relative z-10">
            {workflowSteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24 relative`}>
                  
                  {/* Center Node for desktop */}
                  <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[#050505] hidden lg:block z-20 shadow-[0_0_15px_rgba(99,102,241,0.8)]" />

                  <motion.div {...fadeUp} className="flex-1 w-full space-y-6">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                      <span className="text-xs font-bold tracking-widest uppercase">{step.badge}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white">{step.title}</h3>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-md">{step.desc}</p>
                    <div className="flex items-center gap-3 text-indigo-400 text-sm font-semibold pt-2">
                      <step.icon size={18} />
                      <span>{step.title.split(' ')[0]} Module</span>
                    </div>
                  </motion.div>
                  
                  <motion.div initial={{opacity: 0, scale: 0.95, y: 20}} whileInView={{opacity: 1, scale: 1, y: 0}} viewport={{once:true, margin: "-100px"}} transition={{duration: 0.8, ease: "easeOut"}} className="flex-1 w-full">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/5 bg-[#0a0a0a] group ring-1 ring-white/5">
                      <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay z-10 pointer-events-none" />
                      <Image 
                        src={step.image} 
                        alt={step.title} 
                        width={1200} 
                        height={800} 
                        className="w-full h-auto object-cover transition-transform duration-[1.5s] group-hover:scale-[1.03] opacity-90 group-hover:opacity-100" 
                      />
                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            METHODOLOGY
        ══════════════════════════════════════════════ */}
        <section id="methodology" className="py-32 px-6 lg:px-10 max-w-7xl mx-auto border-t border-white/5">
          <motion.div {...fadeUp} className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Rigorous Methodology</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Built on established research in algorithmic fairness and model interpretability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {methodologies.map((m, i) => (
              <motion.div key={m.title} {...staggerItem} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">{m.role}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{m.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{m.desc}</p>
                {m.link && (
                  <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:text-indigo-400 inline-flex items-center gap-2 transition-colors">
                    Read Documentation <ArrowRight size={14} />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════ */}
        <section className="py-32 px-6 lg:px-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-indigo-950/20 z-0" />
          
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center relative z-10 bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 md:p-20 backdrop-blur-xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to ensure fairness?
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
              Upload a dataset or run the built-in demo to see a full fairness audit in action. No account required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/audit">
                <button className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[15px] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-2">
                  Run an Audit <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/docs">
                <button className="h-14 px-8 rounded-full bg-transparent border border-white/20 text-white font-semibold text-[15px] hover:bg-white/10 transition-colors">
                  Explore Documentation
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer className="border-t border-white/5 bg-[#000000] pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Shield size={16} className="text-white" />
                  </div>
                  <span className="font-bold text-white text-lg tracking-tight">FairnessAudit</span>
                </div>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                  An open-source platform for auditing machine learning models against fairness criteria. 
                  Built for the Google Solution Challenge 2026.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Platform</h4>
                <div className="space-y-4 text-sm font-medium text-slate-400">
                  <Link href="/audit" className="block hover:text-white transition-colors">Run Audit</Link>
                  <Link href="/docs" className="block hover:text-white transition-colors">Documentation</Link>
                  <Link href="/status" className="block hover:text-white transition-colors">System Status</Link>
                  <Link href="/contact" className="block hover:text-white transition-colors">Contact</Link>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Ecosystem</h4>
                <div className="space-y-4 text-sm font-medium text-slate-400">
                  <a href="https://github.com/OneDev-Harsh/FairnessAudit" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">GitHub</a>
                  <a href="https://fairlearn.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Fairlearn</a>
                  <a href="https://shap.readthedocs.io" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">SHAP</a>
                  <a href="https://developers.google.com/community/gdsc-solution-challenge" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">GSC 2026</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
              <div className="text-xs font-medium text-slate-500">
                © 2026 FairnessAudit · Open Source
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Globe size={14} /> v2.0
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <Server size={14} /> All systems operational
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

