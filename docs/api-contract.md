# API 接口契约文档

> 前后端通信的唯一真相来源。所有字段名、类型、语义以本文档为准。
>
> 前端 TypeScript 接口定义：`frontend/src/types/index.ts`
> 后端 Rust 结构体定义：`backend/src/types.rs`
> 前端服务调用层：`frontend/src/services/api.ts`

---

## 通用约定

### 基础 URL

```
http://localhost:3001/api
```

### 请求/响应格式

- Content-Type: `application/json`
- 字符编码: UTF-8
- 日期格式: `YYYY-MM-DD`（如 `2024-01-02`）
- 数值精度: 价格保留 2 位小数，比率保留 2 位小数

### 错误响应格式

所有接口在异常情况下统一返回：

```json
{
  "error": "错误描述信息",
  "code": "ERROR_CODE"
}
```

HTTP 状态码：

| 状态码 | 含义 |
|--------|------|
| 200    | 成功 |
| 400    | 请求参数错误 |
| 404    | 资源不存在 |
| 500    | 服务器内部错误 |
| 503    | 数据源不可用 |

### 错误码枚举

| code | 说明 |
|------|------|
| `INVALID_PARAM`     | 请求参数不合法（缺失或格式错误） |
| `STOCK_NOT_FOUND`   | 股票代码不存在 |
| `STRATEGY_NOT_FOUND`| 策略 ID 不存在 |
| `DATA_SOURCE_ERROR` | 上游数据源请求失败 |
| `INTERNAL_ERROR`    | 服务器内部错误 |

---

## 共享数据类型

### OHLCV — K 线数据

Dashboard K 线图、Backtest 回测引擎均使用此结构。

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `date` | `string` | `String` | 交易日期，格式 `YYYY-MM-DD` |
| `open` | `number` | `f64` | 开盘价 |
| `high` | `number` | `f64` | 最高价 |
| `low` | `number` | `f64` | 最低价 |
| `close` | `number` | `f64` | 收盘价 |
| `volume` | `number` | `u64` | 成交量（股） |

**约束**：`high >= low`，`high >= open`，`high >= close`，`low <= open`，`low <= close`，`volume >= 0`，`close > 0`

```typescript
// TypeScript
interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

```rust
// Rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OHLCV {
    pub date: String,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: u64,
}
```

### StockInfo — 股票基本信息

搜索结果、自选股列表使用此结构。

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `symbol` | `string` | `String` | 股票代码，6 位数字（如 `"000001"`） |
| `name` | `string` | `String` | 股票名称（如 `"平安银行"`） |

```typescript
interface StockInfo {
  symbol: string;
  name: string;
}
```

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockInfo {
    pub symbol: String,
    pub name: String,
}
```

### IndexSnapshot — 指数快照

Dashboard 顶部三大指数展示使用此结构。

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `symbol` | `string` | `String` | 指数代码（如 `"000001"` 上证指数） |
| `name` | `string` | `String` | 指数名称 |
| `points` | `number` | `f64` | 当前点位 |
| `change` | `number` | `f64` | 涨跌幅，单位百分比（`0.82` 表示 +0.82%，**不是** 0.0082） |

**注意**：`change` 已经是百分比值，前端展示时直接拼接 `%` 后缀，无需再乘以 100。

