import { X } from 'lucide-react';

interface GitPanelHeaderProps {
  onClose: () => void;
}

export function GitPanelHeader({ onClose }: GitPanelHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800 flex-shrink-0">
      <span className="text-sm font-semibold text-white">Git Sync</span>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-300 transition-colors duration-75"
        aria-label="Close Git panel"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
