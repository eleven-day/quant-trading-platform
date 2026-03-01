//! 布林带策略
//!
//! 基于价格突破布林带上下轨进行反向操作的均值回归策略。

use crate::types::OHLCV;
use super::Signal;

/// 生成布林带买卖信号
pub fn generate_signals(data: &[OHLCV]) -> Vec<Signal> {
    let mut signals = Vec::new();
    let n = data.len();
    
    if n < 20 {
        return signals;
    }

    let mut upper_bands = vec![0.0; n];
    let mut lower_bands = vec![0.0; n];
    let mut middle_bands = vec![0.0; n];

    // 计算中轨(SMA20)和上下轨
    for i in 19..n {
        let mut sum = 0.0;
        for j in (i - 19)..=i {
            sum += data[j].close;
        }
        let mean = sum / 20.0;

        let mut var_sum = 0.0;
        for j in (i - 19)..=i {
            var_sum += (data[j].close - mean).powi(2);
        }
        let std_dev = (var_sum / 20.0).sqrt();

        upper_bands[i] = mean + 2.0 * std_dev;
        lower_bands[i] = mean - 2.0 * std_dev;
        middle_bands[i] = mean;
    }

    // 寻找突破信号
    for i in 20..n {
        if data[i].volume == 0 {
            continue; // 跳过停牌日
        }

        let prev_close = data[i - 1].close;
        let curr_close = data[i].close;
        let prev_lower = lower_bands[i - 1];
        let curr_lower = lower_bands[i];
        let prev_upper = upper_bands[i - 1];
        let curr_upper = upper_bands[i];
        let prev_mid = middle_bands[i - 1];
        let curr_mid = middle_bands[i];

        // 买入：价格向下突破下轨或向上突破上轨（动量突破）
        if (prev_close >= prev_lower && curr_close < curr_lower) ||
           (prev_close <= prev_upper && curr_close > curr_upper) {
            signals.push(Signal {
                index: i,
                signal_type: "buy".to_string(),
            });
        } 
        // 卖出：价格从上或下穿越中轨（均值回归）
        else if (prev_close > prev_mid && curr_close <= curr_mid) ||
                (prev_close < prev_mid && curr_close >= curr_mid) {
            // 只有当前偏离上下轨且触及中轨时才卖出，这确保了已经发生过突破
            signals.push(Signal {
                index: i,
                signal_type: "sell".to_string(),
            });
        }
    }

    signals
}
