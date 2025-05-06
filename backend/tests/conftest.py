# 放置pytest全局配置
import pytest
import pytest_asyncio

# 设置默认的异步fixture作用域
pytest_plugins = ["pytest_asyncio"]

def pytest_configure(config):
    # 设置默认的异步fixture作用域为function
    config.option.asyncio_default_fixture_loop_scope = "function"