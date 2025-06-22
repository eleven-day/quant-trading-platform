"""
pytest配置文件
包含测试夹具、配置和公用测试工具
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List
import numpy as np

# 导入应用相关模块
from main import app
from app.core.config import settings
from app.services.data_service import DataService
from app.services.backtest_service import BacktestService


@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client():
    """创建测试客户端"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
async def async_client():
    """创建异步测试客户端"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def data_service():
    """创建数据服务实例"""
    return DataService()


@pytest.fixture
def backtest_service():
    """创建回测服务实例"""
    return BacktestService()


@pytest.fixture
def sample_stock_data():
    """生成示例股票数据"""
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
    dates = dates[dates.weekday < 5]  # 只保留工作日
    
    data = []
    base_price = 100.0
    
    for i, date in enumerate(dates):
        # 生成模拟价格数据
        noise = np.random.normal(0, 0.02)
        price = base_price * (1 + noise)
        
        high = price * (1 + abs(np.random.normal(0, 0.01)))
        low = price * (1 - abs(np.random.normal(0, 0.01)))
        volume = int(np.random.normal(1000000, 200000))
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'symbol': '000001',
            'open': round(price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(price, 2),
            'volume': volume,
            'amount': round(price * volume, 2)
        })
        
        base_price = price
    
    return data


@pytest.fixture
def sample_strategy_code():
    """示例策略代码"""
    return """
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
"""


@pytest.fixture
def sample_strategy_data():
    """示例策略数据"""
    return {
        "name": "测试策略",
        "description": "用于测试的移动平均策略",
        "code": "def strategy(): pass",
        "parameters": {"short_window": 5, "long_window": 20},
        "status": "draft"
    }


@pytest.fixture
def sample_backtest_request():
    """示例回测请求数据"""
    return {
        "strategy_id": 1,
        "start_date": "2023-01-01T00:00:00",
        "end_date": "2023-12-31T00:00:00",
        "initial_capital": 100000.0,
        "symbols": ["000001"]
    }


# Mock数据和工具函数
class MockAkshare:
    """模拟akshare数据"""
    
    @staticmethod
    def stock_zh_a_hist(**kwargs):
        """模拟股票历史数据"""
        dates = pd.date_range(start='2023-01-01', end='2023-01-31', freq='D')
        dates = dates[dates.weekday < 5]
        
        data = []
        for date in dates:
            data.append({
                '日期': date.strftime('%Y-%m-%d'),
                '股票代码': kwargs.get('symbol', '000001'),
                '开盘': 100.0,
                '收盘': 101.0,
                '最高': 102.0,
                '最低': 99.0,
                '成交量': 1000000,
                '成交额': 100000000.0,
                '振幅': 3.0,
                '涨跌幅': 1.0,
                '涨跌额': 1.0,
                '换手率': 2.0
            })
        
        return pd.DataFrame(data)
    
    @staticmethod
    def stock_zh_a_spot_em():
        """模拟实时股票数据"""
        return pd.DataFrame([
            {
                '代码': '000001',
                '名称': '平安银行',
                '最新价': 10.5,
                '涨跌幅': 1.5,
                '涨跌额': 0.15,
                '成交量': 1000000,
                '成交额': 10500000,
                '今开': 10.4,
                '昨收': 10.35,
                '最高': 10.6,
                '最低': 10.3
            }
        ])
    
    @staticmethod
    def index_zh_a_hist(**kwargs):
        """模拟指数历史数据"""
        dates = pd.date_range(start='2023-01-01', end='2023-01-31', freq='D')
        dates = dates[dates.weekday < 5]
        
        data = []
        for date in dates:
            data.append({
                '日期': date.strftime('%Y-%m-%d'),
                '开盘': 3000.0,
                '收盘': 3010.0,
                '最高': 3020.0,
                '最低': 2990.0,
                '成交量': 100000000,
                '成交额': 3000000000.0,
                '振幅': 1.0,
                '涨跌幅': 0.33,
                '涨跌额': 10.0,
                '换手率': 0.5
            })
        
        return pd.DataFrame(data)


@pytest.fixture
def mock_akshare(monkeypatch):
    """模拟akshare模块"""
    import sys
    sys.modules['akshare'] = MockAkshare()
    return MockAkshare()


# 测试配置
TEST_DATABASE_URL = "sqlite:///./test_quant_platform.db"
TEST_REDIS_URL = "redis://localhost:6379/1"

# 重写设置用于测试
class TestSettings:
    app_name = "Test Quantitative Trading Platform"
    debug = True
    database_url = TEST_DATABASE_URL
    redis_url = TEST_REDIS_URL
    secret_key = "test-secret-key"
    akshare_timeout = 5


@pytest.fixture
def test_settings(monkeypatch):
    """测试设置"""
    test_settings = TestSettings()
    monkeypatch.setattr("app.core.config.settings", test_settings)
    return test_settings 