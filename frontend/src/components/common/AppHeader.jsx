import React from 'react';
import { Layout, Button, Dropdown, Menu, Space } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Header } = Layout;

const pageTitles = {
  '/': '仪表盘',
  '/stock-data': '股票数据',
  '/strategy': '策略配置',
  '/backtest': '回测分析',
  '/learning': '学习资源'
};

const AppHeader = ({ collapsed, toggle }) => {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || '量化交易学习平台';

  const helpMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: '操作指南',
        },
        {
          key: '2',
          label: '常见问题',
        },
        {
          key: '3',
          label: '术语表',
        },
        {
          key: '4',
          label: '关于平台',
        },
      ]}
    />
  );

  return (
    <Header className="site-layout-background" style={{ padding: 0 }}>
      {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'trigger',
        onClick: toggle,
      })}
      <span style={{ marginLeft: 16, fontSize: 18 }}>{currentTitle}</span>
      <div className="header-right">
        <Space>
          <Dropdown overlay={helpMenu} placement="bottomRight">
            <Button type="text" icon={<QuestionCircleOutlined />} />
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;