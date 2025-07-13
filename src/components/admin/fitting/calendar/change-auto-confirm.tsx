'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

export function ChangeAutoConfirm() {
  const [isAutoConfirm, setIsAutoConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleAutoConfirm = async (enabled: boolean) => {
    setIsAutoConfirm(enabled);
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAutoConfirm: enabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update auto-confirm setting');
      }

      setSuccess(
        enabled
          ? 'Auto-confirm diaktifkan. Semua booking baru akan otomatis dikonfirmasi.'
          : 'Auto-confirm dinonaktifkan. Booking baru memerlukan konfirmasi manual.',
      );
    } catch (err) {
      setError('Gagal mengubah pengaturan auto-confirm');
      setIsAutoConfirm(!enabled);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Auto-confirm booking</p>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3" />
            </TooltipTrigger>
            <TooltipContent className="max-w-80 text-center">
              <p>
                Ketika diaktifkan, semua booking baru akan otomatis dikonfirmasi
                tanpa perlu approval manual. Slot yang dibuat dengan
                auto-confirm akan langsung tersedia untuk customer.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-4">
        <Switch
          checked={isAutoConfirm}
          onCheckedChange={handleToggleAutoConfirm}
          disabled={isSaving}
        />
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          <span className="text-sm">
            {isAutoConfirm ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      </div>

      {success && (
        <Alert variant="default">
          <CheckCircle className="size-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Catatan:</strong> Pengaturan ini akan mempengaruhi semua slot
          fitting yang akan dibuat. Slot yang sudah ada tidak akan terpengaruh
          oleh perubahan ini.
        </p>
      </div>
    </div>
  );
}
