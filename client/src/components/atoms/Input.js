import React from 'react';
import { Input as AntInput } from 'antd';
import styled from 'styled-components';

const StyledInput = styled(AntInput)`
  &.ant-input {
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
    
    &:focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
`;

const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  size = 'middle',
  disabled = false,
  prefix,
  suffix,
  ...props 
}) => {
  return (
    <StyledInput
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      size={size}
      disabled={disabled}
      prefix={prefix}
      suffix={suffix}
      {...props}
    />
  );
};

export default Input;
