import { Brain, Search, Layers } from 'lucide-react';

export default function ExplainabilityPage() {
  return (
    <div className="fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon/10 border border-maroon/20 mb-8">
        <Brain size={14} className="text-red"  strokeWidth={1.5}/>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red">Core Protocol</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Explainability (SHAP)</h1>
      <p className="text-xl text-white/50 leading-relaxed font-medium mb-12">
        Understand exactly why your model makes biased predictions. We utilize SHAP (SHapley Additive exPlanations) 
        to break down the impact of every feature on the final prediction.
      </p>

      <div className="space-y-8">
         <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
               <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                  <Layers className="text-red"  strokeWidth={1.5}/> Global Feature Importance
               </h3>
               <p className="text-white/60 mb-6">
                  Calculates the average magnitude of the SHAP values across all samples. This reveals which features 
                  are generally the most important to the model's decision-making process overall. If a sensitive attribute 
                  (or a known proxy) appears at the top of this list, the model is heavily relying on demographic data.
               </p>
            </div>
         </div>

         <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
               <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                  <Search className="text-red"  strokeWidth={1.5}/> Beeswarm Plots
               </h3>
               <p className="text-white/60 mb-6">
                  Provides a high-density visualization of how the value of each feature impacts the model output. 
                  Each dot represents a single prediction. Color indicates the feature value (e.g., age: high or low), 
                  and the horizontal axis shows the SHAP value (impact on prediction). 
               </p>
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-sm text-white/40">
                  Example: If older age (red dots) consistently pushes the SHAP value negative for a loan approval model, 
                  the model is systematically biased against older applicants.
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
