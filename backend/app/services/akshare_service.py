import akshare as ak
import pandas as pd
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import date, datetime, timedelta
import time
from app.core.logger import logger

# 创建线程池
executor = ThreadPoolExecutor(max_workers=5)


class DataSourceError(Exception):
    """AKShare数据源错误"""
    pass


class DataNotFoundError(DataSourceError):
    """AKShare返回空数据"""
    pass


class RateLimitError(DataSourceError):
    """数据源访问频率限制"""
    pass


async def run_in_threadpool(func, *args, **kwargs):
    """在线程池中运行同步函数"""
    return await asyncio.get_event_loop().run_in_executor(
        executor, lambda: func(*args, **kwargs)
    )


# ============================== 股票数据函数 ==============================

async def fetch_stock_hist(symbol: str, period: str = "daily", 
                          start_date: str = None, end_date: str = None, 
                          adjust: str = "") -> pd.DataFrame:
    """
    获取A股历史K线数据
    
    Args:
        symbol (str): 股票代码，如 "600000"
        period (str): K线周期，可选 "daily", "weekly", "monthly"
        start_date (str): 开始日期，格式 "20230101"
        end_date (str): 结束日期，格式 "20230430"
        adjust (str): 复权方式，可选 "", "qfq" (前复权), "hfq" (后复权)
        
    Returns:
        pd.DataFrame: 包含历史K线数据的DataFrame
    """
    try:
        logger.info(f"Fetching stock history data for {symbol}, period: {period}, "
                   f"start_date: {start_date}, end_date: {end_date}, adjust: {adjust}")
        
        df = await run_in_threadpool(
            ak.stock_zh_a_hist, 
            symbol=symbol, 
            period=period, 
            start_date=start_date, 
            end_date=end_date, 
            adjust=adjust
        )
        
        if df is None or df.empty:
            raise DataNotFoundError(f"No data found for stock {symbol} with the given parameters")
        
        # 标准化列名（转为英文）
        column_map = {
            "日期": "date", "开盘": "open", "收盘": "close", "最高": "high", "最低": "low",
            "成交量": "volume", "成交额": "amount", "振幅": "amplitude", 
            "涨跌幅": "change_pct", "涨跌额": "change", "换手率": "turnover"
        }
        
        # 仅当列名是中文时才进行重命名
        if "日期" in df.columns:
            df.rename(columns=column_map, inplace=True)
        
        # 确保日期列是字符串格式，便于JSON序列化
        if 'date' in df.columns and not isinstance(df['date'].iloc[0], str):
            df['date'] = df['date'].astype(str)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching stock history for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch stock history: {e}")


async def fetch_stock_spot(symbol: str = None) -> pd.DataFrame:
    """
    获取A股实时行情数据
    
    Args:
        symbol (str, optional): 股票代码，不传则获取全部
        
    Returns:
        pd.DataFrame: 包含实时行情的DataFrame
    """
    try:
        logger.info(f"Fetching stock spot data for {symbol if symbol else 'all stocks'}")
        
        df = await run_in_threadpool(ak.stock_zh_a_spot_em)
        
        if df is None or df.empty:
            raise DataNotFoundError("No spot data found")
        
        # 过滤特定股票（如果指定了）
        if symbol:
            df = df[df['代码'] == symbol]
            if df.empty:
                raise DataNotFoundError(f"No spot data found for stock {symbol}")
        
        # 标准化列名
        column_map = {
            "代码": "symbol", "名称": "name", "最新价": "price", 
            "涨跌幅": "change_pct", "涨跌额": "change", "成交量": "volume",
            "成交额": "amount", "最高": "high", "最低": "low", 
            "今开": "open", "昨收": "pre_close", "换手率": "turnover",
            "市盈率-动态": "pe", "市净率": "pb", 
            "总市值": "market_cap", "流通市值": "circulating_market_cap"
        }
        
        if "代码" in df.columns:
            df.rename(columns=column_map, inplace=True)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching stock spot data: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch stock spot data: {e}")


