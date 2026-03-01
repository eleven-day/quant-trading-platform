'use client';

import { useState, useEffect } from 'react';
import { getStrategyLearnList } from '@/services/api';
import type { StrategyLearnDetail } from '@/types';
import { StrategySidebar, StrategyContent } from '@/components/learn';
import { SkeletonRect, SkeletonText, useToast } from '@/components/common';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '请求失败，请稍后重试';
}

export default function LearnPage() {
  const { showToast } = useToast();
  const [strategies, setStrategies] = useState<StrategyLearnDetail[]>([]);
  const [selectedId, setSelectedId] = useState<string>('dual-ma');
  const [loading, setLoading] = useState<boolean>(true);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStrategyLearnList();
        setStrategies(data);
      } catch (error) {
        showToast({
          type: 'error',
          message: getErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadData();
  }, [showToast]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quant-learn-progress');
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        setLearnedIds(new Set(parsed));
      }
    } catch {
      // localStorage 不可用或数据损坏，忽略
    }
  }, []);

  useEffect(() => {
    // 如果已经学过，不需要计时
    if (learnedIds.has(selectedId)) return;
    
    const timer = setTimeout(() => {
      setLearnedIds(prev => {
        const next = new Set(prev);
        next.add(selectedId);
        // 持久化到 localStorage
        try {
          localStorage.setItem('quant-learn-progress', JSON.stringify([...next]));
        } catch {
          // 忽略 localStorage 错误
        }
        return next;
      });
    }, 3000);
    
    return () => { clearTimeout(timer); };
  }, [selectedId, learnedIds]);

  const strategiesWithProgress = strategies.map(s => ({
    ...s,
    status: learnedIds.has(s.id) ? '已学' as const : s.status,
  }));

  const selectedStrategy = strategiesWithProgress.find(s => s.id === selectedId) || null;

  if (loading) {
    return (
      <div className="flex flex-row flex-1 min-h-0">
        <div className="w-[280px] bg-bg-inset h-full py-[16px] px-[16px] flex flex-col gap-3">
          <SkeletonRect width="36%" height={14} />
          <SkeletonRect height={64} />
          <SkeletonRect height={64} />
          <SkeletonRect height={64} />
          <SkeletonRect height={64} />
        </div>
        <div className="flex-1 p-[24px_32px] flex flex-col gap-[24px] overflow-hidden">
          <div className="flex flex-row items-center justify-between">
            <SkeletonRect width="32%" height={30} />
            <SkeletonRect width={96} height={28} roundedClassName="rounded-[6px]" />
          </div>
          <div className="flex flex-col gap-4">
            <SkeletonRect width={120} height={18} />
            <SkeletonText lines={4} lineHeight={12} />
            <SkeletonRect height={120} roundedClassName="rounded-[var(--radius-card)]" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <SkeletonRect width={220} height={18} />
            <SkeletonRect height="100%" className="flex-1 min-h-[260px]" roundedClassName="rounded-[var(--radius-card)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-1 min-h-0">
      <StrategySidebar 
        strategies={strategiesWithProgress} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
      />
      <StrategyContent strategy={selectedStrategy} />
    </div>
  );
}
