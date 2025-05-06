import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { getStockSpotData } from '../../services/stockService';
import { StockSpotData } from '../../types/stock';

const { Option } = Select;

interface SymbolSearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const SymbolSearchInput: React.FC<SymbolSearchInputProps> = ({
  value,
  onChange,
  placeholder = '输入股票代码或名称',
  style,
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [options, setOptions] = useState<StockSpotData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 搜索股票
  const searchStocks = async (searchText: string) => {
    if (!searchText || searchText.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      // 获取股票列表
      const allStocks = await getStockSpotData();
      
      // 筛选符合条件的股票
      const filteredStocks = allStocks.filter(
        stock =>
          stock.symbol.includes(searchText) || 
          stock.name.includes(searchText)
      );
      
      // 限制最多显示10条记录
      setOptions(filteredStocks.slice(0, 10));
    } catch (error) {
      console.error('Failed to search stocks:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // 使用防抖优化搜索
  const debouncedSearch = debounce(searchStocks, 500);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (text: string) => {
    setSearchValue(text);
    debouncedSearch(text);
  };

  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={loading ? <Spin size="small" /> : null}
      style={{ width: 200, ...style }}
      suffixIcon={<SearchOutlined />}
    >
      {options.map((stock) => (
        <Option key={stock.symbol} value={stock.symbol}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{stock.symbol}</span>
            <span>{stock.name}</span>
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default SymbolSearchInput;