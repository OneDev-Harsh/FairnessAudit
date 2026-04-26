'use client';

import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, TrendingUp, TrendingDown, Minus,
  RefreshCw, CheckCircle, FileText, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { MitigationResponse, MitigationResult, FairnessMetrics } from '@/lib/api';
import { getScoreColor, formatNumber, formatPercent } from '@/lib/utils';
import { AiSummaryBox } from './AiSummaryBox';
import { Skeleton } from '../ui/Skeleton';

interface MitigationStepProps {
  response?: MitigationResponse;
  loading: boolean;
  onRunMitigation: () => void;
  onContinue: () => void;
}

function ScoreDelta({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  const improved = delta > 0;
  const color = improved ? 'var(--accent-success)' : delta < 0 ? 'var(--accent-danger)' : 'var(--text-muted)';
  const Icon = improved ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl font-extrabold" style={{ color: getScoreColor(before) }}>{before.toFixed(1)}</span>
      <Icon size={20} style={{ color }} />
      <span className="text-3xl font-extrabold" style={{ color: getScoreColor(after) }}>{after.toFixed(1)}</span>
      <span className={`text-sm font-semibold ml-1`} style={{ color }}>
        ({delta > 0 ? '+' : ''}{delta.toFixed(1)})
      </span>
    </div>
  );
}