```typescript
interface IndexSnapshot {
  symbol: string;
  name: string;
  points: number;
  change: number;
}
```

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IndexSnapshot {
    pub symbol: String,
    pub name: String,
    pub points: f64,
    pub change: f64,
}
```

### BacktestParams — 回测参数

前端提交回测请求时使用此结构。

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `strategyId` | `string` | `String` | 策略标识（`"dual-ma"` / `"rsi"` / `"bollinger"` / `"macd"`） |
| `symbol` | `string` | `String` | 股票代码 |
| `startDate` | `string` | `String` | 回测起始日期 `YYYY-MM-DD` |
| `endDate` | `string` | `String` | 回测结束日期 `YYYY-MM-DD` |
| `initialCapital` | `number` | `f64` | 初始资金（元） |

**JSON 字段名映射**：Rust 端使用 `serde(rename_all = "camelCase")` 使 JSON 字段名与 TypeScript 一致。

```typescript
interface BacktestParams {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
}
```

```rust
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BacktestParams {
    pub strategy_id: String,
    pub symbol: String,
    pub start_date: String,
    pub end_date: String,
    pub initial_capital: f64,
}
```

### Trade — 单笔交易记录

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `date` | `string` | `String` | 交易日期 `YYYY-MM-DD` |
| `type` | `'buy' \| 'sell'` | `String` | 交易方向，仅 `"buy"` 或 `"sell"` |
| `price` | `number` | `f64` | 成交价格 |
| `quantity` | `number` | `u64` | 成交数量（股） |
| `pnl` | `number` | `f64` | 本笔盈亏（元），买入时为 `0`，卖出时为实际盈亏 |

**字段名映射**：Rust 字段 `trade_type` 在 JSON 序列化时映射为 `"type"`（因为 `type` 是 Rust 保留字）。

```typescript
interface Trade {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
}
```

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trade {
    pub date: String,
    #[serde(rename = "type")]
    pub trade_type: String,
    pub price: f64,
    pub quantity: u64,
    pub pnl: f64,
}
```

### EquityPoint — 收益曲线数据点

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `date` | `string` | `String` | 日期 `YYYY-MM-DD` |
| `value` | `number` | `f64` | 当日净值（元） |

**注意**：TypeScript 中 `equityCurve` 使用内联类型 `{ date: string; value: number }[]`，Rust 端抽出为独立结构体 `EquityPoint`。

```typescript
// TypeScript（内联在 BacktestResult 中）
equityCurve: { date: string; value: number }[]
```

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EquityPoint {
    pub date: String,
    pub value: f64,
}
```

### BacktestResult — 回测结果

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `totalReturn` | `number` | `f64` | 总收益率（百分比，`23.5` 表示 +23.5%） |
| `maxDrawdown` | `number` | `f64` | 最大回撤（百分比，`-12.8` 表示 -12.8%） |
| `sharpeRatio` | `number` | `f64` | 夏普比率 |
| `winRate` | `number` | `f64` | 胜率（百分比，`58.3` 表示 58.3%） |
| `tradeCount` | `number` | `usize` | 交易总笔数 |
| `trades` | `Trade[]` | `Vec<Trade>` | 交易记录列表 |
| `equityCurve` | `{ date: string; value: number }[]` | `Vec<EquityPoint>` | 收益曲线数据 |

**约束**：`winRate` 范围 [0, 100]，`maxDrawdown` 范围 [-100, 0]，`equityCurve` 第一个点的 `value` = 初始资金，长度 = 回测区间交易日天数。

```typescript
interface BacktestResult {
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  tradeCount: number;
  trades: Trade[];
  equityCurve: { date: string; value: number }[];
}
```

```rust
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BacktestResult {
    pub total_return: f64,
    pub max_drawdown: f64,
    pub sharpe_ratio: f64,
    pub win_rate: f64,
    pub trade_count: usize,
    pub trades: Vec<Trade>,
    pub equity_curve: Vec<EquityPoint>,
}
```

### StrategyInfo — 策略信息

Backtest 页面策略下拉框使用此结构。

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `id` | `string` | `String` | 策略唯一标识（`"dual-ma"` / `"rsi"` / `"bollinger"` / `"macd"`） |
| `name` | `string` | `String` | 策略显示名称 |
| `description` | `string` | `String` | 策略简要描述 |
| `params` | `Record<string, number>` | `HashMap<String, f64>` | 策略参数键值对 |

```typescript
interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  params: Record<string, number>;
}
```

```rust
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StrategyInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub params: HashMap<String, f64>,
}
```

### StrategyLearnDetail — 策略学习详情

Learn 页面完整策略教学内容使用此结构。

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `id` | `string` | `String` | 策略唯一标识，同 StrategyInfo.id |
| `name` | `string` | `String` | 策略完整名称 |
| `shortDesc` | `string` | `String` | 一句话简述 |
| `level` | `'入门级' \| '进阶级' \| '高级'` | `String` | 难度等级 |
| `status` | `'已学' \| '学习中' \| '未学'` | `String` | 当前用户学习状态 |
| `explanation` | `string` | `String` | 策略详细原理说明 |
| `formulas` | `Formula[]` | `Vec<Formula>` | 公式列表 |

**Formula 子结构**：

| 字段 | TypeScript | Rust | 说明 |
|------|-----------|------|------|
| `label` | `string` | `String` | 公式标签（如 `"公式"`、`"买入信号"`） |
| `code` | `string` | `String` | 公式内容（如 `"MA(n) = (C₁ + C₂ + ... + Cₙ) / n"`） |
| `color` | `string` | `String` | 显示颜色（十六进制，如 `"#22D3EE"`） |

```typescript
interface StrategyLearnDetail {
  id: string;
  name: string;
  shortDesc: string;
  level: '入门级' | '进阶级' | '高级';
  status: '已学' | '学习中' | '未学';
  explanation: string;
  formulas: { label: string; code: string; color: string }[];
}
```

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StrategyLearnDetail {
    pub id: String,
    pub name: String,
    pub short_desc: String,
    pub level: String,
    pub status: String,
    pub explanation: String,
    pub formulas: Vec<Formula>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Formula {
    pub label: String,
    pub code: String,
    pub color: String,
}
```

