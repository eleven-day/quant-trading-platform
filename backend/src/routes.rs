//! API 路由定义
//!
//! 所有 HTTP API 端点的路由注册和处理函数。
//! 路由契约参见 `docs/api-contract.md`。

use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::Json,
    routing::{delete, get, post, put},
    Router,
};
use serde::Deserialize;

use crate::types::*;

/// 构建 API 路由
pub fn create_router() -> Router {
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
    Path(symbol): Path<String>,
    Query(params): Query<DailyQuery>,
) -> Result<Json<Vec<OHLCV>>, (StatusCode, Json<ApiError>)> {
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

    match crate::data::market_data::get_stock_daily(&symbol, &params.start, &params.end).await {
        Ok(data) => Ok(Json(data)),
        Err(e) => {
            let error_msg = e.to_string();
            if error_msg.contains("not found") || error_msg.contains("不存在") {
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ApiError {
                        error: error_msg,
                        code: "STOCK_NOT_FOUND".to_string(),
                    }),
                ))
            } else {
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
    Json(params): Json<BacktestParams>,
) -> Result<Json<BacktestResult>, (StatusCode, Json<ApiError>)> {
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

    // 获取数据
    let data = crate::data::market_data::get_stock_daily(
        &params.symbol,
        &params.start_date,
        &params.end_date,
    )
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError {
                error: e.to_string(),
                code: "DATA_SOURCE_ERROR".to_string(),
            }),
        )
    })?;

    // 执行回测
    match crate::engine::backtest::run_backtest(&params.strategy_id, &data, params.initial_capital)
    {
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
async fn get_watchlist() -> Result<Json<Vec<StockInfo>>, (StatusCode, Json<ApiError>)> {
    todo!("阶段五实现：获取自选股列表")
}

/// POST /api/watchlist
/// 添加自选股
async fn add_watchlist(
    Json(stock): Json<StockInfo>,
) -> Result<Json<StockInfo>, (StatusCode, Json<ApiError>)> {
    todo!("阶段五实现：添加自选股")
}

/// DELETE /api/watchlist/{symbol}
/// 删除自选股
async fn remove_watchlist(
    Path(symbol): Path<String>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ApiError>)> {
    todo!("阶段五实现：删除自选股")
}

// ═══════════════════════════════════════════════════════════════════════════════
// 阶段五：用户设置路由
// ═══════════════════════════════════════════════════════════════════════════════

/// GET /api/settings
/// 获取用户设置
async fn get_settings() -> Result<Json<std::collections::HashMap<String, String>>, (StatusCode, Json<ApiError>)> {
    todo!("阶段五实现：获取用户设置")
}

/// PUT /api/settings
/// 更新用户设置
async fn update_settings(
    Json(settings): Json<std::collections::HashMap<String, String>>,
) -> Result<Json<std::collections::HashMap<String, String>>, (StatusCode, Json<ApiError>)> {
    todo!("阶段五实现：更新用户设置")
}
