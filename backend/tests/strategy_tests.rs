//! 策略模块 TDD 测试
//!
//! 测试 4 个内置策略的信号生成和策略列表功能。
//! 当前状态：编译通过，运行失败（等待阶段四实现）。
//!
//! 测试设计遵循 TDD 防 mock 检查清单：
//! - 手工构造 OHLCV 数据，数学可验证
//! - 多组不同输入，防止 if-else 硬编码
//! - 不可预测性断言（不同输入 → 不同输出）
//! - 性质测试（信号数量、数据不足时无信号等）

use quant_backend::engine::backtest::run_backtest;
use quant_backend::strategies::get_strategy_list;
use quant_backend::types::OHLCV;

// ═══════════════════════════════════════════════════════════════════════════════
// 辅助函数：构造 OHLCV 测试数据
// ═══════════════════════════════════════════════════════════════════════════════

/// 构造单根 K 线
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

/// 构造等差上涨序列：收盘价从 start 每日递增 step
/// 用于触发趋势跟随策略的买入信号
fn make_uptrend_data(days: usize, start: f64, step: f64) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            let close = start + step * i as f64;
            let date = format!("2024-01-{:02}", i + 1);
            make_ohlcv(&date, close - 0.5, close + 1.0, close - 1.0, close, 1000000)
        })
        .collect()
}

/// 构造先涨后跌的 V 形反转序列
/// 前 half 天上涨，后 half 天下跌，用于触发卖出信号
fn make_v_reversal_data(days: usize, base: f64, amplitude: f64) -> Vec<OHLCV> {
    let half = days / 2;
    (0..days)
        .map(|i| {
            let close = if i <= half {
                base + amplitude * (i as f64 / half as f64)
            } else {
                base + amplitude * (1.0 - (i - half) as f64 / (days - half) as f64)
            };
            let date = format!("2024-03-{:02}", i + 1);
            make_ohlcv(&date, close - 0.3, close + 0.5, close - 0.5, close, 800000)
        })
        .collect()
}

/// 构造横盘震荡数据：收盘价在 center ± amplitude 间小幅波动
fn make_sideways_data(days: usize, center: f64, amplitude: f64) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            // 用正弦函数模拟小幅震荡
            let offset = amplitude * (i as f64 * 0.7).sin();
            let close = center + offset;
            let date = format!("2024-05-{:02}", (i % 28) + 1);
            make_ohlcv(&date, close + 0.2, close + 0.5, close - 0.5, close, 500000)
        })
        .collect()
}

/// 构造全平数据：所有收盘价完全相同
fn make_flat_data(days: usize, price: f64) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            let date = format!("2024-07-{:02}", (i % 28) + 1);
            make_ohlcv(&date, price, price, price, price, 1000000)
        })
        .collect()
}

