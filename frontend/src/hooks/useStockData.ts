import { useCallback } from 'react';
import { format } from 'date-fns';
import useStockStore from '../store/stockStore';
import useAppStore from '../store/appStore';
import { 
  getStockHistoricalData, 
  getStockSpotData,
  getStockMinuteData 
} from '../services/stockService';

export function useStockData() {
  const { 
    currentSymbol, 
    setHistoricalData, 
    setSpotData, 
    setMinuteData,
    period,
    adjust
  } = useStockStore();
  
  const { setLoading, setError } = useAppStore();

  // 加载历史数据
  const fetchHistoricalData = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setLoading(true);
        const formattedStartDate = format(startDate, 'yyyyMMdd');
        const formattedEndDate = format(endDate, 'yyyyMMdd');
        
        const data = await getStockHistoricalData(
          currentSymbol,
          formattedStartDate,
          formattedEndDate,
          period,
          adjust
        );
        
        setHistoricalData(data);
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentSymbol, period, adjust, setHistoricalData, setLoading, setError]
  );

  // 加载实时行情
  const fetchSpotData = useCallback(
    async () => {
      try {
        setLoading(true);
        const data = await getStockSpotData(currentSymbol);
        setSpotData(data);
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentSymbol, setSpotData, setLoading, setError]
  );

  // 加载分钟数据
  const fetchMinuteData = useCallback(
    async (minutePeriod: '1' | '5' | '15' | '30' | '60' = '5') => {
      try {
        setLoading(true);
        const data = await getStockMinuteData(
          currentSymbol,
          minutePeriod,
          adjust === '' ? '' : adjust
        );
        
        setMinuteData(data);
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentSymbol, adjust, setMinuteData, setLoading, setError]
  );

  return {
    fetchHistoricalData,
    fetchSpotData,
    fetchMinuteData
  };
}