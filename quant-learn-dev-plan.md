# 量化学习平台开发计划

> 基于完整技术讨论的可执行步骤。产品面向用户，从零构建。
> 
> 架构：React + TS 前端 ｜ Rust (axum) 后端 ｜ SQLite 存储 ｜ 目标 Tauri 桌面应用

---

## 阶段〇｜环境与工具链准备

### 0.1 开发环境搭建

- 安装 Rust 工具链（rustup + stable channel）
- 安装 Node.js（前端构建）
- 安装 Cursor 或 VS Code
- 安装 Pencil 扩展（VS Code / Cursor marketplace），配置 MCP
- 安装 Playwright CLI：`npm install -g @playwright/cli@latest && playwright-cli install-browser && playwright-cli install --skills`
- 确认 `.claude/skills/playwright-cli/SKILL.md` 已生成

### 0.2 项目仓库初始化

- 创建 Git 仓库 `quant-learn/`
- 初始化两个子目录：
  - `frontend/`：`npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir`
  - `backend/`：`cargo init --name quant-backend`
- 前端启用 TypeScript strict 模式：`tsconfig.json → strict: true`
- 前端配置 ESLint：`@typescript-eslint/strict-type-checked`
- 后端添加核心依赖：axum, serde, reqwest, rusqlite, tokio
- 创建 `design.pen` 文件在项目根目录
- 初始提交：`git commit -m "init: project skeleton"`

### 0.3 建立 AI 协作约束文件

- 在项目根目录创建 `.cursorrules` 或 `CLAUDE.md`，写入：
  - "禁止在实现代码中硬编码任何数据值"
  - "禁止返回固定数据、假数据、示例数据"
  - "不要修改任何测试文件"
  - "如果无法通过某个测试，说明原因而不是绕过"
  - "前端组件不能直接依赖后端实现细节，必须通过 services/ 层调用"

---

## 阶段一｜UI 设计与前端骨架（假数据驱动）

> 目标：在浏览器中看到完整的 4 个页面，所有数据硬编码，验证交互流程和信息布局。

### 1.1 Pencil 设计行情看板页（Dashboard）

- 打开 `design.pen`，按 Cmd+K 输入设计提示：
  - 顶部：搜索框 + 三大指数快照（上证 / 深证 / 创业板，显示点位和涨跌幅）
  - 左侧主区域（60% 宽度）：K 线图组件 + 下方成交量柱状图
  - 右侧：自选股列表（股票名、现价、涨跌幅），可点击切换 K 线图
  - 配色：深色主题，红涨绿跌（中国市场风格）
- 在画布上调整布局和间距，直到满意
- Cmd+K："Generate React code for this design"，生成到 `frontend/src/components/dashboard/`

### 1.2 Pencil 设计回测页（Backtest）

- 设计提示：
  - 顶部：策略选择下拉框 + 股票选择 + 日期范围 + "运行回测"按钮
  - 中间主区域：收益曲线图（叠加基准线）
  - 下方左侧：关键指标卡片（总收益率、最大回撤、夏普比率、胜率）
  - 下方右侧：交易记录表格（日期、买/卖、价格、盈亏）
- 生成 React 代码到 `frontend/src/components/backtest/`

### 1.3 Pencil 设计策略学习页（Learn）

- 设计提示：
  - 左侧：策略列表导航（双均线、RSI、布林带，带进度标记）
  - 右侧上方：策略原理说明（图文混排，含公式）
  - 右侧下方：交互式迷你 K 线图（标注买卖点位置）
  - 底部："试一试"按钮跳转到回测页
- 生成 React 代码到 `frontend/src/components/learn/`

### 1.4 Pencil 设计设置页（Settings）

- 设计提示：
  - 数据源地址配置
  - 默认起始资金
  - 主题切换（深色 / 浅色）
- 生成代码到 `frontend/src/components/settings/`

### 1.5 编写硬编码假数据

