'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, FileText, Settings, Database, Activity, GitBranch, ArrowLeft, Shield } from 'lucide-react';
import { LogoIcon } from '@/components/ui/Icons';

const sidebarLinks = [
  { href: '/docs', label: 'Overview', icon: BookOpen },
  { href: '/docs/evaluation', label: 'Evaluation Metrics', icon: Activity },
  { href: '/docs/mitigation', label: 'Bias Mitigation', icon: Settings },
  { href: '/docs/explainability', label: 'Explainability', icon: FileText },
  { href: '/docs/proxy-logic', label: 'Proxy Logic', icon: GitBranch },
  { href: '/audit', label: 'Run Audit', icon: Database },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex flex-col md:flex-row selection:bg-maroon/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-maroon/10 blur-[140px] animate-pulse" />
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-white/5 bg-background-surface/80 backdrop-blur-2xl md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Link href="/" className="flex items-center justify-center group hover:scale-105 transition-transform">
             <LogoIcon size={32} className="text-white group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          </Link>
          <div>
            <h2 className="font-black text-lg tracking-tight">FairnessAudit</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Documentation</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-maroon/10 text-red border border-maroon/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                }`}
              >
                <link.icon size={18} className={isActive ? 'text-red' : 'opacity-60'}  strokeWidth={1.5}/>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
           <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">
             <ArrowLeft size={14}  strokeWidth={1.5}/> Back to Home
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
         <div className="max-w-4xl mx-auto px-8 py-16 md:py-24">
            {children}
         </div>
      </main>
    </div>
  );
}
