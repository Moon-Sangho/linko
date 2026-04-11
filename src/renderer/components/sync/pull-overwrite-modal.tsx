import { Modal } from '@renderer/components/ui/modal';
import { Spinner } from '@renderer/components/ui/spinner';

interface PullOverwriteModalProps {
  isOpen: boolean;
  unsyncedCount: number;
  isPulling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function PullOverwriteModal({
  isOpen,
  unsyncedCount,
  isPulling,
  onConfirm,
  onClose,
}: PullOverwriteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Overwrite local changes?"
      width={420}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isPulling}
            className="h-8 px-4 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPulling}
            className="flex items-center gap-1.5 h-8 px-4 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isPulling && <Spinner size="sm" />}
            Pull anyway
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-400">
        You have {unsyncedCount} unsynced local{' '}
        {unsyncedCount === 1 ? 'change' : 'changes'}. Pulling will replace your local bookmarks
        with the remote version.
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Push your changes first if you want to keep them.
      </p>
    </Modal>
  );
}
