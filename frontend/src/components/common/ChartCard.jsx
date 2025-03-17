import React from 'react';
import { Card, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';

const ChartCard = ({ title, loading, option, style = {}, height = '300px' }) => {
  return (
    <Card
      title={title}
      className="dashboard-card"
      style={style}
    >
      <Spin spinning={loading}>
        <div style={{ height: height }}>
          {option && <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />}
        </div>
      </Spin>
    </Card>
  );
};

export default ChartCard;