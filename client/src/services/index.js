import api from './api';

// 数据服务API
export const dataService = {
  // 获取股票历史数据
  getStockHistory: (symbol, params = {}) => {
    return api.get(`/api/data/stock/${symbol}/history`, { params });
  },

  // 获取实时股票数据
  getStockRealtime: (symbols = []) => {
    const params = {};
    if (symbols && symbols.length > 0) {
      // 发送数组格式的参数
      params.symbols = symbols;
    }
    return api.get('/api/data/stock/realtime', { params });
  },

  // 获取指数历史数据
  getIndexHistory: (symbol = '000001', params = {}) => {
    return api.get(`/api/data/index/${symbol}/history`, { params });
  },

  // 搜索股票
  searchStocks: (keyword) => {
    return api.get('/api/data/search', { params: { keyword } });
  },

  // 数据服务健康检查
  healthCheck: () => {
    return api.get('/api/data/health');
  }
};

// 策略服务API
export const strategyService = {
  // 创建策略
  createStrategy: (strategyData) => {
    return api.post('/api/strategy/', strategyData);
  },

  // 获取策略列表
  getStrategies: (params = {}) => {
    return api.get('/api/strategy/', { params });
  },

  // 获取单个策略
  getStrategy: (strategyId) => {
    return api.get(`/api/strategy/${strategyId}`);
  },

  // 更新策略
  updateStrategy: (strategyId, strategyData) => {
    return api.put(`/api/strategy/${strategyId}`, strategyData);
  },

  // 删除策略
  deleteStrategy: (strategyId) => {
    return api.delete(`/api/strategy/${strategyId}`);
  },

  // 运行回测
  runBacktest: (backtestData) => {
    return api.post('/api/strategy/backtest', backtestData);
  },

  // 获取回测结果
  getBacktestResult: (backtestId) => {
    return api.get(`/api/strategy/backtest/${backtestId}`);
  }
};

// 文档服务API
export const docsService = {
  // 获取文档分类
  getCategories: () => {
    return api.get('/api/docs/categories');
  },

  // 获取文档列表
  getDocuments: (category = null) => {
    return api.get('/api/docs/list', { params: { category } });
  },

  // 获取文档内容
  getDocument: (docId) => {
    return api.get(`/api/docs/${docId}`);
  },

  // 搜索文档
  searchDocuments: (query) => {
    return api.get('/api/docs/search', { params: { query } });
  },

  // 获取策略模板
  getStrategyTemplates: () => {
    return api.get('/api/docs/templates/strategies');
  }
};
