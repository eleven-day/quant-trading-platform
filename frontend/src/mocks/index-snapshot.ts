import type { IndexSnapshot } from '@/types';

// 指数快照数据
export const mockIndexSnapshots: IndexSnapshot[] = [
  { symbol: '000001', name: '上证指数', points: 3150.25, change: 0.82 },
  { symbol: '399001', name: '深证成指', points: 10280.45, change: 1.15 },
  { symbol: '399006', name: '创业板指', points: 2035.12, change: 1.58 }
];
