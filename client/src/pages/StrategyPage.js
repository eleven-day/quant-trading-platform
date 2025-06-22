import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Typography, message, Button, Modal, Form, Input, Select, Table, Tag } from 'antd';
import { CodeOutlined, PlayCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Card from '../components/atoms/Card';
import Loading from '../components/atoms/Loading';
import { strategyService } from '../services';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const CodeEditor = styled(TextArea)`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #3c3c3c;
  
  &:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

const StrategyCard = styled(Card)`
  .strategy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .strategy-name {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
  }
  
  .strategy-actions {
    display: flex;
    gap: 8px;
  }
  
  .strategy-description {
    color: #666;
    margin-bottom: 12px;
    font-size: 14px;
  }
  
  .strategy-stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #999;
  }
`;

const StrategyPage = () => {
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadStrategies();
  }, []);
  const loadStrategies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await strategyService.getStrategies();
      if (response.data) {
        setStrategies(response.data);
      } else {
        setStrategies([]);
      }
    } catch (error) {
      console.error('加载策略失败：', error);
      message.error('加载策略失败：' + error.message);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateStrategy = () => {
    setEditingStrategy(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStrategy = (strategy) => {
    setEditingStrategy(strategy);
    form.setFieldsValue(strategy);
    setIsModalVisible(true);
  };

  const handleDeleteStrategy = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个策略吗？',
      onOk: () => {
        setStrategies(strategies.filter(s => s.id !== id));
        message.success('策略删除成功');
      }
    });
  };

  const handleSaveStrategy = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingStrategy) {
        // 更新策略
        const updatedStrategies = strategies.map(s => 
          s.id === editingStrategy.id ? { ...s, ...values } : s
        );
        setStrategies(updatedStrategies);
        message.success('策略更新成功');
      } else {
        // 创建新策略
        const newStrategy = {
          id: Date.now(),
          ...values,
          status: 'draft',
          created_at: new Date().toISOString().split('T')[0],
          backtest_count: 0
        };
        setStrategies([...strategies, newStrategy]);
        message.success('策略创建成功');
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('保存策略失败：', error);
    }
  };

  const handleRunBacktest = (strategy) => {
    message.info(`开始回测策略: ${strategy.name}`);
    // 这里应该调用回测API
  };

  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'green', text: '活跃' },
      draft: { color: 'orange', text: '草稿' },
      deprecated: { color: 'red', text: '已废弃' }
    };
    const config = statusMap[status] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CodeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          策略开发
        </Title>
        <Text type="secondary">
          创建和管理您的量化交易策略，支持Python代码编辑和回测分析
        </Text>
      </div>

      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateStrategy}
          >
            创建新策略
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Loading text="加载策略列表..." />
      ) : (
        <Row gutter={[24, 24]}>
          {strategies.map(strategy => (
            <Col key={strategy.id} xs={24} sm={12} lg={8}>
              <StrategyCard>
                <div className="strategy-header">
                  <div className="strategy-name">{strategy.name}</div>
                  <div className="strategy-actions">
                    <Button 
                      size="small" 
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleRunBacktest(strategy)}
                    >
                      回测
                    </Button>
                    <Button 
                      size="small" 
                      icon={<EditOutlined />}
                      onClick={() => handleEditStrategy(strategy)}
                    />
                    <Button 
                      size="small" 
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDeleteStrategy(strategy.id)}
                    />
                  </div>
                </div>
                
                <div className="strategy-description">
                  {strategy.description}
                </div>
                
                <div className="strategy-stats">
                  <span>状态: {getStatusTag(strategy.status)}</span>
                  <span>回测次数: {strategy.backtest_count}</span>
                  <span>创建时间: {strategy.created_at}</span>
                </div>
              </StrategyCard>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingStrategy ? '编辑策略' : '创建新策略'}
        open={isModalVisible}
        onOk={handleSaveStrategy}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="策略名称"
            name="name"
            rules={[{ required: true, message: '请输入策略名称' }]}
          >
            <Input placeholder="输入策略名称" />
          </Form.Item>
          
          <Form.Item
            label="策略描述"
            name="description"
            rules={[{ required: true, message: '请输入策略描述' }]}
          >
            <Input placeholder="输入策略描述" />
          </Form.Item>
          
          <Form.Item
            label="编程语言"
            name="language"
            initialValue="python"
          >
            <Select>
              <Option value="python">Python</Option>
              <Option value="javascript">JavaScript</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="策略代码"
            name="code"
            rules={[{ required: true, message: '请输入策略代码' }]}
          >
            <CodeEditor
              rows={12}
              placeholder="输入您的策略代码..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StrategyPage;
