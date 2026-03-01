//! 数据获取模块测试
//!
//! 基于 API 契约文档 (`docs/api-contract.md`) 编写的 TDD 测试用例。
//! 阶段三：验证数据获取模块的正确性。
//! 当前状态：编译通过，运行失败（等待实现）。
//!
//! 测试要求（来自开发计划 3.1）：
//! - 测试1：获取平安银行（000001）日K线，验证数据条数与真实交易日匹配
//! - 测试2：验证 OHLCV 结构完整性（high >= low, volume >= 0, close > 0）
//! - 测试3：返回数据按日期升序排列
//! - 测试4：多组不同股票输入返回不同结果（防止硬编码）
//! - 测试5：日期范围正确过滤

use quant_backend::data::market_data;

// ─── 日 K 线数据获取测试 ─────────────────────────────────────────────────────

/// 测试1：获取平安银行日 K 线，验证能返回数据且条数合理
/// 2024年1月有约 20 个交易日
#[tokio::test]
async fn test_get_stock_daily_returns_data() {
    let data = market_data::get_stock_daily("000001", "2024-01-02", "2024-01-31")
        .await
        .expect("获取平安银行日 K 线失败");

    // 2024年1月大约有 20 个交易日，允许 15-23 的范围
    assert!(
        !data.is_empty(),
        "日 K 线数据不应为空"
    );
    assert!(
        data.len() >= 15 && data.len() <= 23,
        "2024年1月交易日数量应在 15-23 之间，实际: {}",
        data.len()
    );
}

/// 测试2：验证 OHLCV 结构完整性
/// 契约约束：high >= low, high >= open, high >= close,
///           low <= open, low <= close, volume >= 0, close > 0
#[tokio::test]
async fn test_ohlcv_data_integrity() {
    let data = market_data::get_stock_daily("000001", "2024-01-02", "2024-03-31")
        .await
        .expect("获取 K 线数据失败");

    assert!(!data.is_empty(), "数据不应为空");

    for (i, bar) in data.iter().enumerate() {
        // 日期格式 YYYY-MM-DD
        assert!(
            bar.date.len() == 10 && bar.date.chars().nth(4) == Some('-'),
            "第 {} 条数据日期格式不正确: '{}'",
            i, bar.date
        );

        // high >= low
        assert!(
            bar.high >= bar.low,
            "第 {} 条 ({}) high({}) 应 >= low({})",
            i, bar.date, bar.high, bar.low
        );

        // high >= open
        assert!(
            bar.high >= bar.open,
            "第 {} 条 ({}) high({}) 应 >= open({})",
            i, bar.date, bar.high, bar.open
        );

        // high >= close
        assert!(
            bar.high >= bar.close,
            "第 {} 条 ({}) high({}) 应 >= close({})",
            i, bar.date, bar.high, bar.close
        );

        // low <= open
        assert!(
            bar.low <= bar.open,
            "第 {} 条 ({}) low({}) 应 <= open({})",
            i, bar.date, bar.low, bar.open
        );

        // low <= close
        assert!(
            bar.low <= bar.close,
            "第 {} 条 ({}) low({}) 应 <= close({})",
            i, bar.date, bar.low, bar.close
        );

        // close > 0
        assert!(
            bar.close > 0.0,
            "第 {} 条 ({}) close({}) 应 > 0",
            i, bar.date, bar.close
        );

        // 价格合理性（A 股单只股票价格通常在 0.01 ~ 10000 之间）
        assert!(
            bar.open > 0.0 && bar.open < 10000.0,
            "第 {} 条 ({}) open({}) 超出合理范围",
            i, bar.date, bar.open
        );
    }
}

