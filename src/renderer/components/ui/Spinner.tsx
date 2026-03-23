import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@renderer/lib/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-white/20 border-t-white',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 border',
        md: 'h-4 w-4 border-2',
        lg: 'h-6 w-6 border-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}
