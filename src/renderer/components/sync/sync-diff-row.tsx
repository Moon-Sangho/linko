import { cn } from '@renderer/lib/cn';

type DiffType = 'added' | 'modified' | 'deleted';

interface SyncDiffRowProps {
  type: DiffType;
  title: string | null;
  url: string;
}

const styleMap: Record<DiffType, { container: string; title: string }> = {
  added: {
    container: 'bg-green-500/10 border-l-2 border-green-500',
    title: 'text-green-400',
  },
  modified: {
    container: 'bg-amber-500/10 border-l-2 border-amber-500',
    title: 'text-amber-400',
  },
  deleted: {
    container: 'bg-red-500/10 border-l-2 border-red-500',
    title: 'text-red-400',
  },
};

export function SyncDiffRow({ type, title, url }: SyncDiffRowProps) {
  const styles = styleMap[type];
  return (
    <div className={cn('px-4 py-2.5', styles.container)}>
      <p className={cn('text-xs font-medium truncate', styles.title)}>{title ?? 'Untitled'}</p>
      <p className="text-xs text-gray-500 truncate mt-0.5">{url}</p>
    </div>
  );
}