/// 测试3：返回数据按日期升序排列
#[tokio::test]
async fn test_daily_data_sorted_by_date_asc() {
    let data = market_data::get_stock_daily("000001", "2024-01-02", "2024-06-30")
        .await
        .expect("获取日 K 线失败");

    assert!(data.len() >= 2, "数据量不足以验证排序");

    for i in 1..data.len() {
        assert!(
            data[i].date > data[i - 1].date,
            "数据未按日期升序排列: [{}] {} 应晚于 [{}] {}",
            i, data[i].date, i - 1, data[i - 1].date
        );
    }
}

/// 测试4：不同股票返回不同结果（防硬编码）
/// 平安银行 (000001) 和 贵州茅台 (600519) 的价格差异很大
#[tokio::test]
async fn test_different_stocks_return_different_data() {
    let data_pingan = market_data::get_stock_daily("000001", "2024-06-03", "2024-06-28")
        .await
        .expect("获取平安银行数据失败");

    let data_maotai = market_data::get_stock_daily("600519", "2024-06-03", "2024-06-28")
        .await
        .expect("获取贵州茅台数据失败");

    assert!(!data_pingan.is_empty(), "平安银行数据不应为空");
    assert!(!data_maotai.is_empty(), "贵州茅台数据不应为空");

    // 茅台的股价远高于平安银行，用平均收盘价对比
    let avg_pingan: f64 =
        data_pingan.iter().map(|d| d.close).sum::<f64>() / data_pingan.len() as f64;
    let avg_maotai: f64 =
        data_maotai.iter().map(|d| d.close).sum::<f64>() / data_maotai.len() as f64;

    // 茅台均价至少是平安银行的 10 倍以上（茅台 ~1500+，平安银行 ~10+）
    assert!(
        avg_maotai > avg_pingan * 10.0,
        "贵州茅台均价({:.2})应远高于平安银行均价({:.2})，疑似硬编码",
        avg_maotai, avg_pingan
    );
}

/// 测试5：日期范围正确过滤
/// 返回数据的日期应全部在请求的 start/end 范围内
#[tokio::test]
async fn test_date_range_filtering() {
    let start = "2024-03-01";
    let end = "2024-03-31";
    let data = market_data::get_stock_daily("000001", start, end)
        .await
        .expect("获取日 K 线失败");

    assert!(!data.is_empty(), "3月份应有交易数据");

    for bar in &data {
        assert!(
            bar.date.as_str() >= start && bar.date.as_str() <= end,
            "数据日期 {} 不在请求范围 [{}, {}] 内",
            bar.date, start, end
        );
    }
}

/// 测试6：不同时间段返回不同数据量（防硬编码）
#[tokio::test]
async fn test_different_date_ranges_return_different_counts() {
    let data_short = market_data::get_stock_daily("000001", "2024-01-02", "2024-01-15")
        .await
        .expect("获取短期数据失败");

    let data_long = market_data::get_stock_daily("000001", "2024-01-02", "2024-06-30")
        .await
        .expect("获取长期数据失败");

    assert!(
        data_long.len() > data_short.len(),
        "长日期范围({})的数据量应大于短日期范围({})",
        data_long.len(), data_short.len()
    );
}

// ─── 股票搜索测试 ────────────────────────────────────────────────────────────

/// 搜索"平安"应能匹配到平安银行
#[tokio::test]
async fn test_search_stocks_by_name() {
    let results = market_data::search_stocks("平安")
        .await
        .expect("搜索股票失败");

    assert!(!results.is_empty(), "搜索'平安'应返回结果");

    // 应包含平安银行（000001）
    let has_pingan = results.iter().any(|s| s.symbol == "000001" || s.name.contains("平安"));
    assert!(has_pingan, "搜索'平安'结果应包含平安银行");
}

/// 按股票代码搜索
#[tokio::test]
async fn test_search_stocks_by_code() {
    let results = market_data::search_stocks("600519")
        .await
        .expect("按代码搜索失败");

    assert!(!results.is_empty(), "搜索'600519'应返回结果");

    let has_maotai = results.iter().any(|s| s.symbol == "600519");
    assert!(has_maotai, "搜索'600519'结果应包含贵州茅台");
}

