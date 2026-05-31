'use client';

import { Shovel, Sprout, Newspaper, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/src/lib/cn';
import SubscribeSection from '@/src/components/sections/forms/SubscribeSection';

interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscribeModal({ open, onOpenChange }: SubscribeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('fixed z-50 max-w-2xl max-h-[90vh] p-6 overflow-y-auto')}>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-eucalyptus-600 m-6">
            Stay Connected to The Land
          </DialogTitle>
          <DialogDescription className="px-6 mt-6 text-base/7 text-left text-charcoal-600">
            Join our mailing list to be the first to receive:
          </DialogDescription>
          <div className="px-6 text-left">
            <ul role="list" className="mt-6 space-y-4">
              <li className="flex gap-x-3">
                <Shovel className="h-5 w-5 text-eucalyptus-300 mt-0.5" />
                <span className="text-sm">
                  <strong className="font-semibold">Invitations to participate</strong> in planting
                  days, workshops and other opportunities
                </span>
              </li>
              <li className="flex gap-x-3">
                <Sprout className="h-5 w-5 text-eucalyptus-300 mt-0.5" />
                <span className="text-sm">
                  <strong className="font-semibold">Seasonal recipes</strong> that follow the rhythm
                  of our developing gardens
                </span>
              </li>
              <li className="flex gap-x-3">
                <Newspaper className="h-5 w-5 text-eucalyptus-300 mt-0.5" />
                <span className="text-sm">
                  <strong className="font-semibold">Inspiring stories</strong> of regeneration and
                  transformation of our landscape
                </span>
              </li>
            </ul>
          </div>
        </DialogHeader>
        <SubscribeSection showName={false} showInterests={false} />
      </DialogContent>
    </Dialog>
  );
}
