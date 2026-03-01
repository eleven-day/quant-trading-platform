//! SQLite 缓存层
//!
//! 将已获取的行情数据缓存到 SQLite，避免重复请求。
//! 实现智能缓存逻辑：
//! - 首次请求 → 从网络获取 → 存入 SQLite → 返回数据
//! - 重复请求 → 直接从 SQLite 读取
//! - 部分覆盖 → 只获取缺失部分 → 合并返回
//! - 当日数据 → 重新获取（盘中数据可能变化）

use rusqlite::{params, Connection};
use std::collections::HashMap;

use crate::types::*;

/// 缓存数据库管理器
///
/// 封装 SQLite 连接和所有缓存操作。
pub struct CacheDb {
    /// SQLite 连接
    conn: Connection,
}

impl CacheDb {
    /// 创建缓存数据库实例并初始化表结构
    ///
    /// 传入 SQLite 连接（可以是内存数据库或文件数据库）。
    /// 自动执行 CREATE TABLE IF NOT EXISTS。
    pub fn new(conn: Connection) -> Result<Self, Box<dyn std::error::Error>> {
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS stock_daily (
                symbol TEXT NOT NULL,
                date TEXT NOT NULL,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                volume INTEGER NOT NULL,
                PRIMARY KEY (symbol, date)
            );
            CREATE TABLE IF NOT EXISTS cache_meta (
                symbol TEXT PRIMARY KEY,
                last_updated TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS watchlist (
                symbol TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                added_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS user_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );",
        )?;
        Ok(Self { conn })
    }

    // ─── K 线数据缓存 ─────────────────────────────────────────────────────────

    /// 存储 K 线数据到缓存
    ///
    /// 将一组 OHLCV 数据写入 stock_daily 表，使用 INSERT OR REPLACE 避免重复。
    pub fn store_daily_data(
        &self,
        symbol: &str,
        data: &[OHLCV],
    ) -> Result<(), Box<dyn std::error::Error>> {
        let tx = self.conn.unchecked_transaction()?;
        {
            let mut stmt = tx.prepare(
                "INSERT OR REPLACE INTO stock_daily (symbol, date, open, high, low, close, volume)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            )?;
            for row in data {
                stmt.execute(params![
                    symbol,
                    row.date,
                    row.open,
                    row.high,
                    row.low,
                    row.close,
                    row.volume as i64,
                ])?;
            }
        }
        tx.commit()?;
        Ok(())
    }

    /// 从缓存读取 K 线数据
    ///
    /// 按日期范围查询 stock_daily 表，返回升序排列的 OHLCV 数据。
    /// 如果缓存中没有数据，返回空 Vec。
    pub fn load_daily_data(
        &self,
        symbol: &str,
        start_date: &str,
        end_date: &str,
    ) -> Result<Vec<OHLCV>, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare(
            "SELECT date, open, high, low, close, volume
             FROM stock_daily
             WHERE symbol = ?1 AND date >= ?2 AND date <= ?3
             ORDER BY date ASC",
        )?;
        let rows = stmt.query_map(params![symbol, start_date, end_date], |row| {
            Ok(OHLCV {
                date: row.get(0)?,
                open: row.get(1)?,
                high: row.get(2)?,
                low: row.get(3)?,
                close: row.get(4)?,
                volume: row.get::<_, i64>(5)? as u64,
            })
        })?;
        let mut result = Vec::new();
        for row in rows {
            result.push(row?);
        }
        Ok(result)
    }

    // ─── 缓存元信息 ───────────────────────────────────────────────────────────

