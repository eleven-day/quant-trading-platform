import React, { useState } from 'react';
import { Row, Col, Typography, Card as AntCard, Input, Tag, Button, List, Avatar, Collapse } from 'antd';
import { BookOutlined, SearchOutlined, FileTextOutlined, PlayCircleOutlined, LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const CategoryCard = styled(AntCard)`
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  .category-icon {
    font-size: 32px;
    color: #1890ff;
    margin-bottom: 16px;
  }
  
  .category-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .category-description {
    color: #666;
    font-size: 14px;
  }
`;

const ResourceCard = styled(AntCard)`
  margin-bottom: 16px;
  
  .resource-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #262626;
  }
  
  .resource-description {
    color: #666;
    margin-bottom: 12px;
  }
  
  .resource-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999;
  }
`;

const DocsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const categories = [
    {
      id: 'basics',
      title: '入门基础',
      description: '量化交易基础知识和概念',
      icon: <BookOutlined />,
      count: 12
    },
    {
      id: 'strategy',
      title: '策略开发',
      description: '策略设计和编程实现',
      icon: <FileTextOutlined />,
      count: 18
    },
    {
      id: 'tools',
      title: '工具使用',
      description: 'AKShare、pandas等工具教程',
      icon: <PlayCircleOutlined />,
      count: 15
    },
    {
      id: 'advanced',
      title: '高级技巧',
      description: '高级策略和优化技术',
      icon: <QuestionCircleOutlined />,
      count: 8
    }
  ];

  const resources = [
    {
      id: 1,
      category: 'basics',
      title: '量化交易入门指南',
      description: '从零开始学习量化交易的基础概念，包括股票、基金、期货等金融产品的基本知识。',
      type: 'article',
      difficulty: 'beginner',
      readTime: '15分钟',
      tags: ['入门', '基础概念'],
      url: '#'
    },
    {
      id: 2,
      category: 'basics',
      title: '技术指标详解',
      description: '详细介绍常用的技术指标，如移动平均线、MACD、RSI等，及其在量化策略中的应用。',
      type: 'article',
      difficulty: 'beginner',
      readTime: '20分钟',
      tags: ['技术指标', 'MACD', 'RSI'],
      url: '#'
    },
    {
      id: 3,
      category: 'strategy',
      title: '均线策略实战',
      description: '通过实际案例学习如何开发和优化移动平均线交易策略。',
      type: 'tutorial',
      difficulty: 'intermediate',
      readTime: '30分钟',
      tags: ['均线策略', '实战', 'Python'],
      url: '#'
    },
    {
      id: 4,
      category: 'strategy',
      title: '趋势跟踪策略',
      description: '学习趋势跟踪策略的设计思路和实现方法，包括突破策略和动量策略。',
      type: 'tutorial',
      difficulty: 'intermediate',
      readTime: '25分钟',
      tags: ['趋势跟踪', '突破', '动量'],
      url: '#'
    },
    {
      id: 5,
      category: 'tools',
      title: 'AKShare数据获取教程',
      description: 'AKShare库的详细使用教程，包括股票数据、财务数据、宏观数据的获取方法。',
      type: 'tutorial',
      difficulty: 'beginner',
      readTime: '40分钟',
      tags: ['AKShare', '数据获取', 'API'],
      url: '#'
    },
    {
      id: 6,
      category: 'tools',
      title: 'Pandas数据处理技巧',
      description: '学习使用Pandas进行金融数据的清洗、转换和分析。',
      type: 'tutorial',
      difficulty: 'intermediate',
      readTime: '35分钟',
      tags: ['Pandas', '数据处理', 'Python'],
      url: '#'
    },
    {
      id: 7,
      category: 'advanced',
      title: '机器学习在量化交易中的应用',
      description: '探索机器学习算法在量化交易策略中的应用，包括特征工程和模型训练。',
      type: 'article',
      difficulty: 'advanced',
      readTime: '45分钟',
      tags: ['机器学习', '特征工程', '模型'],
      url: '#'
    },
    {
      id: 8,
      category: 'advanced',
      title: '风险管理与资金管理',
      description: '学习风险控制和资金管理的最佳实践，包括止损、仓位管理等。',
      type: 'article',
      difficulty: 'advanced',
      readTime: '30分钟',
      tags: ['风险管理', '资金管理', '止损'],
      url: '#'
    }
  ];

  const faqs = [
    {
      question: '如何开始学习量化交易？',
      answer: '建议从基础概念开始，先理解股票市场和技术分析的基本知识，然后学习Python编程，最后结合实际案例进行练习。'
    },
    {
      question: 'AKShare如何安装和使用？',
      answer: '使用pip install akshare命令安装，然后import akshare as ak导入使用。详细的API文档可以参考官方网站。'
    },
    {
      question: '策略回测需要注意什么？',
      answer: '需要注意数据质量、生存偏差、前瞻偏差等问题。同时要考虑交易成本、滑点等实际交易中的因素。'
    },
    {
      question: '如何评估策略的好坏？',
      answer: '主要看收益率、最大回撤、夏普比率、胜率等指标。但最重要的是策略的逻辑是否合理，是否具有可持续性。'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchKeyword = !searchKeyword || 
      resource.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()));
    
    return matchCategory && matchKeyword;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'green',
      intermediate: 'orange',
      advanced: 'red'
    };
    return colors[difficulty] || 'blue';
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级'
    };
    return texts[difficulty] || '未知';
  };

  const getTypeIcon = (type) => {
    const icons = {
      article: <FileTextOutlined />,
      tutorial: <PlayCircleOutlined />,
      video: <PlayCircleOutlined />
    };
    return icons[type] || <FileTextOutlined />;
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          学习资源
        </Title>
        <Text type="secondary">
          丰富的量化交易学习资料，从入门到精通
        </Text>
      </div>

      {/* 搜索栏 */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Search
            placeholder="搜索教程、文章或关键词..."
            enterButton={<SearchOutlined />}
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: 600 }}
          />
        </Col>
      </Row>

      {/* 分类导航 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6} md={4}>
          <CategoryCard 
            onClick={() => setSelectedCategory('all')}
            style={{ 
              borderColor: selectedCategory === 'all' ? '#1890ff' : '#d9d9d9',
              background: selectedCategory === 'all' ? '#f6ffed' : 'white'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <BookOutlined className="category-icon" />
              <div className="category-title">全部</div>
              <div className="category-description">所有学习资源</div>
            </div>
          </CategoryCard>
        </Col>
        {categories.map(category => (
          <Col key={category.id} xs={12} sm={6} md={4}>
            <CategoryCard 
              onClick={() => setSelectedCategory(category.id)}
              style={{ 
                borderColor: selectedCategory === category.id ? '#1890ff' : '#d9d9d9',
                background: selectedCategory === category.id ? '#f6ffed' : 'white'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div className="category-icon">{category.icon}</div>
                <div className="category-title">{category.title}</div>
                <div className="category-description">{category.description}</div>
                <div style={{ marginTop: 8, color: '#1890ff' }}>{category.count} 篇</div>
              </div>
            </CategoryCard>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* 学习资源列表 */}
        <Col xs={24} lg={16}>
          <Title level={4}>学习资源</Title>
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id}>
              <div className="resource-title">
                {getTypeIcon(resource.type)}
                <span style={{ marginLeft: 8 }}>{resource.title}</span>
              </div>
              <div className="resource-description">
                {resource.description}
              </div>
              <div style={{ marginBottom: 12 }}>
                {resource.tags.map(tag => (
                  <Tag key={tag} style={{ marginRight: 4 }}>
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className="resource-meta">
                <div>
                  <Tag color={getDifficultyColor(resource.difficulty)}>
                    {getDifficultyText(resource.difficulty)}
                  </Tag>
                  <span>阅读时间: {resource.readTime}</span>
                </div>
                <Button type="link" icon={<LinkOutlined />}>
                  查看详情
                </Button>
              </div>
            </ResourceCard>
          ))}
        </Col>

        {/* 侧边栏 */}
        <Col xs={24} lg={8}>
          {/* 快速入门 */}
          <AntCard title="快速入门" style={{ marginBottom: 24 }}>
            <List
              size="small"
              dataSource={[
                '第1步：了解量化交易基础',
                '第2步：学习Python编程',
                '第3步：掌握数据获取和处理',
                '第4步：学习策略开发',
                '第5步：进行策略回测'
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <Text>
                    <span style={{ 
                      background: '#1890ff', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 20, 
                      height: 20, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 12,
                      marginRight: 8
                    }}>
                      {index + 1}
                    </span>
                    {item}
                  </Text>
                </List.Item>
              )}
            />
          </AntCard>

          {/* 常见问题 */}
          <AntCard title="常见问题">
            <Collapse ghost>
              {faqs.map((faq, index) => (
                <Panel header={faq.question} key={index}>
                  <Paragraph type="secondary">
                    {faq.answer}
                  </Paragraph>
                </Panel>
              ))}
            </Collapse>
          </AntCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DocsPage;
