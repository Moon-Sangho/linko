import { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

const variantClasses = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600',
  ghost: 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white active:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const sizeClasses = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-11 px-5 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-sans font-medium
        transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950
        disabled:pointer-events-none disabled:opacity-50
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
