import { type ReactNode } from 'react';

interface ActionProps {
  label: string;
  onClick: () => void;
  shortcut?: string;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ActionProps;
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
      {action && (
        <div className="mt-1">
          <button
            onClick={action.onClick}
            className="flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
          >
            {action.label}
            {action.shortcut && (
              <kbd className="rounded bg-gray-700 px-1 py-0.5 text-xs text-gray-400">{action.shortcut}</kbd>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
