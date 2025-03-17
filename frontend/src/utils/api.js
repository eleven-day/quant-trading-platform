import axios from 'axios';

const API_BASE_URL = 'http://localhost:8002';  // 在同一域名下运行时为空

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取股票列表
export const fetchStocks = async () => {
  try {
    const response = await api.get('/api/stock/list');
    return response.data;
  } catch (error) {
    console.error('获取股票列表失败:', error);
    throw error;
  }
};

// 获取股票历史数据
export const fetchStockHistory = async (tsCode, startDate, endDate) => {
  try {
    const response = await api.get('/api/stock/history', {
      params: { ts_code: tsCode, start_date: startDate, end_date: endDate }
    });
    return response.data;
  } catch (error) {
    console.error('获取股票历史数据失败:', error);
    throw error;
  }
};

// 获取策略列表
export const fetchStrategies = async () => {
  try {
    const response = await api.get('/api/strategy/list');
    return response.data;
  } catch (error) {
    console.error('获取策略列表失败:', error);
    throw error;
  }
};

// 获取策略详情
export const fetchStrategyDetail = async (strategyId) => {
  try {
    const response = await api.get(`/api/strategy/${strategyId}`);
    return response.data;
  } catch (error) {
    console.error('获取策略详情失败:', error);
    throw error;
  }
};

// 执行回测
export const runBacktest = async (backtestParams) => {
  try {
    const response = await api.post('/api/backtest/run', backtestParams);
    return response.data;
  } catch (error) {
    console.error('执行回测失败:', error);
    throw error;
  }
};

// 获取回测结果
export const fetchBacktestResult = async (backtestId) => {
  try {
    const response = await api.get(`/api/backtest/result/${backtestId}`);
    return response.data;
  } catch (error) {
    console.error('获取回测结果失败:', error);
    throw error;
  }
};

// 获取术语表
export const fetchGlossary = async () => {
  try {
    const response = await api.get('/api/learning/glossary');
    return response.data;
  } catch (error) {
    console.error('获取术语表失败:', error);
    throw error;
  }
};

// 获取学习资源列表
export const fetchLearningResources = async () => {
  try {
    const response = await api.get('/api/learning/resources');
    return response.data;
  } catch (error) {
    console.error('获取学习资源失败:', error);
    throw error;
  }
};

// 获取仪表盘数据
export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/api/dashboard/data');
    return response.data;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    throw error;
  }
};

export default api;