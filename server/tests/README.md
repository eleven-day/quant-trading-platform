# 量化交易平台测试套件

这是量化交易平台的自动化测试套件，包含完整的测试框架和工具。

## 测试结构

```
tests/
├── __init__.py              # 测试模块初始化
├── conftest.py              # pytest配置和夹具
├── test_api_data.py         # 数据API测试
├── test_api_strategy.py     # 策略API测试
├── test_services.py         # 服务层测试
├── test_integration.py      # 集成测试
├── test_performance.py      # 性能测试
├── run_tests.py            # 测试运行脚本
├── pytest.ini             # pytest配置
├── Makefile               # 测试命令简化
└── README.md              # 测试文档
```

## 测试类型

### 1. 单元测试
- **文件**: `test_services.py`
- **目的**: 测试单个服务和函数的功能
- **运行**: `make test-unit` 或 `python tests/run_tests.py unit`

### 2. API测试
- **文件**: `test_api_data.py`, `test_api_strategy.py`
- **目的**: 测试REST API端点的功能和响应
- **运行**: `make test-api` 或 `python tests/run_tests.py api`

### 3. 集成测试
- **文件**: `test_integration.py`
- **目的**: 测试系统各组件间的协作
- **运行**: `make test-integration` 或 `python tests/run_tests.py integration`

### 4. 性能测试
- **文件**: `test_performance.py`
- **目的**: 测试系统性能和负载能力
- **运行**: `make test-performance` 或 `python tests/run_tests.py performance`

## 快速开始

### 1. 环境设置

```bash
# 检查测试环境
make setup
# 或
python tests/run_tests.py setup
```

### 2. 运行测试

```bash
# 运行所有测试
make test

# 运行特定类型的测试
make test-unit        # 单元测试
make test-api         # API测试
make test-integration # 集成测试
make test-performance # 性能测试

# 运行冒烟测试（快速验证）
make test-smoke

# 生成覆盖率报告
make test-coverage
```

### 3. 高级选项

```bash
# 并行运行测试（更快）
make test-parallel

# 运行压力测试
make test-stress

# 生成HTML报告
make report

# 清理测试文件
make clean
```

## 测试配置

### pytest配置 (`pytest.ini`)
- 测试发现模式
- 标记定义
- 输出配置
- 覆盖率设置

### 测试夹具 (`conftest.py`)
- 测试客户端
- 模拟数据
- 数据库设置
- 公共工具函数

## 编写测试

### 测试命名规范
- 测试文件: `test_*.py`
- 测试类: `Test*`
- 测试函数: `test_*`

### 测试示例

```python
import pytest
from fastapi.testclient import TestClient

class TestDataAPI:
    """数据API测试类"""
    
    def test_get_stock_history_success(self, client):
        """测试获取股票历史数据成功情况"""
        response = client.get("/api/data/stock/000001/history")
        
        assert response.status_code == 200
        data = response.json()
        assert "symbol" in data
        assert "data" in data
    
    @pytest.mark.asyncio
    async def test_async_endpoint(self, async_client):
        """测试异步端点"""
        response = await async_client.get("/api/data/stock/000001/history")
        assert response.status_code == 200
```

### 使用模拟数据

```python
from unittest.mock import patch

def test_with_mock_data(self, client):
    """使用模拟数据的测试"""
    with patch('app.services.data_service.data_service.get_stock_history') as mock_get:
        mock_get.return_value = {"symbol": "000001", "data": []}
        
        response = client.get("/api/data/stock/000001/history")
        assert response.status_code == 200
        mock_get.assert_called_once()
```

## 测试标记

使用pytest标记来分类和选择测试:

```python
@pytest.mark.unit
def test_unit_function():
    """单元测试"""
    pass

@pytest.mark.integration
def test_integration_workflow():
    """集成测试"""
    pass

@pytest.mark.performance
def test_api_performance():
    """性能测试"""
    pass

@pytest.mark.slow
def test_long_running():
    """慢速测试"""
    pass
```

运行特定标记的测试:
```bash
pytest -m unit        # 只运行单元测试
pytest -m "not slow"  # 排除慢速测试
```

## 覆盖率报告

生成覆盖率报告:
```bash
make test-coverage
```

查看HTML报告:
```bash
open htmlcov/index.html  # macOS/Linux
start htmlcov/index.html # Windows
```

## 持续集成

### GitHub Actions示例

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-asyncio httpx
    - name: Run tests
      run: make test
```

## 故障排除

### 常见问题

1. **导入错误**
   ```bash
   # 确保在正确目录
   cd server
   python -m pytest tests/
   ```

2. **模块未找到**
   ```bash
   # 添加到Python路径
   export PYTHONPATH="${PYTHONPATH}:$(pwd)"
   ```

3. **异步测试失败**
   ```bash
   # 安装pytest-asyncio
   pip install pytest-asyncio
   ```

4. **覆盖率报告为空**
   ```bash
   # 确保源码路径正确
   pytest --cov=app tests/
   ```

### 调试测试

```bash
# 详细输出
pytest tests/ -v -s

# 进入调试器
pytest tests/ --pdb

# 只运行失败的测试
pytest tests/ --lf
```

## 最佳实践

1. **测试隔离**: 每个测试应该独立，不依赖其他测试
2. **模拟外部依赖**: 使用mock避免真实的网络请求和数据库操作
3. **清晰的断言**: 使用描述性的断言消息
4. **测试数据管理**: 使用夹具提供一致的测试数据
5. **性能考虑**: 避免不必要的慢速测试
6. **文档化**: 为复杂的测试添加说明

## 贡献指南

1. 为新功能添加相应测试
2. 确保测试覆盖率不降低
3. 遵循现有的测试结构和命名规范
4. 更新相关文档

## 联系方式

如有测试相关问题，请联系开发团队或创建issue。 