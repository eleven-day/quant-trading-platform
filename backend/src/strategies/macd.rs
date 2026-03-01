//! MACD 策略
//!
//! 利用指数平滑移动平均线差异衡量动能的趋势追踪工具。

use crate::types::OHLCV;
use super::Signal;

/// 生成 MACD 买卖信号
pub fn generate_signals(data: &[OHLCV]) -> Vec<Signal> {
    let mut signals = Vec::new();
    let n = data.len();
    
    // 需要 26 个数据点计算出第一个 MACD，再加上 8 个数据点计算第一个 Signal 线，至少 34 个数据点
    if n < 34 {
        return signals;
    }

    let k12 = 2.0 / 13.0;
    let k26 = 2.0 / 27.0;
    let k9 = 2.0 / 10.0;

    let mut ema12 = vec![0.0; n];
    let mut ema26 = vec![0.0; n];
    let mut macd = vec![0.0; n];
    let mut signal_line = vec![0.0; n];
    let mut histogram = vec![0.0; n];

    // 1. 计算 EMA12
    let sum12: f64 = data[0..12].iter().map(|d| d.close).sum();
    ema12[11] = sum12 / 12.0;
    for i in 12..n {
        ema12[i] = data[i].close * k12 + ema12[i - 1] * (1.0 - k12);
    }

    // 2. 计算 EMA26 和 MACD
    let sum26: f64 = data[0..26].iter().map(|d| d.close).sum();
    ema26[25] = sum26 / 26.0;
    macd[25] = ema12[25] - ema26[25];
    for i in 26..n {
        ema26[i] = data[i].close * k26 + ema26[i - 1] * (1.0 - k26);
        macd[i] = ema12[i] - ema26[i];
    }

    // 3. 计算 Signal 线和 Histogram
    // 第一根 Signal 线位于 index 33 (包含 macd[25] 到 macd[33] 共 9 个点)
    let sum9: f64 = macd[25..=33].iter().sum();
    signal_line[33] = sum9 / 9.0;
    histogram[33] = macd[33] - signal_line[33];
    for i in 34..n {
        signal_line[i] = macd[i] * k9 + signal_line[i - 1] * (1.0 - k9);
        histogram[i] = macd[i] - signal_line[i];
    }

    // 4. 根据 Histogram 交叉零轴生成信号
    for i in 34..n {
        if data[i].volume == 0 {
            continue; // 跳过停牌日
        }

        let prev_hist = histogram[i - 1];
        let curr_hist = histogram[i];

        // 买入：Histogram 从下方上穿 0
        if prev_hist <= 0.0 && curr_hist > 0.0 {
            signals.push(Signal {
                index: i,
                signal_type: "buy".to_string(),
            });
        }
        // 卖出：Histogram 从上方下穿 0
        else if prev_hist >= 0.0 && curr_hist < 0.0 {
            signals.push(Signal {
                index: i,
                signal_type: "sell".to_string(),
            });
        }
    }

    signals
}
