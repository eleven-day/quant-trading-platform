import React from 'react';
import type { IndexSnapshot } from '@/types';

interface IndexSnapshotsProps {
  snapshots: IndexSnapshot[];
}

export function IndexSnapshots({ snapshots }: IndexSnapshotsProps) {
  return (
    <div className="flex flex-row flex-wrap gap-4 px-6 py-4 w-full">
      {snapshots.map((snapshot) => {
        const isUp = snapshot.change >= 0;
        const changeColor = isUp ? 'text-up' : 'text-down';
        const changeSign = isUp ? '+' : '';

        return (
          <div
            key={snapshot.symbol}
            className="flex-1 bg-bg-card rounded-[var(--radius-card)] flex flex-col gap-1.5 px-5 py-4"
          >
            <div className="font-sans text-[12px] font-medium text-text-secondary">
              {snapshot.name}
            </div>
            <div className="flex flex-row items-baseline gap-2">
              <span className="font-mono text-[24px] font-bold text-text-primary">
                {snapshot.points.toFixed(2)}
              </span>
              <span className={`font-mono text-[14px] font-semibold ${changeColor}`}>
                {changeSign}{snapshot.change.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
