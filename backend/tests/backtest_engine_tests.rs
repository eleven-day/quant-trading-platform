//! 回测引擎 TDD 测试
//!
//! 测试回测引擎的核心逻辑：收益计算、资金守恒、回撤、胜率等。
//! 当前状态：编译通过，运行失败（等待阶段四实现）。
//!
//! 测试设计遵循 TDD 防 mock 检查清单：
//! - 性质测试：资金守恒、范围约束（胜率 [0,100]、回撤 [-100,0]）
//! - 不可预测性断言：不同输入 → 不同输出
//! - 收益曲线不变量：长度 = 交易日数、首点 = 初始资金
//! - 边界条件：空数据、数据不足、停牌日

use quant_backend::engine::backtest::run_backtest;
use quant_backend::types::OHLCV;

// ═══════════════════════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════════════════════

fn make_ohlcv(date: &str, open: f64, high: f64, low: f64, close: f64, volume: u64) -> OHLCV {
    OHLCV {
        date: date.to_string(),
        open,
        high,
        low,
        close,
        volume,
    }
}

/// 构造明确上涨序列：close 从 start 每天涨 step
fn make_uptrend(days: usize, start: f64, step: f64) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            let close = start + step * i as f64;
            make_ohlcv(
                &format!("2024-01-{:02}", (i % 28) + 1),
                close - 0.5,
                close + 1.0,
                close - 1.0,
                close,
                1000000,
            )
        })
        .collect()
}

/// 构造明确下跌序列
fn make_downtrend(days: usize, start: f64, step: f64) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            let close = start - step * i as f64;
            let close = close.max(1.0); // 保证价格为正
            make_ohlcv(
                &format!("2024-06-{:02}", (i % 28) + 1),
                close + 0.5,
                close + 1.0,
                close - 0.5,
                close,
                1000000,
            )
        })
        .collect()
}

/// 构造 V 形反转数据（先涨后跌）
fn make_v_reversal(days: usize, base: f64, amplitude: f64) -> Vec<OHLCV> {
    let half = days / 2;
    (0..days)
        .map(|i| {
            let close = if i <= half {
                base + amplitude * (i as f64 / half as f64)
            } else {
                base + amplitude * (1.0 - (i - half) as f64 / (days - half) as f64)
            };
            make_ohlcv(
                &format!("2024-03-{:02}", (i % 28) + 1),
                close - 0.3,
                close + 0.5,
                close - 0.5,
                close,
                800000,
            )
        })
        .collect()
}

/// 构造含停牌日数据（指定位置 volume=0）
fn make_data_with_halts(days: usize, base: f64, halt_indices: &[usize]) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            let close = base + (i as f64) * 0.3;
            let volume = if halt_indices.contains(&i) {
                0
            } else {
                1000000
            };
            make_ohlcv(
                &format!("2024-08-{:02}", (i % 28) + 1),
                close - 0.2,
                close + 0.3,
                close - 0.3,
                close,
                volume,
            )
        })
        .collect()
}

// ═══════════════════════════════════════════════════════════════════════════════
// 基本功能测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 上涨行情 + 趋势策略 → 正收益
#[test]
fn test_uptrend_with_trend_strategy_positive_return() {
    // 50 天稳定上涨：10.0 → 34.5，涨幅 245%
    let data = make_uptrend(50, 10.0, 0.5);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert!(
        result.total_return > 0.0,
        "上涨行情的趋势跟随策略应有正收益，实际: {}%",
        result.total_return
    );
}

/// 下跌行情 → 交易次数有限，不应亏光
#[test]
fn test_downtrend_does_not_lose_everything() {
    let data = make_downtrend(50, 50.0, 0.8);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    // 即使下跌行情，最大回撤不应超过 100%
    assert!(
        result.max_drawdown >= -100.0,
        "最大回撤不应超过 -100%，实际: {}%",
        result.max_drawdown
    );
}

/// 数据不足时不产生交易，收益为零
#[test]
fn test_insufficient_data_zero_return() {
    let data = make_uptrend(5, 10.0, 1.0); // 只有 5 天
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(result.trade_count, 0, "数据不足时不应产生交易");
    assert!(
        result.total_return.abs() < 1e-10,
        "无交易时收益应为零，实际: {}",
        result.total_return
    );
}

/// 空数据 → 不报错，返回零交易零收益
#[test]
fn test_empty_data_no_error() {
    let data: Vec<OHLCV> = vec![];
    let result = run_backtest("dual-ma", &data, 100000.0).expect("空数据不应返回错误");

    assert_eq!(result.trade_count, 0, "空数据应返回零交易");
    assert!(result.trades.is_empty(), "空数据交易列表应为空");
    assert!(result.total_return.abs() < 1e-10, "空数据收益应为零");
}

