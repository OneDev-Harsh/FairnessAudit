import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function EvaluationPage() {
  return (
    <div className="fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon/10 border border-maroon/20 mb-8">
        <Activity size={14} className="text-red"  strokeWidth={1.5}/>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red">Core Protocol</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-text-primary">Evaluation Metrics</h1>
      <p className="text-xl text-text-secondary leading-relaxed font-medium mb-12">
        The Evaluation Protocol forms the mathematical foundation of FairnessAudit. We calculate exact disparity metrics 
        between protected and unprotected groups in your dataset.
      </p>

      <div className="space-y-12">
        <section className="glass-card p-8 rounded-3xl border border-white/5">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-maroon/20 flex items-center justify-center text-red text-sm">1</span>
             Demographic Parity
          </h2>
          <p className="text-text-secondary mb-6">
            Measures whether the positive prediction rate is independent of the sensitive attribute. 
            A perfectly fair model under this metric will predict the positive outcome at the exact same rate for all groups.
          </p>
          <div className="p-6 bg-background-primary rounded-xl border border-white/5 font-mono text-sm text-red">
             P(Ŷ = 1 | A = 0) = P(Ŷ = 1 | A = 1)
          </div>
          <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-accent-success/5 border border-accent-success/10">
             <ShieldCheck className="text-accent-success shrink-0 mt-0.5" size={20}  strokeWidth={1.5}/>
             <p className="text-sm text-accent-success/80">
               <strong>When to use:</strong> Best for situations where historical bias in the training data is assumed, and you want to ensure equal representation of outcomes (e.g., hiring rates).
             </p>
          </div>
        </section>

        <section className="glass-card p-8 rounded-3xl border border-white/5">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-maroon/20 flex items-center justify-center text-red text-sm">2</span>
             Equalized Odds
          </h2>
          <p className="text-text-secondary mb-6">
            Requires that both the true positive rate (TPR) and false positive rate (FPR) are equal across all groups. 
            This ensures that the model is equally accurate for both the privileged and unprivileged classes.
          </p>
          <div className="p-6 bg-background-primary rounded-xl border border-white/5 font-mono text-sm text-red">
             P(Ŷ = 1 | Y = y, A = 0) = P(Ŷ = 1 | Y = y, A = 1), y ∈ {'{0, 1}'}
          </div>
          <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-accent-warning/5 border border-accent-warning/10">
             <AlertTriangle className="text-accent-warning shrink-0 mt-0.5" size={20}  strokeWidth={1.5}/>
             <p className="text-sm text-accent-warning/80">
               <strong>Note:</strong> Equalized Odds is harder to satisfy than Demographic Parity but often preferred when predicting an outcome tied to a ground truth (e.g., criminal recidivism).
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}
