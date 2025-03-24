import pandas as pd
import tushare as ts
import akshare as ak
import numpy as np
import datetime
import os
from typing import List, Dict, Any, Optional
import json

from core.config import settings

# 尝试初始化Tushare
try:
    if settings.TUSHARE_TOKEN:
        ts.set_token(settings.TUSHARE_TOKEN)
        pro = ts.pro_api()
    else:
        pro = None
except Exception as e:
    print(f"Tushare初始化失败: {e}")
    pro = None


def fetch_stock_list() -> pd.DataFrame:
    """获取股票列表"""
    try:
        # 先尝试使用Tushare
        if pro:
            df = pro.stock_basic(exchange='', list_status='L', 
                              fields='ts_code,name,industry,area,market,list_date,is_hs')
        # 如果Tushare不可用，使用Akshare
        else:
            df = ak.stock_info_a_code_name()
            df = df.rename(columns={'code': 'ts_code', 'name': 'name'})
            df['industry'] = None
            df['area'] = None
            df['market'] = None
            df['list_date'] = None
            df['is_hs'] = None
        
        return df
    except Exception as e:
        print(f"获取股票列表失败: {e}")
        # 如果API获取失败，尝试从缓存文件读取
        cache_file = settings.CACHE_DIR / "stock_list.csv"
        if os.path.exists(cache_file):
            return pd.read_csv(cache_file)
        raise e


def fetch_stock_daily(ts_code: str, start_date: str, end_date: str) -> pd.DataFrame:
    """获取股票日线数据"""
    try:
        # 从Tushare获取
        if pro:
            df = pro.daily(ts_code=ts_code, start_date=start_date, end_date=end_date)
        # 从Akshare获取
        else:
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
        
        return df
    except Exception as e:
        print(f"获取股票日线数据失败: {e}")
        # 如果API获取失败，尝试从缓存文件读取
        cache_file = settings.CACHE_DIR / f"daily_{ts_code}_{start_date}_{end_date}.csv"
        if os.path.exists(cache_file):
            return pd.read_csv(cache_file)
        raise e


def fetch_index_daily(ts_code: str, start_date: str, end_date: str) -> pd.DataFrame:
    """获取指数日线数据"""
    try:
        # 从Tushare获取
        if pro:
            df = pro.index_daily(ts_code=ts_code, start_date=start_date, end_date=end_date)
        # 从Akshare获取
        else:
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
        
        return df
    except Exception as e:
        print(f"获取指数日线数据失败: {e}")
        # 如果API获取失败，尝试从缓存文件读取
        cache_file = settings.CACHE_DIR / f"index_{ts_code}_{start_date}_{end_date}.csv"
        if os.path.exists(cache_file):
            return pd.read_csv(cache_file)
        raise e