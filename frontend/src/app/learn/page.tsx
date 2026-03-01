'use client';

import { useState, useEffect } from 'react';
import { getStrategyLearnList } from '@/services/api';
import type { StrategyLearnDetail } from '@/types';
import { StrategySidebar, StrategyContent } from '@/components/learn';

export default function LearnPage() {
  const [strategies, setStrategies] = useState<StrategyLearnDetail[]>([]);
  const [selectedId, setSelectedId] = useState<string>('dual-ma');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStrategyLearnList();
        setStrategies(data);
      } catch (error) {
        console.error('Failed to load strategies:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadData();
  }, []);

  const selectedStrategy = strategies.find(s => s.id === selectedId) || null;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-0">
        <p className="text-text-secondary">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-1 min-h-0">
      <StrategySidebar 
        strategies={strategies} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
      />
      <StrategyContent strategy={selectedStrategy} />
    </div>
  );
}
