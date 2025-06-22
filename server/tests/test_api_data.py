"""
数据API测试
测试所有数据相关的API端点
"""

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import pandas as pd
from datetime import datetime


class TestDataAPI:
    """数据API测试类"""
    
    def test_get_stock_history_success(self, client):
        """测试获取股票历史数据成功情况"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            # 模拟成功响应
            mock_get.return_value = {
                "symbol": "000001",
                "period": "daily",
                "data": [
                    {
                        "date": "2023-01-01",
                        "open": 100.0,
                        "close": 101.0,
                        "high": 102.0,
                        "low": 99.0,
                        "volume": 1000000
                    }
                ],
                "count": 1,
                "start_date": "20230101",
                "end_date": "20231231"
            }
            
            response = client.get("/api/data/stock/000001/history")
            
            assert response.status_code == 200
            data = response.json()
            assert data["symbol"] == "000001"
            assert len(data["data"]) == 1
            assert data["data"][0]["close"] == 101.0
    
    def test_get_stock_history_with_parameters(self, client):
        """测试带参数的股票历史数据获取"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"symbol": "000002", "data": []}
            
            response = client.get(
                "/api/data/stock/000002/history",
                params={
                    "period": "weekly",
                    "start_date": "20230101",
                    "end_date": "20231231",
                    "adjust": "hfq"
                }
            )
            
            assert response.status_code == 200
            # 验证调用参数
            mock_get.assert_called_once_with(
                symbol="000002",
                period="weekly",
                start_date="20230101",
                end_date="20231231",
                adjust="hfq"
            )
    
    def test_get_stock_history_error(self, client):
        """测试股票历史数据获取错误情况"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"error": "Stock not found"}
            
            response = client.get("/api/data/stock/INVALID/history")
            
            assert response.status_code == 400
            assert "Stock not found" in response.json()["detail"]
    
    def test_get_stock_realtime_success(self, client):
        """测试获取实时股票数据成功情况"""
        with patch('app.services.data_service.data_service.get_stock_realtime') as mock_get:
            mock_get.return_value = {
                "data": [
                    {
                        "symbol": "000001",
                        "name": "平安银行",
                        "price": 10.5,
                        "pct_change": 1.5,
                        "volume": 1000000
                    }
                ],
                "count": 1,
                "timestamp": "2023-01-01T10:00:00"
            }
            
            response = client.get("/api/data/stock/realtime")
            
            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 1
            assert data["data"][0]["symbol"] == "000001"
    
    def test_get_stock_realtime_with_symbols(self, client):
        """测试指定股票代码的实时数据获取"""
        with patch('app.services.data_service.data_service.get_stock_realtime') as mock_get:
            mock_get.return_value = {"data": [], "count": 0}
            
            response = client.get(
                "/api/data/stock/realtime",
                params={"symbols": ["000001", "000002"]}
            )
            
            assert response.status_code == 200
            mock_get.assert_called_once_with(["000001", "000002"])
    
    def test_get_index_history_success(self, client):
        """测试获取指数历史数据成功情况"""
        with patch('app.services.data_service.data_service.get_index_history') as mock_get:
            mock_get.return_value = {
                "symbol": "000001",
                "data": [
                    {
                        "date": "2023-01-01",
                        "open": 3000.0,
                        "close": 3010.0,
                        "high": 3020.0,
                        "low": 2990.0
                    }
                ],
                "count": 1
            }
            
            response = client.get("/api/data/index/000001/history")
            
            assert response.status_code == 200
            data = response.json()
            assert data["symbol"] == "000001"
            assert len(data["data"]) == 1
    
    def test_get_index_history_default_symbol(self, client):
        """测试默认指数代码的历史数据获取"""
        with patch('app.services.data_service.data_service.get_index_history') as mock_get:
            mock_get.return_value = {"symbol": "000001", "data": []}
            
            response = client.get("/api/data/index/000001/history")
            
            assert response.status_code == 200
            # 验证使用了默认参数
            args, kwargs = mock_get.call_args
            assert kwargs["symbol"] == "000001"
    
    def test_search_stocks_success(self, client):
        """测试股票搜索成功情况"""
        with patch('app.services.data_service.data_service.search_stocks') as mock_search:
            mock_search.return_value = {
                "data": [
                    {
                        "symbol": "000001",
                        "name": "平安银行",
                        "market": "深圳"
                    }
                ],
                "count": 1
            }
            
            response = client.get("/api/data/search", params={"keyword": "平安"})
            
            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 1
            assert "平安银行" in data["data"][0]["name"]
    
    def test_search_stocks_missing_keyword(self, client):
        """测试缺少搜索关键词的情况"""
        response = client.get("/api/data/search")
        
        assert response.status_code == 422  # 验证错误
    
    def test_data_service_health(self, client):
        """测试数据服务健康检查"""
        response = client.get("/api/data/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "data_service"
        assert "timestamp" in data


@pytest.mark.asyncio
class TestDataAPIAsync:
    """数据API异步测试类"""
    
    async def test_get_stock_history_async(self, async_client):
        """测试异步获取股票历史数据"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"symbol": "000001", "data": []}
            
            response = await async_client.get("/api/data/stock/000001/history")
            
            assert response.status_code == 200
    
    async def test_concurrent_requests(self, async_client):
        """测试并发请求"""
        import asyncio
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"symbol": "000001", "data": []}
            
            # 创建多个并发请求
            tasks = []
            for i in range(5):
                task = async_client.get(f"/api/data/stock/00000{i+1}/history")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks)
            
            # 验证所有请求都成功
            for response in responses:
                assert response.status_code == 200