- 在 `frontend/src/mocks/` 目录下创建：
  - `kline-data.ts`：手写或 AI 生成 50-100 条 OHLCV 数据（平安银行）
  - `backtest-result.ts`：一个完整的回测结果对象（含交易记录和收益曲线）
  - `stock-list.ts`：10-20 只常见 A 股的 symbol + name
  - `index-snapshot.ts`：三大指数的快照数据
- 假数据的用途是让 UI 渲染出来，而不是验证正确性

### 1.6 组装页面路由

- 在 `frontend/src/app/` 下创建 4 个页面目录：
  - `dashboard/page.tsx` — 导入 Dashboard 组件 + 假数据
  - `backtest/page.tsx` — 导入 Backtest 组件 + 假数据
  - `learn/page.tsx` — 导入 Learn 组件 + 假数据
  - `settings/page.tsx` — 导入 Settings 组件
- 添加全局导航栏（四个页面间切换）
- `npm run dev`，在浏览器中查看所有页面

### 1.7 安装 Lightweight Charts 并替换占位图表

- `npm install lightweight-charts`
- 将 Dashboard 的 K 线占位组件替换为真实的 Lightweight Charts 组件
- 用假数据渲染 K 线图 + 成交量图
- 将 Backtest 的收益曲线占位组件替换为 Lightweight Charts 折线图

### 1.8 Playwright CLI 视觉审查

- 启动前端开发服务器
- 用 Playwright CLI 逐页截图审查：
  ```
  playwright-cli open http://localhost:3000/dashboard --headed
  playwright-cli screenshot
  playwright-cli snapshot
  ```
- AI 查看截图，判断布局 / 间距 / 配色是否合理
- 修复问题 → 再截图 → 循环直到满意
- 将满意的截图保存到 `design-refs/` 作为基线

### 1.9 交互流程验证

- 手动测试（或 AI 通过 Playwright CLI 测试）：
  - 点击自选股列表项 → K 线图区域是否切换（目前用假数据，只验证 UI 响应）
  - 点击"运行回测"按钮 → 是否显示 loading 态 → 显示结果
  - 策略学习页左侧导航 → 右侧内容是否切换
  - 设置页修改配置 → 是否有保存反馈
- 记录发现的问题和修改需求，调整 UI

---

## 阶段二｜接口契约定义

> 目标：从已验证的 UI 中提取精确的数据需求，定义前后端共用的类型契约。

### 2.1 前端 TypeScript 接口定义

- 创建 `frontend/src/types/index.ts`，从 UI 实际使用的假数据结构中提取：

```typescript
// K线数据（Dashboard、Backtest 都用到）
export interface OHLCV {
  date: string        // '2024-01-02'
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 股票信息（搜索、自选股列表）
export interface StockInfo {
  symbol: string      // '000001'
  name: string        // '平安银行'
}

// 指数快照（Dashboard 顶部）
export interface IndexSnapshot {
  symbol: string
  name: string
  points: number
  change: number      // 涨跌幅（百分比）
}

// 回测参数（Backtest 页面表单）
export interface BacktestParams {
  strategyId: string
  symbol: string
  startDate: string
  endDate: string
  initialCapital: number
}

// 单笔交易记录
export interface Trade {
  date: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  pnl: number
}

// 回测结果（Backtest 页面展示）
export interface BacktestResult {
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  tradeCount: number
  trades: Trade[]
  equityCurve: { date: string; value: number }[]
}

// 策略定义（Learn 页面 + Backtest 下拉框）
export interface StrategyInfo {
  id: string
  name: string
  description: string
  params: Record<string, number>  // 如 { shortPeriod: 5, longPeriod: 20 }
}
```

### 2.2 Rust 后端对应 struct 定义

- 在 `backend/src/types.rs` 中定义完全对应的结构体：

