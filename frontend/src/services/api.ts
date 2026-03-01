import type {
  StockInfo,
  OHLCV,
  IndexSnapshot,
  BacktestParams,
  BacktestResult,
  StrategyInfo,
  StrategyLearnDetail
} from '@/types';

import { mockStockList } from '@/mocks/stock-list';
import { mockKlineData, mockKlineDataGzmt } from '@/mocks/kline-data';
import { mockIndexSnapshots } from '@/mocks/index-snapshot';
import { mockBacktestResult, mockStrategies } from '@/mocks/backtest-result';
import { mockLearnStrategies } from '@/mocks/learn-data';

// TODO: 阶段二替换为真实 API 调用

export async function searchStocks(keyword: string): Promise<StockInfo[]> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!keyword) return [];
  
  return mockStockList.filter(
    stock => stock.symbol.includes(keyword) || stock.name.includes(keyword)
  );
}

export async function getStockDaily(
  symbol: string,
  start: string,
  end: string
): Promise<OHLCV[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 简单模拟不同股票返回不同数据
  if (symbol === '600519') {
    return mockKlineDataGzmt.filter(k => k.date >= start && k.date <= end);
  }
  
  return mockKlineData.filter(k => k.date >= start && k.date <= end);
}

export async function getIndexSnapshot(): Promise<IndexSnapshot[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockIndexSnapshots;
}

export async function runBacktest(
  params: BacktestParams
): Promise<BacktestResult> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟回测计算时间
  return mockBacktestResult;
}

export async function getStrategies(): Promise<StrategyInfo[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockStrategies;
}

export async function getStrategyLearnList(): Promise<StrategyLearnDetail[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockLearnStrategies;
}
