import { type HTMLAttributes } from 'react';

const sizeClasses = {
  sm: 'h-3 w-3 border',
  md: 'h-4 w-4 border-2',
  lg: 'h-6 w-6 border-2',
};

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md', className = '', ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-white/20 border-t-white ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
