import create from 'zustand';
import { StockHistoricalData, StockSpotData, StockMinuteData } from '../types/stock';

interface StockState {
  // 历史数据
  historicalData: StockHistoricalData[];
  setHistoricalData: (data: StockHistoricalData[]) => void;
  
  // 实时行情
  spotData: StockSpotData[];
  setSpotData: (data: StockSpotData[]) => void;
  
  // 分钟数据
  minuteData: StockMinuteData[];
  setMinuteData: (data: StockMinuteData[]) => void;
  
  // 当前选中的股票
  currentSymbol: string;
  setCurrentSymbol: (symbol: string) => void;
  
  // 查询参数
  period: 'daily' | 'weekly' | 'monthly';
  setPeriod: (period: 'daily' | 'weekly' | 'monthly') => void;
  
  adjust: '' | 'qfq' | 'hfq';
  setAdjust: (adjust: '' | 'qfq' | 'hfq') => void;
  
  // 清空数据
  clearData: () => void;
}

const useStockStore = create<StockState>((set) => ({
  historicalData: [],
  setHistoricalData: (data) => set({ historicalData: data }),
  
  spotData: [],
  setSpotData: (data) => set({ spotData: data }),
  
  minuteData: [],
  setMinuteData: (data) => set({ minuteData: data }),
  
  currentSymbol: '000001',
  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
  
  period: 'daily',
  setPeriod: (period) => set({ period }),
  
  adjust: '',
  setAdjust: (adjust) => set({ adjust }),
  
  clearData: () => set({
    historicalData: [],
    spotData: [],
    minuteData: [],
  }),
}));

export default useStockStore;