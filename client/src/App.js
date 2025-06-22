import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import { 
  HomeOutlined, 
  StockOutlined, 
  CodeOutlined, 
  BookOutlined,
  TrophyOutlined 
} from '@ant-design/icons';
import styled from 'styled-components';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import DataCenterPage from './pages/DataCenterPage';
import StrategyPage from './pages/StrategyPage';
import BacktestPage from './pages/BacktestPage';
import DocsPage from './pages/DocsPage';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  background: linear-gradient(45deg, #1890ff, #36cfc9);
  padding: 0 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: auto;
  
  .logo-icon {
    font-size: 24px;
    margin-right: 8px;
  }
`;

const StyledSider = styled(Sider)`
  .ant-layout-sider-trigger {
    background: #1890ff;
  }
`;

const StyledContent = styled(Content)`
  background: #f0f2f5;
  overflow-y: auto;
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
`;

function AppLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径获取选中的菜单项
  const getSelectedKey = () => {
    switch (location.pathname) {
      case '/': return '1';
      case '/data': return '2';
      case '/strategy': return '3';
      case '/backtest': return '4';
      case '/docs': return '5';
      default: return '1';
    }
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '首页',
      path: '/'
    },
    {
      key: '2',
      icon: <StockOutlined />,
      label: '数据中心',
      path: '/data'
    },
    {
      key: '3',
      icon: <CodeOutlined />,
      label: '策略开发',
      path: '/strategy'
    },
    {
      key: '4',
      icon: <TrophyOutlined />,
      label: '回测分析',
      path: '/backtest'
    },
    {
      key: '5',
      icon: <BookOutlined />,
      label: '学习资源',
      path: '/docs'
    }
  ];

  const handleMenuClick = (e) => {
    const selectedItem = menuItems.find(item => item.key === e.key);
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  return (
    <StyledLayout>
      <StyledSider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title 
            level={4} 
            style={{ 
              color: 'white', 
              margin: 0,
              fontSize: collapsed ? '14px' : '16px'
            }}
          >
            {collapsed ? 'QT' : '量化交易平台'}
          </Title>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          onClick={handleMenuClick}
          items={menuItems}
        />
      </StyledSider>

      <Layout>
        <StyledHeader>
          <Logo>
            <StockOutlined className="logo-icon" />
            量化交易学习平台
          </Logo>
        </StyledHeader>

        <StyledContent>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/data" element={<DataCenterPage />} />
            <Route path="/strategy" element={<StrategyPage />} />
            <Route path="/backtest" element={<BacktestPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </StyledContent>

        <StyledFooter>
          量化交易学习平台 ©2024 Created by Your Team
        </StyledFooter>
      </Layout>
    </StyledLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}

export default App;
