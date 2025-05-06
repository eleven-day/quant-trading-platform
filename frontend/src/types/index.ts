// 指数历史K线数据
export interface IndexHistoricalData {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
    change_pct?: number;
    change?: number;
    amplitude?: number;
    turnover?: number;
    [key: string]: any;
  }
  
  // 指数实时行情数据
  export interface IndexSpotData {
    symbol: string;
    name: string;
    price: number;
    change_pct: number;
    change: number;
    volume: number;
    amount: number;
    high: number;
    low: number;
    open: number;
    pre_close: number;
    [key: string]: any;
  }
  
  // 指数分钟K线数据
  export interface IndexMinuteData {
    datetime: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
    avg_price?: number;
    [key: string]: any;
  }