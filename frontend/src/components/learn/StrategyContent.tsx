'use client';

import { useRouter } from 'next/navigation';
import { CircleCheck, Play } from 'lucide-react';
import type { StrategyLearnDetail } from '@/types';
import { FormulaCard } from './FormulaCard';
import { MiniChart } from './MiniChart';

export interface StrategyContentProps {
  strategy: StrategyLearnDetail | null;
}

export function StrategyContent({ strategy }: StrategyContentProps) {
  const router = useRouter();

  if (!strategy) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        请选择一个策略进行学习
      </div>
    );
  }

  return (
    <div className="flex-1 p-[24px_32px] flex flex-col gap-[24px] overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-[22px] font-bold text-white">{strategy.name}</h1>
        <div className="bg-[#22D3EE20] rounded-[6px] p-[4px_12px] flex items-center gap-[6px]">
          <CircleCheck size={14} className="text-accent" />
          <span className="text-accent text-[12px] font-medium">{strategy.level}</span>
        </div>
      </div>

      {/* Explain section */}
      <div className="flex flex-col gap-[16px]">
        <h2 className="text-[16px] font-semibold text-white">策略原理</h2>
        <p className="text-[14px] text-text-secondary leading-[1.8]">
          {strategy.explanation}
        </p>
        <FormulaCard formulas={strategy.formulas} />
      </div>

      {/* Chart section */}
      <div className="flex flex-col gap-[12px] flex-1 min-h-[300px]">
        <h2 className="text-[16px] font-semibold text-white">交互示例 — 观察均线交叉信号</h2>
        <MiniChart />
      </div>

      {/* Try button row */}
      <div className="w-full flex">
        <button
          onClick={() => router.push('/backtest')}
          className="bg-accent rounded-[8px] p-[10px_24px] flex items-center gap-[8px] transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Play size={16} color="#0A0F1C" fill="#0A0F1C" />
          <span className="text-[#0A0F1C] text-[14px] font-semibold">试一试 — 去回测</span>
        </button>
      </div>
    </div>
  );
}
