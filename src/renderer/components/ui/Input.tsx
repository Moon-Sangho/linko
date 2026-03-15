import { type InputHTMLAttributes, type ReactNode } from 'react';

const sizeClasses = {
  sm: 'h-7 text-xs px-2.5',
  md: 'h-9 text-sm px-3',
};

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  leftIcon?: ReactNode;
  error?: string;
}

export function Input({
  size = 'md',
  leftIcon,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-2.5 flex items-center text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          className={`
            w-full rounded-md border bg-gray-900 font-sans text-white placeholder-gray-500
            transition-colors duration-100
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-gray-950
            disabled:opacity-50
            ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'}
            ${leftIcon ? 'pl-8' : ''}
            ${sizeClasses[size]} ${className}
          `.trim()}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
