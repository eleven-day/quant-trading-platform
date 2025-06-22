from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用基础配置
    app_name: str = "Quantitative Trading Learning Platform"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 8000
    
    # 数据库配置
    database_url: str = "sqlite:///./quant_platform.db"
    
    # JWT配置
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Redis配置
    redis_url: str = "redis://localhost:6379"
    
    # 数据缓存配置
    cache_expire_seconds: int = 300  # 5分钟
    
    # API限流配置
    rate_limit_per_minute: int = 60
    
    # Akshare数据源配置
    akshare_timeout: int = 30
    
    class Config:
        env_file = ".env"


# 全局设置实例
settings = Settings()
