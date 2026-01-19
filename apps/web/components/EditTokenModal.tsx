'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EditTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  editToken: string;
}

export function EditTokenModal({
  isOpen,
  onClose,
  propertyId,
  editToken,
}: EditTokenModalProps) {
  const t = useTranslations('EditTokenModal');
  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(editToken);
      setCopied(true);
      toast.success(t('tokenCopied'));
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error(t('copyError'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('tokenLabel')}</label>
            <div className="flex gap-2">
              <Input value={editToken} readOnly className="font-mono text-sm" />
              <Button onClick={copyToken} variant="outline" size="icon">
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  {t('warningTitle')}
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
                  <li>{t('warning1')}</li>
                  <li>{t('warning2')}</li>
                  <li>{t('warning3')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} variant="default" className="w-full">
              {t('understood')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
