import type {
  StockInfo,
  OHLCV,
  IndexSnapshot,
  BacktestParams,
  BacktestResult,
  StrategyInfo,
  StrategyLearnDetail
} from '@/types';


// ─── 环境检测 ──────────────────────────────────────────────────────────────

/**
 * 检测是否运行在 Tauri 桌面应用中
 *
 * Tauri v2 注入 window.__TAURI_INTERNALS__ 供前端识别运行环境。
 * 浏览器模式下回退到 HTTP API。
 */
function isTauri(): boolean {
  return typeof window !== 'undefined' &&
    '__TAURI_INTERNALS__' in window;
}

/**
 * Tauri IPC 调用封装
 *
 * 动态导入 @tauri-apps/api，避免在浏览器环境下加载 Tauri 模块。
 * 参数名必须与 Rust #[tauri::command] 函数的参数名完全一致。
 */
async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

// ─── HTTP API 回退 ──────────────────────────────────────────────────────────

// 后端 API 基地址（Rust axum 服务运行在 3001 端口）
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001';

/**
 * 统一 fetch 封装，处理错误和 JSON 解析
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    // 尝试读取后端返回的 ApiError 结构
    const body = await res.json().catch(() => null) as { error?: string; code?: string } | null;
    const msg = body?.error ?? `请求失败: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── 数据获取（双模式：Tauri IPC / HTTP）──────────────────────────────────

export async function searchStocks(keyword: string): Promise<StockInfo[]> {
  if (!keyword) return [];
  if (isTauri()) {
    return tauriInvoke<StockInfo[]>('search_stocks', { keyword });
  }
  return apiFetch<StockInfo[]>(`/api/stocks/search?q=${encodeURIComponent(keyword)}`);
}

export async function getStockDaily(
  symbol: string,
  start: string,
  end: string
): Promise<OHLCV[]> {
  if (isTauri()) {
    return tauriInvoke<OHLCV[]>('get_stock_daily', { symbol, start, end });
  }
  return apiFetch<OHLCV[]>(
    `/api/stocks/${encodeURIComponent(symbol)}/daily?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );
}

export async function getIndexSnapshot(): Promise<IndexSnapshot[]> {
  if (isTauri()) {
    return tauriInvoke<IndexSnapshot[]>('get_index_snapshot');
  }
  return apiFetch<IndexSnapshot[]>('/api/index/snapshot');
}

// ─── 回测 & 策略（双模式）─────────────────────────────────────────────────

export async function runBacktest(
  params: BacktestParams
): Promise<BacktestResult> {
  if (isTauri()) {
    return tauriInvoke<BacktestResult>('run_backtest', { params });
  }
  return apiFetch<BacktestResult>('/api/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function getStrategies(): Promise<StrategyInfo[]> {
  if (isTauri()) {
    return tauriInvoke<StrategyInfo[]>('get_strategies');
  }
  return apiFetch<StrategyInfo[]>('/api/strategies');
}

export async function getStrategyLearnList(): Promise<StrategyLearnDetail[]> {
  if (isTauri()) {
    return tauriInvoke<StrategyLearnDetail[]>('get_strategy_learn_list');
  }
  return apiFetch<StrategyLearnDetail[]>('/api/strategies/learn');
}

// ─── 自选股（双模式）─────────────────────────────────────────────────────

export async function getWatchlist(): Promise<StockInfo[]> {
  if (isTauri()) {
    return tauriInvoke<StockInfo[]>('get_watchlist');
  }
  return apiFetch<StockInfo[]>('/api/watchlist');
}

export async function addToWatchlist(stock: StockInfo): Promise<StockInfo> {
  if (isTauri()) {
    return tauriInvoke<StockInfo>('add_to_watchlist', { stock });
  }
  return apiFetch<StockInfo>('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stock),
  });
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean }> {
  if (isTauri()) {
    return tauriInvoke<{ success: boolean }>('remove_from_watchlist', { symbol });
  }
  return apiFetch<{ success: boolean }>(`/api/watchlist/${encodeURIComponent(symbol)}`, {
    method: 'DELETE',
  });
}

// ─── 用户设置（双模式）─────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  if (isTauri()) {
    return tauriInvoke<Record<string, string>>('get_settings');
  }
  return apiFetch<Record<string, string>>('/api/settings');
}

export async function updateSettings(
  settings: Record<string, string>
): Promise<Record<string, string>> {
  if (isTauri()) {
    return tauriInvoke<Record<string, string>>('update_settings', { settings });
  }
  return apiFetch<Record<string, string>>('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
