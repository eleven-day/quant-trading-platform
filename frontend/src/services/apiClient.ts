import axios, { AxiosError, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ApiError } from '../types/global';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒超时
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    // 处理API错误
    const errorMessage = error.response?.data?.detail || error.message || '服务器错误';
    
    // 不同的HTTP状态码处理
    if (error.response) {
      switch (error.response.status) {
        case 404:
          message.error(`数据未找到: ${errorMessage}`);
          break;
        case 503:
          message.error(`数据源服务不可用: ${errorMessage}`);
          break;
        case 429:
          message.error('请求频率过高，请稍后再试');
          break;
        case 400:
          message.error(`请求参数错误: ${errorMessage}`);
          break;
        default:
          message.error(`请求失败: ${errorMessage}`);
      }
    } else {
      message.error(`网络错误: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;