---

## API 路由定义

### 1. 搜索股票

```
GET /api/stocks/search?q={keyword}
```

**功能**：根据关键字搜索股票，匹配股票代码或名称。

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 搜索关键字，支持股票代码或中文名称 |

**响应**：`200 OK`

```json
[
  { "symbol": "000001", "name": "平安银行" },
  { "symbol": "601318", "name": "中国平安" }
]
```

**类型签名**：`Vec<StockInfo>`

**前端调用**：

```typescript
searchStocks(keyword: string): Promise<StockInfo[]>
// GET /api/stocks/search?q={keyword}
```

**边界情况**：
- `q` 为空字符串 → 返回空数组 `[]`
- 无匹配结果 → 返回空数组 `[]`

---

### 2. 获取股票日 K 线数据

```
GET /api/stocks/{symbol}/daily?start={startDate}&end={endDate}
```

**功能**：获取指定股票在日期范围内的日 K 线数据。

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `symbol` | string | 股票代码（如 `000001`） |

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start` | string | 是 | 起始日期 `YYYY-MM-DD` |
| `end` | string | 是 | 结束日期 `YYYY-MM-DD` |

**响应**：`200 OK`

```json
[
  {
    "date": "2024-01-02",
    "open": 10.40,
    "high": 10.65,
    "low": 10.35,
    "close": 10.59,
    "volume": 1604706
  }
]
```

**类型签名**：`Vec<OHLCV>`

**前端调用**：

```typescript
getStockDaily(symbol: string, start: string, end: string): Promise<OHLCV[]>
// GET /api/stocks/{symbol}/daily?start={start}&end={end}
```

**约束**：
- 数据按 `date` 升序排列
- `start <= end`
- 股票代码不存在 → 返回 `404` + `STOCK_NOT_FOUND`
- 日期范围内无数据 → 返回空数组 `[]`

---

### 3. 获取指数快照

```
GET /api/index/snapshot
```

**功能**：获取三大指数（上证指数、深证成指、创业板指）的最新快照。

**响应**：`200 OK`

```json
[
  { "symbol": "000001", "name": "上证指数", "points": 3150.25, "change": 0.82 },
  { "symbol": "399001", "name": "深证成指", "points": 10280.45, "change": 1.15 },
  { "symbol": "399006", "name": "创业板指", "points": 2035.12, "change": 1.58 }
]
```

**类型签名**：`Vec<IndexSnapshot>`

**前端调用**：

```typescript
getIndexSnapshot(): Promise<IndexSnapshot[]>
// GET /api/index/snapshot
```

**约束**：
- 固定返回 3 条记录（上证、深证、创业板）
- `change` 为百分比值（0.82 = +0.82%）

---

### 4. 运行回测

```
POST /api/backtest
```

**功能**：根据指定策略和参数运行回测，返回完整回测结果。

**请求体**：`BacktestParams`

```json
{
  "strategyId": "dual-ma",
  "symbol": "000001",
  "startDate": "2023-01-01",
  "endDate": "2024-12-31",
  "initialCapital": 100000
}
```

**响应**：`200 OK` → `BacktestResult`

```json
{
  "totalReturn": 23.5,
  "maxDrawdown": -12.8,
  "sharpeRatio": 1.45,
  "winRate": 58.3,
  "tradeCount": 24,
  "trades": [
    { "date": "2024-01-10", "type": "buy", "price": 10.65, "quantity": 1000, "pnl": 0 },
    { "date": "2024-01-25", "type": "sell", "price": 11.20, "quantity": 1000, "pnl": 550 }
  ],
  "equityCurve": [
    { "date": "2023-01-03", "value": 100000 },
    { "date": "2023-01-04", "value": 100250 }
  ]
}
```

**前端调用**：

```typescript
runBacktest(params: BacktestParams): Promise<BacktestResult>
// POST /api/backtest  body: params
```

**参数校验**：
- `strategyId` 必须是已注册策略 ID → 否则 `400` + `STRATEGY_NOT_FOUND`
- `symbol` 必须是有效股票代码 → 否则 `400` + `STOCK_NOT_FOUND`
- `startDate < endDate` → 否则 `400` + `INVALID_PARAM`
- `initialCapital > 0` → 否则 `400` + `INVALID_PARAM`

**响应约束**：
- `trades` 按 `date` 升序排列
- `equityCurve` 按 `date` 升序排列
- `equityCurve[0].value` = `initialCapital`
- `equityCurve.length` = 回测区间内的交易日天数
- `winRate` ∈ [0, 100]
- `maxDrawdown` ∈ [-100, 0]

---

### 5. 获取策略列表

```
GET /api/strategies
```

**功能**：获取所有可用的内置策略列表（用于 Backtest 页面下拉框）。

**响应**：`200 OK`

```json
[
  {
    "id": "dual-ma",
    "name": "双均线策略",
    "description": "使用短期和长期移动平均线交叉产生买卖信号的经典趋势跟随策略。",
    "params": { "shortPeriod": 5, "longPeriod": 20 }
  },
  {
    "id": "rsi",
    "name": "RSI 策略",
    "description": "利用相对强弱指数寻找超买和超卖区间的震荡反转策略。",
    "params": { "period": 14, "overbought": 70, "oversold": 30 }
  },
  {
    "id": "bollinger",
    "name": "布林带策略",
    "description": "基于价格突破布林带上下轨进行反向操作的均值回归策略。",
    "params": { "period": 20, "stdDev": 2 }
  },
  {
    "id": "macd",
    "name": "MACD 策略",
    "description": "利用指数平滑移动平均线差异衡量动能的趋势追踪工具。",
    "params": { "fast": 12, "slow": 26, "signal": 9 }
  }
]
```

**类型签名**：`Vec<StrategyInfo>`

**前端调用**：

```typescript
getStrategies(): Promise<StrategyInfo[]>
// GET /api/strategies
```

---

### 6. 获取策略学习内容

```
GET /api/strategies/learn
```

**功能**：获取所有策略的学习详情（用于 Learn 页面教学内容展示）。

**响应**：`200 OK`

```json
[
  {
    "id": "dual-ma",
    "name": "双均线交叉策略",
    "shortDesc": "MA5/MA20 金叉死叉",
    "level": "入门级",
    "status": "未学",
    "explanation": "双均线交叉策略利用短期均线(MA5)与长期均线(MA20)的交叉关系...",
    "formulas": [
      { "label": "公式", "code": "MA(n) = (C₁ + C₂ + ... + Cₙ) / n", "color": "#22D3EE" },
      { "label": "买入信号", "code": "买入信号: MA5 > MA20 (金叉)", "color": "#EF4444" },
      { "label": "卖出信号", "code": "卖出信号: MA5 < MA20 (死叉)", "color": "#22C55E" }
    ]
  }
]
```

**类型签名**：`Vec<StrategyLearnDetail>`

**前端调用**：

```typescript
getStrategyLearnList(): Promise<StrategyLearnDetail[]>
// GET /api/strategies/learn
```

**说明**：`status` 字段在阶段五实现用户数据持久化后才会根据真实学习进度返回，当前默认返回 `"未学"`。

---

## 前端 Services 层完整签名

`frontend/src/services/api.ts` 应提供以下 6 个函数，当前阶段返回 mock 数据，阶段三/四切换为真实 HTTP 调用：

```typescript
import type {
  StockInfo, OHLCV, IndexSnapshot,
  BacktestParams, BacktestResult,
  StrategyInfo, StrategyLearnDetail
} from '@/types';