/// 无效策略 ID → 应返回错误
#[test]
fn test_invalid_strategy_id_returns_error() {
    let data = make_uptrend(50, 10.0, 0.5);
    let result = run_backtest("nonexistent-strategy", &data, 100000.0);

    assert!(
        result.is_err(),
        "无效策略 ID 'nonexistent-strategy' 应返回错误"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 收益曲线不变量测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 收益曲线长度 = 交易日天数（即输入数据长度）
#[test]
fn test_equity_curve_length_equals_trading_days() {
    let data = make_uptrend(40, 10.0, 0.5);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.equity_curve.len(),
        data.len(),
        "收益曲线长度({})应等于交易日天数({})",
        result.equity_curve.len(),
        data.len()
    );
}

/// 收益曲线第一个点 = 初始资金
#[test]
fn test_equity_curve_starts_with_initial_capital() {
    let data = make_uptrend(40, 10.0, 0.5);
    let initial_capital = 100000.0;
    let result =
        run_backtest("dual-ma", &data, initial_capital).expect("run_backtest 不应返回错误");

    assert!(!result.equity_curve.is_empty(), "收益曲线不应为空");
    assert!(
        (result.equity_curve[0].value - initial_capital).abs() < 0.01,
        "收益曲线首点({})应等于初始资金({})",
        result.equity_curve[0].value,
        initial_capital
    );
}

/// 不同初始资金 → 收益曲线首点不同
#[test]
fn test_equity_curve_respects_different_initial_capital() {
    let data = make_uptrend(40, 10.0, 0.5);

    let result_100k = run_backtest("dual-ma", &data, 100000.0).expect("100k 失败");
    let result_200k = run_backtest("dual-ma", &data, 200000.0).expect("200k 失败");

    assert!(
        (result_100k.equity_curve[0].value - 100000.0).abs() < 0.01,
        "100k 首点应为 100000"
    );
    assert!(
        (result_200k.equity_curve[0].value - 200000.0).abs() < 0.01,
        "200k 首点应为 200000"
    );
}

/// 收益曲线的日期应与输入数据日期一一对应
#[test]
fn test_equity_curve_dates_match_input_data() {
    let data = make_uptrend(30, 10.0, 0.5);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(result.equity_curve.len(), data.len());
    for (i, point) in result.equity_curve.iter().enumerate() {
        assert_eq!(
            point.date, data[i].date,
            "收益曲线第 {} 个点日期({})应匹配输入数据日期({})",
            i, point.date, data[i].date
        );
    }
}

/// 收益曲线按日期升序排列
#[test]
fn test_equity_curve_sorted_by_date() {
    let data = make_v_reversal(50, 10.0, 25.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    for i in 1..result.equity_curve.len() {
        assert!(
            result.equity_curve[i].date >= result.equity_curve[i - 1].date,
            "收益曲线未按日期升序: {} 在 {} 之前",
            result.equity_curve[i].date,
            result.equity_curve[i - 1].date
        );
    }
}

/// 收益曲线值应始终为正（不能亏成负数）
#[test]
fn test_equity_curve_values_always_positive() {
    let data = make_downtrend(50, 50.0, 0.8);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    for point in &result.equity_curve {
        assert!(
            point.value > 0.0,
            "收益曲线值应始终为正，日期 {} 值为 {}",
            point.date,
            point.value
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 资金守恒不变量
// ═══════════════════════════════════════════════════════════════════════════════

/// 资金守恒：最终净值 = 初始资金 + 已实现盈亏 + 未实现盈亏
/// 已实现盈亏 = 所有卖出交易的 pnl 之和
/// 收益曲线最后一个点的 value 应反映最终净值
#[test]
fn test_capital_conservation_invariant() {
    let data = make_v_reversal(50, 10.0, 25.0);
    let initial_capital = 100000.0;
    let result =
        run_backtest("dual-ma", &data, initial_capital).expect("run_backtest 不应返回错误");

    // 已实现盈亏 = 所有卖出交易的 pnl 之和
    let realized_pnl: f64 = result
        .trades
        .iter()
        .filter(|t| t.trade_type == "sell")
        .map(|t| t.pnl)
        .sum();

    let final_equity = result
        .equity_curve
        .last()
        .map(|p| p.value)
        .unwrap_or(initial_capital);

    // 如果最后没有持仓（买入次数 == 卖出次数），最终净值 = 初始资金 + 已实现盈亏
    let buy_count = result
        .trades
        .iter()
        .filter(|t| t.trade_type == "buy")
        .count();
    let sell_count = result
        .trades
        .iter()
        .filter(|t| t.trade_type == "sell")
        .count();

    if buy_count == sell_count {
        // 无持仓：最终净值 = 初始资金 + 已实现盈亏（允许浮点误差）
        let expected = initial_capital + realized_pnl;
        assert!(
            (final_equity - expected).abs() < 1.0, // 允许 1 元误差（手续费等）
            "无持仓时资金守恒：最终净值({:.2})应近似等于初始资金({:.2}) + 已实现盈亏({:.2}) = {:.2}",
            final_equity, initial_capital, realized_pnl, expected
        );
    }
    // 有持仓时，最终净值 > 初始资金 + 已实现盈亏（因为还有持仓浮盈/浮亏）
    // 此处不做严格断言，但净值应在合理范围内
}

/// 总收益率与收益曲线首尾一致
#[test]
fn test_total_return_consistent_with_equity_curve() {
    let data = make_uptrend(50, 10.0, 0.5);
    let initial_capital = 100000.0;
    let result =
        run_backtest("dual-ma", &data, initial_capital).expect("run_backtest 不应返回错误");

    if !result.equity_curve.is_empty() {
        let final_value = result.equity_curve.last().unwrap().value;
        let expected_return = (final_value - initial_capital) / initial_capital * 100.0;

        assert!(
            (result.total_return - expected_return).abs() < 0.1,
            "总收益率({:.4}%)应与收益曲线计算值({:.4}%)一致",
            result.total_return,
            expected_return
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 范围约束测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 最大回撤应在 [-100, 0] 范围内
#[test]
fn test_max_drawdown_in_valid_range() {
    let test_cases: Vec<(&str, Vec<OHLCV>)> = vec![
        ("上涨", make_uptrend(50, 10.0, 0.5)),
        ("下跌", make_downtrend(50, 50.0, 0.8)),
        ("反转", make_v_reversal(50, 10.0, 25.0)),
    ];

    for (label, data) in test_cases {
        let result = run_backtest("dual-ma", &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 行情回测失败: {}", label, e));

        assert!(
            result.max_drawdown >= -100.0 && result.max_drawdown <= 0.0,
            "{} 行情最大回撤({})应在 [-100, 0] 范围内",
            label,
            result.max_drawdown
        );
    }
}

/// 胜率应在 [0, 100] 范围内
#[test]
fn test_win_rate_in_valid_range() {
    let test_cases: Vec<(&str, Vec<OHLCV>)> = vec![
        ("上涨", make_uptrend(50, 10.0, 0.5)),
        ("下跌", make_downtrend(50, 50.0, 0.8)),
        ("反转", make_v_reversal(50, 10.0, 25.0)),
    ];

    for (label, data) in test_cases {
        let result = run_backtest("dual-ma", &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 行情回测失败: {}", label, e));

        assert!(
            result.win_rate >= 0.0 && result.win_rate <= 100.0,
            "{} 行情胜率({})应在 [0, 100] 范围内",
            label,
            result.win_rate
        );
    }
}

/// 交易次数应等于 trades 列表长度
#[test]
fn test_trade_count_matches_trades_length() {
    let data = make_v_reversal(50, 10.0, 25.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count,
        result.trades.len(),
        "trade_count({}) 应等于 trades 列表长度({})",
        result.trade_count,
        result.trades.len()
    );
}

/// 无交易时回撤应为 0
#[test]
fn test_no_trades_drawdown_zero() {
    let data = make_uptrend(5, 10.0, 1.0); // 数据不足，无交易
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(result.trade_count, 0);
    assert!(
        result.max_drawdown.abs() < 1e-10,
        "无交易时最大回撤应为 0，实际: {}",
        result.max_drawdown
    );
}

/// 无交易时胜率应为 0
#[test]
fn test_no_trades_win_rate_zero() {
    let data = make_uptrend(5, 10.0, 1.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(result.trade_count, 0);
    assert!(
        result.win_rate.abs() < 1e-10,
        "无交易时胜率应为 0，实际: {}",
        result.win_rate
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 停牌日处理
// ═══════════════════════════════════════════════════════════════════════════════

/// 停牌日（volume=0）不应触发交易
#[test]
fn test_halted_days_no_trades() {
    let halt_indices = vec![5, 10, 15, 20]; // 第 6、11、16、21 天停牌
    let data = make_data_with_halts(40, 10.0, &halt_indices);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    // 收集停牌日日期
    let halt_dates: Vec<String> = halt_indices
        .iter()
        .map(|&i| format!("2024-08-{:02}", (i % 28) + 1))
        .collect();

    for trade in &result.trades {
        assert!(
            !halt_dates.contains(&trade.date),
            "停牌日 {} 不应发生交易",
            trade.date
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 不可预测性测试（防硬编码）
// ═══════════════════════════════════════════════════════════════════════════════

/// 不同股票数据（不同起始价和涨幅）→ 回测结果不同
#[test]
fn test_different_data_different_results() {
    let data1 = make_uptrend(50, 10.0, 0.5); // 低价稳涨
    let data2 = make_uptrend(50, 50.0, 1.2); // 高价快涨
    let data3 = make_v_reversal(50, 10.0, 25.0); // V 形反转

    let r1 = run_backtest("dual-ma", &data1, 100000.0).expect("r1 失败");
    let r2 = run_backtest("dual-ma", &data2, 100000.0).expect("r2 失败");
    let r3 = run_backtest("dual-ma", &data3, 100000.0).expect("r3 失败");

    // 三组不同数据的收益率不应完全相同
    let all_same = (r1.total_return - r2.total_return).abs() < 1e-10
        && (r2.total_return - r3.total_return).abs() < 1e-10;
    assert!(
        !all_same,
        "不同数据的收益率不应完全相同: {}, {}, {} — 疑似硬编码",
        r1.total_return, r2.total_return, r3.total_return
    );
}

/// 不同初始资金 → 交易数量相同但绝对盈亏不同
#[test]
fn test_different_capital_different_absolute_pnl() {
    let data = make_v_reversal(50, 10.0, 25.0);

    let r_100k = run_backtest("dual-ma", &data, 100000.0).expect("100k 失败");
    let r_500k = run_backtest("dual-ma", &data, 500000.0).expect("500k 失败");

    // 交易次数应相同（策略信号与资金无关）
    assert_eq!(
        r_100k.trade_count, r_500k.trade_count,
        "不同资金的交易次数应相同"
    );

    // 如果有交易，绝对盈亏应不同（更多资金 → 更大数量 → 更大盈亏）
    if r_100k.trade_count > 0 {
        let pnl_100k: f64 = r_100k.trades.iter().map(|t| t.pnl.abs()).sum();
        let pnl_500k: f64 = r_500k.trades.iter().map(|t| t.pnl.abs()).sum();

        // 500k 资金的绝对盈亏应大于 100k
        if pnl_100k > 0.0 {
            assert!(
                pnl_500k > pnl_100k,
                "500k 资金的绝对盈亏({:.2})应大于 100k({:.2})",
                pnl_500k,
                pnl_100k
            );
        }
    }
}

/// 不同策略 → 不同回测结果
#[test]
fn test_different_strategies_different_results() {
    let data = make_v_reversal(50, 10.0, 25.0);

    let r_ma = run_backtest("dual-ma", &data, 100000.0).expect("dual-ma 失败");
    let r_rsi = run_backtest("rsi", &data, 100000.0).expect("rsi 失败");
    let r_bb = run_backtest("bollinger", &data, 100000.0).expect("bollinger 失败");
    let r_macd = run_backtest("macd", &data, 100000.0).expect("macd 失败");

    let returns = [
        r_ma.total_return,
        r_rsi.total_return,
        r_bb.total_return,
        r_macd.total_return,
    ];
    let all_same = returns.iter().all(|&r| (r - returns[0]).abs() < 1e-10);
    assert!(
        !all_same,
        "4 个策略的收益率不应完全相同: {:?} — 疑似硬编码",
        returns
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 交易逻辑一致性
// ═══════════════════════════════════════════════════════════════════════════════

/// 交易记录中买卖应交替出现（先买后卖，不能连续两次买入）
#[test]
fn test_trades_alternate_buy_sell() {
    let data = make_v_reversal(50, 10.0, 25.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    if result.trades.len() >= 2 {
        // 第一笔应为买入
        assert_eq!(result.trades[0].trade_type, "buy", "第一笔交易应为买入");

        // 买卖应交替出现
        for i in 1..result.trades.len() {
            let prev = &result.trades[i - 1].trade_type;
            let curr = &result.trades[i].trade_type;
            assert_ne!(
                prev,
                curr,
                "交易应买卖交替，但第 {} 笔({})和第 {} 笔({})相同",
                i - 1,
                prev,
                i,
                curr
            );
        }
    }
}

/// 卖出数量应等于对应买入数量
#[test]
fn test_sell_quantity_matches_buy_quantity() {
    let data = make_v_reversal(50, 10.0, 25.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    // 买卖成对检查
    let mut i = 0;
    while i + 1 < result.trades.len() {
        if result.trades[i].trade_type == "buy" && result.trades[i + 1].trade_type == "sell" {
            assert_eq!(
                result.trades[i].quantity,
                result.trades[i + 1].quantity,
                "第 {} 笔买入数量({})应等于第 {} 笔卖出数量({})",
                i,
                result.trades[i].quantity,
                i + 1,
                result.trades[i + 1].quantity
            );
            i += 2;
        } else {
            i += 1;
        }
    }
}

/// 买入交易 pnl = 0
#[test]
fn test_buy_trade_pnl_zero() {
    let data = make_uptrend(50, 10.0, 0.5);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    for (i, trade) in result.trades.iter().enumerate() {
        if trade.trade_type == "buy" {
            assert!(
                trade.pnl.abs() < 1e-10,
                "第 {} 笔买入交易 pnl 应为 0，实际: {}",
                i,
                trade.pnl
            );
        }
    }
}

/// 交易日期不应早于输入数据的第一天
#[test]
fn test_trade_dates_within_data_range() {
    let data = make_uptrend(50, 10.0, 0.5);
    let first_date = &data[0].date;
    let last_date = &data[data.len() - 1].date;

    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    for trade in &result.trades {
        assert!(
            &trade.date >= first_date,
            "交易日期({})不应早于数据起始日期({})",
            trade.date,
            first_date
        );
        assert!(
            &trade.date <= last_date,
            "交易日期({})不应晚于数据结束日期({})",
            trade.date,
            last_date
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 夏普比率基本约束
// ═══════════════════════════════════════════════════════════════════════════════

/// 夏普比率应为有限数（非 NaN、非 Infinity）
#[test]
fn test_sharpe_ratio_is_finite() {
    let test_cases: Vec<(&str, Vec<OHLCV>)> = vec![
        ("上涨", make_uptrend(50, 10.0, 0.5)),
        ("反转", make_v_reversal(50, 10.0, 25.0)),
    ];

    for (label, data) in test_cases {
        let result = run_backtest("dual-ma", &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 失败: {}", label, e));

        assert!(
            result.sharpe_ratio.is_finite(),
            "{} 行情夏普比率应为有限数，实际: {}",
            label,
            result.sharpe_ratio
        );
    }
}

/// 无交易时夏普比率应为 0
#[test]
fn test_no_trades_sharpe_ratio_zero() {
    let data = make_uptrend(5, 10.0, 1.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(result.trade_count, 0);
    assert!(
        result.sharpe_ratio.abs() < 1e-10,
        "无交易时夏普比率应为 0，实际: {}",
        result.sharpe_ratio
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 多策略回测引擎通用性
// ═══════════════════════════════════════════════════════════════════════════════

/// 所有 4 个策略都应能被回测引擎正确调度
#[test]
fn test_all_four_strategies_callable() {
    let data = make_uptrend(50, 10.0, 0.5);

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0);
        assert!(
            result.is_ok(),
            "策略 '{}' 应能被回测引擎正确调度，错误: {:?}",
            strategy_id,
            result.err()
        );
    }
}

/// 回测引擎对所有策略都满足基本约束
#[test]
fn test_all_strategies_satisfy_constraints() {
    let data = make_v_reversal(50, 10.0, 25.0);
    let initial_capital = 100000.0;

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, initial_capital)
            .unwrap_or_else(|e| panic!("{} 失败: {}", strategy_id, e));

        // 收益曲线长度 = 数据长度
        assert_eq!(
            result.equity_curve.len(),
            data.len(),
            "{}: 收益曲线长度不匹配",
            strategy_id
        );

        // 首点 = 初始资金
        assert!(
            (result.equity_curve[0].value - initial_capital).abs() < 0.01,
            "{}: 收益曲线首点({})应等于初始资金({})",
            strategy_id,
            result.equity_curve[0].value,
            initial_capital
        );

        // 回撤范围
        assert!(
            result.max_drawdown >= -100.0 && result.max_drawdown <= 0.0,
            "{}: 最大回撤({})超出范围",
            strategy_id,
            result.max_drawdown
        );

        // 胜率范围
        assert!(
            result.win_rate >= 0.0 && result.win_rate <= 100.0,
            "{}: 胜率({})超出范围",
            strategy_id,
            result.win_rate
        );

        // trade_count 一致性
        assert_eq!(
            result.trade_count,
            result.trades.len(),
            "{}: trade_count 不匹配",
            strategy_id
        );
    }
}
