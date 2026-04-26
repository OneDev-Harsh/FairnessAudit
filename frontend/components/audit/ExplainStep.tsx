'use client';

import { motion } from 'framer-motion';
import {
  Brain, ArrowRight, AlertTriangle, RefreshCw, Wrench
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { ExplainResponse, FeatureImportance } from '@/lib/api';
import { formatNumber, CHART_COLORS } from '@/lib/utils';
import { AiSummaryBox } from './AiSummaryBox';
import { Skeleton } from '../ui/Skeleton';

interface ExplainStepProps {
  response?: ExplainResponse;
  loading: boolean;
  onRunExplain: () => void;
  onContinue: () => void;
  onRunMitigation: () => void;
}

function ImportanceBar({ feat, maxVal }: { feat: FeatureImportance; maxVal: number }) {
  const pct = maxVal > 0 ? (feat.mean_abs_shap / maxVal) * 100 : 0;
  const color = feat.is_proxy_warning ? 'var(--accent-danger)' : 'var(--accent-primary)';

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-36 text-sm truncate flex-shrink-0 flex items-center gap-1 text-text-secondary">
        {feat.is_proxy_warning && <AlertTriangle size={12} className="text-red"  strokeWidth={1.5}/>}
        {feat.feature}
      </div>
      <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-lg flex items-center px-3"
          style={{ background: feat.is_proxy_warning ? 'var(--gradient-danger)' : 'var(--gradient-primary)' }}
        >
          <span className="text-xs font-medium text-white">{formatNumber(feat.mean_abs_shap, 4)}</span>
        </motion.div>
      </div>
      <div className="text-xs w-16 text-right font-mono text-text-muted">
        {(feat.importance * 100).toFixed(1)}%
      </div>
    </div>
  );
}

export function ExplainStep({ response, loading, onRunExplain, onContinue, onRunMitigation }: ExplainStepProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 glass-card p-6 space-y-4">
            <div className="flex gap-3">
              <Skeleton width="40px" height="40px" className="rounded-xl" />
              <div className="space-y-2">
                <Skeleton width="150px" height="1.2rem" />
                <Skeleton width="100px" height="0.8rem" />
              </div>
            </div>
            <Skeleton width="100%" height="4rem" />
          </div>
          <div className="glass-card p-5 space-y-4">
            <Skeleton width="120px" height="1.2rem" />
            <Skeleton width="100%" height="3rem" />
          </div>
        </div>
        <div className="chart-container h-[300px]">
          <Skeleton width="100%" height="100%" />
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Brain size={48} className="mx-auto mb-4 text-maroon"  strokeWidth={1.5}/>
        <h2 className="text-2xl font-bold mb-3 text-text-primary">SHAP Explainability</h2>
        <p className="mb-6 text-text-secondary">
          Understand which features drive biased predictions using SHAP values.
        </p>
        <button className="btn-primary text-base px-8" onClick={onRunExplain}>
          <Brain size={18}  strokeWidth={1.5}/> Compute SHAP Explanations
        </button>
      </div>
    );
  }

  const maxVal = Math.max(...response.top_features.map((f) => f.mean_abs_shap), 0.001);
  const chartData = response.top_features.slice(0, 10).map((f) => ({
    name: f.feature.length > 18 ? f.feature.slice(0, 16) + '…' : f.feature,
    importance: +(f.importance * 100).toFixed(2),
    is_proxy: f.is_proxy_warning,
  }));

  return (
    <div className="space-y-6 fade-in">
      <AiSummaryBox stepName="explain" contextData={response} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary card */}
        <div className="glass-card p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-maroon/15">
              <Brain size={20} className="text-maroon"  strokeWidth={1.5}/>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">SHAP Explanation</h3>
              <p className="text-xs text-text-muted">Model: {response.model_type}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">
            {response.explanation_text}
          </p>
        </div>

        {/* Proxy warnings */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3 text-text-primary">Proxy Features</h3>
          {response.proxy_features.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <span className="text-2xl mb-2">✅</span>
              <p className="text-sm text-text-secondary">No proxy features detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {response.proxy_features.map((pf) => (
                <div key={pf} className="flex items-center gap-2 p-2 rounded-lg bg-red/10 border border-red/20">
                  <AlertTriangle size={14} className="text-red"  strokeWidth={1.5}/>
                  <span className="text-sm font-medium text-red-light">{pf}</span>
                </div>
              ))}
              <p className="text-xs mt-2 text-text-muted">
                These features are highly correlated with sensitive attributes and may propagate bias.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature importance chart */}
      <div className="chart-container">
        <h3 className="font-semibold mb-4 text-text-primary">Feature Importance (SHAP)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#A3A3A3', fontSize: 11 }} unit="%" />
            <YAxis dataKey="name" type="category" tick={{ fill: '#A3A3A3', fontSize: 12 }} width={80} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)' }}
              formatter={(v: number) => [`${v.toFixed(2)}%`, 'Importance']}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.is_proxy ? '#EF4444' : CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-primary)' }} /> Normal feature
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-danger)' }} /> Proxy feature (caution)
          </div>
        </div>
      </div>

      {/* Feature bars detail */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4 text-text-primary">
          Detailed Feature Attribution
        </h3>
        <div className="space-y-1">
          {response.top_features.map((feat) => (
            <ImportanceBar key={feat.feature} feat={feat} maxVal={maxVal} />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs p-3 rounded-lg bg-maroon/5 border border-maroon/15 text-text-muted">
          <Brain size={14} className="text-red"  strokeWidth={1.5}/>
          SHAP values measure the average marginal contribution of each feature to the model output.
          Higher = more influential in driving predictions.
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-primary/80 backdrop-blur-lg border-t border-border-default z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Brain size={14} className="text-red"  strokeWidth={1.5}/>
            <span>SHAP values provide an unified measure of feature importance.</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost" onClick={onRunExplain} disabled={loading}>
              <RefreshCw size={16}  strokeWidth={1.5}/> Re-compute
            </button>
            <button className="btn-primary px-8" onClick={onRunMitigation} disabled={loading}>
              <Wrench size={18}  strokeWidth={1.5}/> Mitigation Strategy <ArrowRight size={18}  strokeWidth={1.5}/>
            </button>
          </div>
        </div>
      </div>
      {/* Spacer for sticky bar */}
      <div className="h-24" />
    </div>
  );
}
