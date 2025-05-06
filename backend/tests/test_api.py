import pytest
import pytest_asyncio  # 注意这里导入了 pytest_asyncio 代替 pytest 来处理异步夹具
import httpx
import asyncio
import pandas as pd
from datetime import datetime, timedelta
import logging
import time
from typing import Dict, Any, List

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("api-test")

# 测试配置
BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 30.0  # 请求超时时间（秒）

# 测试数据
TEST_STOCK_SYMBOL = "600000"  # 浦发银行
TEST_INDEX_SYMBOL = "000300"  # 沪深300
TEST_FUTURES_SYMBOL = "RB2410"  # 螺纹钢期货2410合约
TEST_CONTINUOUS_FUTURES = "RB0"  # 螺纹钢连续


# 修改为 pytest_asyncio.fixture
@pytest_asyncio.fixture
async def client():
    """创建一个异步HTTP客户端作为测试夹具"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        yield client


@pytest.fixture
def date_range():
    """生成最近3个月的日期范围"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    return {
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d")
    }


async def log_response_info(response, endpoint: str):
    """记录响应信息，用于调试"""
    duration = response.elapsed.total_seconds()
    status = response.status_code
    content_size = len(response.content)
    
    if status == 200:
        # 计算返回的数据记录数
        data = response.json().get("data", [])
        records_count = len(data) if isinstance(data, list) else 1
        logger.info(f"✅ {endpoint}: Status {status}, {records_count} records, {content_size/1024:.2f} KB, {duration:.2f}s")
    else:
        detail = response.json().get("detail", "No detail")
        logger.error(f"❌ {endpoint}: Status {status}, Error: {detail}, {duration:.2f}s")


class TestStockAPI:
    """测试股票相关API"""
    
    @pytest.mark.asyncio
    async def test_stock_historical(self, client, date_range):
        """测试获取股票历史数据"""
        endpoint = f"/stocks/{TEST_STOCK_SYMBOL}/historical"
        
        # 测试不同周期和复权方式
        period_adjust_combinations = [
            {"period": "daily", "adjust": ""},  # 日线不复权
            {"period": "daily", "adjust": "qfq"},  # 日线前复权
            {"period": "weekly", "adjust": ""},  # 周线不复权
            {"period": "monthly", "adjust": ""},  # 月线不复权
        ]
        
        for params in period_adjust_combinations:
            # 合并日期范围和其他参数
            query_params = {**date_range, **params}
            
            # 发送请求
            response = await client.get(f"{BASE_URL}{endpoint}", params=query_params)
            await log_response_info(response, f"{endpoint} ({params['period']}, {params['adjust'] or 'no adjust'})")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据结构
            first_record = data["data"][0]
            assert all(field in first_record for field in ["date", "open", "close", "high", "low", "volume"])
    
    @pytest.mark.asyncio
    async def test_stock_spot(self, client):
        """测试获取股票实时行情"""
        # 先测试获取特定股票行情
        endpoint = f"/stocks/spot"
        response = await client.get(f"{BASE_URL}{endpoint}", params={"symbol": TEST_STOCK_SYMBOL})
        await log_response_info(response, f"{endpoint} (single stock)")
        
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert len(data["data"]) > 0
        
        # 验证数据字段
        first_record = data["data"][0]
        assert "symbol" in first_record
        assert "name" in first_record
        assert "price" in first_record
        
        # 测试获取全部股票行情（仅验证状态码，避免大量数据传输）
        response = await client.get(f"{BASE_URL}{endpoint}")
        assert response.status_code == 200
        logger.info(f"✅ {endpoint} (all stocks): Status {response.status_code}, {response.elapsed.total_seconds():.2f}s")
    
    @pytest.mark.asyncio
    async def test_stock_minute(self, client):
        """测试获取股票分钟K线"""
        endpoint = f"/stocks/{TEST_STOCK_SYMBOL}/minute"
        
        # 测试不同分钟周期
        periods = ["1", "5", "15", "30", "60"]
        
        for period in periods:
            # 对于非1分钟周期，测试复权
            adjust = "" if period == "1" else "qfq"
            
            response = await client.get(
                f"{BASE_URL}{endpoint}", 
                params={"period": period, "adjust": adjust}
            )
            await log_response_info(response, f"{endpoint} ({period}min, {adjust or 'no adjust'})")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据字段
            first_record = data["data"][0]
            assert "datetime" in first_record
            assert all(field in first_record for field in ["open", "close", "high", "low", "volume"])


