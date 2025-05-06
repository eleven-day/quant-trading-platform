// 期货历史K线数据
export interface FuturesHistoricalData {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    hold?: number;     // 持仓量
    settle?: number;   // 结算价
    [key: string]: any;
  }
  
  // 期货实时行情数据
  export interface FuturesSpotData {
    symbol: string;
    time: string;
    open: number;
    high: number;
    low: number;
    price: number;
    bid: number;
    ask: number;
    open_interest: number;
    volume: number;
    avg_price: number;
    [key: string]: any;
  }
  
  // 期货分钟K线数据
  export interface FuturesMinuteData {
    datetime: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    hold?: number;     // 持仓量
    [key: string]: any;
  }