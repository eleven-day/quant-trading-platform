import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  DatePicker, 
  Radio, 
  Tabs,
  Statistic, 
  Divider,
  Typography, 
  Space,
  notification
} from 'antd';
import { 
  StockOutlined, 
  LineChartOutlined, 
  FieldTimeOutlined 
} from '@ant-design/icons';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import CandlestickChart from '../components/charts/CandlestickChart';
import DataTable from '../components/data/DataTable';
import SymbolSearchInput from '../components/common/SymbolSearchInput';
import { useStockData } from '../hooks/useStockData';
import useStockStore from '../store/stockStore';
import useAppStore from '../store/appStore';
import { StockHistoricalData, KLineData } from '../types/stock';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const StockAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(3, 'month'),
    dayjs(),
  ]);
  
  const { 
    currentSymbol, 
    setCurrentSymbol,
    period, 
    setPeriod,
    adjust, 
    setAdjust,
    historicalData,
    minuteData
  } = useStockStore();
  
  const { loading, error } = useAppStore();
  const { fetchHistoricalData, fetchMinuteData } = useStockData();

  // 交易日期范围
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > dayjs().endOf('day');
  };

  // 载入历史数据
  useEffect(() => {
    if (currentSymbol && dateRange) {
      fetchHistoricalData(dateRange[0].toDate(), dateRange[1].toDate());
    }
  }, [currentSymbol, dateRange, period, adjust, fetchHistoricalData]);

  // 加载分钟数据
  useEffect(() => {
    if (currentSymbol) {
      fetchMinuteData('5');
    }
  }, [currentSymbol, adjust, fetchMinuteData]);

  // 处理错误提示
  useEffect(() => {
    if (error) {
      notification.error({
        message: '数据加载错误',
        description: error,
      });
    }
  }, [error]);

  // 格式化K线数据
  const formatCandleData = (data: StockHistoricalData[]): KLineData[] => {
    return data.map(item => ({
      time: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  };

  // 格式化分钟K线数据
  const formatMinuteData = (): KLineData[] => {
    return minuteData.map(item => ({
      time: item.datetime,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  };

  // 历史数据表格列定义
  const histColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
    },
    {
      title: '开盘',
      dataIndex: 'open',
      key: 'open',
      width: 90,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: '最高',
      dataIndex: 'high',
      key: 'high',
      width: 90,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: '最低',
      dataIndex: 'low',
      key: 'low',
      width: 90,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: '收盘',
      dataIndex: 'close',
      key: 'close',
      width: 90,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: '涨跌幅',
      dataIndex: 'change_pct',
      key: 'change_pct',
      width: 90,
      render: (val: number) => (val ? `${val.toFixed(2)}%` : '-'),
      sorter: (a: any, b: any) => a.change_pct - b.change_pct,
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
      width: 110,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '成交额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (val: number) => (val / 10000).toFixed(2) + '万',
    },
    {
      title: '换手率',
      dataIndex: 'turnover',
      key: 'turnover',
      width: 90,
      render: (val: number) => (val ? `${val.toFixed(2)}%` : '-'),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>股票行情分析</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Space direction="horizontal" size="large" wrap>
          <SymbolSearchInput
            value={currentSymbol}
            onChange={setCurrentSymbol}
            placeholder="输入股票代码或名称"
            style={{ width: 200 }}
          />
          
          <RangePicker
            value={dateRange}
            onChange={(dates) => 
              dates && setDateRange([dates[0]!, dates[1]!])
            }
            disabledDate={disabledDate}
            allowClear={false}
          />
          
          <Radio.Group 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="daily">日K</Radio.Button>
            <Radio.Button value="weekly">周K</Radio.Button>
            <Radio.Button value="monthly">月K</Radio.Button>
          </Radio.Group>
          
          <Radio.Group 
            value={adjust} 
            onChange={(e) => setAdjust(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="">不复权</Radio.Button>
            <Radio.Button value="qfq">前复权</Radio.Button>
            <Radio.Button value="hfq">后复权</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>
      
      {/* 股票数据展示区 */}
      <Tabs defaultActiveKey="hist">
        <TabPane 
          tab={<span><LineChartOutlined />历史K线</span>} 
          key="hist"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card 
                title={`${currentSymbol} 历史K线`} 
                extra={<Text type="secondary">{period}K · {adjust ? (adjust === 'qfq' ? '前复权' : '后复权') : '不复权'}</Text>}
              >
                <CandlestickChart 
                  data={formatCandleData(historicalData)} 
                  loading={loading}
                  height={450}
                />
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="历史数据明细">
                <DataTable 
                  dataSource={historicalData} 
                  columns={histColumns}
                  loading={loading}
                  rowKey="date"
                  scroll={{ x: 'max-content', y: 400 }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={<span><FieldTimeOutlined />分钟K线</span>} 
          key="minute"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card 
                title={`${currentSymbol} 5分钟K线`} 
                extra={<Text type="secondary">5分钟 · {adjust ? (adjust === 'qfq' ? '前复权' : '后复权') : '不复权'}</Text>}
              >
                <CandlestickChart 
                  data={formatMinuteData()} 
                  loading={loading}
                  height={450}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StockAnalysis;