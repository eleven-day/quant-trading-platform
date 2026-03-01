import type {
  StockInfo,
  OHLCV,
  IndexSnapshot,
  BacktestParams,
  BacktestResult,
  StrategyInfo,
  StrategyLearnDetail
} from '@/types';

// 阶段六实现前，策略学习仍使用 mock 数据
import { mockLearnStrategies } from '@/mocks/learn-data';

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

// ─── 数据获取（真实 API）──────────────────────────────────────────────────

export async function searchStocks(keyword: string): Promise<StockInfo[]> {
  if (!keyword) return [];
  return apiFetch<StockInfo[]>(`/api/stocks/search?q=${encodeURIComponent(keyword)}`);
}

export async function getStockDaily(
  symbol: string,
  start: string,
  end: string
): Promise<OHLCV[]> {
  return apiFetch<OHLCV[]>(
    `/api/stocks/${encodeURIComponent(symbol)}/daily?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );
}

export async function getIndexSnapshot(): Promise<IndexSnapshot[]> {
  return apiFetch<IndexSnapshot[]>('/api/index/snapshot');
}

// ─── 回测 & 策略（真实 API）─────────────────────────────────────────────

export async function runBacktest(
  params: BacktestParams
): Promise<BacktestResult> {
  return apiFetch<BacktestResult>('/api/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function getStrategies(): Promise<StrategyInfo[]> {
  return apiFetch<StrategyInfo[]>('/api/strategies');
}

export async function getStrategyLearnList(): Promise<StrategyLearnDetail[]> {
  // TODO: 阶段六实现后替换为真实 API 调用
  // return apiFetch<StrategyLearnDetail[]>('/api/strategies/learn');
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockLearnStrategies;
}

// ─── 自选股（阶段五）─────────────────────────────────────────────────

export async function getWatchlist(): Promise<StockInfo[]> {
  return apiFetch<StockInfo[]>('/api/watchlist');
}

export async function addToWatchlist(stock: StockInfo): Promise<StockInfo> {
  return apiFetch<StockInfo>('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stock),
  });
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/watchlist/${encodeURIComponent(symbol)}`, {
    method: 'DELETE',
  });
}

// ─── 用户设置（阶段五）─────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  return apiFetch<Record<string, string>>('/api/settings');
}

export async function updateSettings(
  settings: Record<string, string>
): Promise<Record<string, string>> {
  return apiFetch<Record<string, string>>('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
