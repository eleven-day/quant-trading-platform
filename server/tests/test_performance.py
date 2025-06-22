"""
性能测试
测试应用的性能指标和负载能力
"""

import pytest
import time
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
import psutil
import os


class TestAPIPerformance:
    """API性能测试"""
    
    def test_single_request_response_time(self, client):
        """测试单个请求响应时间"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            start_time = time.time()
            response = client.get("/api/data/stock/000001/history")
            end_time = time.time()
            
            assert response.status_code == 200
            response_time = end_time - start_time
            assert response_time < 1.0  # 响应时间应小于1秒
    
    def test_concurrent_requests_performance(self, client):
        """测试并发请求性能"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            def make_request():
                return client.get("/api/data/stock/000001/history")
            
            start_time = time.time()
            
            # 使用线程池执行并发请求
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [executor.submit(make_request) for _ in range(50)]
                responses = [future.result() for future in futures]
            
            end_time = time.time()
            
            # 验证所有请求都成功
            assert all(r.status_code == 200 for r in responses)
            
            # 验证总时间合理
            total_time = end_time - start_time
            assert total_time < 10.0  # 50个并发请求应在10秒内完成
    
    def test_large_data_response_performance(self, client):
        """测试大数据量响应性能"""
        # 创建大量模拟数据
        large_data = [
            {
                "date": f"2023-{(i//30)+1:02d}-{(i%30)+1:02d}",
                "open": 100.0 + i * 0.1,
                "close": 100.5 + i * 0.1,
                "high": 101.0 + i * 0.1,
                "low": 99.5 + i * 0.1,
                "volume": 1000000 + i * 1000
            }
            for i in range(1000)  # 1000条记录
        ]
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {
                "symbol": "000001",
                "data": large_data,
                "count": len(large_data)
            }
            
            start_time = time.time()
            response = client.get("/api/data/stock/000001/history")
            end_time = time.time()
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["data"]) == 1000
            
            # 大数据响应时间应合理
            response_time = end_time - start_time
            assert response_time < 5.0


@pytest.mark.asyncio
class TestAsyncPerformance:
    """异步性能测试"""
    
    async def test_async_concurrent_requests(self, async_client):
        """测试异步并发请求"""
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            async def make_request(symbol):
                return await async_client.get(f"/api/data/stock/{symbol}/history")
            
            start_time = time.time()
            
            # 创建100个并发请求
            tasks = [make_request(f"00000{i%5+1}") for i in range(100)]
            responses = await asyncio.gather(*tasks)
            
            end_time = time.time()
            
            # 验证所有请求成功
            assert all(r.status_code == 200 for r in responses)
            
            # 异步并发应该更快
            total_time = end_time - start_time
            assert total_time < 5.0  # 100个异步请求应在5秒内完成


class TestMemoryUsage:
    """内存使用测试"""
    
    def test_memory_usage_single_request(self, client):
        """测试单个请求的内存使用"""
        process = psutil.Process(os.getpid())
        
        # 记录初始内存使用
        initial_memory = process.memory_info().rss
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            # 执行请求
            response = client.get("/api/data/stock/000001/history")
            assert response.status_code == 200
        
        # 记录请求后内存使用
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # 内存增长应该合理（小于10MB）
        assert memory_increase < 10 * 1024 * 1024
    
    def test_memory_usage_multiple_requests(self, client):
        """测试多个请求的内存使用"""
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            # 执行多个请求
            for i in range(50):
                response = client.get(f"/api/data/stock/00000{i%5+1}/history")
                assert response.status_code == 200
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # 多个请求的内存增长应该合理（小于50MB）
        assert memory_increase < 50 * 1024 * 1024


