import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio
import functools


class BacktestService:
    """回测服务类"""
    
    def __init__(self):
        self.commission_rate = 0.0003  # 手续费率
        self.slippage = 0.0001        # 滑点
    
    async def run_backtest(
        self,
        strategy_code: str,
        market_data: List[Dict[str, Any]],
        initial_capital: float = 100000.0,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        运行回测
        
        Args:
            strategy_code: 策略代码
            market_data: 市场数据
            initial_capital: 初始资金
            parameters: 策略参数
        """
        try:
            # 转换数据为DataFrame
            df = pd.DataFrame(market_data)
            if df.empty:
                return {"error": "No market data provided"}
            
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date').reset_index(drop=True)
            
            # 初始化回测环境
            portfolio = {
                'cash': initial_capital,
                'positions': {},
                'equity_curve': [],
                'trades': []
            }
            
            # 执行策略 - 这里是简化版本，实际应该有更安全的代码执行环境
            signals = await self._execute_strategy(strategy_code, df, parameters or {})
            
            # 处理交易信号
            for i, row in df.iterrows():
                current_date = row['date']
                current_price = row['close']
                
                # 更新持仓价值
                total_value = portfolio['cash']
                for symbol, quantity in portfolio['positions'].items():
                    total_value += quantity * current_price
                
                portfolio['equity_curve'].append({
                    'date': current_date,
                    'value': total_value,
                    'cash': portfolio['cash'],
                    'positions_value': total_value - portfolio['cash']
                })
                
                # 检查是否有交易信号
                if i < len(signals) and signals[i] != 0:
                    signal = signals[i]
                    symbol = row.get('symbol', 'DEFAULT')
                    
                    if signal > 0:  # 买入信号
                        self._execute_buy(portfolio, symbol, current_price, signal, current_date)
                    elif signal < 0:  # 卖出信号
                        self._execute_sell(portfolio, symbol, current_price, abs(signal), current_date)
            
            # 计算绩效指标
            performance = self._calculate_performance(portfolio, initial_capital)
            
            return {
                "success": True,
                "performance": performance,
                "equity_curve": portfolio['equity_curve'],
                "trades": portfolio['trades']
            }
            
        except Exception as e:
            return {"error": f"Backtest failed: {str(e)}"}
    
    async def _execute_strategy(
        self, 
        strategy_code: str, 
        data: pd.DataFrame, 
        parameters: Dict[str, Any]
    ) -> List[float]:
        """执行策略代码并返回交易信号"""
        try:
            # 这里是简化的策略执行示例
            # 实际应用中需要更安全的代码执行环境
            
            # 默认的移动平均策略示例
            short_window = parameters.get('short_window', 5)
            long_window = parameters.get('long_window', 20)
            
            # 计算移动平均线
            data['ma_short'] = data['close'].rolling(window=short_window).mean()
            data['ma_long'] = data['close'].rolling(window=long_window).mean()
            
            # 生成交易信号
            signals = []
            for i in range(len(data)):
                if i < long_window:
                    signals.append(0)  # 没有足够数据
                    continue
                
                ma_short = data.iloc[i]['ma_short']
                ma_long = data.iloc[i]['ma_long']
                
                if pd.isna(ma_short) or pd.isna(ma_long):
                    signals.append(0)
                    continue
                
                # 金叉买入，死叉卖出
                if ma_short > ma_long and (i == 0 or data.iloc[i-1]['ma_short'] <= data.iloc[i-1]['ma_long']):
                    signals.append(1)  # 买入信号
                elif ma_short < ma_long and (i == 0 or data.iloc[i-1]['ma_short'] >= data.iloc[i-1]['ma_long']):
                    signals.append(-1)  # 卖出信号
                else:
                    signals.append(0)  # 无信号
            
            return signals
            
        except Exception as e:
            # 如果策略执行失败，返回全零信号
            return [0] * len(data)
    
    def _execute_buy(self, portfolio: Dict, symbol: str, price: float, signal: float, date: datetime):
        """执行买入操作"""
        # 计算买入数量（使用可用资金的比例）
        buy_value = portfolio['cash'] * 0.9  # 使用90%的现金
        quantity = int(buy_value / (price * (1 + self.commission_rate + self.slippage)))
        
        if quantity > 0:
            cost = quantity * price * (1 + self.commission_rate + self.slippage)
            
            if cost <= portfolio['cash']:
                portfolio['cash'] -= cost
                portfolio['positions'][symbol] = portfolio['positions'].get(symbol, 0) + quantity
                
                portfolio['trades'].append({
                    'date': date,
                    'symbol': symbol,
                    'action': 'BUY',
                    'quantity': quantity,
                    'price': price,
                    'cost': cost
                })
    
    def _execute_sell(self, portfolio: Dict, symbol: str, price: float, signal: float, date: datetime):
        """执行卖出操作"""
        if symbol in portfolio['positions'] and portfolio['positions'][symbol] > 0:
            quantity = portfolio['positions'][symbol]
            revenue = quantity * price * (1 - self.commission_rate - self.slippage)
            
            portfolio['cash'] += revenue
            portfolio['positions'][symbol] = 0
            
            portfolio['trades'].append({
                'date': date,
                'symbol': symbol,
                'action': 'SELL',
                'quantity': quantity,
                'price': price,
                'revenue': revenue
            })
    
    def _calculate_performance(self, portfolio: Dict, initial_capital: float) -> Dict[str, Any]:
        """计算绩效指标"""
        equity_curve = portfolio['equity_curve']
        if not equity_curve:
            return {}
        
        # 提取净值序列
        values = [point['value'] for point in equity_curve]
        dates = [point['date'] for point in equity_curve]
        
        if len(values) < 2:
            return {}
        
        # 计算收益率序列
        returns = np.diff(values) / values[:-1]
        
        # 计算绩效指标
        final_value = values[-1]
        total_return = (final_value - initial_capital) / initial_capital
        
        # 年化收益率
        days = (dates[-1] - dates[0]).days
        annual_return = (final_value / initial_capital) ** (365 / days) - 1 if days > 0 else 0
        
        # 夏普比率（假设无风险利率为3%）
        risk_free_rate = 0.03
        excess_returns = returns - risk_free_rate / 252  # 日收益率
        sharpe_ratio = np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252) if np.std(excess_returns) > 0 else 0
        
        # 最大回撤
        peak = np.maximum.accumulate(values)
        drawdown = (values - peak) / peak
        max_drawdown = np.min(drawdown)
        
        # 胜率
        winning_trades = len([t for t in portfolio['trades'] if t.get('revenue', 0) > t.get('cost', 0)])
        total_trades = len([t for t in portfolio['trades'] if t['action'] == 'SELL'])
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        
        return {
            'initial_capital': initial_capital,
            'final_capital': final_value,
            'total_return': total_return,
            'annual_return': annual_return,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'win_rate': win_rate,
            'total_trades': total_trades,
            'winning_trades': winning_trades
        }


# 创建全局回测服务实例
backtest_service = BacktestService()
