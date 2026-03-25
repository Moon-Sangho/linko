import type { Tag } from '@shared/types/domains';
import { cn } from '@renderer/lib/cn';

interface TagCheckboxListProps {
  tags: Tag[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export function TagCheckboxList({ tags, selectedIds, onToggle }: TagCheckboxListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const checked = selectedIds.includes(tag.id);
        return (
          <label
            key={tag.id}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded cursor-pointer',
              'border transition-colors duration-[80ms]',
              checked
                ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)]',
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => onToggle(tag.id)}
            />
            {tag.name}
          </label>
        );
      })}
    </div>
  );
}
