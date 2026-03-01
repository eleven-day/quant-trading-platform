//! 量化学习平台 — Rust 后端
//!
//! HTTP API 服务入口，使用 axum 框架。
//! 接口契约参见 `docs/api-contract.md`。

use quant_backend::routes;

use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    // CORS 配置，允许前端开发服务器访问
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // 构建路由
    let app = routes::create_router()
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    // 启动服务器
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("后端服务启动，监听 http://localhost:3001");
    axum::serve(listener, app).await.unwrap();
}
