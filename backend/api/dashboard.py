from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import datetime
import random
import logging
from pathlib import Path

from core.database import get_db
from data.fetch import fetch_index_daily, fetch_stock_list
from models.models import LearningResource, Backtest

# 日志配置
LOG_DIR: Path = Path("../logs")
LOG_DIR.mkdir(exist_ok=True)
log_file = LOG_DIR / "dashboard.log"

# 配置日志
logger = logging.getLogger("dashboard")
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler(log_file)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

router = APIRouter()


@router.get("/data")
async def get_dashboard_data(
    db: Session = Depends(get_db)
):
    """
    获取仪表盘数据，包括市场概览、指数走势、行业热度、策略表现和学习进度
    """
    logger.info("开始获取仪表盘数据")
    try:
        # 1. 市场概览 - 模拟数据
        logger.info("生成市场概览数据")
        market_overview = {
            "ssec": {
                "value": round(random.uniform(3000, 3300), 2),
                "change": round(random.uniform(-2, 2), 2)
            },
            "szse": {
                "value": round(random.uniform(10000, 11000), 2),
                "change": round(random.uniform(-2, 2), 2)
            },
            "hs300": {
                "value": round(random.uniform(3800, 4100), 2),
                "change": round(random.uniform(-2, 2), 2)
            },
            "gem": {
                "value": round(random.uniform(2000, 2300), 2),
                "change": round(random.uniform(-2, 2), 2)
            }
        }
        
        # 2. 指数走势 - 尝试获取实际数据，失败则使用模拟数据
        end_date = datetime.datetime.now().strftime('%Y%m%d')
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y%m%d')
        
        logger.info(f"获取指数走势数据，时间范围: {start_date} - {end_date}")
        try:
            # 尝试获取实际数据
            ssec_df = fetch_index_daily("000001.SH", start_date, end_date)
            szse_df = fetch_index_daily("399001.SZ", start_date, end_date)
            hs300_df = fetch_index_daily("000300.SH", start_date, end_date)
            
            # 提取数据
            dates = ssec_df["trade_date"].tolist()
            ssec = ssec_df["close"].tolist()
            szse = szse_df["close"].tolist()
            hs300 = hs300_df["close"].tolist()
            logger.info("成功获取实际指数数据")
        except Exception as e:
            logger.warning(f"获取指数数据失败: {str(e)}，将使用模拟数据")
            # 使用模拟数据
            dates = [(datetime.datetime.now() - datetime.timedelta(days=i)).strftime('%Y%m%d') for i in range(30, 0, -1)]
            
            # 生成相关的随机走势
            np.random.seed(0)  # 确保可重复性
            base = np.cumsum(np.random.normal(0, 1, 30))
            ssec = [3100 + b * 50 for b in base]
            szse = [10500 + b * 150 for b in base]
            hs300 = [4000 + b * 80 for b in base]
        
        market_indices = {
            "dates": dates,
            "ssec": ssec,
            "szse": szse,
            "hs300": hs300
        }
        
        # 3. 行业热度图 - 模拟数据
        logger.info("生成行业热度数据")
        sectors = [
            "银行", "保险", "证券", "房地产", "医药", "食品饮料", 
            "家电", "汽车", "电子", "计算机", "通信", "传媒",
            "军工", "建筑", "钢铁", "有色金属", "化工", "石油"
        ]
        
        sector_performance = []
        for sector in sectors:
            # 生成-5%到5%之间的随机值
            change = round(random.uniform(-5, 5), 2)
            sector_performance.append({
                "name": sector,
                "change": change
            })
        
        # 4. 策略表现 - 从回测记录中获取或模拟
        logger.info("获取策略表现数据")
        strategies_data = {
            "strategies": []
        }
        
        # 如果没有足够的策略，添加模拟数据
        while len(strategies_data["strategies"]) < 3:
            # 生成一些随机收益率
            np.random.seed(len(strategies_data["strategies"]))  # 不同的种子
            base = np.cumsum(np.random.normal(0, 1, 15))
            returns = [b * 2 for b in base]  # 收益率在-10%到10%之间
            
            strategies_data["strategies"].append({
                "name": f"策略{len(strategies_data['strategies']) + 1}",
                "returns": returns
            })
        
        # 5. 学习进度 - 从资源记录中获取
        learning_progress = {
            "completed": [],
            "recommended": []
        }
        
        # 已完成课程
        completed_courses = db.query(LearningResource).filter(
            LearningResource.type == "tutorial"
        ).order_by(LearningResource.updated_at.desc()).limit(5).all()
        
        for course in completed_courses:
            meta_data = course.meta_data or {}
            progress = meta_data.get("progress", 0)
            if progress >= 80:  # 假设进度超过80%为已完成
                learning_progress["completed"].append({
                    "id": course.id,
                    "title": course.title,
                    "completionDate": (course.updated_at or datetime.datetime.now()).strftime('%Y-%m-%d')
                })
        
        # 推荐课程
        recommended_courses = db.query(LearningResource).filter(
            LearningResource.type == "tutorial"
        ).order_by(LearningResource.created_at.desc()).limit(5).all()
        
        for course in recommended_courses:
            meta_data = course.meta_data or {}
            learning_progress["recommended"].append({
                "id": course.id,
                "title": course.title,
                "level": "入门" if "入门" in (course.tags or []) else ("进阶" if "进阶" in (course.tags or []) else "高级")
            })
        
        # 返回所有数据
        return {
            "marketOverview": market_overview,
            "marketIndices": market_indices,
            "sectorPerformance": sector_performance,
            "strategiesPerformance": strategies_data,
            "learningProgress": learning_progress
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取仪表盘数据失败: {str(e)}")