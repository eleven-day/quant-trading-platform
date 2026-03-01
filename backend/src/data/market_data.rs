//! 行情数据获取
//!
//! 从外部数据源（东方财富 EastMoney）获取 A 股日 K 线、股票搜索、指数快照等数据。

use crate::types::{IndexSnapshot, OHLCV, StockInfo};
use reqwest::Client;
use serde_json::Value;

/// 构建 reqwest 客户端（模拟浏览器 User-Agent，避免被拒）
fn build_client() -> Result<Client, Box<dyn std::error::Error>> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()?;
    Ok(client)
}

/// 推断股票的市场代码：沪市(1) 或 深市(0)
/// 6 开头 → 沪市，其余 → 深市
fn market_code(symbol: &str) -> &str {
    if symbol.starts_with('6') {
        "1"
    } else {
        "0"
    }
}

/// 将 YYYY-MM-DD 格式转为 YYYYMMDD（东方财富 API 所需格式）
fn date_to_compact(date: &str) -> String {
    date.replace('-', "")
}

/// 对查询参数值进行 percent-encoding
fn encode_param(s: &str) -> String {
    let mut encoded = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(b as char);
            }
            _ => {
                // UTF-8 多字节或特殊字符
                encoded.push_str(&format!("%{:02X}", b));
            }
        }
    }
    encoded
}

/// 将键值对列表拼接成查询字符串
fn build_query_string(params: &[(&str, &str)]) -> String {
    params
        .iter()
        .map(|(k, v)| format!("{}={}", k, encode_param(v)))
        .collect::<Vec<_>>()
        .join("&")
}

/// 获取指定股票在日期范围内的日 K 线数据
///
/// # 参数
/// - `symbol`: 股票代码（如 "000001"）
/// - `start`: 起始日期 YYYY-MM-DD
/// - `end`: 结束日期 YYYY-MM-DD
///
/// # 返回
/// 按日期升序排列的 OHLCV 数据
pub async fn get_stock_daily(
    symbol: &str,
    start: &str,
    end: &str,
) -> Result<Vec<OHLCV>, Box<dyn std::error::Error>> {
    let client = build_client()?;
    let mc = market_code(symbol);
    let secid = format!("{}.{}", mc, symbol);
    let beg = date_to_compact(start);
    let end_compact = date_to_compact(end);

    // 东方财富日 K 线接口
    let base_url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
    let qs = build_query_string(&[
        ("fields1", "f1,f2,f3,f4,f5,f6"),
        ("fields2", "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116"),
        ("ut", "7eea3edcaed734bea9cbfc24409ed989"),
        ("klt", "101"),
        ("fqt", "0"),
        ("secid", &secid),
        ("beg", &beg),
        ("end", &end_compact),
        ("lmt", "10000"),
        ("_", "1"),
    ]);
    let url = format!("{}?{}", base_url, qs);

    let resp = client.get(&url).send().await?;
    let body: Value = resp.json().await?;

    // 检查返回数据是否有效
    let klines = body["data"]["klines"]
        .as_array()
        .ok_or_else(|| format!("股票 {} 不存在或无数据", symbol))?;

    let mut result: Vec<OHLCV> = Vec::with_capacity(klines.len());

    for line in klines {
        let s = line
            .as_str()
            .ok_or("K 线数据格式异常")?;
        // 格式: "日期,开盘,收盘,最高,最低,成交量,成交额,振幅,涨跌幅,涨跌额,换手率"
        let parts: Vec<&str> = s.split(',').collect();
        if parts.len() < 6 {
            continue;
        }

        let date = parts[0].to_string();
        let open: f64 = parts[1].parse()?;
        let close: f64 = parts[2].parse()?;
        let high: f64 = parts[3].parse()?;
        let low: f64 = parts[4].parse()?;
        let volume: u64 = parts[5].parse()?;

        // 过滤日期范围（API 可能返回边界外数据）
        if date.as_str() >= start && date.as_str() <= end {
            result.push(OHLCV {
                date,
                open,
                high,
                low,
                close,
                volume,
            });
        }
    }

    // 确保按日期升序
    result.sort_by(|a, b| a.date.cmp(&b.date));

    Ok(result)
}

/// 搜索股票
///
/// # 参数
/// - `keyword`: 搜索关键字，支持股票代码或中文名称
///
/// # 返回
/// 匹配的股票列表
pub async fn search_stocks(
    keyword: &str,
) -> Result<Vec<StockInfo>, Box<dyn std::error::Error>> {
    // 空关键字直接返回空
    if keyword.trim().is_empty() {
        return Ok(vec![]);
    }

    let client = build_client()?;

    // 东方财富搜索建议接口，支持代码、拼音、中文名称搜索
    let base_url = "https://searchapi.eastmoney.com/api/suggest/get";
    let encoded_keyword = encode_param(keyword);
    let url = format!(
        "{}?input={}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8&count=100",
        base_url, encoded_keyword
    );

    let resp = client.get(&url).send().await?;
    let body: Value = resp.json().await?;

    // Data 可能为 null（无匹配结果）
    let items = match body["QuotationCodeTable"]["Data"].as_array() {
        Some(arr) => arr.clone(),
        None => return Ok(vec![]),
    };

    let mut result: Vec<StockInfo> = Vec::new();

    for item in &items {
        // 只保留 A 股
        let classify = item["Classify"].as_str().unwrap_or("");
        if classify != "AStock" {
            continue;
        }

        let code = item["Code"].as_str().unwrap_or("").to_string();
        let name = item["Name"].as_str().unwrap_or("").to_string();

        // 确保 symbol 为 6 位数字
        if code.len() == 6 && code.chars().all(|c| c.is_ascii_digit()) && !name.is_empty() {
            result.push(StockInfo {
                symbol: code,
                name,
            });
        }
    }

    Ok(result)
}

/// 获取三大指数快照（上证指数、深证成指、创业板指）
///
/// # 返回
/// 固定 3 条指数快照记录
pub async fn get_index_snapshot() -> Result<Vec<IndexSnapshot>, Box<dyn std::error::Error>> {
    let client = build_client()?;

    // 东方财富沪深重要指数接口
    let base_url = "https://33.push2.eastmoney.com/api/qt/clist/get";
    let qs = build_query_string(&[
        ("pn", "1"),
        ("pz", "100"),
        ("po", "1"),
        ("np", "1"),
        ("ut", "bd1d9ddb04089700cf9c27f6f7426281"),
        ("fltt", "2"),
        ("invt", "2"),
        ("dect", "1"),
        ("wbp2u", "|0|0|0|web"),
        ("fid", "f3"),
        ("fs", "b:MK0010"),
        ("fields", "f2,f3,f12,f14"),
        ("_", "1"),
    ]);
    let url = format!("{}?{}", base_url, qs);

    let resp = client.get(&url).send().await?;
    let body: Value = resp.json().await?;

    let items = body["data"]["diff"]
        .as_array()
        .ok_or("获取指数数据失败")?;

    // 只保留三大指数：000001(上证指数), 399001(深证成指), 399006(创业板指)
    let target_indices = ["000001", "399001", "399006"];
    let mut result: Vec<IndexSnapshot> = Vec::new();

    for item in items {
        let code = item["f12"].as_str().unwrap_or("");
        if target_indices.contains(&code) {
            let points = match &item["f2"] {
                Value::Number(n) => n.as_f64().unwrap_or(0.0),
                Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
                _ => 0.0,
            };
            let change = match &item["f3"] {
                Value::Number(n) => n.as_f64().unwrap_or(0.0),
                Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
                _ => 0.0,
            };
            let name = item["f14"].as_str().unwrap_or("").to_string();

            result.push(IndexSnapshot {
                symbol: code.to_string(),
                name,
                points,
                change,
            });
        }
    }

    // 按固定顺序排列：上证、深证、创业板
    result.sort_by(|a, b| {
        let order = |s: &str| -> usize {
            match s {
                "000001" => 0,
                "399001" => 1,
                "399006" => 2,
                _ => 3,
            }
        };
        order(&a.symbol).cmp(&order(&b.symbol))
    });

    if result.len() != 3 {
        return Err(format!(
            "预期获取 3 条指数数据，实际获取 {} 条",
            result.len()
        )
        .into());
    }

    Ok(result)
}
