import { Modal } from '@renderer/components/ui/modal';
import { Spinner } from '@renderer/components/ui/spinner';

interface TagDeleteModalProps {
  isOpen: boolean;
  tagName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function TagDeleteModal({ isOpen, tagName, isDeleting, onConfirm, onClose }: TagDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete "${tagName}"?`}
      width={400}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
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
            Delete
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-400">
        The tag will be removed. Bookmarks with this tag will not be deleted.
      </p>
    </Modal>
  );
}
