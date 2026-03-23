import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@renderer/lib/cn';
import { Spinner } from './Spinner';

const inputVariants = cva(
  'w-full rounded-md border bg-gray-900 font-sans text-white placeholder-gray-500 transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-gray-950 disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-7 text-xs px-2.5',
        md: 'h-9 text-sm px-3',
      },
      hasError: {
        true: 'border-red-500',
        false: 'border-gray-700 hover:border-gray-600',
      },
      hasLeftIcon: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { hasLeftIcon: true, size: 'sm', class: 'pl-7' },
      { hasLeftIcon: true, size: 'md', class: 'pl-8' },
    ],
    defaultVariants: {
      size: 'md',
      hasError: false,
      hasLeftIcon: false,
    },
  },
);

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Pick<VariantProps<typeof inputVariants>, 'size'> {
  leftIcon?: ReactNode;
  error?: string;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', leftIcon, error, isLoading, className, ...props },
  ref,
) {
  const errorId = useId();

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-2.5 flex items-center text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            inputVariants({ size, hasError: !!error, hasLeftIcon: !!leftIcon }),
            isLoading && 'pr-8',
            className,
          )}
          {...props}
        />
        {isLoading && (
          <span className="pointer-events-none absolute right-2.5 flex items-center text-gray-400">
            <Spinner size="sm" />
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
