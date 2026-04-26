'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function MonitoringDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/monitoring/history`);
      if (response.ok) {
        const data = await response.json();
        // Format timestamp for display
        const formattedData = data.history.map((d: any) => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setHistory(formattedData);
      }
    } catch (e) {
      console.error("Failed to fetch monitoring history", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const latestScore = history.length > 0 ? history[history.length - 1].score : null;
  const isAlert = latestScore !== null && latestScore < 80;

  return (
    <div className="bg-background-elevated border border-border-default rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon/10 text-red shadow-sm shadow-maroon-glow/20">
            <Activity size={24}  strokeWidth={1.5}/>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Live Bias Monitoring</h3>
            <p className="text-sm text-text-secondary">Tracking model fairness over time in production.</p>
          </div>
        </div>
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-text-primary border border-white/5 rounded-lg transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}  strokeWidth={1.5}/>
          Refresh
        </button>
      </div>

      {isAlert && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-red/10 border border-red/30 text-red">
          <AlertCircle size={20} className="flex-shrink-0"  strokeWidth={1.5}/>
          <div>
            <p className="font-semibold text-sm">Alert Triggered</p>
            <p className="text-xs opacity-90">Fairness score has dropped below the 80 threshold. Check your model inputs.</p>
          </div>
        </div>
      )}

      <div className="h-64 w-full">
        {loading && history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
            Loading monitoring data...
          </div>
        ) : history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
            No monitoring data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Alert Threshold', fill: '#EF4444', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Fairness Score"
                stroke="#8B0000" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#111111', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#8B0000', stroke: '#111111' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
