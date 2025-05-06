import apiClient from './apiClient';
import { ApiResponse } from '../types/global';
import { 
  IndexHistoricalData, 
  IndexSpotData, 
  IndexMinuteData 
} from '../types/index';

export const getIndexHistoricalData = async (
  symbol: string,
  startDate: string,
  endDate: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<IndexHistoricalData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<IndexHistoricalData[]>>(
      `/indices/${symbol}/historical`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
          period,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching index historical data:', error);
    throw error;
  }
};

export const getIndexSpotData = async (
  category: string = '沪深重要指数'
): Promise<IndexSpotData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<IndexSpotData[]>>(
      '/indices/spot',
      {
        params: {
          category,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching index spot data:', error);
    throw error;
  }
};

export const getIndexMinuteData = async (
  symbol: string,
  period: '1' | '5' | '15' | '30' | '60' = '5',
  startDate?: string,
  endDate?: string
): Promise<IndexMinuteData[]> => {
  try {
    const params: Record<string, string> = {
      period,
    };
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await apiClient.get<ApiResponse<IndexMinuteData[]>>(
      `/indices/${symbol}/minute`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching index minute data:', error);
    throw error;
  }
};