import React from 'react';
import { Table, Tag, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Button from '../atoms/Button';

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: linear-gradient(45deg, #f8f9fa, #ffffff);
    border-bottom: 2px solid #1890ff;
    font-weight: 600;
    color: #262626;
  }
  
  .ant-table-tbody > tr:hover > td {
    background: #f0f7ff !important;
  }
  
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const ActionButtons = styled(Space)`
  .ant-btn {
    border: none;
    box-shadow: none;
    padding: 4px 8px;
    height: auto;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const StrategyTable = ({ 
  strategies = [], 
  loading = false, 
  onView, 
  onEdit, 
  onDelete,
  onRun 
}) => {
  const getStatusColor = (status) => {
    const colorMap = {
      'draft': 'orange',
      'active': 'green',
      'archived': 'gray'
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status) => {
    const textMap = {
      'draft': '草稿',
      'active': '活跃',
      'archived': '已归档'
    };
    return textMap[status] || status;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '暂无描述'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '草稿', value: 'draft' },
        { text: '活跃', value: 'active' },
        { text: '已归档', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <ActionButtons>
          <Button
            size="small"
            variant="primary"
            onClick={() => onView && onView(record)}
            title="查看"
          >
            <EyeOutlined />
          </Button>
          <Button
            size="small"
            variant="default"
            onClick={() => onEdit && onEdit(record)}
            title="编辑"
          >
            <EditOutlined />
          </Button>
          <Button
            size="small"
            variant="success"
            onClick={() => onRun && onRun(record)}
            title="运行回测"
          >
            运行
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => onDelete && onDelete(record)}
            title="删除"
          >
            <DeleteOutlined />
          </Button>
        </ActionButtons>
      ),
    },
  ];

  return (
    <StyledTable
      columns={columns}
      dataSource={strategies}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `第 ${range[0]}-${range[1]} 条，共 ${total} 条策略`,
      }}
      scroll={{ x: 800 }}
    />
  );
};

export default StrategyTable;