/// 空关键字返回空结果
#[tokio::test]
async fn test_search_stocks_empty_keyword() {
    let results = market_data::search_stocks("")
        .await
        .expect("空搜索不应报错");

    assert!(results.is_empty(), "空关键字应返回空数组");
}

/// 不存在的关键字返回空结果
#[tokio::test]
async fn test_search_stocks_no_match() {
    let results = market_data::search_stocks("ZZZZZZZZZ不存在的股票")
        .await
        .expect("无匹配搜索不应报错");

    assert!(results.is_empty(), "无匹配搜索应返回空数组");
}

/// StockInfo 结构完整性：symbol 为 6 位数字，name 非空
#[tokio::test]
async fn test_search_result_structure() {
    let results = market_data::search_stocks("银行")
        .await
        .expect("搜索失败");

    assert!(!results.is_empty(), "搜索'银行'应有结果");

    for stock in &results {
        assert!(
            stock.symbol.len() == 6 && stock.symbol.chars().all(|c| c.is_ascii_digit()),
            "symbol '{}' 应为 6 位数字",
            stock.symbol
        );
        assert!(!stock.name.is_empty(), "name 不应为空");
    }
}

// ─── 指数快照测试 ────────────────────────────────────────────────────────────

/// 固定返回 3 条指数记录
#[tokio::test]
async fn test_index_snapshot_returns_three() {
    let snapshots = market_data::get_index_snapshot()
        .await
        .expect("获取指数快照失败");

    assert_eq!(
        snapshots.len(),
        3,
        "应固定返回 3 条指数记录（上证、深证、创业板）"
    );
}

/// 验证三大指数代码和名称
#[tokio::test]
async fn test_index_snapshot_contains_expected_indices() {
    let snapshots = market_data::get_index_snapshot()
        .await
        .expect("获取指数快照失败");

    let symbols: Vec<&str> = snapshots.iter().map(|s| s.symbol.as_str()).collect();
    let names: Vec<&str> = snapshots.iter().map(|s| s.name.as_str()).collect();

    // 上证指数
    assert!(
        symbols.contains(&"000001") || names.iter().any(|n| n.contains("上证")),
        "应包含上证指数"
    );

    // 深证成指
    assert!(
        symbols.contains(&"399001") || names.iter().any(|n| n.contains("深证")),
        "应包含深证成指"
    );

    // 创业板指
    assert!(
        symbols.contains(&"399006") || names.iter().any(|n| n.contains("创业板")),
        "应包含创业板指"
    );
}

/// 验证指数快照数值合理性
#[tokio::test]
async fn test_index_snapshot_data_validity() {
    let snapshots = market_data::get_index_snapshot()
        .await
        .expect("获取指数快照失败");

    for snap in &snapshots {
        // 点位应为正数
        assert!(
            snap.points > 0.0,
            "{} 点位({})应为正数",
            snap.name, snap.points
        );

        // 涨跌幅通常在 -11% ~ +11%（A 股涨跌停限制 10%，指数波动更小）
        assert!(
            snap.change >= -11.0 && snap.change <= 11.0,
            "{} 涨跌幅({})超出合理范围",
            snap.name, snap.change
        );

        // name 非空
        assert!(!snap.name.is_empty(), "指数名称不应为空");

        // symbol 非空
        assert!(!snap.symbol.is_empty(), "指数代码不应为空");
    }
}

/// 上证指数点位应在合理范围内（2000 ~ 6000）
#[tokio::test]
async fn test_shanghai_index_points_range() {
    let snapshots = market_data::get_index_snapshot()
        .await
        .expect("获取指数快照失败");

    let shanghai = snapshots
        .iter()
        .find(|s| s.symbol == "000001" || s.name.contains("上证"))
        .expect("未找到上证指数");

    assert!(
        shanghai.points > 2000.0 && shanghai.points < 6000.0,
        "上证指数点位({})应在 2000-6000 之间",
        shanghai.points
    );
}
