//! 量化学习平台 Tauri 桌面应用核心库
//!
//! 初始化 Tauri 应用，注册 IPC 命令，管理共享状态。

mod commands;

use tauri::Manager;

use quant_backend::data::cache::CacheDb;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use tracing_subscriber::EnvFilter;

/// Tauri 应用共享状态 — 包含 SQLite 缓存数据库连接
pub struct TauriAppState {
    pub db: Arc<Mutex<CacheDb>>,
}

/// 启动 Tauri 应用
pub fn run() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    tracing::info!("量化学习平台桌面应用启动中...");

    tauri::Builder::default()
        .setup(|app| {
            // 初始化 SQLite 数据库（与 HTTP 后端使用相同的文件）
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            std::fs::create_dir_all(&app_dir).ok();
            let db_path = app_dir.join("quant-data.db");

            tracing::info!(path = %db_path.display(), "打开 SQLite 数据库");

            let conn = Connection::open(&db_path)
                .unwrap_or_else(|e| panic!("无法打开 SQLite 数据库: {}", e));
            let cache_db = CacheDb::new(conn)
                .unwrap_or_else(|e| panic!("CacheDb 初始化失败: {}", e));

            app.manage(TauriAppState {
                db: Arc::new(Mutex::new(cache_db)),
            });

            tracing::info!("Tauri 应用初始化完成");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::search_stocks,
            commands::get_stock_daily,
            commands::get_index_snapshot,
            commands::run_backtest,
            commands::get_strategies,
            commands::get_strategy_learn_list,
            commands::get_watchlist,
            commands::add_to_watchlist,
            commands::remove_from_watchlist,
            commands::get_settings,
            commands::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}
