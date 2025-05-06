from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime


class IndexHistDataResponse(BaseModel):
    """指数历史数据响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"


class IndexHistRequest(BaseModel):
    """指数历史数据请求模型"""
    symbol: str
    period: str = "daily"
    start_date: date
    end_date: date


class IndexSpotResponse(BaseModel):
    """指数实时行情响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"


class IndexMinDataResponse(BaseModel):
    """指数分钟数据响应模型"""
    data: List[Dict[str, Any]]
    message: str = "success"