import { Check, Minus } from 'lucide-react';
import { Spinner } from '@renderer/components/ui/Spinner';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  isDeleting: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteRequest: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  isDeleting,
  onSelectAll,
  onDeselectAll,
  onDeleteRequest,
  onClear,
}: BulkActionBarProps) {
  const isAllSelected = selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="flex items-center gap-3 px-4 h-12 bg-gray-800 border-t border-gray-700">
      {/* Select all checkbox */}
      <button
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        disabled={isDeleting}
        className="flex-shrink-0 w-4 h-4 rounded-sm border border-gray-500 flex items-center justify-center hover:border-gray-300 transition-colors disabled:opacity-50"
      >
        {isAllSelected && <Check size={10} strokeWidth={2.5} className="text-white" />}
        {isIndeterminate && <Minus size={10} strokeWidth={2.5} className="text-gray-300" />}
      </button>

      {/* Count */}
      <span className="flex-1 text-sm text-gray-300">
        {selectedCount} selected
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDeleteRequest}
          disabled={isDeleting}
          className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors disabled:opacity-50"
        >
          {isDeleting && <Spinner size="sm" />}
          Delete {selectedCount}
        </button>
        <button
          onClick={onClear}
          disabled={isDeleting}
          className="h-7 px-3 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
