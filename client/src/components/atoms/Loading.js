import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 1000;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  &.small {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
  
  &.large {
    width: 60px;
    height: 60px;
    border-width: 6px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-left: 12px;
  color: #666;
  font-size: 14px;
`;

const Loading = ({ 
  size = 'default', 
  text = '加载中...', 
  fullscreen = false,
  showText = true 
}) => {
  return (
    <LoadingContainer className={fullscreen ? 'fullscreen' : ''}>
      <Spinner className={size} />
      {showText && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

export default Loading;
