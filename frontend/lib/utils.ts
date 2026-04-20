import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined, decimals = 3): string {
  if (n === null || n === undefined) return 'N/A';
  return n.toFixed(decimals);
}

export function formatPercent(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'N/A';
  return `${(n * 100).toFixed(1)}%`;
}

export function getBiasColor(severity: string): string {
  switch (severity) {
    case 'High': return '#f85149';
    case 'Medium': return '#d29922';
    case 'Low': return '#238636';
    default: return '#1f6feb';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#238636';
  if (score >= 60) return '#d29922';
  return '#f85149';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 35) return 'Poor';
  return 'Critical';
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function truncate(str: string, max = 30): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export const CHART_COLORS = [
  '#1f6feb', '#238636', '#d29922', '#f85149', '#a371f7',
  '#58a6ff', '#3fb950', '#db6d28', '#f0883e', '#116329',
];
