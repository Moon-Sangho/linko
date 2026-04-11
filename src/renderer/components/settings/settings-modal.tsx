import { useState } from 'react';
import { Modal } from '@renderer/components/ui/modal';
import { SyncSettingsTab } from './sync-settings-tab';
import { cn } from '@renderer/lib/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'general' | 'sync';
}

type Tab = 'general' | 'sync';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'sync', label: 'Sync' },
];

export function SettingsModal({ isOpen, onClose, initialTab = 'general' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" width={480}>
      <div className="flex gap-1 mb-6 border-b border-gray-800 -mt-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-gray-600">No general settings yet.</p>
        </div>
      )}

      {activeTab === 'sync' && <SyncSettingsTab />}
    </Modal>
  );
}
