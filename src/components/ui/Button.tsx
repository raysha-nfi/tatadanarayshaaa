import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#afc28a] hover:bg-[#97aa71] text-neutral-900 font-bold shadow-sm shadow-[#afc28a]/40 focus:ring-[#afc28a] active:scale-[0.98]',
    secondary: 'bg-[#fdcfd4]/40 hover:bg-[#fdcfd4]/80 text-[#7a2e38] border border-[#fdcfd4] focus:ring-[#fdcfd4]',
    outline: 'border border-[#afc28a]/50 hover:border-[#afc28a] text-neutral-800 bg-white hover:bg-[#afc28a]/10 focus:ring-[#afc28a]',
    ghost: 'text-neutral-700 hover:text-neutral-950 hover:bg-[#afc28a]/15 focus:ring-[#afc28a]',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 focus:ring-red-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
