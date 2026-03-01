'use client';

import React, { useEffect, useState } from 'react';
import { getIndexSnapshot, getStockDaily, searchStocks } from '@/services/api';
import type { IndexSnapshot, OHLCV, StockInfo } from '@/types';
import { IndexSnapshots, ChartArea, Watchlist } from '@/components/dashboard';

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState<StockInfo>({
    symbol: '000001',
    name: '平安银行',
  });
  const [klineData, setKlineData] = useState<OHLCV[]>([]);
  const [indexSnapshots, setIndexSnapshots] = useState<IndexSnapshot[]>([]);
  const [watchlist, setWatchlist] = useState<StockInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Load initial static/global data
  useEffect(() => {
    let mounted = true;

    async function loadGlobalData() {
      try {
        const [snapshots, stocks] = await Promise.all([
          getIndexSnapshot(),
          searchStocks('0'), // Fetch list to get top 6 stocks with '0' in symbol
        ]);
        if (mounted) {
          setIndexSnapshots(snapshots);
          setWatchlist(stocks.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to load global dashboard data', error);
      }
    }

    void loadGlobalData();

    return () => {
      mounted = false;
    };
  }, []);

  // Load kline data when selected stock changes
  useEffect(() => {
    let mounted = true;

    async function loadKlineData() {
      try {
        // Fetch full year of 2024 to get a decent chart
        const data = await getStockDaily(selectedStock.symbol, '2024-01-01', '2024-12-31');
        if (mounted) {
          setKlineData(data);
        }
      } catch (error) {
        console.error('Failed to load kline data', error);
      }
    }

    void loadKlineData();

    return () => {
      mounted = false;
    };
  }, [selectedStock.symbol]);

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-bg-page overflow-hidden">
      <IndexSnapshots snapshots={indexSnapshots} />
      
      <div className="flex flex-row flex-1 min-h-0 gap-4 px-6 pb-6">
        <ChartArea
          stock={selectedStock}
          klineData={klineData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Watchlist
          watchlist={watchlist}
          selectedSymbol={selectedStock.symbol}
          onSelectStock={setSelectedStock}
        />
      </div>
    </div>
  );
}
