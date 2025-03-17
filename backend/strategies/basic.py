import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import talib as ta


class MACrossStrategy:
    """
    均线交叉策略
    
    当快速均线上穿慢速均线时买入，下穿时卖出
    """
    def __init__(self, params: Dict[str, Any] = None):
        """初始化策略参数"""
        default_params = {
            "fast_period": 5,
            "slow_period": 20
        }
        self.params = default_params
        if params:
            self.params.update(params)
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """计算交易信号"""
        df = data.copy()
        
        # 计算快速和慢速均线
        df['fast_ma'] = df['close'].rolling(window=self.params['fast_period']).mean()
        df['slow_ma'] = df['close'].rolling(window=self.params['slow_period']).mean()
        
        # 初始化信号列
        df['signal'] = 0
        
        # 计算金叉死叉信号
        for i in range(1, len(df)):
            # 如果快线从下方穿过慢线，买入信号
            if df['fast_ma'].iloc[i-1] < df['slow_ma'].iloc[i-1] and df['fast_ma'].iloc[i] > df['slow_ma'].iloc[i]:
                df.loc[df.index[i], 'signal'] = 1
            # 如果快线从上方穿过慢线，卖出信号
            elif df['fast_ma'].iloc[i-1] > df['slow_ma'].iloc[i-1] and df['fast_ma'].iloc[i] < df['slow_ma'].iloc[i]:
                df.loc[df.index[i], 'signal'] = -1
        
        return df
    
    def run_backtest(
        self, 
        data: Dict[str, pd.DataFrame], 
        initial_capital: float = 100000, 
        commission: float = 0.0003
    ) -> Dict[str, Any]:
        """
        运行回测
        
        参数:
        - data: 包含多只股票数据的字典 {ts_code: dataframe}
        - initial_capital: 初始资金
        - commission: 手续费率
        
        返回:
        - 回测结果字典
        """
        if not data:
            return {
                "error": "没有提供数据"
            }
        
        # 初始化结果
        result = {
            "initial_capital": initial_capital,
            "final_capital": initial_capital,
            "returns": [],
            "positions": [],
            "transactions": []
        }
        
        # 初始化现金和持仓
        cash = initial_capital
        positions = {}
        
        # 按日期排序所有股票数据
        dates = []
        for ts_code, df in data.items():
            if 'trade_date' in df.columns:
                dates.extend(df['trade_date'].tolist())
        
        dates = sorted(list(set(dates)))
        
        # 按日期遍历
        for date in dates:
            daily_transactions = []
            
            # 遍历每只股票
            for ts_code, df in data.items():
                if 'trade_date' not in df.columns:
                    continue
                
                # 获取当前日期的数据
                daily_data = df[df['trade_date'] == date]
                if daily_data.empty:
                    continue
                
                # 计算信号
                signals_df = self.calculate_signals(df[df['trade_date'] <= date])
                if signals_df.empty:
                    continue
                
                # 获取最新信号
                current_signal = signals_df.iloc[-1]['signal']
                current_price = daily_data.iloc[0]['close']
                
                # 处理买入信号
                if current_signal == 1 and cash > 0:
                    # 计算可买入数量（取整百）
                    max_shares = int((cash * 0.95) / (current_price * (1 + commission)) / 100) * 100
                    if max_shares > 0:
                        cost = max_shares * current_price * (1 + commission)
                        cash -= cost
                        
                        # 更新持仓
                        if ts_code in positions:
                            positions[ts_code] += max_shares
                        else:
                            positions[ts_code] = max_shares
                        
                        # 记录交易
                        transaction = {
                            "date": date,
                            "code": ts_code,
                            "action": "买入",
                            "price": current_price,
                            "volume": max_shares,
                            "amount": max_shares * current_price,
                            "commission": max_shares * current_price * commission
                        }
                        daily_transactions.append(transaction)
                
                # 处理卖出信号
                elif current_signal == -1 and ts_code in positions and positions[ts_code] > 0:
                    shares = positions[ts_code]
                    proceeds = shares * current_price * (1 - commission)
                    cash += proceeds
                    
                    # 更新持仓
                    positions[ts_code] = 0
                    
                    # 记录交易
                    transaction = {
                        "date": date,
                        "code": ts_code,
                        "action": "卖出",
                        "price": current_price,
                        "volume": shares,
                        "amount": shares * current_price,
                        "commission": shares * current_price * commission
                    }
                    daily_transactions.append(transaction)
            
            # 计算当日总资产
            portfolio_value = cash
            for ts_code, shares in positions.items():
                if shares > 0:
                    # 获取当日收盘价
                    df = data[ts_code]
                    daily_data = df[df['trade_date'] == date]
                    if not daily_data.empty:
                        current_price = daily_data.iloc[0]['close']
                        portfolio_value += shares * current_price
            
            # 记录当日结果
            result["returns"].append({
                "date": date,
                "value": portfolio_value
            })
            
            # 记录当日持仓
            current_positions = []
            for ts_code, shares in positions.items():
                if shares > 0:
                    df = data[ts_code]
                    daily_data = df[df['trade_date'] == date]
                    if not daily_data.empty:
                        current_price = daily_data.iloc[0]['close']
                        current_positions.append({
                            "code": ts_code,
                            "shares": shares,
                            "price": current_price,
                            "value": shares * current_price
                        })
            
            result["positions"].append({
                "date": date,
                "cash": cash,
                "positions": current_positions
            })
            
            # 记录当日交易
            for transaction in daily_transactions:
                result["transactions"].append(transaction)
        
        # 计算最终资产
        if result["returns"]:
            result["final_capital"] = result["returns"][-1]["value"]
        
        # 计算收益率
        result["total_return"] = (result["final_capital"] - initial_capital) / initial_capital * 100
        
        # 计算年化收益率
        days = len(result["returns"])
        if days > 1:
            result["annualized_return"] = ((1 + result["total_return"]/100) ** (252/days) - 1) * 100
        else:
            result["annualized_return"] = result["total_return"]
        
        return result