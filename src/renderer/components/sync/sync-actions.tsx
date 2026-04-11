import { ArrowDown, ArrowUp } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Spinner } from '@renderer/components/ui/spinner';

interface SyncActionsProps {
  isPushing: boolean;
  isPulling: boolean;
  isDisabled: boolean;
  onPush: () => void;
  onPull: () => void;
}

export function SyncActions({
  isPushing,
  isPulling,
  isDisabled,
  onPush,
  onPull,
}: SyncActionsProps) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="flex gap-1.5 px-4 py-3">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={onPush}
              disabled={isDisabled || isPushing}
              className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-xs font-medium text-gray-400 bg-gray-800 hover:bg-gray-700/80 hover:text-gray-300 disabled:opacity-40 transition-colors duration-75"
            >
              {isPushing ? <Spinner size="sm" /> : <ArrowUp size={11} strokeWidth={1.5} />}
              <span>{isPushing ? 'Pushing…' : 'Push'}</span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="bottom"
              sideOffset={6}
              className="max-w-48 bg-gray-800 text-gray-300 text-xs px-2.5 py-1.5 rounded shadow-lg border border-gray-700 z-50 leading-relaxed"
            >
              Upload local bookmarks to the remote repository.
              <Tooltip.Arrow className="fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={onPull}
              disabled={isDisabled || isPulling}
              className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-xs font-medium text-gray-400 bg-gray-800 hover:bg-gray-700/80 hover:text-gray-300 disabled:opacity-40 transition-colors duration-75"
            >
              {isPulling ? <Spinner size="sm" /> : <ArrowDown size={11} strokeWidth={1.5} />}
              <span>{isPulling ? 'Pulling…' : 'Pull'}</span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="bottom"
              sideOffset={6}
              className="max-w-48 bg-gray-800 text-gray-300 text-xs px-2.5 py-1.5 rounded shadow-lg border border-gray-700 z-50 leading-relaxed"
            >
              Download bookmarks from the remote repository and replace local data.
              <Tooltip.Arrow className="fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}
