from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
import datetime

from core.database import Base

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    ts_code = Column(String, unique=True, index=True)
    name = Column(String)
    industry = Column(String, nullable=True)
    area = Column(String, nullable=True)
    market = Column(String, nullable=True)
    list_date = Column(String, nullable=True)
    is_hs = Column(String, nullable=True)
    
    # 关系
    daily_data = relationship("StockDaily", back_populates="stock")


class StockDaily(Base):
    __tablename__ = "stock_daily"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    trade_date = Column(String, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    pre_close = Column(Float, nullable=True)
    change = Column(Float, nullable=True)
    pct_chg = Column(Float, nullable=True)
    vol = Column(Float, nullable=True)
    amount = Column(Float, nullable=True)
    
    # 关系
    stock = relationship("Stock", back_populates="daily_data")
    
    class Config:
        orm_mode = True


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)
    description = Column(Text)
    code = Column(Text, nullable=True)
    parameters = Column(JSON, nullable=True)
    markets = Column(JSON, nullable=True)  # 适用市场
    risk_level = Column(String, nullable=True)  # 风险等级
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    
    # 关系
    backtests = relationship("Backtest", back_populates="strategy")


class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"))
    name = Column(String, nullable=True)
    start_date = Column(String)
    end_date = Column(String)
    initial_capital = Column(Float)
    stock_pool = Column(JSON)  # 股票池
    parameters = Column(JSON, nullable=True)  # 策略参数
    results = Column(JSON, nullable=True)  # 回测结果
    created_at = Column(DateTime, default=datetime.datetime.now)
    
    # 关系
    strategy = relationship("Strategy", back_populates="backtests")
    transactions = relationship("Transaction", back_populates="backtest")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    backtest_id = Column(Integer, ForeignKey("backtests.id"))
    date = Column(String)
    code = Column(String)
    name = Column(String, nullable=True)
    action = Column(String)  # buy, sell
    price = Column(Float)
    volume = Column(Integer)
    amount = Column(Float)
    commission = Column(Float)
    
    # 关系
    backtest = relationship("Backtest", back_populates="transactions")


class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String, unique=True, index=True)
    definition = Column(Text)
    category = Column(String, nullable=True)


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    type = Column(String)  # tutorial, article, video, tool
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    publish_date = Column(DateTime, nullable=True)
    meta_data = Column(JSON, nullable=True)  # 其他元数据
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)