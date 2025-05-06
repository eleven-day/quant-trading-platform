import apiClient from './apiClient';
import { ApiResponse } from '../types/global';
import { StockHistoricalData, StockSpotData, StockMinuteData } from '../types/stock';

export const getStockHistoricalData = async (
  symbol: string,
  startDate: string,
  endDate: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  adjust: '' | 'qfq' | 'hfq' = ''
): Promise<StockHistoricalData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<StockHistoricalData[]>>(
      `/stocks/${symbol}/historical`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
          period,
          adjust,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stock historical data:', error);
    throw error;
  }
};

export const getStockSpotData = async (symbol?: string): Promise<StockSpotData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<StockSpotData[]>>(
      '/stocks/spot',
      {
        params: symbol ? { symbol } : undefined,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stock spot data:', error);
    throw error;
  }
};

export const getStockMinuteData = async (
  symbol: string,
  period: '1' | '5' | '15' | '30' | '60' = '5',
  adjust: '' | 'qfq' | 'hfq' = ''
): Promise<StockMinuteData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<StockMinuteData[]>>(
      `/stocks/${symbol}/minute`,
      {
        params: {
          period,
          adjust,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stock minute data:', error);
    throw error;
  }
};