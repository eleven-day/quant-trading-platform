import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] bg-bg-inset/60 px-6 py-8 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-bg-card text-text-tertiary">
        {icon ?? <Inbox size={20} />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-text-primary">{title}</p>
        {description ? <p className="text-[13px] text-text-secondary">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-[#0A0F1C] transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
