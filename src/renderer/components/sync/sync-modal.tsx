import { Modal } from '@renderer/components/ui/modal';
import { SyncSettingsTab } from '@renderer/components/settings/sync-settings-tab';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncModal({ isOpen, onClose }: SyncModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Git Sync" width={480}>
      <SyncSettingsTab />
    </Modal>
  );
}
