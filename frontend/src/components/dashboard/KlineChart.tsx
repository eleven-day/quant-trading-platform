'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, Time } from 'lightweight-charts';
import type { OHLCV } from '@/types';

interface KlineChartProps {
  data: OHLCV[];
}

export function KlineChart({ data }: KlineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const container = containerRef.current;

    // 格式化 K 线数据
    const klineData = data.map((d) => ({
      time: d.date as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData = data.map((d) => ({
      time: d.date as Time,
      value: d.volume,
      color: d.close >= d.open ? '#EF4444' : '#22C55E', // 红涨绿跌
    }));

    // 通用图表配置
    const commonOptions = {
      layout: {
        background: { type: ColorType.Solid, color: '#0F172A' },
        textColor: '#64748B',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
      },
    };

    // 计算容器高度，K线占 75%，成交量占 25%
    const totalHeight = container.clientHeight;
    const klineHeight = Math.round(totalHeight * 0.75);
    const volumeHeight = totalHeight - klineHeight;

    // 创建 K 线容器和成交量容器
    const klineDiv = document.createElement('div');
    klineDiv.style.width = '100%';
    klineDiv.style.height = `${klineHeight}px`;
    container.appendChild(klineDiv);

    const volumeDiv = document.createElement('div');
    volumeDiv.style.width = '100%';
    volumeDiv.style.height = `${volumeHeight}px`;
    container.appendChild(volumeDiv);

    // 1. K 线图
    const klineChart = createChart(klineDiv, {
      ...commonOptions,
      height: klineHeight,
      width: container.clientWidth,
      rightPriceScale: {
        borderColor: '#1E293B',
      },
      timeScale: {
        ...commonOptions.timeScale,
        visible: false, // 时间轴只在成交量图上显示
      },
    });

    const candlestickSeries = klineChart.addSeries(CandlestickSeries, {
      upColor: '#EF4444',
      downColor: '#22C55E',
      borderVisible: false,
      wickUpColor: '#EF4444',
      wickDownColor: '#22C55E',
    });

    candlestickSeries.setData(klineData);

    // 2. 成交量图
    const volumeChart = createChart(volumeDiv, {
      ...commonOptions,
      height: volumeHeight,
      width: container.clientWidth,
      rightPriceScale: {
        borderColor: '#1E293B',
        scaleMargins: {
          top: 0.1,
          bottom: 0,
        },
      },
    });

    const volumeSeries = volumeChart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.setData(volumeData);

    // 同步两个图表的可见范围（滚动/缩放联动）
    const timeScale1 = klineChart.timeScale();
    const timeScale2 = volumeChart.timeScale();

    timeScale1.subscribeVisibleLogicalRangeChange((range) => {
      if (range) {
        timeScale2.setVisibleLogicalRange(range);
      }
    });

    timeScale2.subscribeVisibleLogicalRangeChange((range) => {
      if (range) {
        timeScale1.setVisibleLogicalRange(range);
      }
    });

    // 响应窗口大小变化
    const handleResize = () => {
      const newTotal = container.clientHeight;
      const newKline = Math.round(newTotal * 0.75);
      const newVolume = newTotal - newKline;
      const newWidth = container.clientWidth;

      klineDiv.style.height = `${newKline}px`;
      volumeDiv.style.height = `${newVolume}px`;

      klineChart.applyOptions({ width: newWidth, height: newKline });
      volumeChart.applyOptions({ width: newWidth, height: newVolume });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      klineChart.remove();
      volumeChart.remove();
      // 清理动态创建的 DOM 元素
      container.innerHTML = '';
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 min-h-0 rounded-[var(--radius-card)] overflow-hidden"
    />
  );
}
