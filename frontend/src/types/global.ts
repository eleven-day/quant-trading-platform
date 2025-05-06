// 通用类型定义
export interface ApiResponse<T> {
    data: T;
    message: string;
  }
  
  // HTTP错误
  export interface ApiError {
    detail: string;
  }