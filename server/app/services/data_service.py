import akshare as ak
import pandas as pd
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings
import asyncio
import functools


class DataService:
    """数据服务类 - 基于Akshare获取金融数据"""
    
    def __init__(self):
        self.timeout = getattr(settings, 'akshare_timeout', 30)
    
    def _run_async(self, func, *args, **kwargs):
        """在异步环境中运行同步函数"""
        loop = asyncio.get_event_loop()
        return loop.run_in_executor(None, functools.partial(func, *args, **kwargs))
    
    async def get_stock_history(
        self, 
        symbol: str, 
        period: str = "daily", 
        start_date: Optional[str] = None, 
        end_date: Optional[str] = None,
        adjust: str = "qfq"
    ) -> Dict[str, Any]:
        """
        获取股票历史数据
        
        Args:
            symbol: 股票代码
            period: 数据周期 (daily, weekly, monthly)
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)
            adjust: 复权类型 (qfq前复权, hfq后复权, ""不复权)
        """
        
        try:
            # 设置默认日期
            if not start_date:
                start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")
            
            # 使用akshare获取股票历史数据 - 根据文档使用正确的参数
            df = await self._run_async(
                ak.stock_zh_a_hist,
                symbol=symbol,
                period=period,
                start_date=start_date,
                end_date=end_date,
                adjust=adjust
            )
            
            if df is None or df.empty:
                return {"data": [], "message": "No data found", "symbol": symbol}
            
            # 根据akshare文档，stock_zh_a_hist返回的列名是中文
            # 输出列：日期, 股票代码, 开盘, 收盘, 最高, 最低, 成交量, 成交额, 振幅, 涨跌幅, 涨跌额, 换手率
            column_mapping = {
                "日期": "date",
                "股票代码": "symbol_code",
                "开盘": "open", 
                "收盘": "close",
                "最高": "high",
                "最低": "low",
                "成交量": "volume",
                "成交额": "amount",
                "振幅": "amplitude",
                "涨跌幅": "pct_change",
                "涨跌额": "change",
                "换手率": "turnover"
            }
            
            # 只重命名存在的列
            available_columns = {k: v for k, v in column_mapping.items() if k in df.columns}
            df = df.rename(columns=available_columns)
            
            # 转换数据类型
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
            
            # 转换数值列，处理可能的字符串数值
            numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'amount', 'pct_change', 'change', 'amplitude', 'turnover']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # 按日期排序，最新的在前
            if 'date' in df.columns:
                df = df.sort_values('date', ascending=False)
            
            return {
                "symbol": symbol,
                "period": period,
                "data": df.to_dict('records'),
                "count": len(df),
                "start_date": start_date,
                "end_date": end_date
            }
            
        except Exception as e:
            return {"error": str(e), "data": [], "symbol": symbol}
    
    async def get_stock_realtime(self, symbols: List[str]) -> Dict[str, Any]:
        """获取实时股票数据"""
        try:
            # 获取实时数据 - 使用股票实时行情接口
            df = await self._run_async(ak.stock_zh_a_spot_em)
            
            if df is None or df.empty:
                return {"data": [], "message": "No data found"}
            
            if symbols:
                # 过滤指定的股票代码
                df = df[df['代码'].isin(symbols)]
            
            if df.empty:
                return {"data": [], "message": "No data found for specified symbols"}
            
            # 根据akshare文档重命名列
            column_mapping = {
                "代码": "symbol",
                "名称": "name",
                "最新价": "price",
                "涨跌幅": "pct_change",
                "涨跌额": "change",
                "成交量": "volume",
                "成交额": "amount",
                "今开": "open",
                "昨收": "prev_close",
                "最高": "high",
                "最低": "low"
            }
            
            # 只重命名存在的列
            available_columns = {k: v for k, v in column_mapping.items() if k in df.columns}
            df = df.rename(columns=available_columns)
            
            # 转换数值列
            numeric_columns = ['price', 'pct_change', 'change', 'volume', 'amount', 'open', 'prev_close', 'high', 'low']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            return {
                "data": df.to_dict('records'),
                "count": len(df),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e), "data": []}
    
    async def get_index_history(
        self, 
        symbol: str = "000001", 
        start_date: Optional[str] = None, 
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """获取指数历史数据"""
        try:
            # 设置默认日期
            if not start_date:
                start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")
            
            # 获取指数数据
            df = await self._run_async(
                ak.index_zh_a_hist,
                symbol=symbol,
                period="daily",
                start_date=start_date,
                end_date=end_date
            )
            
            if df is None or df.empty:
                return {"data": [], "message": "No data found", "symbol": symbol}
            
            # 重命名列 - 根据akshare文档的列名
            column_mapping = {
                "日期": "date",
                "开盘": "open",
                "收盘": "close", 
                "最高": "high",
                "最低": "low",
                "成交量": "volume",
                "成交额": "amount",
                "振幅": "amplitude",
                "涨跌幅": "pct_change",
                "涨跌额": "change",
                "换手率": "turnover"
            }
            
            # 只重命名存在的列
            available_columns = {k: v for k, v in column_mapping.items() if k in df.columns}
            df = df.rename(columns=available_columns)
            
            # 转换数据类型
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
            
            # 转换数值列
            numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'amount', 'pct_change', 'change', 'amplitude', 'turnover']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # 按日期排序，最新的在前
            if 'date' in df.columns:
                df = df.sort_values('date', ascending=False)
            
            return {
                "symbol": symbol,
                "data": df.to_dict('records'),
                "count": len(df),
                "start_date": start_date,
                "end_date": end_date
            }
            
        except Exception as e:
            return {"error": str(e), "data": [], "symbol": symbol}
    
    async def search_stocks(self, keyword: str) -> Dict[str, Any]:
        """搜索股票"""
        try:
            # 获取所有A股列表
            df = await self._run_async(ak.stock_zh_a_spot_em)
            
            if df is None or df.empty:
                return {"data": [], "message": "No data found"}
            
            # 根据关键词过滤
            if keyword:
                mask = (
                    df['代码'].str.contains(keyword, case=False, na=False) |
                    df['名称'].str.contains(keyword, case=False, na=False)
                )
                df = df[mask]
            
            # 限制返回数量
            df = df.head(20)
            
            # 重命名列
            df = df.rename(columns={
                "代码": "symbol",
                "名称": "name",
                "最新价": "price",
                "涨跌幅": "pct_change"
            })
            
            # 只返回需要的列
            result_columns = ['symbol', 'name', 'price', 'pct_change']
            available_columns = [col for col in result_columns if col in df.columns]
            df = df[available_columns]
            
            return {
                "data": df.to_dict('records'),
                "count": len(df),
                "keyword": keyword
            }
            
        except Exception as e:
            return {"error": str(e), "data": []}


# 创建全局数据服务实例
data_service = DataService()
