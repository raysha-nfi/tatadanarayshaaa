import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'pro';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variants = {
    brand: 'bg-[#afc28a]/20 text-[#3b4728] border border-[#afc28a]/50 font-bold',
    pro: 'bg-gradient-to-r from-[#afc28a] to-[#fdcfd4] text-neutral-900 font-extrabold shadow-sm shadow-[#afc28a]/20 border border-white/60',
    success: 'bg-[#afc28a]/25 text-[#3b4728] border border-[#afc28a]/60 font-semibold',
    warning: 'bg-[#fdcfd4]/50 text-[#7a2e38] border border-[#fdcfd4] font-semibold',
    danger: 'bg-red-50 text-red-700 border border-red-200/60',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
