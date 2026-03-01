import type { BacktestResult, StrategyInfo } from '@/types';

// 回测结果模拟数据
export const mockBacktestResult: BacktestResult = {
  totalReturn: 23.5,
  maxDrawdown: -12.8,
  sharpeRatio: 1.45,
  winRate: 58.3,
  tradeCount: 24,
  trades: [
    { date: '2024-01-10', type: 'buy', price: 10.65, quantity: 1000, pnl: 0 },
    { date: '2024-01-25', type: 'sell', price: 11.20, quantity: 1000, pnl: 550 },
    { date: '2024-02-05', type: 'buy', price: 10.80, quantity: 1000, pnl: 0 },
    { date: '2024-02-18', type: 'sell', price: 11.45, quantity: 1000, pnl: 650 },
    { date: '2024-03-01', type: 'buy', price: 11.10, quantity: 1000, pnl: 0 },
    { date: '2024-03-12', type: 'sell', price: 10.95, quantity: 1000, pnl: -150 },
    { date: '2024-03-20', type: 'buy', price: 10.85, quantity: 1000, pnl: 0 },
    { date: '2024-04-02', type: 'sell', price: 11.60, quantity: 1000, pnl: 750 }
  ],
  equityCurve: Array.from({ length: 45 }, (_, i) => {
    const month = Math.floor(i / 28) + 1;
    const day = (i % 28) + 1;
    return {
      date: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      value: 100000 + i * 500 + (Math.random() * 2000 - 1000)
    };
  })
};

// 策略列表模拟数据
export const mockStrategies: StrategyInfo[] = [
  {
    id: 'dual-ma',
    name: '双均线策略',
    description: '使用短期和长期移动平均线交叉产生买卖信号的经典趋势跟随策略。',
    params: { shortPeriod: 5, longPeriod: 20 }
  },
  {
    id: 'rsi',
    name: 'RSI 策略',
    description: '利用相对强弱指数寻找超买和超卖区间的震荡反转策略。',
    params: { period: 14, overbought: 70, oversold: 30 }
  },
  {
    id: 'bollinger',
    name: '布林带策略',
    description: '基于价格突破布林带上下轨进行反向操作的均值回归策略。',
    params: { period: 20, stdDev: 2 }
  },
  {
    id: 'macd',
    name: 'MACD 策略',
    description: '利用指数平滑移动平均线差异衡量动能的趋势追踪工具。',
    params: { fast: 12, slow: 26, signal: 9 }
  }
];
