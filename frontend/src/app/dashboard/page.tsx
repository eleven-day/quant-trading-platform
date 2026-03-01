'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getIndexSnapshot, getStockDaily, getWatchlist } from '@/services/api';
import type { IndexSnapshot, OHLCV, StockInfo } from '@/types';
import { IndexSnapshots, ChartArea, Watchlist, StockSearch } from '@/components/dashboard';
import { EmptyState, SkeletonCard, SkeletonRect, useToast } from '@/components/common';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '请求失败，请稍后重试';
}

/**
 * 将日线 OHLCV 按周/月聚合
 * - daily：原样返回
 * - weekly：按 ISO 周一分组
 * - monthly：按年月分组
 */
function aggregateOHLCV(data: OHLCV[], period: 'daily' | 'weekly' | 'monthly'): OHLCV[] {
  if (period === 'daily') return data;

  const groups: Record<string, OHLCV[]> = {};

  for (const item of data) {
    let key = '';
    if (period === 'weekly') {
      const [y, m, d] = item.date.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const year = monday.getFullYear();
      const month = String(monday.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(monday.getDate()).padStart(2, '0');
      key = `${String(year)}-${month}-${dayOfMonth}`;
    } else {
      key = item.date.substring(0, 7); // YYYY-MM
    }

    const existing = groups[key] as OHLCV[] | undefined;
    if (!existing) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  return Object.values(groups).map(group => {
    group.sort((a, b) => a.date.localeCompare(b.date));

    const first = group[0];
    const last = group[group.length - 1];

    const high = Math.max(...group.map(i => i.high));
    const low = Math.min(...group.map(i => i.low));
    const volume = group.reduce((sum, i) => sum + i.volume, 0);

    return {
      date: last.date,
      open: first.open,
      close: last.close,
      high,
      low,
      volume
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const [selectedStock, setSelectedStock] = useState<StockInfo>({
    symbol: '000001',
    name: '平安银行',
  });
  const [klineData, setKlineData] = useState<OHLCV[]>([]);
  const [indexSnapshots, setIndexSnapshots] = useState<IndexSnapshot[]>([]);
  const [watchlist, setWatchlist] = useState<StockInfo[]>([]);
  const [watchlistPrices, setWatchlistPrices] = useState<Record<string, { price: number; changePct: number }>>({});
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState<boolean>(true);

  // 加载全局数据：指数快照、自选股列表、默认股票K线
  useEffect(() => {
    let mounted = true;

    async function loadGlobalData() {
      try {
        const [snapshots, stocks, data] = await Promise.all([
          getIndexSnapshot(),
          getWatchlist(),
          getStockDaily('000001', '2024-01-01', '2024-12-31'),
        ]);

        // 批量获取自选股最近30天数据，计算最新价和涨跌幅
        const prices: Record<string, { price: number; changePct: number }> = {};
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        await Promise.all(stocks.map(async (stock) => {
          try {
            const daily = await getStockDaily(stock.symbol, startStr, endStr);
            if (daily.length > 0) {
              const last = daily[daily.length - 1];
              let changePct = 0;
              if (daily.length >= 2) {
                const prev = daily[daily.length - 2];
                changePct = (last.close - prev.close) / prev.close;
              }
              prices[stock.symbol] = { price: last.close, changePct };
            }
          } catch (err) {
            console.error(`Failed to fetch price for ${stock.symbol}`, err);
          }
        }));

        if (mounted) {
          setIndexSnapshots(snapshots);
          setWatchlist(stocks);
          setWatchlistPrices(prices);
          setKlineData(data);
        }
      } catch (error) {
        if (mounted) {
          showToast({
            type: 'error',
            message: getErrorMessage(error),
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadGlobalData();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  // 切换股票或K线周期时重新加载日线数据
  useEffect(() => {
    if (loading) {
      return;
    }

    let mounted = true;

    async function loadKlineData() {
      try {
        const data = await getStockDaily(selectedStock.symbol, '2024-01-01', '2024-12-31');
        if (mounted) {
          setKlineData(data);
        }
      } catch (error) {
        if (mounted) {
          showToast({
            type: 'error',
            message: getErrorMessage(error),
          });
        }
      }
    }

    void loadKlineData();

    return () => {
      mounted = false;
    };
  }, [loading, selectedStock.symbol, showToast, activeTab]);

  // 根据 activeTab 聚合K线数据
  const aggregatedData = useMemo(() => {
    return aggregateOHLCV(klineData, activeTab);
  }, [klineData, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full min-h-0 bg-bg-page overflow-hidden">
        <div className="flex flex-row gap-4 px-6 py-4 w-full">
          <SkeletonCard className="flex-1" />
          <SkeletonCard className="flex-1" />
          <SkeletonCard className="flex-1" />
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4 px-6 pb-6 overflow-y-auto lg:overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0 w-full gap-3">
            <SkeletonRect width="45%" height={30} />
            <SkeletonRect width="100%" height="100%" className="flex-1 min-h-0" roundedClassName="rounded-[var(--radius-card)]" />
          </div>
          <SkeletonRect width="100%" height="100%" className="w-full lg:w-[360px] h-64 lg:h-full shrink-0" roundedClassName="rounded-[var(--radius-card)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-bg-page overflow-hidden">
      <IndexSnapshots snapshots={indexSnapshots} />
      <div className="px-6">
        <StockSearch onSelectStock={setSelectedStock} />
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4 px-6 pb-6 overflow-y-auto lg:overflow-hidden">
        <ChartArea
          stock={selectedStock}
          klineData={aggregatedData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {watchlist.length === 0 ? (
          <div className="w-full lg:w-[360px] shrink-0">
            <EmptyState title="暂无自选股" description="请稍后重试或添加关注股票" />
          </div>
        ) : (
          <Watchlist
            watchlist={watchlist}
            selectedSymbol={selectedStock.symbol}
            onSelectStock={setSelectedStock}
            prices={watchlistPrices}
          />
        )}
      </div>
    </div>
  );
}
