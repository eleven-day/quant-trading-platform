import pandas as pd
import yfinance as yf
import akshare as ak
import numpy as np
import datetime
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import json
import socket
import requests

from core.config import settings

# 日志配置
LOG_DIR = Path("../logs")
LOG_DIR.mkdir(exist_ok=True)
log_file = LOG_DIR / "fetch.log"

# 配置日志
logger = logging.getLogger("fetch")
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# 添加文件处理器
file_handler = logging.FileHandler(log_file)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# 添加控制台处理器
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 检测网络连接情况
def check_network_connection():
    """检查是否能连接到国际网络，如果不能则可能是在中国大陆"""
    try:
        # 尝试连接到Google进行测试
        socket.create_connection(("www.google.com", 80), timeout=3)
        return True
    except (socket.timeout, socket.error):
        try:
            # 尝试连接到Yahoo
            socket.create_connection(("finance.yahoo.com", 443), timeout=3)
            return True
        except (socket.timeout, socket.error):
            return False

# 确定数据源
use_yfinance = check_network_connection()
if use_yfinance:
    logger.info("网络连接正常，使用yfinance作为主要数据源")
else:
    logger.info("网络连接受限，将使用akshare作为主要数据源")


def fetch_stock_list() -> pd.DataFrame:
    """获取股票列表"""
    logger.info("开始获取股票列表")
    try:
        if use_yfinance:
            logger.info("使用yfinance获取股票列表")
            # yfinance不直接提供股票列表，可以使用一些预定义的列表或其他方式
            # 这里示例获取一些主要的中国股票
            symbols = ['BABA', 'JD', 'PDD', 'BIDU', 'NIO', 'TCEHY']
            data = []
            for symbol in symbols:
                try:
                    stock = yf.Ticker(symbol)
                    info = stock.info
                    data.append({
                        'ts_code': symbol,
                        'name': info.get('shortName', symbol),
                        'industry': info.get('industry', None),
                        'area': 'China' if info.get('country') == 'China' else info.get('country', None),
                        'market': 'NASDAQ/NYSE',
                        'list_date': None,
                        'is_hs': None
                    })
                except Exception as e:
                    logger.warning(f"获取{symbol}信息失败: {e}")
            df = pd.DataFrame(data)
        else:
            logger.info("使用Akshare获取股票列表")
            df = ak.stock_info_a_code_name()
            df = df.rename(columns={'code': 'ts_code', 'name': 'name'})
            df['industry'] = None
            df['area'] = None
            df['market'] = None
            df['list_date'] = None
            df['is_hs'] = None
        
        logger.info(f"成功获取股票列表，共{len(df)}条记录")
        return df
    except Exception as e:
        logger.error(f"获取股票列表失败: {e}")
        # 如果API获取失败，尝试从缓存文件读取
        cache_file = settings.CACHE_DIR / "stock_list.csv"
        if os.path.exists(cache_file):
            logger.info(f"从缓存文件{cache_file}读取股票列表")
            return pd.read_csv(cache_file)
        logger.critical("无法获取股票列表，且无缓存可用")
        raise e


