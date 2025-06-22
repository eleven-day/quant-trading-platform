#!/usr/bin/env python3
"""
测试运行脚本
提供不同类型的测试运行选项和报告生成
"""

import sys
import os
import argparse
import subprocess
import time
from pathlib import Path


def run_command(cmd, description=""):
    """运行命令并处理输出"""
    print(f"\n{'='*60}")
    if description:
        print(f"运行: {description}")
    print(f"命令: {cmd}")
    print('='*60)
    
    start_time = time.time()
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    end_time = time.time()
    
    print(f"执行时间: {end_time - start_time:.2f}秒")
    
    if result.stdout:
        print("输出:")
        print(result.stdout)
    
    if result.stderr:
        print("错误:")
        print(result.stderr)
    
    return result.returncode == 0


def run_unit_tests():
    """运行单元测试"""
    cmd = "python -m pytest tests/test_services.py -v --tb=short"
    return run_command(cmd, "单元测试")


def run_api_tests():
    """运行API测试"""
    cmd = "python -m pytest tests/test_api_*.py -v --tb=short"
    return run_command(cmd, "API测试")


def run_integration_tests():
    """运行集成测试"""
    cmd = "python -m pytest tests/test_integration.py -v --tb=short"
    return run_command(cmd, "集成测试")


def run_performance_tests():
    """运行性能测试"""
    cmd = "python -m pytest tests/test_performance.py -v --tb=short -s"
    return run_command(cmd, "性能测试")


def run_all_tests():
    """运行所有测试"""
    cmd = "python -m pytest tests/ -v --tb=short"
    return run_command(cmd, "所有测试")


def run_tests_with_coverage():
    """运行测试并生成覆盖率报告"""
    cmd = "python -m pytest tests/ --cov=app --cov-report=html --cov-report=term-missing -v"
    return run_command(cmd, "测试覆盖率")


def run_tests_parallel():
    """并行运行测试"""
    cmd = "python -m pytest tests/ -n auto -v"
    return run_command(cmd, "并行测试")


def run_smoke_tests():
    """运行冒烟测试（快速基本功能测试）"""
    cmd = "python -m pytest tests/test_api_data.py::TestDataAPI::test_data_service_health tests/test_api_strategy.py::TestStrategyAPI::test_list_strategies_success -v"
    return run_command(cmd, "冒烟测试")


def run_stress_tests():
    """运行压力测试"""
    cmd = "python -m pytest tests/test_performance.py::TestScalabilityLimits -v -s"
    return run_command(cmd, "压力测试")


def generate_test_report():
    """生成测试报告"""
    cmd = "python -m pytest tests/ --html=test_report.html --self-contained-html -v"
    return run_command(cmd, "生成测试报告")


def setup_test_environment():
    """设置测试环境"""
    print("设置测试环境...")
    
    # 检查必要的依赖
    required_packages = ["pytest", "pytest-asyncio", "httpx", "psutil"]
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✓ {package} 已安装")
        except ImportError:
            print(f"✗ {package} 未安装")
            print(f"请运行: pip install {package}")
            return False
    
    # 检查测试文件是否存在
    test_files = [
        "tests/conftest.py",
        "tests/test_api_data.py", 
        "tests/test_api_strategy.py",
        "tests/test_services.py",
        "tests/test_integration.py",
        "tests/test_performance.py"
    ]
    
    for test_file in test_files:
        if Path(test_file).exists():
            print(f"✓ {test_file} 存在")
        else:
            print(f"✗ {test_file} 不存在")
            return False
    
    print("测试环境检查完成!")
    return True


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="量化交易平台测试运行器")
    
    parser.add_argument(
        "test_type",
        choices=[
            "unit", "api", "integration", "performance", "all",
            "coverage", "parallel", "smoke", "stress", "report", "setup"
        ],
        help="要运行的测试类型"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="详细输出"
    )
    
    parser.add_argument(
        "--failfast", "-x",
        action="store_true", 
        help="遇到第一个失败就停止"
    )
    
    args = parser.parse_args()
    
    # 切换到项目根目录
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    print(f"当前工作目录: {os.getcwd()}")
    print(f"Python版本: {sys.version}")
    
    success = True
    
    if args.test_type == "setup":
        success = setup_test_environment()
    elif args.test_type == "unit":
        success = run_unit_tests()
    elif args.test_type == "api":
        success = run_api_tests()
    elif args.test_type == "integration":
        success = run_integration_tests()
    elif args.test_type == "performance":
        success = run_performance_tests()
    elif args.test_type == "all":
        success = run_all_tests()
    elif args.test_type == "coverage":
        success = run_tests_with_coverage()
    elif args.test_type == "parallel":
        success = run_tests_parallel()
    elif args.test_type == "smoke":
        success = run_smoke_tests()
    elif args.test_type == "stress":
        success = run_stress_tests()
    elif args.test_type == "report":
        success = generate_test_report()
    
    if success:
        print(f"\n✅ {args.test_type.upper()} 测试完成!")
        sys.exit(0)
    else:
        print(f"\n❌ {args.test_type.upper()} 测试失败!")
        sys.exit(1)


if __name__ == "__main__":
    main() 