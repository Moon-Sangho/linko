import { type ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-gray-400">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm font-medium text-white">{title}</p>
        {description && (
          <p className="font-sans text-sm text-gray-400">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
