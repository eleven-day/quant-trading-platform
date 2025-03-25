from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import json
import random
import logging
from datetime import datetime, timedelta
from pathlib import Path
import os

from core.database import get_db
from models.models import Strategy
from strategies import basic, momentum, value

# 日志配置
LOG_DIR: Path = Path("../logs")
LOG_DIR.mkdir(exist_ok=True)
log_file = LOG_DIR / f"strategy_{datetime.now().strftime('%Y%m%d')}.log"

# 配置日志
logger = logging.getLogger("strategy_api")
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

router = APIRouter()

# 策略映射
strategy_modules = {
    "ma_cross": basic.MACrossStrategy,
    "momentum": momentum.MomentumStrategy,
    "value": value.ValueStrategy
}


@router.get("/list")
async def get_strategies(
    db: Session = Depends(get_db)
):
    """
    获取所有策略列表
    """
    logger.info("Request received for get_strategies")
    strategies = db.query(Strategy).all()
    
    # 如果数据库中没有策略，添加预定义策略
    if not strategies:
        logger.info("No strategies found in database, adding predefined strategies")
        # 添加预定义策略
        predefined_strategies = [
            {
                "name": "均线交叉策略",
                "type": "技术分析",
                "description": "使用快速均线和慢速均线的交叉信号进行交易。当快速均线上穿慢速均线时买入，下穿时卖出。",
                "code": "ma_cross",
                "parameters": [
                    {
                        "name": "fast_period",
                        "label": "快速均线周期",
                        "type": "number",
                        "default": 5,
                        "min": 2,
                        "max": 30,
                        "description": "快速移动平均线的周期"
                    },
                    {
                        "name": "slow_period",
                        "label": "慢速均线周期",
                        "type": "number",
                        "default": 20,
                        "min": 5,
                        "max": 60,
                        "description": "慢速移动平均线的周期"
                    }
                ],
                "markets": ["A股", "期货"],
                "risk_level": "中等"
            },
            {
                "name": "动量策略",
                "type": "技术分析",
                "description": "基于价格动量的交易策略。买入过去表现最好的股票，卖出表现最差的股票。",
                "code": "momentum",
                "parameters": [
                    {
                        "name": "lookback_period",
                        "label": "回溯周期",
                        "type": "number",
                        "default": 20,
                        "min": 5,
                        "max": 120,
                        "description": "用于计算动量的历史周期长度"
                    },
                    {
                        "name": "top_n",
                        "label": "选股数量",
                        "type": "number",
                        "default": 5,
                        "min": 1,
                        "max": 20,
                        "description": "选择表现最好的前N只股票"
                    },
                    {
                        "name": "holding_period",
                        "label": "持有周期",
                        "type": "number",
                        "default": 10,
                        "min": 1,
                        "max": 60,
                        "description": "持有股票的天数"
                    }
                ],
                "markets": ["A股"],
                "risk_level": "较高"
            },
            {
                "name": "价值投资策略",
                "type": "基本面分析",
                "description": "基于价值指标选择被低估的股票进行投资。使用市盈率(PE)、市净率(PB)等指标进行选股。",
                "code": "value",
                "parameters": [
                    {
                        "name": "max_pe",
                        "label": "最大市盈率",
                        "type": "number",
                        "default": 15,
                        "min": 1,
                        "max": 50,
                        "description": "选股时考虑的最大市盈率"
                    },
                    {
                        "name": "max_pb",
                        "label": "最大市净率",
                        "type": "number",
                        "default": 1.5,
                        "min": 0.1,
                        "max": 10,
                        "step": 0.1,
                        "description": "选股时考虑的最大市净率"
                    },
                    {
                        "name": "rebalance_period",
                        "label": "再平衡周期",
                        "type": "number",
                        "default": 20,
                        "min": 5,
                        "max": 60,
                        "description": "投资组合再平衡的周期天数"
                    }
                ],
                "markets": ["A股"],
                "risk_level": "中等"
            },
            {
                "name": "网格交易策略",
                "type": "技术分析",
                "description": "在预定义的价格区间内设置等距离的网格，在低位买入，高位卖出，利用市场波动获利。",
                "code": "grid",
                "parameters": [
                    {
                        "name": "grid_levels",
                        "label": "网格数量",
                        "type": "number",
                        "default": 5,
                        "min": 3,
                        "max": 20,
                        "description": "价格区间内的网格数量"
                    },
                    {
                        "name": "price_range_percent",
                        "label": "价格区间百分比",
                        "type": "number",
                        "default": 10,
                        "min": 5,
                        "max": 50,
                        "description": "相对于起始价格的价格区间百分比"
                    }
                ],
                "markets": ["A股", "期货", "加密货币"],
                "risk_level": "中等"
            },
            {
                "name": "趋势跟踪策略",
                "type": "技术分析",
                "description": "使用趋势指标追踪市场趋势，顺势而为。使用移动平均线、布林带等工具识别趋势。",
                "code": "trend_following",
                "parameters": [
                    {
                        "name": "ma_period",
                        "label": "均线周期",
                        "type": "number",
                        "default": 20,
                        "min": 5,
                        "max": 100,
                        "description": "用于判断趋势的移动平均线周期"
                    },
                    {
                        "name": "entry_threshold",
                        "label": "入场阈值",
                        "type": "number",
                        "default": 1.0,
                        "min": 0.5,
                        "max": 5,
                        "step": 0.1,
                        "description": "价格高于/低于均线多少百分比时入场"
                    },
                    {
                        "name": "exit_threshold",
                        "label": "出场阈值",
                        "type": "number",
                        "default": 0.5,
                        "min": 0.1,
                        "max": 3,
                        "step": 0.1,
                        "description": "价格回撤多少百分比时出场"
                    }
                ],
                "markets": ["A股", "期货"],
                "risk_level": "较高"
            }
        ]
        
        for strategy_data in predefined_strategies:
            strategy = Strategy(
                name=strategy_data["name"],
                type=strategy_data["type"],
                description=strategy_data["description"],
                code=strategy_data["code"],
                parameters=strategy_data["parameters"],
                markets=strategy_data["markets"],
                risk_level=strategy_data["risk_level"]
            )
            db.add(strategy)
        
        db.commit()
        strategies = db.query(Strategy).all()
        logger.info(f"Added {len(predefined_strategies)} predefined strategies to database")
    
    result = []
    for strategy in strategies:
        result.append({
            "id": strategy.id,
            "name": strategy.name,
            "type": strategy.type,
            "description": strategy.description,
            "markets": strategy.markets,
            "risk_level": strategy.risk_level
        })
    
    logger.info(f"Returning {len(result)} strategies")
    return result


