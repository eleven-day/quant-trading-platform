import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { Select, Button } from 'antd';
import { FullscreenOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Option } = Select;

const ChartContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const ChartTitle = styled.h3`
  margin: 0;
  color: #262626;
  font-size: 16px;
  font-weight: 600;
`;

const ChartToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`日期: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Chart = ({
  data = [],
  title = '图表',
  type = 'line',
  height = 300,
  xAxisKey = 'date',
  lines = [],
  bars = [],
  areas = [],
  showToolbar = true,
  onFullscreen,
  onDownload
}) => {
  const formatXAxisTick = (tickItem) => {
    if (typeof tickItem === 'string' && tickItem.includes('-')) {
      return tickItem.split(' ')[0]; // 只显示日期部分
    }
    return tickItem;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                strokeWidth={2}
                dot={false}
                name={line.name || line.key}
              />
            ))}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.key}
                fill={bar.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                name={bar.name || bar.key}
              />
            ))}
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {areas.map((area, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={area.key}
                stroke={area.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                fill={area.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                fillOpacity={0.3}
                name={area.name || area.key}
              />
            ))}
          </AreaChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        {showToolbar && (
          <ChartToolbar>
            <Select defaultValue={type} size="small" style={{ width: 80 }}>
              <Option value="line">折线图</Option>
              <Option value="bar">柱状图</Option>
              <Option value="area">面积图</Option>
            </Select>
            <Button 
              size="small" 
              icon={<FullscreenOutlined />} 
              onClick={onFullscreen}
              title="全屏"
            />
            <Button 
              size="small" 
              icon={<DownloadOutlined />} 
              onClick={onDownload}
              title="下载"
            />
          </ChartToolbar>
        )}
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default Chart;
