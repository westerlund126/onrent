'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Text,
  User,
  Trash2,
  Package,
  Receipt,
  Maximize2,
  X,
} from 'lucide-react';
import { useScheduleStore } from 'stores/useScheduleStore';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import type {
  ICalendarEvent,
  IFittingSchedule,
  IScheduleBlock,
} from 'types/fitting';

interface IProps {
  schedule: ICalendarEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ schedule, children }: IProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImageMaximized, setIsImageMaximized] = useState(false); 

  const { removeScheduleBlock, isLoading } = useScheduleStore();

  const isFittingEvent = schedule.type === 'fitting';
  const isBlockEvent = schedule.type === 'block';

  const fittingData = isFittingEvent
    ? (schedule.originalData as IFittingSchedule)
    : null;
  const blockData = isBlockEvent
    ? (schedule.originalData as IScheduleBlock)
    : null;

  const handleDelete = async () => {
    if (!blockData) return;
    try {
      await removeScheduleBlock(blockData.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to delete schedule block:', error);
    }
  };

  const formatUTCDateTime = (date: Date) => {
    const utcDay = date.getUTCDate();
    const utcMonth = date.getUTCMonth();
    const utcYear = date.getUTCFullYear();
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();

    const dayNames = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Ags',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    const dayName = dayNames[date.getUTCDay()];
    const monthName = monthNames[utcMonth];

    const formattedDate = `${dayName}, ${utcDay} ${monthName} ${utcYear} ${utcHours
      .toString()
      .padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;

    return formattedDate;
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsImageMaximized(false);
    }
    setIsOpen(open);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFittingEvent &&
                `Jadwal Fitting: ${fittingData?.user.first_name}`}
              {isBlockEvent && 'Detail Waktu yang Diblokir'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {isFittingEvent && fittingData && (
              <div className="flex items-start gap-3">
                <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Pelanggan</p>
                  <p className="text-sm text-muted-foreground">
                    {fittingData.user.first_name} {fittingData.user.last_name}
                  </p>
                </div>
              </div>
            )}
            
            {isFittingEvent && fittingData && fittingData.FittingProduct && fittingData.FittingProduct.length > 0 && (
                <div className="flex items-start gap-3">
                    <Package className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Produk Fitting</p>
                        {fittingData.FittingProduct.map((item) => (
                            <p key={item.variantProductId} className="text-sm text-muted-foreground">
                                {item.variantProduct.products.name} - Varian: {item.variantProduct.size}, {item.variantProduct.color}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Waktu Mulai</p>
                <p className="text-sm text-muted-foreground">
                  {formatUTCDateTime(schedule.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Waktu Selesai</p>
                <p className="text-sm text-muted-foreground">
                  {formatUTCDateTime(schedule.endTime)}
                </p>
              </div>
            </div>

            {isFittingEvent && fittingData?.tfProofUrl && (
              <div className="flex items-start gap-3">
                <Receipt className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bukti Transfer</p>
                  <div className="relative mt-1 w-24 h-24 cursor-pointer group">
                    <img
                      src={fittingData.tfProofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-full rounded-md object-cover"
                      onClick={() => setIsImageMaximized(true)}
                    />
                    <div 
                      onClick={() => setIsImageMaximized(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="size-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Deskripsi</p>
                <p className="text-sm text-muted-foreground">
                  {fittingData?.note ||
                    blockData?.description ||
                    'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>
          </div>

          {isBlockEvent && blockData && (
            <DialogFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    <Trash2 className="mr-2 size-4" />
                    {isLoading ? 'Menghapus...' : 'Hapus Blok Jadwal'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus jadwal blok secara permanen.
                      Slot waktu ini akan tersedia kembali untuk pemesanan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {isImageMaximized && fittingData?.tfProofUrl && (
        <div 
          className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsImageMaximized(false)}
        >
          <img
            src={fittingData.tfProofUrl}
            alt="Bukti Transfer diperbesar"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsImageMaximized(false)}
          >
            <X className="size-6" />
          </Button>
        </div>
      )}
    </>
  );
}
