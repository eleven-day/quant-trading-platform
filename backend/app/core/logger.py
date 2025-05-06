import logging
import sys
from app.core.config import settings

# 配置日志格式
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

# 创建日志实例
logger = logging.getLogger("quant-learning")