//! 策略模块
//!
//! 定义交易策略 trait 和内置策略实现。

use crate::types::{StrategyInfo, StrategyLearnDetail};

pub mod ma_cross;
pub mod rsi;
pub mod bollinger;
pub mod macd;

/// 获取所有内置策略信息列表
pub fn get_strategy_list() -> Vec<StrategyInfo> {
    todo!("阶段四实现：返回内置策略列表")
}

/// 获取所有策略的学习详情
pub fn get_strategy_learn_list() -> Vec<StrategyLearnDetail> {
    todo!("阶段六实现：返回策略学习内容")
}
