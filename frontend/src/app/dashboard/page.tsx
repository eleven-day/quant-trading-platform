'use client';

import React, { useEffect, useState } from 'react';
import { getIndexSnapshot, getStockDaily, searchStocks } from '@/services/api';
import type { IndexSnapshot, OHLCV, StockInfo } from '@/types';
import { IndexSnapshots, ChartArea, Watchlist } from '@/components/dashboard';
import { EmptyState, SkeletonCard, SkeletonRect, useToast } from '@/components/common';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '请求失败，请稍后重试';
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
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial static/global data
  useEffect(() => {
    let mounted = true;

    async function loadGlobalData() {
      try {
        const [snapshots, stocks, data] = await Promise.all([
          getIndexSnapshot(),
          searchStocks('0'), // Fetch list to get top 6 stocks with '0' in symbol
          getStockDaily('000001', '2024-01-01', '2024-12-31'),
        ]);
        if (mounted) {
          setIndexSnapshots(snapshots);
          setWatchlist(stocks.slice(0, 6));
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

  // Load kline data when selected stock changes
  useEffect(() => {
    if (loading) {
      return;
    }

    let mounted = true;

    async function loadKlineData() {
      try {
        // Fetch full year of 2024 to get a decent chart
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
  }, [loading, selectedStock.symbol, showToast]);

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
      
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4 px-6 pb-6 overflow-y-auto lg:overflow-hidden">
        <ChartArea
          stock={selectedStock}
          klineData={klineData}
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
          />
        )}
      </div>
    </div>
  );
}
