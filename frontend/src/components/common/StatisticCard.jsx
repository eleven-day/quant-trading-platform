import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatisticCard = ({ title, value, precision = 2, prefix, suffix, increase, comparison, loading = false }) => {
  // 计算涨跌样式
  const getValueStyle = () => {
    if (increase === undefined || increase === null) return {};
    return {
      color: increase >= 0 ? '#3f8600' : '#cf1322'
    };
  };

  // 生成涨跌图标
  const getValueIcon = () => {
    if (increase === undefined || increase === null) return null;
    return increase >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  return (
    <Card className="dashboard-card" loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
        valueStyle={getValueStyle()}
      />
      {(increase !== undefined && increase !== null) && (
        <div style={{ fontSize: '12px', marginTop: '5px', color: getValueStyle().color }}>
          {getValueIcon()} {Math.abs(increase).toFixed(2)}% {comparison || ''}
        </div>
      )}
    </Card>
  );
};

export default StatisticCard;