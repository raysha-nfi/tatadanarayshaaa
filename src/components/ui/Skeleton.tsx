import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-neutral-200/70 rounded-xl ${className}`}
    />
  );
}
