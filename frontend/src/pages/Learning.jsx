import React, { useState, useEffect, useContext } from 'react';
import { Card, Tabs, List, Tag, Button, Collapse, Typography, Spin, Input, Empty, Alert, Row, Col, Progress } from 'antd';
import { BookOutlined, ReadOutlined, SolutionOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchLearningResources, fetchGlossary } from '../utils/api';
import TermContext from '../contexts/TermContext';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Paragraph, Text } = Typography;
const { Search } = Input;

const tagColors = {
  '入门': 'green',
  '进阶': 'blue',
  '高级': 'purple',
  '技术': 'cyan',
  '基础': 'magenta',
  '策略': 'gold',
  '回测': 'orange',
  '实战': 'red',
  '风控': 'volcano'
};

const Learning = () => {
  const [resources, setResources] = useState({
    tutorials: [],
    articles: [],
    videos: [],
    tools: []
  });
  const [glossary, setGlossary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { setTermsData } = useContext(TermContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resourcesData, glossaryData] = await Promise.all([
          fetchLearningResources(),
          fetchGlossary()
        ]);
        setResources(resourcesData);
        setGlossary(glossaryData);
        setTermsData(glossaryData); // 更新全局术语表
        setError(null);
      } catch (err) {
        console.error('获取学习资源失败:', err);
        setError('获取学习资源失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setTermsData]);

  // 过滤资源
  const getFilteredResources = (resourceList) => {
    if (!searchTerm) return resourceList;
    
    return resourceList.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  };

  // 渲染教程列表
  const renderTutorialsList = () => {
    const filteredTutorials = getFilteredResources(resources.tutorials);
    
    return (
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          pageSize: 5,
          hideOnSinglePage: true
        }}
        dataSource={filteredTutorials}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Button type="primary" icon={<ReadOutlined />}>
                开始学习
              </Button>
            ]}
            extra={
              <div>
                <Progress 
                  percent={item.progress || 0} 
                  size="small" 
                  status={item.progress === 100 ? "success" : "active"}
                  style={{ width: 120 }}
                />
              </div>
            }
          >
            <List.Item.Meta
              title={
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.title}</span>
                  {item.tags && item.tags.map(tag => (
                    <Tag color={tagColors[tag] || 'default'} key={tag} style={{ marginLeft: 8 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              }
              description={item.description}
            />
            <div>
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary">
                  {item.lessons} 课时 · 时长 {item.duration} · {item.students || 0} 人学习
                </Text>
              </div>
              <div>
                {item.topics && item.topics.map(topic => (
                  <Tag key={topic}>{topic}</Tag>
                ))}
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  // 渲染文章列表
  const renderArticlesList = () => {
    const filteredArticles = getFilteredResources(resources.articles);
    
    return (
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          pageSize: 10,
          hideOnSinglePage: true
        }}
        dataSource={filteredArticles}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Button type="link" icon={<ReadOutlined />}>
                阅读全文
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <div>
                  <span style={{ fontSize: '16px' }}>{item.title}</span>
                  {item.tags && item.tags.map(tag => (
                    <Tag color={tagColors[tag] || 'default'} key={tag} style={{ marginLeft: 8 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              }
              description={
                <span>
                  <Text type="secondary">
                    {item.author} · {item.date} · 阅读量 {item.views}
                  </Text>
                </span>
              }
            />
            <Paragraph ellipsis={{ rows: 3 }}>{item.summary}</Paragraph>
          </List.Item>
        )}
      />
    );
  };

  // 渲染视频列表
  const renderVideosList = () => {
    const filteredVideos = getFilteredResources(resources.videos);
    
    return (
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        pagination={{
          pageSize: 8,
          hideOnSinglePage: true
        }}
        dataSource={filteredVideos}
        renderItem={item => (
          <List.Item>
            <Card
              hoverable
              cover={
                <div style={{ 
                  height: 160, 
                  background: '#f0f0f0', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PlayIcon />
                </div>
              }
            >
              <Card.Meta
                title={item.title}
                description={
                  <>
                    <div>{item.duration} · {item.views} 次观看</div>
                    <div style={{ marginTop: 8 }}>
                      {item.tags && item.tags.map(tag => (
                        <Tag color={tagColors[tag] || 'default'} key={tag} size="small">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    );
  };

  // 渲染工具列表
  const renderToolsList = () => {
    const filteredTools = getFilteredResources(resources.tools);
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredTools}
        renderItem={item => (
          <List.Item
            actions={[
              <Button type="primary" icon={<DownloadOutlined />} size="small">
                下载
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <div>
                  <span>{item.title}</span>
                  {item.tags && item.tags.map(tag => (
                    <Tag color={tagColors[tag] || 'default'} key={tag} style={{ marginLeft: 8 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />
    );
  };

  // 渲染术语表
  const renderGlossary = () => {
    const filteredTerms = Object.entries(glossary)
      .filter(([term, definition]) => 
        term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        definition.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort(([termA], [termB]) => termA.localeCompare(termB));
    
    if (filteredTerms.length === 0) {
      return <Empty description="没有找到匹配的术语" />;
    }

    // 按字母分组
    const groupedTerms = filteredTerms.reduce((acc, [term, definition]) => {
      const firstLetter = term.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push({ term, definition });
      return acc;
    }, {});

    return (
      <Collapse defaultActiveKey={Object.keys(groupedTerms)}>
        {Object.entries(groupedTerms).map(([letter, terms]) => (
          <Panel header={`${letter} (${terms.length})`} key={letter}>
            <List
              itemLayout="horizontal"
              dataSource={terms}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={<strong>{item.term}</strong>}
                    description={item.definition}
                  />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    );
  };

  if (error) {
    return (
      <Alert
        message="数据加载失败"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Search
              placeholder="搜索学习资源和术语..."
              allowClear
              enterButton={<><SearchOutlined /> 搜索</>}
              size="large"
              onSearch={value => setSearchTerm(value)}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Tabs defaultActiveKey="1">
            <TabPane 
              tab={<span><BookOutlined /> 教程课程</span>} 
              key="1"
            >
              {resources.tutorials.length === 0 && !searchTerm ? (
                <Empty description="暂无教程内容" />
              ) : (
                renderTutorialsList()
              )}
            </TabPane>
            
            <TabPane 
              tab={<span><ReadOutlined /> 文章资料</span>} 
              key="2"
            >
              {resources.articles.length === 0 && !searchTerm ? (
                <Empty description="暂无文章内容" />
              ) : (
                renderArticlesList()
              )}
            </TabPane>
            
            <TabPane 
              tab={<span><PlayCircleIcon /> 视频讲解</span>} 
              key="3"
            >
              {resources.videos.length === 0 && !searchTerm ? (
                <Empty description="暂无视频内容" />
              ) : (
                renderVideosList()
              )}
            </TabPane>
            
            <TabPane 
              tab={<span><ToolIcon /> 工具资源</span>} 
              key="4"
            >
              {resources.tools.length === 0 && !searchTerm ? (
                <Empty description="暂无工具资源" />
              ) : (
                renderToolsList()
              )}
            </TabPane>
            
            <TabPane 
              tab={<span><SolutionOutlined /> 术语表</span>} 
              key="5"
            >
              {Object.keys(glossary).length === 0 ? (
                <Empty description="暂无术语内容" />
              ) : (
                renderGlossary()
              )}
            </TabPane>
          </Tabs>
        </Spin>
      </Card>
    </div>
  );
};

// 自定义图标组件
const PlayCircleIcon = () => <span role="img" className="anticon"><svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M719.4 499.1l-296.1-215A15.9 15.9 0 0 0 398 297v430c0 13.1 14.8 20.5 25.3 12.9l296.1-215a15.9 15.9 0 0 0 0-25.8zm-257.6 134V390.9L628.5 512 461.8 633.1z"></path></svg></span>;

const PlayIcon = () => <span role="img" className="anticon" style={{ fontSize: '48px', color: '#1890ff' }}><svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M719.4 499.1l-296.1-215A15.9 15.9 0 0 0 398 297v430c0 13.1 14.8 20.5 25.3 12.9l296.1-215a15.9 15.9 0 0 0 0-25.8zm-257.6 134V390.9L628.5 512 461.8 633.1z"></path></svg></span>;

const ToolIcon = () => <span role="img" className="anticon"><svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor"><path d="M876.6 239.5c-.5-.9-1.2-1.8-2-2.5-5-5-13.1-5-18.1 0L684.2 409.3l-67.9-67.9L788.7 169c.8-.8 1.4-1.6 2-2.5 3.6-6.1 1.6-13.9-4.5-17.5-98.2-58-226.8-44.7-311.3 39.7-67 67-89.2 162-66.5 247.4l-293 293c-3 3-2.8 7.9.3 11l90.1 90.1c3.1 3.1 8.1 3.3 11 .3l293-293c85.4 22.6 180.3.5 247.4-66.5 84.4-84.4 97.7-213.1 39.7-311.3zM786 499.8c-58.1 58.1-145.3 69.3-214.6 33.6l-8.8 8.8-.1-.1-274 274.1-67.5-67.5 274-274.1-.1-.1 8.8-8.8c-35.7-69.3-24.5-156.5 33.6-214.6 39.2-39.2 92.1-57.3 144-53.2L537 310.7l90.8 90.8 132.9-132.9c3.8 51.9-14.3 104.8-53.5 144zM948 266.9c-4.5 0-9-1.7-12.5-5.1-6.9-6.9-6.9-18.1 0-25l44-44c6.9-6.9 18.1-6.9 25 0 6.9 6.9 6.9 18.1 0 25l-44 44c-3.4 3.4-8 5.1-12.5 5.1zm-12.5 191c-4.5 0-9-1.7-12.5-5.1-6.9-6.9-6.9-18.1 0-25l44-44c6.9-6.9 18.1-6.9 25 0 6.9 6.9 6.9 18.1 0 25l-44 44c-3.4 3.4-8 5.1-12.5 5.1zM76 578.9c-4.5 0-9-1.7-12.5-5.1-6.9-6.9-6.9-18.1 0-25l44-44c6.9-6.9 18.1-6.9 25 0 6.9 6.9 6.9 18.1 0 25l-44 44c-3.4 3.4-8 5.1-12.5 5.1z"></path></svg></span>;

export default Learning;