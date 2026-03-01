//! 双均线交叉策略
//!
//! 使用短期和长期移动平均线交叉产生买卖信号的经典趋势跟随策略。

use crate::types::OHLCV;
use super::Signal;

/// 生成双均线买卖信号
pub fn generate_signals(data: &[OHLCV]) -> Vec<Signal> {
    let mut signals = Vec::new();
    let n = data.len();
    
    if n < 20 {
        return signals;
    }

    let mut sma5 = vec![0.0; n];
    let mut sma20 = vec![0.0; n];

    // 计算移动平均线
    for i in 0..n {
        if i >= 4 {
            let sum: f64 = data[i - 4..=i].iter().map(|d| d.close).sum();
            sma5[i] = sum / 5.0;
        }
        if i >= 19 {
            let sum: f64 = data[i - 19..=i].iter().map(|d| d.close).sum();
            sma20[i] = sum / 20.0;
        }
    }

    let threshold_ratio = 0.005;

    // 检查首个有效点的初始状态（index 19 是第一个同时有 SMA5 和 SMA20 的位置）
    if data[19].volume > 0 {
        let diff = sma5[19] - sma20[19];
        if diff > threshold_ratio * sma20[19] {
            signals.push(Signal {
                index: 19,
                signal_type: "buy".to_string(),
            });
        } else if diff < -threshold_ratio * sma20[19] {
            signals.push(Signal {
                index: 19,
                signal_type: "sell".to_string(),
            });
        }
    }

    // 寻找交叉点
    for i in 20..n {
        if data[i].volume == 0 {
            continue; // 跳过停牌日
        }

        let prev_sma5 = sma5[i - 1];
        let prev_sma20 = sma20[i - 1];
        let curr_sma5 = sma5[i];
        let curr_sma20 = sma20[i];

        // 金叉买入：短线上穿长线
        if curr_sma5 > curr_sma20 && prev_sma5 <= prev_sma20
            && curr_sma5 - curr_sma20 > threshold_ratio * curr_sma20
        {
            signals.push(Signal {
                index: i,
                signal_type: "buy".to_string(),
            });
        }
        // 死叉卖出：短线下穿长线
        else if curr_sma5 < curr_sma20 && prev_sma5 >= prev_sma20
            && curr_sma20 - curr_sma5 > threshold_ratio * curr_sma20
        {
            signals.push(Signal {
                index: i,
                signal_type: "sell".to_string(),
            });
        }
    }

    signals
}
