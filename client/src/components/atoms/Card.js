import React from 'react';
import { Card as AntCard } from 'antd';
import styled from 'styled-components';

const StyledCard = styled(AntCard)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(45deg, #f8f9fa, #ffffff);
    border-radius: 12px 12px 0 0;
  }
  
  .ant-card-body {
    padding: 24px;
  }
  
  &.compact {
    .ant-card-body {
      padding: 16px;
    }
  }
  
  &.bordered {
    border: 2px solid #1890ff;
  }
`;

const Card = ({ 
  children, 
  title, 
  extra,
  size = 'default',
  bordered = false,
  hoverable = true,
  className = '',
  ...props 
}) => {
  const cardClassName = `${size === 'small' ? 'compact' : ''} ${bordered ? 'bordered' : ''} ${className}`;

  return (
    <StyledCard
      title={title}
      extra={extra}
      hoverable={hoverable}
      className={cardClassName}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
