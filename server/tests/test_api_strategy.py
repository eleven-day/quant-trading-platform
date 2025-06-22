"""
策略API测试
测试所有策略相关的API端点
"""

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import json
from datetime import datetime


class TestStrategyAPI:
    """策略API测试类"""
    
    def test_create_strategy_success(self, client, sample_strategy_data):
        """测试创建策略成功情况"""
        response = client.post("/api/strategy/", json=sample_strategy_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sample_strategy_data["name"]
        assert data["description"] == sample_strategy_data["description"]
        assert data["status"] == sample_strategy_data["status"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_strategy_invalid_data(self, client):
        """测试创建策略时数据无效"""
        invalid_data = {
            "name": "",  # 空名称
            "code": "",  # 空代码
        }
        
        response = client.post("/api/strategy/", json=invalid_data)
        
        assert response.status_code == 422  # 验证错误
    
    def test_list_strategies_success(self, client):
        """测试获取策略列表成功情况"""
        response = client.get("/api/strategy/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 0
        
        # 如果有数据，验证结构
        if data:
            strategy = data[0]
            assert "id" in strategy
            assert "name" in strategy
            assert "description" in strategy
            assert "code" in strategy
            assert "status" in strategy
    
    def test_list_strategies_with_pagination(self, client):
        """测试带分页的策略列表获取"""
        response = client.get("/api/strategy/", params={"skip": 0, "limit": 10})
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
    
    def test_get_strategy_success(self, client):
        """测试获取单个策略成功情况"""
        response = client.get("/api/strategy/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert "name" in data
        assert "code" in data
        assert "parameters" in data
    
    def test_get_strategy_not_found(self, client):
        """测试获取不存在的策略"""
        response = client.get("/api/strategy/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_update_strategy_success(self, client):
        """测试更新策略成功情况"""
        update_data = {
            "name": "更新后的策略名称",
            "description": "更新后的描述",
            "status": "active"
        }
        
        response = client.put("/api/strategy/1", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["status"] == update_data["status"]
        assert "updated_at" in data
    
    def test_update_strategy_not_found(self, client):
        """测试更新不存在的策略"""
        update_data = {"name": "新名称"}
        
        response = client.put("/api/strategy/999", json=update_data)
        
        assert response.status_code == 404
    
    def test_update_strategy_partial(self, client):
        """测试部分更新策略"""
        update_data = {"name": "仅更新名称"}
        
        response = client.put("/api/strategy/1", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
    
    def test_delete_strategy_success(self, client):
        """测试删除策略成功情况"""
        response = client.delete("/api/strategy/1")
        
        assert response.status_code == 200
        data = response.json()
        assert "deleted successfully" in data["message"]
    
    def test_delete_strategy_not_found(self, client):
        """测试删除不存在的策略"""
        response = client.delete("/api/strategy/999")
        
        assert response.status_code == 404


class TestBacktestAPI:
    """回测API测试类"""
    
    def test_run_backtest_success(self, client, sample_backtest_request):
        """测试运行回测成功情况"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data, \
             patch('app.services.backtest_service.backtest_service.run_backtest') as mock_backtest:
            
            # 模拟数据服务返回
            mock_data.return_value = {
                "data": [
                    {
                        "date": "2023-01-01",
                        "open": 100.0,
                        "close": 101.0,
                        "high": 102.0,
                        "low": 99.0,
                        "volume": 1000000
                    }
                ]
            }
            
            # 模拟回测服务返回
            mock_backtest.return_value = {
                "success": True,
                "performance": {
                    "total_return": 0.15,
                    "sharpe_ratio": 1.2,
                    "max_drawdown": -0.08
                },
                "equity_curve": [],
                "trades": []
            }
            
            response = client.post("/api/strategy/backtest", json=sample_backtest_request)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "performance" in data
            assert "equity_curve" in data
            assert "trades" in data
    
    def test_run_backtest_data_error(self, client, sample_backtest_request):
        """测试回测时数据获取错误"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"error": "Failed to get data"}
            
            response = client.post("/api/strategy/backtest", json=sample_backtest_request)
            
            assert response.status_code == 400
            assert "Failed to get data" in response.json()["detail"]
    
    def test_run_backtest_invalid_request(self, client):
        """测试无效的回测请求"""
        invalid_request = {
            "strategy_id": "invalid",  # 应该是整数
            "start_date": "invalid-date",  # 无效日期格式
        }
        
        response = client.post("/api/strategy/backtest", json=invalid_request)
        
        assert response.status_code == 422  # 验证错误
    
    def test_run_backtest_missing_fields(self, client):
        """测试缺少必需字段的回测请求"""
        incomplete_request = {
            "strategy_id": 1
            # 缺少start_date和end_date
        }
        
        response = client.post("/api/strategy/backtest", json=incomplete_request)
        
        assert response.status_code == 422
    
    def test_get_backtest_result_success(self, client):
        """测试获取回测结果成功情况"""
        response = client.get("/api/strategy/backtest/1")
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "performance" in data
    
    def test_get_backtest_result_not_found(self, client):
        """测试获取不存在的回测结果"""
        response = client.get("/api/strategy/backtest/999")
        
        assert response.status_code == 404


class TestStrategyAPIValidation:
    """策略API验证测试"""
    
    def test_strategy_name_validation(self, client):
        """测试策略名称验证"""
        # 测试空名称
        data = {
            "name": "",
            "code": "def strategy(): pass",
            "status": "draft"
        }
        response = client.post("/api/strategy/", json=data)
        assert response.status_code == 422
        
        # 测试过长名称
        data["name"] = "x" * 256  # 假设限制为255字符
        response = client.post("/api/strategy/", json=data)
        # 根据实际验证规则调整断言
    
    def test_strategy_code_validation(self, client):
        """测试策略代码验证"""
        data = {
            "name": "测试策略",
            "code": "",  # 空代码
            "status": "draft"
        }
        
        response = client.post("/api/strategy/", json=data)
        assert response.status_code == 422
    
    def test_strategy_status_validation(self, client):
        """测试策略状态验证"""
        data = {
            "name": "测试策略",
            "code": "def strategy(): pass",
            "status": "invalid_status"  # 无效状态
        }
        
        response = client.post("/api/strategy/", json=data)
        assert response.status_code == 422
    
    def test_backtest_date_validation(self, client):
        """测试回测日期验证"""
        # 结束日期早于开始日期
        invalid_request = {
            "strategy_id": 1,
            "start_date": "2023-12-31T00:00:00",
            "end_date": "2023-01-01T00:00:00",  # 早于开始日期
            "initial_capital": 100000.0,
            "symbols": ["000001"]
        }
        
        response = client.post("/api/strategy/backtest", json=invalid_request)
        # 根据实际验证逻辑调整断言
    
    def test_backtest_capital_validation(self, client):
        """测试回测资金验证"""
        invalid_request = {
            "strategy_id": 1,
            "start_date": "2023-01-01T00:00:00",
            "end_date": "2023-12-31T00:00:00",
            "initial_capital": -1000.0,  # 负数资金
            "symbols": ["000001"]
        }
        
        response = client.post("/api/strategy/backtest", json=invalid_request)
        # 根据实际验证逻辑调整断言


@pytest.mark.asyncio
class TestStrategyAPIAsync:
    """策略API异步测试"""
    
    async def test_concurrent_strategy_creation(self, async_client):
        """测试并发创建策略"""
        import asyncio
        
        strategy_data = {
            "name": "并发测试策略",
            "code": "def strategy(): pass",
            "status": "draft"
        }
        
        # 创建多个并发请求
        tasks = []
        for i in range(3):
            data = strategy_data.copy()
            data["name"] = f"策略{i+1}"
            task = async_client.post("/api/strategy/", json=data)
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        
        # 验证所有请求都成功
        for response in responses:
            assert response.status_code == 200
    
    async def test_concurrent_backtest_requests(self, async_client):
        """测试并发回测请求"""
        import asyncio
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data, \
             patch('app.services.backtest_service.backtest_service.run_backtest') as mock_backtest:
            
            mock_data.return_value = {"data": []}
            mock_backtest.return_value = {"success": True, "performance": {}}
            
            backtest_request = {
                "strategy_id": 1,
                "start_date": "2023-01-01T00:00:00",
                "end_date": "2023-12-31T00:00:00",
                "initial_capital": 100000.0,
                "symbols": ["000001"]
            }
            
            # 创建多个并发回测请求
            tasks = []
            for i in range(3):
                task = async_client.post("/api/strategy/backtest", json=backtest_request)
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks)
            
            # 验证所有请求都成功
            for response in responses:
                assert response.status_code == 200


class TestStrategyAPIEdgeCases:
    """策略API边界情况测试"""
    
    def test_strategy_with_special_characters(self, client):
        """测试包含特殊字符的策略"""
        data = {
            "name": "策略@#$%^&*()",
            "description": "包含特殊字符的描述！@#￥%……&*（）",
            "code": "# 中文注释\ndef strategy():\n    print('你好世界')\n    return []",
            "status": "draft"
        }
        
        response = client.post("/api/strategy/", json=data)
        assert response.status_code == 200
    
    def test_strategy_with_large_code(self, client):
        """测试包含大量代码的策略"""
        large_code = "# " + "x" * 10000 + "\ndef strategy(): pass"
        
        data = {
            "name": "大代码策略",
            "code": large_code,
            "status": "draft"
        }
        
        response = client.post("/api/strategy/", json=data)
        # 根据实际限制调整断言
    
    def test_backtest_with_many_symbols(self, client):
        """测试包含大量股票代码的回测"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"data": []}
            
            many_symbols = [f"{i:06d}" for i in range(100)]  # 100个股票代码
            
            backtest_request = {
                "strategy_id": 1,
                "start_date": "2023-01-01T00:00:00",
                "end_date": "2023-12-31T00:00:00",
                "initial_capital": 100000.0,
                "symbols": many_symbols
            }
            
            response = client.post("/api/strategy/backtest", json=backtest_request)
            # 根据实际处理能力调整断言
    
    def test_backtest_with_extreme_dates(self, client):
        """测试极端日期的回测"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"data": []}
            
            extreme_request = {
                "strategy_id": 1,
                "start_date": "1990-01-01T00:00:00",  # 很早的日期
                "end_date": "2099-12-31T00:00:00",    # 很晚的日期
                "initial_capital": 100000.0,
                "symbols": ["000001"]
            }
            
            response = client.post("/api/strategy/backtest", json=extreme_request)
            # 根据实际处理能力调整断言 