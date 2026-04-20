'use client';

import { CheckCircle, Circle, Dot } from 'lucide-react';
import { AuditState } from '@/app/audit/page';

interface Step {
  id: number;
  label: string;
}

interface AuditStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (n: number) => void;
  auditState: AuditState;
}

function isStepAccessible(stepId: number, state: AuditState): boolean {
  if (stepId === 1) return true;
  if (stepId === 2) return !!(state.sessionId || state.sampleDatasetId);
  if (stepId === 3) return !!(state.targetColumn && state.sensitiveColumns.length > 0);
  if (stepId === 4) return !!state.analysisResponse;
  if (stepId === 5) return !!state.explainResponse;
  if (stepId === 6) return !!(state.analysisResponse);
  return false;
}

export function AuditStepper({ steps, currentStep, onStepClick, auditState }: AuditStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-px" style={{ background: 'var(--border-color)', zIndex: 0 }} />

        {steps.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const accessible = isStepAccessible(step.id, auditState);

          return (
            <div key={step.id} className="relative flex flex-col items-center gap-2" style={{ zIndex: 1 }}>
              <button
                onClick={() => accessible && onStepClick(step.id)}
                disabled={!accessible}
                className={`stepper-circle ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}`}
                style={{ cursor: accessible ? 'pointer' : 'default' }}
                title={step.label}
              >
                {isCompleted ? <CheckCircle size={16} /> : step.id}
              </button>
              <span
                className="text-xs font-medium hidden md:block"
                style={{ color: isActive ? 'var(--accent-primary)' : isCompleted ? 'var(--accent-success)' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