    /// 获取缓存元信息
    ///
    /// 查询某只股票的缓存覆盖范围和最后更新时间。
    /// 如果没有缓存记录，返回 None。
    pub fn get_cache_meta(
        &self,
        symbol: &str,
    ) -> Result<Option<CacheMeta>, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare(
            "SELECT symbol, last_updated, start_date, end_date
             FROM cache_meta
             WHERE symbol = ?1",
        )?;
        let mut rows = stmt.query_map(params![symbol], |row| {
            Ok(CacheMeta {
                symbol: row.get(0)?,
                last_updated: row.get(1)?,
                start_date: row.get(2)?,
                end_date: row.get(3)?,
            })
        })?;
        match rows.next() {
            Some(row) => Ok(Some(row?)),
            None => Ok(None),
        }
    }

    /// 更新缓存元信息
    ///
    /// 记录某只股票的缓存日期范围和最后更新时间。
    /// 使用 INSERT OR REPLACE 实现 upsert。
    pub fn update_cache_meta(
        &self,
        meta: &CacheMeta,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.conn.execute(
            "INSERT OR REPLACE INTO cache_meta (symbol, last_updated, start_date, end_date)
             VALUES (?1, ?2, ?3, ?4)",
            params![meta.symbol, meta.last_updated, meta.start_date, meta.end_date],
        )?;
        Ok(())
    }

    // ─── 自选股 ───────────────────────────────────────────────────────────────

    /// 获取自选股列表
    ///
    /// 返回所有自选股，按添加时间降序排列。
    pub fn get_watchlist(&self) -> Result<Vec<StockInfo>, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare(
            "SELECT symbol, name FROM watchlist ORDER BY added_at DESC",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(StockInfo {
                symbol: row.get(0)?,
                name: row.get(1)?,
            })
        })?;
        let mut result = Vec::new();
        for row in rows {
            result.push(row?);
        }
        Ok(result)
    }

    /// 添加自选股
    ///
    /// 向 watchlist 表插入一条记录。如果已存在则忽略（不报错）。
    pub fn add_to_watchlist(
        &self,
        stock: &StockInfo,
    ) -> Result<StockInfo, Box<dyn std::error::Error>> {
        // 使用当前时间作为 added_at
        let now = chrono::Utc::now().to_rfc3339();
        self.conn.execute(
            "INSERT OR IGNORE INTO watchlist (symbol, name, added_at) VALUES (?1, ?2, ?3)",
            params![stock.symbol, stock.name, now],
        )?;
        Ok(StockInfo {
            symbol: stock.symbol.clone(),
            name: stock.name.clone(),
        })
    }

    /// 删除自选股
    ///
    /// 从 watchlist 表删除指定股票代码的记录。
    pub fn remove_from_watchlist(
        &self,
        symbol: &str,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let affected = self.conn.execute(
            "DELETE FROM watchlist WHERE symbol = ?1",
            params![symbol],
        )?;
        Ok(affected > 0)
    }

    // ─── 用户设置 ─────────────────────────────────────────────────────────────

    /// 获取所有用户设置
    ///
    /// 返回 user_settings 表中的所有键值对。
    pub fn get_settings(
        &self,
    ) -> Result<HashMap<String, String>, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare(
            "SELECT key, value FROM user_settings",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?;
        let mut result = HashMap::new();
        for row in rows {
            let (k, v) = row?;
            result.insert(k, v);
        }
        Ok(result)
    }

    /// 更新用户设置
    ///
    /// 批量更新设置，使用 INSERT OR REPLACE 实现 upsert。
    /// 只更新传入的键，不删除未传入的键。
    pub fn update_settings(
        &self,
        settings: &HashMap<String, String>,
    ) -> Result<HashMap<String, String>, Box<dyn std::error::Error>> {
        let tx = self.conn.unchecked_transaction()?;
        {
            let mut stmt = tx.prepare(
                "INSERT OR REPLACE INTO user_settings (key, value) VALUES (?1, ?2)",
            )?;
            for (k, v) in settings {
                stmt.execute(params![k, v])?;
            }
        }
        tx.commit()?;
        // 返回完整的当前设置（含之前已有的键）
        self.get_settings()
    }
}

