import React, { useState } from 'react';
import type { Tag } from '@shared/types/domains';
import { useDeleteTagMutation } from '@renderer/hooks/mutations/use-delete-tag-mutation';
import { useUpdateTagMutation } from '@renderer/hooks/mutations/use-update-tag-mutation';
import { useUIStore } from '@renderer/store/use-ui-store';
import { overlay } from '@renderer/overlay/control';
import { TagDeleteModal } from './tag-delete-modal';
import { TagBadge } from './tag-badge';
import { TagContextMenu } from './tag-context-menu';

type ItemState = 'idle' | 'renaming';

interface TagFilterItemProps {
  tag: Tag;
  isActive: boolean;
  onClick: () => void;
}

export function TagFilterItem({ tag, isActive, onClick }: TagFilterItemProps) {
  const [state, setState] = useState<ItemState>('idle');
  const [renameValue, setRenameValue] = useState(tag.name);
  const { mutate: updateTag } = useUpdateTagMutation();
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTagMutation();
  const { selectedTagIds, clearTags } = useUIStore();

  function handleRename() {
    setRenameValue(tag.name);
    setState('renaming');
  }

  function handleDelete() {
    overlay.open(({ isOpen, close }) => (
      <TagDeleteModal
        isOpen={isOpen}
        tagName={tag.name}
        isDeleting={isDeleting}
        onClose={close}
        onConfirm={() => {
          deleteTag(tag.id, {
            onSuccess: () => {
              close();
              if (selectedTagIds.includes(tag.id)) clearTags();
            },
          });
        }}
      />
    ));
  }

  function cancelRename() {
    setRenameValue(tag.name);
    setState('idle');
  }

  function submitRename(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      cancelRename();
      return;
    }
    updateTag(
      { id: tag.id, input: { name: trimmed } },
      {
        onSuccess: () => setState('idle'),
        onError: () => cancelRename(),
      },
    );
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === 'Enter') {
      submitRename(renameValue);
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  }

  if (state === 'renaming') {
    return (
      <div className="flex items-center gap-1.5 px-2 h-7">
        <span className="text-gray-600 text-xs select-none">#</span>
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleRenameKeyDown}
          onBlur={() => submitRename(renameValue)}
          className="bg-gray-800 border border-blue-500 rounded-md text-sm text-white px-2 flex-1 min-w-0 outline-none h-full"
        />
        {tag.count !== undefined && (
          <span className="text-[10px] tabular-nums text-gray-600">{tag.count}</span>
        )}
      </div>
    );
  }

  return (
    <TagContextMenu onRename={handleRename} onDelete={handleDelete}>
      <TagBadge tag={tag} isActive={isActive} onClick={onClick} count={tag.count} />
    </TagContextMenu>
  );
}
