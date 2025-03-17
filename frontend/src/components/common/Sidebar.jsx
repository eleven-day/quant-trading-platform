import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  StockOutlined,
  RobotOutlined,
  LineChartOutlined,
  ReadOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onItemClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: '/stock-data',
      icon: <StockOutlined />,
      label: <Link to="/stock-data">股票数据</Link>,
    },
    {
      key: '/strategy',
      icon: <RobotOutlined />,
      label: <Link to="/strategy">策略配置</Link>,
    },
    {
      key: '/backtest',
      icon: <LineChartOutlined />,
      label: <Link to="/backtest">回测分析</Link>,
    },
    {
      key: '/learning',
      icon: <ReadOutlined />,
      label: <Link to="/learning">学习资源</Link>,
    }
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      theme="dark"
      width={220}
    >
      <div className={`logo ${collapsed ? 'logo-collapsed' : ''}`}>
        {collapsed ? '量化学习' : '量化交易学习平台'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        onClick={onItemClick}
      />
    </Sider>
  );
};

export default Sidebar;