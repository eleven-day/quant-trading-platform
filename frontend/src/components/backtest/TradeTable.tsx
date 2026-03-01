import type { Trade } from '@/types';

interface TradeTableProps {
  trades: Trade[];
}

export function TradeTable({ trades }: TradeTableProps) {
  return (
    <div className="bg-bg-card rounded-lg flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Header */}
      <div className="bg-bg-inset p-[12px_16px] flex justify-between items-center shrink-0">
        <h3 className="text-white text-[14px] font-semibold">交易记录</h3>
        <span className="text-text-tertiary text-[12px]">共 {trades.length} 笔交易</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-5 p-[8px_16px] border-b border-[#0F172A] shrink-0">
        <span className="text-text-tertiary text-[11px]">日期</span>
        <span className="text-text-tertiary text-[11px]">方向</span>
        <span className="text-text-tertiary text-[11px] text-right">价格</span>
        <span className="text-text-tertiary text-[11px] text-right">数量</span>
        <span className="text-text-tertiary text-[11px] text-right">盈亏</span>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto flex-1">
        {trades.map((trade, idx) => {
          const isEven = idx % 2 === 0;
          const isBuy = trade.type === 'buy';
          
          let pnlElement;
          if (trade.pnl > 0) {
            pnlElement = <span className="text-up text-right">+{trade.pnl.toFixed(2)}</span>;
          } else if (trade.pnl < 0) {
            pnlElement = <span className="text-down text-right">{trade.pnl.toFixed(2)}</span>;
          } else {
            pnlElement = <span className="text-text-tertiary text-right">—</span>;
          }

          return (
            <div 
              key={idx} 
              className={`grid grid-cols-5 p-[8px_16px] items-center ${isEven ? 'bg-[#1E293B]' : 'bg-transparent'}`}
            >
              <span className="text-white font-mono text-[12px]">{trade.date}</span>
              <span className={`font-sans text-[12px] font-medium ${isBuy ? 'text-up' : 'text-down'}`}>
                {isBuy ? '买入' : '卖出'}
              </span>
              <span className="text-white font-mono text-[12px] text-right">{trade.price.toFixed(2)}</span>
              <span className="text-white font-mono text-[12px] text-right">{trade.quantity}</span>
              <span className="font-mono text-[12px] flex justify-end">{pnlElement}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
