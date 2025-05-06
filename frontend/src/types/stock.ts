// 股票历史K线数据
export interface StockHistoricalData {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
    change_pct?: number;
    turnover?: number;
    amplitude?: number;
    change?: number;
    [key: string]: any;
  }
  
  // 股票实时行情数据
  export interface StockSpotData {
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
    turnover: number;
    pe: number;
    pb: number;
    market_cap: number;
    circulating_market_cap: number;
    [key: string]: any;
  }
  
  // 股票分钟K线数据
  export interface StockMinuteData {
    datetime: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
    avg_price?: number;
    change_pct?: number;
    turnover?: number;
    [key: string]: any;
  }
  
  // K线数据通用接口
  export interface KLineData {
    time: number | string; // 用于图表的时间字段
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }