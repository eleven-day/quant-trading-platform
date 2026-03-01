//! CLI 数据获取验证工具
//!
//! 用于在命令行中验证东方财富 API 数据获取是否正常工作。
//!
//! # 用法
//!
//! ```bash
//! cargo run --bin test_data -- daily 000001 2024-01-02 2024-06-30
//! cargo run --bin test_data -- search 平安
//! cargo run --bin test_data -- index
//! ```

use quant_backend::data::market_data;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        print_usage();
        std::process::exit(1);
    }

    let command = args[1].as_str();
    match command {
        "daily" => cmd_daily(&args).await,
        "search" => cmd_search(&args).await,
        "index" => cmd_index().await,
        _ => {
            eprintln!("未知命令: {command}");
            print_usage();
            std::process::exit(1);
        }
    }
}

fn print_usage() {
    eprintln!("用法:");
    eprintln!("  cargo run --bin test_data -- daily <股票代码> <开始日期> <结束日期>");
    eprintln!("  cargo run --bin test_data -- search <关键字>");
    eprintln!("  cargo run --bin test_data -- index");
    eprintln!();
    eprintln!("示例:");
    eprintln!("  cargo run --bin test_data -- daily 000001 2024-01-02 2024-06-30");
    eprintln!("  cargo run --bin test_data -- search 平安");
    eprintln!("  cargo run --bin test_data -- index");
}

/// 获取日 K 线数据
async fn cmd_daily(args: &[String]) {
    if args.len() < 5 {
        eprintln!("错误: daily 命令需要 3 个参数: <股票代码> <开始日期> <结束日期>");
        eprintln!("示例: cargo run --bin test_data -- daily 000001 2024-01-02 2024-06-30");
        std::process::exit(1);
    }

    let symbol = &args[2];
    let start = &args[3];
    let end = &args[4];

    println!("📊 获取 {symbol} 日 K 线数据 ({start} ~ {end})...\n");

    match market_data::get_stock_daily(symbol, start, end).await {
        Ok(data) => {
            println!("✅ 成功获取 {} 条 K 线数据\n", data.len());
            if data.is_empty() {
                println!("⚠️  未获取到数据，请检查股票代码和日期范围");
                return;
            }
            // 打印表头
            println!(
                "{:<12} {:>10} {:>10} {:>10} {:>10} {:>14}",
                "日期", "开盘", "最高", "最低", "收盘", "成交量"
            );
            println!("{}", "-".repeat(70));

            // 打印前 5 条和最后 5 条
            let show_count = 5;
            if data.len() <= show_count * 2 {
                for row in &data {
                    print_ohlcv(row);
                }
            } else {
                for row in &data[..show_count] {
                    print_ohlcv(row);
                }
                println!("  ... 省略 {} 条 ...", data.len() - show_count * 2);
                for row in &data[data.len() - show_count..] {
                    print_ohlcv(row);
                }
            }

            // 简单统计
            println!("\n📈 数据摘要:");
            let first = &data[0];
            let last = &data[data.len() - 1];
            let return_pct = (last.close - first.open) / first.open * 100.0;
            let max_high = data.iter().map(|d| d.high).fold(f64::NEG_INFINITY, f64::max);
            let min_low = data.iter().map(|d| d.low).fold(f64::INFINITY, f64::min);
            let total_volume: u64 = data.iter().map(|d| d.volume).sum();

            println!("  期间收益率: {return_pct:+.2}%");
            println!("  最高价: {max_high:.2}");
            println!("  最低价: {min_low:.2}");
            println!("  总成交量: {total_volume}");
        }
        Err(e) => {
            eprintln!("❌ 获取数据失败: {e}");
            std::process::exit(1);
        }
    }
}

/// 搜索股票
async fn cmd_search(args: &[String]) {
    if args.len() < 3 {
        eprintln!("错误: search 命令需要 1 个参数: <关键字>");
        eprintln!("示例: cargo run --bin test_data -- search 平安");
        std::process::exit(1);
    }

    let keyword = &args[2];
    println!("🔍 搜索股票: {keyword}...\n");

    match market_data::search_stocks(keyword).await {
        Ok(stocks) => {
            println!("✅ 找到 {} 只匹配股票\n", stocks.len());
            if stocks.is_empty() {
                println!("⚠️  未找到匹配结果");
                return;
            }
            println!("{:<10} {}", "代码", "名称");
            println!("{}", "-".repeat(30));
            for stock in &stocks {
                println!("{:<10} {}", stock.symbol, stock.name);
            }
        }
        Err(e) => {
            eprintln!("❌ 搜索失败: {e}");
            std::process::exit(1);
        }
    }
}

/// 获取三大指数快照
async fn cmd_index() {
    println!("📊 获取三大指数快照...\n");

    match market_data::get_index_snapshot().await {
        Ok(snapshots) => {
            println!("✅ 获取 {} 条指数数据\n", snapshots.len());
            println!("{:<10} {:<10} {:>12} {:>10}", "代码", "名称", "点位", "涨跌幅");
            println!("{}", "-".repeat(45));
            for snap in &snapshots {
                let change_str = if snap.change >= 0.0 {
                    format!("+{:.2}%", snap.change)
                } else {
                    format!("{:.2}%", snap.change)
                };
                println!(
                    "{:<10} {:<10} {:>12.2} {:>10}",
                    snap.symbol, snap.name, snap.points, change_str
                );
            }
        }
        Err(e) => {
            eprintln!("❌ 获取指数数据失败: {e}");
            std::process::exit(1);
        }
    }
}

fn print_ohlcv(row: &quant_backend::types::OHLCV) {
    println!(
        "{:<12} {:>10.2} {:>10.2} {:>10.2} {:>10.2} {:>14}",
        row.date, row.open, row.high, row.low, row.close, row.volume
    );
}