class TestFuturesAPI:
    """测试期货相关API"""
    
    @pytest.mark.asyncio
    async def test_futures_historical(self, client, date_range):
        """测试获取期货历史数据"""
        # 测试具体合约和主力连续合约
        test_symbols = [TEST_FUTURES_SYMBOL, TEST_CONTINUOUS_FUTURES]
        
        for symbol in test_symbols:
            endpoint = f"/futures/{symbol}/historical"
            response = await client.get(f"{BASE_URL}{endpoint}", params=date_range)
            await log_response_info(response, f"{endpoint}")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据字段
            first_record = data["data"][0]
            # 不同期货数据源返回的字段可能略有不同，验证基本字段
            assert "date" in first_record
            assert any(field in first_record for field in ["close", "收盘价"])
    
    @pytest.mark.asyncio
    async def test_futures_spot(self, client):
        """测试获取期货实时行情"""
        endpoint = f"/futures/{TEST_FUTURES_SYMBOL}/spot"
        
        # 测试不同市场
        markets = ["CF", "FF"]  # 商品期货和金融期货
        
        for market in markets:
            # 根据市场类型选择合适的测试合约
            symbol = TEST_FUTURES_SYMBOL if market == "CF" else "IF2406"  # 商品期货用螺纹钢，金融期货用沪深300期指
            
            response = await client.get(
                f"{BASE_URL}/futures/{symbol}/spot", 
                params={"market": market}
            )
            await log_response_info(response, f"/futures/{symbol}/spot ({market})")
            
            # 由于实时数据可能会因为市场状态(非交易时段)而无法获取，所以可能返回404
            if response.status_code == 200:
                data = response.json()
                assert "data" in data
                # 可能会有空数据的情况，如非交易时段
                if len(data["data"]) > 0:
                    first_record = data["data"][0]
                    assert "symbol" in first_record
    
    @pytest.mark.asyncio
    async def test_futures_minute(self, client):
        """测试获取期货分钟K线"""
        endpoint = f"/futures/{TEST_FUTURES_SYMBOL}/minute"
        
        # 测试不同分钟周期
        periods = ["5", "15", "30", "60"]  # 仅测试部分周期以减少测试时间
        
        for period in periods:
            response = await client.get(
                f"{BASE_URL}{endpoint}", 
                params={"period": period}
            )
            await log_response_info(response, f"{endpoint} ({period}min)")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据字段
            first_record = data["data"][0]
            assert "datetime" in first_record
            assert all(field in first_record for field in ["open", "close", "high", "low"])


class TestIndexAPI:
    """测试指数相关API"""
    
    @pytest.mark.asyncio
    async def test_index_historical(self, client, date_range):
        """测试获取指数历史数据"""
        endpoint = f"/indices/{TEST_INDEX_SYMBOL}/historical"
        
        # 测试不同周期
        periods = ["daily", "weekly", "monthly"]
        
        for period in periods:
            response = await client.get(
                f"{BASE_URL}{endpoint}", 
                params={**date_range, "period": period}
            )
            await log_response_info(response, f"{endpoint} ({period})")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据字段
            first_record = data["data"][0]
            assert all(field in first_record for field in ["date", "open", "close", "high", "low", "volume"])
    
    @pytest.mark.asyncio
    async def test_index_spot(self, client):
        """测试获取指数实时行情"""
        endpoint = f"/indices/spot"
        
        # 测试不同指数类别
        categories = ["沪深重要指数", "上证系列指数"]
        
        for category in categories:
            response = await client.get(
                f"{BASE_URL}{endpoint}", 
                params={"category": category}
            )
            await log_response_info(response, f"{endpoint} ({category})")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据字段
            first_record = data["data"][0]
            assert "symbol" in first_record
            assert "name" in first_record
            assert "price" in first_record
    
    @pytest.mark.asyncio
    async def test_index_minute(self, client):
        """测试获取指数分钟K线"""
        endpoint = f"/indices/{TEST_INDEX_SYMBOL}/minute"
        
        # 测试不同分钟周期
        periods = ["5", "15", "30", "60"]  # 仅测试部分周期以减少测试时间
        
        for period in periods:
            response = await client.get(
                f"{BASE_URL}{endpoint}", 
                params={"period": period}
            )
            await log_response_info(response, f"{endpoint} ({period}min)")
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert len(data["data"]) > 0
            
            # 验证数据字段
            first_record = data["data"][0]
            assert "datetime" in first_record
            assert all(field in first_record for field in ["open", "close", "high", "low"])


