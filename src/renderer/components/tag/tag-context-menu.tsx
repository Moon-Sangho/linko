import * as ContextMenu from '@radix-ui/react-context-menu';
import { Pencil, Trash2 } from 'lucide-react';

interface TagContextMenuProps {
  children: React.ReactNode;
  onRename: () => void;
  onDelete: () => void;
}

export function TagContextMenu({ children, onRename, onDelete }: TagContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="bg-[#111827] border border-[#1f2937] rounded-lg shadow-lg p-1 min-w-[140px] z-50">
          <ContextMenu.Item
            onSelect={onRename}
            className="flex items-center gap-2 px-2.5 h-7 rounded-md text-sm text-gray-200 cursor-default select-none outline-none hover:bg-gray-800"
          >
            <Pencil size={14} className="text-gray-400" />
            Rename
          </ContextMenu.Item>
          <div className="my-1 border-t border-[#1f2937]" />
          <ContextMenu.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-2.5 h-7 rounded-md text-sm text-red-400 cursor-default select-none outline-none hover:bg-[#2d1515]"
          >
            <Trash2 size={14} />
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