```rust
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OHLCV {
    pub date: String,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StockInfo {
    pub symbol: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BacktestParams {
    pub strategy_id: String,
    pub symbol: String,
    pub start_date: String,
    pub end_date: String,
    pub initial_capital: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Trade {
    pub date: String,
    pub trade_type: String,  // "buy" | "sell"
    pub price: f64,
    pub quantity: u64,
    pub pnl: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BacktestResult {
    pub total_return: f64,
    pub max_drawdown: f64,
    pub sharpe_ratio: f64,
    pub win_rate: f64,
    pub trade_count: usize,
    pub trades: Vec<Trade>,
    pub equity_curve: Vec<EquityPoint>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EquityPoint {
    pub date: String,
    pub value: f64,
}
```

### 2.3 API 路由契约定义

- 在 `backend/src/routes.rs` 中定义路由框架（先只写签名，不实现）：

```
GET  /api/stocks/search?q={keyword}         → Vec<StockInfo>
GET  /api/stocks/{symbol}/daily?start=&end=  → Vec<OHLCV>
GET  /api/index/snapshot                     → Vec<IndexSnapshot>
POST /api/backtest                           → BacktestResult
GET  /api/strategies                         → Vec<StrategyInfo>
```

### 2.4 前端 services 层定义

- 创建 `frontend/src/services/api.ts`，定义调用后端的函数签名：

```typescript
export async function searchStocks(keyword: string): Promise<StockInfo[]>
export async function getStockDaily(symbol: string, start: string, end: string): Promise<OHLCV[]>
export async function getIndexSnapshot(): Promise<IndexSnapshot[]>
export async function runBacktest(params: BacktestParams): Promise<BacktestResult>
export async function getStrategies(): Promise<StrategyInfo[]>
```

- 第一版实现：仍然返回假数据（但通过函数调用，而不是直接 import mock 文件）
- 在 api.ts 内用环境变量控制：`USE_MOCK=true` 返回假数据，`false` 调真实后端
- 前端组件全部改为调用 services/api.ts，不再直接 import mock

---

## 阶段三｜Rust 后端：数据获取层

> 目标：Rust 后端能从真实数据源获取 A 股行情数据，通过 HTTP API 提供给前端。

### 3.1 TDD：数据获取模块测试

- 在 `backend/tests/market_data_test.rs` 中编写测试：

```
测试1：获取平安银行（000001）日K线，验证数据条数与真实交易日匹配
测试2：验证 OHLCV 结构完整性（high >= low, volume >= 0, close > 0）
测试3：返回数据按日期升序排列
测试4：多组不同股票输入返回不同结果（防止硬编码）
测试5：日期范围正确过滤
```

- **关键**：在测试中嵌入从东方财富 / 同花顺独立查到的真实数据点（某个日期的收盘价），AI 无法硬编码通过

### 3.2 实现数据获取

- 数据源方案（按优先级）：
  1. **AKTools HTTP API**：akshare 官方提供的 HTTP 封装，`docker run -p 8080:8080 akfamily/aktools`，Rust 通过 reqwest 调用
  2. **直接爬取东方财富公开接口**：参考 akshare 源码中的 URL 和参数格式，用 Rust reqwest 直接请求
  3. **备选：TuShare MCP 服务器**（社区已有 Rust 实现）
- 实现 `backend/src/data/market_data.rs`：
  - `pub async fn get_stock_daily(symbol: &str, start: &str, end: &str) -> Result<Vec<OHLCV>>`
  - `pub async fn search_stocks(keyword: &str) -> Result<Vec<StockInfo>>`
  - `pub async fn get_index_snapshot() -> Result<Vec<IndexSnapshot>>`
- 运行 `cargo test` 直到全部通过

### 3.3 CLI 验证

- 创建 `backend/src/bin/test_data.rs`，命令行工具测试数据获取：
  ```
  cargo run --bin test_data -- daily 000001 2024-01-02 2024-06-30
  cargo run --bin test_data -- search 平安
  ```
- 肉眼确认输出的数据合理性

### 3.4 启动 HTTP 服务

- 实现 `backend/src/main.rs`，用 axum 启动 HTTP 服务器
- 先只挂载数据获取相关路由：
  - `GET /api/stocks/search` → 调用 search_stocks
  - `GET /api/stocks/:symbol/daily` → 调用 get_stock_daily
  - `GET /api/index/snapshot` → 调用 get_index_snapshot
