import React from 'react';
import type { StockInfo } from '@/types';

interface WatchlistProps {
  watchlist: StockInfo[];
  selectedSymbol: string;
  onSelectStock: (stock: StockInfo) => void;
}

// 基于股票代码生成确定性模拟价格数据
function getMockPrice(symbol: string) {
  const num = parseInt(symbol, 10) || 100000;
  const price = 10 + (num % 150) + (num % 99) / 100;
  const changePct = ((num % 11) - 5) / 100; // -5% to +5%
  return { price, changePct };
}

export function Watchlist({ watchlist, selectedSymbol, onSelectStock }: WatchlistProps) {
  return (
    <div className="w-[360px] h-full bg-bg-card rounded-[var(--radius-card)] flex flex-col overflow-hidden shrink-0">
      {/* 表头 */}
      <div className="flex flex-row justify-between items-center px-4 py-3 bg-bg-inset">
        <span className="font-sans text-[14px] font-semibold text-text-primary">
          自选股
        </span>
        <span className="font-sans text-[12px] text-text-tertiary">
          {watchlist.length}只
        </span>
      </div>

      {/* 列标题 */}
      <div className="flex flex-row justify-between items-center px-4 py-2">
        <span className="font-sans text-[11px] text-text-tertiary w-[100px]">名称</span>
        <span className="font-sans text-[11px] text-text-tertiary">最新价</span>
        <span className="font-sans text-[11px] text-text-tertiary">涨跌幅</span>
      </div>

      {/* 股票行 */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {watchlist.map((stock, index) => {
          const isActive = stock.symbol === selectedSymbol;
          const { price, changePct } = getMockPrice(stock.symbol);
          const isUp = changePct >= 0;
          const changeColor = isUp ? 'text-up' : 'text-down';
          const priceColor = isUp ? 'text-up' : 'text-down';
          const changeBg = isUp ? 'bg-[#EF444420]' : 'bg-[#22C55E20]';
          const bgClass = isActive
            ? 'bg-bg-inset'
            : index % 2 === 1
            ? 'bg-bg-inset/50'
            : 'bg-transparent';

          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              className={`flex flex-row justify-between items-center px-4 py-2.5 cursor-pointer hover:bg-bg-inset transition-colors relative ${bgClass}`}
            >
              {/* 选中指示条 */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
              )}

              {/* 名称和代码 */}
              <div className="flex flex-col gap-0.5 w-[100px]">
                <span className="font-sans text-[13px] font-medium text-text-primary">
                  {stock.name}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  {stock.symbol}
                </span>
              </div>

              {/* 价格 - 根据涨跌着色 */}
              <div className={`font-mono text-[13px] font-medium ${priceColor}`}>
                {price.toFixed(2)}
              </div>

              {/* 涨跌幅 - 带背景色标签 */}
              <div className={`font-mono text-[12px] font-semibold ${changeColor} ${changeBg} rounded px-2 py-1`}>
                {isUp ? '+' : ''}{(changePct * 100).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
