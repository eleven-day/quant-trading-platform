from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timedelta
from app.services.data_service import data_service
from app.schemas.strategy import MarketData

router = APIRouter(prefix="/api/data", tags=["数据服务"])


@router.get("/stock/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: str = Query(default="daily", description="数据周期: daily, weekly, monthly"),
    start_date: Optional[str] = Query(default=None, description="开始日期 YYYYMMDD"),
    end_date: Optional[str] = Query(default=None, description="结束日期 YYYYMMDD"),
    adjust: str = Query(default="qfq", description="复权类型: qfq前复权, hfq后复权, \"\"不复权")
):
    """获取股票历史数据"""
    
    # 如果没有指定日期，默认获取最近1年的数据
    if not start_date:
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y%m%d")
    
    result = await data_service.get_stock_history(
        symbol=symbol,
        period=period,
        start_date=start_date,
        end_date=end_date,
        adjust=adjust
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/stock/realtime")
async def get_stock_realtime(
    symbols: Optional[List[str]] = Query(default=None, description="股票代码列表")
):
    """获取实时股票数据"""
    result = await data_service.get_stock_realtime(symbols or [])
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/index/{symbol}/history")
async def get_index_history(
    symbol: str = "000001",
    start_date: Optional[str] = Query(default=None, description="开始日期 YYYYMMDD"),
    end_date: Optional[str] = Query(default=None, description="结束日期 YYYYMMDD")
):
    """获取指数历史数据"""
    
    # 如果没有指定日期，默认获取最近1年的数据
    if not start_date:
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y%m%d")
    
    result = await data_service.get_index_history(
        symbol=symbol,
        start_date=start_date,
        end_date=end_date
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/search")
async def search_stocks(
    keyword: str = Query(..., description="搜索关键词（股票代码或名称）")
):
    """搜索股票"""
    result = await data_service.search_stocks(keyword)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/health")
async def data_service_health():
    """数据服务健康检查"""
    return {"status": "healthy", "service": "data_service", "timestamp": datetime.now()}
