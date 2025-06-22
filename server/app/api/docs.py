from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import os
import glob

router = APIRouter(prefix="/api/docs", tags=["学习资源"])


@router.get("/categories")
async def get_doc_categories():
    """获取文档分类"""
    return {
        "categories": [
            {
                "id": "akshare",
                "name": "AkShare文档",
                "description": "AkShare数据接口文档",
                "icon": "📊"
            },
            {
                "id": "tutorials",
                "name": "教程指南",
                "description": "量化交易入门教程",
                "icon": "📚"
            },
            {
                "id": "strategies",
                "name": "策略示例",
                "description": "常见策略实现示例",
                "icon": "💡"
            },
            {
                "id": "api",
                "name": "API文档",
                "description": "平台API使用说明",
                "icon": "🔧"
            }
        ]
    }


@router.get("/list")
async def list_documents(category: str = None):
    """获取文档列表"""
    try:
        docs_path = "docs"
        documents = []
        
        if category == "akshare":
            # 读取akshare文档
            akshare_docs_path = os.path.join(docs_path, "akshare_docs")
            if os.path.exists(akshare_docs_path):
                for file_path in glob.glob(os.path.join(akshare_docs_path, "*.md")):
                    filename = os.path.basename(file_path)
                    title = filename.replace("_sources_", "").replace(".md.txt.md", "").replace("_", " ").title()
                    documents.append({
                        "id": filename.replace(".md", ""),
                        "title": title,
                        "category": "akshare",
                        "path": file_path,
                        "created_at": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
                    })
        else:
            # 默认返回一些示例文档
            documents = [
                {
                    "id": "getting_started",
                    "title": "快速开始",
                    "category": "tutorials",
                    "description": "平台使用入门指南",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "strategy_development",
                    "title": "策略开发指南",
                    "category": "tutorials", 
                    "description": "如何编写和测试交易策略",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "ma_strategy",
                    "title": "移动平均策略",
                    "category": "strategies",
                    "description": "基于移动平均线的经典策略",
                    "created_at": datetime.now().isoformat()
                }
            ]
        
        return {
            "documents": documents,
            "total": len(documents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")


@router.get("/{doc_id}")
async def get_document(doc_id: str):
    """获取文档内容"""
    try:
        # 这里应该从实际文件系统或数据库读取文档内容
        # 现在返回模拟内容
        
        if doc_id == "getting_started":
            content = """
# 快速开始

欢迎使用量化交易学习平台！本指南将帮助您快速上手。

## 1. 平台概述

量化交易学习平台提供以下主要功能：
- 📊 数据获取：实时和历史市场数据
- 💡 策略开发：内置代码编辑器和策略模板
- 📈 回测分析：完整的回测系统和性能分析
- 📚 学习资源：文档、教程和示例代码

## 2. 快速开始

### 步骤1：浏览数据
访问"数据中心"查看可用的市场数据，包括：
- 股票历史数据
- 实时行情
- 指数数据

### 步骤2：创建策略
在"策略开发"模块：
1. 选择策略模板
2. 编辑策略代码
3. 设置参数

### 步骤3：运行回测
1. 选择回测时间范围
2. 设置初始资金
3. 运行回测并查看结果

## 3. 示例策略

```python
# 简单移动平均策略
def ma_strategy(data, short_window=5, long_window=20):
    data['ma_short'] = data['close'].rolling(window=short_window).mean()
    data['ma_long'] = data['close'].rolling(window=long_window).mean()
    
    signals = []
    for i in range(len(data)):
        if data.iloc[i]['ma_short'] > data.iloc[i]['ma_long']:
            signals.append(1)  # 买入
        else:
            signals.append(-1)  # 卖出
    
    return signals
```

## 4. 下一步

- 查看更多策略示例
- 学习技术指标的使用
- 了解风险管理原则
            """
        elif doc_id == "strategy_development":
            content = """
# 策略开发指南

## 策略框架

所有策略都应该遵循统一的框架结构...

## 技术指标

平台提供常用的技术指标库...

## 风险管理

策略中应该包含风险控制机制...
            """
        else:
            content = f"""
# 文档：{doc_id}

这里是文档 {doc_id} 的内容。

## 简介

文档内容...

## 详细说明

更多详细信息...
            """
        
        return {
            "id": doc_id,
            "title": doc_id.replace("_", " ").title(),
            "content": content,
            "format": "markdown",
            "updated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document: {str(e)}")


@router.get("/search")
async def search_documents(query: str):
    """搜索文档"""
    try:
        # 模拟搜索结果
        results = [
            {
                "id": "getting_started",
                "title": "快速开始",
                "snippet": "欢迎使用量化交易学习平台...",
                "category": "tutorials",
                "relevance": 0.9
            }
        ]
        
        # 过滤结果
        filtered_results = [r for r in results if query.lower() in r["title"].lower() or query.lower() in r["snippet"].lower()]
        
        return {
            "query": query,
            "results": filtered_results,
            "total": len(filtered_results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/templates/strategies")
async def get_strategy_templates():
    """获取策略模板"""
    templates = [
        {
            "id": "ma_cross",
            "name": "移动平均交叉策略",
            "description": "基于短期和长期移动平均线交叉的经典策略",
            "code": """
# 移动平均交叉策略
def ma_cross_strategy(data, short_window=5, long_window=20):
    # 计算移动平均线
    data['ma_short'] = data['close'].rolling(window=short_window).mean()
    data['ma_long'] = data['close'].rolling(window=long_window).mean()
    
    # 生成交易信号
    signals = []
    for i in range(len(data)):
        if i < long_window:
            signals.append(0)  # 数据不足
            continue
        
        # 金叉买入，死叉卖出
        if (data.iloc[i]['ma_short'] > data.iloc[i]['ma_long'] and 
            data.iloc[i-1]['ma_short'] <= data.iloc[i-1]['ma_long']):
            signals.append(1)  # 买入信号
        elif (data.iloc[i]['ma_short'] < data.iloc[i]['ma_long'] and 
              data.iloc[i-1]['ma_short'] >= data.iloc[i-1]['ma_long']):
            signals.append(-1)  # 卖出信号
        else:
            signals.append(0)  # 无信号
    
    return signals
            """,
            "parameters": {
                "short_window": {"type": "int", "default": 5, "description": "短期窗口"},
                "long_window": {"type": "int", "default": 20, "description": "长期窗口"}
            }
        },
        {
            "id": "rsi_strategy",
            "name": "RSI策略",
            "description": "基于相对强弱指数的超买超卖策略",
            "code": """
# RSI策略
def rsi_strategy(data, rsi_period=14, oversold=30, overbought=70):
    # 计算RSI
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=rsi_period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=rsi_period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    
    # 生成交易信号
    signals = []
    for i in range(len(data)):
        if i < rsi_period:
            signals.append(0)
            continue
        
        current_rsi = rsi.iloc[i]
        if current_rsi < oversold:
            signals.append(1)  # 超卖买入
        elif current_rsi > overbought:
            signals.append(-1)  # 超买卖出
        else:
            signals.append(0)  # 无信号
    
    return signals
            """,
            "parameters": {
                "rsi_period": {"type": "int", "default": 14, "description": "RSI周期"},
                "oversold": {"type": "int", "default": 30, "description": "超卖阈值"},
                "overbought": {"type": "int", "default": 70, "description": "超买阈值"}
            }
        }
    ]
    
    return {"templates": templates}
