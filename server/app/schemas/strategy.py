from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class StrategyStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class StrategyBase(BaseModel):
    """策略基础模型"""
    name: str
    description: Optional[str] = None
    code: str
    parameters: Optional[Dict[str, Any]] = None
    status: StrategyStatus = StrategyStatus.DRAFT


class StrategyCreate(StrategyBase):
    """策略创建模型"""
    pass


class StrategyUpdate(BaseModel):
    """策略更新模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    status: Optional[StrategyStatus] = None


class Strategy(StrategyBase):
    """策略响应模型"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BacktestRequest(BaseModel):
    """回测请求模型"""
    strategy_id: int
    start_date: datetime
    end_date: datetime
    initial_capital: float = 100000.0
    symbols: List[str] = ["000001"]  # 默认上证指数


class BacktestResult(BaseModel):
    """回测结果模型"""
    id: int
    strategy_id: int
    start_date: datetime
    end_date: datetime
    initial_capital: str
    final_capital: str
    total_return: str
    sharpe_ratio: str
    max_drawdown: str
    performance_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class MarketData(BaseModel):
    """市场数据模型"""
    symbol: str
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    amount: Optional[float] = None