- 配置 CORS 允许前端 localhost 访问
- `cargo run`，用 curl 或 Postman 手动验证每个端点

### 3.5 前端接入真实数据

- 修改 `frontend/src/services/api.ts` 中数据获取函数的实现：
  - `USE_MOCK=false`，改为真实 HTTP 调用 `http://localhost:8080/api/...`
- 启动 Rust 后端 + 前端，在浏览器中看到真实 K 线数据
- Playwright CLI 截图，与 design-refs/ 基线对比，修复视觉差异

---

## 阶段四｜Rust 后端：策略与回测引擎

> 目标：实现核心回测引擎和内置策略，用户能在前端运行回测并看到真实结果。

### 4.1 TDD：策略模块测试

- 在 `backend/tests/strategy_test.rs` 中编写测试：

```
测试1：MA5 上穿 MA20 时产生买入信号（构造精确上涨数据序列）
测试2：MA5 下穿 MA20 时产生卖出信号（先涨后跌数据序列）
测试3：横盘行情中信号较少（小幅波动数据）
测试4：数据不足 20 天时，双均线策略不产生任何信号
```

### 4.2 实现策略模块

- 定义策略 trait：

```rust
pub trait Strategy {
    fn name(&self) -> &str;
    fn execute(&self, data: &[OHLCV]) -> Vec<Signal>;
}
```

- 实现三个内置策略：
  - `backend/src/strategies/ma_cross.rs` — 双均线交叉
  - `backend/src/strategies/rsi.rs` — RSI 超买超卖
  - `backend/src/strategies/bollinger.rs` — 布林带突破
- `cargo test` 通过策略测试

### 4.3 TDD：回测引擎测试

- 在 `backend/tests/backtest_engine_test.rs` 中编写测试：

```
测试1：上涨行情 + 趋势策略 → 正收益
测试2：资金守恒不变量：最终净值 = 初始资金 + 已平仓盈亏 + 持仓浮盈
测试3：数据不足时不产生交易，收益为零
测试4：停牌日（volume=0）不触发交易
测试5：最大回撤在 0 到 -100% 之间
测试6：收益曲线长度 = 交易日数量，第一个点 = 初始资金
测试7：不同股票 / 不同时间段返回不同结果（防 mock）
测试8：胜率在 0-1 之间
```

- **性质测试（property-based）**：资金守恒、回撤范围、曲线长度等数学恒等式
- **交叉验证**：嵌入独立查到的真实数据点

### 4.4 实现回测引擎

- 创建 `backend/src/engine/backtest.rs`：
  - `pub fn run_backtest(strategy: &dyn Strategy, data: &[OHLCV], initial_capital: f64) -> BacktestResult`
- 内部逻辑：
  - 遍历每根 K 线，调用 strategy.execute() 获取信号
  - 根据信号模拟开仓 / 平仓
  - 计算收益曲线、最大回撤、夏普比率、胜率
  - 手续费可配置（默认万三）
- `cargo test` 通过全部回测引擎测试

### 4.5 挂载回测 API

- 在 axum 路由中添加：
  - `POST /api/backtest` → 接收 BacktestParams → 获取数据 → 运行回测 → 返回 BacktestResult
  - `GET /api/strategies` → 返回内置策略列表

### 4.6 前端接入回测

- 修改 `frontend/src/services/api.ts` 中回测相关函数
- 回测页面接上真实 API：
  - 选择策略 + 股票 + 日期 → 点击"运行回测" → 调用 POST /api/backtest → 渲染结果
- Playwright CLI 截图验证回测结果页面显示正确

### 4.7 集成测试

- 在 `backend/tests/integration_test.rs` 中写完整管线测试：

```
测试：获取真实数据 → 运行回测 → 结果可序列化为 JSON → 关键指标在合理范围
```

---

## 阶段五｜数据存储层

> 目标：缓存已获取的行情数据到 SQLite，避免重复请求，提升加载速度。

### 5.1 设计数据库 schema

