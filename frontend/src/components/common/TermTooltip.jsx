import React, { useContext } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TermContext from '../../contexts/TermContext';
import { commonTerms } from '../../utils/glossary';

const TermTooltip = ({ term, children }) => {
  const { termsData } = useContext(TermContext);
  
  // 首先检查上下文中是否有该术语，如果没有则使用commonTerms中的解释
  const definition = termsData[term] || commonTerms[term] || '暂无解释';
  
  return (
    <Tooltip title={definition} color="#2db7f5">
      <span className="term-tooltip">
        {children || term} <QuestionCircleOutlined style={{ fontSize: '12px' }} />
      </span>
    </Tooltip>
  );
};

export default TermTooltip;