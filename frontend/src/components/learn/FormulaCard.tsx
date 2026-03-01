import type { StrategyLearnDetail } from '@/types';

export interface FormulaCardProps {
  formulas: StrategyLearnDetail['formulas'];
}

export function FormulaCard({ formulas }: FormulaCardProps) {
  if (!formulas || formulas.length === 0) return null;

  return (
    <div className="w-full bg-bg-inset rounded-[8px] p-[16px_20px] flex flex-col gap-[12px]">
      <div className="text-text-secondary text-[13px] font-semibold">公式</div>
      {formulas.map((formula, index) => (
        <div 
          key={index} 
          className={`font-mono ${index === 0 ? 'text-[14px]' : 'text-[13px]'}`}
          style={{ color: formula.color }}
        >
          {formula.code.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
