//! API 契约数据类型定义
//!
//! 本文件定义了前后端 JSON 通信使用的所有数据结构。
//! 字段命名规范：JSON 通信统一使用 camelCase，Rust 端通过 serde 属性映射。
//! 完整契约文档：`docs/api-contract.md`

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ─── K 线数据 ───────────────────────────────────────────────────────────────

/// OHLCV — 单根 K 线数据（日 K）
///
/// 约束：high >= low, high >= open, high >= close,
///       low <= open, low <= close, volume >= 0, close > 0
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OHLCV {
    /// 交易日期，格式 YYYY-MM-DD
    pub date: String,
    /// 开盘价
    pub open: f64,
    /// 最高价
    pub high: f64,
    /// 最低价
    pub low: f64,
    /// 收盘价
    pub close: f64,
    /// 成交量（股）
    pub volume: u64,
}

// ─── 股票信息 ───────────────────────────────────────────────────────────────

/// StockInfo — 股票基本信息
///
/// 用于搜索结果、自选股列表。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockInfo {
    /// 股票代码，6 位数字（如 "000001"）
    pub symbol: String,
    /// 股票名称（如 "平安银行"）
    pub name: String,
}

// ─── 指数快照 ───────────────────────────────────────────────────────────────

/// IndexSnapshot — 指数快照
///
/// Dashboard 顶部三大指数展示（上证指数、深证成指、创业板指）。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IndexSnapshot {
    /// 指数代码（如 "000001" 上证指数）
    pub symbol: String,
    /// 指数名称
    pub name: String,
    /// 当前点位
    pub points: f64,
    /// 涨跌幅，单位百分比（0.82 表示 +0.82%，不是 0.0082）
    pub change: f64,
}

// ─── 回测参数 ───────────────────────────────────────────────────────────────

/// BacktestParams — 回测请求参数
///
/// 校验规则：
/// - strategy_id 必须是已注册策略 ID
/// - symbol 必须是有效股票代码
/// - start_date < end_date
/// - initial_capital > 0
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BacktestParams {
    /// 策略标识（"dual-ma" / "rsi" / "bollinger" / "macd"）
    pub strategy_id: String,
    /// 股票代码
    pub symbol: String,
    /// 回测起始日期 YYYY-MM-DD
    pub start_date: String,
    /// 回测结束日期 YYYY-MM-DD
    pub end_date: String,
    /// 初始资金（元）
    pub initial_capital: f64,
}

// ─── 交易记录 ───────────────────────────────────────────────────────────────

/// Trade — 单笔交易记录
///
/// trade_type 仅为 "buy" 或 "sell"。
/// 买入时 pnl = 0，卖出时 pnl 为实际盈亏。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trade {
    /// 交易日期 YYYY-MM-DD
    pub date: String,
    /// 交易方向：仅 "buy" 或 "sell"（JSON 字段名为 "type"）
    #[serde(rename = "type")]
    pub trade_type: String,
    /// 成交价格
    pub price: f64,
    /// 成交数量（股）
    pub quantity: u64,
    /// 本笔盈亏（元）
    pub pnl: f64,
}

// ─── 收益曲线 ───────────────────────────────────────────────────────────────

/// EquityPoint — 收益曲线数据点
///
/// TypeScript 中为 equityCurve 内联类型，Rust 端抽出为独立结构体。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EquityPoint {
    /// 日期 YYYY-MM-DD
    pub date: String,
    /// 当日净值（元）
    pub value: f64,
}

// ─── 回测结果 ───────────────────────────────────────────────────────────────

/// BacktestResult — 完整回测结果
///
/// 约束：
/// - win_rate 范围 [0, 100]
/// - max_drawdown 范围 [-100, 0]
/// - equity_curve 第一个点的 value = 初始资金
/// - equity_curve 长度 = 回测区间交易日天数
/// - trades 和 equity_curve 均按 date 升序排列
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BacktestResult {
    /// 总收益率（百分比，23.5 表示 +23.5%）
    pub total_return: f64,
    /// 最大回撤（百分比，-12.8 表示 -12.8%）
    pub max_drawdown: f64,
    /// 夏普比率
    pub sharpe_ratio: f64,
    /// 胜率（百分比，58.3 表示 58.3%）
    pub win_rate: f64,
    /// 交易总笔数
    pub trade_count: usize,
    /// 交易记录列表
    pub trades: Vec<Trade>,
    /// 收益曲线数据
    pub equity_curve: Vec<EquityPoint>,
}

// ─── 策略信息 ───────────────────────────────────────────────────────────────

/// StrategyInfo — 策略信息
///
/// Backtest 页面策略下拉框使用。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StrategyInfo {
    /// 策略唯一标识（"dual-ma" / "rsi" / "bollinger" / "macd"）
    pub id: String,
    /// 策略显示名称
    pub name: String,
    /// 策略简要描述
    pub description: String,
    /// 策略参数键值对
    pub params: HashMap<String, f64>,
}

// ─── 策略学习 ───────────────────────────────────────────────────────────────

/// Formula — 公式子结构
///
/// 用于 StrategyLearnDetail 中的公式列表。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Formula {
    /// 公式标签（如 "公式"、"买入信号"）
    pub label: String,
    /// 公式内容（如 "MA(n) = (C₁ + C₂ + ... + Cₙ) / n"）
    pub code: String,
    /// 显示颜色（十六进制，如 "#22D3EE"）
    pub color: String,
}

/// StrategyLearnDetail — 策略学习详情
///
/// Learn 页面完整策略教学内容。
/// level 取值："入门级" / "进阶级" / "高级"
/// status 取值："已学" / "学习中" / "未学"（阶段五实现持久化前默认 "未学"）
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StrategyLearnDetail {
    /// 策略唯一标识，同 StrategyInfo.id
    pub id: String,
    /// 策略完整名称
    pub name: String,
    /// 一句话简述
    pub short_desc: String,
    /// 难度等级
    pub level: String,
    /// 当前用户学习状态
    pub status: String,
    /// 策略详细原理说明
    pub explanation: String,
    /// 公式列表
    pub formulas: Vec<Formula>,
}

// ─── 错误响应 ───────────────────────────────────────────────────────────────

/// ApiError — 统一错误响应格式
///
/// 所有接口异常情况下返回此结构。
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiError {
    /// 错误描述信息
    pub error: String,
    /// 错误码（INVALID_PARAM / STOCK_NOT_FOUND / STRATEGY_NOT_FOUND / DATA_SOURCE_ERROR / INTERNAL_ERROR）
    pub code: String,
}