// 数据获取接口（阶段三实现）
export async function searchStocks(keyword: string): Promise<StockInfo[]>;
export async function getStockDaily(symbol: string, start: string, end: string): Promise<OHLCV[]>;
export async function getIndexSnapshot(): Promise<IndexSnapshot[]>;

// 回测接口（阶段四实现）
export async function runBacktest(params: BacktestParams): Promise<BacktestResult>;
export async function getStrategies(): Promise<StrategyInfo[]>;

// 学习内容接口（阶段六实现）
export async function getStrategyLearnList(): Promise<StrategyLearnDetail[]>;
```

---

## JSON 字段命名规范

前后端 JSON 通信统一使用 **camelCase**，Rust 端通过 `serde` 属性进行映射：

| TypeScript 字段 | Rust 字段 | JSON 字段 | 映射方式 |
|----------------|-----------|-----------|----------|
| `strategyId` | `strategy_id` | `strategyId` | `#[serde(rename_all = "camelCase")]` |
| `startDate` | `start_date` | `startDate` | `#[serde(rename_all = "camelCase")]` |
| `endDate` | `end_date` | `endDate` | `#[serde(rename_all = "camelCase")]` |
| `initialCapital` | `initial_capital` | `initialCapital` | `#[serde(rename_all = "camelCase")]` |
| `totalReturn` | `total_return` | `totalReturn` | `#[serde(rename_all = "camelCase")]` |
| `maxDrawdown` | `max_drawdown` | `maxDrawdown` | `#[serde(rename_all = "camelCase")]` |
| `sharpeRatio` | `sharpe_ratio` | `sharpeRatio` | `#[serde(rename_all = "camelCase")]` |
| `winRate` | `win_rate` | `winRate` | `#[serde(rename_all = "camelCase")]` |
| `tradeCount` | `trade_count` | `tradeCount` | `#[serde(rename_all = "camelCase")]` |
| `equityCurve` | `equity_curve` | `equityCurve` | `#[serde(rename_all = "camelCase")]` |
| `shortDesc` | `short_desc` | `shortDesc` | `#[serde(rename_all = "camelCase")]` |
| `type` (Trade) | `trade_type` | `type` | `#[serde(rename = "type")]` |

