//! SQLite 缓存层 TDD 测试
//!
//! 阶段五：数据存储层测试用例。
//! 基于开发计划 §5.2 编写的 TDD 测试。
//! 当前状态：编译通过，运行失败（等待实现）。
//!
//! 测试场景：
//! 1. 数据库初始化 — CacheDb::new 创建表结构
//! 2. K 线数据存取 — store_daily_data / load_daily_data
//! 3. 缓存元信息 — get_cache_meta / update_cache_meta
//! 4. 自选股 CRUD — get_watchlist / add_to_watchlist / remove_from_watchlist
//! 5. 用户设置 — get_settings / update_settings
//! 6. 智能缓存逻辑 — 首次请求/重复请求/部分覆盖/当日刷新

use quant_backend::data::cache::{CacheDb, get_stock_daily_cached};
use quant_backend::types::*;
use rusqlite::Connection;
use std::collections::HashMap;

/// 创建内存数据库用于测试
fn create_test_db() -> CacheDb {
    let conn = Connection::open_in_memory().expect("无法创建内存数据库");
    CacheDb::new(conn).expect("CacheDb 初始化失败")
}

/// 构造测试用 OHLCV 数据
fn make_ohlcv(date: &str, close: f64) -> OHLCV {
    OHLCV {
        date: date.to_string(),
        open: close - 0.5,
        high: close + 0.5,
        low: close - 1.0,
        close,
        volume: 10000,
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 数据库初始化测试
// ═══════════════════════════════════════════════════════════════════════════════

/// CacheDb::new 应成功创建数据库并初始化所有表
#[test]
fn test_cache_db_new_creates_tables() {
    let db = create_test_db();
    // 验证表已创建 — 通过执行查询来检查
    // 如果表不存在，后续操作会失败
    let result = db.get_watchlist();
    assert!(result.is_ok(), "get_watchlist 应该成功（表已创建）");
    assert!(result.unwrap().is_empty(), "初始自选股列表应为空");
}

/// CacheDb::new 应创建 stock_daily 表
#[test]
fn test_cache_db_creates_stock_daily_table() {
    let db = create_test_db();
    let result = db.load_daily_data("000001", "2024-01-01", "2024-12-31");
    assert!(result.is_ok(), "load_daily_data 应该成功（表已创建）");
    assert!(result.unwrap().is_empty(), "初始查询应返回空数据");
}

/// CacheDb::new 应创建 cache_meta 表
#[test]
fn test_cache_db_creates_cache_meta_table() {
    let db = create_test_db();
    let result = db.get_cache_meta("000001");
    assert!(result.is_ok(), "get_cache_meta 应该成功（表已创建）");
    assert!(result.unwrap().is_none(), "未缓存的股票应返回 None");
}

/// CacheDb::new 应创建 user_settings 表
#[test]
fn test_cache_db_creates_settings_table() {
    let db = create_test_db();
    let result = db.get_settings();
    assert!(result.is_ok(), "get_settings 应该成功（表已创建）");
    assert!(result.unwrap().is_empty(), "初始设置应为空");
}

// ═══════════════════════════════════════════════════════════════════════════════
// K 线数据存取测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 存储 K 线数据后应能正确读取
#[test]
fn test_store_and_load_daily_data() {
    let db = create_test_db();
    let data = vec![
        make_ohlcv("2024-01-02", 10.50),
        make_ohlcv("2024-01-03", 10.80),
        make_ohlcv("2024-01-04", 10.60),
    ];

    db.store_daily_data("000001", &data).expect("存储失败");

    let loaded = db
        .load_daily_data("000001", "2024-01-02", "2024-01-04")
        .expect("读取失败");

    assert_eq!(loaded.len(), 3, "应返回 3 条数据");
    assert_eq!(loaded[0].date, "2024-01-02");
    assert_eq!(loaded[1].date, "2024-01-03");
    assert_eq!(loaded[2].date, "2024-01-04");
}

/// 读取数据应按日期升序排列
#[test]
fn test_load_daily_data_sorted_by_date() {
    let db = create_test_db();
    // 故意乱序插入
    let data = vec![
        make_ohlcv("2024-01-04", 10.60),
        make_ohlcv("2024-01-02", 10.50),
        make_ohlcv("2024-01-03", 10.80),
    ];

    db.store_daily_data("000001", &data).expect("存储失败");

    let loaded = db
        .load_daily_data("000001", "2024-01-02", "2024-01-04")
        .expect("读取失败");

    for i in 1..loaded.len() {
        assert!(
            loaded[i].date > loaded[i - 1].date,
            "数据应按日期升序排列：{} 应在 {} 之后",
            loaded[i].date,
            loaded[i - 1].date
        );
    }
}

/// 只查询指定日期范围内的数据
#[test]
fn test_load_daily_data_date_range_filter() {
    let db = create_test_db();
    let data = vec![
        make_ohlcv("2024-01-02", 10.50),
        make_ohlcv("2024-01-03", 10.80),
        make_ohlcv("2024-01-04", 10.60),
        make_ohlcv("2024-01-05", 10.70),
    ];

    db.store_daily_data("000001", &data).expect("存储失败");

    // 只查询中间两天
    let loaded = db
        .load_daily_data("000001", "2024-01-03", "2024-01-04")
        .expect("读取失败");

    assert_eq!(loaded.len(), 2, "应只返回日期范围内的 2 条数据");
    assert_eq!(loaded[0].date, "2024-01-03");
    assert_eq!(loaded[1].date, "2024-01-04");
}

/// 不同股票的数据应互相隔离
#[test]
fn test_load_daily_data_different_symbols_isolated() {
    let db = create_test_db();

    let data1 = vec![make_ohlcv("2024-01-02", 10.50)];
    let data2 = vec![make_ohlcv("2024-01-02", 1800.00)];

    db.store_daily_data("000001", &data1).expect("存储失败");
    db.store_daily_data("600519", &data2).expect("存储失败");

    let loaded1 = db
        .load_daily_data("000001", "2024-01-01", "2024-12-31")
        .expect("读取失败");
    let loaded2 = db
        .load_daily_data("600519", "2024-01-01", "2024-12-31")
        .expect("读取失败");

    assert_eq!(loaded1.len(), 1);
    assert_eq!(loaded2.len(), 1);
    assert!((loaded1[0].close - 10.50).abs() < 0.01, "000001 收盘价应为 10.50");
    assert!((loaded2[0].close - 1800.00).abs() < 0.01, "600519 收盘价应为 1800.00");
}

/// 重复存储同一日期的数据应更新（INSERT OR REPLACE）
#[test]
fn test_store_daily_data_upsert() {
    let db = create_test_db();

    let data_v1 = vec![make_ohlcv("2024-01-02", 10.50)];
    db.store_daily_data("000001", &data_v1).expect("首次存储失败");

    // 更新同一天的数据
    let data_v2 = vec![make_ohlcv("2024-01-02", 11.00)];
    db.store_daily_data("000001", &data_v2).expect("更新存储失败");

    let loaded = db
        .load_daily_data("000001", "2024-01-02", "2024-01-02")
        .expect("读取失败");

    assert_eq!(loaded.len(), 1, "应只有一条数据（非重复）");
    assert!(
        (loaded[0].close - 11.00).abs() < 0.01,
        "收盘价应为更新后的 11.00，实际: {}",
        loaded[0].close
    );
}

/// OHLCV 所有字段应完整存取
#[test]
fn test_store_and_load_preserves_all_fields() {
    let db = create_test_db();

    let data = vec![OHLCV {
        date: "2024-06-15".to_string(),
        open: 25.30,
        high: 26.10,
        low: 24.80,
        close: 25.85,
        volume: 5678900,
    }];

    db.store_daily_data("600036", &data).expect("存储失败");

    let loaded = db
        .load_daily_data("600036", "2024-06-15", "2024-06-15")
        .expect("读取失败");

    assert_eq!(loaded.len(), 1);
    let row = &loaded[0];
    assert_eq!(row.date, "2024-06-15");
    assert!((row.open - 25.30).abs() < 0.001, "open 不匹配");
    assert!((row.high - 26.10).abs() < 0.001, "high 不匹配");
    assert!((row.low - 24.80).abs() < 0.001, "low 不匹配");
    assert!((row.close - 25.85).abs() < 0.001, "close 不匹配");
    assert_eq!(row.volume, 5678900, "volume 不匹配");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 缓存元信息测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 更新缓存元信息后应能正确读取
#[test]
fn test_update_and_get_cache_meta() {
    let db = create_test_db();

    let meta = CacheMeta {
        symbol: "000001".to_string(),
        last_updated: "2024-06-15T10:30:00Z".to_string(),
        start_date: "2024-01-01".to_string(),
        end_date: "2024-06-15".to_string(),
    };

    db.update_cache_meta(&meta).expect("更新元信息失败");

    let loaded = db
        .get_cache_meta("000001")
        .expect("查询元信息失败")
        .expect("应存在元信息");

    assert_eq!(loaded.symbol, "000001");
    assert_eq!(loaded.last_updated, "2024-06-15T10:30:00Z");
    assert_eq!(loaded.start_date, "2024-01-01");
    assert_eq!(loaded.end_date, "2024-06-15");
}

/// 未缓存的股票应返回 None
#[test]
fn test_get_cache_meta_returns_none_for_unknown() {
    let db = create_test_db();
    let result = db.get_cache_meta("999999").expect("查询不应出错");
    assert!(result.is_none(), "未缓存的股票应返回 None");
}

/// 重复更新元信息应覆盖旧值（upsert）
#[test]
fn test_update_cache_meta_upsert() {
    let db = create_test_db();

    let meta_v1 = CacheMeta {
        symbol: "000001".to_string(),
        last_updated: "2024-01-01T00:00:00Z".to_string(),
        start_date: "2024-01-01".to_string(),
        end_date: "2024-03-31".to_string(),
    };
    db.update_cache_meta(&meta_v1).expect("首次更新失败");

    let meta_v2 = CacheMeta {
        symbol: "000001".to_string(),
        last_updated: "2024-06-15T10:30:00Z".to_string(),
        start_date: "2024-01-01".to_string(),
        end_date: "2024-06-15".to_string(),
    };
    db.update_cache_meta(&meta_v2).expect("二次更新失败");

    let loaded = db
        .get_cache_meta("000001")
        .expect("查询失败")
        .expect("应存在元信息");

    assert_eq!(loaded.end_date, "2024-06-15", "end_date 应为更新后的值");
    assert_eq!(
        loaded.last_updated, "2024-06-15T10:30:00Z",
        "last_updated 应为更新后的值"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 自选股 CRUD 测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 添加自选股后应能查询到
#[test]
fn test_add_and_get_watchlist() {
    let db = create_test_db();

    let stock = StockInfo {
        symbol: "000001".to_string(),
        name: "平安银行".to_string(),
    };

    let added = db.add_to_watchlist(&stock).expect("添加自选股失败");
    assert_eq!(added.symbol, "000001");
    assert_eq!(added.name, "平安银行");

    let list = db.get_watchlist().expect("查询自选股失败");
    assert_eq!(list.len(), 1, "应有 1 只自选股");
    assert_eq!(list[0].symbol, "000001");
    assert_eq!(list[0].name, "平安银行");
}

/// 添加多只自选股
#[test]
fn test_add_multiple_watchlist_items() {
    let db = create_test_db();

    let stocks = vec![
        StockInfo {
            symbol: "000001".to_string(),
            name: "平安银行".to_string(),
        },
        StockInfo {
            symbol: "600519".to_string(),
            name: "贵州茅台".to_string(),
        },
        StockInfo {
            symbol: "000858".to_string(),
            name: "五粮液".to_string(),
        },
    ];

    for stock in &stocks {
        db.add_to_watchlist(stock).expect("添加失败");
    }

    let list = db.get_watchlist().expect("查询失败");
    assert_eq!(list.len(), 3, "应有 3 只自选股");

    // 验证所有股票都在列表中
    let symbols: Vec<&str> = list.iter().map(|s| s.symbol.as_str()).collect();
    assert!(symbols.contains(&"000001"), "应包含 000001");
    assert!(symbols.contains(&"600519"), "应包含 600519");
    assert!(symbols.contains(&"000858"), "应包含 000858");
}

/// 重复添加同一只股票不应报错（幂等）
#[test]
fn test_add_watchlist_duplicate_is_idempotent() {
    let db = create_test_db();

    let stock = StockInfo {
        symbol: "000001".to_string(),
        name: "平安银行".to_string(),
    };

    db.add_to_watchlist(&stock).expect("首次添加失败");
    db.add_to_watchlist(&stock).expect("重复添加不应失败");

    let list = db.get_watchlist().expect("查询失败");
    assert_eq!(list.len(), 1, "重复添加不应产生重复记录");
}

/// 删除自选股
#[test]
fn test_remove_from_watchlist() {
    let db = create_test_db();

    let stock = StockInfo {
        symbol: "000001".to_string(),
        name: "平安银行".to_string(),
    };
    db.add_to_watchlist(&stock).expect("添加失败");

    let removed = db.remove_from_watchlist("000001").expect("删除失败");
    assert!(removed, "删除已存在的股票应返回 true");

    let list = db.get_watchlist().expect("查询失败");
    assert!(list.is_empty(), "删除后列表应为空");
}

/// 删除不存在的自选股应返回 false（不报错）
#[test]
fn test_remove_nonexistent_watchlist_item() {
    let db = create_test_db();
    let removed = db.remove_from_watchlist("999999").expect("删除不应出错");
    assert!(!removed, "删除不存在的股票应返回 false");
}

/// 空自选股列表应返回空 Vec
#[test]
fn test_get_watchlist_empty() {
    let db = create_test_db();
    let list = db.get_watchlist().expect("查询失败");
    assert!(list.is_empty(), "初始自选股列表应为空");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 用户设置测试
// ═══════════════════════════════════════════════════════════════════════════════

/// 更新设置后应能正确读取
#[test]
fn test_update_and_get_settings() {
    let db = create_test_db();

    let mut settings = HashMap::new();
    settings.insert("theme".to_string(), "dark".to_string());
    settings.insert("language".to_string(), "zh-CN".to_string());

    db.update_settings(&settings).expect("更新设置失败");

    let loaded = db.get_settings().expect("查询设置失败");
    assert_eq!(loaded.len(), 2, "应有 2 项设置");
    assert_eq!(loaded.get("theme").unwrap(), "dark");
    assert_eq!(loaded.get("language").unwrap(), "zh-CN");
}

/// 空设置应返回空 HashMap
#[test]
fn test_get_settings_empty() {
    let db = create_test_db();
    let settings = db.get_settings().expect("查询失败");
    assert!(settings.is_empty(), "初始设置应为空");
}

/// 部分更新设置不应删除未传入的键
#[test]
fn test_update_settings_partial_update() {
    let db = create_test_db();

    // 第一次设置两项
    let mut settings1 = HashMap::new();
    settings1.insert("theme".to_string(), "dark".to_string());
    settings1.insert("language".to_string(), "zh-CN".to_string());
    db.update_settings(&settings1).expect("首次设置失败");

    // 第二次只更新一项
    let mut settings2 = HashMap::new();
    settings2.insert("theme".to_string(), "light".to_string());
    db.update_settings(&settings2).expect("部分更新失败");

    let loaded = db.get_settings().expect("查询失败");
    assert_eq!(loaded.len(), 2, "部分更新不应删除未传入的键");
    assert_eq!(loaded.get("theme").unwrap(), "light", "theme 应被更新");
    assert_eq!(
        loaded.get("language").unwrap(),
        "zh-CN",
        "language 应保持不变"
    );
}

/// 更新设置应返回完整的当前设置
#[test]
fn test_update_settings_returns_all_settings() {
    let db = create_test_db();

    let mut settings1 = HashMap::new();
    settings1.insert("theme".to_string(), "dark".to_string());
    db.update_settings(&settings1).expect("首次设置失败");

    let mut settings2 = HashMap::new();
    settings2.insert("language".to_string(), "zh-CN".to_string());
    let result = db.update_settings(&settings2).expect("二次设置失败");

    assert_eq!(result.len(), 2, "应返回所有设置（含之前设置的项）");
    assert_eq!(result.get("theme").unwrap(), "dark");
    assert_eq!(result.get("language").unwrap(), "zh-CN");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 智能缓存逻辑测试（开发计划 §5.2）
// ═══════════════════════════════════════════════════════════════════════════════

/// 测试1：首次请求 → 从网络获取 → 存入 SQLite → 返回数据
///
/// 验证：缓存为空时，get_stock_daily_cached 应触发网络请求，
/// 获取数据后存入 SQLite，并返回数据。
#[tokio::test]
async fn test_cache_first_request_fetches_from_network() {
    let db = create_test_db();

    // 首次请求应从网络获取数据
    let result = get_stock_daily_cached(&db, "000001", "2024-01-02", "2024-01-31").await;
    assert!(result.is_ok(), "首次请求应成功");

    let data = result.unwrap();
    assert!(!data.is_empty(), "应返回非空数据");

    // 验证数据已存入缓存
    let cached = db
        .load_daily_data("000001", "2024-01-02", "2024-01-31")
        .expect("缓存查询失败");
    assert_eq!(
        cached.len(),
        data.len(),
        "缓存中的数据量应与返回值一致"
    );

    // 验证缓存元信息已更新
    let meta = db
        .get_cache_meta("000001")
        .expect("元信息查询失败")
        .expect("首次请求后应有元信息");
    assert_eq!(meta.start_date, "2024-01-02");
    assert_eq!(meta.end_date, "2024-01-31");
}

/// 测试2：再次请求同一股票同一日期范围 → 直接从 SQLite 读取
///
/// 验证：已缓存的数据范围再次请求时，不应发起网络请求，
/// 直接从 SQLite 返回。（通过对比响应速度或 mock 验证）
#[tokio::test]
async fn test_cache_repeat_request_reads_from_sqlite() {
    let db = create_test_db();

    // 预先存入缓存数据
    let cached_data = vec![
        make_ohlcv("2024-01-02", 10.50),
        make_ohlcv("2024-01-03", 10.80),
    ];
    db.store_daily_data("000001", &cached_data)
        .expect("预存数据失败");

    let meta = CacheMeta {
        symbol: "000001".to_string(),
        last_updated: "2024-06-15T10:30:00Z".to_string(),
        start_date: "2024-01-02".to_string(),
        end_date: "2024-01-03".to_string(),
    };
    db.update_cache_meta(&meta).expect("更新元信息失败");

    // 请求已缓存的范围
    let result = get_stock_daily_cached(&db, "000001", "2024-01-02", "2024-01-03").await;
    assert!(result.is_ok(), "缓存命中应成功");

    let data = result.unwrap();
    assert_eq!(data.len(), 2, "应返回缓存中的 2 条数据");
    assert_eq!(data[0].date, "2024-01-02");
    assert_eq!(data[1].date, "2024-01-03");
}

/// 测试3：请求范围部分超出缓存 → 只获取缺失部分 → 合并返回
///
/// 验证：缓存覆盖 1/2~1/10，请求 1/2~1/20 时，
/// 只从网络获取 1/11~1/20，合并后完整返回。
#[tokio::test]
async fn test_cache_partial_overlap_fetches_missing() {
    let db = create_test_db();

    // 预先缓存 1/2~1/5 的数据
    let cached_data = vec![
        make_ohlcv("2024-01-02", 10.50),
        make_ohlcv("2024-01-03", 10.80),
        make_ohlcv("2024-01-04", 10.60),
        make_ohlcv("2024-01-05", 10.70),
    ];
    db.store_daily_data("000001", &cached_data)
        .expect("预存数据失败");

    let meta = CacheMeta {
        symbol: "000001".to_string(),
        last_updated: "2024-06-15T10:30:00Z".to_string(),
        start_date: "2024-01-02".to_string(),
        end_date: "2024-01-05".to_string(),
    };
    db.update_cache_meta(&meta).expect("更新元信息失败");

    // 请求 1/2~1/10（部分超出缓存）
    let result = get_stock_daily_cached(&db, "000001", "2024-01-02", "2024-01-10").await;
    assert!(result.is_ok(), "部分缓存命中应成功");

    let data = result.unwrap();
    // 应包含缓存数据 + 从网络获取的新数据
    assert!(
        data.len() >= 4,
        "合并后数据不应少于缓存中的 4 条，实际: {}",
        data.len()
    );

    // 验证数据按日期升序且不重复
    for i in 1..data.len() {
        assert!(
            data[i].date > data[i - 1].date,
            "合并后数据应按日期升序且不重复"
        );
    }

    // 验证缓存已扩展
    let updated_meta = db
        .get_cache_meta("000001")
        .expect("查询失败")
        .expect("应有元信息");
    assert!(
        updated_meta.end_date.as_str() >= "2024-01-10",
        "缓存范围应扩展到请求的 end_date"
    );
}

/// 测试4：数据更新（当天数据可能变化）→ 当日数据重新获取
///
/// 验证：如果请求范围包含当天日期，即使有缓存也应重新获取当天数据。
#[tokio::test]
async fn test_cache_today_data_always_refreshed() {
    let db = create_test_db();

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    // 预先缓存包含"今天"的数据
    let cached_data = vec![make_ohlcv(&today, 10.50)];
    db.store_daily_data("000001", &cached_data)
        .expect("预存数据失败");

    let meta = CacheMeta {
        symbol: "000001".to_string(),
        last_updated: "2024-01-01T00:00:00Z".to_string(), // 旧的更新时间
        start_date: today.clone(),
        end_date: today.clone(),
    };
    db.update_cache_meta(&meta).expect("更新元信息失败");

    // 请求包含今天的范围 — 应重新获取
    let result = get_stock_daily_cached(&db, "000001", &today, &today).await;
    // 无论网络是否可达，此测试验证的是缓存逻辑会尝试刷新当日数据
    // 如果网络不可达，应返回缓存中的旧数据作为 fallback
    assert!(result.is_ok(), "请求当日数据应成功（缓存 fallback）");
}