function BeforeAfterChart({ result }: { result: MitigationResult }) {
  // Aggregate group metrics across all sensitive cols
  const beforeGroups = result.before_metrics.flatMap((m) =>
    m.group_metrics.map((g) => ({
      name: `${m.sensitive_column}:${g.group_value}`,
      before: +(g.selection_rate * 100).toFixed(1),
    }))
  );

  const afterGroups = result.after_metrics.flatMap((m) =>
    m.group_metrics.map((g) => ({
      name: `${m.sensitive_column}:${g.group_value}`,
      after: +(g.selection_rate * 100).toFixed(1),
    }))
  );

  const merged = beforeGroups.map((b, i) => ({
    name: b.name.split(':')[1] || b.name,
    Before: b.before,
    After: afterGroups[i]?.after ?? b.before,
  }));

  return (
    <div className="chart-container">
      <h4 className="font-medium mb-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Selection Rate: Before vs After
      </h4>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Fairer models show more similar rates across groups
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={merged} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: '#A3A3A3', fontSize: 12 }} />
          <YAxis tick={{ fill: '#A3A3A3', fontSize: 11 }} unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)' }}
            formatter={(v: number) => [`${v}%`]}
          />
          <Legend wrapperStyle={{ color: '#A3A3A3', fontSize: 12 }} />
          <Bar dataKey="Before" fill="#737373" radius={[4, 4, 0, 0]} />
          <Bar dataKey="After" fill="#8B0000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MitigationCard({ result, isBest }: { result: MitigationResult; isBest: boolean }) {
  const improved = result.fairness_improvement > 0;

  return (
    <div className={`glass-card p-6 relative ${isBest ? 'border-accent-success/40' : ''}`}>
      {isBest && (
        <div className="absolute -top-3 left-4">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-success text-white shadow-lg">
            ✓ Recommended
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4 mt-1">
        <div>
          <h3 className="font-semibold text-lg text-text-primary">{result.method_display_name}</h3>
          <p className="text-xs mt-1 text-text-muted">
            {result.method === 'reweighing' ? 'Pre-processing technique' : 'In-processing technique'}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${improved ? 'bg-accent-success/15 text-accent-success border border-accent-success/30' : 'bg-red/10 text-red border border-red/25'}`}>
          {improved ? <TrendingUp size={14} /> : <Minus size={14} />}
          {result.fairness_improvement > 0 ? '+' : ''}{result.fairness_improvement.toFixed(1)} pts
        </div>
      </div>

      {/* Score comparison */}
      <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Fairness Score
        </p>
        <ScoreDelta before={result.fairness_score_before} after={result.fairness_score_after} />
      </div>

      {/* Accuracy */}
      {result.accuracy_delta !== undefined && result.accuracy_delta !== null && (
        <div className="flex items-center justify-between py-2 mb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Accuracy Change</span>
          <span className="font-mono text-sm font-semibold"
            style={{ color: result.accuracy_delta >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            {result.accuracy_delta >= 0 ? '+' : ''}{(result.accuracy_delta * 100).toFixed(2)}%
          </span>
        </div>
      )}

      <p className="text-sm mb-3 text-text-secondary">{result.explanation}</p>

      <div className="p-3 rounded-lg text-sm bg-accent-brand/5 border border-accent-brand/15 text-text-secondary">
        <span className="font-medium text-text-primary">Trade-off: </span>
        {result.tradeoff_summary}
      </div>
    </div>
  );
}

export function MitigationStep({ response, loading, onRunMitigation, onContinue }: MitigationStepProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-5 space-y-3">
          <div className="flex gap-3">
            <Skeleton width="20px" height="20px" className="rounded-full" />
            <Skeleton width="150px" height="1.2rem" />
          </div>
          <Skeleton width="100%" height="2.5rem" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4 h-[400px]">
            <Skeleton width="60%" height="2rem" />
            <Skeleton width="100%" height="5rem" className="rounded-xl" />
            <Skeleton width="100%" height="150px" />
          </div>
          <div className="glass-card p-6 space-y-4 h-[400px]">
            <Skeleton width="60%" height="2rem" />
            <Skeleton width="100%" height="5rem" className="rounded-xl" />
            <Skeleton width="100%" height="150px" />
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Zap size={48} className="mx-auto mb-4 text-accent-success" />
        <h2 className="text-2xl font-bold mb-3 text-text-primary">Bias Mitigation</h2>
        <p className="mb-6 text-text-secondary">
          Apply state-of-the-art mitigation techniques and see how fairness improves.
        </p>
        <button className="btn-primary text-base px-8" onClick={onRunMitigation}>
          <Zap size={18} /> Run Mitigation
        </button>
      </div>
    );
  }

  const best = response.best_method;

  return (
    <div className="space-y-6 fade-in">
      <AiSummaryBox stepName="mitigation" contextData={response} />
      {/* Overall recommendation */}
      <div className="glass-card p-5 border-accent-success/20">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-accent-success flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1 text-text-primary">
              Mitigation Complete
            </h3>
            <p className="text-sm text-text-secondary">
              {response.overall_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Method cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {response.results.map((r) => (
          <MitigationCard key={r.method} result={r} isBest={r.method === best} />
        ))}
      </div>

      {/* Before/After chart for best method */}
      {response.results.find((r) => r.method === best) && (
        <div>
          <h3 className="font-semibold mb-3 text-text-primary">
            Best Method: Before vs After Comparison
          </h3>
          <BeforeAfterChart result={response.results.find((r) => r.method === best)!} />
        </div>
      )}

      {/* Interpretation guide */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-red" />
          <h3 className="font-semibold text-text-primary">How to Interpret These Results</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium mb-1 text-text-secondary">Fairness Score</p>
            <p className="text-text-muted">Higher is better. A score above 75 is generally acceptable for deployment.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium mb-1 text-text-secondary">Accuracy Trade-off</p>
            <p className="text-text-muted">Some accuracy loss is expected when imposing fairness constraints. This is the fairness-accuracy trade-off.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium mb-1 text-text-secondary">Selection Rate Parity</p>
            <p className="text-text-muted">After mitigation, selection rates across groups should be closer together (more similar bars).</p>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-primary/80 backdrop-blur-lg border-t border-border-default z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Zap size={14} className="text-accent-success" />
            <span>Review the fairness-accuracy trade-off for each method.</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost" onClick={onRunMitigation} disabled={loading}>
              <RefreshCw size={16} /> Re-run Mitigation
            </button>
            <button className="btn-primary px-8" onClick={onContinue} disabled={loading}>
              <FileText size={18} /> Finalize Audit & Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      {/* Spacer for sticky bar */}
      <div className="h-24" />
    </div>
  );
}
