import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchStocks } from '@/services/api';
import type { StockInfo } from '@/types';

interface StockSearchProps {
  onSelectStock: (stock: StockInfo) => void;
}

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<StockInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedKeyword = useDebounce(keyword, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchResults() {
      if (!debouncedKeyword.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      
      try {
        const data = await searchStocks(debouncedKeyword);
        if (isMounted) {
          setResults(data.slice(0, 8)); // Max 8 results
        }
      } catch (error) {
        console.error('Failed to search stocks:', error);
        if (isMounted) {
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchResults();

    return () => {
      isMounted = false;
    };
  }, [debouncedKeyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (stock: StockInfo) => {
    onSelectStock(stock);
    setKeyword('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); }}
          onFocus={() => {
            if (keyword.trim()) setIsOpen(true);
          }}
          placeholder="搜索股票代码或名称..."
          className="bg-bg-card rounded-lg py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none border border-transparent focus:border-accent transition-colors w-[240px]"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-bg-card rounded-lg shadow-lg border border-border-default overflow-hidden z-50">
          {isLoading ? (
            <div className="px-3 py-3 text-[13px] text-text-muted text-center">
              搜索中...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col max-h-[300px] overflow-y-auto py-1">
              {results.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => { handleSelect(stock); }}
                  className="px-3 py-2 flex flex-col gap-0.5 text-left hover:bg-bg-inset transition-colors"
                  type="button"
                >
                  <span className="text-[13px] text-text-primary leading-tight">{stock.name}</span>
                  <span className="text-[11px] text-text-muted font-mono leading-tight">{stock.symbol}</span>
                </button>
              ))}
            </div>
          ) : debouncedKeyword.trim() ? (
            <div className="px-3 py-3 text-[13px] text-text-muted text-center">
              未找到相关股票
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
