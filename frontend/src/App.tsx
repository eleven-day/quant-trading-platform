import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import StockAnalysis from './pages/StockAnalysis';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/stock" replace />} />
            <Route path="stock" element={<StockAnalysis />} />
            {/* 其他页面路由可以后续添加 */}
            <Route path="*" element={<Navigate to="/stock" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;