import React, { useState, useEffect } from 'react';
import { Card, Form, DatePicker, InputNumber, Select, Button, Tabs, Table, Alert, Row, Col, Statistic } from 'antd';
import { ExperimentOutlined, FileOutlined, LineChartOutlined, PieChartOutlined, AreaChartOutlined } from '@ant-design/icons';
import ChartCard from '../components/common/ChartCard';
import TermTooltip from '../components/common/TermTooltip';
import { fetchStocks, fetchStrategies, runBacktest } from '../utils/api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// 回测结果组件
const BacktestResults = ({ results, loading }) => {
  if (!results) return null;
  
  // 资产曲线图配置
  const getEquityCurveOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['策略收益', '基准收益']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: results.dates
      },
      yAxis: [
        {
          type: 'value',
          name: '收益率(%)',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '策略收益',
          type: 'line',
          data: results.strategy_returns,
          symbol: 'none',
          smooth: true,
          lineStyle: { width: 3 }
        },
        {
          name: '基准收益',
          type: 'line',
          data: results.benchmark_returns,
          symbol: 'none',
          smooth: true,
          lineStyle: { 
            width: 2,
            type: 'dashed'
          }
        }
      ]
    };
  };
  
  // 月度收益热力图配置
  const getMonthlyReturnsOption = () => {
    return {
      tooltip: {
        formatter: function (params) {
          return `${params.data[1]}年${params.data[0]}月: ${params.data[2].toFixed(2)}%`;
        }
      },
      visualMap: {
        min: -10,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#c23531', '#e5e5e5', '#3f8600']
        }
      },
      grid: {
        top: '10%',
        height: '70%',
        left: '15%'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: results.monthly_returns.years,
        splitArea: {
          show: true
        }
      },
      series: [
        {
          name: '月度收益',
          type: 'heatmap',
          data: results.monthly_returns.data,
          label: {
            show: true,
            formatter: function (params) {
              return params.data[2].toFixed(1) + '%';
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };
  
  // 回撤图配置
  const getDrawdownOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function (params) {
          return `${params[0].axisValue}<br/>${params[0].marker}${params[0].seriesName}: ${params[0].data.toFixed(2)}%`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: results.dates
      },
      yAxis: {
        type: 'value',
        name: '回撤(%)',
        axisLabel: {
          formatter: '{value}%'
        },
        inverse: true
      },
      series: [
        {
          name: '策略回撤',
          type: 'line',
          data: results.drawdowns,
          symbol: 'none',
          lineStyle: { 
            width: 2,
            color: '#c23531'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(194, 53, 49, 0.2)' },
                { offset: 1, color: 'rgba(194, 53, 49, 0)' }
              ]
            }
          }
        }
      ]
    };
  };
  
  // 持仓占比图配置
  const getPositionOption = () => {
    if (!results.position_distribution) return null;
    
    const data = results.position_distribution.map(item => ({
      name: item.name,
      value: item.value
    }));
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map(item => item.name)
      },
      series: [
        {
          name: '持仓分布',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    };
  };
  
  // 绩效指标表格列
  const performanceColumns = [
    {
      title: '指标',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <TermTooltip term={text}>{text}</TermTooltip>
    },
    {
      title: '策略',
      dataIndex: 'strategy',
      key: 'strategy',
      align: 'right'
    },
    {
      title: '基准',
      dataIndex: 'benchmark',
      key: 'benchmark',
      align: 'right'
    }
  ];
  
  // 交易记录表格列
  const transactionColumns = [
    {
      title: '交易日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date.localeCompare(b.date)
    },
    {
      title: '股票代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '股票名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text) => (
        <span style={{ color: text === '买入' ? '#1890ff' : '#f5222d' }}>
          {text}
        </span>
      )
    },
    {
      title: '成交价',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (text) => text.toFixed(2)
    },
    {
      title: '成交量(股)',
      dataIndex: 'volume',
      key: 'volume',
      align: 'right',
      render: (text) => text.toLocaleString()
    },
    {
      title: '成交额(元)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (text) => text.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    {
      title: '手续费(元)',
      dataIndex: 'commission',
      key: 'commission',
      align: 'right',
      render: (text) => text.toFixed(2)
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={<TermTooltip term="年化收益率">年化收益率</TermTooltip>}
              value={results.performance.annualized_return}
              precision={2}
              suffix="%"
              valueStyle={{ color: results.performance.annualized_return >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={<TermTooltip term="夏普比率">夏普比率</TermTooltip>}
              value={results.performance.sharpe_ratio}
              precision={2}
              valueStyle={{ color: results.performance.sharpe_ratio >= 1 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={<TermTooltip term="最大回撤">最大回撤</TermTooltip>}
              value={results.performance.max_drawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              收益曲线
            </span>
          }
          key="1"
        >
          <ChartCard
            option={getEquityCurveOption()}
            height="400px"
            loading={loading}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <AreaChartOutlined />
              回撤分析
            </span>
          }
          key="2"
        >
          <ChartCard
            option={getDrawdownOption()}
            height="400px"
            loading={loading}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <PieChartOutlined />
              持仓分析
            </span>
          }
          key="3"
        >
          <Row gutter={16}>
            <Col span={24}>
              <ChartCard
                option={getPositionOption()}
                height="400px"
                loading={loading}
              />
            </Col>
          </Row>
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              月度收益
            </span>
          }
          key="4"
        >
          <ChartCard
            option={getMonthlyReturnsOption()}
            height="400px"
            loading={loading}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <FileOutlined />
              绩效指标
            </span>
          }
          key="5"
        >
          <Table
            columns={performanceColumns}
            dataSource={results.indicators}
            pagination={false}
            rowKey="name"
            loading={loading}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <FileOutlined />
              交易记录
            </span>
          }
          key="6"
        >
          <Table
            columns={transactionColumns}
            dataSource={results.transactions}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            loading={loading}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

