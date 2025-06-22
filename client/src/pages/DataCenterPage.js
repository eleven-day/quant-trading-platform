import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Typography, message, Tabs } from 'antd';
import { StockOutlined, BarChartOutlined, TableOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Card from '../components/atoms/Card';
import Loading from '../components/atoms/Loading';
import DataFilter from '../components/molecules/DataFilter';
import Chart from '../components/molecules/Chart';
import { dataService } from '../services';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const DataTable = styled.div`
  .data-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &.header {
      background: #fafafa;
      font-weight: 600;
      color: #262626;
      border-bottom: 2px solid #1890ff;
    }
  }
  
  .data-cell {
    text-align: center;
    
    &.number {
      color: #1890ff;
      font-weight: 500;
    }
    
    &.positive {
      color: #52c41a;
    }
    
    &.negative {
      color: #ff4d4f;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 4px;
  }
  
  .stat-label {
    color: #666;
    font-size: 14px;
  }
  
  .stat-change {
    font-size: 12px;
    margin-top: 4px;
    
    &.positive {
      color: #52c41a;
    }
    
    &.negative {
      color: #ff4d4f;
    }
  }
`;

const DataCenterPage = () => {
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [realtimeData, setRealtimeData] = useState([]);
  const [currentSymbol, setCurrentSymbol] = useState('000001');
  const [currentPeriod, setCurrentPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [stats, setStats] = useState({});

  const loadMarketData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].format('YYYYMMDD');
      const endDate = dateRange[1].format('YYYYMMDD');
      
      const response = await dataService.getStockHistory(currentSymbol, {
        period: currentPeriod,
        start_date: startDate,
        end_date: endDate
      });
      
      if (response.data) {
        setMarketData(response.data);
        calculateStats(response.data);
      } else if (response.error) {
        message.error('获取数据失败：' + response.error);
      }
    } catch (error) {
      message.error('获取市场数据失败：' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentSymbol, currentPeriod, dateRange]);

  const loadRealtimeData = useCallback(async () => {
    try {
      const response = await dataService.getStockRealtime([currentSymbol]);
      if (response.data) {
        setRealtimeData(response.data);
      }
    } catch (error) {
      console.error('获取实时数据失败：', error);
    }
  }, [currentSymbol]);

  useEffect(() => {
    loadMarketData();
    loadRealtimeData();
  }, [loadMarketData, loadRealtimeData]);

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        maxPrice: 0,
        minPrice: 0,
        avgVolume: 0,
        totalDays: 0
      });
      return;
    }
    
    const prices = data.map(item => item.close).filter(price => price != null);
    const volumes = data.map(item => item.volume).filter(vol => vol != null);
    
    if (prices.length === 0) {
      setStats({
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        maxPrice: 0,
        minPrice: 0,
        avgVolume: 0,
        totalDays: data.length
      });
      return;
    }
    
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices.length > 1 ? prices[prices.length - 2] : currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
    
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const avgVolume = volumes.length > 0 ? volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length : 0;
    
    setStats({
      currentPrice,
      change,
      changePercent,
      maxPrice,
      minPrice,
      avgVolume,
      totalDays: data.length
    });
  };

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toFixed(decimals);
  };

  const formatVolume = (volume) => {
    if (!volume || isNaN(volume)) return '0';
    if (volume > 100000000) {
      return (volume / 100000000).toFixed(2) + '亿';
    } else if (volume > 10000) {
      return (volume / 10000).toFixed(2) + '万';
    }
    return volume.toString();
  };

  const chartLines = [
    { key: 'open', name: '开盘价', color: '#1890ff' },
    { key: 'high', name: '最高价', color: '#52c41a' },
    { key: 'low', name: '最低价', color: '#ff4d4f' },
    { key: 'close', name: '收盘价', color: '#fa8c16' }
  ];

  return (
    <PageContainer>
      <Title level={2}>
        <StockOutlined /> 数据中心
      </Title>
      
      <DataFilter
        symbol={currentSymbol}
        period={currentPeriod}
        dateRange={dateRange}
        onSymbolChange={setCurrentSymbol}
        onPeriodChange={setCurrentPeriod}
        onDateRangeChange={setDateRange}
        onRefresh={loadMarketData}
      />

      <StatsGrid>
        <StatCard>
          <div className="stat-value">{formatNumber(stats.currentPrice)}</div>
          <div className="stat-label">当前价格</div>
          <div className={`stat-change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
            {stats.change >= 0 ? '+' : ''}{formatNumber(stats.change)} ({formatNumber(stats.changePercent)}%)
          </div>
        </StatCard>
        
        <StatCard>
          <div className="stat-value">{formatNumber(stats.maxPrice)}</div>
          <div className="stat-label">最高价</div>
        </StatCard>
        
        <StatCard>
          <div className="stat-value">{formatNumber(stats.minPrice)}</div>
          <div className="stat-label">最低价</div>
        </StatCard>
        
        <StatCard>
          <div className="stat-value">{formatVolume(stats.avgVolume)}</div>
          <div className="stat-label">平均成交量</div>
        </StatCard>
      </StatsGrid>

      <Tabs defaultActiveKey="chart" type="card">
        <TabPane tab={<span><BarChartOutlined />价格走势</span>} key="chart">
          <Card title="价格走势图">
            {loading ? (
              <Loading />
            ) : (
              <Chart
                data={marketData}
                title={`${currentSymbol} - ${currentPeriod}`}
                type="line"
                height={400}
                xAxisKey="date"
                lines={chartLines}
              />
            )}
          </Card>
        </TabPane>
        
        <TabPane tab={<span><TableOutlined />数据表格</span>} key="table">
          <Card title="历史数据">
            {loading ? (
              <Loading />
            ) : (
              <DataTable>
                <div className="data-row header">
                  <div className="data-cell">日期</div>
                  <div className="data-cell">开盘价</div>
                  <div className="data-cell">收盘价</div>
                  <div className="data-cell">最高价</div>
                  <div className="data-cell">最低价</div>
                  <div className="data-cell">成交量</div>
                  <div className="data-cell">涨跌幅</div>
                </div>
                
                {marketData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    暂无数据
                  </div>
                ) : (
                  marketData.slice(0, 50).map((item, index) => (
                    <div key={index} className="data-row">
                      <div className="data-cell">
                        {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                      </div>
                      <div className="data-cell number">{formatNumber(item.open)}</div>
                      <div className="data-cell number">{formatNumber(item.close)}</div>
                      <div className="data-cell number">{formatNumber(item.high)}</div>
                      <div className="data-cell number">{formatNumber(item.low)}</div>
                      <div className="data-cell">{formatVolume(item.volume)}</div>
                      <div className={`data-cell ${item.pct_change >= 0 ? 'positive' : 'negative'}`}>
                        {formatNumber(item.pct_change)}%
                      </div>
                    </div>
                  ))
                )}
              </DataTable>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default DataCenterPage;
