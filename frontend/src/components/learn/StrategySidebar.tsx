import type { StrategyLearnDetail } from '@/types';

export interface StrategySidebarProps {
  strategies: StrategyLearnDetail[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function StrategySidebar({ strategies, selectedId, onSelect }: StrategySidebarProps) {
  return (
    <div className="w-[280px] bg-bg-inset h-full py-[16px] flex flex-col">
      <div className="pl-[16px] text-text-secondary font-semibold text-[13px] mb-[12px]">
        策略列表
      </div>
      <div className="flex flex-col gap-[4px]">
        {strategies.map((strategy) => {
          const isActive = strategy.id === selectedId;
          
          let badgeBg = '';
          let badgeText = '';
          
          if (strategy.status === '已学') {
            badgeBg = 'bg-[#22D3EE20]';
            badgeText = 'text-accent';
          } else if (strategy.status === '学习中') {
            badgeBg = 'bg-[#47556920]';
            badgeText = 'text-text-secondary';
          } else {
            badgeBg = 'bg-[#47556920]';
            badgeText = 'text-text-tertiary';
          }

          return (
            <div
              key={strategy.id}
              onClick={() => onSelect(strategy.id)}
              className={`p-[12px_16px] flex flex-row items-center gap-[12px] cursor-pointer transition-colors ${
                isActive ? 'bg-bg-card' : 'hover:bg-bg-card/50'
              }`}
            >
              {/* Left dot */}
              <div 
                className={`w-[6px] h-[6px] rounded-[3px] flex-shrink-0 ${
                  isActive ? 'bg-accent' : 'bg-[#475569]'
                }`} 
              />
              
              {/* Middle content */}
              <div className="flex-1 flex flex-col">
                <div className={`text-[14px] font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                  {strategy.name}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {strategy.shortDesc}
                </div>
              </div>
              
              {/* Right badge */}
              <div className={`rounded-[4px] p-[2px_8px] text-[10px] font-medium ${badgeBg} ${badgeText}`}>
                {strategy.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
