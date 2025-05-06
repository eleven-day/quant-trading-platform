from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import Optional, List, Dict, Any, Literal
from datetime import date, datetime
import pandas as pd

from app.models.common_models import ErrorResponse
from app.models.futures_models import (
    FuturesHistDataResponse, 
    FuturesSpotResponse,
    FuturesMinDataResponse
)
from app.services import akshare_service
from app.core.logger import logger

router = APIRouter(
    prefix="/futures",
    tags=["期货数据"]
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
    return start_date, end_date


@router.get(
    "/{symbol}/historical",
    response_model=FuturesHistDataResponse,
    responses={
        200: {"description": "成功获取历史数据"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取期货历史日K线数据",
    description="获取指定期货合约的历史日K线数据",
)
async def get_futures_historical_data(
    symbol: str = Path(..., description="期货代码，如 RB2410 或 RB0（主力连续）"),
    dates: tuple[date, date] = Depends(validate_dates)
):
    """
    获取期货历史日K线数据
    
    - **symbol**: 期货代码，如 RB2410 (螺纹钢2410合约) 或 RB0 (螺纹钢主力连续)
    - **start_date**: 开始日期
    - **end_date**: 结束日期
    """
    start_date, end_date = dates
    
    try:
        # 将日期转换为AKShare期望的格式
        start_str = start_date.strftime("%Y%m%d")
        end_str = end_date.strftime("%Y%m%d")
        
        # 调用服务层函数获取数据
        df = await akshare_service.fetch_futures_hist_daily(
            symbol=symbol,
            start_date=start_str,
            end_date=end_str
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return FuturesHistDataResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到期货 {symbol} 的历史数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取期货 {symbol} 历史数据时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )


@router.get(
    "/{symbol}/spot",
    response_model=FuturesSpotResponse,
    responses={
        200: {"description": "成功获取实时行情"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取期货实时行情",
    description="获取指定期货合约的实时行情数据",
)
async def get_futures_spot_data(
    symbol: str = Path(..., description="期货代码，如 RB2410"),
    market: Literal["CF", "FF"] = Query("CF", description="市场类型，CF-商品期货，FF-金融期货")
):
    """
    获取期货实时行情数据
    
    - **symbol**: 期货代码，如 RB2410
    - **market**: 市场类型 (CF-商品期货, FF-金融期货)
    """
    try:
        df = await akshare_service.fetch_futures_spot(
            symbol=symbol,
            market=market
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return FuturesSpotResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到期货 {symbol} 的实时行情数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取期货 {symbol} 实时行情时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )


@router.get(
    "/{symbol}/minute",
    response_model=FuturesMinDataResponse,
    responses={
        200: {"description": "成功获取分钟数据"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取期货分钟K线数据",
    description="获取指定期货合约的分钟级别K线数据，支持1、5、15、30、60分钟",
)
async def get_futures_minute_data(
    symbol: str = Path(..., description="期货代码，如 RB2410"),
    period: Literal["1", "5", "15", "30", "60"] = Query("5", description="分钟周期")
):
    """
    获取期货分钟K线数据
    
    - **symbol**: 期货代码，如 RB2410
    - **period**: 分钟周期 ("1", "5", "15", "30", "60")
    """
    try:
        # 调用服务层函数获取分钟数据
        df = await akshare_service.fetch_futures_hist_min(
            symbol=symbol,
            period=period
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return FuturesMinDataResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到期货 {symbol} 的 {period} 分钟数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取期货 {symbol} 分钟数据时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )