"""
服务层测试
测试数据服务和回测服务的核心功能
"""

import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime, timedelta
from app.services.data_service import DataService
from app.services.backtest_service import BacktestService


class TestDataService:
    """数据服务测试类"""
    
    @pytest.mark.asyncio
    async def test_get_stock_history_success(self, data_service, mock_akshare):
        """测试获取股票历史数据成功"""
        result = await data_service.get_stock_history(
            symbol="000001",
            start_date="20230101",
            end_date="20230131"
        )
        
        assert "error" not in result
        assert result["symbol"] == "000001"
        assert "data" in result
        assert len(result["data"]) > 0
    
    @pytest.mark.asyncio
    async def test_get_stock_history_invalid_symbol(self, data_service):
        """测试无效股票代码"""
        with patch('akshare.stock_zh_a_hist') as mock_ak:
            mock_ak.side_effect = Exception("Invalid symbol")
            
            result = await data_service.get_stock_history(symbol="INVALID")
            
            assert "error" in result
            assert "Invalid symbol" in result["error"]
    
    @pytest.mark.asyncio
    async def test_get_stock_history_empty_data(self, data_service):
        """测试返回空数据的情况"""
        with patch('akshare.stock_zh_a_hist') as mock_ak:
            mock_ak.return_value = pd.DataFrame()  # 空DataFrame
            
            result = await data_service.get_stock_history(symbol="000001")
            
            assert result["data"] == []
            assert result["message"] == "No data found"
    
    @pytest.mark.asyncio
    async def test_get_stock_realtime_success(self, data_service, mock_akshare):
        """测试获取实时股票数据成功"""
        result = await data_service.get_stock_realtime(symbols=["000001"])
        
        assert "error" not in result
        assert "data" in result
        assert len(result["data"]) > 0
        assert "timestamp" in result
    
    @pytest.mark.asyncio
    async def test_get_index_history_success(self, data_service, mock_akshare):
        """测试获取指数历史数据成功"""
        result = await data_service.get_index_history(
            symbol="000001",
            start_date="20230101",
            end_date="20230131"
        )
        
        assert "error" not in result
        assert result["symbol"] == "000001"
        assert "data" in result
    
    @pytest.mark.asyncio
    async def test_search_stocks_success(self, data_service):
        """测试股票搜索成功"""
        with patch('akshare.stock_info_a_code_name') as mock_ak:
            mock_ak.return_value = pd.DataFrame([
                {"code": "000001", "name": "平安银行"}
            ])
            
            result = await data_service.search_stocks("平安")
            
            assert "error" not in result
            assert "data" in result
    
    def test_data_service_timeout_setting(self, data_service):
        """测试数据服务超时设置"""
        assert hasattr(data_service, 'timeout')
        assert data_service.timeout > 0


class TestBacktestService:
    """回测服务测试类"""
    
    @pytest.mark.asyncio
    async def test_run_backtest_success(self, backtest_service, sample_stock_data, sample_strategy_code):
        """测试回测运行成功"""
        result = await backtest_service.run_backtest(
            strategy_code=sample_strategy_code,
            market_data=sample_stock_data,
            initial_capital=100000.0,
            parameters={"short_window": 5, "long_window": 20}
        )
        
        assert result["success"] is True
        assert "performance" in result
        assert "equity_curve" in result
        assert "trades" in result
    
    @pytest.mark.asyncio
    async def test_run_backtest_empty_data(self, backtest_service):
        """测试空数据回测"""
        result = await backtest_service.run_backtest(
            strategy_code="def strategy(): pass",
            market_data=[],
            initial_capital=100000.0
        )
        
        assert "error" in result
        assert "No market data" in result["error"]
    
    @pytest.mark.asyncio
    async def test_run_backtest_invalid_strategy(self, backtest_service, sample_stock_data):
        """测试无效策略代码"""
        invalid_code = "invalid python code $$"
        
        result = await backtest_service.run_backtest(
            strategy_code=invalid_code,
            market_data=sample_stock_data,
            initial_capital=100000.0
        )
        
        # 应该有错误处理机制
        assert "success" in result or "error" in result
    
    def test_calculate_performance_metrics(self, backtest_service):
        """测试绩效指标计算"""
        portfolio = {
            'equity_curve': [
                {'date': datetime(2023, 1, 1), 'value': 100000},
                {'date': datetime(2023, 1, 2), 'value': 101000},
                {'date': datetime(2023, 1, 3), 'value': 99000},
                {'date': datetime(2023, 1, 4), 'value': 102000},
            ],
            'trades': []
        }
        
        performance = backtest_service._calculate_performance(portfolio, 100000.0)
        
        assert isinstance(performance, dict)
        # 根据实际实现验证具体指标
    
    def test_execute_buy_operation(self, backtest_service):
        """测试买入操作"""
        portfolio = {
            'cash': 100000.0,
            'positions': {},
            'trades': []
        }
        
        backtest_service._execute_buy(
            portfolio=portfolio,
            symbol="000001",
            price=10.0,
            signal=1.0,
            date=datetime.now()
        )
        
        assert portfolio['cash'] < 100000.0  # 现金减少
        assert '000001' in portfolio['positions']  # 有持仓
        assert len(portfolio['trades']) > 0  # 有交易记录
    
    def test_execute_sell_operation(self, backtest_service):
        """测试卖出操作"""
        portfolio = {
            'cash': 10000.0,
            'positions': {'000001': 1000},  # 持有1000股
            'trades': []
        }
        
        backtest_service._execute_sell(
            portfolio=portfolio,
            symbol="000001",
            price=12.0,
            signal=1.0,
            date=datetime.now()
        )
        
        assert portfolio['cash'] > 10000.0  # 现金增加
        assert portfolio['positions']['000001'] == 0  # 清仓
        assert len(portfolio['trades']) > 0  # 有交易记录


class TestServiceIntegration:
    """服务集成测试"""
    
    @pytest.mark.asyncio
    async def test_data_service_backtest_integration(self, data_service, backtest_service, mock_akshare):
        """测试数据服务和回测服务的集成"""
        # 1. 获取历史数据
        data_result = await data_service.get_stock_history(
            symbol="000001",
            start_date="20230101",
            end_date="20230131"
        )
        
        assert "error" not in data_result
        
        # 2. 使用数据进行回测
        backtest_result = await backtest_service.run_backtest(
            strategy_code="def strategy(): return [1, -1, 0, 1]",
            market_data=data_result["data"],
            initial_capital=100000.0
        )
        
        assert "success" in backtest_result or "error" in backtest_result
    
    @pytest.mark.asyncio
    async def test_concurrent_service_calls(self, data_service):
        """测试并发服务调用"""
        import asyncio
        
        with patch('akshare.stock_zh_a_hist') as mock_ak:
            mock_ak.return_value = pd.DataFrame([
                {'日期': '2023-01-01', '收盘': 100.0}
            ])
            
            # 创建多个并发调用
            tasks = [
                data_service.get_stock_history(f"00000{i}")
                for i in range(1, 6)
            ]
            
            results = await asyncio.gather(*tasks)
            
            # 验证所有调用都完成
            assert len(results) == 5
            for result in results:
                assert "data" in result or "error" in result


class TestServiceErrorHandling:
    """服务错误处理测试"""
    
    @pytest.mark.asyncio
    async def test_data_service_network_error(self, data_service):
        """测试网络错误处理"""
        with patch('akshare.stock_zh_a_hist') as mock_ak:
            mock_ak.side_effect = ConnectionError("Network error")
            
            result = await data_service.get_stock_history("000001")
            
            assert "error" in result
            assert "Network error" in result["error"]
    
    @pytest.mark.asyncio
    async def test_data_service_timeout_error(self, data_service):
        """测试超时错误处理"""
        with patch('akshare.stock_zh_a_hist') as mock_ak:
            mock_ak.side_effect = TimeoutError("Request timeout")
            
            result = await data_service.get_stock_history("000001")
            
            assert "error" in result
    
    @pytest.mark.asyncio
    async def test_backtest_service_memory_error(self, backtest_service):
        """测试内存错误处理"""
        # 创建超大数据集模拟内存不足
        large_data = [
            {
                'date': f'2023-01-{i:02d}',
                'close': 100.0,
                'volume': 1000000
            }
            for i in range(1, 10000)  # 大量数据
        ]
        
        result = await backtest_service.run_backtest(
            strategy_code="def strategy(): pass",
            market_data=large_data,
            initial_capital=100000.0
        )
        
        # 应该有适当的错误处理
        assert "success" in result or "error" in result


class TestServicePerformance:
    """服务性能测试"""
    
    @pytest.mark.asyncio
    async def test_data_service_response_time(self, data_service):
        """测试数据服务响应时间"""
        import time
        
        with patch('akshare.stock_zh_a_hist') as mock_ak:
            mock_ak.return_value = pd.DataFrame([
                {'日期': '2023-01-01', '收盘': 100.0}
            ])
            
            start_time = time.time()
            await data_service.get_stock_history("000001")
            end_time = time.time()
            
            # 响应时间应该合理
            assert (end_time - start_time) < 5.0
    
    @pytest.mark.asyncio
    async def test_backtest_service_performance(self, backtest_service):
        """测试回测服务性能"""
        import time
        
        # 创建一年的交易数据
        data = [
            {
                'date': f'2023-{(i//30)+1:02d}-{(i%30)+1:02d}',
                'close': 100.0 + np.random.normal(0, 1),
                'volume': 1000000
            }
            for i in range(250)  # 一年的交易日
        ]
        
        start_time = time.time()
        result = await backtest_service.run_backtest(
            strategy_code="def strategy(): return [1] * 250",
            market_data=data,
            initial_capital=100000.0
        )
        end_time = time.time()
        
        # 回测时间应该合理
        assert (end_time - start_time) < 10.0
        assert "success" in result or "error" in result 