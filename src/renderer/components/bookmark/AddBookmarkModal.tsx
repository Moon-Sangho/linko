// Implemented by /agent-dev-core — this is a stub placeholder
interface AddBookmarkModalProps {
  onClose: () => void;
}

export function AddBookmarkModal({ onClose }: AddBookmarkModalProps) {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg p-6 text-gray-300" onClick={(e) => e.stopPropagation()}>
        AddBookmarkModal — pending implementation
      </div>
    </div>
  );
}