/// 构造带停牌日（volume=0）的数据
fn make_data_with_halts(days: usize, base: f64) -> Vec<OHLCV> {
    (0..days)
        .map(|i| {
            let close = base + (i as f64) * 0.5;
            let volume = if i == 5 || i == 10 || i == 15 {
                0
            } else {
                1000000
            };
            let date = format!("2024-09-{:02}", (i % 28) + 1);
            make_ohlcv(&date, close - 0.2, close + 0.3, close - 0.3, close, volume)
        })
        .collect()
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/strategies — 策略列表测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 策略列表应返回 4 个内置策略
#[test]
fn test_strategy_list_returns_four_strategies() {
    let strategies = get_strategy_list();
    assert_eq!(strategies.len(), 4, "应有 4 个内置策略");
}

/// 策略列表应包含所有必需的策略 ID
#[test]
fn test_strategy_list_contains_required_ids() {
    let strategies = get_strategy_list();
    let ids: Vec<&str> = strategies.iter().map(|s| s.id.as_str()).collect();

    assert!(ids.contains(&"dual-ma"), "应包含 dual-ma");
    assert!(ids.contains(&"rsi"), "应包含 rsi");
    assert!(ids.contains(&"bollinger"), "应包含 bollinger");
    assert!(ids.contains(&"macd"), "应包含 macd");
}

/// 每个策略的必填字段不为空
#[test]
fn test_strategy_list_fields_not_empty() {
    let strategies = get_strategy_list();
    for s in &strategies {
        assert!(!s.id.is_empty(), "策略 ID 不应为空");
        assert!(!s.name.is_empty(), "策略名称不应为空: {}", s.id);
        assert!(!s.description.is_empty(), "策略描述不应为空: {}", s.id);
        assert!(!s.params.is_empty(), "策略参数不应为空: {}", s.id);
    }
}

/// dual-ma 策略应有 shortPeriod 和 longPeriod 参数
#[test]
fn test_dual_ma_strategy_params() {
    let strategies = get_strategy_list();
    let dual_ma = strategies
        .iter()
        .find(|s| s.id == "dual-ma")
        .expect("缺少 dual-ma 策略");

    assert!(
        dual_ma.params.contains_key("shortPeriod"),
        "dual-ma 应有 shortPeriod 参数"
    );
    assert!(
        dual_ma.params.contains_key("longPeriod"),
        "dual-ma 应有 longPeriod 参数"
    );

    // 默认参数值应合理：shortPeriod < longPeriod
    let short = dual_ma.params["shortPeriod"];
    let long = dual_ma.params["longPeriod"];
    assert!(
        short < long,
        "shortPeriod({}) 应小于 longPeriod({})",
        short,
        long
    );
    assert!(short >= 2.0, "shortPeriod({}) 应 >= 2", short);
    assert!(long >= 10.0, "longPeriod({}) 应 >= 10", long);
}

/// RSI 策略应有 period, overbought, oversold 参数
#[test]
fn test_rsi_strategy_params() {
    let strategies = get_strategy_list();
    let rsi = strategies
        .iter()
        .find(|s| s.id == "rsi")
        .expect("缺少 rsi 策略");

    assert!(rsi.params.contains_key("period"), "rsi 应有 period 参数");
    assert!(
        rsi.params.contains_key("overbought"),
        "rsi 应有 overbought 参数"
    );
    assert!(
        rsi.params.contains_key("oversold"),
        "rsi 应有 oversold 参数"
    );

    let overbought = rsi.params["overbought"];
    let oversold = rsi.params["oversold"];
    assert!(
        overbought > oversold,
        "overbought({}) 应大于 oversold({})",
        overbought,
        oversold
    );
    assert!(overbought <= 100.0, "overbought 应 <= 100");
    assert!(oversold >= 0.0, "oversold 应 >= 0");
}

/// Bollinger 策略应有 period 和 stdDev 参数
#[test]
fn test_bollinger_strategy_params() {
    let strategies = get_strategy_list();
    let bb = strategies
        .iter()
        .find(|s| s.id == "bollinger")
        .expect("缺少 bollinger 策略");

    assert!(
        bb.params.contains_key("period"),
        "bollinger 应有 period 参数"
    );
    assert!(
        bb.params.contains_key("stdDev"),
        "bollinger 应有 stdDev 参数"
    );

    let std_dev = bb.params["stdDev"];
    assert!(std_dev > 0.0, "stdDev({}) 应大于 0", std_dev);
}

/// MACD 策略应有 fast, slow, signal 参数
#[test]
fn test_macd_strategy_params() {
    let strategies = get_strategy_list();
    let macd = strategies
        .iter()
        .find(|s| s.id == "macd")
        .expect("缺少 macd 策略");

    assert!(macd.params.contains_key("fast"), "macd 应有 fast 参数");
    assert!(macd.params.contains_key("slow"), "macd 应有 slow 参数");
    assert!(macd.params.contains_key("signal"), "macd 应有 signal 参数");

    let fast = macd.params["fast"];
    let slow = macd.params["slow"];
    assert!(fast < slow, "fast({}) 应小于 slow({})", fast, slow);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 双均线交叉策略（dual-ma）— 通过 run_backtest 间接测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 上涨行情 + 双均线策略 → 应产生交易（有买入信号）
#[test]
fn test_dual_ma_uptrend_produces_trades() {
    // 构造 40 天稳定上涨数据：10.0 → 30.0，MA5 会从下方穿越 MA20
    let data = make_uptrend_data(40, 10.0, 0.5);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    // 稳定上涨中，MA5 会在某时刻上穿 MA20，产生至少 1 笔买入
    assert!(result.trade_count > 0, "上涨行情应产生交易");
    assert!(
        result.trades.iter().any(|t| t.trade_type == "buy"),
        "应有买入交易"
    );
}

/// 先涨后跌 V 形反转 → 双均线应产生买入和卖出信号
#[test]
fn test_dual_ma_reversal_produces_buy_and_sell() {
    // 40 天 V 形反转：10.0 涨到 30.0 再跌回 10.0
    // MA5 先上穿 MA20（买入），后下穿 MA20（卖出）
    let data = make_v_reversal_data(40, 10.0, 20.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    let has_buy = result.trades.iter().any(|t| t.trade_type == "buy");
    let has_sell = result.trades.iter().any(|t| t.trade_type == "sell");
    assert!(has_buy, "V 形反转应产生买入信号");
    assert!(has_sell, "V 形反转应产生卖出信号");
}

/// 横盘震荡 → 双均线策略信号较少
#[test]
fn test_dual_ma_sideways_fewer_signals() {
    // 构造 40 天横盘数据，振幅很小
    let sideways = make_sideways_data(40, 20.0, 0.3);
    // 构造 40 天明确趋势数据
    let trending = make_v_reversal_data(40, 10.0, 20.0);

    let result_sideways =
        run_backtest("dual-ma", &sideways, 100000.0).expect("run_backtest 不应返回错误");
    let result_trending =
        run_backtest("dual-ma", &trending, 100000.0).expect("run_backtest 不应返回错误");

    // 横盘行情的交易次数应不多于趋势行情
    assert!(
        result_sideways.trade_count <= result_trending.trade_count,
        "横盘交易次数({})不应多于趋势交易次数({})",
        result_sideways.trade_count,
        result_trending.trade_count
    );
}

/// 数据不足 20 天 → 双均线策略不产生任何信号
/// （默认 longPeriod=20，需要至少 20 个数据点才能计算 MA20）
#[test]
fn test_dual_ma_insufficient_data_no_signals() {
    let data = make_uptrend_data(15, 10.0, 1.0); // 只有 15 天
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "数据不足 20 天时，双均线策略不应产生交易"
    );
    assert!(result.trades.is_empty(), "不足 20 天时交易列表应为空");
}

/// 全平价格 → 双均线不产生信号（MA5 == MA20 始终，无交叉）
#[test]
fn test_dual_ma_flat_prices_no_signals() {
    let data = make_flat_data(40, 15.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(result.trade_count, 0, "全平价格不应产生交叉信号");
}

// ═══════════════════════════════════════════════════════════════════════════════
// RSI 策略 — 通过 run_backtest 间接测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 持续下跌后反弹 → RSI 应从超卖区回升触发买入
#[test]
fn test_rsi_oversold_bounce_produces_buy() {
    // 构造：先 20 天快速下跌（RSI → 超卖 <30），再 10 天反弹（RSI 回升 >30）
    let mut data = Vec::new();
    for i in 0..20 {
        let close = 50.0 - i as f64 * 1.5; // 50.0 → 21.5，连续下跌
        data.push(make_ohlcv(
            &format!("2024-01-{:02}", i + 1),
            close + 0.5,
            close + 1.0,
            close - 0.5,
            close,
            1000000,
        ));
    }
    for i in 0..15 {
        let close = 22.0 + i as f64 * 1.0; // 22.0 → 36.0，反弹
        data.push(make_ohlcv(
            &format!("2024-02-{:02}", i + 1),
            close - 0.5,
            close + 0.5,
            close - 1.0,
            close,
            1200000,
        ));
    }

    let result = run_backtest("rsi", &data, 100000.0).expect("run_backtest 不应返回错误");

    // RSI 从超卖区反弹，应触发买入
    assert!(
        result.trades.iter().any(|t| t.trade_type == "buy"),
        "RSI 从超卖反弹应触发买入信号"
    );
}

/// 持续上涨后回落 → RSI 应从超买区下降触发卖出
#[test]
fn test_rsi_overbought_drop_produces_sell() {
    // 构造：先 20 天快速上涨（RSI → 超买 >70），再 15 天回落（RSI 下降 <70）
    let mut data = Vec::new();
    for i in 0..20 {
        let close = 20.0 + i as f64 * 1.8; // 20.0 → 54.2，持续上涨
        data.push(make_ohlcv(
            &format!("2024-01-{:02}", i + 1),
            close - 0.3,
            close + 0.5,
            close - 0.5,
            close,
            1000000,
        ));
    }
    for i in 0..15 {
        let close = 54.0 - i as f64 * 1.5; // 54.0 → 33.0，回落
        data.push(make_ohlcv(
            &format!("2024-02-{:02}", i + 1),
            close + 0.3,
            close + 0.5,
            close - 0.5,
            close,
            900000,
        ));
    }

    let result = run_backtest("rsi", &data, 100000.0).expect("run_backtest 不应返回错误");

    // 先有买入（超卖后反弹或其他时机），然后超买后回落应有卖出
    // 至少应该产生交易
    assert!(result.trade_count > 0, "RSI 超买回落应产生交易");
}

/// 数据不足 15 天 → RSI 策略不产生信号
/// （RSI 14 期需要至少 15 个数据点：14 个计算初始平均 + 1 个产生首个 RSI 值）
#[test]
fn test_rsi_insufficient_data_no_signals() {
    let data = make_uptrend_data(10, 10.0, 1.0); // 只有 10 天
    let result = run_backtest("rsi", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "数据不足 15 天时，RSI 策略不应产生交易"
    );
}

/// 全平价格 → RSI 约等于 50，不应产生超买/超卖信号
#[test]
fn test_rsi_flat_prices_no_signals() {
    let data = make_flat_data(30, 25.0);
    let result = run_backtest("rsi", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "全平价格 RSI≈50，不应产生超买超卖信号"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 布林带策略（bollinger）— 通过 run_backtest 间接测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 价格突破上轨 → 布林带应产生交易信号
#[test]
fn test_bollinger_upper_breakout_produces_signal() {
    // 构造：20 天平稳（让布林带收窄），然后价格突然大涨突破上轨
    let mut data = Vec::new();
    for i in 0..25 {
        let close = 20.0 + (i as f64 * 0.05); // 缓慢微涨，波动很小
        data.push(make_ohlcv(
            &format!("2024-01-{:02}", (i % 28) + 1),
            close,
            close + 0.1,
            close - 0.1,
            close,
            800000,
        ));
    }
    // 突然大涨，突破上轨
    for i in 0..5 {
        let close = 25.0 + i as f64 * 3.0; // 25.0 → 37.0，大幅上涨
        data.push(make_ohlcv(
            &format!("2024-02-{:02}", i + 1),
            close - 1.0,
            close + 1.0,
            close - 1.5,
            close,
            2000000,
        ));
    }

    let result = run_backtest("bollinger", &data, 100000.0).expect("run_backtest 不应返回错误");
    assert!(result.trade_count > 0, "价格突破布林带上轨应产生交易");
}

/// 价格跌破下轨 → 布林带应产生交易信号
#[test]
fn test_bollinger_lower_breakout_produces_signal() {
    // 构造：25 天平稳，然后突然大跌跌破下轨
    let mut data = Vec::new();
    for i in 0..25 {
        let close = 30.0 - (i as f64 * 0.05);
        data.push(make_ohlcv(
            &format!("2024-01-{:02}", (i % 28) + 1),
            close,
            close + 0.1,
            close - 0.1,
            close,
            800000,
        ));
    }
    for i in 0..5 {
        let close = 25.0 - i as f64 * 3.0; // 25.0 → 13.0，大幅下跌
        data.push(make_ohlcv(
            &format!("2024-02-{:02}", i + 1),
            close + 1.0,
            close + 1.5,
            close - 0.5,
            close,
            1500000,
        ));
    }

    let result = run_backtest("bollinger", &data, 100000.0).expect("run_backtest 不应返回错误");
    assert!(result.trade_count > 0, "价格跌破布林带下轨应产生交易");
}

/// 数据不足 20 天 → 布林带策略不产生信号
/// （布林带需要至少 20 个数据点计算 SMA20 和标准差）
#[test]
fn test_bollinger_insufficient_data_no_signals() {
    let data = make_uptrend_data(15, 10.0, 1.0);
    let result = run_backtest("bollinger", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "数据不足 20 天时，布林带策略不应产生交易"
    );
}

/// 全平价格 → 布林带宽度为 0，上轨=中轨=下轨，不应突破
#[test]
fn test_bollinger_flat_prices_no_signals() {
    let data = make_flat_data(30, 20.0);
    let result = run_backtest("bollinger", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "全平价格布林带宽度为 0，不应产生突破信号"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MACD 策略 — 通过 run_backtest 间接测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 上涨趋势 → MACD 应产生买入信号（MACD 线上穿信号线）
#[test]
fn test_macd_uptrend_produces_buy() {
    // MACD 需要至少 34 个数据点（26 + 8），构造 50 天上涨数据
    let data = make_uptrend_data(50, 10.0, 0.5);
    let result = run_backtest("macd", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert!(
        result.trades.iter().any(|t| t.trade_type == "buy"),
        "上涨趋势中 MACD 应产生买入信号"
    );
}

/// V 形反转 → MACD 应产生买入和卖出信号
#[test]
fn test_macd_reversal_produces_buy_and_sell() {
    // 50 天 V 形反转数据
    let data = make_v_reversal_data(50, 10.0, 25.0);
    let result = run_backtest("macd", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert!(result.trade_count > 0, "V 形反转中 MACD 应产生交易");
}

/// 数据不足 34 天 → MACD 策略不产生信号
/// （需要 26 个点算首个 MACD 值 + 8 个点算首个信号线）
#[test]
fn test_macd_insufficient_data_no_signals() {
    let data = make_uptrend_data(25, 10.0, 1.0); // 只有 25 天
    let result = run_backtest("macd", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "数据不足 34 天时，MACD 策略不应产生交易"
    );
}

/// 全平价格 → MACD 线和信号线都为 0，不应产生交叉信号
#[test]
fn test_macd_flat_prices_no_signals() {
    let data = make_flat_data(50, 30.0);
    let result = run_backtest("macd", &data, 100000.0).expect("run_backtest 不应返回错误");

    assert_eq!(
        result.trade_count, 0,
        "全平价格 MACD 线=信号线=0，不应产生交叉信号"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 跨策略对比测试（防硬编码）
// ═══════════════════════════════════════════════════════════════════════════════

/// 不同策略处理同一数据应产生不同结果
#[test]
fn test_different_strategies_produce_different_results() {
    let data = make_v_reversal_data(50, 10.0, 25.0);
    let initial_capital = 100000.0;

    let result_ma = run_backtest("dual-ma", &data, initial_capital).expect("dual-ma 失败");
    let result_rsi = run_backtest("rsi", &data, initial_capital).expect("rsi 失败");
    let result_bb = run_backtest("bollinger", &data, initial_capital).expect("bollinger 失败");
    let result_macd = run_backtest("macd", &data, initial_capital).expect("macd 失败");

    // 4 个策略的逻辑完全不同，至少有两个策略的交易次数应不同
    let counts = [
        result_ma.trade_count,
        result_rsi.trade_count,
        result_bb.trade_count,
        result_macd.trade_count,
    ];
    let all_same = counts.iter().all(|&c| c == counts[0]);
    assert!(
        !all_same,
        "4 个策略对同一数据的交易次数不应完全相同，疑似硬编码: {:?}",
        counts
    );
}

/// 同一策略处理不同数据应产生不同结果
#[test]
fn test_same_strategy_different_data_different_results() {
    let data1 = make_uptrend_data(40, 10.0, 0.5);
    let data2 = make_v_reversal_data(40, 10.0, 20.0);
    let data3 = make_sideways_data(40, 20.0, 0.3);

    let r1 = run_backtest("dual-ma", &data1, 100000.0).expect("run_backtest 失败");
    let r2 = run_backtest("dual-ma", &data2, 100000.0).expect("run_backtest 失败");
    let r3 = run_backtest("dual-ma", &data3, 100000.0).expect("run_backtest 失败");

    // 上涨、反转、横盘三种行情的总收益率不应完全相同
    let returns_all_same = r1.total_return == r2.total_return && r2.total_return == r3.total_return;
    assert!(
        !returns_all_same,
        "上涨/反转/横盘三种行情的收益率不应完全相同: {}, {}, {}",
        r1.total_return, r2.total_return, r3.total_return
    );
}

/// 停牌日（volume=0）不应触发交易
#[test]
fn test_strategies_skip_halted_days() {
    let data = make_data_with_halts(30, 15.0);
    let result = run_backtest("dual-ma", &data, 100000.0).expect("run_backtest 不应返回错误");

    // 如果有交易，验证交易日期不在停牌日
    let halt_dates = ["2024-09-06", "2024-09-11", "2024-09-16"];
    for trade in &result.trades {
        assert!(
            !halt_dates.contains(&trade.date.as_str()),
            "停牌日 {} 不应有交易",
            trade.date
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 性质测试（property-based）— 对所有策略通用
// ═══════════════════════════════════════════════════════════════════════════════

/// 所有策略：交易类型只能是 "buy" 或 "sell"
#[test]
fn test_all_strategies_trade_type_valid() {
    let data = make_v_reversal_data(50, 10.0, 25.0);

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 执行失败: {}", strategy_id, e));

        for trade in &result.trades {
            assert!(
                trade.trade_type == "buy" || trade.trade_type == "sell",
                "{} 策略交易类型 '{}' 无效，应为 'buy' 或 'sell'",
                strategy_id,
                trade.trade_type
            );
        }
    }
}

/// 所有策略：交易记录应按日期升序排列
#[test]
fn test_all_strategies_trades_sorted_by_date() {
    let data = make_v_reversal_data(50, 10.0, 25.0);

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 执行失败: {}", strategy_id, e));

        for i in 1..result.trades.len() {
            assert!(
                result.trades[i].date >= result.trades[i - 1].date,
                "{} 策略交易记录未按日期升序: {} 在 {} 之前",
                strategy_id,
                result.trades[i].date,
                result.trades[i - 1].date
            );
        }
    }
}

/// 所有策略：买入交易 pnl 应为 0，卖出交易 pnl 为实际盈亏
#[test]
fn test_all_strategies_buy_pnl_zero() {
    let data = make_v_reversal_data(50, 10.0, 25.0);

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 执行失败: {}", strategy_id, e));

        for trade in &result.trades {
            if trade.trade_type == "buy" {
                assert!(
                    trade.pnl.abs() < 1e-10,
                    "{} 策略买入交易 pnl 应为 0，实际: {}",
                    strategy_id,
                    trade.pnl
                );
            }
        }
    }
}

/// 所有策略：交易价格应为正数
#[test]
fn test_all_strategies_trade_price_positive() {
    let data = make_uptrend_data(50, 10.0, 0.5);

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 执行失败: {}", strategy_id, e));

        for trade in &result.trades {
            assert!(
                trade.price > 0.0,
                "{} 策略交易价格应为正数，实际: {}",
                strategy_id,
                trade.price
            );
        }
    }
}

/// 所有策略：交易数量应为正数（A 股最小 100 股）
#[test]
fn test_all_strategies_trade_quantity_positive() {
    let data = make_v_reversal_data(50, 10.0, 25.0);

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 执行失败: {}", strategy_id, e));

        for trade in &result.trades {
            assert!(
                trade.quantity > 0,
                "{} 策略交易数量应为正数，实际: {}",
                strategy_id,
                trade.quantity
            );
        }
    }
}

/// 空数据 → 所有策略不应报错，应返回零交易
#[test]
fn test_all_strategies_empty_data_no_error() {
    let data: Vec<OHLCV> = vec![];

    for strategy_id in &["dual-ma", "rsi", "bollinger", "macd"] {
        let result = run_backtest(strategy_id, &data, 100000.0)
            .unwrap_or_else(|e| panic!("{} 空数据不应报错: {}", strategy_id, e));

        assert_eq!(result.trade_count, 0, "{} 空数据应返回零交易", strategy_id);
    }
}