```sql
-- 日K线缓存
CREATE TABLE stock_daily (
    symbol TEXT NOT NULL,
    date TEXT NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER NOT NULL,
    PRIMARY KEY (symbol, date)
);

-- 数据缓存元信息（记录某只股票最后更新时间）
CREATE TABLE cache_meta (
    symbol TEXT PRIMARY KEY,
    last_updated TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
);

-- 用户自选股
CREATE TABLE watchlist (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    added_at TEXT NOT NULL
);

-- 用户设置
CREATE TABLE user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

### 5.2 TDD：缓存逻辑测试

```
测试1：首次请求 → 从网络获取 → 存入 SQLite → 返回数据
测试2：再次请求同一股票同一日期范围 → 直接从 SQLite 读取 → 不发网络请求
测试3：请求范围部分超出缓存 → 只请求缺失部分 → 合并返回
测试4：数据更新（当天数据可能变化）→ 当日数据重新获取
```

### 5.3 实现缓存层

- 创建 `backend/src/data/cache.rs`：
  - 在 get_stock_daily 调用前先查 SQLite
  - 缺失的数据从网络获取后写入 SQLite
  - 用 cache_meta 表判断是否需要更新
- 修改 market_data.rs，将缓存逻辑插入数据获取流程

### 5.4 自选股和设置的持久化

- 实现自选股的增删查 API：
  - `POST /api/watchlist` → 添加自选股
  - `DELETE /api/watchlist/:symbol` → 删除
  - `GET /api/watchlist` → 获取列表
- 实现设置的读写 API：
  - `GET /api/settings` → 读取所有设置
  - `PUT /api/settings` → 更新设置
- 前端 Settings 页面和 Dashboard 自选股列表接入真实 API

---

## 阶段六｜策略学习内容

> 目标：填充学习页面内容，提供完整的策略教学体验。

### 6.1 编写策略教学内容

- 双均线交叉策略：
  - 原理说明（什么是移动平均线、金叉 / 死叉概念）
  - 公式：MA(N) = 最近 N 日收盘价之和 / N
  - 适用场景和局限性
  - 参数含义（短期均线天数、长期均线天数）

- RSI 策略：
  - 原理说明（相对强弱指标、超买超卖概念）
  - 公式推导
  - 阈值含义（70 超买 / 30 超卖）

- 布林带策略：
  - 原理说明（统计分布、标准差通道）
  - 三条线的计算方法
  - 突破信号的判断逻辑

### 6.2 交互式示例

- 每个策略页面底部，嵌入一个迷你 K 线图组件
- 用真实数据绘制，在图上标注策略产生的买卖信号位置
- "试一试"按钮：跳转到回测页面，预填该策略 + 示例股票

### 6.3 内容审查

- Playwright CLI 截图每个策略页面
- 确认文字排版、图表标注、交互按钮正常工作

---

## 阶段七｜测试体系完善与视觉守护

> 目标：建立完整的自动化测试体系，确保后续迭代不会搞坏已有功能。

### 7.1 后端测试矩阵

```
tests/
    ├── market_data_test.rs   ← 真实 API 调用（慢，CI 可跳过）
    └── full_pipeline_test.rs ← 获取数据 → 回测 → 验证完整链路
```

- 日常开发：`cargo test --lib`（只跑 unit，几秒）
- 提交前：`cargo test`（包含集成测试）

### 7.2 前端 E2E 测试

- 安装 Playwright：`npm init playwright@latest`
- 编写关键路径 E2E 测试：

```
测试1：打开 Dashboard → K 线图渲染 → 自选股列表显示
测试2：搜索股票 → 点击结果 → K 线图切换
测试3：打开 Backtest → 选择策略 → 运行回测 → 结果指标显示
测试4：打开 Learn → 点击策略 → 内容切换 → "试一试"跳转
```

### 7.3 视觉回归测试

- 给 4 个核心页面添加 `toHaveScreenshot` 守护：

```typescript
const pages = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'backtest', path: '/backtest' },
  { name: 'learn', path: '/learn' },
  { name: 'settings', path: '/settings' },
]

