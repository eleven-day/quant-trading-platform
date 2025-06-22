from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base


class StrategyStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class Strategy(Base):
    """策略模型"""
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    code = Column(Text, nullable=False)
    parameters = Column(JSON)  # 策略参数配置
    status = Column(SQLEnum(StrategyStatus), default=StrategyStatus.DRAFT)
    user_id = Column(Integer, nullable=False)  # 外键关联用户
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BacktestResult(Base):
    """回测结果模型"""
    __tablename__ = "backtest_results"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, nullable=False)  # 外键关联策略
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    initial_capital = Column(String(20))  # 初始资金
    final_capital = Column(String(20))    # 最终资金
    total_return = Column(String(10))     # 总收益率
    sharpe_ratio = Column(String(10))     # 夏普比率
    max_drawdown = Column(String(10))     # 最大回撤
    performance_data = Column(JSON)       # 详细绩效数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
