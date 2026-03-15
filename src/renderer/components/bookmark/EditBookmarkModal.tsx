// Implemented by /agent-dev-core — this is a stub placeholder
import type { Bookmark } from '@shared/types';

interface EditBookmarkModalProps {
  bookmark: Bookmark;
  onClose: () => void;
}

export function EditBookmarkModal({ onClose }: EditBookmarkModalProps) {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg p-6 text-gray-300" onClick={(e) => e.stopPropagation()}>
        EditBookmarkModal — pending implementation
      </div>
    </div>
  );
}
