'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Database, Sparkles, FileText, AlertCircle, CheckCircle, X, Cloud } from 'lucide-react';
import { SampleDataset, UploadResponse, uploadCSV, importCloudDataset } from '@/lib/api';

interface DatasetStepProps {
  sampleDatasets: SampleDataset[];
  onSampleSelect: (sample: SampleDataset) => void;
  onUpload: (res: UploadResponse) => void;
  isDemo: boolean;
}

export function DatasetStep({ sampleDatasets, onSampleSelect, onUpload, isDemo }: DatasetStepProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showCloudModal, setShowCloudModal] = useState(false);
  const [cloudSource, setCloudSource] = useState<'gcs' | 'bigquery'>('gcs');
  const [bucketName, setBucketName] = useState('');
  const [fileName, setFileName] = useState('');
  const [bqQuery, setBqQuery] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadCSV(file);
      onUpload(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleCloudImport = async () => {
    setUploading(true);
    setError(null);
    setShowCloudModal(false);
    try {
      const res = await importCloudDataset({
        source: cloudSource,
        bucket_name: bucketName,
        file_name: fileName,
        query: bqQuery
      });
      onUpload(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Cloud import failed. Ensure GCP is configured.');
    } finally {
      setUploading(false);
    }
  };

  const biasColors: Record<string, string> = {
    'Gender bias': '#8b5cf6',
    'Racial bias': '#ef4444',
    'Socioeconomic bias': '#f59e0b',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Choose Your Dataset
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload a CSV file or select a built-in sample dataset to get started immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload zone */}
        <div>
          <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Upload Your Dataset
          </h3>
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'opacity-60' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="flex flex-col items-center gap-4">
              {uploading ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full spinner" />
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>Processing your CSV...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Upload size={28} style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Drop your CSV here
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      or click to browse files
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><FileText size={12} /> CSV format</span>
                    <span>Max 50 MB</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <button onClick={() => setShowCloudModal(true)} disabled={uploading} className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--bg-tertiary)] hover:bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl transition-colors text-sm font-medium disabled:opacity-50">
            <Cloud size={16} className="text-blue-400" /> Import from Google Cloud
          </button>

          {error && (
            <div className="mt-3 p-3 rounded-lg flex items-center gap-2 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              CSV requirements:
            </p>
            <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li>• At least 10 rows and 2 columns</li>
              <li>• Must include a target/outcome column</li>
              <li>• Include one or more sensitive attribute columns</li>
              <li>• Optional: include a model prediction column</li>
            </ul>
          </div>
        </div>

        {/* Sample datasets */}
        <div>
          <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Built-in Sample Datasets
          </h3>
          <div className="space-y-4">
            {sampleDatasets.map((ds, i) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 cursor-pointer hover:border-indigo-500/40 transition-all group"
                onClick={() => onSampleSelect(ds)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <Database size={18} style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ds.name}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {ds.num_rows.toLocaleString()} rows · {ds.num_cols} columns
                      </p>
                    </div>
                  </div>
                  {ds.id === 'adult_income' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{ds.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {ds.bias_types.map((bt) => (
                    <span key={bt} className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${biasColors[bt] || '#6366f1'}20`,
                        color: biasColors[bt] || '#818cf8',
                        border: `1px solid ${biasColors[bt] || '#6366f1'}40`,
                      }}>
                      {bt}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Sensitive: <span style={{ color: 'var(--text-secondary)' }}>{ds.sensitive_columns.join(', ')}</span>
                  </div>
                  <button className="text-xs font-medium group-hover:translate-x-1 transition-transform"
                    style={{ color: '#6366f1' }}>
                    Select →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo hint */}
      <div className="glass-card p-4 flex items-center gap-4"
        style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
        <Sparkles size={20} style={{ color: '#34d399' }} />
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Want a quick demo?
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Click &quot;Adult Income (UCI)&quot; above to instantly load a preconfigured dataset with visible gender & racial bias.
          </p>
        </div>
        <button
          onClick={() => sampleDatasets.length > 0 && onSampleSelect(sampleDatasets.find(d => d.id === 'adult_income') || sampleDatasets[0])}
          className="btn-secondary text-sm"
        >
          Load Demo
        </button>
      </div>

      {showCloudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><Cloud className="text-blue-400"/> Google Cloud Import</h3>
              <button onClick={() => setShowCloudModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                 <button onClick={() => setCloudSource('gcs')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${cloudSource === 'gcs' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>Cloud Storage</button>
                 <button onClick={() => setCloudSource('bigquery')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${cloudSource === 'bigquery' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>BigQuery</button>
              </div>
              
              {cloudSource === 'gcs' ? (
                <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Bucket Name</label>
                     <input type="text" value={bucketName} onChange={e => setBucketName(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" placeholder="my-gcs-bucket" />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">File Name (CSV)</label>
                     <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" placeholder="data/dataset.csv" />
                   </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">SQL Query</label>
                  <textarea value={bqQuery} onChange={e => setBqQuery(e.target.value)} className="w-full h-32 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-mono text-xs leading-relaxed" placeholder="SELECT * FROM `my_project.my_dataset.my_table` LIMIT 1000" />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)] flex justify-end gap-3">
              <button onClick={() => setShowCloudModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
              <button onClick={handleCloudImport} disabled={uploading || (cloudSource === 'gcs' ? (!bucketName || !fileName) : !bqQuery)} className="px-5 py-2 text-sm font-medium bg-[var(--accent-primary)] text-white rounded-lg disabled:opacity-50 hover:bg-indigo-600 transition-colors">Import Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
