import { Modal } from '@renderer/components/ui/Modal';
import { Spinner } from '@renderer/components/ui/Spinner';

interface BulkDeleteModalProps {
  isOpen: boolean;
  count: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BulkDeleteModal({
  isOpen,
  count,
  isDeleting,
  onConfirm,
  onCancel,
}: BulkDeleteModalProps) {
  const label = `bookmark${count === 1 ? '' : 's'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={`Delete ${count} ${label}?`}
      width={400}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="h-8 px-4 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 h-8 px-4 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting && <Spinner size="sm" />}
            Delete {count}
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-400">
        This will permanently delete {count} {label}. This cannot be undone.
      </p>
    </Modal>
  );
}
