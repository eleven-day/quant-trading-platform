import React from 'react';
import { Table, Empty, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface DataTableProps<T> {
  dataSource: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  pagination?: boolean | { pageSize?: number; simple?: boolean };
  scroll?: { x?: number | string; y?: number | string };
  rowKey?: string;
  size?: 'small' | 'middle' | 'large';
}

function DataTable<T extends object>({
  dataSource,
  columns,
  loading = false,
  pagination = { pageSize: 10, simple: true },
  scroll,
  rowKey = 'id',
  size = 'middle',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin tip="数据加载中..." />
      </div>
    );
  }

  if (!dataSource || dataSource.length === 0) {
    return <Empty description="暂无数据" />;
  }

  return (
    <Table<T>
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      scroll={scroll}
      rowKey={rowKey}
      size={size}
    />
  );
}

export default DataTable;