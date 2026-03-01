//! 策略模块
//!
//! 定义交易策略 trait 和内置策略实现。

use crate::types::{StrategyInfo, StrategyLearnDetail};
use std::collections::HashMap;

pub mod ma_cross;
pub mod rsi;
pub mod bollinger;
pub mod macd;

/// 交易信号
#[derive(Debug, Clone)]
pub struct Signal {
    /// 数据在数组中的索引
    pub index: usize,
    /// 信号类型："buy" 或 "sell"
    pub signal_type: String,
}

/// 获取所有内置策略信息列表
pub fn get_strategy_list() -> Vec<StrategyInfo> {
    vec![
        StrategyInfo {
            id: "dual-ma".to_string(),
            name: "双均线策略".to_string(),
            description: "使用短期和长期移动平均线交叉产生买卖信号的经典趋势跟随策略。".to_string(),
            params: HashMap::from([
                ("shortPeriod".to_string(), 5.0),
                ("longPeriod".to_string(), 20.0),
            ]),
        },
        StrategyInfo {
            id: "rsi".to_string(),
            name: "RSI 策略".to_string(),
            description: "利用相对强弱指数寻找超买和超卖区间的震荡反转策略。".to_string(),
            params: HashMap::from([
                ("period".to_string(), 14.0),
                ("overbought".to_string(), 70.0),
                ("oversold".to_string(), 30.0),
            ]),
        },
        StrategyInfo {
            id: "bollinger".to_string(),
            name: "布林带策略".to_string(),
            description: "基于价格突破布林带上下轨进行反向操作的均值回归策略。".to_string(),
            params: HashMap::from([
                ("period".to_string(), 20.0),
                ("stdDev".to_string(), 2.0),
            ]),
        },
        StrategyInfo {
            id: "macd".to_string(),
            name: "MACD 策略".to_string(),
            description: "利用指数平滑移动平均线差异衡量动能的趋势追踪工具。".to_string(),
            params: HashMap::from([
                ("fast".to_string(), 12.0),
                ("slow".to_string(), 26.0),
                ("signal".to_string(), 9.0),
            ]),
        },
    ]
}

/// 获取所有策略的学习详情
pub fn get_strategy_learn_list() -> Vec<StrategyLearnDetail> {
    todo!("阶段六实现：返回策略学习内容")
}
