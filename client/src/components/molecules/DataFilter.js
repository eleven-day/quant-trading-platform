import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Space, Button } from 'antd';
import { CalendarOutlined, StockOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { dataService } from '../../services';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FilterContainer = styled.div`
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const FilterTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #262626;
  font-weight: 600;
`;

const DataFilter = ({
  symbol,
  onSymbolChange,
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  onRefresh
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const periodOptions = [
    { value: 'daily', label: '日线' },
    { value: 'weekly', label: '周线' },
    { value: 'monthly', label: '月线' }
  ];

  // 常用股票代码
  const commonStocks = [
    { symbol: '000001', name: '平安银行' },
    { symbol: '000002', name: '万科A' },
    { symbol: '600000', name: '浦发银行' },
    { symbol: '600519', name: '贵州茅台' },
    { symbol: '600036', name: '招商银行' },
    { symbol: '000858', name: '五粮液' }
  ];

  const handleSearch = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await dataService.searchStocks(keyword);
      if (response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('搜索股票失败：', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <FilterContainer>
      <FilterTitle>
        <StockOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        数据筛选
      </FilterTitle>
      
      <Space wrap size="middle">
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: '#666' }}>
            股票代码
          </label>
          <Select
            value={symbol}
            onChange={onSymbolChange}
            style={{ width: 200 }}
            showSearch
            placeholder="输入股票代码或名称"
            optionFilterProp="children"
            onSearch={handleSearch}
            loading={searching}
            filterOption={false}
            notFoundContent={searching ? '搜索中...' : '暂无数据'}
          >
            {/* 常用股票 */}
            {commonStocks.map(stock => (
              <Option key={stock.symbol} value={stock.symbol}>
                {stock.symbol} - {stock.name}
              </Option>
            ))}
            
            {/* 搜索结果 */}
            {searchResults.map(stock => (
              <Option key={stock.symbol} value={stock.symbol}>
                {stock.symbol} - {stock.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: '#666' }}>
            数据周期
          </label>
          <Select
            value={period}
            onChange={onPeriodChange}
            style={{ width: 100 }}
          >
            {periodOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: '#666' }}>
            时间范围
          </label>
          <RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
            suffixIcon={<CalendarOutlined />}
            style={{ width: 240 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: 'transparent' }}>
            操作
          </label>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          >
            刷新数据
          </Button>
        </div>
      </Space>
    </FilterContainer>
  );
};

export default DataFilter;
