import React from 'react';

export const FairnessScoreIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18" />
    <path d="M12 8l4 4-4 4" />
    <path d="M12 12H3" />
  </svg>
);

export const BiasMetricsIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M18 9l-5 5-4-4-5 5" />
    <circle cx="18" cy="9" r="2" />
    <circle cx="13" cy="14" r="2" />
    <circle cx="9" cy="10" r="2" />
  </svg>
);

export const AuditPipelineIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="9" y="15" width="6" height="6" rx="1" />
    <path d="M6 9v3a3 3 0 0 0 3 3h0" />
    <path d="M18 9v3a3 3 0 0 1-3 3h0" />
    <path d="M12 15v-1" />
  </svg>
);

export interface LogoProps {
  size?: number;
  className?: string;
  monochrome?: boolean;
}

export function LogoIcon({ size = 24, className = "", monochrome = false }: LogoProps) {
  const id = React.useId();
  const maskId = `core-cutout-${id.replace(/:/g, '')}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 10 L15.4 12 L12 14 L8.6 12 Z" fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* Left Half */}
        <path d="M11 3 L3.2 7.5 L11 12 Z" fill="currentColor" />
        <path d="M3.2 7.5 L11 12 L11 21 L3.2 16.5 Z" fill="currentColor" fillOpacity="0.4" />
        
        {/* Right Half */}
        <path d="M13 3 L20.8 7.5 L13 12 Z" fill="currentColor" />
        <path d="M13 12 L20.8 7.5 L20.8 16.5 L13 21 Z" fill="currentColor" fillOpacity="0.4" />
      </g>

      {/* Central Core (The Audit) */}
      <path 
        d="M12 10.5 L14.6 12 L12 13.5 L9.4 12 Z" 
        fill={monochrome ? 'currentColor' : '#EF4444'} 
      />
    </svg>
  );
}

export function Logo({ size = 24, className = "", monochrome = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} monochrome={monochrome} />
      <span className="font-bold tracking-tight text-current" style={{ fontSize: size * 0.85, lineHeight: 1 }}>
        FairnessAudit
      </span>
    </div>
  );
}