**特殊情况**：`Trade.trade_type` 使用 `#[serde(rename = "type")]` 单独映射，因为 `type` 是 Rust 保留关键字。

---

## 路由汇总

| 方法 | 路径 | 请求体 | 响应体 | 实现阶段 |
|------|------|--------|--------|----------|
| GET | `/api/stocks/search?q={keyword}` | — | `Vec<StockInfo>` | 阶段三 |
| GET | `/api/stocks/{symbol}/daily?start=&end=` | — | `Vec<OHLCV>` | 阶段三 |
| GET | `/api/index/snapshot` | — | `Vec<IndexSnapshot>` | 阶段三 |
| POST | `/api/backtest` | `BacktestParams` | `BacktestResult` | 阶段四 |
| GET | `/api/strategies` | — | `Vec<StrategyInfo>` | 阶段四 |
| GET | `/api/strategies/learn` | — | `Vec<StrategyLearnDetail>` | 阶段六 |

---

## 预留接口（阶段五实现）

以下接口在阶段五（数据存储层）实现，当前阶段不做开发，仅预留定义：

```
GET    /api/watchlist              → Vec<StockInfo>       // 获取自选股列表
POST   /api/watchlist              → StockInfo            // 添加自选股（请求体: StockInfo）
DELETE /api/watchlist/{symbol}     → { success: true }    // 删除自选股
GET    /api/settings               → Record<string, string>  // 获取用户设置
PUT    /api/settings               → Record<string, string>  // 更新用户设置
```
