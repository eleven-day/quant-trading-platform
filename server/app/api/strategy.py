from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from app.schemas.strategy import (
    Strategy, StrategyCreate, StrategyUpdate, 
    BacktestRequest, BacktestResult
)
from app.services.backtest_service import backtest_service
from app.services.data_service import data_service

router = APIRouter(prefix="/api/strategy", tags=["策略服务"])


@router.post("/", response_model=Strategy)
async def create_strategy(strategy: StrategyCreate):
    """创建新策略"""
    # 这里应该连接到数据库，现在返回模拟数据
    return Strategy(
        id=1,
        user_id=1,
        name=strategy.name,
        description=strategy.description,
        code=strategy.code,
        parameters=strategy.parameters,
        status=strategy.status,
        created_at=datetime.now()
    )


@router.get("/", response_model=List[Strategy])
async def list_strategies(skip: int = 0, limit: int = 100):
    """获取策略列表"""
    # 模拟数据
    return [
        Strategy(
            id=1,
            user_id=1,
            name="MA均线策略",
            description="基于移动平均线的简单交易策略",
            code="""import akshare as ak
import pandas as pd
import numpy as np

def ma_strategy(symbol, short_period=5, long_period=20):
    \"\"\"
    移动平均线策略
    \"\"\"
    # 获取历史数据
    data = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
    
    # 计算移动平均线
    data['MA_short'] = data['收盘'].rolling(window=short_period).mean()
    data['MA_long'] = data['收盘'].rolling(window=long_period).mean()
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[data['MA_short'] > data['MA_long'], 'signal'] = 1  # 买入信号
    data.loc[data['MA_short'] < data['MA_long'], 'signal'] = -1  # 卖出信号
    
    return data

# 示例使用
result = ma_strategy('000001')
print(result.tail())""",
            parameters={"short_period": 5, "long_period": 20},
            status="active",
            created_at=datetime.now()
        ),
        Strategy(
            id=2,
            user_id=1,
            name="MACD策略",
            description="MACD指标交易策略",
            code="""import akshare as ak
import pandas as pd
import numpy as np

def macd_strategy(symbol):
    \"\"\"
    MACD策略
    \"\"\"
    # 获取历史数据
    data = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
    
    # 计算MACD
    exp1 = data['收盘'].ewm(span=12).mean()
    exp2 = data['收盘'].ewm(span=26).mean()
    data['MACD'] = exp1 - exp2
    data['Signal'] = data['MACD'].ewm(span=9).mean()
    data['Histogram'] = data['MACD'] - data['Signal']
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[(data['MACD'] > data['Signal']) & (data['MACD'].shift(1) <= data['Signal'].shift(1)), 'signal'] = 1
    data.loc[(data['MACD'] < data['Signal']) & (data['MACD'].shift(1) >= data['Signal'].shift(1)), 'signal'] = -1
    
    return data

# 示例使用
result = macd_strategy('000001')
print(result.tail())""",
            parameters={"fast": 12, "slow": 26, "signal": 9},
            status="draft",
            created_at=datetime.now()
        )
    ]


@router.get("/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: int):
    """获取单个策略"""
    # 模拟数据
    if strategy_id != 1:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return Strategy(
        id=strategy_id,
        user_id=1,
        name="移动平均策略",
        description="基于双移动平均线的交易策略",
        code="""
# 双移动平均线策略示例
def strategy(data, parameters):
    short_window = parameters.get('short_window', 5)
    long_window = parameters.get('long_window', 20)
    
    # 计算移动平均线
    data['ma_short'] = data['close'].rolling(window=short_window).mean()
    data['ma_long'] = data['close'].rolling(window=long_window).mean()
    
    # 生成交易信号
    signals = []
    for i in range(len(data)):
        if i < long_window:
            signals.append(0)
            continue
        
        if data.iloc[i]['ma_short'] > data.iloc[i]['ma_long']:
            signals.append(1)  # 买入
        else:
            signals.append(-1)  # 卖出
    
    return signals
        """,
        parameters={"short_window": 5, "long_window": 20},
        status="active",
        created_at=datetime.now()
    )


@router.put("/{strategy_id}", response_model=Strategy)
async def update_strategy(strategy_id: int, strategy_update: StrategyUpdate):
    """更新策略"""
    if strategy_id != 1:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    # 这里应该更新数据库，现在返回模拟数据
    return Strategy(
        id=strategy_id,
        user_id=1,
        name=strategy_update.name or "移动平均策略",
        description=strategy_update.description,
        code=strategy_update.code or "# Updated code",
        parameters=strategy_update.parameters or {"short_window": 5, "long_window": 20},
        status=strategy_update.status or "active",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )


@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: int):
    """删除策略"""
    if strategy_id != 1:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return {"message": "Strategy deleted successfully"}


@router.post("/backtest")
async def run_backtest(request: BacktestRequest):
    """运行回测"""
    try:
        # 获取市场数据
        symbol = request.symbols[0] if request.symbols else "000001"
        start_date = request.start_date.strftime("%Y%m%d")
        end_date = request.end_date.strftime("%Y%m%d")
        
        # 获取历史数据
        market_data_result = await data_service.get_stock_history(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date
        )
        
        if "error" in market_data_result:
            raise HTTPException(status_code=400, detail=f"Failed to get market data: {market_data_result['error']}")
        
        market_data = market_data_result["data"]
        
        # 获取策略代码（这里使用默认策略）
        strategy_code = """
# 默认移动平均策略
def strategy(data, parameters):
    return [1 if i % 10 == 0 else 0 for i in range(len(data))]
        """
        
        # 运行回测
        result = await backtest_service.run_backtest(
            strategy_code=strategy_code,
            market_data=market_data,
            initial_capital=request.initial_capital,
            parameters={}
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Backtest failed"))
        
        return {
            "backtest_id": 1,
            "strategy_id": request.strategy_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "initial_capital": request.initial_capital,
            "performance": result["performance"],
            "equity_curve": result["equity_curve"],
            "trades": result["trades"],
            "created_at": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")


@router.get("/backtest/{backtest_id}")
async def get_backtest_result(backtest_id: int):
    """获取回测结果"""
    if backtest_id != 1:
        raise HTTPException(status_code=404, detail="Backtest result not found")
    
    # 模拟回测结果
    return {
        "id": backtest_id,
        "strategy_id": 1,
        "start_date": "2023-01-01",
        "end_date": "2023-12-31", 
        "initial_capital": 100000,
        "final_capital": 112000,
        "total_return": 0.12,
        "sharpe_ratio": 1.5,
        "max_drawdown": -0.08,
        "performance_data": {
            "total_trades": 25,
            "winning_trades": 15,
            "win_rate": 0.6
        },
        "created_at": datetime.now()
    }
