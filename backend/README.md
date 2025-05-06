# 量化交易学习系统后端API

基于AKShare、FastAPI构建的量化交易学习系统后端API服务。

## 功能特点

- 支持股票、期货、指数的历史K线数据获取
- 支持实时行情数据获取
- 支持分钟级别K线数据获取
- 基于FastAPI构建高性能REST API
- 完善的错误处理和日志记录

## 安装与运行

### 环境要求

- Python 3.9 或更高版本
- 依赖库：FastAPI, Uvicorn, AKShare, Pandas等

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/yourusername/quant-learning-backend.git
cd quant-learning-backend
```

API接口
股票数据
获取股票历史K线: GET /api/v1/stocks/{symbol}/historical
获取股票实时行情: GET /api/v1/stocks/spot
获取股票分钟K线: GET /api/v1/stocks/{symbol}/minute
期货数据
获取期货历史K线: GET /api/v1/futures/{symbol}/historical
获取期货实时行情: GET /api/v1/futures/{symbol}/spot
获取期货分钟K线: GET /api/v1/futures/{symbol}/minute
指数数据
获取指数历史K线: GET /api/v1/indices/{symbol}/historical
获取指数实时行情: GET /api/v1/indices/spot
获取指数分钟K线: GET /api/v1/indices/{symbol}/minute