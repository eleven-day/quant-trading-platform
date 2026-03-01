//! 自选股和用户设置 HTTP API 路由测试
//!
//! 阶段五：基于 API 契约 (`docs/api-contract.md` §预留接口) 编写的 TDD 测试。
//! 通过 HTTP 请求测试完整的 API 端点行为。
//! 当前状态：编译通过，运行失败（等待实现）。
//!
//! 测试场景：
//! - GET /api/watchlist → 获取自选股列表
//! - POST /api/watchlist → 添加自选股
//! - DELETE /api/watchlist/{symbol} → 删除自选股
//! - GET /api/settings → 获取用户设置
//! - PUT /api/settings → 更新用户设置

use axum::http::StatusCode;
use axum_test::TestServer;
use quant_backend::routes::create_router;
use quant_backend::types::*;
use serde_json::Value;
use std::collections::HashMap;

/// 创建测试服务器
fn test_server() -> TestServer {
    let app = create_router();
    TestServer::new(app).expect("创建测试服务器失败")
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/watchlist
// ═══════════════════════════════════════════════════════════════════════════════

/// 初始自选股列表应为空（或返回已有数据）
#[tokio::test]
async fn test_get_watchlist_returns_200() {
    let server = test_server();
    let resp = server.get("/api/watchlist").await;

    resp.assert_status_ok();
    let list: Vec<StockInfo> = resp.json();
    // 初始状态可能为空，但响应格式必须正确
    assert!(list.len() >= 0, "应返回数组（可以为空）");
}

/// GET /api/watchlist 响应格式应包含 symbol 和 name 字段
#[tokio::test]
async fn test_get_watchlist_json_format() {
    let server = test_server();

    // 先添加一只自选股
    let stock = serde_json::json!({
        "symbol": "000001",
        "name": "平安银行"
    });
    server.post("/api/watchlist").json(&stock).await;

    let resp = server.get("/api/watchlist").await;
    resp.assert_status_ok();

    let json: Value = resp.json();
    let arr = json.as_array().expect("响应应为数组");
    if !arr.is_empty() {
        let first = &arr[0];
        assert!(first.get("symbol").is_some(), "应包含 symbol 字段");
        assert!(first.get("name").is_some(), "应包含 name 字段");
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/watchlist
// ═══════════════════════════════════════════════════════════════════════════════

/// 添加自选股应返回 200 + StockInfo
#[tokio::test]
async fn test_add_watchlist_success() {
    let server = test_server();

    let stock = serde_json::json!({
        "symbol": "000001",
        "name": "平安银行"
    });

    let resp = server.post("/api/watchlist").json(&stock).await;

    resp.assert_status_ok();
    let result: StockInfo = resp.json();
    assert_eq!(result.symbol, "000001");
    assert_eq!(result.name, "平安银行");
}

/// 添加后应能在列表中查到
#[tokio::test]
async fn test_add_watchlist_then_get() {
    let server = test_server();

    let stock = serde_json::json!({
        "symbol": "600519",
        "name": "贵州茅台"
    });
    let resp = server.post("/api/watchlist").json(&stock).await;
    resp.assert_status_ok();

    let resp = server.get("/api/watchlist").await;
    resp.assert_status_ok();
    let list: Vec<StockInfo> = resp.json();

    assert!(
        list.iter().any(|s| s.symbol == "600519"),
        "添加后应能在列表中查到 600519"
    );
}

/// 添加多只自选股
#[tokio::test]
async fn test_add_multiple_watchlist_items() {
    let server = test_server();

    let stocks = vec![
        serde_json::json!({"symbol": "000001", "name": "平安银行"}),
        serde_json::json!({"symbol": "600519", "name": "贵州茅台"}),
    ];

    for stock in &stocks {
        let resp = server.post("/api/watchlist").json(stock).await;
        resp.assert_status_ok();
    }

    let resp = server.get("/api/watchlist").await;
    resp.assert_status_ok();
    let list: Vec<StockInfo> = resp.json();

    assert!(list.len() >= 2, "应至少有 2 只自选股");
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/watchlist/{symbol}
// ═══════════════════════════════════════════════════════════════════════════════

/// 删除自选股应返回 200 + { success: true }
#[tokio::test]
async fn test_remove_watchlist_success() {
    let server = test_server();

    // 先添加
    let stock = serde_json::json!({
        "symbol": "000001",
        "name": "平安银行"
    });
    server.post("/api/watchlist").json(&stock).await;

    // 再删除
    let resp = server.delete("/api/watchlist/000001").await;
    resp.assert_status_ok();

    let result: SuccessResponse = resp.json();
    assert!(result.success, "删除成功应返回 success: true");
}

/// 删除后应从列表中消失
#[tokio::test]
async fn test_remove_watchlist_then_get() {
    let server = test_server();

    // 添加两只
    let stock1 = serde_json::json!({"symbol": "000001", "name": "平安银行"});
    let stock2 = serde_json::json!({"symbol": "600519", "name": "贵州茅台"});
    server.post("/api/watchlist").json(&stock1).await;
    server.post("/api/watchlist").json(&stock2).await;

    // 删除一只
    let resp = server.delete("/api/watchlist/000001").await;
    resp.assert_status_ok();

    // 验证列表
    let resp = server.get("/api/watchlist").await;
    resp.assert_status_ok();
    let list: Vec<StockInfo> = resp.json();

    assert!(
        !list.iter().any(|s| s.symbol == "000001"),
        "删除后 000001 不应在列表中"
    );
    assert!(
        list.iter().any(|s| s.symbol == "600519"),
        "600519 应仍在列表中"
    );
}

/// DELETE 响应 JSON 应包含 success 字段
#[tokio::test]
async fn test_remove_watchlist_json_format() {
    let server = test_server();

    let stock = serde_json::json!({"symbol": "000001", "name": "平安银行"});
    server.post("/api/watchlist").json(&stock).await;

    let resp = server.delete("/api/watchlist/000001").await;
    resp.assert_status_ok();

    let json: Value = resp.json();
    assert!(
        json.get("success").is_some(),
        "响应应包含 success 字段"
    );
    assert_eq!(
        json.get("success").unwrap().as_bool().unwrap(),
        true,
        "success 应为 true"
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/settings
// ═══════════════════════════════════════════════════════════════════════════════

/// 获取设置应返回 200 + 键值对
#[tokio::test]
async fn test_get_settings_returns_200() {
    let server = test_server();
    let resp = server.get("/api/settings").await;

    resp.assert_status_ok();
    let settings: HashMap<String, String> = resp.json();
    // 初始可能为空，但响应格式必须是 JSON 对象
    assert!(settings.len() >= 0, "应返回键值对（可以为空）");
}

/// GET /api/settings 响应应为 JSON 对象（非数组）
#[tokio::test]
async fn test_get_settings_is_json_object() {
    let server = test_server();
    let resp = server.get("/api/settings").await;

    resp.assert_status_ok();
    let json: Value = resp.json();
    assert!(json.is_object(), "设置响应应为 JSON 对象，非数组");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/settings
// ═══════════════════════════════════════════════════════════════════════════════

/// 更新设置应返回 200 + 完整设置
#[tokio::test]
async fn test_update_settings_success() {
    let server = test_server();

    let settings = serde_json::json!({
        "theme": "dark",
        "language": "zh-CN"
    });

    let resp = server.put("/api/settings").json(&settings).await;
    resp.assert_status_ok();

    let result: HashMap<String, String> = resp.json();
    assert_eq!(result.get("theme").unwrap(), "dark");
    assert_eq!(result.get("language").unwrap(), "zh-CN");
}

/// 更新后 GET 应返回最新值
#[tokio::test]
async fn test_update_settings_then_get() {
    let server = test_server();

    let settings = serde_json::json!({
        "theme": "dark",
        "refreshInterval": "30"
    });
    let resp = server.put("/api/settings").json(&settings).await;
    resp.assert_status_ok();

    let resp = server.get("/api/settings").await;
    resp.assert_status_ok();

    let result: HashMap<String, String> = resp.json();
    assert_eq!(
        result.get("theme").unwrap(),
        "dark",
        "GET 应返回之前 PUT 的值"
    );
    assert_eq!(
        result.get("refreshInterval").unwrap(),
        "30",
        "GET 应返回之前 PUT 的值"
    );
}

/// 部分更新不应删除已有键
#[tokio::test]
async fn test_update_settings_partial_preserves_existing() {
    let server = test_server();

    // 第一次设置
    let settings1 = serde_json::json!({
        "theme": "dark",
        "language": "zh-CN"
    });
    server.put("/api/settings").json(&settings1).await;

    // 第二次只更新 theme
    let settings2 = serde_json::json!({
        "theme": "light"
    });
    let resp = server.put("/api/settings").json(&settings2).await;
    resp.assert_status_ok();

    let result: HashMap<String, String> = resp.json();
    assert_eq!(result.get("theme").unwrap(), "light", "theme 应被更新");
    assert_eq!(
        result.get("language").unwrap(),
        "zh-CN",
        "未传入的 language 应保持不变"
    );
}

/// PUT /api/settings 响应应为 JSON 对象
#[tokio::test]
async fn test_update_settings_returns_json_object() {
    let server = test_server();

    let settings = serde_json::json!({"theme": "dark"});
    let resp = server.put("/api/settings").json(&settings).await;
    resp.assert_status_ok();

    let json: Value = resp.json();
    assert!(json.is_object(), "PUT 响应应为 JSON 对象");
}
