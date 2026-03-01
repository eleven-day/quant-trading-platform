//! API 路由定义
//!
//! 所有 HTTP API 端点的路由注册和处理函数。
//! 路由契约参见 `docs/api-contract.md`。

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{delete, get, post},
    Router,
};
use rusqlite::Connection;
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use crate::data::cache::{CacheDb, get_stock_daily_cached};
use crate::types::*;

/// 应用共享状态 — 包含 SQLite 缓存数据库连接
#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<CacheDb>>,
}

/// 构建 API 路由
pub fn create_router() -> Router {
    // 创建 SQLite 文件数据库作为持久存储
    let conn = Connection::open("quant-data.db")
        .expect("无法打开 SQLite 数据库文件 quant-data.db");
    let cache_db = CacheDb::new(conn)
        .expect("CacheDb 初始化失败");
    let state = AppState {
        db: Arc::new(Mutex::new(cache_db)),
    };

    Router::new()
        .route("/api/stocks/search", get(search_stocks))
        .route("/api/stocks/{symbol}/daily", get(get_stock_daily))
        .route("/api/index/snapshot", get(get_index_snapshot))
        .route("/api/backtest", post(run_backtest))
        .route("/api/strategies", get(get_strategies))
        .route("/api/strategies/learn", get(get_strategy_learn_list))
        // 阶段五：自选股和用户设置路由
        .route("/api/watchlist", get(get_watchlist).post(add_watchlist))
        .route("/api/watchlist/{symbol}", delete(remove_watchlist))
        .route("/api/settings", get(get_settings).put(update_settings))
        .with_state(state)
}

/// 搜索查询参数
#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
}

/// 日 K 线查询参数
#[derive(Debug, Deserialize)]
pub struct DailyQuery {
    pub start: String,
    pub end: String,
}

/// GET /api/stocks/search?q={keyword}
/// 根据关键字搜索股票
async fn search_stocks(
    Query(params): Query<SearchQuery>,
) -> Result<Json<Vec<StockInfo>>, (StatusCode, Json<ApiError>)> {
    let keyword = params.q.unwrap_or_default();
    if keyword.is_empty() {
        return Ok(Json(vec![]));
    }

    match crate::data::market_data::search_stocks(&keyword).await {
        Ok(stocks) => Ok(Json(stocks)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "DATA_SOURCE_ERROR".to_string(),
            }),
        )),
    }
}

/// GET /api/stocks/{symbol}/daily?start={start}&end={end}
/// 获取指定股票日 K 线数据
async fn get_stock_daily(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(params): Query<DailyQuery>,
) -> Result<Json<Vec<OHLCV>>, (StatusCode, Json<ApiError>)> {
    tracing::info!(
        symbol = %symbol,
        start = %params.start,
        end = %params.end,
        "收到股票日线请求"
    );

    // 参数校验：start <= end
    if params.start > params.end {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiError {
                error: "start 日期必须早于或等于 end 日期".to_string(),
                code: "INVALID_PARAM".to_string(),
            }),
        ));
    }

    let symbol_for_fetch = symbol.clone();
    let start_for_fetch = params.start.clone();
    let end_for_fetch = params.end.clone();
    let state_for_fetch = state.clone();
    let rt_handle = tokio::runtime::Handle::current();

    let data_result = tokio::task::spawn_blocking(move || -> Result<Vec<OHLCV>, String> {
        let db = state_for_fetch
            .db
            .lock()
            .map_err(|e| format!("数据库锁获取失败: {}", e))?;
        rt_handle
            .block_on(get_stock_daily_cached(
                &db,
                &symbol_for_fetch,
                &start_for_fetch,
                &end_for_fetch,
            ))
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("内部任务执行失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;

    match data_result {
        Ok(data) => {
            tracing::info!(
                symbol = %symbol,
                start = %params.start,
                end = %params.end,
                rows = data.len(),
                "股票日线请求处理成功"
            );
            Ok(Json(data))
        }
        Err(error_msg) => {
            if error_msg.starts_with("数据库锁获取失败:") {
                tracing::warn!(
                    symbol = %symbol,
                    start = %params.start,
                    end = %params.end,
                    error = %error_msg,
                    "股票日线缓存访问失败"
                );
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiError {
                        error: error_msg,
                        code: "INTERNAL_ERROR".to_string(),
                    }),
                ));
            }

            if error_msg.contains("not found") || error_msg.contains("不存在") {
                tracing::warn!(
                    symbol = %symbol,
                    start = %params.start,
                    end = %params.end,
                    error = %error_msg,
                    "股票不存在"
                );
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ApiError {
                        error: error_msg,
                        code: "STOCK_NOT_FOUND".to_string(),
                    }),
                ))
            } else {
                if error_msg.contains("timeout") || error_msg.contains("timed out") {
                    tracing::warn!(
                        symbol = %symbol,
                        start = %params.start,
                        end = %params.end,
                        "股票日线数据源超时，已触发缓存回退流程"
                    );
                }

                tracing::warn!(
                    symbol = %symbol,
                    start = %params.start,
                    end = %params.end,
                    error = %error_msg,
                    "股票日线数据源异常，缓存回退不可用"
                );
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiError {
                        error: error_msg,
                        code: "DATA_SOURCE_ERROR".to_string(),
                    }),
                ))
            }
        }
    }
}