async def fetch_stock_hist_min(symbol: str, period: str = "1", 
                              adjust: str = "") -> pd.DataFrame:
    """
    获取A股分钟K线数据
    
    Args:
        symbol (str): 股票代码，如 "600000"
        period (str): 分钟周期，可选 "1", "5", "15", "30", "60"
        adjust (str): 复权方式，可选 "", "qfq", "hfq"
                     注意：1分钟数据不支持复权
        
    Returns:
        pd.DataFrame: 包含分钟线数据的DataFrame
    """
    try:
        logger.info(f"Fetching stock minute data for {symbol}, period: {period}m, adjust: {adjust}")
        
        # 如果是1分钟数据，复权设置无效
        if period == "1" and adjust:
            logger.warning("1-minute data does not support adjustment, ignoring adjust parameter")
            adjust = ""
        
        df = await run_in_threadpool(
            ak.stock_zh_a_hist_min_em,
            symbol=symbol,
            period=period,
            adjust=adjust
        )
        
        if df is None or df.empty:
            raise DataNotFoundError(f"No minute data found for stock {symbol}")
        
        # 标准化列名
        if "时间" in df.columns:
            # 1分钟数据的列名可能与其他周期不同
            column_map = {
                "时间": "datetime", "开盘": "open", "收盘": "close", 
                "最高": "high", "最低": "low", "成交量": "volume", 
                "成交额": "amount", "均价": "avg_price"
            }
            
            if "涨跌幅" in df.columns:
                column_map["涨跌幅"] = "change_pct"
            
            if "换手率" in df.columns:
                column_map["换手率"] = "turnover"
                
            df.rename(columns=column_map, inplace=True)
        
        # 确保日期时间列是字符串格式
        if 'datetime' in df.columns and not isinstance(df['datetime'].iloc[0], str):
            df['datetime'] = df['datetime'].astype(str)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching stock minute data for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch stock minute data: {e}")


# ============================== 期货数据函数 ==============================

async def fetch_futures_hist_daily(symbol: str, start_date: str = None, 
                                  end_date: str = None) -> pd.DataFrame:
    """
    获取期货日K线数据
    
    Args:
        symbol (str): 期货代码，如 "RB2410" 或 "RB0"（主力连续）
        start_date (str): 开始日期，格式 "20230101"
        end_date (str): 结束日期，格式 "20230430"
        
    Returns:
        pd.DataFrame: 包含期货日K线的DataFrame
    """
    try:
        logger.info(f"Fetching futures daily data for {symbol}, "
                   f"start_date: {start_date}, end_date: {end_date}")
        
        # 使用新浪财经的期货日线接口
        df = await run_in_threadpool(ak.futures_zh_daily_sina, symbol=symbol)
        
        if df is None or df.empty:
            # 尝试获取交易所官网数据（如果是标准期货合约代码）
            # 需要确定市场代码（交易所代码）
            market = None
            if symbol[:2] in ["IF", "IC", "IH", "IM", "TF", "TS", "T", "CY"]:
                market = "CFFEX"  # 中金所
            elif symbol[:2] in ["sc", "lu", "fu", "bc"]:
                market = "INE"    # 上海国际能源交易中心
            elif symbol[:2] in ["CF", "CY", "SR", "RM", "MA", "TA", "ZC", "FG"]:
                market = "CZCE"   # 郑商所
            elif symbol[:2] in ["a", "m", "y", "p", "c", "cs", "jd", "l", "v", "pp"]:
                market = "DCE"    # 大商所
            elif symbol[:2] in ["au", "ag", "cu", "al", "zn", "rb", "hc", "bu"]:
                market = "SHFE"   # 上期所
            
            if market and start_date and end_date:
                logger.info(f"Trying to fetch from exchange for {symbol}, market: {market}")
                try:
                    df = await run_in_threadpool(
                        ak.get_futures_daily,
                        start_date=start_date,
                        end_date=end_date,
                        market=market
                    )
                    # 过滤特定合约
                    if "symbol" in df.columns:
                        df = df[df["symbol"] == symbol]
                except Exception as e:
                    logger.warning(f"Failed to fetch from exchange: {e}")
                    
        if df is None or df.empty:
            raise DataNotFoundError(f"No daily data found for futures {symbol}")
        
        # 标准化列名 (根据实际返回的列名调整)
        try:
            if "date" not in df.columns and "日期" in df.columns:
                df.rename(columns={"日期": "date"}, inplace=True)
                
            if "open" not in df.columns and "开盘价" in df.columns:
                df.rename(columns={"开盘价": "open"}, inplace=True)
                
            if "high" not in df.columns and "最高价" in df.columns:
                df.rename(columns={"最高价": "high"}, inplace=True)
                
            if "low" not in df.columns and "最低价" in df.columns:
                df.rename(columns={"最低价": "low"}, inplace=True)
                
            if "close" not in df.columns and "收盘价" in df.columns:
                df.rename(columns={"收盘价": "close"}, inplace=True)
                
            if "volume" not in df.columns and "成交量" in df.columns:
                df.rename(columns={"成交量": "volume"}, inplace=True)
            
            # 确保日期是字符串格式
            if 'date' in df.columns and not isinstance(df['date'].iloc[0], str):
                df['date'] = df['date'].astype(str)
        except Exception as e:
            logger.warning(f"Error standardizing column names: {e}")
            # 继续执行，不中断流程
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching futures daily data for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch futures daily data: {e}")