/// 智能获取 K 线数据（带缓存逻辑）
///
/// 核心缓存策略：
/// 1. 首次请求 → 从网络获取 → 存入 SQLite → 返回数据
/// 2. 重复请求 → 直接从 SQLite 读取 → 不发网络请求
/// 3. 部分覆盖 → 只获取缺失部分 → 合并返回
/// 4. 当日数据 → 重新获取（盘中数据可能变化）
pub async fn get_stock_daily_cached(
    cache: &CacheDb,
    symbol: &str,
    start_date: &str,
    end_date: &str,
) -> Result<Vec<OHLCV>, Box<dyn std::error::Error>> {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    // 检查缓存元信息
    let meta = cache.get_cache_meta(symbol)?;

    match meta {
        None => {
            // 场景1：首次请求 — 从网络获取全部数据
            let data = crate::data::market_data::get_stock_daily(symbol, start_date, end_date).await.map_err(|e| -> Box<dyn std::error::Error> { e })?;
            cache.store_daily_data(symbol, &data)?;
            let now = chrono::Utc::now().to_rfc3339();
            cache.update_cache_meta(&CacheMeta {
                symbol: symbol.to_string(),
                last_updated: now,
                start_date: start_date.to_string(),
                end_date: end_date.to_string(),
            })?;
            Ok(data)
        }
        Some(existing_meta) => {
            let cache_start = existing_meta.start_date.as_str();
            let cache_end = existing_meta.end_date.as_str();

            // 场景4：如果请求范围包含今天，强制刷新当日数据
            let need_today_refresh = end_date >= today.as_str();

            // 场景2：请求范围完全在缓存范围内，且不需要刷新今天的数据
            if start_date >= cache_start && end_date <= cache_end && !need_today_refresh {
                let data = cache.load_daily_data(symbol, start_date, end_date)?;
                return Ok(data);
            }

            // 场景3 & 4：需要从网络获取缺失部分
            // 计算需要从网络获取的日期范围
            let mut fetch_ranges: Vec<(String, String)> = Vec::new();

            // 请求起始在缓存之前 — 获取前段
            if start_date < cache_start {
                fetch_ranges.push((start_date.to_string(), cache_start.to_string()));
            }
            // 请求结束在缓存之后 — 获取后段
            if end_date > cache_end {
                fetch_ranges.push((cache_end.to_string(), end_date.to_string()));
            }
            // 今天的数据需要刷新
            if need_today_refresh && today.as_str() >= start_date && today.as_str() <= end_date {
                fetch_ranges.push((today.clone(), today.clone()));
            }

            // 如果缓存完全不重叠，直接获取全部
            if fetch_ranges.is_empty() {
                fetch_ranges.push((start_date.to_string(), end_date.to_string()));
            }

            // 从网络获取缺失数据
            for (fetch_start, fetch_end) in &fetch_ranges {
                match crate::data::market_data::get_stock_daily(symbol, fetch_start, fetch_end).await {
                    Ok(new_data) => {
                        if !new_data.is_empty() {
                            cache.store_daily_data(symbol, &new_data)?;
                        }
                    }
                    Err(e) => {
                        // 网络失败时，如果有缓存则返回缓存数据作为 fallback
                        tracing::warn!("网络获取失败，尝试使用缓存 fallback: {}", e);
                        let fallback = cache.load_daily_data(symbol, start_date, end_date)?;
                        if !fallback.is_empty() {
                            return Ok(fallback);
                        }
                        return Err(e as Box<dyn std::error::Error>);
                    }
                }
            }

            // 更新缓存元信息 — 扩展覆盖范围
            let new_start = if start_date < cache_start { start_date } else { cache_start };
            let new_end = if end_date > cache_end { end_date } else { cache_end };
            let now = chrono::Utc::now().to_rfc3339();
            cache.update_cache_meta(&CacheMeta {
                symbol: symbol.to_string(),
                last_updated: now,
                start_date: new_start.to_string(),
                end_date: new_end.to_string(),
            })?;

            // 从缓存读取完整范围数据
            let result = cache.load_daily_data(symbol, start_date, end_date)?;
            Ok(result)
        }
    }
}
