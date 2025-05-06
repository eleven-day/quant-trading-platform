import React from 'react';
import { Layout, Menu, Typography, Space, Spin } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LineChartOutlined, 
  StockOutlined, 
  DashboardOutlined, 
  BarChartOutlined,
  GithubOutlined
} from '@ant-design/icons';
import useAppStore from '../store/appStore';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const { loading } = useAppStore();
  const location = useLocation();
  
  // 全局加载指示器
  const LoadingIndicator = () => (
    loading ? (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1001, 
        textAlign: 'center',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
      }}>
        <Spin size="small" /> <span style={{ marginLeft: 8 }}>数据加载中...</span>
      </div>
    ) : null
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <LoadingIndicator />
      
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 20px',
        backgroundColor: '#1890ff' 
      }}>
        <Space>
          <LineChartOutlined style={{ fontSize: 24, color: 'white' }} />
          <Title level={4} style={{ margin: 0, color: 'white' }}>
            量化交易学习系统
          </Title>
        </Space>
      </Header>
      
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="/" icon={<DashboardOutlined />}>
              <Link to="/">概览</Link>
            </Menu.Item>
            <Menu.Item key="/stock" icon={<StockOutlined />}>
              <Link to="/stock">股票分析</Link>
            </Menu.Item>
            <Menu.Item key="/futures" icon={<BarChartOutlined />}>
              <Link to="/futures">期货分析</Link>
            </Menu.Item>
            <Menu.Item key="/indices" icon={<LineChartOutlined />}>
              <Link to="/indices">指数分析</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              background: '#fff',
              margin: '16px 0',
              minHeight: 280,
              overflowY: 'auto',
            }}
          >
            <Outlet />
          </Content>
          
          <Footer style={{ textAlign: 'center' }}>
            <Space>
              <span>量化交易学习系统 ©2025 基于 AKShare</span>
              <a href="https://github.com/akfamily/akshare" target="_blank" rel="noopener noreferrer">
                <GithubOutlined /> AKShare
              </a>
            </Space>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;