/// GET /api/index/snapshot
/// 获取三大指数快照
async fn get_index_snapshot() -> Result<Json<Vec<IndexSnapshot>>, (StatusCode, Json<ApiError>)> {
    match crate::data::market_data::get_index_snapshot().await {
        Ok(snapshots) => Ok(Json(snapshots)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "DATA_SOURCE_ERROR".to_string(),
            }),
        )),
    }
}

/// POST /api/backtest
/// 运行回测
async fn run_backtest(
    State(state): State<AppState>,
    Json(params): Json<BacktestParams>,
) -> Result<Json<BacktestResult>, (StatusCode, Json<ApiError>)> {
    tracing::info!(
        symbol = %params.symbol,
        strategy = %params.strategy_id,
        start = %params.start_date,
        end = %params.end_date,
        "收到回测请求"
    );

    // 参数校验
    let valid_strategies = ["dual-ma", "rsi", "bollinger", "macd"];
    if !valid_strategies.contains(&params.strategy_id.as_str()) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiError {
                error: format!("策略 '{}' 不存在", params.strategy_id),
                code: "STRATEGY_NOT_FOUND".to_string(),
            }),
        ));
    }

    if params.start_date >= params.end_date {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiError {
                error: "startDate 必须早于 endDate".to_string(),
                code: "INVALID_PARAM".to_string(),
            }),
        ));
    }

    if params.initial_capital <= 0.0 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiError {
                error: "initialCapital 必须大于 0".to_string(),
                code: "INVALID_PARAM".to_string(),
            }),
        ));
    }

    let symbol_for_fetch = params.symbol.clone();
    let start_for_fetch = params.start_date.clone();
    let end_for_fetch = params.end_date.clone();
    let state_for_fetch = state.clone();
    let rt_handle = tokio::runtime::Handle::current();

    let data_result = tokio::task::spawn_blocking(move || -> Result<Vec<OHLCV>, String> {
        let db = state_for_fetch
            .db
            .lock()
            .map_err(|e| format!("数据库锁获取失败: {}", e))?;
        rt_handle
            .block_on(get_stock_daily_cached(
                &db,
                &symbol_for_fetch,
                &start_for_fetch,
                &end_for_fetch,
            ))
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("内部任务执行失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;

    let data = data_result.map_err(|error_msg| {
        if error_msg.starts_with("数据库锁获取失败:") {
            tracing::warn!(
                symbol = %params.symbol,
                strategy = %params.strategy_id,
                start = %params.start_date,
                end = %params.end_date,
                error = %error_msg,
                "回测缓存访问失败"
            );
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiError {
                    error: error_msg,
                    code: "INTERNAL_ERROR".to_string(),
                }),
            );
        }

        if error_msg.contains("timeout") || error_msg.contains("timed out") {
            tracing::warn!(
                symbol = %params.symbol,
                strategy = %params.strategy_id,
                start = %params.start_date,
                end = %params.end_date,
                "回测数据源超时，已触发缓存回退流程"
            );
        }

        tracing::warn!(
            symbol = %params.symbol,
            strategy = %params.strategy_id,
            start = %params.start_date,
            end = %params.end_date,
            error = %error_msg,
            "回测数据源异常，缓存回退不可用"
        );
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: error_msg,
                code: "DATA_SOURCE_ERROR".to_string(),
            }),
        )
    })?;

    tracing::info!(
        symbol = %params.symbol,
        strategy = %params.strategy_id,
        rows = data.len(),
        "回测请求数据准备完成"
    );

    // 执行回测
    match crate::engine::backtest::run_backtest(&params.strategy_id, &data, params.initial_capital)
    {
        Ok(result) => {
            tracing::info!(
                symbol = %params.symbol,
                strategy = %params.strategy_id,
                total_return = result.total_return,
                "回测执行成功"
            );
            Ok(Json(result))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )),
    }
}

