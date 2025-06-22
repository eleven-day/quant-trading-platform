"""
集成测试
测试整个应用的端到端功能
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
import json
from datetime import datetime, timedelta


class TestEndToEndWorkflow:
    """端到端工作流测试"""
    
    def test_complete_strategy_workflow(self, client):
        """测试完整的策略工作流：创建->回测->查看结果"""
        
        # 1. 创建策略
        strategy_data = {
            "name": "集成测试策略",
            "description": "用于集成测试的策略",
            "code": """
def strategy(data, parameters):
    return [1, -1, 0, 1, -1]  # 简单的交易信号
""",
            "parameters": {"test_param": 1},
            "status": "active"
        }
        
        create_response = client.post("/api/strategy/", json=strategy_data)
        assert create_response.status_code == 200
        strategy = create_response.json()
        strategy_id = strategy["id"]
        
        # 2. 运行回测
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {
                "data": [
                    {
                        "date": "2023-01-01",
                        "close": 100.0,
                        "volume": 1000000
                    },
                    {
                        "date": "2023-01-02", 
                        "close": 101.0,
                        "volume": 1100000
                    }
                ]
            }
            
            backtest_request = {
                "strategy_id": strategy_id,
                "start_date": "2023-01-01T00:00:00",
                "end_date": "2023-01-31T00:00:00", 
                "initial_capital": 100000.0,
                "symbols": ["000001"]
            }
            
            backtest_response = client.post("/api/strategy/backtest", json=backtest_request)
            assert backtest_response.status_code == 200
            backtest_result = backtest_response.json()
            
            # 验证回测结果结构
            assert "success" in backtest_result or "performance" in backtest_result
        
        # 3. 获取策略详情
        get_response = client.get(f"/api/strategy/{strategy_id}")
        assert get_response.status_code == 200
        retrieved_strategy = get_response.json()
        assert retrieved_strategy["name"] == strategy_data["name"]
    
    def test_data_pipeline_workflow(self, client):
        """测试数据管道工作流：搜索->获取历史->获取实时"""
        
        with patch('app.services.data_service.data_service.search_stocks') as mock_search, \
             patch('app.services.data_service.data_service.get_stock_history') as mock_history, \
             patch('app.services.data_service.data_service.get_stock_realtime') as mock_realtime:
            
            # 1. 搜索股票
            mock_search.return_value = {
                "data": [{"symbol": "000001", "name": "平安银行"}],
                "count": 1
            }
            
            search_response = client.get("/api/data/search", params={"keyword": "平安"})
            assert search_response.status_code == 200
            search_result = search_response.json()
            assert search_result["count"] > 0
            
            symbol = search_result["data"][0]["symbol"]
            
            # 2. 获取历史数据
            mock_history.return_value = {
                "symbol": symbol,
                "data": [{"date": "2023-01-01", "close": 10.5}],
                "count": 1
            }
            
            history_response = client.get(f"/api/data/stock/{symbol}/history")
            assert history_response.status_code == 200
            history_result = history_response.json()
            assert history_result["symbol"] == symbol
            
            # 3. 获取实时数据
            mock_realtime.return_value = {
                "data": [{"symbol": symbol, "price": 10.6}],
                "count": 1
            }
            
            realtime_response = client.get("/api/data/stock/realtime", params={"symbols": [symbol]})
            assert realtime_response.status_code == 200
            realtime_result = realtime_response.json()
            assert realtime_result["count"] > 0


class TestAPIIntegration:
    """API集成测试"""
    
    def test_cross_api_data_consistency(self, client):
        """测试跨API数据一致性"""
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_history, \
             patch('app.services.data_service.data_service.get_stock_realtime') as mock_realtime:
            
            # 设置一致的模拟数据
            symbol = "000001"
            mock_history.return_value = {
                "symbol": symbol,
                "data": [{"date": "2023-01-01", "close": 10.5, "symbol": symbol}]
            }
            mock_realtime.return_value = {
                "data": [{"symbol": symbol, "price": 10.6}]
            }
            
            # 获取历史数据
            history_response = client.get(f"/api/data/stock/{symbol}/history")
            history_data = history_response.json()
            
            # 获取实时数据
            realtime_response = client.get("/api/data/stock/realtime", params={"symbols": [symbol]})
            realtime_data = realtime_response.json()
            
            # 验证数据一致性
            assert history_data["symbol"] == symbol
            assert realtime_data["data"][0]["symbol"] == symbol
    
    def test_api_error_propagation(self, client):
        """测试API错误传播"""
        
        # 测试数据服务错误如何传播到策略服务
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"error": "Data service unavailable"}
            
            backtest_request = {
                "strategy_id": 1,
                "start_date": "2023-01-01T00:00:00",
                "end_date": "2023-01-31T00:00:00",
                "initial_capital": 100000.0,
                "symbols": ["000001"]
            }
            
            response = client.post("/api/strategy/backtest", json=backtest_request)
            assert response.status_code == 400
            assert "Data service unavailable" in response.json()["detail"]


@pytest.mark.asyncio
class TestAsyncIntegration:
    """异步集成测试"""
    
    async def test_concurrent_api_calls(self, async_client):
        """测试并发API调用"""
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            # 创建多个并发请求
            tasks = []
            for i in range(10):
                task = async_client.get(f"/api/data/stock/00000{i%3+1}/history")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks)
            
            # 验证所有请求都成功完成
            for response in responses:
                assert response.status_code == 200
    
    async def test_mixed_api_concurrent_access(self, async_client):
        """测试混合API并发访问"""
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data, \
             patch('app.services.data_service.data_service.get_stock_realtime') as mock_realtime:
            
            mock_data.return_value = {"symbol": "000001", "data": []}
            mock_realtime.return_value = {"data": []}
            
            # 混合不同类型的API调用
            tasks = [
                async_client.get("/api/data/stock/000001/history"),
                async_client.get("/api/data/stock/realtime"),
                async_client.get("/api/strategy/"),
                async_client.get("/api/data/index/000001/history"),
                async_client.get("/health")
            ]
            
            responses = await asyncio.gather(*tasks)
            
            # 验证所有不同类型的请求都成功
            for response in responses:
                assert response.status_code == 200


class TestSystemIntegration:
    """系统集成测试"""
    
    def test_application_startup(self, client):
        """测试应用启动和基本功能"""
        
        # 测试根路径
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        
        # 测试健康检查
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_cors_configuration(self, client):
        """测试CORS配置"""
        
        # 发送带Origin头的请求
        headers = {"Origin": "http://localhost:3000"}
        response = client.get("/", headers=headers)
        
        assert response.status_code == 200
        # 根据实际CORS配置验证响应头
    
    def test_api_documentation_access(self, client):
        """测试API文档访问"""
        
        # 测试OpenAPI文档
        response = client.get("/docs")
        assert response.status_code == 200
        
        # 测试ReDoc文档
        response = client.get("/redoc")
        assert response.status_code == 200


class TestDataConsistency:
    """数据一致性测试"""
    
    def test_strategy_backtest_data_consistency(self, client):
        """测试策略和回测数据一致性"""
        
        # 创建策略
        strategy_data = {
            "name": "一致性测试策略",
            "code": "def strategy(): pass",
            "parameters": {"param1": "value1"},
            "status": "active"
        }
        
        create_response = client.post("/api/strategy/", json=strategy_data)
        strategy = create_response.json()
        strategy_id = strategy["id"]
        
        # 使用相同参数运行多次回测
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {
                "data": [
                    {"date": "2023-01-01", "close": 100.0},
                    {"date": "2023-01-02", "close": 101.0}
                ]
            }
            
            backtest_request = {
                "strategy_id": strategy_id,
                "start_date": "2023-01-01T00:00:00",
                "end_date": "2023-01-02T00:00:00",
                "initial_capital": 100000.0,
                "symbols": ["000001"]
            }
            
            # 运行多次回测
            results = []
            for _ in range(3):
                response = client.post("/api/strategy/backtest", json=backtest_request)
                if response.status_code == 200:
                    results.append(response.json())
            
            # 验证结果一致性（如果实现是确定性的）
            if len(results) > 1:
                # 根据实际实现验证一致性
                pass


class TestErrorRecovery:
    """错误恢复测试"""
    
    def test_service_failure_recovery(self, client):
        """测试服务故障恢复"""
        
        # 模拟服务故障
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            # 第一次调用失败
            mock_data.side_effect = [
                {"error": "Service temporarily unavailable"},
                {"symbol": "000001", "data": [{"date": "2023-01-01", "close": 100.0}]}  # 第二次成功
            ]
            
            # 第一次请求失败
            response1 = client.get("/api/data/stock/000001/history")
            assert response1.status_code == 400
            
            # 第二次请求成功
            response2 = client.get("/api/data/stock/000001/history")
            assert response2.status_code == 200
    
    def test_partial_failure_handling(self, client):
        """测试部分故障处理"""
        
        with patch('app.services.data_service.data_service.get_stock_realtime') as mock_realtime:
            # 模拟部分数据获取成功
            mock_realtime.return_value = {
                "data": [{"symbol": "000001", "price": 10.5}],
                "errors": ["Failed to get data for 000002"],
                "count": 1
            }
            
            response = client.get("/api/data/stock/realtime", params={"symbols": ["000001", "000002"]})
            assert response.status_code == 200
            
            data = response.json()
            assert data["count"] == 1  # 只有一个成功


class TestPerformanceIntegration:
    """性能集成测试"""
    
    def test_system_load_handling(self, client):
        """测试系统负载处理"""
        import time
        import threading
        
        results = []
        
        def make_request():
            with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
                mock_data.return_value = {"symbol": "000001", "data": []}
                response = client.get("/api/data/stock/000001/history")
                results.append(response.status_code)
        
        # 创建多个并发线程
        threads = []
        for _ in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
        
        start_time = time.time()
        
        # 启动所有线程
        for thread in threads:
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
        
        end_time = time.time()
        
        # 验证性能
        assert len(results) == 10
        assert all(status == 200 for status in results)
        assert (end_time - start_time) < 5.0  # 所有请求应在5秒内完成