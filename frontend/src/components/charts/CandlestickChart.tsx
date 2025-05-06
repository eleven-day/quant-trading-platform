import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Empty, Spin } from 'antd';
import { KLineData } from '../../types/stock';

interface CandlestickChartProps {
  data: KLineData[];
  loading?: boolean;
  height?: number;
  width?: string;
  onCrosshairMove?: (price: number, time: string) => void;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  loading = false,
  height = 400,
  width = '100%',
  onCrosshairMove,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // 创建图表
  useEffect(() => {
    if (chartContainerRef.current) {
      // 销毁旧图表
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // 创建新图表
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        timeScale: {
          borderColor: '#dcdcdc',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#999',
            width: 1,
            style: 1,
          },
          horzLine: {
            color: '#999',
            width: 1,
            style: 1,
          },
        },
      });

      // 创建K线系列
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#ff525e',
        downColor: '#08b86d',
        borderVisible: false,
        wickUpColor: '#ff525e',
        wickDownColor: '#08b86d',
      });

      // 创建柱形图系列（成交量）
      const volumeSeries = chart.addHistogramSeries({
        color: '#1E90FF',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // 设置十字光标移动事件
      chart.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > chartContainerRef.current!.clientWidth ||
          param.point.y < 0 ||
          param.point.y > height
        ) {
          return;
        }

        // 获取当前价格和时间
        const candlestickData = param.seriesData.get(candleSeries) as CandlestickData;
        if (candlestickData && onCrosshairMove) {
          onCrosshairMove(
            candlestickData.close,
            typeof param.time === 'number'
              ? new Date(param.time * 1000).toLocaleString()
              : String(param.time)
          );
        }
      });

      // 响应窗口调整大小
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // 保存引用
      chartRef.current = chart;
      candlestickSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [height, onCrosshairMove]);

  // 更新数据
  useEffect(() => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current && data.length > 0) {
      // 准备K线数据
      const candleData = data.map(item => ({
        time: typeof item.time === 'string' ? new Date(item.time).getTime() / 1000 : item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      // 准备成交量数据
      const volumeData = data.map(item => ({
        time: typeof item.time === 'string' ? new Date(item.time).getTime() / 1000 : item.time,
        value: item.volume || 0,
        color: item.close >= item.open ? 'rgba(255, 82, 94, 0.5)' : 'rgba(8, 184, 109, 0.5)',
      }));

      // 设置数据
      candlestickSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);

      // 调整可视范围
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

  if (loading) {
    return (
      <div style={{ height, width, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin tip="数据加载中..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height, width, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Empty description="暂无数据" />
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} style={{ height, width }} />
  );
};

export default CandlestickChart;