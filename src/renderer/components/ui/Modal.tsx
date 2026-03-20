import { type CSSProperties, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ isOpen, onClose, title, children, footer, width }: ModalProps) {
  const style: CSSProperties = width ? { maxWidth: width } : {};

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          style={style}
          className="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-900 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <Dialog.Title className="mb-4 font-sans text-base font-semibold text-white">
              {title}
            </Dialog.Title>
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 border-t border-gray-800">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
