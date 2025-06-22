import React, { createContext, useContext, useReducer } from 'react';

// 初始状态
const initialState = {
  user: null,
  theme: 'light',
  loading: false,
  error: null,
  // 数据相关状态
  marketData: {
    currentSymbol: '000001',
    currentPeriod: 'daily',
    data: [],
    loading: false,
    error: null
  },
  // 策略相关状态
  strategies: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  // 回测相关状态
  backtest: {
    current: null,
    results: [],
    loading: false,
    error: null
  }
};

// Action types
export const ActionTypes = {
  // 全局
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_THEME: 'SET_THEME',
  SET_USER: 'SET_USER',
  
  // 市场数据
  SET_MARKET_DATA_LOADING: 'SET_MARKET_DATA_LOADING',
  SET_MARKET_DATA: 'SET_MARKET_DATA',
  SET_MARKET_DATA_ERROR: 'SET_MARKET_DATA_ERROR',
  SET_CURRENT_SYMBOL: 'SET_CURRENT_SYMBOL',
  SET_CURRENT_PERIOD: 'SET_CURRENT_PERIOD',
  
  // 策略
  SET_STRATEGIES_LOADING: 'SET_STRATEGIES_LOADING',
  SET_STRATEGIES: 'SET_STRATEGIES',
  SET_STRATEGIES_ERROR: 'SET_STRATEGIES_ERROR',
  SET_CURRENT_STRATEGY: 'SET_CURRENT_STRATEGY',
  ADD_STRATEGY: 'ADD_STRATEGY',
  UPDATE_STRATEGY: 'UPDATE_STRATEGY',
  DELETE_STRATEGY: 'DELETE_STRATEGY',
  
  // 回测
  SET_BACKTEST_LOADING: 'SET_BACKTEST_LOADING',
  SET_BACKTEST_RESULTS: 'SET_BACKTEST_RESULTS',
  SET_BACKTEST_ERROR: 'SET_BACKTEST_ERROR',
  ADD_BACKTEST_RESULT: 'ADD_BACKTEST_RESULT',
  SET_CURRENT_BACKTEST: 'SET_CURRENT_BACKTEST'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // 全局
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    // 市场数据
    case ActionTypes.SET_MARKET_DATA_LOADING:
      return {
        ...state,
        marketData: { ...state.marketData, loading: action.payload }
      };
    case ActionTypes.SET_MARKET_DATA:
      return {
        ...state,
        marketData: { ...state.marketData, data: action.payload, loading: false, error: null }
      };
    case ActionTypes.SET_MARKET_DATA_ERROR:
      return {
        ...state,
        marketData: { ...state.marketData, error: action.payload, loading: false }
      };
    case ActionTypes.SET_CURRENT_SYMBOL:
      return {
        ...state,
        marketData: { ...state.marketData, currentSymbol: action.payload }
      };
    case ActionTypes.SET_CURRENT_PERIOD:
      return {
        ...state,
        marketData: { ...state.marketData, currentPeriod: action.payload }
      };
    
    // 策略
    case ActionTypes.SET_STRATEGIES_LOADING:
      return {
        ...state,
        strategies: { ...state.strategies, loading: action.payload }
      };
    case ActionTypes.SET_STRATEGIES:
      return {
        ...state,
        strategies: { ...state.strategies, list: action.payload, loading: false, error: null }
      };
    case ActionTypes.SET_STRATEGIES_ERROR:
      return {
        ...state,
        strategies: { ...state.strategies, error: action.payload, loading: false }
      };
    case ActionTypes.SET_CURRENT_STRATEGY:
      return {
        ...state,
        strategies: { ...state.strategies, current: action.payload }
      };
    case ActionTypes.ADD_STRATEGY:
      return {
        ...state,
        strategies: { ...state.strategies, list: [...state.strategies.list, action.payload] }
      };
    case ActionTypes.UPDATE_STRATEGY:
      return {
        ...state,
        strategies: {
          ...state.strategies,
          list: state.strategies.list.map(s => 
            s.id === action.payload.id ? action.payload : s
          ),
          current: action.payload
        }
      };
    case ActionTypes.DELETE_STRATEGY:
      return {
        ...state,
        strategies: {
          ...state.strategies,
          list: state.strategies.list.filter(s => s.id !== action.payload),
          current: state.strategies.current?.id === action.payload ? null : state.strategies.current
        }
      };
    
    // 回测
    case ActionTypes.SET_BACKTEST_LOADING:
      return {
        ...state,
        backtest: { ...state.backtest, loading: action.payload }
      };
    case ActionTypes.SET_BACKTEST_RESULTS:
      return {
        ...state,
        backtest: { ...state.backtest, results: action.payload, loading: false, error: null }
      };
    case ActionTypes.SET_BACKTEST_ERROR:
      return {
        ...state,
        backtest: { ...state.backtest, error: action.payload, loading: false }
      };
    case ActionTypes.ADD_BACKTEST_RESULT:
      return {
        ...state,
        backtest: { ...state.backtest, results: [...state.backtest.results, action.payload] }
      };
    case ActionTypes.SET_CURRENT_BACKTEST:
      return {
        ...state,
        backtest: { ...state.backtest, current: action.payload }
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider组件
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
