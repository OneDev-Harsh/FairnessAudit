import { Zap, GitCompare, GitMerge } from 'lucide-react';

export default function MitigationPage() {
  return (
    <div className="fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-success/10 border border-accent-success/20 mb-8">
        <Zap size={14} className="text-accent-success" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-success">Core Protocol</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-text-primary">Bias Mitigation</h1>
      <p className="text-xl text-text-secondary leading-relaxed font-medium mb-12">
        Once bias is detected, FairnessAudit offers automated remediation pipelines using state-of-the-art algorithms 
        to correct the model's behavior while attempting to preserve overall accuracy.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-accent-success/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <GitCompare size={32} className="text-accent-success mb-6" />
            <h3 className="text-2xl font-black mb-4">Correlation Remover</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
               A pre-processing technique that projects features into a subspace orthogonal to the sensitive attributes.
               This removes linear correlations between features and protected classes before training even begins.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-accent-success/50">Stage: Pre-processing</div>
         </div>

         <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-maroon/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <GitMerge size={32} className="text-red mb-6" />
            <h3 className="text-2xl font-black mb-4">Threshold Optimizer</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
               A post-processing technique that adjusts the decision boundaries (thresholds) for different sensitive groups 
               in a trained model to enforce Demographic Parity or Equalized Odds.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-maroon/50">Stage: Post-processing</div>
         </div>
      </div>
      
      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
         <h3 className="text-xl font-black mb-4">Accuracy vs. Fairness Trade-off</h3>
         <p className="text-text-secondary">
            Applying mitigation techniques usually results in a slight drop in overall model accuracy. FairnessAudit automatically 
            computes the "Cost of Fairness" by displaying a side-by-side comparison of accuracy metrics before and after mitigation, 
            allowing you to make an informed business decision.
         </p>
      </div>
    </div>
  );
}