@router.get("/{strategy_id}")
async def get_strategy_detail(
    strategy_id: int,
    db: Session = Depends(get_db)
):
    """
    获取策略详情
    
    - **strategy_id**: 策略ID
    """
    logger.info(f"Request received for get_strategy_detail with strategy_id={strategy_id}")
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        logger.warning(f"Strategy with id={strategy_id} not found")
        raise HTTPException(status_code=404, detail="策略不存在")
    
    # 生成模拟的策略绩效数据
    logger.debug(f"Generating performance data for strategy_id={strategy_id}")
    days = 180
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y%m%d') for i in range(days, 0, -1)]
    
    # 模拟策略收益率
    np.random.seed(strategy_id)  # 使用策略ID作为随机种子，确保相同策略有相同结果
    strategy_returns = np.cumsum(np.random.normal(0.1, 1, days))
    # 让收益率在10%到30%之间
    strategy_returns = strategy_returns / strategy_returns[-1] * (10 + strategy_id * 5)
    
    # 模拟基准收益率
    benchmark_returns = np.cumsum(np.random.normal(0.05, 1, days))
    # 让基准收益率在5%到15%之间
    benchmark_returns = benchmark_returns / benchmark_returns[-1] * 10
    
    # 绩效指标
    indicators = [
        {
            "name": "年化收益率",
            "strategy": f"{(strategy_returns[-1] / days * 365):.2f}%",
            "benchmark": f"{(benchmark_returns[-1] / days * 365):.2f}%"
        },
        {
            "name": "夏普比率",
            "strategy": f"{np.random.uniform(1, 3):.2f}",
            "benchmark": f"{np.random.uniform(0.5, 1.5):.2f}"
        },
        {
            "name": "最大回撤",
            "strategy": f"{np.random.uniform(5, 20):.2f}%",
            "benchmark": f"{np.random.uniform(10, 30):.2f}%"
        },
        {
            "name": "波动率",
            "strategy": f"{np.random.uniform(10, 20):.2f}%",
            "benchmark": f"{np.random.uniform(15, 25):.2f}%"
        },
        {
            "name": "胜率",
            "strategy": f"{np.random.uniform(50, 70):.2f}%",
            "benchmark": "-"
        },
        {
            "name": "盈亏比",
            "strategy": f"{np.random.uniform(1.5, 2.5):.2f}",
            "benchmark": "-"
        }
    ]
    
    logger.info(f"Returning detail for strategy '{strategy.name}' (id={strategy_id})")
    return {
        "id": strategy.id,
        "name": strategy.name,
        "type": strategy.type,
        "description": strategy.description,
        "parameters": strategy.parameters,
        "markets": strategy.markets,
        "risk_level": strategy.risk_level,
        "code": strategy.code,
        "performance": {
            "dates": dates,
            "strategy": strategy_returns.tolist(),
            "benchmark": benchmark_returns.tolist()
        },
        "indicators": indicators
    }


@router.post("/save")
async def save_strategy(
    strategy_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    保存策略配置
    
    - **strategy_data**: 策略数据
    """
    strategy_id = strategy_data.get("id")
    logger.info(f"Request received for save_strategy with strategy_id={strategy_id}")
    
    if strategy_id:
        strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
        if not strategy:
            logger.warning(f"Strategy with id={strategy_id} not found")
            raise HTTPException(status_code=404, detail="策略不存在")
        
        # 更新策略参数
        if "parameters" in strategy_data:
            logger.info(f"Updating parameters for strategy id={strategy_id}")
            current_params = strategy.parameters
            new_params = {}
            
            for param in current_params:
                param_name = param["name"]
                if param_name in strategy_data["parameters"]:
                    new_params[param_name] = strategy_data["parameters"][param_name]
            
            # 保存参数值
            for i, param in enumerate(strategy.parameters):
                if param["name"] in new_params:
                    strategy.parameters[i]["value"] = new_params[param["name"]]
                    logger.debug(f"Updated parameter {param['name']} = {new_params[param['name']]}")
        
        db.commit()
        logger.info(f"Strategy id={strategy_id} configuration saved successfully")
        
        return {"message": "策略配置已保存"}
    else:
        logger.error("Strategy ID not provided in request data")
        raise HTTPException(status_code=400, detail="请提供策略ID")