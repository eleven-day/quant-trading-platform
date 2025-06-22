import React from 'react';
import { Button as AntButton } from 'antd';
import styled from 'styled-components';

const StyledButton = styled(AntButton)`
  /* 自定义样式 */
  &.primary {
    background: linear-gradient(45deg, #1890ff, #36cfc9);
    border: none;
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
    
    &:hover {
      background: linear-gradient(45deg, #40a9ff, #5cdbd3);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.4);
    }
  }
  
  &.success {
    background: linear-gradient(45deg, #52c41a, #73d13d);
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #73d13d, #95de64);
    }
  }
  
  &.danger {
    background: linear-gradient(45deg, #ff4d4f, #ff7875);
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #ff7875, #ffa39e);
    }
  }
  
  transition: all 0.3s ease;
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'middle', 
  loading = false,
  disabled = false,
  onClick,
  ...props 
}) => {
  return (
    <StyledButton
      type={variant === 'primary' ? 'primary' : 'default'}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      className={variant}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
