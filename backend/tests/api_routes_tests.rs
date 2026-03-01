//! HTTP API 路由集成测试
//!
//! 基于 API 契约文档 (`docs/api-contract.md`) 编写的 TDD 测试用例。
//! 通过 HTTP 请求测试完整的 API 端点行为。
//! 当前状态：编译通过，运行失败（等待实现）。

use axum::http::StatusCode;
use axum_test::TestServer;
use quant_backend::routes::create_router;
use quant_backend::types::*;
use serde_json::Value;

/// 创建测试服务器
fn test_server() -> TestServer {
    let app = create_router();
    TestServer::new(app).expect("创建测试服务器失败")
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/stocks/search?q={keyword}
// ═══════════════════════════════════════════════════════════════════════════════

/// 按关键字搜索股票，返回 200 + Vec<StockInfo>
#[tokio::test]
async fn test_search_stocks_api_success() {
    let server = test_server();
    let resp = server.get("/api/stocks/search").add_query_param("q", "平安").await;

    resp.assert_status_ok();
    let stocks: Vec<StockInfo> = resp.json();
    assert!(!stocks.is_empty(), "搜索'平安'应返回结果");
    assert!(
        stocks.iter().any(|s| s.name.contains("平安")),
        "结果应包含'平安'相关股票"
    );
}

/// 空 q 参数返回空数组
#[tokio::test]
async fn test_search_stocks_api_empty_query() {
    let server = test_server();
    let resp = server.get("/api/stocks/search").add_query_param("q", "").await;

    resp.assert_status_ok();
    let stocks: Vec<StockInfo> = resp.json();
    assert!(stocks.is_empty(), "空关键字应返回空数组");
}

/// 无匹配结果返回空数组
#[tokio::test]
async fn test_search_stocks_api_no_match() {
    let server = test_server();
    let resp = server
        .get("/api/stocks/search")
        .add_query_param("q", "ZZZZZZZZZ不存在")
        .await;

    resp.assert_status_ok();
    let stocks: Vec<StockInfo> = resp.json();
    assert!(stocks.is_empty(), "无匹配应返回空数组");
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/stocks/{symbol}/daily?start={start}&end={end}
// ═══════════════════════════════════════════════════════════════════════════════

/// 正常获取日 K 线数据
#[tokio::test]
async fn test_get_daily_api_success() {
    let server = test_server();
    let resp = server
        .get("/api/stocks/000001/daily")
        .add_query_param("start", "2024-01-02")
        .add_query_param("end", "2024-01-31")
        .await;

    resp.assert_status_ok();
    let data: Vec<OHLCV> = resp.json();
    assert!(!data.is_empty(), "应返回日 K 线数据");

    // 验证数据按日期升序
    for i in 1..data.len() {
        assert!(
            data[i].date > data[i - 1].date,
            "数据应按日期升序排列"
        );
    }
}

/// 日期参数错误：start > end 返回 400
#[tokio::test]
async fn test_get_daily_api_invalid_date_range() {
    let server = test_server();
    let resp = server
        .get("/api/stocks/000001/daily")
        .add_query_param("start", "2024-06-30")
        .add_query_param("end", "2024-01-01")
        .await;

    resp.assert_status(StatusCode::BAD_REQUEST);
    let error: ApiError = resp.json();
    assert_eq!(error.code, "INVALID_PARAM");
}

/// OHLCV JSON 字段名符合契约（camelCase 不需要，OHLCV 字段都是小写单词）
#[tokio::test]
async fn test_get_daily_api_json_fields() {
    let server = test_server();
    let resp = server
        .get("/api/stocks/000001/daily")
        .add_query_param("start", "2024-06-03")
        .add_query_param("end", "2024-06-07")
        .await;

    resp.assert_status_ok();
    let json: Value = resp.json();
    let arr = json.as_array().expect("响应应为数组");
    assert!(!arr.is_empty());

    let first = &arr[0];
    // 契约中的字段名
    assert!(first.get("date").is_some(), "应包含 date 字段");
    assert!(first.get("open").is_some(), "应包含 open 字段");
    assert!(first.get("high").is_some(), "应包含 high 字段");
    assert!(first.get("low").is_some(), "应包含 low 字段");
    assert!(first.get("close").is_some(), "应包含 close 字段");
    assert!(first.get("volume").is_some(), "应包含 volume 字段");
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/index/snapshot
// ═══════════════════════════════════════════════════════════════════════════════

/// 获取三大指数快照
#[tokio::test]
async fn test_index_snapshot_api_success() {
    let server = test_server();
    let resp = server.get("/api/index/snapshot").await;

    resp.assert_status_ok();
    let snapshots: Vec<IndexSnapshot> = resp.json();
    assert_eq!(snapshots.len(), 3, "应返回 3 条指数记录");
}

/// 验证指数快照 JSON 字段名符合契约
#[tokio::test]
async fn test_index_snapshot_api_json_fields() {
    let server = test_server();
    let resp = server.get("/api/index/snapshot").await;

    resp.assert_status_ok();
    let json: Value = resp.json();
    let arr = json.as_array().expect("响应应为数组");
    assert!(!arr.is_empty());

    let first = &arr[0];
    assert!(first.get("symbol").is_some(), "应包含 symbol 字段");
    assert!(first.get("name").is_some(), "应包含 name 字段");
    assert!(first.get("points").is_some(), "应包含 points 字段");
    assert!(first.get("change").is_some(), "应包含 change 字段");
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/backtest
// ═══════════════════════════════════════════════════════════════════════════════

/// 正常运行回测
#[tokio::test]
async fn test_backtest_api_success() {
    let server = test_server();
    let params = BacktestParams {
        strategy_id: "dual-ma".to_string(),
        symbol: "000001".to_string(),
        start_date: "2023-01-01".to_string(),
        end_date: "2024-06-30".to_string(),
        initial_capital: 100000.0,
    };

    let resp = server.post("/api/backtest").json(&params).await;

    resp.assert_status_ok();
    let result: BacktestResult = resp.json();

    // 契约约束
    assert!(
        result.win_rate >= 0.0 && result.win_rate <= 100.0,
        "胜率({})应在 [0, 100] 之间",
        result.win_rate
    );
    assert!(
        result.max_drawdown >= -100.0 && result.max_drawdown <= 0.0,
        "最大回撤({})应在 [-100, 0] 之间",
        result.max_drawdown
    );
    assert!(
        !result.equity_curve.is_empty(),
        "收益曲线不应为空"
    );
    // 收益曲线第一个点 = 初始资金
    assert!(
        (result.equity_curve[0].value - 100000.0).abs() < 0.01,
        "收益曲线首点({})应等于初始资金(100000)",
        result.equity_curve[0].value
    );
}

/// 回测结果 JSON 字段名符合契约（camelCase）
#[tokio::test]
async fn test_backtest_api_json_fields() {
    let server = test_server();
    let params = BacktestParams {
        strategy_id: "dual-ma".to_string(),
        symbol: "000001".to_string(),
        start_date: "2024-01-01".to_string(),
        end_date: "2024-06-30".to_string(),
        initial_capital: 100000.0,
    };

    let resp = server.post("/api/backtest").json(&params).await;
    resp.assert_status_ok();

    let json: Value = resp.json();
    // 验证 camelCase 字段名（契约要求）
    assert!(json.get("totalReturn").is_some(), "应包含 totalReturn 字段");
    assert!(json.get("maxDrawdown").is_some(), "应包含 maxDrawdown 字段");
    assert!(json.get("sharpeRatio").is_some(), "应包含 sharpeRatio 字段");
    assert!(json.get("winRate").is_some(), "应包含 winRate 字段");
    assert!(json.get("tradeCount").is_some(), "应包含 tradeCount 字段");
    assert!(json.get("trades").is_some(), "应包含 trades 字段");
    assert!(json.get("equityCurve").is_some(), "应包含 equityCurve 字段");
}

/// 回测交易记录中 Trade.type 字段名映射正确（非 trade_type）
#[tokio::test]
async fn test_backtest_trade_type_json_field() {
    let server = test_server();
    let params = BacktestParams {
        strategy_id: "dual-ma".to_string(),
        symbol: "000001".to_string(),
        start_date: "2023-01-01".to_string(),
        end_date: "2024-06-30".to_string(),
        initial_capital: 100000.0,
    };

    let resp = server.post("/api/backtest").json(&params).await;
    resp.assert_status_ok();

    let json: Value = resp.json();
    let trades = json.get("trades").and_then(|t| t.as_array());

    if let Some(trades) = trades {
        if !trades.is_empty() {
            let first = &trades[0];
            // 契约要求 JSON 字段名为 "type"（不是 "trade_type"）
            assert!(
                first.get("type").is_some(),
                "Trade JSON 字段应为 'type'，不是 'trade_type'"
            );
            let trade_type = first.get("type").unwrap().as_str().unwrap();
            assert!(
                trade_type == "buy" || trade_type == "sell",
                "type 应为 'buy' 或 'sell'，实际: '{}'",
                trade_type
            );
        }
    }
}

/// 不存在的策略 ID 返回 400
#[tokio::test]
async fn test_backtest_api_invalid_strategy() {
    let server = test_server();
    let params = serde_json::json!({
        "strategyId": "nonexistent-strategy",
        "symbol": "000001",
        "startDate": "2024-01-01",
        "endDate": "2024-06-30",
        "initialCapital": 100000
    });

    let resp = server.post("/api/backtest").json(&params).await;

    resp.assert_status(StatusCode::BAD_REQUEST);
    let error: ApiError = resp.json();
    assert_eq!(error.code, "STRATEGY_NOT_FOUND");
}

/// startDate >= endDate 返回 400
#[tokio::test]
async fn test_backtest_api_invalid_date_range() {
    let server = test_server();
    let params = serde_json::json!({
        "strategyId": "dual-ma",
        "symbol": "000001",
        "startDate": "2024-06-30",
        "endDate": "2024-01-01",
        "initialCapital": 100000
    });

    let resp = server.post("/api/backtest").json(&params).await;

    resp.assert_status(StatusCode::BAD_REQUEST);
    let error: ApiError = resp.json();
    assert_eq!(error.code, "INVALID_PARAM");
}

/// initialCapital <= 0 返回 400
#[tokio::test]
async fn test_backtest_api_invalid_capital() {
    let server = test_server();
    let params = serde_json::json!({
        "strategyId": "dual-ma",
        "symbol": "000001",
        "startDate": "2024-01-01",
        "endDate": "2024-06-30",
        "initialCapital": -100
    });

    let resp = server.post("/api/backtest").json(&params).await;

    resp.assert_status(StatusCode::BAD_REQUEST);
    let error: ApiError = resp.json();
    assert_eq!(error.code, "INVALID_PARAM");
}

/// 不同股票 / 不同时间段的回测返回不同结果（防硬编码）
#[tokio::test]
async fn test_backtest_api_different_inputs_different_results() {
    let server = test_server();

    let params1 = BacktestParams {
        strategy_id: "dual-ma".to_string(),
        symbol: "000001".to_string(),
        start_date: "2023-01-01".to_string(),
        end_date: "2023-12-31".to_string(),
        initial_capital: 100000.0,
    };

    let params2 = BacktestParams {
        strategy_id: "dual-ma".to_string(),
        symbol: "600519".to_string(),
        start_date: "2023-01-01".to_string(),
        end_date: "2023-12-31".to_string(),
        initial_capital: 100000.0,
    };

    let resp1 = server.post("/api/backtest").json(&params1).await;
    let resp2 = server.post("/api/backtest").json(&params2).await;

    resp1.assert_status_ok();
    resp2.assert_status_ok();

    let result1: BacktestResult = resp1.json();
    let result2: BacktestResult = resp2.json();

    // 不同股票的回测结果不应完全相同
    let different = result1.total_return != result2.total_return
        || result1.max_drawdown != result2.max_drawdown
        || result1.trade_count != result2.trade_count;

    assert!(
        different,
        "不同股票的回测结果不应完全相同，疑似硬编码"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/strategies
// ═══════════════════════════════════════════════════════════════════════════════

/// 获取策略列表，应包含 4 个内置策略
#[tokio::test]
async fn test_strategies_api_success() {
    let server = test_server();
    let resp = server.get("/api/strategies").await;

    resp.assert_status_ok();
    let strategies: Vec<StrategyInfo> = resp.json();

    assert_eq!(
        strategies.len(),
        4,
        "应返回 4 个内置策略（dual-ma, rsi, bollinger, macd）"
    );

    let ids: Vec<&str> = strategies.iter().map(|s| s.id.as_str()).collect();
    assert!(ids.contains(&"dual-ma"), "应包含 dual-ma 策略");
    assert!(ids.contains(&"rsi"), "应包含 rsi 策略");
    assert!(ids.contains(&"bollinger"), "应包含 bollinger 策略");
    assert!(ids.contains(&"macd"), "应包含 macd 策略");
}

/// 策略信息结构完整性
#[tokio::test]
async fn test_strategies_api_structure() {
    let server = test_server();
    let resp = server.get("/api/strategies").await;

    resp.assert_status_ok();
    let strategies: Vec<StrategyInfo> = resp.json();

    for strategy in &strategies {
        assert!(!strategy.id.is_empty(), "id 不应为空");
        assert!(!strategy.name.is_empty(), "name 不应为空");
        assert!(!strategy.description.is_empty(), "description 不应为空");
        assert!(!strategy.params.is_empty(), "params 不应为空");
    }
}

/// 验证具体策略的参数符合契约
#[tokio::test]
async fn test_strategies_api_params_match_contract() {
    let server = test_server();
    let resp = server.get("/api/strategies").await;

    resp.assert_status_ok();
    let strategies: Vec<StrategyInfo> = resp.json();

    // dual-ma 应有 shortPeriod 和 longPeriod
    let dual_ma = strategies.iter().find(|s| s.id == "dual-ma").expect("缺少 dual-ma");
    assert!(
        dual_ma.params.contains_key("shortPeriod"),
        "dual-ma 应有 shortPeriod 参数"
    );
    assert!(
        dual_ma.params.contains_key("longPeriod"),
        "dual-ma 应有 longPeriod 参数"
    );

    // rsi 应有 period, overbought, oversold
    let rsi = strategies.iter().find(|s| s.id == "rsi").expect("缺少 rsi");
    assert!(rsi.params.contains_key("period"), "rsi 应有 period 参数");
    assert!(rsi.params.contains_key("overbought"), "rsi 应有 overbought 参数");
    assert!(rsi.params.contains_key("oversold"), "rsi 应有 oversold 参数");

    // bollinger 应有 period, stdDev
    let bollinger = strategies.iter().find(|s| s.id == "bollinger").expect("缺少 bollinger");
    assert!(bollinger.params.contains_key("period"), "bollinger 应有 period 参数");
    assert!(bollinger.params.contains_key("stdDev"), "bollinger 应有 stdDev 参数");

    // macd 应有 fast, slow, signal
    let macd = strategies.iter().find(|s| s.id == "macd").expect("缺少 macd");
    assert!(macd.params.contains_key("fast"), "macd 应有 fast 参数");
    assert!(macd.params.contains_key("slow"), "macd 应有 slow 参数");
    assert!(macd.params.contains_key("signal"), "macd 应有 signal 参数");
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/strategies/learn
// ═══════════════════════════════════════════════════════════════════════════════

/// 获取策略学习内容
#[tokio::test]
async fn test_strategy_learn_api_success() {
    let server = test_server();
    let resp = server.get("/api/strategies/learn").await;

    resp.assert_status_ok();
    let details: Vec<StrategyLearnDetail> = resp.json();

    assert!(
        !details.is_empty(),
        "策略学习列表不应为空"
    );
}

/// 策略学习内容 JSON 字段名符合契约（camelCase）
#[tokio::test]
async fn test_strategy_learn_api_json_fields() {
    let server = test_server();
    let resp = server.get("/api/strategies/learn").await;

    resp.assert_status_ok();
    let json: Value = resp.json();
    let arr = json.as_array().expect("响应应为数组");
    assert!(!arr.is_empty());

    let first = &arr[0];
    assert!(first.get("id").is_some(), "应包含 id 字段");
    assert!(first.get("name").is_some(), "应包含 name 字段");
    assert!(first.get("shortDesc").is_some(), "应包含 shortDesc 字段（camelCase）");
    assert!(first.get("level").is_some(), "应包含 level 字段");
    assert!(first.get("status").is_some(), "应包含 status 字段");
    assert!(first.get("explanation").is_some(), "应包含 explanation 字段");
    assert!(first.get("formulas").is_some(), "应包含 formulas 字段");
}

/// 学习详情结构完整性
#[tokio::test]
async fn test_strategy_learn_api_structure() {
    let server = test_server();
    let resp = server.get("/api/strategies/learn").await;

    resp.assert_status_ok();
    let details: Vec<StrategyLearnDetail> = resp.json();

    for detail in &details {
        assert!(!detail.id.is_empty(), "id 不应为空");
        assert!(!detail.name.is_empty(), "name 不应为空");
        assert!(!detail.short_desc.is_empty(), "short_desc 不应为空");
        assert!(
            ["入门级", "进阶级", "高级"].contains(&detail.level.as_str()),
            "level '{}' 不在允许范围内",
            detail.level
        );
        assert!(
            ["已学", "学习中", "未学"].contains(&detail.status.as_str()),
            "status '{}' 不在允许范围内",
            detail.status
        );
        assert!(!detail.explanation.is_empty(), "explanation 不应为空");
        assert!(!detail.formulas.is_empty(), "formulas 不应为空");

        for formula in &detail.formulas {
            assert!(!formula.label.is_empty(), "formula.label 不应为空");
            assert!(!formula.code.is_empty(), "formula.code 不应为空");
            assert!(
                formula.color.starts_with('#'),
                "formula.color '{}' 应为十六进制颜色值",
                formula.color
            );
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 错误响应格式测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 错误响应应包含 error 和 code 字段
#[tokio::test]
async fn test_error_response_format() {
    let server = test_server();

    // 用无效日期范围触发 400 错误
    let resp = server
        .get("/api/stocks/000001/daily")
        .add_query_param("start", "2024-12-31")
        .add_query_param("end", "2024-01-01")
        .await;

    resp.assert_status(StatusCode::BAD_REQUEST);
    let json: Value = resp.json();
    assert!(json.get("error").is_some(), "错误响应应包含 error 字段");
    assert!(json.get("code").is_some(), "错误响应应包含 code 字段");
}
