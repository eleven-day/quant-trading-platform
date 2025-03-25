from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta

from core.database import get_db
from models.models import GlossaryTerm, LearningResource

# 日志配置
LOG_DIR: Path = Path("../logs")
LOG_DIR.mkdir(exist_ok=True)

logger = logging.getLogger("learning_api")
logger.setLevel(logging.INFO)

# 文件处理器
file_handler = logging.FileHandler(LOG_DIR / "learning_api.log")
file_handler.setLevel(logging.INFO)

# 控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# 格式化器
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# 添加处理器
logger.addHandler(file_handler)
logger.addHandler(console_handler)

router = APIRouter()


@router.get("/glossary")
async def get_glossary(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取量化交易术语表
    
    - **category**: 类别 (可选)
    - **search**: 搜索关键词 (可选)
    """
    logger.info(f"获取术语表请求: category={category}, search={search}")
    query = db.query(GlossaryTerm)
    
    if category:
        query = query.filter(GlossaryTerm.category == category)
    
    if search:
        query = query.filter(
            GlossaryTerm.term.ilike(f"%{search}%") | 
            GlossaryTerm.definition.ilike(f"%{search}%")
        )
    
    terms = query.all()
    
    # 如果数据库中没有术语，添加一些预定义术语
    if not terms:
        logger.info("术语表为空，添加预定义术语")
        # 添加常用术语
        common_terms = {
            '量化交易': '使用数学模型和计算机算法来制定交易决策的投资方法',
            '回测': '在历史数据上测试交易策略的表现，以评估其可能的未来表现',
            'alpha': '投资组合相对于基准的超额收益',
            '贝塔': '衡量证券或投资组合相对于市场波动性的指标',
            '夏普比率': '每单位风险的超额收益，用于衡量投资组合的风险调整后收益',
            '最大回撤': '从高点到随后低点的最大损失百分比',
            '动量策略': '基于价格趋势的延续性设计的交易策略',
            '价值投资': '寻找市场价格低于其内在价值的证券的投资策略',
            '均线': '在指定时间段内价格的平均线，常用于判断趋势',
            '波动率': '证券价格变化幅度的统计度量',
            '流动性': '资产买卖的难易程度',
            '基准': '用于比较投资组合表现的标准',
            'RSI': '相对强弱指标，衡量价格变动的强度',
            'MACD': '平滑异同移动平均线，用于判断价格趋势',
            'KDJ': '随机指标，用于判断价格超买超卖',
            '布林带': '由移动平均线加减标准差构成的价格通道',
            '套利': '利用市场价格差异同时买入和卖出相关资产获利',
            '头寸': '投资者持有的特定证券数量',
            '做多': '买入证券预期价格上涨',
            '做空': '卖出证券预期价格下跌',
            '止损': '设定交易止损点以限制潜在损失',
            '滑点': '下单价格与实际成交价格之间的差异',
            '手续费': '交易所或经纪商收取的交易费用',
            '回报率': '投资收益与投资成本的比率',
            '年化收益': '将投资收益转换为年度基准的表示方法',
            '风险平价': '分配资产权重使每个资产对投资组合风险的贡献相等',
            '技术分析': '通过研究历史价格和交易量来预测市场走势',
            '基本面分析': '通过研究经济、行业和公司因素评估证券价值',
            '资产配置': '将投资分配到不同资产类别以优化风险回报',
            '再平衡': '定期调整投资组合以维持目标资产配置',
            '因子投资': '基于特定因子(如价值、动量)设计的投资策略',
            'A股': '人民币普通股票，在中国大陆证券交易所上市',
            '沪深300': '由上海和深圳证券交易所中规模大、流动性好的300只股票组成的指数',
            '中证500': '由中小市值公司组成的指数，代表中国A股市场中小盘股票',
            '创业板': '中国深圳证券交易所设立的板块，主要服务于创新型企业'
        }
        
        for term, definition in common_terms.items():
            category = '基础术语' if '策略' not in term.lower() else '策略术语'
            db_term = GlossaryTerm(
                term=term,
                definition=definition,
                category=category
            )
            db.add(db_term)
        
        db.commit()
        logger.info(f"添加了 {len(common_terms)} 个预定义术语")
        
        # 重新查询
        terms = db.query(GlossaryTerm).all()
    
    # 转换为字典
    glossary = {term.term: term.definition for term in terms}
    logger.info(f"返回 {len(glossary)} 个术语")
    
    return glossary


@router.get("/resources")
async def get_learning_resources(
    resource_type: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取学习资源
    
    - **resource_type**: 资源类型 (教程、文章、视频、工具)
    - **tag**: 标签
    - **search**: 搜索关键词
    """
    logger.info(f"获取学习资源请求: type={resource_type}, tag={tag}, search={search}")
    query = db.query(LearningResource)
    
    if resource_type:
        query = query.filter(LearningResource.type == resource_type)
    
    if tag:
        # 这里使用JSON包含查询，根据具体数据库可能需要调整
        query = query.filter(LearningResource.tags.like(f'%"{tag}"%'))
    
    if search:
        query = query.filter(
            LearningResource.title.ilike(f"%{search}%") | 
            LearningResource.description.ilike(f"%{search}%")
        )
    
    resources = query.all()
    
    # 如果数据库中没有资源，添加一些示例资源
    if not resources:
        logger.info("学习资源为空，添加示例资源")
        # 添加示例教程
        tutorials = [
            {
                "title": "量化交易入门指南",
                "type": "tutorial",
                "description": "适合初学者的量化交易入门教程，介绍基本概念和方法论",
                "tags": ["入门", "基础"],
                "lessons": 12,
                "duration": "3小时20分钟",
                "students": 1250,
                "progress": 0,
                "topics": ["量化交易基础", "数据获取", "回测框架"]
            },
            {
                "title": "技术分析策略开发",
                "type": "tutorial",
                "description": "学习如何使用技术指标开发交易策略，并通过回测评估策略效果",
                "tags": ["进阶", "策略", "技术"],
                "lessons": 8,
                "duration": "2小时45分钟",
                "students": 980,
                "progress": 0,
                "topics": ["技术指标", "策略逻辑", "参数优化"]
            },
            {
                "title": "基本面量化分析",
                "type": "tutorial",
                "description": "学习如何使用财务数据和基本面指标进行量化分析和策略开发",
                "tags": ["进阶", "基本面"],
                "lessons": 10,
                "duration": "4小时15分钟",
                "students": 820,
                "progress": 0,
                "topics": ["财务数据分析", "基本面指标", "多因子模型"]
            },
            {
                "title": "机器学习在量化交易中的应用",
                "type": "tutorial",
                "description": "探索如何将机器学习算法应用于量化交易策略开发",
                "tags": ["高级", "机器学习"],
                "lessons": 15,
                "duration": "6小时30分钟",
                "students": 650,
                "progress": 0,
                "topics": ["监督学习", "无监督学习", "强化学习", "深度学习"]
            },
            {
                "title": "量化投资组合管理",
                "type": "tutorial",
                "description": "学习如何构建和管理多策略量化投资组合，实现稳定收益",
                "tags": ["高级", "组合管理"],
                "lessons": 9,
                "duration": "3小时50分钟",
                "students": 730,
                "progress": 0,
                "topics": ["资产配置", "风险管理", "绩效归因"]
            }
        ]
        
        # 添加示例文章
        articles = [
            {
                "title": "均值回归策略详解",
                "type": "article",
                "description": "深入分析均值回归策略的原理、实现方法和优化技巧",
                "author": "张量化",
                "date": "2023-03-15",
                "views": 3250,
                "tags": ["策略", "技术"],
                "summary": "均值回归是一种经典的量化交易策略，基于价格最终会回归到均值的假设。本文详细介绍了均值回归策略的数学原理、实现方法、参数选择以及在不同市场环境下的表现。通过回测数据分析，我们发现该策略在震荡市场中表现出色，但在趋势市场中可能面临挑战。文章还提供了几种改进方法，帮助提高策略的稳定性和盈利能力。"
            },
            {
                "title": "量化交易中的风险管理",
                "type": "article",
                "description": "探讨量化交易中常见的风险类型及有效的风险控制方法",
                "author": "李风控",
                "date": "2023-04-22",
                "views": 2780,
                "tags": ["风控", "基础"],
                "summary": "风险管理是量化交易成功的关键因素之一。本文系统性地介绍了量化交易中常见的风险类型，包括市场风险、流动性风险、模型风险等，并提供了针对性的风险度量和控制方法。通过设置止损、仓位管理、分散投资等技术，可以有效降低投资组合的波动性，提高风险调整后收益。文章还分享了几个真实案例，展示了良好风险管理如何在市场动荡时期保护资本。"
            },
            {
                "title": "A股市场异常因子研究",
                "type": "article",
                "description": "对A股市场特有的异常因子进行实证研究，发现潜在的alpha来源",
                "author": "王研究",
                "date": "2023-05-10",
                "views": 2150,
                "tags": ["A股", "因子"],
                "summary": "市场异常是量化投资中寻找alpha的重要来源。本文基于2010-2022年A股数据，研究了多种市场异常因子的有效性，包括小市值效应、价值效应、动量效应等。研究发现，A股市场的异常因子表现出明显的周期性和结构性特征，某些因子在特定行业或市场环境下表现更佳。文章还分析了这些异常现象背后的可能成因，并讨论了如何将这些发现应用于实际投资策略的构建。"
            },
            {
                "title": "量化策略回测中的常见陷阱",
                "type": "article",
                "description": "揭示回测过程中容易被忽视的问题，帮助避免回测美好而实盘失败的情况",
                "author": "赵实战",
                "date": "2023-06-05",
                "views": 3650,
                "tags": ["回测", "实战"],
                "summary": "策略回测是量化交易中必不可少的环节，但回测结果与实盘表现之间常存在差距。本文详细讨论了回测过程中的常见陷阱，如前视偏差、过度拟合、生存者偏差、流动性假设不合理等问题。通过具体案例分析，文章展示了这些问题如何导致回测结果过于乐观，并提供了一系列实用技巧和方法来构建更接近实际的回测系统，帮助量化交易者避免'回测美好，实盘失败'的困境。"
            },
            {
                "title": "Python量化交易库对比分析",
                "type": "article",
                "description": "比较主流Python量化交易库的功能特点、性能表现和适用场景",
                "author": "孙程序",
                "date": "2023-07-12",
                "views": 2980,
                "tags": ["工具", "技术"],
                "summary": "Python已成为量化交易领域最流行的编程语言，拥有众多专业库支持。本文对比分析了几个主流的Python量化交易库，包括Backtrader、Zipline、Quantlib、Pyalgotrade等，从功能特点、易用性、性能、社区活跃度等维度进行了全面评估。文章还通过实现同一个交易策略的方式，展示了不同库的代码风格和性能差异，并根据不同的应用场景提供了选择建议，帮助读者找到最适合自己需求的工具。"
            }
        ]
        
        # 添加示例视频
        videos = [
            {
                "title": "均线交叉策略实战演示",
                "type": "video",
                "description": "通过实际案例演示如何实现和优化均线交叉策略",
                "duration": "28分钟",
                "views": 5670,
                "tags": ["策略", "实战"]
            },
            {
                "title": "Python数据获取与处理",
                "type": "video",
                "description": "学习如何使用Python获取和处理股票数据",
                "duration": "35分钟",
                "views": 4980,
                "tags": ["技术", "基础"]
            },
            {
                "title": "量化交易系统架构设计",
                "type": "video",
                "description": "介绍专业量化交易系统的架构设计和关键组件",
                "duration": "42分钟",
                "views": 3850,
                "tags": ["系统", "高级"]
            },
            {
                "title": "因子开发与测试方法",
                "type": "video",
                "description": "学习如何开发和测试有效的量化因子",
                "duration": "50分钟",
                "views": 4250,
                "tags": ["因子", "进阶"]
            },
            {
                "title": "市场微观结构分析",
                "type": "video",
                "description": "探索市场微观结构及其对交易策略的影响",
                "duration": "38分钟",
                "views": 3120,
                "tags": ["高级", "理论"]
            },
            {
                "title": "机器学习预测股价走势",
                "type": "video",
                "description": "使用机器学习算法预测股价短期走势",
                "duration": "55分钟",
                "views": 6240,
                "tags": ["机器学习", "预测"]
            }
        ]
        
        # 添加示例工具
        tools = [
            {
                "title": "A股数据下载工具",
                "type": "tool",
                "description": "用于下载和管理A股历史行情数据的桌面工具",
                "tags": ["数据", "A股"]
            },
            {
                "title": "策略回测模板",
                "type": "tool",
                "description": "预设多种常用量化策略的回测模板，快速开始策略测试",
                "tags": ["回测", "模板"]
            },
            {
                "title": "技术指标计算库",
                "type": "tool",
                "description": "包含100+种技术指标计算的Python库",
                "tags": ["技术指标", "计算"]
            },
            {
                "title": "量化绩效分析工具",
                "type": "tool",
                "description": "全面的策略绩效分析工具，支持多种风险和收益指标计算",
                "tags": ["绩效", "分析"]
            }
        ]
        
        # 将示例数据添加到数据库
        resources_added = 0
        
        for tutorial in tutorials:
            resource = LearningResource(
                title=tutorial["title"],
                type=tutorial["type"],
                description=tutorial["description"],
                tags=tutorial["tags"],
                meta_data={
                    "lessons": tutorial["lessons"],
                    "duration": tutorial["duration"],
                    "students": tutorial["students"],
                    "progress": tutorial["progress"],
                    "topics": tutorial["topics"]
                }
            )
            db.add(resource)
            resources_added += 1
        
        for article in articles:
            resource = LearningResource(
                title=article["title"],
                type=article["type"],
                description=article["description"],
                author=article["author"],
                tags=article["tags"],
                content=article["summary"],
                meta_data={
                    "date": article["date"],
                    "views": article["views"]
                }
            )
            db.add(resource)
            resources_added += 1
        
        for video in videos:
            resource = LearningResource(
                title=video["title"],
                type=video["type"],
                description=video["description"],
                tags=video["tags"],
                meta_data={
                    "duration": video["duration"],
                    "views": video["views"]
                }
            )
            db.add(resource)
            resources_added += 1
        
        for tool in tools:
            resource = LearningResource(
                title=tool["title"],
                type=tool["type"],
                description=tool["description"],
                tags=tool["tags"]
            )
            db.add(resource)
            resources_added += 1
        
        db.commit()
        logger.info(f"添加了 {resources_added} 个示例学习资源")
        
        # 重新查询
        resources = db.query(LearningResource).all()
    
    # 转换为响应格式
    tutorials = []
    articles = []
    videos = []
    tools = []
    
    for resource in resources:
        if resource.type == "tutorial":
            meta_data = resource.meta_data or {}
            tutorials.append({
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "tags": resource.tags,
                "lessons": meta_data.get("lessons", 0),
                "duration": meta_data.get("duration", ""),
                "students": meta_data.get("students", 0),
                "progress": meta_data.get("progress", 0),
                "topics": meta_data.get("topics", [])
            })
        elif resource.type == "article":
            meta_data = resource.meta_data or {}
            articles.append({
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "author": resource.author,
                "date": meta_data.get("date", ""),
                "views": meta_data.get("views", 0),
                "tags": resource.tags,
                "summary": resource.content
            })
        elif resource.type == "video":
            meta_data = resource.meta_data or {}
            videos.append({
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "duration": meta_data.get("duration", ""),
                "views": meta_data.get("views", 0),
                "tags": resource.tags
            })
        elif resource.type == "tool":
            tools.append({
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "tags": resource.tags
            })
    
    logger.info(f"返回 {len(tutorials)} 个教程, {len(articles)} 个文章, {len(videos)} 个视频, {len(tools)} 个工具")
    
    return {
        "tutorials": tutorials,
        "articles": articles,
        "videos": videos,
        "tools": tools
    }


@router.get("/resources/{resource_id}")
async def get_resource_detail(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """
    获取学习资源详情
    
    - **resource_id**: 资源ID
    """
    logger.info(f"获取资源详情请求: resource_id={resource_id}")
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        logger.warning(f"资源不存在: resource_id={resource_id}")
        raise HTTPException(status_code=404, detail="资源不存在")
    
    meta_data = resource.meta_data or {}
    
    # 构造响应
    result = {
        "id": resource.id,
        "title": resource.title,
        "type": resource.type,
        "description": resource.description,
        "author": resource.author,
        "tags": resource.tags,
        "content": resource.content,
        "url": resource.url,
        "created_at": resource.created_at.isoformat() if resource.created_at else None,
        "updated_at": resource.updated_at.isoformat() if resource.updated_at else None,
        "meta_data": meta_data
    }
    
    logger.info(f"返回资源详情: id={resource.id}, title={resource.title}")
    
    return result


@router.post("/progress")
async def update_learning_progress(
    progress_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    更新学习进度
    
    - **progress_data**: 包含资源ID和进度信息
    """
    resource_id = progress_data.get("resource_id")
    progress = progress_data.get("progress")
    
    logger.info(f"更新学习进度请求: resource_id={resource_id}, progress={progress}")
    
    if not resource_id or progress is None:
        logger.warning("无效的请求参数: 缺少资源ID或进度信息")
        raise HTTPException(status_code=400, detail="需要提供资源ID和进度信息")
    
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        logger.warning(f"资源不存在: resource_id={resource_id}")
        raise HTTPException(status_code=404, detail="资源不存在")
    
    # 更新进度
    meta_data = resource.meta_data or {}
    meta_data["progress"] = progress
    resource.meta_data = meta_data
    
    db.commit()
    logger.info(f"学习进度已更新: resource_id={resource_id}, progress={progress}")
    
    return {"message": "学习进度已更新"}