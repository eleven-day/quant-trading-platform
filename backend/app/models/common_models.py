from pydantic import BaseModel, Field
from typing import List, Dict, Any, Union, Generic, TypeVar

T = TypeVar('T')


class SuccessResponse(BaseModel):
    """标准成功响应模型"""
    data: Union[List[Dict[str, Any]], Dict[str, Any]] = Field(...)
    message: str = "success"


class ErrorResponse(BaseModel):
    """标准错误响应模型"""
    detail: str


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    items: List[T]
    total: int
    page: int
    size: int