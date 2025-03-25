import pandas as pd
import tushare as ts
import akshare as ak
import numpy as np
import datetime
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import json

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

# 尝试初始化Tushare
try:
    if settings.TUSHARE_TOKEN:
        ts.set_token(settings.TUSHARE_TOKEN)
        pro = ts.pro_api()
        logger.info("Tushare API 初始化成功")
    else:
        pro = None
        logger.warning("未提供 Tushare Token，将尝试使用 Akshare")
except Exception as e:
    logger.error(f"Tushare初始化失败: {e}")
    pro = None


def fetch_stock_list() -> pd.DataFrame:
    """获取股票列表"""
    logger.info("开始获取股票列表")
    try:
        # 先尝试使用Tushare
        if pro:
            logger.info("使用Tushare获取股票列表")
            df = pro.stock_basic(exchange='', list_status='L', 
                              fields='ts_code,name,industry,area,market,list_date,is_hs')
        # 如果Tushare不可用，使用Akshare
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
        # 从Tushare获取
        if pro:
            logger.info(f"使用Tushare获取{ts_code}的日线数据")
            df = pro.daily(ts_code=ts_code, start_date=start_date, end_date=end_date)
        # 从Akshare获取
        else:
            logger.info(f"使用Akshare获取{ts_code}的日线数据")
            df = ak.stock_zh_a_hist(symbol=ts_code.split('.')[0], 
                                  start_date=start_date, 
                                  end_date=end_date,
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
        # 从Tushare获取
        if pro:
            logger.info(f"使用Tushare获取指数{ts_code}的日线数据")
            df = pro.index_daily(ts_code=ts_code, start_date=start_date, end_date=end_date)
        # 从Akshare获取
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