'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, CheckCircle, Shield, BarChart2,
  Brain, Zap, Share2, Clock, AlertCircle
} from 'lucide-react';
import { AuditState } from '@/app/audit/page';
import { generateReport } from '@/lib/api';
import { downloadJSON, downloadBlob, getScoreColor, getScoreLabel } from '@/lib/utils';

interface ReportStepProps {
  auditState: AuditState;
}

export function ReportStep({ auditState }: ReportStepProps) {
  const [exporting, setExporting] = useState<'json' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<'json' | 'pdf' | null>(null);

  const hasAnalysis = !!auditState.analysisResponse;
  const hasExplain = !!auditState.explainResponse;
  const hasMitigation = !!auditState.mitigationResponse;

  const analysis = auditState.analysisResponse;
  const score = analysis?.overall_fairness_score ?? 0;
  const severity = analysis?.overall_bias_severity ?? 'N/A';
  const bestMethod = auditState.mitigationResponse?.best_method ?? 'N/A';

  async function handleExport(format: 'json' | 'pdf') {
    setExporting(format);
    setError(null);
    setDone(null);
    try {
      const req = {
        session_id: auditState.sessionId || auditState.sampleDatasetId,
        analysis_response: analysis as unknown as Record<string, unknown> | undefined,
        explain_response: auditState.explainResponse as unknown as Record<string, unknown> | undefined,
        mitigation_response: auditState.mitigationResponse as unknown as Record<string, unknown> | undefined,
        format,
      };

      const data = await generateReport(req);

      if (format === 'json') {
        downloadJSON(data, `fairness_audit_report_${Date.now()}.json`);
      } else {
        downloadBlob(data as Blob, `fairness_audit_report_${Date.now()}.pdf`);
      }
      setDone(format);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  }


  const sections = [
    {
      icon: BarChart2,
      label: 'Fairness Analysis',
      status: hasAnalysis,
      detail: hasAnalysis
        ? `Score: ${score}/100 · Severity: ${severity}`
        : 'Not completed',
      color: '#58a6ff',
    },
    {
      icon: Brain,
      label: 'SHAP Explainability',
      status: hasExplain,
      detail: hasExplain
        ? `${auditState.explainResponse!.top_features.length} features · ${auditState.explainResponse!.proxy_features.length} proxy warnings`
        : 'Not completed',
      color: '#a371f7',
    },
    {
      icon: Zap,
      label: 'Bias Mitigation',
      status: hasMitigation,
      detail: hasMitigation
        ? `Best method: ${bestMethod.replace('_', ' ')}`
        : 'Not completed',
      color: '#3fb950',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Audit Report
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Download a comprehensive fairness audit report for stakeholders and compliance teams.
        </p>
      </div>

      {/* Executive summary card */}
      <div className="glass-card p-6" style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Executive Summary</h3>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Fairness score */}
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-4xl font-extrabold mb-1" style={{ color: getScoreColor(score) }}>
              {score}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Fairness Score</div>
            <div className="text-xs mt-1" style={{ color: getScoreColor(score) }}>
              {getScoreLabel(score)}
            </div>
          </div>

          {/* Bias severity */}
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className={`text-4xl font-extrabold mb-1 ${severity === 'High' ? 'text-red-400' : severity === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {severity}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Bias Severity</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Overall assessment</div>
          </div>

          {/* Mitigation */}
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-xl font-bold mb-1 capitalize" style={{ color: 'var(--accent-primary)' }}>
              {hasMitigation ? bestMethod.replace('_', ' ') : 'N/A'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Best Mitigation</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Recommended method</div>
          </div>
        </div>

        {/* Top recommendations */}
        {analysis?.recommendations && (
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Top Recommendations</h4>
            <div className="space-y-2">
              {analysis.recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} style={{ color: '#10b981', marginTop: 3, flexShrink: 0 }} />
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sections included */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Report Contents</h3>
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.label} className="flex items-center gap-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: s.status ? `${s.color}20` : 'rgba(255,255,255,0.05)' }}>
                <s.icon size={16} style={{ color: s.status ? s.color : 'var(--text-muted)' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: s.status ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {s.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.detail}</div>
              </div>
              {s.status
                ? <CheckCircle size={16} style={{ color: '#10b981' }} />
                : <AlertCircle size={16} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}

          {/* Always included */}
          <div className="flex items-center gap-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <FileText size={16} style={{ color: '#10b981' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Report Metadata</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Dataset: {auditState.datasetName} · Generated: {new Date().toLocaleDateString()}
              </div>
            </div>
            <CheckCircle size={16} style={{ color: '#10b981' }} />
          </div>
        </div>
      </div>

      {/* Export buttons */}
      {error && (
        <div className="p-4 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="glass-card p-6 text-left cursor-pointer transition-all group"
          style={{ border: '1px solid rgba(99,102,241,0.25)' }}
          onClick={() => handleExport('json')}
          disabled={!!exporting || !hasAnalysis}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)' }}>
              {exporting === 'json'
                ? <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full spinner" />
                : done === 'json'
                ? <CheckCircle size={20} style={{ color: '#10b981' }} />
                : <Download size={20} style={{ color: '#6366f1' }} />}
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {done === 'json' ? 'Downloaded!' : 'Download JSON'}
              </h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Machine-readable structured report</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Complete audit data in JSON format. Perfect for integration with other tools or custom processing.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="glass-card p-6 text-left cursor-pointer transition-all"
          style={{ border: '1px solid rgba(16,185,129,0.2)' }}
          onClick={() => handleExport('pdf')}
          disabled={!!exporting || !hasAnalysis}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              {exporting === 'pdf'
                ? <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full spinner" />
                : done === 'pdf'
                ? <CheckCircle size={20} style={{ color: '#10b981' }} />
                : <FileText size={20} style={{ color: '#10b981' }} />}
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {done === 'pdf' ? 'Downloaded!' : 'Download PDF'}
              </h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Professional formatted report</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Formatted PDF report for executives, compliance teams, and stakeholders. Includes all metrics and charts.
          </p>
        </motion.button>
      </div>

      {!hasAnalysis && (
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Complete the Fairness Analysis step to enable report export.
        </p>
      )}

      {/* Metadata footer */}
      <div className="flex items-center justify-center gap-6 text-xs py-4" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          Generated: {new Date().toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Shield size={12} />
          FairnessAudit v1.0
        </div>
        <div className="flex items-center gap-1">
          <Share2 size={12} />
          Google Solution Challenge 2026
        </div>
      </div>
    </div>
  );
}
