# v0.1.1 Bugfix 归档

> 发布日期：2026-03-01
> 版本：v0.1.0 → v0.1.1

---

## 修复概览

| # | 严重度 | 描述 | 涉及文件 |
|---|--------|------|----------|
| 1 | 🔴 高 | 行情看板 日K/周K/月K 切换无反应 | `dashboard/page.tsx` |
| 2 | 🔴 高 | 自选股列表部分股票无数据/假数据 | `dashboard/page.tsx`, `Watchlist.tsx` |
| 3 | 🔴 高 | 搜索股票功能不存在 | `StockSearch.tsx` (新增), `dashboard/page.tsx` |
| 4 | 🔴 高 | 策略回测页股票选择器无法交互 | `ConfigBar.tsx` |
| 5 | 🟡 中 | 策略学习「未学」标记无法消除 | `learn/page.tsx` |

---

## Bug 1: 行情看板 日K/周K/月K 切换无反应

**现象**：点击 K 线图上方的日K/周K/月K tab，图表数据不变，始终显示月K。

**根因**：
- `dashboard/page.tsx` 的 `useEffect` 仅依赖 `selectedStock.symbol`，不依赖 `activeTab`
- 后端 `getStockDaily` API 只返回日线数据，无周K/月K聚合能力

**修复**：
- 实现客户端 `aggregateOHLCV()` 工具函数，将日线数据聚合为周K/月K
- 使用 `useMemo` 根据 `activeTab` 和原始日线数据计算聚合结果
- K 线图组件接收聚合后的数据，tab 切换立即响应

---

## Bug 2: 自选股列表部分股票无数据/假数据

**现象**：自选股列表 6 只股票中，仅 2 只有数据，其余显示假价格或为空。

**根因**：
- Dashboard 用 `searchStocks('0')` 搜索结果冒充自选股列表
- `Watchlist.tsx` 使用 `getMockPrice()` 从 symbol 哈希生成假价格

**修复**：
- Dashboard 改为调用 `getWatchlist()` API 获取真实自选股列表
- `Watchlist.tsx` 完全重写，接收 `prices` prop 显示真实行情
- 无数据时显示 `--` 而非假数据
- 使用 `Partial<Record<...>>` 类型安全处理缺失数据

---

## Bug 3: 搜索股票名称或代码点击无跳转

**现象**：看板页面无法搜索股票，搜索 UI 从未实现。

**根因**：
- 整个搜索功能（输入框、下拉列表、点击处理）均不存在
- `searchStocks` API 已实现但无 UI 调用入口

**修复**：
- 新增 `StockSearch.tsx` 组件（防抖搜索 + 下拉结果列表）
- 使用 `useDebounce` hook 实现 300ms 防抖
- 点击搜索结果自动添加到自选股并切换查看
- 集成到 Dashboard 页面头部

---

## Bug 4: 策略回测页面股票无法更换

**现象**：回测页面股票选择器（默认平安银行）无法点击、输入或更换。

**根因**：
- `ConfigBar.tsx` 的股票选择器是静态 `<div>`，仅渲染文本
- `onStockChange` 回调已传入但未绑定到任何交互元素

**修复**：
- `ConfigBar.tsx` 完全重写，股票选择器改为可交互搜索组件
- 点击显示搜索输入框，输入后调用 `searchStocks` API
- 使用 `useDebounce` 防抖，结果下拉列表支持点击选择
- 使用 `fetchedKeyword` 派生加载状态，避免 React Hook lint 问题

---

## Bug 5: 策略学习「未学」标记无法消除

**现象**：学习页面侧边栏「未学」徽章始终显示，阅读后不变。

**根因**：
- 完全没有学习进度追踪机制
- `StrategySidebar.tsx` 仅根据后端硬编码的 `status` 渲染
- 后端无更新学习进度的接口

**修复**（方案 A — 前端 localStorage）：
- `learn/page.tsx` 增加 localStorage 持久化学习进度
- 用户阅读策略内容 3 秒后自动标记为「已学」
- 侧边栏实时更新徽章状态（未学 → 已学）
- 无需后端改动，刷新页面后状态保留

---

## 修改文件清单

### 新增
- `frontend/src/components/dashboard/StockSearch.tsx` — 搜索股票组件

### 修改
- `frontend/src/app/dashboard/page.tsx` — K线聚合、真实自选股、搜索集成
- `frontend/src/components/dashboard/Watchlist.tsx` — 真实行情数据展示
- `frontend/src/components/dashboard/index.ts` — 导出 StockSearch
- `frontend/src/components/backtest/ConfigBar.tsx` — 交互式股票选择器
- `frontend/src/app/learn/page.tsx` — localStorage 学习进度追踪
