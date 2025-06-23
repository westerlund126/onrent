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
  FileText,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
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
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  formatDateTime,
  formatCurrency,
  formatDate,
} from 'utils/rental';

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
  const [tracking, setTracking] = useState<(RentalTrackingEvent | FittingTrackingEvent)[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isRental = type === 'rental';
  const isFitting = type === 'fitting';

  const fetchActivity = useCallback(async (activityType: string, activityId: string) => {
    const endpoint = isRental ? `/api/activities/rental/${activityId}` : `/api/activities/fitting/${activityId}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Failed to load ${activityType} detail`);
    const { data } = await res.json();
    return data;
  }, [isRental]);

  const fetchTracking = useCallback(async (activityType: string, activityId: string) => {
    // Only fetch tracking for rental activities
    if (activityType !== 'rental') {
      return [];
    }
    
    const endpoint = `/api/activities/rental/${activityId}/tracking`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Failed to load tracking');
    const { data } = await res.json();
    return data;
  }, []);

  useEffect(() => {
    if (!type || !id) return;

    (async () => {
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
    })();
  }, [type, id, fetchActivity, fetchTracking]);

  // Calculate totals for rental
  const subtotal = useMemo(() => {
    if (!isRental || !activity) return 0;
    const rental = activity as RentalDetail;
    return rental.rentalItems.reduce((sum, item) => sum + item.variantProduct.price, 0);
  }, [activity, isRental]);

  const tax = 0;
  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + tax + shippingFee - discount;

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!activity) return <div className="p-6">Activity not found</div>;

  // Helper functions
  const getRentalStatusBadge = (status: RentalDetail['status']) => {
    const statusConfig = {
      BELUM_LUNAS: { label: 'Belum Lunas', variant: 'destructive', icon: XCircle },
      LUNAS: { label: 'Lunas', variant: 'secondary', icon: CheckCircle },
      TERLAMBAT: { label: 'Terlambat', variant: 'secondary', icon: AlertCircle },
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
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getFittingStatusBadge = (status: FittingDetail['status']) => {
    const statusConfig = {
      SCHEDULED: { label: 'Terjadwal', variant: 'secondary', icon: Calendar },
      IN_PROGRESS: { label: 'Sedang Berlangsung', variant: 'default', icon: RefreshCw },
      COMPLETED: { label: 'Selesai', variant: 'default', icon: CheckCircle },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
    } as const;

    const config = statusConfig[status] ?? {
      label: status,
      variant: 'secondary',
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTrackingStatusBadge = (status: string) => {
    if (isRental) {
      const statusConfig = {
        RENTAL_ONGOING: { label: 'Sedang Berlangsung', variant: 'default', icon: RefreshCw },
        RETURN_PENDING: { label: 'Menunggu Pengembalian', variant: 'secondary', icon: Clock },
        RETURNED: { label: 'Dikembalikan', variant: 'default', icon: CheckCircle },
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
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    } else {
      const statusConfig = {
        SCHEDULED: { label: 'Terjadwal', variant: 'secondary', icon: Calendar },
        IN_PROGRESS: { label: 'Sedang Berlangsung', variant: 'default', icon: RefreshCw },
        COMPLETED: { label: 'Selesai', variant: 'default', icon: CheckCircle },
        CANCELLED: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
      } as const;
      const config = statusConfig[status as keyof typeof statusConfig] ?? {
        label: status,
        variant: 'secondary',
        icon: AlertCircle,
      };
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    }
  };

  // Get owner info
  const owner = isRental 
    ? (activity as RentalDetail).owner 
    : (activity as FittingDetail).fittingSlot.owner;

  const ownerName = owner.businessName || `${owner.first_name} ${owner.last_name || ''}`.trim();

  // Rental-specific logic
  const dueDate = isRental ? (() => {
    const rental = activity as RentalDetail;
    const endDate = new Date(rental.endDate);
    const today = new Date();
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Terlambat ${Math.abs(diffDays)} hari`, variant: 'destructive' as const };
    }
    if (diffDays === 0) {
      return { text: 'Jatuh tempo hari ini', variant: 'destructive' as const };
    }
    if (diffDays <= 3) {
      return { text: `${diffDays} hari lagi`, variant: 'secondary' as const };
    }
    return { text: `${diffDays} hari lagi`, variant: 'default' as const };
  })() : null;

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
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Aktivitas
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isRental 
                  ? `Rental #${(activity as RentalDetail).rentalCode}`
                  : `Fitting`
                }
              </h1>
              <div className="mt-2 flex items-center gap-4">
                {isRental ? (
                  <>
                    <span className="text-gray-600">
                      Jatuh tempo: {formatDate((activity as RentalDetail).endDate)}
                    </span>
                    {dueDate && <Badge variant={dueDate.variant}>{dueDate.text}</Badge>}
                    {getRentalStatusBadge((activity as RentalDetail).status)}
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">
                      Jadwal: {formatDateTime((activity as FittingDetail).fittingSlot.dateTime)}
                    </span>
                    {getFittingStatusBadge((activity as FittingDetail).status)}
                  </>
                )}
              </div>
            </div>

            {isRental && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  <Download className="h-4 w-4" />
                  Unduh Struk
                </Button>
                <Button className="flex items-center gap-2" disabled>
                  <FileText className="h-4 w-4" />
                  Lihat Struk
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - items & summary */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items/Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isRental ? <Package className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                  {isRental ? 'Detail Produk Sewa' : 'Detail Produk Fitting'}
                </CardTitle>
                <CardDescription>
                  {isRental 
                    ? 'Daftar produk yang disewa dalam transaksi ini'
                    : 'Daftar produk yang akan di-fitting'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isRental ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-center">Kuantitas</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activity as RentalDetail).rentalItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex gap-3">
                              <div className="h-16 w-16 overflow-hidden rounded-lg border bg-gray-100">
                                <Image
                                  src={item.variantProduct.products.images[0] ?? '/placeholder.svg'}
                                  width={64}
                                  height={64}
                                  alt={item.variantProduct.products.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {item.variantProduct.products.name}
                                </h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    SKU: {item.variantProduct.sku}
                                  </Badge>
                                  {item.variantProduct.size && (
                                    <Badge variant="outline" className="text-xs">
                                      Ukuran: {item.variantProduct.size}
                                    </Badge>
                                  )}
                                  {item.variantProduct.color && (
                                    <Badge variant="outline" className="text-xs">
                                      Warna: {item.variantProduct.color}
                                    </Badge>
                                  )}
                                </div>
                                {(item.variantProduct.bustlength ||
                                  item.variantProduct.waistlength ||
                                  item.variantProduct.length) && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    Ukuran:
                                    {item.variantProduct.bustlength &&
                                      ` Dada ${item.variantProduct.bustlength}cm`}
                                    {item.variantProduct.waistlength &&
                                      ` Pinggang ${item.variantProduct.waistlength}cm`}
                                    {item.variantProduct.length &&
                                      ` Panjang ${item.variantProduct.length}cm`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">1</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.variantProduct.price)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.variantProduct.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="space-y-4">
                    {(activity as FittingDetail).FittingProduct.length === 0 ? (
                      <div className="text-center py-8">
                        <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Konsultasi Fitting Umum
                        </h3>
                        <p className="text-gray-600">
                          Tidak ada produk spesifik yang akan di-fitting. 
                          Ini adalah sesi konsultasi fitting umum.
                        </p>
                      </div>
                    ) : (
                      (activity as FittingDetail).FittingProduct.map((item) => (
                        <div key={item.id} className="flex gap-3 p-4 border rounded-lg">
                          <div className="h-16 w-16 overflow-hidden rounded-lg border bg-gray-100">
                            <Image
                              src={item.product.images[0] ?? '/placeholder.svg'}
                              width={64}
                              height={64}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.product.name}
                            </h4>
                            {item.variantProduct && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.variantProduct.sku && (
                                  <Badge variant="outline" className="text-xs">
                                    SKU: {item.variantProduct.sku}
                                  </Badge>
                                )}
                                {item.variantProduct.size && (
                                  <Badge variant="outline" className="text-xs">
                                    Ukuran: {item.variantProduct.size}
                                  </Badge>
                                )}
                                {item.variantProduct.color && (
                                  <Badge variant="outline" className="text-xs">
                                    Warna: {item.variantProduct.color}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {item.variantProduct && (item.variantProduct.bustlength ||
                              item.variantProduct.waistlength ||
                              item.variantProduct.length) && (
                              <div className="mt-1 text-xs text-gray-500">
                                Ukuran:
                                {item.variantProduct.bustlength &&
                                  ` Dada ${item.variantProduct.bustlength}cm`}
                                {item.variantProduct.waistlength &&
                                  ` Pinggang ${item.variantProduct.waistlength}cm`}
                                {item.variantProduct.length &&
                                  ` Panjang ${item.variantProduct.length}cm`}
                              </div>
                            )}
                            <p className="mt-1 text-sm text-gray-600">
                              {item.product.description}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary - only for rentals */}
            {isRental && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Ringkasan Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diskon</span>
                        <span className="text-green-600">
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pajak</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    )}
                    {shippingFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ongkos Kirim</span>
                        <span>{formatCurrency(shippingFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {(activity as RentalDetail).additionalInfo && (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-medium text-gray-900">
                        Catatan Tambahan
                      </h4>
                      <p className="text-sm text-gray-600">
                        {(activity as RentalDetail).additionalInfo}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fitting Notes - only for fittings */}
            {isFitting && (activity as FittingDetail).note && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Catatan Fitting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      {(activity as FittingDetail).note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - owner & schedule info */}
          <div className="space-y-6">
            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{ownerName}</h4>
                  {owner.businessName && (
                     <p className="text-sm text-gray-600">
                       {owner.first_name} {owner.last_name || ''}
                      </p> 
                    )}
                </div>
                <div className="space-y-3">
                  {owner.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{owner.email}</span>
                    </div>
                  )}
                  {owner.phone_numbers && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{owner.phone_numbers}</span>
                    </div>
                  )}
                  {owner.businessAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <span className="text-sm">{owner.businessAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isRental ? <Calendar className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                  {isRental ? 'Periode Sewa' : 'Jadwal Fitting'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isRental ? (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Tanggal Mulai</span>
                      <p className="font-medium">{formatDate((activity as RentalDetail).startDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tanggal Selesai</span>
                      <p className="font-medium">{formatDate((activity as RentalDetail).endDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durasi</span>
                      <p className="font-medium">
                        {Math.ceil(
                          (new Date((activity as RentalDetail).endDate).getTime() -
                            new Date((activity as RentalDetail).startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{' '}
                        hari
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Tanggal & Waktu</span>
                      <p className="font-medium">
                        {formatDateTime((activity as FittingDetail).fittingSlot.dateTime)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durasi</span>
                      <p className="font-medium">
                        {(activity as FittingDetail).duration} menit
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        {isRental && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat Transaksi
            </CardTitle>
            <CardDescription>
              Timeline status dan aktivitas transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!tracking.length ? (
              <p className="text-sm text-gray-500">Belum ada aktivitas.</p>
            ) : (
              <div className="space-y-6">
                {tracking.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                      {index < tracking.length - 1 && (
                        <div className="h-12 w-px bg-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 pb-6">
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
