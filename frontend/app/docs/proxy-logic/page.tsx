import { GitBranch, EyeOff, ShieldAlert } from 'lucide-react';

export default function ProxyLogicPage() {
  return (
    <div className="fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon/10 border border-maroon/20 mb-8">
        <GitBranch size={14} className="text-red"  strokeWidth={1.5}/>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red">Core Protocol</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Proxy Logic</h1>
      <p className="text-xl text-white/50 leading-relaxed font-medium mb-12">
        Simply removing a sensitive attribute (like race or gender) from your dataset does not guarantee fairness. 
        Models can easily infer this information from other variables, known as proxy features.
      </p>

      <div className="glass-card p-10 rounded-3xl border border-maroon/20 bg-maroon/5 mb-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/10 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="relative z-10">
            <h2 className="text-3xl font-black mb-6 text-text-primary">Redlining & Hidden Bias</h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
               A classic example of proxy bias is "redlining" in banking. A bank might not use race to determine 
               loan eligibility, but they use ZIP codes. Because ZIP codes in many regions are highly correlated with 
               race, the ZIP code becomes a proxy for race, leading to identical discriminatory outcomes.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <EyeOff className="text-white/40 mb-4" size={28}  strokeWidth={1.5}/>
            <h3 className="text-xl font-black mb-2">Automated Detection</h3>
            <p className="text-white/60 text-sm">
               FairnessAudit automatically computes mutual information and Pearson correlation coefficients between 
               all features and the defined sensitive attribute to detect hidden proxies.
            </p>
         </div>
         
         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <ShieldAlert className="text-white/40 mb-4" size={28}  strokeWidth={1.5}/>
            <h3 className="text-xl font-black mb-2">Warning Thresholds</h3>
            <p className="text-white/60 text-sm">
               Features that show a correlation higher than 0.7 with the sensitive attribute are immediately flagged 
               in the UI, allowing engineers to remove or transform them before training.
            </p>
         </div>
      </div>
    </div>
  );
}
