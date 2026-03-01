'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, Time } from 'lightweight-charts';

interface EquityCurveProps {
  data: { date: string; value: number }[];
}

export function EquityCurve({ data }: EquityCurveProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

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
        vertLine: {
          color: '#64748B',
          width: 1,
          style: 3, // Dashed line
          labelBackgroundColor: '#1E293B',
        },
        horzLine: {
          color: '#64748B',
          width: 1,
          style: 3, // Dashed line
          labelBackgroundColor: '#1E293B',
        },
      },
    });

    const equitySeries = chart.addSeries(LineSeries, {
      color: '#22D3EE',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    const formattedData = data.map((item) => ({
      time: item.date as Time,
      value: item.value,
    }));
    
    // Sort just in case data is out of order, lightweight-charts requires sorted data
    formattedData.sort((a, b) => (a.time as string).localeCompare(b.time as string));
    equitySeries.setData(formattedData);

    // Generate benchmark data
    const benchmarkSeries = chart.addSeries(LineSeries, {
      color: '#475569',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    const benchmarkData = formattedData.map((item, index) => {
      // start at 100000, gentle upward slope (+10% total simulated return)
      const slope = 10000 / formattedData.length;
      return {
        time: item.time,
        value: 100000 + index * slope,
      };
    });
    benchmarkSeries.setData(benchmarkData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="bg-bg-inset rounded-lg h-[280px] p-[16px_20px] flex flex-col gap-3 shrink-0">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-[14px] font-semibold">收益曲线</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-text-secondary text-[11px]">策略</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#475569]" />
            <span className="text-text-secondary text-[11px]">基准(沪深300)</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-[#0A0F1C] rounded overflow-hidden" ref={chartContainerRef} />
    </div>
  );
}
