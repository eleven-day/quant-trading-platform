import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, message } from 'antd';
import { StockOutlined, TrophyOutlined, BookOutlined, CodeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Card from '../components/atoms/Card';
import Chart from '../components/molecules/Chart';
import { dataService } from '../services';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
  margin-bottom: 40px;
  border-radius: 0 0 20px 20px;
`;

const HeroTitle = styled(Title)`
  color: white !important;
  font-size: 3.5rem !important;
  margin-bottom: 16px !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeroSubtitle = styled(Paragraph)`
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 1.2rem;
  margin-bottom: 32px !important;
`;

const FeatureSection = styled.div`
  padding: 40px 0;
`;

const FeatureCard = styled(Card)`
  text-align: center;
  height: 100%;
  
  .feature-icon {
    font-size: 48px;
    color: #1890ff;
    margin-bottom: 16px;
  }
  
  .feature-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #262626;
  }
  
  .feature-description {
    color: #666;
    line-height: 1.6;
  }
`;

const StatsCard = styled(Card)`
  text-align: center;
  
  .stat-number {
    font-size: 36px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 8px;
  }
  
  .stat-label {
    color: #666;
    font-size: 14px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HomePage = () => {
  const [recentData, setRecentData] = useState([]);
  const [stats, setStats] = useState({
    totalStrategies: 0,
    totalBacktests: 0,
    totalUsers: 0,
    successRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      // 获取最近的市场数据用于首页展示
      const marketData = await dataService.getIndexHistory('000001', {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, ''),
        end_date: new Date().toISOString().split('T')[0].replace(/-/g, '')
      });
      
      if (marketData.data) {
        setRecentData(marketData.data.map(item => ({
          date: item.date,
          close: item.close,
          volume: item.volume
        })));
      }
      
      // 模拟统计数据
      setStats({
        totalStrategies: 128,
        totalBacktests: 1547,
        totalUsers: 2341,
        successRate: 67.8
      });
      
    } catch (error) {
      message.error('加载数据失败：' + error.message);
    }
  };

  const features = [
    {
      icon: <StockOutlined className="feature-icon" />,
      title: '实时数据',
      description: '获取全面的股票、基金、期货等金融数据，支持历史数据和实时行情。'
    },
    {
      icon: <CodeOutlined className="feature-icon" />,
      title: '策略开发',
      description: '内置代码编辑器，支持Python策略开发，提供丰富的技术指标库。'
    },
    {
      icon: <TrophyOutlined className="feature-icon" />,
      title: '回测分析',
      description: '完整的回测系统，提供详细的性能分析和风险指标评估。'
    },
    {
      icon: <BookOutlined className="feature-icon" />,
      title: '学习资源',
      description: '丰富的文档教程和策略示例，帮助您快速掌握量化交易知识。'
    }
  ];

  return (
    <div>
      <HeroSection>
        <Container>
          <HeroTitle level={1}>量化交易学习平台</HeroTitle>
          <HeroSubtitle>
            从数据获取到策略开发，从回测分析到学习成长
            <br />
            一站式量化交易学习与实践环境
          </HeroSubtitle>
        </Container>
      </HeroSection>

      <Container>
        {/* 统计数据 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          <Col xs={12} sm={6}>
            <StatsCard>
              <div className="stat-number">{stats.totalStrategies}</div>
              <div className="stat-label">策略总数</div>
            </StatsCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatsCard>
              <div className="stat-number">{stats.totalBacktests}</div>
              <div className="stat-label">回测次数</div>
            </StatsCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatsCard>
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">用户数量</div>
            </StatsCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatsCard>
              <div className="stat-number">{stats.successRate}%</div>
              <div className="stat-label">策略成功率</div>
            </StatsCard>
          </Col>
        </Row>

        {/* 市场概览 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          <Col span={24}>
            <Card title="市场概览 - 上证指数近30日走势">
              <Chart
                data={recentData}
                type="line"
                height={300}
                xAxisKey="date"
                lines={[
                  { key: 'close', name: '收盘价', color: '#1890ff' }
                ]}
                title=""
                showToolbar={false}
              />
            </Card>
          </Col>
        </Row>

        {/* 功能特性 */}
        <FeatureSection>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
            平台特性
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <FeatureCard>
                  {feature.icon}
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-description">{feature.description}</div>
                </FeatureCard>
              </Col>
            ))}
          </Row>
        </FeatureSection>

        {/* 快速开始 */}
        <Row gutter={[24, 24]} style={{ marginTop: 40, marginBottom: 40 }}>
          <Col span={24}>
            <Card title="快速开始">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <StockOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>1. 浏览数据</Title>
                    <Paragraph>
                      在数据中心查看股票、指数等金融数据，了解市场行情。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <CodeOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={4}>2. 开发策略</Title>
                    <Paragraph>
                      使用内置编辑器编写交易策略，或从模板开始。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <TrophyOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 16 }} />
                    <Title level={4}>3. 回测验证</Title>
                    <Paragraph>
                      运行回测分析策略性能，查看详细的绩效报告。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
