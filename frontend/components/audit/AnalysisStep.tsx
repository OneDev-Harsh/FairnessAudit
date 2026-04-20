'use client';

import { motion } from 'framer-motion';
import {
  BarChart2, ArrowRight, AlertTriangle, CheckCircle, XCircle,
  TrendingDown, TrendingUp, Brain, RefreshCw, Info, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, Legend
} from 'recharts';
import { AnalysisResponse, FairnessMetrics, GroupMetric } from '@/lib/api';
import { formatNumber, formatPercent, getBiasColor, getScoreColor, getScoreLabel, CHART_COLORS } from '@/lib/utils';
import { AiSummaryBox } from './AiSummaryBox';
import { ScenarioSimulator } from './ScenarioSimulator';
import { MetricSkeleton, Skeleton } from '../ui/Skeleton';

interface AnalysisStepProps {
  response?: AnalysisResponse;
  loading: boolean;
  onRunAnalysis: () => void;
  onContinue: () => void;
  onRunExplain: () => void;
  auditState?: any;
}

function ScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const circumference = 2 * Math.PI * 52;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color }}>{score}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>
      <div>
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'High' ? 'badge-high' : severity === 'Medium' ? 'badge-medium' : 'badge-low';
  return (
    <span className={`${cls} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
      {severity === 'High' ? <AlertTriangle size={12} /> : severity === 'Medium' ? <TrendingDown size={12} /> : <CheckCircle size={12} />}
      {severity} Bias
    </span>
  );
}

function MetricRow({ label, value, info }: { label: string; value?: number | null; info: string }) {
  if (value === null || value === undefined) return null;
  const abs = Math.abs(value);
  const color = abs > 0.2 ? 'var(--accent-danger)' : abs > 0.1 ? 'var(--accent-warning)' : 'var(--accent-success)';
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <div className="tooltip">
          <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
          <div className="tooltip-text">{info}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(abs * 300, 100)}%`, background: color }} />
        </div>
        <span className="font-mono text-sm font-medium w-16 text-right" style={{ color }}>{formatNumber(value, 4)}</span>
      </div>
    </div>
  );
}

