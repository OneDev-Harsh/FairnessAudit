'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ArrowRight, Info, X, Plus, ChevronDown } from 'lucide-react';
import { UploadResponse, SampleDataset, ColumnInfo } from '@/lib/api';
import { AiSummaryBox } from './AiSummaryBox';

interface ColumnMappingStepProps {
  uploadResponse?: UploadResponse;
  selectedSample?: SampleDataset;
  initialMapping: {
    targetColumn?: string;
    predictionColumn?: string;
    featureColumns: string[];
    sensitiveColumns: string[];
  };
  onDone: (mapping: {
    targetColumn: string;
    predictionColumn?: string;
    featureColumns: string[];
    sensitiveColumns: string[];
    positiveLabel?: string;
  }) => void;
  onRunAnalysis: () => void;
  loading: boolean;
}

function ColSelect({
  label, value, onChange, options, placeholder, info,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; info?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
        {info && (
          <div className="tooltip">
            <Info size={13} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
            <div className="tooltip-text">{info}</div>
          </div>
        )}
      </div>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function ColumnMappingStep({
  uploadResponse, selectedSample, initialMapping,
  onDone, onRunAnalysis, loading,
}: ColumnMappingStepProps) {
  const allCols: string[] = uploadResponse
    ? uploadResponse.columns.map((c) => c.name)
    : selectedSample
    ? [
        selectedSample.target_column,
        ...(selectedSample.prediction_column ? [selectedSample.prediction_column] : []),
        ...selectedSample.feature_columns,
        ...selectedSample.sensitive_columns,
      ]
    : [];

  const [target, setTarget] = useState(initialMapping.targetColumn || '');
  const [prediction, setPrediction] = useState(initialMapping.predictionColumn || '');
  const [sensitives, setSensitives] = useState<string[]>(initialMapping.sensitiveColumns);
  const [features, setFeatures] = useState<string[]>(initialMapping.featureColumns);
  const [positiveLabel, setPositiveLabel] = useState('');
  const [newSensitive, setNewSensitive] = useState('');

  const addSensitive = (col: string) => {
    if (col && !sensitives.includes(col)) {
      setSensitives([...sensitives, col]);
      setNewSensitive('');
    }
  };

  const removeSensitive = (col: string) => setSensitives(sensitives.filter((s) => s !== col));

  const toggleFeature = (col: string) => {
    setFeatures((prev) =>
      prev.includes(col) ? prev.filter((f) => f !== col) : [...prev, col]
    );
  };

  const canProceed = !!target && sensitives.length > 0;

  function handleRun() {
    if (!canProceed) return;
    onDone({
      targetColumn: target,
      predictionColumn: prediction || undefined,
      featureColumns: features,
      sensitiveColumns: sensitives,
      positiveLabel: positiveLabel || undefined,
    });
    onRunAnalysis();
  }

  // Column type chip
  const getTypeColor = (col: ColumnInfo) => {
    switch (col.inferred_type) {
      case 'binary': return '#10b981';
      case 'numeric': return '#3b82f6';
      case 'categorical': return '#8b5cf6';
      default: return '#6366f1';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Map Dataset Columns
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Tell FairnessAudit which columns to use for the analysis.
        </p>
      </div>

      <AiSummaryBox stepName="mapping" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Column mapping */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Settings size={18} style={{ color: '#6366f1' }} />
              Column Assignment
            </h3>

            <ColSelect
              label="Target Column *"
              value={target}
              onChange={setTarget}
              options={allCols}
              placeholder="Select target/outcome column"
              info="The ground truth outcome variable (e.g., income, recidivism)"
            />

            <ColSelect
              label="Prediction Column"
              value={prediction}
              onChange={setPrediction}
              options={['', ...allCols]}
              placeholder="Select model prediction column (optional)"
              info="Your model's predicted output. If absent, we train a baseline model."
            />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Positive Label
                </label>
                <div className="tooltip">
                  <Info size={13} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
                  <div className="tooltip-text">The label considered "positive" (e.g., &gt;50K, 1). Auto-detected if left blank.</div>
                </div>
              </div>
              <input
                className="form-select"
                placeholder="e.g., >50K, 1, Yes (auto-detected if blank)"
                value={positiveLabel}
                onChange={(e) => setPositiveLabel(e.target.value)}
              />
            </div>
          </div>

          {/* Sensitive columns */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Sensitive Attributes *
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                Required
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Columns like sex, race, age that you want to audit for bias.
            </p>

            <div className="flex flex-wrap gap-2">
              {sensitives.map((s) => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                  {s}
                  <button onClick={() => removeSensitive(s)}><X size={12} /></button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                className="form-select flex-1"
                value={newSensitive}
                onChange={(e) => setNewSensitive(e.target.value)}
              >
                <option value="">Add sensitive column...</option>
                {allCols.filter((c) => !sensitives.includes(c)).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                className="btn-secondary px-4"
                onClick={() => addSensitive(newSensitive)}
                disabled={!newSensitive}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Feature columns + dataset info */}
        <div className="space-y-4">
          {/* Feature selection */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Feature Columns ({features.length} selected)
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Select which columns to use as model features. Deselect to exclude.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {allCols
                .filter((c) => c !== target && c !== prediction && !sensitives.includes(c))
                .map((col) => {
                  const colInfo = uploadResponse?.columns.find((c) => c.name === col);
                  const isSelected = features.includes(col);
                  return (
                    <button
                      key={col}
                      onClick={() => toggleFeature(col)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all`}
                        style={{ borderColor: isSelected ? '#6366f1' : 'var(--text-muted)', background: isSelected ? '#6366f1' : 'transparent' }}>
                        {isSelected && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span className="text-sm flex-1 truncate">{col}</span>
                      {colInfo && (
                        <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: `${getTypeColor(colInfo)}20`, color: getTypeColor(colInfo) }}>
                          {colInfo.inferred_type}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Dataset summary */}
          {(uploadResponse || selectedSample) && (
            <div className="glass-card p-4 text-sm space-y-2">
              <h4 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Dataset Summary</h4>
              {uploadResponse ? (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Rows</span>
                    <span style={{ color: 'var(--text-primary)' }}>{uploadResponse.num_rows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Columns</span>
                    <span style={{ color: 'var(--text-primary)' }}>{uploadResponse.num_cols}</span>
                  </div>
                  {uploadResponse.warnings.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg text-xs"
                      style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                      {uploadResponse.warnings[0]}
                    </div>
                  )}
                </>
              ) : selectedSample ? (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Rows</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedSample.num_rows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Columns</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedSample.num_cols}</span>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Run button */}
          <button
            className="btn-primary w-full py-4 text-base justify-center"
            onClick={handleRun}
            disabled={!canProceed || loading}
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" /> Running Analysis...</>
            ) : (
              <>Analyze Fairness & Continue <ArrowRight size={18} /></>
            )}
          </button>

          {!canProceed && (
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Select a target column and at least one sensitive attribute to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