/// GET /api/strategies
/// 获取内置策略列表
async fn get_strategies() -> Json<Vec<StrategyInfo>> {
    Json(crate::strategies::get_strategy_list())
}

/// GET /api/strategies/learn
/// 获取策略学习内容
async fn get_strategy_learn_list() -> Json<Vec<StrategyLearnDetail>> {
    Json(crate::strategies::get_strategy_learn_list())
}

// ═══════════════════════════════════════════════════════════════════════════════
// 阶段五：自选股路由
// ═══════════════════════════════════════════════════════════════════════════════

/// GET /api/watchlist
/// 获取自选股列表
async fn get_watchlist(
    State(state): State<AppState>,
) -> Result<Json<Vec<StockInfo>>, (StatusCode, Json<ApiError>)> {
    let db = state.db.lock().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("数据库锁获取失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;
    match db.get_watchlist() {
        Ok(list) => Ok(Json(list)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )),
    }
}

/// POST /api/watchlist
/// 添加自选股
async fn add_watchlist(
    State(state): State<AppState>,
    Json(stock): Json<StockInfo>,
) -> Result<Json<StockInfo>, (StatusCode, Json<ApiError>)> {
    let db = state.db.lock().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("数据库锁获取失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;
    match db.add_to_watchlist(&stock) {
        Ok(result) => Ok(Json(result)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )),
    }
}

/// DELETE /api/watchlist/{symbol}
/// 删除自选股
async fn remove_watchlist(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ApiError>)> {
    let db = state.db.lock().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("数据库锁获取失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;
    match db.remove_from_watchlist(&symbol) {
        Ok(_removed) => Ok(Json(SuccessResponse { success: true })),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )),
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 阶段五：用户设置路由
// ═══════════════════════════════════════════════════════════════════════════════

/// GET /api/settings
/// 获取用户设置
async fn get_settings(
    State(state): State<AppState>,
) -> Result<Json<HashMap<String, String>>, (StatusCode, Json<ApiError>)> {
    let db = state.db.lock().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("数据库锁获取失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;
    match db.get_settings() {
        Ok(settings) => Ok(Json(settings)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )),
    }
}

/// PUT /api/settings
/// 更新用户设置
async fn update_settings(
    State(state): State<AppState>,
    Json(settings): Json<HashMap<String, String>>,
) -> Result<Json<HashMap<String, String>>, (StatusCode, Json<ApiError>)> {
    let db = state.db.lock().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: format!("数据库锁获取失败: {}", e),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )
    })?;
    match db.update_settings(&settings) {
        Ok(all_settings) => Ok(Json(all_settings)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "INTERNAL_ERROR".to_string(),
            }),
        )),
    }
}