async def fetch_futures_spot(symbol: str, market: str = "CF") -> pd.DataFrame:
    """
    获取期货实时行情
    
    Args:
        symbol (str): 期货代码，如 "RB2410"
        market (str): 市场类型，"CF" 商品期货，"FF" 金融期货
        
    Returns:
        pd.DataFrame: 包含期货实时行情的DataFrame
    """
    try:
        logger.info(f"Fetching futures spot data for {symbol}, market: {market}")
        
        df = await run_in_threadpool(
            ak.futures_zh_spot, 
            symbol=symbol, 
            market=market
        )
        
        if df is None or df.empty:
            raise DataNotFoundError(f"No spot data found for futures {symbol}")
        
        # 标准化列名
        column_map = {
            "symbol": "symbol", "time": "time", "open": "open", 
            "high": "high", "low": "low", "current_price": "price",
            "bid_price": "bid", "ask_price": "ask", "hold": "open_interest",
            "volume": "volume", "avg_price": "avg_price"
        }
        
        # 仅当列名不一致时才进行重命名
        rename_cols = {k: v for k, v in column_map.items() if k in df.columns and k != v}
        if rename_cols:
            df.rename(columns=rename_cols, inplace=True)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching futures spot data for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch futures spot data: {e}")


async def fetch_futures_hist_min(symbol: str, period: str = "5") -> pd.DataFrame:
    """
    获取期货分钟K线数据
    
    Args:
        symbol (str): 期货代码，如 "RB2410"
        period (str): 分钟周期，可选 "1", "5", "15", "30", "60"
        
    Returns:
        pd.DataFrame: 包含期货分钟K线的DataFrame
    """
    try:
        logger.info(f"Fetching futures minute data for {symbol}, period: {period}m")
        
        df = await run_in_threadpool(
            ak.futures_zh_minute_sina,
            symbol=symbol,
            period=period
        )
        
        if df is None or df.empty:
            raise DataNotFoundError(f"No minute data found for futures {symbol}")
        
        # 标准化列名（如果需要）
        if "datetime" not in df.columns and "date" in df.columns:
            df.rename(columns={"date": "datetime"}, inplace=True)
        
        # 确保datetime列是字符串格式
        if 'datetime' in df.columns and not isinstance(df['datetime'].iloc[0], str):
            df['datetime'] = df['datetime'].astype(str)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching futures minute data for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch futures minute data: {e}")


# ============================== 指数数据函数 ==============================