const Backtest = () => {
  const [form] = Form.useForm();
  const [stocks, setStocks] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stocksData, strategiesData] = await Promise.all([
          fetchStocks(),
          fetchStrategies()
        ]);
        setStocks(stocksData);
        setStrategies(strategiesData);
        setError(null);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('加载数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleRunBacktest = async (values) => {
    try {
      setRunning(true);
      setBacktestResults(null);
      
      const results = await runBacktest({
        strategy_id: values.strategy,
        start_date: values.dateRange[0].format('YYYYMMDD'),
        end_date: values.dateRange[1].format('YYYYMMDD'),
        initial_capital: values.initialCapital,
        stock_pool: values.stocks
      });
      
      setBacktestResults(results);
      setError(null);
    } catch (err) {
      console.error('回测执行失败:', err);
      setError('回测执行失败，请稍后再试');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <Card 
        title={
          <span>
            <ExperimentOutlined /> 回测配置
          </span>
        }
        loading={loading}
      >
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRunBacktest}
          initialValues={{
            initialCapital: 100000,
            dateRange: [moment().subtract(1, 'year'), moment()],
            strategy: undefined,
            stocks: []
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="strategy"
                label={<TermTooltip term="策略">选择策略</TermTooltip>}
                rules={[{ required: true, message: '请选择策略' }]}
              >
                <Select placeholder="请选择策略">
                  {strategies.map(strategy => (
                    <Option key={strategy.id} value={strategy.id}>{strategy.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="dateRange"
                label={<TermTooltip term="回测周期">回测时间范围</TermTooltip>}
                rules={[{ required: true, message: '请选择日期区间' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="initialCapital"
                label={<TermTooltip term="初始资金">初始资金(元)</TermTooltip>}
                rules={[{ required: true, message: '请输入初始资金' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={1000} 
                  step={1000} 
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
              
              <Form.Item
                name="stocks"
                label={<TermTooltip term="股票池">选择股票池</TermTooltip>}
                rules={[{ required: true, message: '请选择至少一支股票' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择股票"
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {stocks.map(stock => (
                    <Option key={stock.ts_code} value={stock.ts_code}>{stock.name} ({stock.ts_code})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={running} 
              block
              icon={<ExperimentOutlined />}
            >
              执行回测
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {backtestResults && (
        <Card 
          title="回测结果分析" 
          style={{ marginTop: 16 }}
          loading={running}
        >
          <BacktestResults results={backtestResults} loading={running} />
        </Card>
      )}
    </div>
  );
};

export default Backtest;