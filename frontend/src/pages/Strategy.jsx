import React, { useState, useEffect } from 'react';
import { Card, Select, Form, Slider, InputNumber, Button, Tooltip, Divider, Row, Col, Spin, Alert, Table, Tabs } from 'antd';
import { InfoCircleOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons';
import TermTooltip from '../components/common/TermTooltip';
import ChartCard from '../components/common/ChartCard';
import { fetchStrategies, fetchStrategyDetail } from '../utils/api';

const { Option } = Select;
const { TabPane } = Tabs;

// 策略描述组件
const StrategyDescription = ({ strategy }) => {
  if (!strategy) return null;
  
  return (
    <div className="strategy-info">
      <h3>{strategy.name}</h3>
      <p>{strategy.description}</p>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <strong>策略类型：</strong> {strategy.type}
        </Col>
        <Col xs={24} sm={8}>
          <strong>适用市场：</strong> {strategy.markets.join(', ')}
        </Col>
        <Col xs={24} sm={8}>
          <strong>风险等级：</strong> {strategy.risk_level}
        </Col>
      </Row>
    </div>
  );
};

// 参数表单组件
const ParameterForm = ({ strategy, form }) => {
  if (!strategy || !strategy.parameters) return null;
  
  return (
    <div>
      <h3>参数配置</h3>
      {strategy.parameters.map(param => {
        // 根据参数类型返回不同的表单项
        if (param.type === 'slider') {
          return (
            <Form.Item
              key={param.name}
              name={param.name}
              label={
                <span>
                  <TermTooltip term={param.label}>{param.label}</TermTooltip>
                </span>
              }
              extra={param.description}
            >
              <Slider
                min={param.min}
                max={param.max}
                step={param.step || 1}
                marks={{
                  [param.min]: param.min,
                  [param.max]: param.max
                }}
              />
            </Form.Item>
          );
        } else if (param.type === 'number') {
          return (
            <Form.Item
              key={param.name}
              name={param.name}
              label={
                <span>
                  <TermTooltip term={param.label}>{param.label}</TermTooltip>
                </span>
              }
              extra={param.description}
            >
              <InputNumber
                min={param.min}
                max={param.max}
                step={param.step || 1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          );
        } else if (param.type === 'select') {
          return (
            <Form.Item
              key={param.name}
              name={param.name}
              label={
                <span>
                  <TermTooltip term={param.label}>{param.label}</TermTooltip>
                </span>
              }
              extra={param.description}
            >
              <Select>
                {param.options.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return null;
      })}
    </div>
  );
};

const Strategy = () => {
  const [form] = Form.useForm();
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStrategyChange = React.useCallback(async (value) => {
    try {
      setDetailLoading(true);
      const strategy = strategies.find(s => s.id === value);
      
      if (strategy) {
        const detail = await fetchStrategyDetail(value);
        setSelectedStrategy({...strategy, ...detail});
        
        // 设置表单默认值
        const initialValues = {};
        detail.parameters.forEach(param => {
          initialValues[param.name] = param.default;
        });
        form.setFieldsValue(initialValues);
      }
    } catch (err) {
      console.error('获取策略详情失败:', err);
      setError('获取策略详情失败，请稍后再试');
    } finally {
      setDetailLoading(false);
    }
  }, [strategies, form, setDetailLoading, setSelectedStrategy, setError]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchStrategies();
        setStrategies(data);
        setError(null);
        
        if (data.length > 0) {
          await handleStrategyChange(data[0].id);
        }
      } catch (err) {
        console.error('获取策略列表失败:', err);
        setError('获取策略列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [handleStrategyChange]);

  const handleSaveStrategy = (values) => {
    console.log('保存策略配置:', values);
    // 这里可以调用API保存策略配置
  };

  // 绩效图表配置
  const getPerformanceChartOption = () => {
    if (!selectedStrategy || !selectedStrategy.performance) return null;
    
    const { dates, strategy, benchmark } = selectedStrategy.performance;
    
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
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '累计收益(%)',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '策略收益',
          type: 'line',
          data: strategy,
          symbol: 'none',
          smooth: true,
          lineStyle: { 
            width: 3,
            color: '#1890ff'
          }
        },
        {
          name: '基准收益',
          type: 'line',
          data: benchmark,
          symbol: 'none',
          smooth: true,
          lineStyle: { 
            width: 2,
            color: '#8e8e8e',
            type: 'dashed'
          }
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

  return (
    <div>
      <Spin spinning={loading}>
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Card title="策略选择与配置">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveStrategy}
          >
            <Form.Item 
              label={
                <span>
                  策略类型 
                  <Tooltip title="选择不同类型的量化交易策略">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
            >
              <Select
                style={{ width: '100%' }}
                placeholder="请选择策略"
                onChange={handleStrategyChange}
                value={selectedStrategy?.id}
                loading={loading}
              >
                {strategies.map(strategy => (
                  <Option key={strategy.id} value={strategy.id}>{strategy.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Spin spinning={detailLoading}>
              {selectedStrategy && (
                <>
                  <Divider />
                  <StrategyDescription strategy={selectedStrategy} />
                  
                  <Divider />
                  <ParameterForm strategy={selectedStrategy} form={form} />
                  
                  <Divider />
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      block
                    >
                      保存策略配置
                    </Button>
                  </Form.Item>
                </>
              )}
            </Spin>
          </Form>
        </Card>
        
        {selectedStrategy && selectedStrategy.performance && (
          <Card 
            title="策略绩效" 
            style={{ marginTop: 16 }}
            extra={
              <Button icon={<SyncOutlined />}>更新测试</Button>
            }
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="收益曲线" key="1">
                <ChartCard
                  option={getPerformanceChartOption()}
                  height="350px"
                  loading={detailLoading}
                />
              </TabPane>
              <TabPane tab="绩效指标" key="2">
                <Spin spinning={detailLoading}>
                  {selectedStrategy.indicators && (
                    <Table
                      columns={performanceColumns}
                      dataSource={selectedStrategy.indicators}
                      pagination={false}
                      rowKey="name"
                      size="middle"
                    />
                  )}
                </Spin>
              </TabPane>
            </Tabs>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default Strategy;