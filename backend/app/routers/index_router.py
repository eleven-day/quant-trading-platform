from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import Optional, List, Dict, Any, Literal
from datetime import date, datetime
import pandas as pd

from app.models.common_models import ErrorResponse
from app.models.index_models import (
    IndexHistDataResponse, 
    IndexSpotResponse,
    IndexMinDataResponse
)
from app.services import akshare_service
from app.core.logger import logger

router = APIRouter(
    prefix="/indices",
    tags=["指数数据"]
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
    response_model=IndexHistDataResponse,
    responses={
        200: {"description": "成功获取历史数据"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取指数历史K线数据",
    description="获取指定指数的历史日K、周K或月K数据",
)
async def get_index_historical_data(
    symbol: str = Path(..., description="指数代码，如 000300"),
    period: Literal["daily", "weekly", "monthly"] = Query("daily", description="K线周期"),
    dates: tuple[date, date] = Depends(validate_dates)
):
    """
    获取指数历史K线数据
    
    - **symbol**: 指数代码，如 000300 (沪深300，不带市场前缀)
    - **period**: K线周期 (daily-日K, weekly-周K, monthly-月K)
    - **start_date**: 开始日期
    - **end_date**: 结束日期
    """
    start_date, end_date = dates
    
    try:
        # 将日期转换为AKShare期望的格式
        start_str = start_date.strftime("%Y%m%d")
        end_str = end_date.strftime("%Y%m%d")
        
        # 调用服务层函数获取数据
        df = await akshare_service.fetch_index_hist(
            symbol=symbol,
            period=period,
            start_date=start_str,
            end_date=end_str
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return IndexHistDataResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到指数 {symbol} 的历史数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取指数 {symbol} 历史数据时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )


@router.get(
    "/spot",
    response_model=IndexSpotResponse,
    responses={
        200: {"description": "成功获取实时行情"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取指数实时行情",
    description="获取指定类别的指数实时行情数据",
)
async def get_index_spot_data(
    category: str = Query("沪深重要指数", description="指数类别，如 沪深重要指数, 上证系列指数 等")
):
    """
    获取指数实时行情数据
    
    - **category**: 指数类别，如 沪深重要指数, 上证系列指数 等
    """
    try:
        df = await akshare_service.fetch_index_spot(category=category)
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return IndexSpotResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到指数类别 {category} 的实时行情数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取指数类别 {category} 实时行情时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )


@router.get(
    "/{symbol}/minute",
    response_model=IndexMinDataResponse,
    responses={
        200: {"description": "成功获取分钟数据"},
        400: {"model": ErrorResponse, "description": "请求参数无效"},
        404: {"model": ErrorResponse, "description": "未找到数据"},
        503: {"model": ErrorResponse, "description": "数据源访问错误"}
    },
    summary="获取指数分钟K线数据",
    description="获取指定指数的分钟级别K线数据，支持1、5、15、30、60分钟",
)
async def get_index_minute_data(
    symbol: str = Path(..., description="指数代码，如 000300"),
    period: Literal["1", "5", "15", "30", "60"] = Query("5", description="分钟周期"),
    start_date: Optional[date] = Query(None, description="开始日期（可选）"),
    end_date: Optional[date] = Query(None, description="结束日期（可选）")
):
    """
    获取指数分钟K线数据
    
    - **symbol**: 指数代码，如 000300 (沪深300，不带市场前缀)
    - **period**: 分钟周期 ("1", "5", "15", "30", "60")
    - **start_date**: 开始日期（可选）
    - **end_date**: 结束日期（可选）
    """
    try:
        # 处理可选的日期参数
        start_str = start_date.strftime("%Y%m%d") if start_date else None
        end_str = end_date.strftime("%Y%m%d") if end_date else None
        
        # 如果只提供了一个日期，则检查
        if (start_date and not end_date) or (end_date and not start_date):
            logger.warning(f"Only one date provided for index minute data: start={start_date}, end={end_date}")
        
        # 如果两个日期都提供了，检查顺序
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=400,
                detail="开始日期不能晚于结束日期"
            )
        
        # 调用服务层函数获取分钟数据
        df = await akshare_service.fetch_index_hist_min(
            symbol=symbol,
            period=period,
            start_date=start_str,
            end_date=end_str
        )
        
        # 将DataFrame转换为JSON可序列化的记录列表
        data = df.to_dict(orient="records")
        
        return IndexMinDataResponse(data=data)
        
    except akshare_service.DataNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"未找到指数 {symbol} 的 {period} 分钟数据: {e}"
        )
    except akshare_service.DataSourceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"数据源错误: {e}"
        )
    except Exception as e:
        logger.error(f"获取指数 {symbol} 分钟数据时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="服务器内部错误，请稍后重试"
        )