class TestDataAPIEdgeCases:
    """数据API边界情况测试"""
    
    def test_special_characters_in_symbol(self, client):
        """测试股票代码中的特殊字符"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"error": "Invalid symbol"}
            
            response = client.get("/api/data/stock/000001@#$/history")
            
            assert response.status_code == 400
    
    def test_very_long_date_range(self, client):
        """测试非常长的日期范围"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"symbol": "000001", "data": []}
            
            response = client.get(
                "/api/data/stock/000001/history",
                params={
                    "start_date": "19900101",
                    "end_date": "20991231"
                }
            )
            
            assert response.status_code == 200
    
    def test_invalid_date_format(self, client):
        """测试无效的日期格式"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"error": "Invalid date format"}
            
            response = client.get(
                "/api/data/stock/000001/history",
                params={
                    "start_date": "invalid-date",
                    "end_date": "also-invalid"
                }
            )
            
            assert response.status_code == 400
    
    def test_empty_symbol_list(self, client):
        """测试空的股票代码列表"""
        with patch('app.services.data_service.data_service.get_stock_realtime') as mock_get:
            mock_get.return_value = {"data": [], "count": 0}
            
            response = client.get("/api/data/stock/realtime", params={"symbols": []})
            
            assert response.status_code == 200
            mock_get.assert_called_once_with([])


class TestDataAPIPerformance:
    """数据API性能测试"""
    
    def test_response_time(self, client):
        """测试响应时间"""
        import time
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            mock_get.return_value = {"symbol": "000001", "data": []}
            
            start_time = time.time()
            response = client.get("/api/data/stock/000001/history")
            end_time = time.time()
            
            assert response.status_code == 200
            assert (end_time - start_time) < 1.0  # 响应时间应小于1秒
    
    def test_large_data_response(self, client):
        """测试大数据量响应"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
            # 模拟大量数据
            large_data = [
                {
                    "date": f"2023-{i:02d}-01",
                    "open": 100.0 + i,
                    "close": 101.0 + i,
                    "high": 102.0 + i,
                    "low": 99.0 + i,
                    "volume": 1000000 + i * 1000
                }
                for i in range(1, 366)  # 一年的数据
            ]
            
            mock_get.return_value = {
                "symbol": "000001",
                "data": large_data,
                "count": len(large_data)
            }
            
            response = client.get("/api/data/stock/000001/history")
            
            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 365
            assert len(data["data"]) == 365 