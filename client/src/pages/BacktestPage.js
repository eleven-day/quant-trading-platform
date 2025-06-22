import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Form, Select, DatePicker, Button, 
  Table, Typography, message, Statistic, Tabs 
} from 'antd';
import { PlayCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Loading from '../components/atoms/Loading';
import { strategyService } from '../services';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const MetricCard = styled(Card)`
  text-align: center;
  .ant-statistic-content {
    color: ${props => props.positive ? '#52c41a' : props.negative ? '#ff4d4f' : '#1890ff'};
  }
`;

const BacktestPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [runningBacktest, setRunningBacktest] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const response = await strategyService.getStrategies();
      if (response.data) {
        setStrategies(response.data);
      }
    } catch (error) {
      console.error('加载策略失败：', error);
      setStrategies([]);
    }
  };

  const runBacktest = async () => {
    try {
      const values = await form.validateFields();
      setRunningBacktest(true);
      setLoading(true);
      
      const backtestData = {
        strategy_id: values.strategy,
        symbol: values.symbol,
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        initial_capital: values.initialCapital || 100000
      };
      
      const response = await strategyService.runBacktest(backtestData);
      
      if (response.data) {
        setBacktestResults(response.data);
        message.success('回测完成！');
      } else {
        message.error('回测失败，请检查参数设置');
      }
    } catch (error) {
      console.error('回测失败：', error);
      message.error('回测失败：' + error.message);
    } finally {
      setRunningBacktest(false);
      setLoading(false);
    }
  };

  const tradeColumns = [
    {
      title: '交易编号',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '股票代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      width: 80,
      render: (direction) => (
        <span style={{ color: direction === 'buy' ? '#52c41a' : '#ff4d4f' }}>
          {direction === 'buy' ? '买入' : '卖出'}
        </span>
      )
    },
    {
      title: '入场日期',
      dataIndex: 'entry_date',
      key: 'entry_date',
      width: 100
    },
    {
      title: '出场日期',
      dataIndex: 'exit_date',
      key: 'exit_date',
      width: 100
    },
    {
      title: '入场价格',
      dataIndex: 'entry_price',
      key: 'entry_price',
      width: 80,
      render: (price) => parseFloat(price).toFixed(2)
    },
    {
      title: '出场价格',
      dataIndex: 'exit_price',
      key: 'exit_price',
      width: 80,
      render: (price) => parseFloat(price).toFixed(2)
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: '盈亏金额',
      dataIndex: 'profit',
      key: 'profit',
      width: 100,
      render: (profit) => (
        <span style={{ color: parseFloat(profit) >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {parseFloat(profit) >= 0 ? '+' : ''}{parseFloat(profit).toFixed(2)}
        </span>
      )
    },
    {
      title: '盈亏比例',
      dataIndex: 'profit_percent',
      key: 'profit_percent',
      width: 100,
      render: (percent) => (
        <span style={{ color: parseFloat(percent) >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {parseFloat(percent) >= 0 ? '+' : ''}{parseFloat(percent).toFixed(2)}%
        </span>
      )
    }
  ];

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <TrophyOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          回测分析
        </Title>
        <Text type="secondary">
          运行策略回测，分析历史表现和风险指标
        </Text>
      </div>

      {/* 回测参数设置 */}
      <Card title="回测参数" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={runBacktest}
          initialValues={{
            dateRange: [dayjs().subtract(1, 'year'), dayjs()],
            initialCapital: 100000,
            symbol: '000001'
          }}
        >
          <Form.Item
            name="strategy"
            label="选择策略"
            rules={[{ required: true, message: '请选择策略' }]}
          >
            <Select placeholder="选择策略" style={{ width: 200 }}>
              {strategies.map(strategy => (
                <Option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="symbol"
            label="股票代码"
            rules={[{ required: true, message: '请输入股票代码' }]}
          >
            <Select placeholder="选择股票" style={{ width: 120 }}>
              <Option value="000001">000001</Option>
              <Option value="000002">000002</Option>
              <Option value="600000">600000</Option>
              <Option value="600036">600036</Option>
              <Option value="600519">600519</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="回测时间"
            rules={[{ required: true, message: '请选择回测时间范围' }]}
          >
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="initialCapital"
            label="初始资金"
          >
            <Select placeholder="初始资金" style={{ width: 120 }}>
              <Option value={100000}>10万</Option>
              <Option value={500000}>50万</Option>
              <Option value={1000000}>100万</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={runningBacktest}
            >
              {runningBacktest ? '回测中...' : '开始回测'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 回测结果 */}
      {loading ? (
        <Loading text="正在运行回测..." />
      ) : backtestResults ? (
        <>
          {/* 性能指标 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <MetricCard 
                positive={backtestResults.performance?.total_return >= 0}
                negative={backtestResults.performance?.total_return < 0}
              >
                <Statistic 
                  title="总收益率" 
                  value={backtestResults.performance?.total_return || 0}
                  suffix="%" 
                  precision={2}
                />
              </MetricCard>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <MetricCard>
                <Statistic 
                  title="年化收益率" 
                  value={backtestResults.performance?.annualized_return || 0}
                  suffix="%" 
                  precision={2}
                />
              </MetricCard>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <MetricCard negative>
                <Statistic 
                  title="最大回撤" 
                  value={backtestResults.performance?.max_drawdown || 0}
                  suffix="%" 
                  precision={2}
                />
              </MetricCard>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <MetricCard>
                <Statistic 
                  title="夏普比率" 
                  value={backtestResults.performance?.sharpe_ratio || 0}
                  precision={2}
                />
              </MetricCard>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <MetricCard>
                <Statistic 
                  title="胜率" 
                  value={backtestResults.performance?.win_rate || 0}
                  suffix="%" 
                  precision={1}
                />
              </MetricCard>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <MetricCard>
                <Statistic 
                  title="交易次数" 
                  value={backtestResults.performance?.total_trades || 0}
                />
              </MetricCard>
            </Col>
          </Row>

          {/* 详细分析 */}
          <Tabs defaultActiveKey="equity">
            <TabPane tab="资金曲线" key="equity">
              <Card>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={backtestResults.equity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="#1890ff" 
                      name="策略净值"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#52c41a" 
                      name="基准净值"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabPane>

            <TabPane tab="交易记录" key="trades">
              <Card>
                <Table
                  columns={tradeColumns}
                  dataSource={backtestResults.trades || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </TabPane>

            <TabPane tab="月度收益" key="monthly">
              <Card>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={backtestResults.monthly_returns || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="return" 
                      stroke="#1890ff" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <TrophyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>请设置回测参数并点击"开始回测"来查看结果</div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
};

export default BacktestPage;
