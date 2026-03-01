import type { CSSProperties } from 'react';

interface SkeletonRectProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  roundedClassName?: string;
}

function resolveSize(value: number | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

function buildStyle(width?: number | string, height?: number | string): CSSProperties {
  return {
    width: resolveSize(width),
    height: resolveSize(height),
  };
}

export function SkeletonRect({
  width = '100%',
  height = 16,
  className = '',
  roundedClassName = 'rounded-md',
}: SkeletonRectProps) {
  return (
    <div
      className={`relative overflow-hidden bg-bg-inset animate-pulse ${roundedClassName} ${className}`}
      style={buildStyle(width, height)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, lineHeight = 12, className = '' }: SkeletonTextProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonRect
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? '72%' : '100%'}
          roundedClassName="rounded"
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-bg-card rounded-[var(--radius-card)] p-5 flex flex-col gap-3 ${className}`}>
      <SkeletonRect width="45%" height={12} />
      <SkeletonRect width="70%" height={28} />
      <SkeletonRect width="35%" height={12} />
    </div>
  );
}
