'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Download,
  CreditCard,
  Scissors,
  CalendarDays,
  PackageCheck,
  Undo2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDateTime, formatCurrency, formatDate } from 'utils/rental';
import { useRentalStore } from 'stores/useRentalStore';

import {
  ActivityDetail,
  RentalDetail,
  FittingDetail,
  RentalTrackingEvent,
  FittingTrackingEvent,
} from 'types/activities';

const CustomerActivityDetailPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [tracking, setTracking] = useState<
    (RentalTrackingEvent | FittingTrackingEvent)[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const { initiateReturn, returnInitiateLoading } = useRentalStore();

  const isRental = type === 'rental';
  const isFitting = type === 'fitting';

  const fetchActivity = useCallback(
    async (activityType: string, activityId: string) => {
      const endpoint = isRental
        ? `/api/activities/rental/${activityId}`
        : `/api/activities/fitting/${activityId}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to load ${activityType} detail`);
      const { data } = await res.json();
      return data;
    },
    [isRental],
  );

  const fetchTracking = useCallback(
    async (activityType: string, activityId: string) => {
      if (activityType !== 'rental') {
        return [];
      }
      const endpoint = `/api/activities/rental/${activityId}/tracking`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to load tracking');
      const { data } = await res.json();
      return data;
    },
    [],
  );

  const loadData = useCallback(async () => {
    if (!type || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [activityDetail, trackingList] = await Promise.all([
        fetchActivity(type, id),
        fetchTracking(type, id),
      ]);
      setActivity(activityDetail);
      setTracking(trackingList);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [type, id, fetchActivity, fetchTracking]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subtotal = useMemo(() => {
    if (!isRental || !activity) return 0;
    const rental = activity as RentalDetail;
    return rental.rentalItems.reduce(
      (sum, item) => sum + item.variantProduct.price,
      0,
    );
  }, [activity, isRental]);

  const total = subtotal;

  const handleInitiateReturn = async () => {
    if (!isRental || !activity) return;

    try {
      await initiateReturn(parseInt(id));
      setReturnDialogOpen(false);
      alert(
        'Return Initiated: Your return request has been submitted to the owner for confirmation.',
      );
      await loadData();
    } catch (error) {
      console.error('Failed to initiate return:', error);
      alert('Return Failed: Failed to initiate return. Please try again.');
    }
  };

  const currentTrackingStatus = useMemo(() => {
    if (!isRental || !tracking.length) return null;
    return tracking[0]?.status;
  }, [tracking, isRental]);

  const canInitiateReturn = useMemo(() => {
    if (!isRental || !activity) return false;
    return currentTrackingStatus === 'RENTAL_ONGOING';
  }, [isRental, activity, currentTrackingStatus]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!activity) return <div className="p-6">Activity not found</div>;

  const getRentalStatusBadge = (status: RentalDetail['status']) => {
    const statusConfig = {
      BELUM_LUNAS: {
        label: 'Belum Lunas',
        variant: 'destructive',
        icon: XCircle,
      },
      LUNAS: { label: 'Lunas', variant: 'secondary', icon: CheckCircle },
      TERLAMBAT: {
        label: 'Terlambat',
        variant: 'secondary',
        icon: AlertCircle,
      },
      SELESAI: { label: 'Selesai', variant: 'default', icon: CheckCircle },
    } as const;
    const config = statusConfig[status] ?? {
      label: status,
      variant: 'secondary',
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" /> {config.label}
      </Badge>
    );
  };

  const getFittingStatusBadge = (status: FittingDetail['status']) => {
    const statusConfig = {
      SCHEDULED: {
        label: 'Dijadwalkan',
        variant: 'secondary',
        icon: Calendar,
      },
      IN_PROGRESS: {
        label: 'Sedang Berlangsung',
        variant: 'default',
        icon: RefreshCw,
      },
      COMPLETED: {
        label: 'Selesai',
        variant: 'default',
        icon: CheckCircle,
      },
      CANCELLED: {
        label: 'Dibatalkan',
        variant: 'destructive',
        icon: XCircle,
      },
    } as const;
    const config = statusConfig[status] ?? {
      label: status,
      variant: 'secondary',
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" /> {config.label}
      </Badge>
    );
  };

  const getTrackingStatusBadge = (status: string) => {
    const statusConfig = {
      RENTAL_ONGOING: {
        label: 'Sedang Berlangsung',
        variant: 'default',
        icon: RefreshCw,
      },
      RETURN_PENDING: {
        label: 'Menunggu Konfirmasi Owner',
        variant: 'secondary',
        icon: Clock,
      },
      RETURNED: {
        label: 'Dikembalikan',
        variant: 'default',
        icon: PackageCheck,
      },
      COMPLETED: { label: 'Selesai', variant: 'default', icon: CheckCircle },
    } as const;
    const config = statusConfig[status as keyof typeof statusConfig] ?? {
      label: status,
      variant: 'secondary',
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" /> {config.label}
      </Badge>
    );
  };

  const owner = isRental
    ? (activity as RentalDetail).owner
    : (activity as FittingDetail).fittingSlot.owner;
  const ownerName = owner
    ? owner.businessName ||
      `${owner.first_name} ${owner.last_name || ''}`.trim()
    : '';

  const dueDate = isRental
    ? (() => {
        const rental = activity as RentalDetail;
        const endDate = new Date(rental.endDate);
        const today = new Date();
        const diffDays = Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays < 0)
          return {
            text: `Terlambat ${Math.abs(diffDays)} hari`,
            variant: 'destructive' as const,
          };
        if (diffDays === 0)
          return {
            text: 'Jatuh tempo hari ini',
            variant: 'destructive' as const,
          };
        return { text: `${diffDays} hari lagi`, variant: 'default' as const };
      })()
    : null;

  // Helper to get fitting date/time information
  const getFittingSchedule = () => {
    if (!isFitting) return null;
    const fitting = activity as FittingDetail;
    const dateTime = new Date(fitting.fittingSlot.dateTime);
    const endDateTime = new Date(dateTime.getTime() + fitting.fittingSlot.duration * 60000);
    
    return {
      date: fitting.fittingSlot.dateTime,
      timeStart: dateTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      timeEnd: endDateTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      duration: fitting.fittingSlot.duration,
    };
  };

  const fittingSchedule = getFittingSchedule();

  // Helper to check if fitting has products
  const fittingHasProducts = isFitting && (activity as FittingDetail).FittingProduct?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Aktivitas
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isRental
                  ? `Rental #${(activity as RentalDetail).rentalCode}`
                  : 'Fitting'}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                {isRental && (
                  <>
                    <span className="text-gray-600">
                      Jatuh tempo:{' '}
                      {formatDate((activity as RentalDetail).endDate)}
                    </span>
                    {dueDate && (
                      <Badge variant={dueDate.variant}>{dueDate.text}</Badge>
                    )}
                    {getRentalStatusBadge((activity as RentalDetail).status)}
                  </>
                )}
                {isFitting && (
                  <>
                    <span className="text-gray-600">
                      Jadwal: {formatDate(fittingSchedule?.date || '')}
                    </span>
                    {getFittingStatusBadge((activity as FittingDetail).status)}
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isRental && (
                <>
                  {currentTrackingStatus === 'RENTAL_ONGOING' &&
                    canInitiateReturn && (
                      <Dialog
                        open={returnDialogOpen}
                        onOpenChange={setReturnDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Undo2 className="h-4 w-4" /> Kembalikan Produk
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Konfirmasi Pengembalian</DialogTitle>
                            <DialogDescription>
                              Apakah Anda yakin ingin mengembalikan produk
                              rental ini? Owner akan diberitahu dan diminta
                              untuk mengkonfirmasi pengembalian.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setReturnDialogOpen(false)}
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={handleInitiateReturn}
                              disabled={returnInitiateLoading === parseInt(id)}
                            >
                              {returnInitiateLoading === parseInt(id) ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{' '}
                                  Mengirim...
                                </>
                              ) : (
                                <>
                                  <Undo2 className="mr-2 h-4 w-4" /> Ya,
                                  Kembalikan
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                  {(currentTrackingStatus === 'RETURNED' ||
                    currentTrackingStatus === 'COMPLETED') && (
                    <Badge
                      variant="outline"
                      className="pointer-events-none flex items-center gap-2 border-green-600 bg-green-50 px-3 py-2 text-sm text-green-700"
                    >
                      <PackageCheck className="h-4 w-4" /> Produk Telah
                      Dikembalikan
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items/Products Card - Show for rentals and fittings with products */}
            {(isRental || fittingHasProducts) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isRental ? (
                      <>
                        <Package className="h-5 w-5" /> Detail Produk Sewa
                      </>
                    ) : (
                      <>
                        <Scissors className="h-5 w-5" /> Produk untuk Fitting
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        {isRental && <TableHead className="text-right">Total</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isRental && (activity as RentalDetail).rentalItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src={
                                  item.variantProduct.products.images[0] ??
                                  '/placeholder.svg'
                                }
                                width={64}
                                height={64}
                                alt={item.variantProduct.products.name}
                                className="h-16 w-16 rounded-lg border bg-gray-100 object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.variantProduct.products.name}
                                </h4>
                                <div className="text-xs text-gray-500">
                                  SKU: {item.variantProduct.sku}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.variantProduct.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {isFitting && fittingHasProducts && (activity as FittingDetail).FittingProduct.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src={
                                  item.product.images[0] ??
                                  '/placeholder.svg'
                                }
                                width={64}
                                height={64}
                                alt={item.product.name}
                                className="h-16 w-16 rounded-lg border bg-gray-100 object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.product.name}
                                </h4>
                                {item.variantProduct && (
                                  <>
                                    <div className="text-xs text-gray-500">
                                      SKU: {item.variantProduct.sku}
                                    </div>
                                    {item.variantProduct.size && (
                                      <div className="text-xs text-gray-500">
                                        Size: {item.variantProduct.size}
                                      </div>
                                    )}
                                    {item.variantProduct.color && (
                                      <div className="text-xs text-gray-500">
                                        Color: {item.variantProduct.color}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Regular fitting without products */}
            {isFitting && !fittingHasProducts && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5" /> Fitting Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Scissors className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Sesi Fitting Reguler
                      </h3>
                      <p className="text-gray-600">
                        Ini adalah sesi fitting reguler tanpa produk spesifik.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isFitting && (activity as FittingDetail).tfProofUrl && (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Bukti Transfer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={(activity as FittingDetail).tfProofUrl!}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={(activity as FittingDetail).tfProofUrl!}
            alt="Bukti transfer"
            width={100}
            height={100}
            className="w-full max-w-sm rounded-md border object-cover transition-transform hover:scale-105"
          />
        </a>
      </CardContent>
    </Card>
  )}

            {/* Transaction Summary - Only for rentals */}
            {isRental && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Ringkasan Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Owner Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Informasi Penyedia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-medium text-gray-900">{ownerName}</h4>
                {owner.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {owner.email}
                  </div>
                )}
                {owner.phone_numbers && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {owner.phone_numbers}
                  </div>
                )}
                {owner.businessBio && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    {owner.businessBio}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {isRental ? 'Periode Sewa' : 'Jadwal Fitting'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isRental && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Tanggal Mulai</span>
                      <p className="font-medium">
                        {formatDate((activity as RentalDetail).startDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tanggal Selesai</span>
                      <p className="font-medium">
                        {formatDate((activity as RentalDetail).endDate)}
                      </p>
                    </div>
                  </>
                )}
                {isFitting && fittingSchedule && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Tanggal & Waktu</span>
                      <p className="font-medium">
                        {formatDateTime(fittingSchedule.date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durasi</span>
                      <p className="font-medium">
                        {fittingSchedule.duration} menit
                      </p>
                    </div>
                    {(activity as FittingDetail).note && (
                      <div>
                        <span className="text-sm text-gray-600">Catatan</span>
                        <p className="font-medium">
                          {(activity as FittingDetail).note}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History Timeline - Only for rentals */}
        {isRental && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!tracking.length ? (
                <p className="text-sm text-gray-500">Belum ada aktivitas.</p>
              ) : (
                <div className="relative">
                  {tracking.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 pl-6">
                      <div className="absolute left-0 top-0 flex h-full flex-col items-center">
                        <div
                          className={`z-10 mt-1 h-3 w-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                        {index < tracking.length - 1 && (
                          <div className="h-full w-px bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="mb-2 flex items-center gap-3">
                          {getTrackingStatusBadge(event.status)}
                          <span className="text-sm text-gray-500">
                            {formatDateTime(event.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerActivityDetailPage;