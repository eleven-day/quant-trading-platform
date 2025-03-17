import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Select, DatePicker, Button, Table, Alert } from 'antd';
import { SearchOutlined, AreaChartOutlined, FileExcelOutlined } from '@ant-design/icons';
import ChartCard from '../components/common/ChartCard';
import TermTooltip from '../components/common/TermTooltip';
import { fetchStocks, fetchStockHistory } from '../utils/api';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const StockData = () => {
  const [form] = Form.useForm();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [searchDone, setSearchDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockList = async () => {
      try {
        setLoading(true);
        const data = await fetchStocks();
        setStocks(data);
        setError(null);
      } catch (err) {
        console.error('获取股票列表失败:', err);
        setError('加载股票列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchStockList();
  }, []);

  const handleSearch = async (values) => {
    try {
      setLoading(true);
      setSearchDone(false);
      
      const dateRange = values.dateRange || [];
      const startDate = dateRange[0] ? dateRange[0].format('YYYYMMDD') : '';
      const endDate = dateRange[1] ? dateRange[1].format('YYYYMMDD') : '';
      
      const data = await fetchStockHistory(values.stock, startDate, endDate);
      setStockData(data);
      setSearchDone(true);
      setError(null);
    } catch (err) {
      console.error('获取股票数据失败:', err);
      setError('获取股票数据失败，请稍后再试');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  // 图表配置
  const getStockChartOption = () => {
    if (!stockData || !stockData.history || stockData.history.length === 0) return null;
    
    const dates = stockData.history.map(item => item.trade_date);
    const closes = stockData.history.map(item => item.close);
    const volumes = stockData.history.map(item => item.vol);
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['收盘价', '成交量']
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          top: '8%',
          height: '60%',
          containLabel: true
        },
        {
          left: '3%',
          right: '3%',
          top: '75%',
          height: '15%',
          containLabel: true
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          gridIndex: 0,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          axisPointer: { show: true }
        },
        {
          type: 'category',
          data: dates,
          gridIndex: 1,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          axisPointer: { show: true }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '价格',
          scale: true,
          gridIndex: 0,
          splitLine: {
            show: true,
            lineStyle: { color: '#f3f3f3' }
          }
        },
        {
          type: 'value',
          name: '成交量',
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: {
            formatter: function (value) {
              return value / 10000 + 'w';
            }
          },
          splitLine: {
            show: true,
            lineStyle: { color: '#f3f3f3' }
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: '0%',
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: '收盘价',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: closes,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2 }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes
        }
      ]
    };
  };

  // 表格列配置
  const columns = [
    {
      title: '交易日期',
      dataIndex: 'trade_date',
      key: 'trade_date',
      sorter: (a, b) => a.trade_date.localeCompare(b.trade_date),
    },
    {
      title: '开盘价',
      dataIndex: 'open',
      key: 'open',
      render: text => text.toFixed(2),
      sorter: (a, b) => a.open - b.open,
    },
    {
      title: '最高价',
      dataIndex: 'high',
      key: 'high',
      render: text => text.toFixed(2),
      sorter: (a, b) => a.high - b.high,
    },
    {
      title: '最低价',
      dataIndex: 'low',
      key: 'low',
      render: text => text.toFixed(2),
      sorter: (a, b) => a.low - b.low,
    },
    {
      title: '收盘价',
      dataIndex: 'close',
      key: 'close',
      render: text => text.toFixed(2),
      sorter: (a, b) => a.close - b.close,
    },
    {
      title: <TermTooltip term="涨跌幅">涨跌幅(%)</TermTooltip>,
      dataIndex: 'pct_chg',
      key: 'pct_chg',
      render: text => (
        <span style={{ color: text >= 0 ? '#3f8600' : '#cf1322' }}>
          {text >= 0 ? '+' : ''}{text.toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => a.pct_chg - b.pct_chg,
    },
    {
      title: <TermTooltip term="成交量">成交量(手)</TermTooltip>,
      dataIndex: 'vol',
      key: 'vol',
      render: text => (text / 100).toFixed(0),
      sorter: (a, b) => a.vol - b.vol,
    },
    {
      title: <TermTooltip term="成交额">成交额(万元)</TermTooltip>,
      dataIndex: 'amount',
      key: 'amount',
      render: text => (text / 10000).toFixed(2),
      sorter: (a, b) => a.amount - b.amount,
    },
  ];

  return (
    <div>
      <Card title="股票数据查询" className="dashboard-card">
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{
            dateRange: [moment().subtract(3, 'months'), moment()]
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="stock"
                label="股票选择"
                rules={[{ required: true, message: '请选择股票' }]}
              >
                <Select
                  showSearch
                  placeholder="请输入股票代码或名称搜索"
                  optionFilterProp="children"
                  loading={loading}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {stocks.map(stock => (
                    <Option key={stock.ts_code} value={stock.ts_code}>
                      {stock.name} ({stock.ts_code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                name="dateRange"
                label="日期区间"
                rules={[{ required: true, message: '请选择日期区间' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SearchOutlined />}
                  style={{ marginTop: '29px' }}
                  block
                >
                  查询
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {searchDone && stockData && (
        <>
          <Card 
            title={
              <span>
                <AreaChartOutlined /> {stockData.name} ({stockData.ts_code}) 走势图
              </span>
            }
            style={{ marginTop: 16 }}
            extra={
              <Button icon={<FileExcelOutlined />}>导出数据</Button>
            }
          >
            <ChartCard
              option={getStockChartOption()}
              height="400px"
              loading={loading}
            />
          </Card>

          <Card 
            title="历史行情数据" 
            style={{ marginTop: 16 }}
          >
            <Table
              columns={columns}
              dataSource={stockData.history}
              rowKey="trade_date"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default StockData;