class TestErrorHandling:
    """测试API错误处理"""
    
    @pytest.mark.asyncio
    async def test_invalid_symbol(self, client, date_range):
        """测试无效的股票代码"""
        invalid_symbol = "000000"  # 通常不存在的代码
        endpoint = f"/stocks/{invalid_symbol}/historical"
        
        response = await client.get(f"{BASE_URL}{endpoint}", params=date_range)
        await log_response_info(response, f"{endpoint} (invalid symbol)")
        
        # 应该返回404 Not Found
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    @pytest.mark.asyncio
    async def test_invalid_date_range(self, client):
        """测试无效的日期范围"""
        endpoint = f"/stocks/{TEST_STOCK_SYMBOL}/historical"
        
        # 结束日期早于开始日期
        invalid_dates = {
            "start_date": "2023-12-31",
            "end_date": "2023-01-01",
            "period": "daily"
        }
        
        response = await client.get(f"{BASE_URL}{endpoint}", params=invalid_dates)
        await log_response_info(response, f"{endpoint} (invalid date range)")
        
        # 应该返回400 Bad Request
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    @pytest.mark.asyncio
    async def test_invalid_period(self, client, date_range):
        """测试无效的周期参数"""
        endpoint = f"/stocks/{TEST_STOCK_SYMBOL}/historical"
        
        # 无效的period值
        invalid_params = {
            **date_range,
            "period": "invalid_period"
        }
        
        response = await client.get(f"{BASE_URL}{endpoint}", params=invalid_params)
        await log_response_info(response, f"{endpoint} (invalid period)")
        
        # 应该返回422 Unprocessable Entity (FastAPI验证错误)
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


class TestPerformance:
    """测试API性能"""
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, client, date_range):
        """测试并发请求处理能力"""
        # 准备一组不同的请求
        requests = [
            (f"/stocks/{TEST_STOCK_SYMBOL}/historical", {**date_range, "period": "daily"}),
            (f"/stocks/spot", {"symbol": TEST_STOCK_SYMBOL}),
            (f"/stocks/{TEST_STOCK_SYMBOL}/minute", {"period": "5"}),
            (f"/indices/{TEST_INDEX_SYMBOL}/historical", {**date_range, "period": "daily"}),
            (f"/indices/spot", {"category": "沪深重要指数"}),
            (f"/futures/{TEST_CONTINUOUS_FUTURES}/historical", date_range),
        ]
        
        # 并发发送请求
        start_time = time.time()
        
        async def send_request(endpoint, params):
            response = await client.get(f"{BASE_URL}{endpoint}", params=params)
            return response, endpoint
        
        tasks = [send_request(endpoint, params) for endpoint, params in requests]
        results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # 检查所有请求是否成功
        all_successful = all(response.status_code == 200 for response, _ in results)
        
        logger.info(f"✅ 并发测试: {len(requests)}个请求, 总耗时{total_time:.2f}秒, 平均{total_time/len(requests):.2f}秒/请求")
        logger.info(f"   所有请求{'成功' if all_successful else '部分失败'}")
        
        assert all_successful, "部分并发请求失败"