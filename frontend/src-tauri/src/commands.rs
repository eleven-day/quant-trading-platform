//! Tauri IPC 命令定义
//!
//! 将后端业务逻辑暴露为 Tauri 命令，前端通过 invoke() 调用。
//! 每个命令对应一个 HTTP API 端点，复用后端库中的核心逻辑。

use std::collections::HashMap;

use quant_backend::data::cache::get_stock_daily_cached;
use quant_backend::types::*;
use tauri::State;

use crate::TauriAppState;

// ─── 数据获取命令 ──────────────────────────────────────────────────────────────

/// 搜索股票
///
/// 对应 GET /api/stocks/search?q={keyword}
#[tauri::command]
pub async fn search_stocks(keyword: String) -> Result<Vec<StockInfo>, String> {
    if keyword.is_empty() {
        return Ok(vec![]);
    }
    quant_backend::data::market_data::search_stocks(&keyword)
        .await
        .map_err(|e| e.to_string())
}

/// 获取股票日线数据
///
/// 对应 GET /api/stocks/{symbol}/daily?start={start}&end={end}
#[tauri::command]
pub async fn get_stock_daily(
    state: State<'_, TauriAppState>,
    symbol: String,
    start: String,
    end: String,
) -> Result<Vec<OHLCV>, String> {
    // 参数校验
    if start > end {
        return Err("start 日期必须早于或等于 end 日期".to_string());
    }

    let db = state.db.clone();
    let rt_handle = tokio::runtime::Handle::current();

    tokio::task::spawn_blocking(move || -> Result<Vec<OHLCV>, String> {
        let db = db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
        rt_handle
            .block_on(get_stock_daily_cached(&db, &symbol, &start, &end))
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("内部任务执行失败: {}", e))?
}

/// 获取三大指数快照
///
/// 对应 GET /api/index/snapshot
#[tauri::command]
pub async fn get_index_snapshot() -> Result<Vec<IndexSnapshot>, String> {
    quant_backend::data::market_data::get_index_snapshot()
        .await
        .map_err(|e| e.to_string())
}

// ─── 回测 & 策略命令 ──────────────────────────────────────────────────────────

/// 执行回测
///
/// 对应 POST /api/backtest
#[tauri::command]
pub async fn run_backtest(
    state: State<'_, TauriAppState>,
    params: BacktestParams,
) -> Result<BacktestResult, String> {
    // 参数校验
    let valid_strategies = ["dual-ma", "rsi", "bollinger", "macd"];
    if !valid_strategies.contains(&params.strategy_id.as_str()) {
        return Err(format!("策略 '{}' 不存在", params.strategy_id));
    }
    if params.start_date >= params.end_date {
        return Err("startDate 必须早于 endDate".to_string());
    }
    if params.initial_capital <= 0.0 {
        return Err("initialCapital 必须大于 0".to_string());
    }

    let symbol = params.symbol.clone();
    let start = params.start_date.clone();
    let end = params.end_date.clone();
    let db = state.db.clone();
    let rt_handle = tokio::runtime::Handle::current();

    // 获取股票数据
    let data = tokio::task::spawn_blocking(move || -> Result<Vec<OHLCV>, String> {
        let db = db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
        rt_handle
            .block_on(get_stock_daily_cached(&db, &symbol, &start, &end))
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("内部任务执行失败: {}", e))??;

    // 执行回测
    quant_backend::engine::backtest::run_backtest(
        &params.strategy_id,
        &data,
        params.initial_capital,
    )
    .map_err(|e| e.to_string())
}

/// 获取内置策略列表
///
/// 对应 GET /api/strategies
#[tauri::command]
pub async fn get_strategies() -> Vec<StrategyInfo> {
    quant_backend::strategies::get_strategy_list()
}

/// 获取策略学习内容列表
///
/// 对应 GET /api/strategies/learn
#[tauri::command]
pub async fn get_strategy_learn_list() -> Vec<StrategyLearnDetail> {
    quant_backend::strategies::get_strategy_learn_list()
}

// ─── 自选股命令 ────────────────────────────────────────────────────────────────

/// 获取自选股列表
///
/// 对应 GET /api/watchlist
#[tauri::command]
pub async fn get_watchlist(
    state: State<'_, TauriAppState>,
) -> Result<Vec<StockInfo>, String> {
    let db = state.db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
    db.get_watchlist().map_err(|e| e.to_string())
}

/// 添加自选股
///
/// 对应 POST /api/watchlist
#[tauri::command]
pub async fn add_to_watchlist(
    state: State<'_, TauriAppState>,
    stock: StockInfo,
) -> Result<StockInfo, String> {
    let db = state.db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
    db.add_to_watchlist(&stock).map_err(|e| e.to_string())
}

/// 删除自选股
///
/// 对应 DELETE /api/watchlist/{symbol}
#[tauri::command]
pub async fn remove_from_watchlist(
    state: State<'_, TauriAppState>,
    symbol: String,
) -> Result<SuccessResponse, String> {
    let db = state.db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
    db.remove_from_watchlist(&symbol).map_err(|e| e.to_string())?;
    Ok(SuccessResponse { success: true })
}

// ─── 用户设置命令 ──────────────────────────────────────────────────────────────

/// 获取用户设置
///
/// 对应 GET /api/settings
#[tauri::command]
pub async fn get_settings(
    state: State<'_, TauriAppState>,
) -> Result<HashMap<String, String>, String> {
    let db = state.db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
    db.get_settings().map_err(|e| e.to_string())
}

/// 更新用户设置
///
/// 对应 PUT /api/settings
#[tauri::command]
pub async fn update_settings(
    state: State<'_, TauriAppState>,
    settings: HashMap<String, String>,
) -> Result<HashMap<String, String>, String> {
    let db = state.db.lock().map_err(|e| format!("数据库锁获取失败: {}", e))?;
    db.update_settings(&settings).map_err(|e| e.to_string())
}
