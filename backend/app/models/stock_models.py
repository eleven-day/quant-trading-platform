
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime


class StockHistDataResponse(BaseModel):
    """股票历史数据响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"


class StockHistRequest(BaseModel):
    """股票历史数据请求模型"""
    symbol: str
    period: str = "daily"
    start_date: date
    end_date: date
    adjust: str = ""


class StockSpotResponse(BaseModel):
    """股票实时行情响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"


class StockMinDataResponse(BaseModel):
    """股票分钟数据响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"