'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Bot, Info, ShieldCheck, Zap, Brain } from 'lucide-react';

interface AiSummaryBoxProps {
  stepName: 'mapping' | 'analysis' | 'explain' | 'mitigation';
  contextData?: any;
}

export function AiSummaryBox({ stepName, contextData }: AiSummaryBoxProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getSummaryContent = () => {
    switch (stepName) {
      case 'mapping':
        return {
          title: "Mapping Your Data",
          icon: <Bot className="text-red" size={20} />,
          summary: "In this step, you're teaching the AI how to interpret your dataset. Correct mapping is crucial for accurate fairness detection.",
          details: [
            "Target Column: This is what you want to predict (e.g., 'Loan Approved').",
            "Sensitive Attributes: These are protected features like Age, Gender, or Race that should NOT unfairly influence the prediction.",
            "Feature Columns: The data points the model uses to make its decision."
          ]
        };
      case 'analysis':
        const score = contextData?.overall_fairness_score || 0;
        const severity = contextData?.overall_bias_severity || 'Unknown';
        return {
          title: "Bias Analysis Summary",
          icon: <ShieldCheck className="text-accent-success" size={20} />,
          summary: `Your dataset has a fairness score of ${score}/100 with ${severity} bias detected.`,
          details: [
            "Fairness Score: Higher is better. 100 means no statistical bias was found between groups.",
            "Policy Compliance: We checked your data against legal standards like the '80% Rule'.",
            "What's next: Move to Explainability to find out WHY this bias exists."
          ]
        };
      case 'explain':
        const topProxies = contextData?.proxy_features || [];
        return {
          title: "SHAP Explainability Insights",
          icon: <Brain className="text-red" size={20} />,
          summary: "We used SHAP values to look 'under the hood' of your model to see what's actually driving predictions.",
          details: [
            "Feature Importance: Shows which data points had the biggest impact on the outcome.",
            topProxies.length > 0 
              ? `Proxy Warning: Detected ${topProxies.join(', ')} as potential proxies for sensitive attributes.` 
              : "Proxy Check: No hidden proxies detected. This is good!",
            "Impact: Understanding these drivers helps identify if bias is coming from specific historical patterns."
          ]
        };
      case 'mitigation':
        const improvement = contextData?.results?.[0]?.fairness_improvement || 0;
        return {
          title: "Mitigation Strategy",
          icon: <Zap className="text-accent-warning" size={20} />,
          summary: "We applied state-of-the-art algorithms to 'unlearn' the biased patterns found in your data.",
          details: [
            `Fairness Gain: Your fairness score improved by ${(improvement * 100).toFixed(1)}%.`,
            "Trade-offs: Sometimes fixing fairness slightly reduces raw accuracy. We aim for the best balance.",
            "Best Method: The recommended algorithm is displayed below based on the fairness/accuracy trade-off."
          ]
        };
      default:
        return { title: "AI Assistant", icon: <Sparkles size={20} />, summary: "Ready to help you understand your audit.", details: [] };
    }
  };

  const content = getSummaryContent();

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border transition-all" 
      style={{ 
        background: 'rgba(139, 0, 0, 0.03)', 
        borderColor: 'rgba(139, 0, 0, 0.2)',
        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)'
      }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon/10 border border-maroon/20 shadow-inner">
            <Sparkles size={16} className="text-red" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold tracking-tight text-white/90">Page Insight</h3>
            <p className="text-[10px] uppercase tracking-widest text-red/80 font-bold">Insights Agent v1.0</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-red" /> : <ChevronDown size={18} className="text-red" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pt-0">
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0">{content.icon}</div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">{content.title}</h4>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {content.summary}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {content.details.map((detail, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-2 items-start">
                        <Info size={14} className="mt-0.5 text-red/60 flex-shrink-0" />
                        <span className="text-[11px] leading-snug text-text-muted">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
