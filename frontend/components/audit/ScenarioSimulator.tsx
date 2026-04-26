'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SlidersHorizontal, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { getScoreColor } from '@/lib/utils';

interface ScenarioSimulatorProps {
  sessionId?: string;
  sampleDatasetId?: string;
  targetColumn: string;
  sensitiveColumns: string[];
  positiveLabel?: string;
  /** Whether a prediction_probability column exists in the dataset */
  hasProbabilityColumn: boolean;
}

interface ScenarioPoint {
  threshold: number;
  fairness_score: number;
  accuracy: number;
  demographic_parity_difference: number;
  group_selection_rates: Record<string, number>;
}

export function ScenarioSimulator({
  sessionId, sampleDatasetId, targetColumn, sensitiveColumns,
  positiveLabel, hasProbabilityColumn,
}: ScenarioSimulatorProps) {
  const [threshold, setThreshold] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [curve, setCurve] = useState<ScenarioPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<ScenarioPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didFetchCurve = useRef(false);

  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const fetchPoint = useCallback(async (t: number): Promise<ScenarioPoint | null> => {
    try {
      const res = await fetch(`${BASE}/simulate-scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          sample_dataset_id: sampleDatasetId,
          target_column: targetColumn,
          sensitive_columns: sensitiveColumns,
          threshold: t,
          positive_label: positiveLabel,
        }),
      });
      if (!res.ok) { return null; }
      return await res.json();
    } catch { return null; }
  }, [BASE, sessionId, sampleDatasetId, targetColumn, sensitiveColumns, positiveLabel]);

  // Pre-compute full curve on mount
  useEffect(() => {
    if (didFetchCurve.current || !hasProbabilityColumn) return;
    didFetchCurve.current = true;

    (async () => {
      setLoading(true);
      setError(null);
      const thresholds = [
        0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9
      ];
      const results: ScenarioPoint[] = [];
      for (const t of thresholds) {
        const pt = await fetchPoint(t);
        if (pt) results.push(pt);
      }
      if (results.length === 0) {
        setError('Could not compute scenario curve. The dataset may lack a probability column.');
      }
      setCurve(results);
      const mid = results.find((p) => p.threshold === 0.5) || results[Math.floor(results.length / 2)];
      if (mid) setCurrentPoint(mid);
      setLoading(false);
    })();
  }, [fetchPoint, hasProbabilityColumn]);

  const handleSliderChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setThreshold(t);
    // Find nearest point in curve
    const nearest = curve.reduce((prev, curr) =>
      Math.abs(curr.threshold - t) < Math.abs(prev.threshold - t) ? curr : prev,
      curve[0]
    );
    if (nearest && Math.abs(nearest.threshold - t) < 0.06) {
      setCurrentPoint(nearest);
    } else {
      // Fetch on-demand for finer granularity
      const pt = await fetchPoint(t);
      if (pt) setCurrentPoint(pt);
    }
  }, [curve, fetchPoint]);

  if (!hasProbabilityColumn) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <SlidersHorizontal size={18} className="text-text-muted" />
          <h3 className="font-semibold text-text-muted">Scenario Simulator</h3>
        </div>
        <p className="text-sm text-text-muted">
          Requires a <code className="font-mono text-xs px-1 py-0.5 rounded bg-white/5">prediction_probability</code> column in your dataset.
          Use a sample dataset or include model probabilities to enable this feature.
        </p>
      </div>
    );
  }

  const chartData = curve.map((p) => ({
    threshold: p.threshold,
    'Fairness Score': p.fairness_score,
    'Accuracy (%)': +(p.accuracy * 100).toFixed(1),
  }));

  return (
    <div className="glass-card p-6 border-maroon/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-maroon/15">
          <SlidersHorizontal size={18} className="text-red" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Scenario Simulator</h3>
          <p className="text-xs text-text-muted">Adjust the decision threshold to explore fairness vs accuracy tradeoffs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <div className="w-6 h-6 border-2 border-red border-t-transparent rounded-full spinner" />
          <span className="text-sm text-text-secondary">Computing scenario curve...</span>
        </div>
      ) : error ? (
        <div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-red/10 border border-red/30 text-red-light">
          <AlertTriangle size={16} /> {error}
        </div>
      ) : (
        <>
          {/* Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Decision Threshold
              </label>
              <span className="font-mono text-lg font-bold text-red">
                {threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.01}
              value={threshold}
              onChange={handleSliderChange}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B0000 ${((threshold - 0.1) / 0.8) * 100}%, rgba(255,255,255,0.1) ${((threshold - 0.1) / 0.8) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1 text-text-muted">
              <span>More inclusive (0.1)</span>
              <span>More selective (0.9)</span>
            </div>
          </div>

          {/* Live metrics */}
          {currentPoint && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-xl text-center bg-white/5">
                <div className="text-2xl font-extrabold" style={{ color: getScoreColor(currentPoint.fairness_score) }}>
                  {currentPoint.fairness_score}
                </div>
                <div className="text-xs text-text-muted">Fairness Score</div>
              </div>
              <div className="p-3 rounded-xl text-center bg-white/5">
                <div className="text-2xl font-extrabold text-red">
                  {(currentPoint.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted">Accuracy</div>
              </div>
              <div className="p-3 rounded-xl text-center bg-white/5">
                <div className="text-2xl font-extrabold" style={{ color: currentPoint.demographic_parity_difference > 0.1 ? '#EF4444' : '#22C55E' }}>
                  {currentPoint.demographic_parity_difference.toFixed(3)}
                </div>
                <div className="text-xs text-text-muted">DP Difference</div>
              </div>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="threshold" 
                    type="number" 
                    domain={[0.1, 0.9]} 
                    tickCount={9}
                    tick={{ fill: '#A3A3A3', fontSize: 11 }} 
                    label={{ value: 'Decision Threshold', position: 'insideBottom', offset: -5, fill: '#A3A3A3', fontSize: 11 }} 
                  />
                  <YAxis tick={{ fill: '#A3A3A3', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)' }} />
                  <Legend wrapperStyle={{ color: '#A3A3A3', fontSize: 12 }} />
                  <ReferenceLine x={threshold} stroke="#8B0000" strokeDasharray="3 3" strokeWidth={2} />
                  <Line type="monotone" dataKey="Fairness Score" stroke="#22C55E" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Accuracy (%)" stroke="#EF4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Group selection rates */}
          {currentPoint && Object.keys(currentPoint.group_selection_rates).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium uppercase tracking-wider mb-2 text-text-muted">
                Group Selection Rates at threshold {threshold.toFixed(2)}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(currentPoint.group_selection_rates).map(([key, rate]) => (
                  <div key={key} className="p-2 rounded-lg text-sm bg-white/5">
                    <span className="text-text-muted">{key.split(':')[1] || key}: </span>
                    <span className="font-mono font-semibold text-maroon">
                      {(rate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
