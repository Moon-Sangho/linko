import type { SyncDiffItem } from '@shared/types/domains';
import { SyncDiffRow } from './sync-diff-row';

interface SyncDiffListProps {
  added: SyncDiffItem[];
  modified: SyncDiffItem[];
  deleted: SyncDiffItem[];
}

export function SyncDiffList({ added, modified, deleted }: SyncDiffListProps) {
  const total = added.length + modified.length + deleted.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">
        Changes ({total})
      </p>
      {added.map((item) => (
        <SyncDiffRow key={item.id} type="added" title={item.title} url={item.url} />
      ))}
      {modified.map((item) => (
        <SyncDiffRow key={item.id} type="modified" title={item.title} url={item.url} />
      ))}
      {deleted.map((item) => (
        <SyncDiffRow key={item.id} type="deleted" title={item.title} url={item.url} />
      ))}
    </div>
  );
}
