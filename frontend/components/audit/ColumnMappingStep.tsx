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
            <Info size={13} style={{ color: 'var(--text-muted)', cursor: 'help' }}  strokeWidth={1.5}/>
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
      case 'binary': return '#22C55E'; // Green
      case 'numeric': return '#F59E0B'; // Amber
      case 'categorical': return '#8B0000'; // Maroon
      default: return '#737373'; // Grey
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-text-primary">
          Map Dataset Columns
        </h2>
        <p className="text-text-secondary">
          Tell FairnessAudit which columns to use for the analysis.
        </p>
      </div>

      <AiSummaryBox stepName="mapping" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Column mapping */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-text-primary">
              <Settings size={18} className="text-red"  strokeWidth={1.5}/>
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
                  <Info size={13} style={{ color: 'var(--text-muted)', cursor: 'help' }}  strokeWidth={1.5}/>
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
            <h3 className="font-semibold flex items-center gap-2 text-text-primary">
              Sensitive Attributes *
              <span className="text-xs px-2 py-0.5 rounded-full bg-red/15 text-red border border-red/30">
                Required
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Columns like sex, race, age that you want to audit for bias.
            </p>

            <div className="flex flex-wrap gap-2">
              {sensitives.map((s) => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-maroon/15 text-red border border-maroon/30">
                  {s}
                  <button onClick={() => removeSensitive(s)}><X size={12}  strokeWidth={1.5}/></button>
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
                <Plus size={16}  strokeWidth={1.5}/>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Feature columns + dataset info */}
        <div className="space-y-4">
          {/* Feature selection */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3 text-text-primary">
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
                        background: isSelected ? 'rgba(139, 0, 0, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? 'rgba(139, 0, 0, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all`}
                        style={{ borderColor: isSelected ? 'var(--maroon)' : 'var(--text-muted)', background: isSelected ? 'var(--maroon)' : 'transparent' }}>
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
              <h4 className="font-medium text-text-secondary">Dataset Summary</h4>
              {uploadResponse ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Rows</span>
                    <span className="text-text-primary">{uploadResponse.num_rows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Columns</span>
                    <span className="text-text-primary">{uploadResponse.num_cols}</span>
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
                    <span className="text-text-muted">Rows</span>
                    <span className="text-text-primary">{selectedSample.num_rows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Columns</span>
                    <span className="text-text-primary">{selectedSample.num_cols}</span>
                  </div>
                </>
              ) : null}
            </div>
          )}

      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-primary/80 backdrop-blur-lg border-t border-border-default z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
              <Settings size={14} className="text-red"  strokeWidth={1.5}/>
              <span>Configuration: {target || 'No target'} • {sensitives.length} Sensitive Attributes</span>
            </div>
            {!canProceed && (
              <p className="text-[10px] mt-1 text-red-400/80">Select target and at least one sensitive attribute.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-primary px-8 py-3 text-base flex items-center gap-2 shadow-lg shadow-maroon-glow"
              onClick={handleRun}
              disabled={!canProceed || loading}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" /> Analyzing...</>
              ) : (
                <>Analyze Fairness & Continue <ArrowRight size={18}  strokeWidth={1.5}/></>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Spacer for sticky bar */}
      <div className="h-24" />
    </div>
    </div>
  );
}
