'use client';

import { CheckCircle, Circle, Lock } from 'lucide-react';
import { AuditState } from '@/app/audit/page';
import { motion } from 'framer-motion';

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
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-10 px-4">
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--border-color)] -translate-y-1/2" style={{ zIndex: 0 }} />
        
        {/* Active progress line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          className="absolute top-1/2 left-0 h-0.5 bg-red origin-left -translate-y-1/2"
          style={{ zIndex: 0 }}
        />

        {steps.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const accessible = isStepAccessible(step.id, auditState);

          return (
            <div key={step.id} className="relative flex flex-col items-center gap-3" style={{ zIndex: 1 }}>
              <motion.button
                whileHover={accessible ? { scale: 1.1 } : {}}
                whileTap={accessible ? { scale: 0.95 } : {}}
                onClick={() => accessible && onStepClick(step.id)}
                disabled={!accessible}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                  ${isActive 
                    ? 'bg-maroon border-red text-white shadow-red-glow' 
                    : isCompleted 
                    ? 'bg-accent-success/20 border-accent-success/50 text-accent-success' 
                    : accessible 
                    ? 'bg-background-surface border-border-default text-text-secondary hover:border-maroon/50' 
                    : 'bg-background-surface border-border-default text-text-muted opacity-50'}
                `}
                style={{ cursor: accessible ? 'pointer' : 'not-allowed' }}
              >
                {isCompleted ? (
                  <CheckCircle size={18} strokeWidth={2.5} />
                ) : !accessible ? (
                  <Lock size={14} />
                ) : (
                  step.id
                )}
              </motion.button>
              
              <div className="absolute -bottom-7 whitespace-nowrap text-center">
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold transition-colors duration-300 ${
                    isActive ? 'text-red' : isCompleted ? 'text-accent-success/70' : 'text-text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
