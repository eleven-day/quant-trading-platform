import apiClient from './apiClient';
import { ApiResponse } from '../types/global';
import { 
  FuturesHistoricalData, 
  FuturesSpotData, 
  FuturesMinuteData 
} from '../types/futures';

export const getFuturesHistoricalData = async (
  symbol: string,
  startDate: string,
  endDate: string
): Promise<FuturesHistoricalData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<FuturesHistoricalData[]>>(
      `/futures/${symbol}/historical`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching futures historical data:', error);
    throw error;
  }
};

export const getFuturesSpotData = async (
  symbol: string,
  market: 'CF' | 'FF' = 'CF'
): Promise<FuturesSpotData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<FuturesSpotData[]>>(
      `/futures/${symbol}/spot`,
      {
        params: {
          market,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching futures spot data:', error);
    throw error;
  }
};

export const getFuturesMinuteData = async (
  symbol: string,
  period: '1' | '5' | '15' | '30' | '60' = '5'
): Promise<FuturesMinuteData[]> => {
  try {
    const response = await apiClient.get<ApiResponse<FuturesMinuteData[]>>(
      `/futures/${symbol}/minute`,
      {
        params: {
          period,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching futures minute data:', error);
    throw error;
  }
};