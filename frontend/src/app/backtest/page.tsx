'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConfigBar, EquityCurve, MetricCards, TradeTable } from '@/components/backtest';
import { getStrategies, runBacktest } from '@/services/api';
import type { StrategyInfo, BacktestResult, BacktestParams } from '@/types';
import { useToast } from '@/components/common';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '请求失败，请稍后重试';
}

export default function BacktestPage() {
  const { showToast } = useToast();
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('dual-ma');
  const [selectedStock, setSelectedStock] = useState({ symbol: '000001', name: '平安银行' });
  const [dateRange, setDateRange] = useState({ start: '2023-01-01', end: '2024-12-31' });
  const [capital, setCapital] = useState<number>(100000);
  
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const backtestCache = useRef(new Map<string, BacktestResult>());
  const hasAutoRun = useRef(false);

  const loadStrategies = useCallback(async () => {
    try {
      const data = await getStrategies();
      setStrategies(data);
    } catch (err) {
      showToast({
        type: 'error',
        message: getErrorMessage(err),
      });
    }
  }, [showToast]);

  const handleRunBacktest = useCallback(async () => {
    setIsRunning(true);
    try {
      const params: BacktestParams = {
        strategyId: selectedStrategy,
        symbol: selectedStock.symbol,
        startDate: dateRange.start,
        endDate: dateRange.end,
        initialCapital: capital,
      };

      const cacheKey = JSON.stringify(params);
      const cached = backtestCache.current.get(cacheKey);
      if (cached) {
        setResult(cached);
        setIsRunning(false);
        return;
      }

      const res = await runBacktest(params);
      backtestCache.current.set(cacheKey, res);
      setResult(res);
    } catch (err) {
      showToast({
        type: 'error',
        message: getErrorMessage(err),
      });
    } finally {
      setIsRunning(false);
    }
  }, [capital, dateRange, selectedStock, selectedStrategy, showToast]);

  // Initial load
  useEffect(() => {
    void loadStrategies();
  }, [loadStrategies]);

  // Auto run when strategies are loaded (once)
  useEffect(() => {
    if (strategies.length > 0 && !hasAutoRun.current) {
      hasAutoRun.current = true;
      void handleRunBacktest();
    }
  }, [strategies, handleRunBacktest]);

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-[#0A0F1C] overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      <ConfigBar
        strategies={strategies}
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedStock={selectedStock}
        onStockChange={setSelectedStock}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        capital={capital}
        onCapitalChange={setCapital}
        onRun={() => void handleRunBacktest()}
        isRunning={isRunning}
      />
      
      <div className="flex flex-col flex-1 min-h-0 gap-4 px-6 pb-6 overflow-y-auto">
        {result && !isRunning ? (
          <>
            <EquityCurve data={result.equityCurve} />
            <MetricCards result={result} />
            <TradeTable trades={result.trades} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-tertiary">
            {isRunning ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span>正在运行回测...</span>
              </div>
            ) : (
              '准备就绪'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
