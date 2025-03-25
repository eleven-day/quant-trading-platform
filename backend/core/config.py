import os
from pathlib import Path
from typing import Optional, Any, Dict

class Settings:
    PROJECT_NAME: str = "quant_learning_platform"
    PROJECT_VERSION: str = "1.0.0"
    
    # 环境配置
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # 数据库配置
    DATABASE_URL: str = f"sqlite:///{Path('../database/quant_learning.db').absolute()}"
    
    # Akshare配置
    AKSHARE_CONFIG: Dict[str, Any] = {}
    
    # 缓存配置
    CACHE_DIR: Path = Path("../cache")
    
    # 日志配置
    LOG_DIR: Path = Path("../logs")
    
    def __init__(self):
        # 创建必要的目录
        os.makedirs(self.CACHE_DIR, exist_ok=True)
        os.makedirs(self.LOG_DIR, exist_ok=True)
        os.makedirs(Path("../database"), exist_ok=True)

settings = Settings()