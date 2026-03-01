//! 策略模块
//!
//! 定义交易策略 trait 和内置策略实现。

use crate::types::{Formula, StrategyInfo, StrategyLearnDetail};
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
    vec![
        StrategyLearnDetail {
            id: "dual-ma".to_string(),
            name: "双均线交叉策略".to_string(),
            short_desc: "MA5/MA20 金叉死叉".to_string(),
            level: "入门级".to_string(),
            status: "未学".to_string(),
            explanation: "双均线交叉策略利用短期均线(MA5)与长期均线(MA20)的交叉关系来判断买卖时机。\
当短期均线上穿长期均线时形成「金叉」，产生买入信号；当短期均线下穿长期均线时形成「死叉」，\
产生卖出信号。该策略属于趋势跟随型策略，能有效捕捉市场的中期趋势，\
但可能在横盘震荡行情中产生较多虚假信号，导致频繁交易和手续费损耗。\
适合在趋势明显的市场中使用，建议配合成交量指标进行确认。".to_string(),
            formulas: vec![
                Formula {
                    label: "公式".to_string(),
                    code: "MA(n) = (C₁ + C₂ + ... + Cₙ) / n".to_string(),
                    color: "#22D3EE".to_string(),
                },
                Formula {
                    label: "买入信号".to_string(),
                    code: "买入信号: MA5 > MA20 (金叉)".to_string(),
                    color: "#EF4444".to_string(),
                },
                Formula {
                    label: "卖出信号".to_string(),
                    code: "卖出信号: MA5 < MA20 (死叉)".to_string(),
                    color: "#22C55E".to_string(),
                },
            ],
        },
        StrategyLearnDetail {
            id: "rsi".to_string(),
            name: "RSI 超买超卖策略".to_string(),
            short_desc: "相对强弱指标".to_string(),
            level: "进阶级".to_string(),
            status: "未学".to_string(),
            explanation: "RSI（Relative Strength Index，相对强弱指标）通过比较一段时期内的\
平均收盘涨幅和平均收盘跌幅来分析市场买卖盘的意向和实力。通常采用14天的周期计算，\
RSI值在0到100之间波动。当RSI大于70时被认为进入超买区域，市场可能即将回调，\
产生卖出信号；当RSI低于30时被视为超卖区域，市场可能即将反弹，产生买入信号。\
RSI策略属于震荡反转型策略，适合在区间震荡的市场环境中使用，\
在单边趋势行情中可能出现钝化现象导致信号失效。".to_string(),
            formulas: vec![
                Formula {
                    label: "公式".to_string(),
                    code: "RSI = 100 - [100 / (1 + RS)]\nRS = 平均上涨幅度 / 平均下跌幅度".to_string(),
                    color: "#22D3EE".to_string(),
                },
                Formula {
                    label: "买入信号".to_string(),
                    code: "买入信号: RSI < 30 (超卖区)".to_string(),
                    color: "#EF4444".to_string(),
                },
                Formula {
                    label: "卖出信号".to_string(),
                    code: "卖出信号: RSI > 70 (超买区)".to_string(),
                    color: "#22C55E".to_string(),
                },
            ],
        },
        StrategyLearnDetail {
            id: "bollinger".to_string(),
            name: "布林带突破策略".to_string(),
            short_desc: "Bollinger Bands 均值回归".to_string(),
            level: "进阶级".to_string(),
            status: "未学".to_string(),
            explanation: "布林带（Bollinger Bands）由三条轨道线组成：中轨是N日的简单移动平均线，\
上轨是中轨加上两倍的标准差，下轨是中轨减去两倍的标准差。布林带的宽度反映了价格的波动率，\
当布林带收窄时预示着大幅波动即将到来。当价格触及或跌破下轨时，暗示可能出现超卖反弹的\
均值回归机会，产生买入信号；当价格触及或突破上轨时，可能面临超买回调，产生卖出信号。\
该策略结合了趋势和波动率两个维度的信息，适用于震荡和突破行情。".to_string(),
            formulas: vec![
                Formula {
                    label: "中轨(MB)".to_string(),
                    code: "MB = MA(Close, N)".to_string(),
                    color: "#22D3EE".to_string(),
                },
                Formula {
                    label: "上轨(UP)".to_string(),
                    code: "UP = MB + 2 × σ(Close, N)".to_string(),
                    color: "#EF4444".to_string(),
                },
                Formula {
                    label: "下轨(DN)".to_string(),
                    code: "DN = MB - 2 × σ(Close, N)".to_string(),
                    color: "#22C55E".to_string(),
                },
            ],
        },
        StrategyLearnDetail {
            id: "macd".to_string(),
            name: "MACD 趋势动量策略".to_string(),
            short_desc: "指数平滑异同移动平均线".to_string(),
            level: "高级".to_string(),
            status: "未学".to_string(),
            explanation: "MACD（Moving Average Convergence Divergence，指数平滑异同移动平均线）\
由DIF线、DEA线和MACD柱状图三部分组成。DIF线是快速EMA(12)与慢速EMA(26)的差值，\
DEA线是DIF线的9日指数移动平均。当DIF线上穿DEA线（金叉）时产生买入信号，\
下穿（死叉）时产生卖出信号。MACD柱状图直观展示了多空力量的变化，\
柱体由负转正表示多头力量增强，由正转负则相反。MACD背离是高级交易技巧：\
当价格创新高而MACD没有创新高（顶背离）暗示上涨动能减弱；反之（底背离）则暗示下跌动能减弱。".to_string(),
            formulas: vec![
                Formula {
                    label: "DIF线".to_string(),
                    code: "DIF = EMA(Close, 12) - EMA(Close, 26)".to_string(),
                    color: "#22D3EE".to_string(),
                },
                Formula {
                    label: "DEA线(信号线)".to_string(),
                    code: "DEA = EMA(DIF, 9)".to_string(),
                    color: "#F59E0B".to_string(),
                },
                Formula {
                    label: "MACD柱".to_string(),
                    code: "MACD = (DIF - DEA) × 2".to_string(),
                    color: "#A855F7".to_string(),
                },
            ],
        },
    ]
}
