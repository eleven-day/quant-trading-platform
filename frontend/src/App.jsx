import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Drawer } from 'antd';
import Sidebar from './components/common/Sidebar';
import AppHeader from './components/common/AppHeader';
import Dashboard from './pages/Dashboard';
import StockData from './pages/StockData';
import Strategy from './pages/Strategy';
import Backtest from './pages/Backtest';
import Learning from './pages/Learning';
import TermContext from './contexts/TermContext';
import './App.css';

const { Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [termsData, setTermsData] = useState({});

  // 监听窗口大小变化
  React.useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (mobileView) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <TermContext.Provider value={{ termsData, setTermsData }}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          {!mobileView && (
            <Sidebar collapsed={collapsed} />
          )}
          
          {mobileView && (
            <Drawer
              placement="left"
              visible={drawerVisible}
              onClose={() => setDrawerVisible(false)}
              width={250}
              bodyStyle={{ padding: 0 }}
              headerStyle={{ display: 'none' }}
            >
              <Sidebar collapsed={false} onItemClick={() => setDrawerVisible(false)} />
            </Drawer>
          )}
          
          <Layout>
            <AppHeader 
              collapsed={collapsed}
              toggle={toggleSidebar}
            />
            <Content style={{ margin: '16px', overflow: 'auto' }}>
              <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/stock-data" element={<StockData />} />
                  <Route path="/strategy" element={<Strategy />} />
                  <Route path="/backtest" element={<Backtest />} />
                  <Route path="/learning" element={<Learning />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </TermContext.Provider>
  );
}

export default App;