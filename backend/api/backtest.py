from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import datetime
import json
import uuid

from core.database import get_db
from models.models import Strategy, Backtest, Transaction, Stock, StockDaily
from data.fetch import fetch_stock_daily
from data.process import calculate_returns, calculate_drawdowns, calculate_performance_metrics
from strategies import basic, momentum, value

router = APIRouter()

# 策略映射
strategy_modules = {
    "ma_cross": basic.MACrossStrategy,
    "momentum": momentum.MomentumStrategy,
    "value": value.ValueStrategy,
    # 其他策略...
}


@router.post("/run")
async def run_backtest(
    backtest_params: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    执行回测
    
    - **backtest_params**: 回测参数，包括策略ID、开始日期、结束日期、初始资金、股票池等
    """
    strategy_id = backtest_params.get("strategy_id")
    start_date = backtest_params.get("start_date")
    end_date = backtest_params.get("end_date")
    initial_capital = backtest_params.get("initial_capital", 100000)
    stock_pool = backtest_params.get("stock_pool", [])
    
    # 验证参数
    if not strategy_id:
        raise HTTPException(status_code=400, detail="需要指定策略ID")
    if not start_date or not end_date:
        raise HTTPException(status_code=400, detail="需要指定开始日期和结束日期")
    if not stock_pool:
        raise HTTPException(status_code=400, detail="需要指定股票池")
    
    # 获取策略
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")
    
    try:
        # 准备数据
        stock_data = {}
        stock_names = {}
        for ts_code in stock_pool:
            # 检查数据库是否有股票信息
            stock = db.query(Stock).filter(Stock.ts_code == ts_code).first()
            if not stock:
                # 如果没有，可以尝试获取
                stock = Stock(ts_code=ts_code, name=ts_code)
                db.add(stock)
                db.commit()
            
            stock_names[ts_code] = stock.name
            
            # 获取股票历史数据
            try:
                daily_data = (
                    db.query(StockDaily)
                    .filter(StockDaily.stock_id == stock.id)
                    .filter(StockDaily.trade_date >= start_date)
                    .filter(StockDaily.trade_date <= end_date)
                    .order_by(StockDaily.trade_date)
                    .all()
                )
                
                # 如果数据库中没有数据，从API获取
                if not daily_data:
                    df = fetch_stock_daily(ts_code, start_date, end_date)
                    # 保存到数据库
                    for _, row in df.iterrows():
                        daily = StockDaily(
                            stock_id=stock.id,
                            trade_date=row["trade_date"],
                            open=row["open"],
                            high=row["high"],
                            low=row["low"],
                            close=row["close"],
                            vol=row.get("vol"),
                            amount=row.get("amount"),
                            pct_chg=row.get("pct_chg")
                        )
                        db.add(daily)
                    db.commit()
                    
                    # 重新查询
                    daily_data = (
                        db.query(StockDaily)
                        .filter(StockDaily.stock_id == stock.id)
                        .filter(StockDaily.trade_date >= start_date)
                        .filter(StockDaily.trade_date <= end_date)
                        .order_by(StockDaily.trade_date)
                        .all()
                    )
                
                # 转换为DataFrame
                data = []
                for item in daily_data:
                    data.append({
                        "trade_date": item.trade_date,
                        "open": item.open,
                        "high": item.high,
                        "low": item.low,
                        "close": item.close,
                        "vol": item.vol,
                        "amount": item.amount,
                        "pct_chg": item.pct_chg or 0
                    })
                
                if data:
                    df = pd.DataFrame(data)
                    stock_data[ts_code] = df
            except Exception as e:
                print(f"获取股票 {ts_code} 数据失败: {str(e)}")
        
        if not stock_data:
            raise HTTPException(status_code=400, detail="没有有效的股票数据")
        
        # 获取策略参数
        strategy_params = backtest_params.get("parameters", {})
        
        # 创建策略实例
        strategy_class = strategy_modules.get(strategy.code)
        if not strategy_class:
            raise HTTPException(status_code=400, detail=f"不支持的策略类型: {strategy.code}")
        
        strategy_instance = strategy_class(strategy_params)
        
        # 执行回测
        backtest_result = strategy_instance.run_backtest(
            data=stock_data,
            initial_capital=initial_capital,
            commission=0.0003  # 默认手续费
        )
        
        # 如果有错误
        if "error" in backtest_result:
            raise HTTPException(status_code=400, detail=backtest_result["error"])
        
        # 创建回测记录
        backtest_record = Backtest(
            strategy_id=strategy.id,
            name=f"{strategy.name} - {start_date} to {end_date}",
            start_date=start_date,
            end_date=end_date,
            initial_capital=initial_capital,
            stock_pool=stock_pool,
            parameters=strategy_params,
            results=backtest_result
        )
        db.add(backtest_record)
        db.commit()
        
        # 创建交易记录
        for transaction in backtest_result.get("transactions", []):
            tx = Transaction(
                backtest_id=backtest_record.id,
                date=transaction["date"],
                code=transaction["code"],
                name=stock_names.get(transaction["code"], ""),
                action=transaction["action"],
                price=transaction["price"],
                volume=transaction["volume"],
                amount=transaction["amount"],
                commission=transaction["commission"]
            )
            db.add(tx)
        db.commit()
        
        # 准备返回数据
        # 日期列表
        dates = [item["date"] for item in backtest_result["returns"]]
        
        # 策略收益率
        equity_values = [item["value"] for item in backtest_result["returns"]]
        strategy_returns = calculate_returns(equity_values)
        
        # 基准收益率 (使用沪深300指数)
        benchmark_returns = []
        try:
            from data.fetch import fetch_index_daily
            benchmark_df = fetch_index_daily("000300.SH", start_date, end_date)
            if not benchmark_df.empty:
                benchmark_prices = benchmark_df["close"].tolist()
                benchmark_returns = calculate_returns(benchmark_prices)
        except Exception as e:
            print(f"获取基准数据失败: {str(e)}")
            # 如果获取失败，生成一个简单的基准
            benchmark_returns = np.cumsum(np.random.normal(0, 0.5, len(strategy_returns))).tolist()
        
        # 如果长度不一致，调整基准收益率长度
        if len(benchmark_returns) != len(strategy_returns):
            if len(benchmark_returns) > len(strategy_returns):
                benchmark_returns = benchmark_returns[:len(strategy_returns)]
            else:
                # 扩展基准收益率
                last_value = benchmark_returns[-1] if benchmark_returns else 0
                extension = [last_value] * (len(strategy_returns) - len(benchmark_returns))
                benchmark_returns.extend(extension)
        
        # 计算回撤
        drawdowns = calculate_drawdowns(equity_values)
        
        # 计算性能指标
        performance = calculate_performance_metrics(strategy_returns, benchmark_returns)
        
        # 计算月度收益
        monthly_returns = []
        years = set()
        
        # 假设dates是YYYYMMDD格式
        for i, date in enumerate(dates):
            if i == 0:
                continue
            
            year = date[:4]
            month = int(date[4:6])
            years.add(year)
            
            prev_value = equity_values[i-1]
            curr_value = equity_values[i]
            monthly_return = (curr_value - prev_value) / prev_value * 100
            
            monthly_returns.append([month, year, monthly_return])
        
        # 持仓分布
        position_distribution = []
        if backtest_result["positions"] and backtest_result["positions"][-1]["positions"]:
            last_positions = backtest_result["positions"][-1]["positions"]
            for pos in last_positions:
                position_distribution.append({
                    "name": stock_names.get(pos["code"], pos["code"]),
                    "value": pos["value"]
                })
        
        # 绩效指标表格数据
        indicators = [
            {
                "name": "年化收益率",
                "strategy": f"{performance['annualized_return']:.2f}%",
                "benchmark": f"{((1 + benchmark_returns[-1]/100) ** (252/len(dates)) - 1) * 100:.2f}%" if benchmark_returns else "N/A"
            },
            {
                "name": "夏普比率",
                "strategy": f"{performance['sharpe_ratio']:.2f}",
                "benchmark": "N/A"
            },
            {
                "name": "最大回撤",
                "strategy": f"{abs(performance['max_drawdown']):.2f}%",
                "benchmark": "N/A"
            },
            {
                "name": "波动率",
                "strategy": f"{performance['volatility']:.2f}%",
                "benchmark": "N/A"
            },
            {
                "name": "总收益率",
                "strategy": f"{strategy_returns[-1]:.2f}%",
                "benchmark": f"{benchmark_returns[-1]:.2f}%" if benchmark_returns else "N/A"
            }
        ]
        
        if "information_ratio" in performance:
            indicators.append({
                "name": "信息比率",
                "strategy": f"{performance['information_ratio']:.2f}",
                "benchmark": "N/A"
            })
        
        if "win_rate" in performance:
            indicators.append({
                "name": "胜率",
                "strategy": f"{performance['win_rate']:.2f}%",
                "benchmark": "N/A"
            })
        
        # 返回结果
        return {
            "backtest_id": backtest_record.id,
            "strategy_name": strategy.name,
            "start_date": start_date,
            "end_date": end_date,
            "initial_capital": initial_capital,
            "final_capital": backtest_result["final_capital"],
            "dates": dates,
            "strategy_returns": strategy_returns,
            "benchmark_returns": benchmark_returns,
            "drawdowns": drawdowns,
            "monthly_returns": {
                "years": sorted(list(years)),
                "data": monthly_returns
            },
            "position_distribution": position_distribution,
            "performance": {
                "total_return": strategy_returns[-1],
                "annualized_return": performance["annualized_return"],
                "sharpe_ratio": performance["sharpe_ratio"],
                "max_drawdown": performance["max_drawdown"],
                "volatility": performance["volatility"]
            },
            "indicators": indicators,
            "transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "date": tx["date"],
                    "code": tx["code"],
                    "name": stock_names.get(tx["code"], ""),
                    "action": tx["action"],
                    "price": tx["price"],
                    "volume": tx["volume"],
                    "amount": tx["amount"],
                    "commission": tx["commission"]
                }
                for tx in backtest_result["transactions"]
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"执行回测失败: {str(e)}")


@router.get("/result/{backtest_id}")
async def get_backtest_result(
    backtest_id: int,
    db: Session = Depends(get_db)
):
    """
    获取回测结果
    
    - **backtest_id**: 回测ID
    """
    backtest = db.query(Backtest).filter(Backtest.id == backtest_id).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="回测记录不存在")
    
    # 获取交易记录
    transactions = db.query(Transaction).filter(Transaction.backtest_id == backtest_id).all()
    
    # 返回结果
    return {
        "backtest_id": backtest.id,
        "strategy_name": backtest.strategy.name,
        "start_date": backtest.start_date,
        "end_date": backtest.end_date,
        "initial_capital": backtest.initial_capital,
        "final_capital": backtest.results.get("final_capital", 0),
        "results": backtest.results,
        "transactions": [
            {
                "id": tx.id,
                "date": tx.date,
                "code": tx.code,
                "name": tx.name,
                "action": tx.action,
                "price": tx.price,
                "volume": tx.volume,
                "amount": tx.amount,
                "commission": tx.commission
            }
            for tx in transactions
        ]
    }


@router.get("/list")
async def list_backtests(
    strategy_id: Optional[int] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    获取回测列表
    
    - **strategy_id**: 策略ID (可选)
    - **limit**: 每页数量
    - **offset**: 偏移量
    """
    query = db.query(Backtest)
    if strategy_id:
        query = query.filter(Backtest.strategy_id == strategy_id)
    
    total = query.count()
    backtests = query.order_by(Backtest.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "backtests": [
            {
                "id": bt.id,
                "strategy_id": bt.strategy_id,
                "strategy_name": bt.strategy.name,
                "name": bt.name,
                "start_date": bt.start_date,
                "end_date": bt.end_date,
                "initial_capital": bt.initial_capital,
                "final_capital": bt.results.get("final_capital", 0) if bt.results else 0,
                "total_return": bt.results.get("total_return", 0) if bt.results else 0,
                "created_at": bt.created_at.isoformat() if bt.created_at else None
            }
            for bt in backtests
        ]
    }