for (const p of pages) {
  test(`${p.name} 视觉一致`, async ({ page }) => {
    await page.goto(p.path)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      mask: [page.locator('[data-testid="live-data"]')],  // mask 动态数据
      maxDiffPixelRatio: 0.01,
    })
  })
}
```

- 首次运行生成基线截图：`npx playwright test --update-snapshots`
- 后续每次改动自动对比

### 7.4 测试运行配置

```json
// package.json
{
  "scripts": {
    "test:unit": "cargo test --lib --manifest-path backend/Cargo.toml",
    "test:e2e": "npx playwright test",
    "test:visual": "npx playwright test tests/visual/",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

---

## 阶段八｜产品打磨

> 目标：打磨到可以给人用的状态。

### 8.1 错误处理与加载状态

- 前端所有 API 调用添加：
  - Loading 骨架屏（Skeleton）
  - 错误提示（网络错误、数据源不可用、股票代码不存在）
  - 空状态（搜索无结果、自选股列表为空）
- 后端所有接口添加：
  - 统一错误响应格式 `{ error: string, code: string }`
  - 超时处理（数据源请求超时 → 返回缓存数据或提示）
  - 日志（tracing crate）

### 8.2 性能优化

- 后端：
  - 回测引擎优化（避免不必要的内存分配）
  - SQLite WAL 模式（提升并发读写性能）
- 前端：
  - K 线图大数据量渲染性能（Lightweight Charts 自带虚拟化）
  - 防抖搜索（输入停止 300ms 后才发请求）
  - 回测结果缓存（同参数不重复请求）

### 8.3 响应式布局

- Dashboard 在小屏幕上：K 线图全宽 + 自选股折叠
- Backtest 在小屏幕上：参数区域折叠 + 结果纵向排列
- Playwright CLI 分别在 1920×1080 和 1366×768 下截图验证

### 8.4 README 和使用文档

- 编写 README.md：
  - 项目简介和截图
  - 安装和运行步骤（一键启动命令）
  - 技术架构说明
  - 如何贡献

---

## 阶段九｜Tauri 桌面应用封装（可选，视产品需要）

> 目标：打包成一个双击即用的桌面应用，用户不需要装任何开发环境。

### 9.1 Tauri 项目初始化

- `cargo install create-tauri-app`
- 将 frontend/ 和 backend/ 整合进 Tauri 项目结构
- 前端 WebView 渲染 React 应用
- Rust 后端逻辑嵌入 Tauri 的后端进程

### 9.2 IPC 替换 HTTP

- 将前端 services/api.ts 中的 HTTP 调用替换为 Tauri IPC：

```typescript
import { invoke } from '@tauri-apps/api/core'

export async function getStockDaily(symbol: string, start: string, end: string) {
  return invoke<OHLCV[]>('get_stock_daily', { symbol, start, end })
}
```

- Rust 端用 `#[tauri::command]` 暴露函数
- 类型安全：Tauri 自动生成 TS 类型绑定

### 9.3 构建与分发

- `cargo tauri build`
- 产出：
  - macOS：`.dmg` 安装包
  - Windows：`.msi` 安装包
  - Linux：`.AppImage`
- 单个二进制文件，内嵌 SQLite 数据库，双击就跑

---

## 附录 A｜技术栈清单

| 层级 | 技术 | 选择原因 |
|------|------|----------|
| 前端框架 | React + Next.js | AI 训练数据最多，生成质量最高 |
| 前端语言 | TypeScript (strict) | 编译器最大化 review 效果 |
| 样式 | Tailwind CSS | AI 生成质量高，风格一致 |
| 图表 | Lightweight Charts | TradingView 开源，金融专用 |
| 状态管理 | Zustand | 轻量，不过度抽象 |
| 后端语言 | Rust | 编译器验证 + 性能 + 部署体验 |
| 后端框架 | axum | 类型安全，async，生态成熟 |
| 数据库 | SQLite (rusqlite) | 嵌入式，零部署 |
| 数据源 | AKTools HTTP API / 东方财富 | A 股数据，免费 |
| 桌面封装 | Tauri | Rust 后端 + WebView 前端 |
| UI 设计 | Pencil | IDE 内设计，直出 React 代码 |
| 浏览器自动化 | Playwright CLI + Skills | 省 token，视觉验证闭环 |
| 测试框架 | cargo test (后端) + Playwright (前端) | |

## 附录 B｜项目目录结构

```
quant-learn/
├── design.pen                     # Pencil 设计文件（Git 版本控制）
├── design-refs/                   # 视觉基线截图
├── CLAUDE.md                      # AI 协作约束
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── backtest/page.tsx
│   │   │   ├── learn/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── components/
│   │   │   ├── charts/            # K线图、收益曲线
│   │   │   ├── dashboard/         # 看板相关组件
│   │   │   ├── backtest/          # 回测相关组件
│   │   │   ├── learn/             # 学习页相关组件
│   │   │   └── ui/                # 通用 UI 组件
│   │   ├── services/
│   │   │   └── api.ts             # 后端调用层（Rust 替换边界）
│   │   ├── types/
│   │   │   └── index.ts           # 前端类型定义
│   │   └── mocks/                 # 假数据（仅阶段一使用）
│   ├── tests/
│   │   ├── e2e/                   # E2E 测试
│   │   └── visual/                # 视觉回归测试
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main.rs                # HTTP 服务入口
│   │   ├── types.rs               # 共享类型定义
│   │   ├── routes.rs              # API 路由
│   │   ├── data/
│   │   │   ├── market_data.rs     # 数据获取
│   │   │   └── cache.rs           # SQLite 缓存层
│   │   ├── engine/
│   │   │   └── backtest.rs        # 回测引擎
│   │   ├── strategies/
│   │   │   ├── mod.rs             # Strategy trait 定义
│   │   │   ├── ma_cross.rs        # 双均线交叉
│   │   │   ├── rsi.rs             # RSI 超买超卖
│   │   │   └── bollinger.rs       # 布林带突破
│   │   └── bin/
│   │       └── test_data.rs       # 数据获取 CLI 测试工具
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── strategy_test.rs
│   │   │   ├── backtest_engine_test.rs
│   │   │   └── cache_test.rs
│   │   └── integration/
│   │       ├── market_data_test.rs
│   │       └── full_pipeline_test.rs
│   └── Cargo.toml
│
└── README.md
```

## 附录 C｜TDD 防 mock 检查清单

每次让 AI 实现代码时，对照此清单确认测试质量：

- [ ] 是否有嵌入真实数据点的断言？（AI 无法猜中的具体值）
- [ ] 是否有多组不同输入的 `test.each`？（硬编码 if-else 的成本 > 真实现）
- [ ] 是否有不可预测性断言？（不同输入 → 不同输出）
- [ ] 是否有性质测试？（资金守恒、范围约束等数学恒等式）
- [ ] 是否有集成测试？（真实数据跑完整链路）
- [ ] AI 约束文件中是否明确禁止硬编码和修改测试？

## 附录 D｜关键架构决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 开发顺序 | UI → 契约 → 后端 | 产品形态从 UI 验证，接口从 UI 倒推，避免浪费 |
| 后端语言 | 直接 Rust | 产品形态已明确，模块简单，给用户用需要性能和稳定性 |
| 前端语言 | TypeScript (React) | 浏览器平台锁定，AI 生态最成熟 |
| 从零开始 | 是 | 原项目 mock 数据污染不可清理，带着产品认知重来 |
| 不用 Bun | Node.js | 生态兼容性更稳定，最终后端切 Rust 后运行时性能不重要 |
| 假数据管理 | 用完即删 | 环境变量控制的 mock 分支在真实接口跑通后立刻删除 |
| 视觉验证 | Playwright CLI + Skills | 比 MCP 省 4 倍 token，支持长会话迭代 |
| 不用 Percy/Applitools | 内置 toHaveScreenshot | 个人项目不需要付费多浏览器测试 |
