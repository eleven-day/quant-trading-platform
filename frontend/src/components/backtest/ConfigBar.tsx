import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Play } from 'lucide-react';
import { searchStocks } from '@/services/api';
import type { StrategyInfo, StockInfo } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

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

export function ConfigBar(props: ConfigBarProps) {
  const {
    strategies,
    selectedStrategy,
    onStrategyChange,
    selectedStock,
    onStockChange,
    dateRange,
    capital,
    onCapitalChange,
    onRun,
    isRunning
  } = props;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<StockInfo[]>([]);
  const [fetchedKeyword, setFetchedKeyword] = useState('');

  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    if (!searchOpen || debouncedSearch.length < 1) {
      return;
    }
    let cancelled = false;
    void searchStocks(debouncedSearch).then((results) => {
      if (!cancelled) {
        setSearchResults(results);
        setFetchedKeyword(debouncedSearch);
      }
    }).catch(() => {
      if (!cancelled) {
        setSearchResults([]);
        setFetchedKeyword(debouncedSearch);
      }
    });
    return () => { cancelled = true; };
  }, [debouncedSearch, searchOpen]);

  // 搜索框关闭或输入清空时，不展示结果
  const shouldShowResults = searchOpen && debouncedSearch.length >= 1;
  const displayResults = shouldShowResults ? searchResults : [];
  const searchLoading = shouldShowResults && fetchedKeyword !== debouncedSearch;

  return (
    <div className="flex flex-row flex-wrap items-center w-full px-6 py-4 gap-3">
      {/* 策略 */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-[13px]">策略</span>
        <div className="relative">
          <select 
            value={selectedStrategy}
            onChange={(e) => { onStrategyChange(e.target.value); }}
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
          {/* Closed state: clickable display */}
          {!searchOpen ? (
            <div 
              onClick={() => { setSearchOpen(true); setSearchText(''); }}
              className="bg-bg-card rounded-lg py-2 pl-3 pr-8 text-white text-[13px] cursor-pointer flex items-center border border-transparent hover:border-text-text-tertiary transition-colors"
            >
              {selectedStock.symbol} {selectedStock.name}
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          ) : (
            <>
              <input
                autoFocus
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); }}
                onBlur={() => { setTimeout(() => { setSearchOpen(false); }, 200); }}
                placeholder="搜索股票..."
                className="bg-bg-card rounded-lg py-2 pl-3 pr-8 text-white text-[13px] outline-none border border-accent transition-colors w-[180px]"
              />
              {/* Dropdown */}
              {(displayResults.length > 0 || searchLoading) && (
                <div className="absolute top-full left-0 w-full mt-1 bg-bg-card rounded-lg shadow-lg border border-border-default overflow-hidden z-50">
                  {searchLoading ? (
                    <div className="px-3 py-2 text-[12px] text-text-tertiary">搜索中...</div>
                  ) : (
                    displayResults.slice(0, 8).map((stock) => (
                      <div
                        key={stock.symbol}
                        onMouseDown={() => {
                          onStockChange(stock);
                          setSearchOpen(false);
                          setSearchText('');
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-bg-inset transition-colors"
                      >
                        <div className="text-[13px] text-text-primary">{stock.name}</div>
                        <div className="text-[11px] text-text-muted font-mono">{stock.symbol}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
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
            onChange={(e) => { onCapitalChange(Number(e.target.value)); }}
            className="bg-transparent text-white font-mono text-[12px] w-20 outline-none"
          />
          <span className="text-text-tertiary font-mono text-[12px]">CNY</span>
        </div>
      </div>

      <div className="hidden lg:block flex-1" />

      {/* 运行回测 */}
      <button 
        onClick={onRun}
        disabled={isRunning}
        className="bg-accent text-[#0A0F1C] font-semibold rounded-lg flex items-center gap-2 px-5 py-2 hover:bg-[#1CA8BD] transition-colors disabled:opacity-50 w-full lg:w-auto"
      >
        <Play className="w-4 h-4 fill-current" />
        <span className="text-[13px]">运行回测</span>
      </button>
    </div>
  );
}
