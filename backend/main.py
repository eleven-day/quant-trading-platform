import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from api import stock_data, strategy, backtest, learning, dashboard
from core.config import settings
from core.database import engine, Base

# 创建表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="量化交易学习平台API",
    description="为量化交易学习平台提供API接口",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置为特定的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(stock_data.router, prefix="/api/stock", tags=["股票数据"])
app.include_router(strategy.router, prefix="/api/strategy", tags=["策略管理"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["回测分析"])
app.include_router(learning.router, prefix="/api/learning", tags=["学习资源"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["仪表盘"])

# 在开发环境中添加静态文件服务
if settings.ENVIRONMENT == "development":
    @app.get("/", include_in_schema=False)
    async def root():
        return {"message": "量化交易学习平台API服务已启动，访问 /docs 查看API文档"}
else:
    # 在生产环境中，提供前端静态文件
    frontend_build_path = Path("../frontend/build")
    if frontend_build_path.exists():
        app.mount("/", StaticFiles(directory=str(frontend_build_path), html=True), name="static")
    else:
        @app.get("/", include_in_schema=False)
        async def root():
            return {"message": "前端文件未找到，请先构建前端项目"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",
        port=8002,
        reload=settings.ENVIRONMENT == "development"
    )