import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  percentage,
  showLabel = false,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  // Color logic according to budget risk:
  // < 80%: brand sage
  // 80% - 99%: amber warning
  // >= 100%: red danger
  let color = 'bg-brand-500';
  if (clamped >= 100) color = 'bg-red-500';
  else if (clamped >= 80) color = 'bg-amber-500';

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-neutral-500">Terpakai</span>
          <span className={clamped >= 100 ? 'text-red-600 font-bold' : clamped >= 80 ? 'text-amber-600 font-bold' : 'text-neutral-800'}>
            {clamped}%
          </span>
        </div>
      )}
      <div className={`w-full bg-neutral-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${color} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
