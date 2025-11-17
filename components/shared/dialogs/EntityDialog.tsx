'use client';

import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EntityDialogProps {
  trigger?: ReactNode;
  title: string;
  description?: string;
  content: (onClose: () => void) => ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  position?: 'center' | 'top';
}

export function EntityDialog({
  trigger,
  title,
  description,
  content,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  maxWidth = 'md',
  position = 'center',
}: EntityDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  };

  const positionClasses = {
    center: '',
    top: 'top-8 left-1/2 -translate-x-1/2 translate-y-0',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={`${maxWidthClasses[maxWidth]} ${positionClasses[position]}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || "Completa los datos para continuar."}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-200px)]">
          {content(() => setOpen(false))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
