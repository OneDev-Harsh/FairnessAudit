'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { downloadComplianceCertificate } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';

interface ComplianceDashboardProps {
  complianceData: any;
}

export function ComplianceDashboard({ complianceData }: ComplianceDashboardProps) {
  if (!complianceData) return null;

  const isPass = complianceData.compliance_status === 'PASS';
  const riskLevel = complianceData.risk_level;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadComplianceCertificate(complianceData);
      downloadBlob(blob, `Fairness_Compliance_Certificate_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Failed to download certificate', error);
      alert('Failed to generate official certificate. Please check backend connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-background-elevated border border-border-default rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isPass ? 'bg-accent-success/10 text-accent-success' : 'bg-red/10 text-red'}`}>
            {isPass ? <CheckCircle2 size={24}  strokeWidth={1.5}/> : <AlertTriangle size={24}  strokeWidth={1.5}/>}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Regulatory Compliance</h3>
            <p className="text-sm text-text-secondary">Status: <span className="font-semibold">{complianceData.compliance_status}</span> | Risk Level: <span className="font-semibold">{riskLevel}</span></p>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-maroon hover:bg-red text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 shadow-md shadow-maroon-glow"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin"  strokeWidth={1.5}/> : <Download size={16}  strokeWidth={1.5}/>}
          Official Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {complianceData.frameworks.map((fw: any, idx: number) => (
          <div key={idx} className="p-4 bg-background-primary border border-border-default rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-text-secondary"  strokeWidth={1.5}/>
              <span className="font-medium text-text-primary">{fw.name}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${fw.status === 'PASS' ? 'bg-accent-success/10 text-accent-success' : 'bg-red/10 text-red'}`}>
              {fw.status}
            </span>
          </div>
        ))}
      </div>

      {complianceData.violations && complianceData.violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-text-primary mb-2">Violations</h4>
          <ul className="list-disc pl-5 text-sm text-red-light space-y-1">
            {complianceData.violations.map((v: string, idx: number) => (
              <li key={idx}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {complianceData.recommendations && complianceData.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-2">Recommendations</h4>
          <ul className="list-disc pl-5 text-sm text-text-secondary space-y-1">
            {complianceData.recommendations.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