class TestCPUUsage:
    """CPU使用测试"""
    
    def test_cpu_usage_under_load(self, client):
        """测试负载下的CPU使用"""
        
        def cpu_intensive_request():
            with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
                # 模拟一些计算密集的数据
                mock_data.return_value = {
                    "symbol": "000001", 
                    "data": [{"date": f"2023-01-{i:02d}", "close": 100.0} for i in range(1, 32)]
                }
                return client.get("/api/data/stock/000001/history")
        
        # 监控CPU使用率
        process = psutil.Process(os.getpid())
        cpu_percent_before = process.cpu_percent()
        
        start_time = time.time()
        
        # 执行多个CPU密集型请求
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(cpu_intensive_request) for _ in range(20)]
            responses = [future.result() for future in futures]
        
        end_time = time.time()
        cpu_percent_after = process.cpu_percent()
        
        # 验证请求成功
        assert all(r.status_code == 200 for r in responses)
        
        # 验证执行时间合理
        execution_time = end_time - start_time
        assert execution_time < 30.0  # 应在30秒内完成


class TestDatabasePerformance:
    """数据库性能测试（如果使用数据库）"""
    
    def test_strategy_crud_performance(self, client):
        """测试策略CRUD操作性能"""
        
        # 测试创建策略性能
        strategy_data = {
            "name": "性能测试策略",
            "code": "def strategy(): pass",
            "status": "draft"
        }
        
        start_time = time.time()
        response = client.post("/api/strategy/", json=strategy_data)
        create_time = time.time() - start_time
        
        assert response.status_code == 200
        assert create_time < 1.0  # 创建应在1秒内完成
        
        strategy_id = response.json()["id"]
        
        # 测试读取策略性能
        start_time = time.time()
        response = client.get(f"/api/strategy/{strategy_id}")
        read_time = time.time() - start_time
        
        assert response.status_code == 200
        assert read_time < 0.5  # 读取应在0.5秒内完成
        
        # 测试更新策略性能
        update_data = {"name": "更新后的策略名称"}
        start_time = time.time()
        response = client.put(f"/api/strategy/{strategy_id}", json=update_data)
        update_time = time.time() - start_time
        
        assert response.status_code == 200
        assert update_time < 1.0  # 更新应在1秒内完成


class TestScalabilityLimits:
    """可扩展性限制测试"""
    
    def test_maximum_concurrent_connections(self, client):
        """测试最大并发连接数"""
        
        def long_running_request():
            with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
                # 模拟长时间运行的请求
                time.sleep(0.1)  # 模拟处理时间
                mock_data.return_value = {"symbol": "000001", "data": []}
                return client.get("/api/data/stock/000001/history")
        
        # 测试大量并发连接
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = [executor.submit(long_running_request) for _ in range(100)]
            responses = [future.result() for future in futures]
        
        end_time = time.time()
        
        # 验证所有请求都能处理
        success_count = sum(1 for r in responses if r.status_code == 200)
        assert success_count >= 90  # 至少90%的请求成功
        
        # 验证总时间合理
        total_time = end_time - start_time
        assert total_time < 20.0  # 应在合理时间内完成
    
    def test_large_payload_handling(self, client):
        """测试大负载处理"""
        
        # 创建大的策略代码
        large_code = "# " + "x" * 50000 + "\ndef strategy(): pass"
        
        large_strategy = {
            "name": "大负载策略",
            "code": large_code,
            "status": "draft"
        }
        
        start_time = time.time()
        response = client.post("/api/strategy/", json=large_strategy)
        end_time = time.time()
        
        # 根据实际限制验证
        processing_time = end_time - start_time
        assert processing_time < 5.0  # 处理大负载应在5秒内完成


class TestCachePerformance:
    """缓存性能测试"""
    
    def test_repeated_request_caching(self, client):
        """测试重复请求缓存效果"""
        
        with patch('app.services.data_service.data_service.get_stock_history') as mock_data:
            mock_data.return_value = {"symbol": "000001", "data": []}
            
            # 第一次请求（无缓存）
            start_time = time.time()
            response1 = client.get("/api/data/stock/000001/history")
            first_request_time = time.time() - start_time
            
            assert response1.status_code == 200
            
            # 第二次相同请求（可能有缓存）
            start_time = time.time()
            response2 = client.get("/api/data/stock/000001/history")
            second_request_time = time.time() - start_time
            
            assert response2.status_code == 200
            
            # 如果有缓存，第二次请求应该更快
            # 注意：这取决于实际的缓存实现
            print(f"第一次请求时间: {first_request_time:.4f}s")
            print(f"第二次请求时间: {second_request_time:.4f}s") 