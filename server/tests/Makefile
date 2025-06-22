# 量化交易平台测试 Makefile

.PHONY: help setup test test-unit test-api test-integration test-performance test-all test-coverage test-parallel test-smoke test-stress clean report

# 默认目标
help:
	@echo "量化交易平台测试命令:"
	@echo ""
	@echo "  setup           - 设置测试环境"
	@echo "  test            - 运行所有测试"
	@echo "  test-unit       - 运行单元测试"
	@echo "  test-api        - 运行API测试"
	@echo "  test-integration - 运行集成测试"
	@echo "  test-performance - 运行性能测试"
	@echo "  test-coverage   - 运行测试并生成覆盖率报告"
	@echo "  test-parallel   - 并行运行测试"
	@echo "  test-smoke      - 运行冒烟测试"
	@echo "  test-stress     - 运行压力测试"
	@echo "  report          - 生成HTML测试报告"
	@echo "  clean           - 清理测试文件"

# 设置测试环境
setup:
	@python tests/run_tests.py setup

# 运行所有测试
test:
	@python tests/run_tests.py all

# 运行单元测试
test-unit:
	@python tests/run_tests.py unit

# 运行API测试
test-api:
	@python tests/run_tests.py api

# 运行集成测试
test-integration:
	@python tests/run_tests.py integration

# 运行性能测试
test-performance:
	@python tests/run_tests.py performance

# 运行测试并生成覆盖率报告
test-coverage:
	@python tests/run_tests.py coverage

# 并行运行测试
test-parallel:
	@python tests/run_tests.py parallel

# 运行冒烟测试
test-smoke:
	@python tests/run_tests.py smoke

# 运行压力测试
test-stress:
	@python tests/run_tests.py stress

# 生成HTML测试报告
report:
	@python tests/run_tests.py report

# 清理测试文件
clean:
	@echo "清理测试文件..."
	@rm -rf .pytest_cache/
	@rm -rf htmlcov/
	@rm -rf .coverage
	@rm -rf test_report.html
	@rm -rf __pycache__/
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} +
	@echo "清理完成!"

# 快速测试（仅基本功能）
quick:
	@pytest tests/test_api_data.py::TestDataAPI::test_data_service_health -v

# 详细测试（包含输出）
verbose:
	@pytest tests/ -v -s --tb=long

# 失败时停止
failfast:
	@pytest tests/ -x -v

# 最后失败的测试
lf:
	@pytest tests/ --lf -v

# 重新运行失败的测试
rerun:
	@pytest tests/ --lf --tb=short -v 