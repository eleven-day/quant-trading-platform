from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime


class FuturesHistDataResponse(BaseModel):
    """期货历史数据响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"


class FuturesHistRequest(BaseModel):
    """期货历史数据请求模型"""
    symbol: str
    start_date: date
    end_date: date


class FuturesSpotResponse(BaseModel):
    """期货实时行情响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"


class FuturesMinDataResponse(BaseModel):
    """期货分钟数据响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"