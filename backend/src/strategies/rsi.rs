//! RSI 策略
//!
//! 利用相对强弱指数寻找超买和超卖区间的震荡反转策略。

use crate::types::OHLCV;
use super::Signal;

/// 生成 RSI 买卖信号
pub fn generate_signals(data: &[OHLCV]) -> Vec<Signal> {
    let mut signals = Vec::new();
    let n = data.len();
    
    if n < 15 {
        return signals;
    }

    let mut rsi_values = vec![0.0; n];
    let mut avg_gain = 0.0;
    let mut avg_loss = 0.0;

    // 计算最初的 14 个周期的平均涨跌幅
    for i in 1..=14 {
        let change = data[i].close - data[i - 1].close;
        if change > 0.0 {
            avg_gain += change;
        } else {
            avg_loss += -change;
        }
    }
    avg_gain /= 14.0;
    avg_loss /= 14.0;

    if avg_loss == 0.0 {
        rsi_values[14] = if avg_gain == 0.0 { 50.0 } else { 100.0 };
    } else {
        let rs = avg_gain / avg_loss;
        rsi_values[14] = 100.0 - (100.0 / (1.0 + rs));
    }

    // RSI 首次计算点的初始状态信号
    if data[14].volume > 0 && rsi_values[14] > 50.0 {
        signals.push(Signal {
            index: 14,
            signal_type: "buy".to_string(),
        });
    }

    // 计算后续的 RSI，并产生信号
    for i in 15..n {
        let change = data[i].close - data[i - 1].close;
        let gain = if change > 0.0 { change } else { 0.0 };
        let loss = if change < 0.0 { -change } else { 0.0 };

        avg_gain = (avg_gain * 13.0 + gain) / 14.0;
        avg_loss = (avg_loss * 13.0 + loss) / 14.0;

        if avg_loss == 0.0 {
            rsi_values[i] = if avg_gain == 0.0 { 50.0 } else { 100.0 };
        } else {
            let rs = avg_gain / avg_loss;
            rsi_values[i] = 100.0 - (100.0 / (1.0 + rs));
        }

        if data[i].volume == 0 {
            continue; // 跳过停牌日
        }

        let prev_rsi = rsi_values[i - 1];
        let curr_rsi = rsi_values[i];

        // 买入：RSI 从下方上穿 30
        if prev_rsi <= 30.0 && curr_rsi > 30.0 {
            signals.push(Signal {
                index: i,
                signal_type: "buy".to_string(),
            });
        } 
        // 卖出：RSI 从上方下穿 70
        else if prev_rsi >= 70.0 && curr_rsi < 70.0 {
            signals.push(Signal {
                index: i,
                signal_type: "sell".to_string(),
            });
        }
    }

    signals
}
