# 量化交易学习平台

## 项目架构

```
quant-trading-platform/
├── server/          # FastAPI后端
├── client/          # React前端  
└── docs/           # 文档资源
```

## 快速开始

### 后端启动

1. 进入server目录：
```bash
cd server
```

2. 安装依赖：
```bash
uv sync
```

3. 启动服务：
```bash
uv run python main.py
```

后端服务将运行在 http://localhost:8000

### 前端启动

1. 进入client目录：
```bash
cd client
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

前端应用将运行在 http://localhost:3000

## API文档

后端启动后，可以访问以下地址查看API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要功能

### 🎯 核心模块

1. **数据服务** (`/api/data/`)
   - 股票历史数据获取
   - 实时行情数据
   - 指数数据查询
   - 股票搜索功能

2. **策略服务** (`/api/strategy/`)
   - 策略创建和管理
   - 策略代码编辑
   - 回测执行
   - 性能分析

3. **学习资源** (`/api/docs/`)
   - 文档分类浏览
   - 教程和示例
   - 策略模板
   - 全文搜索

### 🔧 技术特性

- **后端**: FastAPI + Akshare + SQLAlchemy
- **前端**: React + Ant Design + Recharts
- **数据**: 实时股票数据 + 历史数据
- **图表**: 交互式金融图表
- **架构**: 原子化设计 + 模块化开发

## 开发说明

### 后端开发

- 使用 `uv` 作为Python包管理器
- 遵循FastAPI最佳实践
- 原子化API设计
- 完整的错误处理

### 前端开发

- 基于原子设计模式
- 组件化开发
- 响应式布局
- 现代化UI设计

## 项目特色

1. **原子化设计**: 前端采用原子、分子、组织的设计模式
2. **模块化架构**: 后端API按功能模块组织
3. **实时数据**: 基于Akshare的实时金融数据
4. **可视化**: 丰富的图表和数据展示
5. **学习友好**: 完整的文档和示例

## 下一步开发

- [ ] 完善策略开发页面
- [ ] 实现回测分析功能  
- [ ] 添加学习资源页面
- [ ] 用户认证系统
- [ ] 更多技术指标
- [ ] 策略分享社区

## 部署

### 开发环境
```bash
# 启动后端
cd server && uv run python main.py

# 启动前端  
cd client && npm start
```

### 生产环境
```bash
# 构建前端
cd client && npm run build

# 部署后端
cd server && uv run uvicorn main:app --host 0.0.0.0 --port 8000
```