function GroupChart({ metrics, sensCol }: { metrics: GroupMetric[]; sensCol: string }) {
  const data = metrics.map((g) => ({
    name: g.group_value,
    'Selection Rate': +(g.selection_rate * 100).toFixed(1),
    'Accuracy': g.accuracy !== undefined && g.accuracy !== null ? +(g.accuracy * 100).toFixed(1) : null,
    'TPR': g.true_positive_rate !== undefined ? +(g.true_positive_rate * 100).toFixed(1) : null,
  }));

  return (
    <div className="chart-container">
      <h4 className="font-medium mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Group Comparison | {sensCol}
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--accent-primary)' }}
            formatter={(v: number) => [`${v}%`]}
          />
          <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 10 }} />
          <Bar name="Selection Rate" dataKey="Selection Rate" fill="var(--accent-primary)" radius={[2, 2, 0, 0]} />
          {data[0]?.Accuracy !== null && <Bar name="Accuracy" dataKey="Accuracy" fill="var(--accent-success)" radius={[2, 2, 0, 0]} />}
          {data[0]?.TPR !== null && <Bar name="True Positive Rate" dataKey="TPR" fill="var(--accent-warning)" radius={[2, 2, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function IntersectionalTable({ metrics }: { metrics: GroupMetric[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <table className="w-full text-sm text-left">
        <thead className="bg-white/5 text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
          <tr>
            <th className="px-4 py-3">Subgroup</th>
            <th className="px-4 py-3 text-right">Count</th>
            <th className="px-4 py-3 text-right">Selection Rate</th>
            {metrics[0]?.accuracy !== null && metrics[0]?.accuracy !== undefined && <th className="px-4 py-3 text-right">Accuracy</th>}
            {metrics[0]?.true_positive_rate !== null && metrics[0]?.true_positive_rate !== undefined && <th className="px-4 py-3 text-right">TPR</th>}
          </tr>
        </thead>
        <tbody>
          {metrics.map((g, i) => (
            <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{g.group_value}</td>
              <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{g.count.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--accent-primary)' }}>{(g.selection_rate * 100).toFixed(1)}%</td>
              {g.accuracy !== null && g.accuracy !== undefined && (
                <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--accent-success)' }}>{(g.accuracy * 100).toFixed(1)}%</td>
              )}
              {g.true_positive_rate !== null && g.true_positive_rate !== undefined && (
                <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--accent-warning)' }}>{(g.true_positive_rate * 100).toFixed(1)}%</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolicyCard({ compliance }: { compliance: Record<string, unknown> }) {
  const overall = compliance.overall_pass as boolean;
  const checks = compliance.checks as Record<string, Record<string, { passed: boolean; value: number; threshold: number }>>;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Policy Compliance</h3>
        <span className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${overall ? 'badge-low' : 'badge-high'}`}>
          {overall ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {overall ? 'Pass' : 'Fail'}
        </span>
      </div>
      <div className="space-y-3">
        {Object.entries(checks || {}).map(([col, colChecks]) => (
          <div key={col}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{col}</p>
            {Object.entries(colChecks).map(([metric, check]) => (
              <div key={metric} className="flex items-center gap-3 py-1.5 border-b text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {check.passed
                  ? <CheckCircle size={14} style={{ color: '#10b981' }} />
                  : <XCircle size={14} style={{ color: '#ef4444' }} />}
                <span style={{ color: 'var(--text-secondary)' }} className="flex-1">{metric.replace(/_/g, ' ')}</span>
                <span className="font-mono text-xs" style={{ color: check.passed ? '#34d399' : '#f87171' }}>
                  {formatNumber(check.value, 4)} / ≤{check.threshold}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Standard: {compliance.standard as string}</p>
    </div>
  );
}

export function AnalysisStep({ response, loading, onRunAnalysis, onContinue, onRunExplain, auditState }: AnalysisStepProps) {
  if (loading && !response) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricSkeleton />
          <div className="md:col-span-2 glass-card p-6 space-y-4">
            <Skeleton width="150px" height="1.5rem" />
            <Skeleton width="100%" height="4rem" />
            <div className="flex gap-2">
              <Skeleton width="80px" height="2rem" className="rounded-full" />
              <Skeleton width="80px" height="2rem" className="rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="chart-container h-[300px]">
            <Skeleton width="100%" height="100%" />
          </div>
          <div className="chart-container h-[300px]">
            <Skeleton width="100%" height="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <BarChart2 size={48} className="mx-auto mb-4" style={{ color: '#6366f1' }} />
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to Analyze</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Click the button below to compute fairness metrics for your dataset.
        </p>
        <button className="btn-primary text-base px-8" onClick={onRunAnalysis}>
          Run Fairness Analysis <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <AiSummaryBox stepName="analysis" contextData={response} />

      {/* Overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fairness Score */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-medium mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Overall Fairness Score
          </p>
          <ScoreGauge score={response.overall_fairness_score} />
        </div>

        {/* Severity + Explanation */}
        <div className="glass-card p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Bias Summary</h3>
            <SeverityBadge severity={response.overall_bias_severity} />
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {response.bias_explanation}
          </p>

          {response.warnings.filter(w => !w.startsWith("Proxy Alert:")).length > 0 && (
            <div className="p-3 rounded-lg text-xs mb-2"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
              ⚠️ {response.warnings.filter(w => !w.startsWith("Proxy Alert:"))[0]}
            </div>
          )}
          
          {response.warnings.filter(w => w.startsWith("Proxy Alert:")).map((w, idx) => (
            <div key={idx} className="p-3 rounded-lg text-xs mt-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              🚨 {w}
            </div>
          ))}
        </div>
        
        {/* Impact Simulator */}
        {response.impact_simulation && (
          <div className="glass-card p-6 md:col-span-3" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(239,68,68,0.05) 100%)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#f87171' }}>
              <Users size={18} /> Real-World Impact Estimation
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold" style={{ color: '#f87171' }}>
                {response.impact_simulation.estimated_affected_users.toLocaleString()}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {response.impact_simulation.impact_description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Per-sensitive metrics */}
      {response.metrics.map((m) => (
        <motion.div key={m.sensitive_column} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Sensitive Attribute: <span style={{ color: 'var(--accent-primary)' }}>{m.sensitive_column}</span>
              </h3>
              <SeverityBadge severity={m.bias_severity} />
              <div className="ml-auto text-center">
                <div className="text-2xl font-extrabold" style={{ color: getScoreColor(m.fairness_score) }}>{m.fairness_score}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>score</div>
              </div>
            </div>

            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.explanation}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Fairness Metrics
                </h4>
                <MetricRow label="Demographic Parity Difference" value={m.demographic_parity_difference}
                  info="Difference in positive prediction rates between groups. 0 = perfectly fair." />
                <MetricRow label="Demographic Parity Ratio" value={m.demographic_parity_ratio}
                  info="Ratio of min to max selection rate. 1.0 = perfectly fair (80% rule: ≥0.8)." />
                <MetricRow label="Equalized Odds Difference" value={m.equalized_odds_difference}
                  info="Max difference in TPR or FPR between groups. 0 = perfectly fair." />
                <MetricRow label="Equal Opportunity Difference" value={m.equal_opportunity_difference}
                  info="Difference in true positive rates between groups. 0 = perfectly fair." />
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Group Breakdown
                </h4>
                <div className="space-y-2">
                  {m.group_metrics.map((g) => (
                    <div key={g.group_value} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.group_value}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{g.count.toLocaleString()} rows</span>
                      </div>
                      <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span>Selection: <strong style={{ color: 'var(--accent-primary)' }}>{formatPercent(g.selection_rate)}</strong></span>
                        {g.accuracy !== null && g.accuracy !== undefined && (
                          <span>Accuracy: <strong style={{ color: 'var(--accent-success)' }}>{formatPercent(g.accuracy)}</strong></span>
                        )}
                        {g.true_positive_rate !== null && g.true_positive_rate !== undefined && (
                          <span>TPR: <strong>{formatPercent(g.true_positive_rate)}</strong></span>
                        )}
                      </div>
                      <div className="mt-2 progress-bar">
                        <div className="progress-fill" style={{ width: `${g.selection_rate * 100}%`, background: 'var(--gradient-primary)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {m.group_metrics.length > 0 && m.sensitive_column.startsWith('Intersectional') ? (
            <div className="mt-6">
              <h4 className="font-medium mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Subgroup Bias Table | {m.sensitive_column}
              </h4>
              <IntersectionalTable metrics={m.group_metrics} />
            </div>
          ) : m.group_metrics.length > 0 ? (
            <GroupChart metrics={m.group_metrics} sensCol={m.sensitive_column} />
          ) : null}
        </motion.div>
      ))}

      {/* Policy + Recommendations row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PolicyCard compliance={response.policy_compliance} />

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recommendations</h3>
          <div className="space-y-2">
            {response.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }}>{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Simulator */}
      {auditState && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ScenarioSimulator
            sessionId={auditState.sessionId}
            sampleDatasetId={auditState.sampleDatasetId}
            targetColumn={auditState.targetColumn || ''}
            sensitiveColumns={auditState.sensitiveColumns || []}
            positiveLabel={auditState.positiveLabel}
            hasProbabilityColumn={true} // Sample datasets and explicit prob columns will work
          />
        </motion.div>
      )}

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-t border-[var(--border-color)] z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Info size={14} />
            <span>Analysis results are calculated based on your current mapping.</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost" onClick={onRunAnalysis} disabled={loading}>
              <RefreshCw size={16} /> Re-run Analysis
            </button>
            <button className="btn-primary px-8" onClick={onRunExplain} disabled={loading}>
              <Brain size={18} /> Explain Bias & Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      {/* Spacer for sticky bar */}
      <div className="h-24" />
    </div>
  );
}
