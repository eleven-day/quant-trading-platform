import pandas as pd
import numpy as np
from typing import List, Dict, Any
import talib as ta
import logging
from pathlib import Path

# 日志配置
LOG_DIR: Path = Path("../logs")
LOG_DIR.mkdir(exist_ok=True, parents=True)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# 创建文件处理器
file_handler = logging.FileHandler(LOG_DIR / "process.log")
file_handler.setLevel(logging.INFO)

# 创建控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# 设置日志格式
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# 添加处理器到logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)


def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """计算技术指标"""
    if df.empty:
        logger.warning("Empty DataFrame provided, returning without calculations")
        return df
    
    # 确保列名正确
    if 'close' not in df.columns:
        if 'Close' in df.columns:
            logger.info("Renaming 'Close' column to 'close'")
            df = df.rename(columns={'Close': 'close'})
        else:
            logger.warning("No 'close' or 'Close' column found in DataFrame")
            return df
    
    if 'high' not in df.columns and 'High' in df.columns:
        logger.info("Renaming 'High' column to 'high'")
        df = df.rename(columns={'High': 'high'})
    
    if 'low' not in df.columns and 'Low' in df.columns:
        logger.info("Renaming 'Low' column to 'low'")
        df = df.rename(columns={'Low': 'low'})
    
    if 'volume' not in df.columns and 'Volume' in df.columns:
        logger.info("Renaming 'Volume' column to 'volume'")
        df = df.rename(columns={'Volume': 'volume'})
    
    if 'open' not in df.columns and 'Open' in df.columns:
        logger.info("Renaming 'Open' column to 'open'")
        df = df.rename(columns={'Open': 'open'})
    
    logger.info("Calculating moving averages")
    # 移动平均线
    df['ma5'] = df['close'].rolling(window=5).mean()
    df['ma10'] = df['close'].rolling(window=10).mean()
    df['ma20'] = df['close'].rolling(window=20).mean()
    df['ma60'] = df['close'].rolling(window=60).mean()
    
    # 相对强弱指标 (RSI)
    if 'close' in df.columns:
        try:
            logger.info("Calculating RSI")
            df['rsi'] = ta.RSI(df['close'].values, timeperiod=14)
        except Exception as e:
            logger.error(f"Failed to calculate RSI: {str(e)}")
    
    # MACD
    if 'close' in df.columns:
        try:
            logger.info("Calculating MACD")
            macd, macdsignal, macdhist = ta.MACD(
                df['close'].values, fastperiod=12, slowperiod=26, signalperiod=9
            )
            df['macd'] = macd
            df['macdsignal'] = macdsignal
            df['macdhist'] = macdhist
        except Exception as e:
            logger.error(f"Failed to calculate MACD: {str(e)}")
    
    # 布林带
    if 'close' in df.columns:
        try:
            logger.info("Calculating Bollinger Bands")
            upper, middle, lower = ta.BBANDS(
                df['close'].values, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0
            )
            df['boll_upper'] = upper
            df['boll_middle'] = middle
            df['boll_lower'] = lower
        except Exception as e:
            logger.error(f"Failed to calculate Bollinger Bands: {str(e)}")
    
    logger.info("Technical indicators calculation completed")
    return df


def calculate_returns(prices: List[float]) -> List[float]:
    """计算收益率列表"""
    if not prices or len(prices) < 2:
        logger.warning("Insufficient price data to calculate returns")
        return []
    
    logger.info(f"Calculating returns for {len(prices)} price points")
    returns = []
    base_price = prices[0]
    
    for price in prices:
        ret = (price - base_price) / base_price * 100
        returns.append(ret)
    
    return returns


def calculate_drawdowns(prices: List[float]) -> List[float]:
    """计算回撤列表"""
    if not prices or len(prices) < 2:
        logger.warning("Insufficient price data to calculate drawdowns")
        return []
    
    logger.info(f"Calculating drawdowns for {len(prices)} price points")
    drawdowns = []
    max_price = prices[0]
    
    for price in prices:
        max_price = max(max_price, price)
        drawdown = (price - max_price) / max_price * 100
        drawdowns.append(drawdown)
    
    return drawdowns


def calculate_performance_metrics(
    returns: List[float], 
    benchmark_returns: List[float] = None
) -> Dict[str, Any]:
    """计算绩效指标"""
    metrics = {}
    
    if not returns or len(returns) < 2:
        logger.warning("Insufficient returns data to calculate performance metrics")
        return metrics
    
    logger.info(f"Calculating performance metrics for {len(returns)} return points")
    
    # 累计收益率
    metrics['total_return'] = returns[-1]
    
    # 年化收益率
    days = len(returns)
    if days > 1:
        metrics['annualized_return'] = ((1 + returns[-1]/100) ** (252/days) - 1) * 100
    else:
        metrics['annualized_return'] = returns[-1]
    
    # 波动率
    daily_returns = []
    for i in range(1, len(returns)):
        daily_return = (returns[i] - returns[i-1]) / (1 + returns[i-1]/100)
        daily_returns.append(daily_return)
    
    if daily_returns:
        volatility = np.std(daily_returns) * np.sqrt(252)
        metrics['volatility'] = volatility * 100
    else:
        metrics['volatility'] = 0
    
    # 夏普比率
    if metrics['volatility'] > 0:
        metrics['sharpe_ratio'] = metrics['annualized_return'] / metrics['volatility']
    else:
        metrics['sharpe_ratio'] = 0
    
    # 最大回撤
    drawdowns = []
    max_return = returns[0]
    for ret in returns:
        max_return = max(max_return, ret)
        drawdown = (ret - max_return) / (1 + max_return/100) * 100
        drawdowns.append(drawdown)
    
    metrics['max_drawdown'] = min(drawdowns) if drawdowns else 0
    
    # 对比基准
    if benchmark_returns and len(benchmark_returns) == len(returns):
        logger.info("Calculating benchmark comparison metrics")
        # 超额收益
        metrics['excess_return'] = returns[-1] - benchmark_returns[-1]
        
        # 年化超额收益
        metrics['annualized_excess_return'] = metrics['annualized_return'] - (
            ((1 + benchmark_returns[-1]/100) ** (252/days) - 1) * 100 if days > 1 else benchmark_returns[-1]
        )
        
        # 信息比率
        if metrics['volatility'] > 0:
            metrics['information_ratio'] = metrics['annualized_excess_return'] / metrics['volatility']
        else:
            metrics['information_ratio'] = 0
        
        # 胜率
        win_count = 0
        for i in range(len(returns)):
            if returns[i] > benchmark_returns[i]:
                win_count += 1
        
        metrics['win_rate'] = win_count / len(returns) * 100
    
    logger.info("Performance metrics calculation completed")
    return metrics