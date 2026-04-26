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
    case 'High': return '#EF4444'; // Red
    case 'Medium': return '#F59E0B'; // Amber
    case 'Low': return '#22C55E'; // Green
    default: return '#737373'; // Grey
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'; // Green
  if (score >= 60) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
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
  '#8B0000', // Maroon
  '#EF4444', // Red
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#737373', // Grey
  '#A3A3A3', // Light Grey
  '#450A0A', // Deep Maroon
  '#991B1B', // Dark Red
  '#166534', // Dark Green
  '#92400E', // Dark Amber
];
