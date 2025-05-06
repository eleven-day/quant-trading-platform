from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import stock_router, futures_router, index_router
from app.core.logger import logger

# 创建FastAPI应用实例
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="基于AKShare的量化交易学习系统API",
    version="0.1.0",
    docs_url=None,  # 禁用默认的/docs路径
    redoc_url=None,  # 禁用默认的/redoc路径
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 引入路由
app.include_router(stock_router.router, prefix=settings.API_V1_STR)
app.include_router(futures_router.router, prefix=settings.API_V1_STR)
app.include_router(index_router.router, prefix=settings.API_V1_STR)

# 自定义Swagger UI路径
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - API文档",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url
    )


@app.get("/")
async def root():
    """API根路径，返回基本信息"""
    return {
        "message": "欢迎使用量化交易学习系统API",
        "version": "0.1.0",
        "documentation": "/docs",
        "author": "AKShare量化交易学习系统"
    }


@app.on_event("startup")
async def startup_event():
    """应用启动时执行的事件"""
    logger.info("量化交易学习系统API服务启动")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行的事件"""
    logger.info("量化交易学习系统API服务关闭")


if __name__ == "__main__":
    import uvicorn
    
    # 本地开发运行
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)