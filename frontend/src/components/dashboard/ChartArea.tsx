import React from 'react';
import type { OHLCV } from '@/types';
import { KlineChart } from './KlineChart';

interface ChartAreaProps {
  stock: { name: string; symbol: string };
  klineData: OHLCV[];
  activeTab: 'daily' | 'weekly' | 'monthly';
  onTabChange: (tab: 'daily' | 'weekly' | 'monthly') => void;
}

export function ChartArea({ stock, klineData, activeTab, onTabChange }: ChartAreaProps) {
  // Compute price and change from the last two data points
  let currentPrice = 0;
  let prevPrice = 0;
  let changeText = '0.00 (0.00%)';
  let changeColor = 'text-text-secondary';
  let isUp = false;

  if (klineData.length > 0) {
    const last = klineData[klineData.length - 1];
    currentPrice = last.close;
    if (klineData.length > 1) {
      const prev = klineData[klineData.length - 2];
      prevPrice = prev.close;
      const changeVal = currentPrice - prevPrice;
      const changePct = (changeVal / prevPrice) * 100;
      isUp = changeVal >= 0;
      changeColor = isUp ? 'text-up' : 'text-down';
      const sign = isUp ? '+' : '';
      changeText = `${sign}${changeVal.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`;
    } else {
      // only one day of data
      const changeVal = currentPrice - last.open;
      const changePct = (changeVal / last.open) * 100;
      isUp = changeVal >= 0;
      changeColor = isUp ? 'text-up' : 'text-down';
      const sign = isUp ? '+' : '';
      changeText = `${sign}${changeVal.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`;
    }
  }

  const tabs = [
    { id: 'daily', label: '日K' },
    { id: 'weekly', label: '周K' },
    { id: 'monthly', label: '月K' },
  ] as const;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full gap-3">
      {/* Header */}
      <div className="flex flex-row justify-between items-center h-8">
        <div className="flex flex-row items-center gap-3">
          <span className="font-sans text-[20px] font-semibold text-text-primary">
            {stock.name}
          </span>
          <span className="font-mono text-[13px] text-text-tertiary">
            {stock.symbol}
          </span>
        </div>
        <div className="flex flex-row items-baseline gap-3">
          <span className={`font-mono text-[24px] font-bold ${changeColor}`}>
            {currentPrice.toFixed(2)}
          </span>
          <span className={`font-mono text-[13px] font-medium ${changeColor}`}>
            {changeText}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-row">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-1.5 rounded-t-[6px] font-sans text-[14px] transition-colors ${
                isActive
                  ? 'bg-bg-card text-accent'
                  : 'bg-transparent text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Charts container handled by KlineChart, but we give it a wrapper just in case */}
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <KlineChart data={klineData} />
      </div>
    </div>
  );
}
