import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import datetime


class ValueStrategy:
    """
    价值策略
    
    基于估值指标（如PE、PB）选择低估值股票
    """
    def __init__(self, params: Dict[str, Any] = None):
        """初始化策略参数"""
        default_params = {
            "max_pe": 15,           # 最大市盈率
            "max_pb": 1.5,          # 最大市净率
            "rebalance_period": 20  # 再平衡周期
        }
        self.params = default_params
        if params:
            self.params.update(params)
    
    def select_stocks(self, data: Dict[str, pd.DataFrame], date: str) -> List[str]:
        """
        选择股票
        
        参数:
        - data: 包含多只股票数据的字典 {ts_code: dataframe}
        - date: 当前日期
        
        返回:
        - 选出的股票代码列表
        """
        selected_stocks = []
        
        for ts_code, df in data.items():
            # 过滤出当前日期的数据
            daily_data = df[df["trade_date"] == date]
            if not daily_data.empty:
                # 这里假设数据中包含PE和PB
                # 实际应用中可能需要额外获取这些数据
                pe = daily_data.get("pe", pd.Series([float('inf')]))
                pb = daily_data.get("pb", pd.Series([float('inf')]))
                
                # 如果没有PE和PB数据，模拟一些值用于演示
                if pe.iloc[0] == float('inf'):
                    # 使用股票代码生成一个伪随机种子
                    seed = sum(ord(c) for c in ts_code)
                    np.random.seed(seed)
                    pe = pd.Series([np.random.uniform(5, 30)])
                
                if pb.iloc[0] == float('inf'):
                    seed = sum(ord(c) for c in ts_code) + 1
                    np.random.seed(seed)
                    pb = pd.Series([np.random.uniform(0.5, 5)])
                
                # 根据估值指标筛选
                if pe.iloc[0] <= self.params["max_pe"] and pb.iloc[0] <= self.params["max_pb"]:
                    selected_stocks.append(ts_code)
        
        return selected_stocks
    
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
        last_rebalance_date = None
        
        # 获取所有日期
        all_dates = []
        for ts_code, df in data.items():
            all_dates.extend(df["trade_date"].tolist())
        all_dates = sorted(list(set(all_dates)))
        
        # 按日期遍历
        for date in all_dates:
            # 判断是否需要再平衡
            need_rebalance = False
            if last_rebalance_date is None:
                need_rebalance = True
            else:
                # 将日期字符串转换为datetime对象
                current_date = datetime.datetime.strptime(date, "%Y%m%d")
                last_date = datetime.datetime.strptime(last_rebalance_date, "%Y%m%d")
                days_since_last_rebalance = (current_date - last_date).days
                if days_since_last_rebalance >= self.params["rebalance_period"]:
                    need_rebalance = True
            
            daily_transactions = []
            
            # 如果需要再平衡
            if need_rebalance:
                # 卖出所有现有持仓
                for ts_code, shares in list(positions.items()):
                    if shares > 0:
                        # 获取当日收盘价
                        df = data[ts_code]
                        daily_data = df[df["trade_date"] == date]
                        if not daily_data.empty:
                            current_price = daily_data.iloc[0]["close"]
                            proceeds = shares * current_price * (1 - commission)
                            cash += proceeds
                            
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
                            
                            # 更新持仓
                            positions[ts_code] = 0
                
                # 选择新的股票
                selected_stocks = self.select_stocks(data, date)
                
                # 平均分配资金
                if selected_stocks:
                    per_stock_capital = cash / len(selected_stocks)
                    
                    # 买入选出的股票
                    for ts_code in selected_stocks:
                        df = data[ts_code]
                        daily_data = df[df["trade_date"] == date]
                        if not daily_data.empty:
                            current_price = daily_data.iloc[0]["close"]
                            
                            # 计算可买入数量（取整百）
                            max_shares = int((per_stock_capital * 0.99) / (current_price * (1 + commission)) / 100) * 100
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
                
                # 更新再平衡日期
                last_rebalance_date = date
            
            # 计算当日总资产
            portfolio_value = cash
            for ts_code, shares in positions.items():
                if shares > 0:
                    # 获取当日收盘价
                    df = data[ts_code]
                    daily_data = df[df["trade_date"] == date]
                    if not daily_data.empty:
                        current_price = daily_data.iloc[0]["close"]
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
                    daily_data = df[df["trade_date"] == date]
                    if not daily_data.empty:
                        current_price = daily_data.iloc[0]["close"]
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