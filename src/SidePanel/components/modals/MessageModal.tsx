import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ReactNode } from 'react';

interface MessageModalProps {
  title: string
  children: ReactNode
}

export default function MessageModal({ title, children }: MessageModalProps) {
  return (
    <AlertDialog.Root defaultOpen={true}>
      <AlertDialog.Trigger />
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 w-dvw h-dvh bg-gray-700 opacity-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-dvw max-w-[85dvw] sm:max-w-lg max-h-[85dvh] min-h-32 p-8 text-2xl bg-white shadow-lg rounded-sm">
          <AlertDialog.Title className="text-gray-700 font-bold mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-base text-gray-700">
            {children}
          </AlertDialog.Description>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}