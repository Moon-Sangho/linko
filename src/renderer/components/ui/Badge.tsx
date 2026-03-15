import { type HTMLAttributes } from 'react';

const variantClasses = {
  default: 'bg-gray-800 text-white',
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  gray: 'bg-gray-700 text-gray-400',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'green' | 'red' | 'gray';
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export function Badge({
  variant = 'default',
  size = 'sm',
  onRemove,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-sans font-medium
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 focus:outline-none"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
