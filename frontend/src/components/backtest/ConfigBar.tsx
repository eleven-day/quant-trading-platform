import { ChevronDown, Calendar, Play } from 'lucide-react';
import type { StrategyInfo } from '@/types';

interface ConfigBarProps {
  strategies: StrategyInfo[];
  selectedStrategy: string;
  onStrategyChange: (id: string) => void;
  selectedStock: { symbol: string; name: string };
  onStockChange: (stock: { symbol: string; name: string }) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  capital: number;
  onCapitalChange: (capital: number) => void;
  onRun: () => void;
  isRunning: boolean;
}

export function ConfigBar({
  strategies,
  selectedStrategy,
  onStrategyChange,
  selectedStock,
  onStockChange,
  dateRange,
  onDateRangeChange,
  capital,
  onCapitalChange,
  onRun,
  isRunning
}: ConfigBarProps) {
  return (
    <div className="flex flex-row items-center w-full px-6 py-4 gap-3">
      {/* 策略 */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-[13px]">策略</span>
        <div className="relative">
          <select 
            value={selectedStrategy}
            onChange={(e) => onStrategyChange(e.target.value)}
            className="appearance-none bg-bg-card rounded-lg py-2 pl-3 pr-8 text-white text-[13px] outline-none cursor-pointer border border-transparent hover:border-text-text-tertiary transition-colors"
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* 股票 */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-[13px]">股票</span>
        <div className="relative">
          <div className="bg-bg-card rounded-lg py-2 pl-3 pr-8 text-white text-[13px] cursor-pointer flex items-center border border-transparent hover:border-text-text-tertiary transition-colors">
            {selectedStock.symbol} {selectedStock.name}
          </div>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* 区间 */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-[13px]">区间</span>
        <div className="flex items-center bg-bg-card rounded-lg py-2 px-3 gap-2 cursor-pointer border border-transparent hover:border-text-text-tertiary transition-colors">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <span className="text-white font-mono text-[12px]">
            {dateRange.start} - {dateRange.end}
          </span>
        </div>
      </div>

      {/* 资金 */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-[13px]">资金</span>
        <div className="flex items-center bg-bg-card rounded-lg py-2 px-3 gap-2 border border-transparent hover:border-text-text-tertiary transition-colors focus-within:border-accent">
          <input 
            type="number"
            value={capital}
            onChange={(e) => onCapitalChange(Number(e.target.value))}
            className="bg-transparent text-white font-mono text-[12px] w-20 outline-none"
          />
          <span className="text-text-tertiary font-mono text-[12px]">CNY</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* 运行回测 */}
      <button 
        onClick={onRun}
        disabled={isRunning}
        className="bg-accent text-[#0A0F1C] font-semibold rounded-lg flex items-center gap-2 px-5 py-2 hover:bg-[#1CA8BD] transition-colors disabled:opacity-50"
      >
        <Play className="w-4 h-4 fill-current" />
        <span className="text-[13px]">运行回测</span>
      </button>
    </div>
  );
}
