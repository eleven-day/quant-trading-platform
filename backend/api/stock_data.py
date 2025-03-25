from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import tushare as ts
import datetime
import akshare as ak
import logging
from pathlib import Path
import os

from core.database import get_db
from core.config import settings
from models.models import Stock, StockDaily

# 日志配置
LOG_DIR = Path("../logs")
os.makedirs(LOG_DIR, exist_ok=True)

# 创建logger
logger = logging.getLogger("stock_data")
logger.setLevel(logging.INFO)

# 添加文件处理器
file_handler = logging.FileHandler(LOG_DIR / "stock_data.log")
file_handler.setLevel(logging.INFO)

# 添加控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# 设置日志格式
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# 添加处理器到logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

router = APIRouter()

# Initialize pro as None at module level
pro = None

# 尝试初始化Tushare
try:
    if settings.TUSHARE_TOKEN:
        ts.set_token(settings.TUSHARE_TOKEN)
        pro = ts.pro_api()
        logger.info("Tushare API initialized successfully")
except Exception as e:
    logger.error(f"Tushare initialization failed: {e}")
    pro = None

@router.get("/list")
async def get_stock_list(
    db: Session = Depends(get_db),
    market: Optional[str] = None,
    industry: Optional[str] = None,
    refresh: bool = False
):
    """
    获取股票列表
    
    - **market**: 市场类型，例如'主板'、'中小板'、'创业板'
    - **industry**: 行业类型
    - **refresh**: 是否刷新数据
    """
    global pro
    logger.info(f"Getting stock list with market={market}, industry={industry}, refresh={refresh}")
    
    # 如果需要刷新或数据库中没有数据，则从API获取
    count = db.query(Stock).count()
    if refresh or count == 0:
        logger.info(f"Refreshing stock data (current count: {count})")
        try:
            # 先尝试使用Tushare
            if pro:
                logger.info("Using Tushare API to fetch stock list")
                stocks_df = pro.stock_basic(exchange='', list_status='L', 
                                         fields='ts_code,name,industry,area,market,list_date,is_hs')
            # 如果Tushare不可用，使用Akshare
            else:
                logger.info("Using Akshare API to fetch stock list")
                stocks_df = ak.stock_info_a_code_name()
                stocks_df = stocks_df.rename(columns={'code': 'ts_code', 'name': 'name'})
                stocks_df['industry'] = None
                stocks_df['area'] = None
                stocks_df['market'] = None
                stocks_df['list_date'] = None
                stocks_df['is_hs'] = None
            
            logger.info(f"Retrieved {len(stocks_df)} stocks, updating database")
            
            # 更新数据库
            for _, row in stocks_df.iterrows():
                stock = db.query(Stock).filter(Stock.ts_code == row['ts_code']).first()
                if stock:
                    # 更新现有记录
                    for key, value in row.items():
                        setattr(stock, key, value)
                else:
                    # 创建新记录
                    stock = Stock(**row.to_dict())
                    db.add(stock)
            db.commit()
            logger.info("Database updated successfully")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update stock list: {str(e)}")
            # 如果获取数据失败但数据库中已有数据，不抛出异常
            if count == 0:
                logger.error(f"No existing data available and API fetch failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"获取股票列表失败: {str(e)}")
    
    # 查询数据库
    query = db.query(Stock)
    if market:
        query = query.filter(Stock.market == market)
    if industry:
        query = query.filter(Stock.industry == industry)
    
    stocks = query.all()
    logger.info(f"Retrieved {len(stocks)} stocks from database with filters")
    
    # 转换为字典列表
    result = []
    for stock in stocks:
        stock_dict = {
            "ts_code": stock.ts_code,
            "name": stock.name,
            "industry": stock.industry,
            "area": stock.area,
            "market": stock.market,
            "list_date": stock.list_date,
            "is_hs": stock.is_hs
        }
        result.append(stock_dict)
    
    return result


@router.get("/history")
async def get_stock_history(
    ts_code: str = Query(..., description="股票代码"),
    start_date: str = Query(None, description="开始日期，格式YYYYMMDD"),
    end_date: str = Query(None, description="结束日期，格式YYYYMMDD"),
    db: Session = Depends(get_db)
):
    """
    获取股票历史数据
    
    - **ts_code**: 股票代码，例如'000001.SZ'
    - **start_date**: 开始日期，格式YYYYMMDD
    - **end_date**: 结束日期，格式YYYYMMDD
    """
    logger.info(f"Getting history for {ts_code} from {start_date} to {end_date}")
    
    # 默认日期设置
    if not end_date:
        end_date = datetime.datetime.now().strftime('%Y%m%d')
    if not start_date:
        start_date = (datetime.datetime.now() - datetime.timedelta(days=365)).strftime('%Y%m%d')
    
    logger.info(f"Using date range: {start_date} to {end_date}")
    
    # 查找股票
    stock = db.query(Stock).filter(Stock.ts_code == ts_code).first()
    if not stock:
        logger.info(f"Stock {ts_code} not found in database, trying to fetch from API")
        # 尝试获取股票信息
        try:
            if pro:
                logger.info("Using Tushare to get stock info")
                df = pro.stock_basic(ts_code=ts_code)
                if not df.empty:
                    stock = Stock(
                        ts_code=df.iloc[0]['ts_code'],
                        name=df.iloc[0]['name'],
                        industry=df.iloc[0].get('industry'),
                        area=df.iloc[0].get('area'),
                        market=df.iloc[0].get('market'),
                        list_date=df.iloc[0].get('list_date'),
                        is_hs=df.iloc[0].get('is_hs')
                    )
                    db.add(stock)
                    db.commit()
                    logger.info(f"Added new stock {ts_code} to database")
                else:
                    logger.error(f"Stock {ts_code} not found in Tushare")
                    raise HTTPException(status_code=404, detail=f"股票 {ts_code} 不存在")
            else:
                # 使用akshare获取
                logger.info("Using Akshare to get stock info")
                stock_info = ak.stock_individual_info_em(symbol=ts_code.split('.')[0])
                stock = Stock(
                    ts_code=ts_code,
                    name=stock_info.iloc[0]['value'] if not stock_info.empty else ts_code
                )
                db.add(stock)
                db.commit()
                logger.info(f"Added new stock {ts_code} to database using Akshare")
        except Exception as e:
            logger.error(f"Failed to get stock info: {str(e)}")
            raise HTTPException(status_code=500, detail=f"获取股票信息失败: {str(e)}")
    
    # 获取历史数据
    try:
        # 检查数据库中是否已有数据
        daily_data = (
            db.query(StockDaily)
            .filter(StockDaily.stock_id == stock.id)
            .filter(StockDaily.trade_date >= start_date)
            .filter(StockDaily.trade_date <= end_date)
            .order_by(StockDaily.trade_date.desc())
            .all()
        )
        
        logger.info(f"Found {len(daily_data)} history records in database")
        
        # 如果数据库中没有完整数据，则从API获取
        if not daily_data:
            logger.info("No history data in database, fetching from API")
            # 从Tushare获取
            if pro:
                logger.info("Using Tushare to get history data")
                df = pro.daily(ts_code=ts_code, start_date=start_date, end_date=end_date)
            # 从Akshare获取
            else:
                logger.info("Using Akshare to get history data")
                df = ak.stock_zh_a_hist(symbol=ts_code.split('.')[0], 
                                      start_date=start_date, 
                                      end_date=end_date,
                                      adjust="qfq")
                df = df.rename(columns={
                    '日期': 'trade_date',
                    '开盘': 'open',
                    '最高': 'high',
                    '最低': 'low',
                    '收盘': 'close',
                    '成交量': 'vol',
                    '成交额': 'amount',
                    '涨跌幅': 'pct_chg'
                })
                df['trade_date'] = df['trade_date'].str.replace('-', '')
            
            logger.info(f"Retrieved {len(df) if not df.empty else 0} history records from API")
            
            # 保存到数据库
            if not df.empty:
                for _, row in df.iterrows():
                    daily = StockDaily(
                        stock_id=stock.id,
                        trade_date=row['trade_date'],
                        open=row['open'],
                        high=row['high'],
                        low=row['low'],
                        close=row['close'],
                        vol=row.get('vol'),
                        amount=row.get('amount'),
                        pct_chg=row.get('pct_chg')
                    )
                    db.add(daily)
                db.commit()
                logger.info("History data saved to database")
                
                # 重新查询
                daily_data = (
                    db.query(StockDaily)
                    .filter(StockDaily.stock_id == stock.id)
                    .filter(StockDaily.trade_date >= start_date)
                    .filter(StockDaily.trade_date <= end_date)
                    .order_by(StockDaily.trade_date.desc())
                    .all()
                )
                logger.info(f"Re-queried {len(daily_data)} history records from database")
        
        # 转换为结果
        history = []
        for data in daily_data:
            history.append({
                "trade_date": data.trade_date,
                "open": data.open,
                "high": data.high,
                "low": data.low,
                "close": data.close,
                "vol": data.vol,
                "amount": data.amount,
                "pct_chg": data.pct_chg or 0
            })
        
        return {
            "ts_code": stock.ts_code,
            "name": stock.name,
            "history": history
        }
    except Exception as e:
        logger.error(f"Failed to get stock history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取历史数据失败: {str(e)}")


@router.get("/indices")
async def get_market_indices(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    获取市场指数数据
    
    - **start_date**: 开始日期，格式YYYYMMDD
    - **end_date**: 结束日期，格式YYYYMMDD
    """
    logger.info(f"Getting market indices from {start_date} to {end_date}")
    
    try:
        # 默认日期设置
        if not end_date:
            end_date = datetime.datetime.now().strftime('%Y%m%d')
        if not start_date:
            start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y%m%d')
        
        logger.info(f"Using date range: {start_date} to {end_date}")
        
        # 获取指数数据
        indices = {
            '000001.SH': '上证指数',
            '399001.SZ': '深证成指',
            '000300.SH': '沪深300',
            '399006.SZ': '创业板指'
        }
        
        result = {}
        for code, name in indices.items():
            try:
                logger.info(f"Fetching index data for {name} ({code})")
                # 尝试使用tushare
                if pro:
                    logger.info("Using Tushare for index data")
                    df = pro.index_daily(ts_code=code, start_date=start_date, end_date=end_date)
                # 使用akshare
                else:
                    logger.info("Using Akshare for index data")
                    code_map = {
                        '000001.SH': '000001',
                        '399001.SZ': '399001',
                        '000300.SH': '000300',
                        '399006.SZ': '399006'
                    }
                    df = ak.stock_zh_index_daily(symbol=code_map[code])
                    df = df.reset_index()
                    df = df.rename(columns={
                        'date': 'trade_date',
                        'open': 'open',
                        'high': 'high',
                        'low': 'low',
                        'close': 'close',
                        'volume': 'vol'
                    })
                    df['trade_date'] = df['trade_date'].dt.strftime('%Y%m%d')
                    df = df[(df['trade_date'] >= start_date) & (df['trade_date'] <= end_date)]
                
                # 转换结果
                if not df.empty:
                    logger.info(f"Retrieved {len(df)} records for {name}")
                    dates = df['trade_date'].tolist()
                    closes = df['close'].tolist()
                    result[code] = {
                        'name': name,
                        'dates': dates,
                        'closes': closes
                    }
                else:
                    logger.warning(f"No data found for {name}")
            except Exception as e:
                logger.error(f"Failed to get data for {name}: {str(e)}")
        
        logger.info(f"Returning data for {len(result)} indices")
        return result
    except Exception as e:
        logger.error(f"Failed to get market indices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取市场指数数据失败: {str(e)}")