from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import Optional, List, Dict, Any, Literal
from datetime import date, datetime
import pandas as pd

from app.models.common_models import ErrorResponse
from app.models.stock_models import (
    StockHistDataResponse, 
    StockSpotResponse,
    StockMinDataResponse
)
from app.services import akshare_service
from app.core.logger import logger

router = APIRouter(
    prefix="/stocks",
    tags=["股票数据"]
)


# 依赖函数：验证日期
def validate_dates(
    start_date: date = Query(..., description="开始日期"),
    end_date: date = Query(..., description="结束日期")
):
    if start_date > end_date:
        raise HTTPException(
            status_code=400, 
            detail="开始日期不能晚于结束日期"
        )
    
    # 如果日期范围超过3年，可以考虑限制
    days_diff = (end_date - start_date).days
    if days_diff > 1095:  # 3年约1095天
        logger.warning(f"Large date range requested: {days_diff} days")
        
    return start_date, end_date


@router.get(
    "/{symbol}/historical",
    response_model=StockHistDataResponse,
    responses={
        200: {"description": "成功获取历史数据"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取股票历史K线数据",
    description="获取指定股票的历史日K、周K或月K数据，支持前复权、后复权和不复权",
)
async def get_stock_historical_data(
    symbol: str = Path(..., description="股票代码，如 600000"),
    period: Literal["daily", "weekly", "monthly"] = Query("daily", description="K线周期"),
    adjust: Literal["", "qfq", "hfq"] = Query("", description="复权方式"),
    dates: tuple[date, date] = Depends(validate_dates)
):
    """
    获取股票历史K线数据
    
    - **symbol**: 股票代码，如 600000
    - **period**: K线周期 (daily-日K, weekly-周K, monthly-月K)
    - **start_date**: 开始日期
    - **end_date**: 结束日期
    - **adjust**: 复权方式 (""-不复权, "qfq"-前复权, "hfq"-后复权)
    """
    start_date, end_date = dates
    
    try:
        # 将日期转换为AKShare期望的格式
        start_str = start_date.strftime("%Y%m%d")
        end_str = end_date.strftime("%Y%m%d")
        
        # 调用服务层函数获取数据
        df = await akshare_service.fetch_stock_hist(
            symbol=symbol,
            period=period,
            start_date=start_str,
            end_date=end_str,
            adjust=adjust
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return StockHistDataResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到股票 {symbol} 的历史数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取股票 {symbol} 历史数据时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )


@router.get(
    "/spot",
    response_model=StockSpotResponse,
    responses={
        200: {"description": "成功获取实时行情"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取股票实时行情",
    description="获取所有A股或指定股票的实时行情数据",
)
async def get_stock_spot_data(
    symbol: Optional[str] = Query(None, description="股票代码，不传则获取全部A股")
):
    """
    获取股票实时行情数据
    
    - **symbol**: 可选，股票代码，不传则获取全部A股
    """
    try:
        df = await akshare_service.fetch_stock_spot(symbol=symbol)
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return StockSpotResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到{'股票 ' + symbol if symbol else 'A股'}的实时行情数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取{'股票 ' + symbol if symbol else 'A股'}实时行情时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )


@router.get(
    "/{symbol}/minute",
    response_model=StockMinDataResponse,
    responses={
        200: {"description": "成功获取分钟数据"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取股票分钟K线数据",
    description="获取指定股票的分钟级别K线数据，支持1、5、15、30、60分钟，注意1分钟数据不支持复权",
)
async def get_stock_minute_data(
    symbol: str = Path(..., description="股票代码，如 600000"),
    period: Literal["1", "5", "15", "30", "60"] = Query("5", description="分钟周期"),
    adjust: Literal["", "qfq", "hfq"] = Query("", description="复权方式，注意1分钟数据不支持复权")
):
    """
    获取股票分钟K线数据
    
    - **symbol**: 股票代码，如 600000
    - **period**: 分钟周期 ("1", "5", "15", "30", "60")
    - **adjust**: 复权方式 (""-不复权, "qfq"-前复权, "hfq"-后复权)，注意1分钟数据不支持复权
    """
    try:
        # 调用服务层函数获取分钟数据
        df = await akshare_service.fetch_stock_hist_min(
            symbol=symbol,
            period=period,
            adjust=adjust
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return StockMinDataResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到股票 {symbol} 的 {period} 分钟数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取股票 {symbol} 分钟数据时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )