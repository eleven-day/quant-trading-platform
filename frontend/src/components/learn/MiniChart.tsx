'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, Time } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import { mockKlineData } from '@/mocks/kline-data';
import type { OHLCV } from '@/types';

function calculateMA(period: number, data: OHLCV[]): { time: Time; value: number }[] {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].date as Time, value: sum / period });
  }
  return result;
}

export function MiniChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0F1C' },
        textColor: '#64748B',
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      timeScale: {
        borderColor: '#1E293B',
      },
      rightPriceScale: {
        borderColor: '#1E293B',
      },
      crosshair: {
        mode: 0,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#EF4444',
      downColor: '#22C55E',
      borderUpColor: '#EF4444',
      borderDownColor: '#22C55E',
      wickUpColor: '#EF4444',
      wickDownColor: '#22C55E',
    });

    const ma5Series = chart.addSeries(LineSeries, {
      color: '#EF4444',
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });

    const ma20Series = chart.addSeries(LineSeries, {
      color: '#22D3EE',
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });

    const chartData = mockKlineData.map(d => ({
      time: d.date as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(chartData);

    const ma5Data = calculateMA(5, mockKlineData);
    const ma20Data = calculateMA(20, mockKlineData);

    ma5Series.setData(ma5Data);
    ma20Series.setData(ma20Data);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div className="flex-1 bg-bg-inset rounded-[8px] overflow-hidden min-h-[300px]" ref={chartContainerRef} />
  );
}