def fetch_stock_daily(ts_code: str, start_date: str, end_date: str) -> pd.DataFrame:
    """获取股票日线数据"""
    logger.info(f"开始获取股票{ts_code}从{start_date}到{end_date}的日线数据")
    try:
        if use_yfinance:
            logger.info(f"使用yfinance获取{ts_code}的日线数据")
            # 转换日期格式
            start_date_fmt = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:]}"
            end_date_fmt = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:]}"
            
            # 转换ts_code格式，例如将000001.SZ转换为000001.SZ
            yf_code = ts_code
            if '.' in ts_code:
                code, market = ts_code.split('.')
                if market == 'SH':
                    yf_code = f"{code}.SS"
                elif market == 'SZ':
                    yf_code = f"{code}.SZ"
            
            df = yf.download(yf_code, start=start_date_fmt, end=end_date_fmt)
            df = df.reset_index()
            df = df.rename(columns={
                'Date': 'trade_date',
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'vol',
                'Adj Close': 'adj_close'
            })
            # 将日期转换为tushare格式
            df['trade_date'] = pd.to_datetime(df['trade_date']).dt.strftime('%Y%m%d')
            
            # 添加可能缺失的列
            if 'amount' not in df.columns:
                df['amount'] = df['vol'] * df['close']
            if 'pct_chg' not in df.columns:
                df['pct_chg'] = df['close'].pct_change() * 100
        else:
            logger.info(f"使用Akshare获取{ts_code}的日线数据")
            code = ts_code.split('.')[0]
            df = ak.stock_zh_a_hist(symbol=code, 
                                  start_date=f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:]}",
                                  end_date=f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:]}",
                                  adjust="qfq")
            df = df.rename(columns={
                '日期': 'trade_date',
                '开盘': 'open',
                '最高': 'high',
                '最低': 'low',
                '收盘': 'close',
                '成交量': 'vol',
                '成交额': 'amount',
                '涨跌幅': 'pct_chg'
            })
            df['trade_date'] = df['trade_date'].str.replace('-', '')
        
        logger.info(f"成功获取{ts_code}的日线数据，共{len(df)}条记录")
        return df
    except Exception as e:
        logger.error(f"获取股票{ts_code}的日线数据失败: {e}")
        # 如果API获取失败，尝试从缓存文件读取
        cache_file = settings.CACHE_DIR / f"daily_{ts_code}_{start_date}_{end_date}.csv"
        if os.path.exists(cache_file):
            logger.info(f"从缓存文件{cache_file}读取日线数据")
            return pd.read_csv(cache_file)
        logger.critical(f"无法获取股票{ts_code}的日线数据，且无缓存可用")
        raise e


def fetch_index_daily(ts_code: str, start_date: str, end_date: str) -> pd.DataFrame:
    """获取指数日线数据"""
    logger.info(f"开始获取指数{ts_code}从{start_date}到{end_date}的日线数据")
    try:
        if use_yfinance:
            logger.info(f"使用yfinance获取指数{ts_code}的日线数据")
            # 转换日期格式
            start_date_fmt = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:]}"
            end_date_fmt = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:]}"
            
            # 转换指数代码格式
            index_map = {
                '000001.SH': '^SSEC',  # 上证指数
                '399001.SZ': '^SZSC',  # 深证成指
                '000300.SH': '^CSI300', # 沪深300
                '399006.SZ': '^SZSE'   # 创业板指
            }
            yf_code = index_map.get(ts_code, ts_code)
            
            df = yf.download(yf_code, start=start_date_fmt, end=end_date_fmt)
            df = df.reset_index()
            df = df.rename(columns={
                'Date': 'trade_date',
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'vol',
                'Adj Close': 'adj_close'
            })
            # 将日期转换为tushare格式
            df['trade_date'] = pd.to_datetime(df['trade_date']).dt.strftime('%Y%m%d')
        else:
            logger.info(f"使用Akshare获取指数{ts_code}的日线数据")
            # 转换代码格式，如000001.SH -> sh000001
            code_map = {
            '000001.SH': 'sh000001',
            '399001.SZ': 'sz399001',
            '000300.SH': 'sh000300',
            '399006.SZ': 'sz399006'
            }
            index_code = code_map.get(ts_code, ts_code)
            if '.' in index_code and index_code not in code_map:
                prefix = 'sh' if index_code.endswith('.SH') else 'sz' if index_code.endswith('.SZ') else ''
                code = index_code.split('.')[0]
                index_code = f"{prefix}{code}"
            
            df = ak.stock_zh_index_daily(symbol=index_code)
            df = df.reset_index()
            df = df.rename(columns={
                'date': 'trade_date',
                'open': 'open',
                'high': 'high',
                'low': 'low',
                'close': 'close',
                'volume': 'vol'
            })
            # 确保日期格式正确
            df['trade_date'] = pd.to_datetime(df['trade_date']).dt.strftime('%Y%m%d')
            # 过滤日期范围
            df = df[(df['trade_date'] >= start_date) & (df['trade_date'] <= end_date)]
        
        logger.info(f"成功获取指数{ts_code}的日线数据，共{len(df)}条记录")
        return df
    except Exception as e:
        logger.error(f"获取指数{ts_code}的日线数据失败: {e}")
        # 如果API获取失败，尝试从缓存文件读取
        cache_file = settings.CACHE_DIR / f"index_{ts_code}_{start_date}_{end_date}.csv"
        if os.path.exists(cache_file):
            logger.info(f"从缓存文件{cache_file}读取指数日线数据")
            return pd.read_csv(cache_file)
        logger.critical(f"无法获取指数{ts_code}的日线数据，且无缓存可用")
        raise e