async def fetch_index_hist(symbol: str, period: str = "daily", 
                          start_date: str = None, end_date: str = None) -> pd.DataFrame:
    """
    获取指数历史K线数据
    
    Args:
        symbol (str): 指数代码，如 "000300" (不含市场前缀)
        period (str): K线周期，可选 "daily", "weekly", "monthly"
        start_date (str): 开始日期，格式 "20230101"
        end_date (str): 结束日期，格式 "20230430"
        
    Returns:
        pd.DataFrame: 包含指数历史K线数据的DataFrame
    """
    try:
        logger.info(f"Fetching index history data for {symbol}, period: {period}, "
                   f"start_date: {start_date}, end_date: {end_date}")
        
        df = await run_in_threadpool(
            ak.index_zh_a_hist,
            symbol=symbol,
            period=period,
            start_date=start_date,
            end_date=end_date
        )
        
        if df is None or df.empty:
            raise DataNotFoundError(f"No data found for index {symbol} with the given parameters")
        
        # 标准化列名
        column_map = {
            "日期": "date", "开盘": "open", "收盘": "close", "最高": "high", "最低": "low",
            "成交量": "volume", "成交额": "amount", "振幅": "amplitude", 
            "涨跌幅": "change_pct", "涨跌额": "change", "换手率": "turnover"
        }
        
        if "日期" in df.columns:
            df.rename(columns=column_map, inplace=True)
        
        # A股指数数据处理
        # 确保日期是字符串格式
        if 'date' in df.columns and not isinstance(df['date'].iloc[0], str):
            df['date'] = df['date'].astype(str)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching index history for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch index history: {e}")


async def fetch_index_spot(category: str = "沪深重要指数") -> pd.DataFrame:
    """
    获取指数实时行情数据
    
    Args:
        category (str): 指数类别，如 "沪深重要指数", "上证系列指数" 等
        
    Returns:
        pd.DataFrame: 包含指数实时行情的DataFrame
    """
    try:
        logger.info(f"Fetching index spot data for category: {category}")
        
        df = await run_in_threadpool(ak.stock_zh_index_spot_em)
        
        if df is None or df.empty:
            raise DataNotFoundError("No index spot data found")
        
        # 如果指定了类别，进行过滤
        if category and "指数类型" in df.columns:
            df = df[df["指数类型"] == category]
            if df.empty:
                raise DataNotFoundError(f"No index spot data found for category {category}")
        
        # 标准化列名
        column_map = {
            "代码": "symbol", "名称": "name", "最新价": "price", 
            "涨跌幅": "change_pct", "涨跌额": "change", "成交量": "volume",
            "成交额": "amount", "最高": "high", "最低": "low", 
            "今开": "open", "昨收": "pre_close"
        }
        
        if "代码" in df.columns:
            df.rename(columns=column_map, inplace=True)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching index spot data: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch index spot data: {e}")


async def fetch_index_hist_min(symbol: str, period: str = "5", 
                              start_date: str = None, end_date: str = None) -> pd.DataFrame:
    """
    获取指数分钟K线数据
    
    Args:
        symbol (str): 指数代码，如 "000300" (不含市场前缀)
        period (str): 分钟周期，可选 "1", "5", "15", "30", "60"
        start_date (str): 开始日期，格式 "20230101" (可选)
        end_date (str): 结束日期，格式 "20230430" (可选)
        
    Returns:
        pd.DataFrame: 包含指数分钟线数据的DataFrame
    """
    try:
        logger.info(f"Fetching index minute data for {symbol}, period: {period}m")
        
        df = await run_in_threadpool(
            ak.index_zh_a_hist_min_em,
            symbol=symbol,
            period=period,
            start_date=start_date,
            end_date=end_date
        )
        
        if df is None or df.empty:
            raise DataNotFoundError(f"No minute data found for index {symbol}")
        
        # 标准化列名
        if "时间" in df.columns:
            column_map = {
                "时间": "datetime", "开盘": "open", "收盘": "close", 
                "最高": "high", "最低": "low", "成交量": "volume", 
                "成交额": "amount", "均价": "avg_price"
            }
            df.rename(columns=column_map, inplace=True)
        
        # 确保日期时间列是字符串格式
        if 'datetime' in df.columns and not isinstance(df['datetime'].iloc[0], str):
            df['datetime'] = df['datetime'].astype(str)
            
        return df
    
    except DataNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error fetching index minute data for {symbol}: {e}", exc_info=True)
        raise DataSourceError(f"Failed to fetch index minute data: {e}")