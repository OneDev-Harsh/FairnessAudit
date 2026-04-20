'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div 
      className={cn("skeleton", className)} 
      style={{ width, height }}
    />
  );
}

export function MetricSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height="1.2rem" />
        <Skeleton width="2rem" height="2rem" className="rounded-full" />
      </div>
      <Skeleton width="70%" height="2.5rem" />
      <div className="space-y-2">
        <Skeleton width="100%" height="0.5rem" />
        <Skeleton width="60%" height="0.5rem" />
      </div>
    </div>
  );
}
