# 量化交易学习平台

## 项目概述

量化交易学习平台是一个全栈应用程序，旨在为量化交易爱好者和学习者提供一个综合性的学习和实践环境。该平台结合了股票数据获取、策略开发、回测分析、学习资源和可视化仪表盘等功能，帮助用户系统性地学习和实践量化交易知识。

## 技术栈

### 后端
- FastAPI: 高性能的Python Web框架
- SQLAlchemy: ORM工具，用于数据库操作
- Uvicorn: ASGI服务器
- 其他依赖库: 数据处理和金融分析相关的Python库

### 前端
- React: 用户界面库
- 创建于Create React App
- 数据可视化组件（图表和分析展示）

## 系统架构

该项目采用前后端分离的架构:
- 后端API服务: 提供数据处理和业务逻辑
- 前端应用: 提供用户界面和交互体验

## 后端API模块

后端API分为以下几个主要模块:

1. **股票数据模块 (`/api/stock`)**: 
   - 提供股票行情数据获取和处理
   - 支持历史数据和实时数据查询

2. **策略管理模块 (`/api/strategy`)**: 
   - 交易策略的创建、编辑、删除和执行
   - 支持策略参数配置和优化

3. **回测分析模块 (`/api/backtest`)**: 
   - 策略回测功能
   - 回测结果分析和性能评估

4. **学习资源模块 (`/api/learning`)**: 
   - 量化交易学习材料管理
   - 教程、文档和示例策略

5. **仪表盘模块 (`/api/dashboard`)**: 
   - 数据可视化和分析工具
   - 用户状态和系统概览

## 安装和使用

### 系统要求
- Python 3.8+
- Node.js 14+
- 数据库 (取决于配置，如PostgreSQL、MySQL等)

### 后端设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/quant-trading-platform.git
cd quant-trading-platform/backend
```

2. 创建并激活虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # 在Windows上使用: venv\Scripts\activate
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 配置环境变量
创建`.env`文件并设置必要的环境变量（参考`.env.example`）

5. 启动开发服务器
```bash
python main.py
```
服务器将在 http://localhost:8002 上运行，API文档可在 http://localhost:8002/docs 查看。

### 前端设置

1. 进入前端目录
```bash
cd ../frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```
前端将在 http://localhost:3000 上运行。

### 生产部署

1. 构建前端
```bash
cd frontend
npm run build
```

2. 配置后端生产环境设置
更新环境变量ENVIRONMENT=production

3. 启动后端服务（使用生产级ASGI服务器）
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8002
```

## 项目结构

```
quant-trading-platform/
├── backend/                 # 后端应用
│   ├── api/                 # API模块
│   │   ├── backtest.py      # 回测API
│   │   ├── dashboard.py     # 仪表盘API
│   │   ├── learning.py      # 学习资源API
│   │   ├── stock_data.py    # 股票数据API
│   │   └── strategy.py      # 策略管理API
│   ├── core/                # 核心功能模块
│   │   ├── config.py        # 配置管理
│   │   └── database.py      # 数据库连接
│   ├── main.py              # 应用入口
│   └── requirements.txt     # 依赖清单
│
└── frontend/                # React前端应用
    ├── public/              # 静态资源
    ├── src/                 # 源代码
    ├── package.json         # 前端依赖
    └── README.md            # 前端说明文档
```

## 开发指南

### 添加新的API端点

1. 在`backend/api/`目录下的相应模块中创建新的端点函数
2. 使用FastAPI的装饰器定义路由和HTTP方法
3. 实现业务逻辑和数据处理

### 前端组件开发

1. 在`frontend/src/components/`目录下创建新组件
2. 使用React Hooks管理状态和副作用
3. 通过API服务连接后端数据

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交Pull Request

## 许可证

[MIT许可证](LICENSE)

## 联系方式

如有任何问题或建议，请提交issue或联系项目维护者。

---

希望这个量化交易学习平台能帮助您更系统地学习和实践量化交易策略！
