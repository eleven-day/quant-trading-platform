// K线数据
export interface OHLCV {
  date: string;        // '2024-01-02'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 股票信息
export interface StockInfo {
  symbol: string;      // '000001'
  name: string;        // '平安银行'
}

// 指数快照
export interface IndexSnapshot {
  symbol: string;
  name: string;
  points: number;
  change: number;      // 涨跌幅百分比
}

// 回测参数
export interface BacktestParams {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
}

// 单笔交易
export interface Trade {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
}

// 回测结果
export interface BacktestResult {
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  tradeCount: number;
  trades: Trade[];
  equityCurve: { date: string; value: number }[];
}

// 策略信息
export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  params: Record<string, number>;
}

// 策略学习详情
export interface StrategyLearnDetail {
  id: string;
  name: string;
  shortDesc: string;
  level: '入门级' | '进阶级' | '高级';
  status: '已学' | '学习中' | '未学';
  explanation: string;
  formulas: { label: string; code: string; color: string }[];
}
