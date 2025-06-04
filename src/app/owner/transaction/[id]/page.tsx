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
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

/* ------------------------------------------------------------------ */
/* Type helpers – adjust to your /types/* file if you already have it */
/* ------------------------------------------------------------------ */
type TrackingEvent = {
  id: number;
  status: 'RENTAL_ONGOING' | 'RETURN_PENDING' | 'RETURNED' | 'COMPLETED';
  updatedAt: string;
  description: string;
};

type VariantProduct = {
  id: number;
  sku: string;
  size?: string | null;
  color?: string | null;
  price: number;
  bustlength?: number | null;
  waistlength?: number | null;
  length?: number | null;
  products: {
    id: number;
    name: string;
    description: string;
    category: string;
    images: string[];
  };
};

type RentalItem = {
  id: number;
  variantProduct: VariantProduct;
};

type RentalDetail = {
  id: number;
  rentalCode: string;
  status: 'BELUM_LUNAS' | 'LUNAS' | 'TERLAMBAT' | 'SELESAI';
  startDate: string;
  endDate: string;
  additionalInfo?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    first_name: string;
    last_name?: string | null;
    username: string;
    email?: string | null; 
    phone_numbers?: string | null;
    businessAddress?: string | null;
  };
  rentalItems: RentalItem[];
};

const TransactionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState<RentalDetail | null>(null);
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);
  const [error, setError] = useState<string | null>(null);


  const fetchRental = useCallback(async (rentalId: string) => {
    const res = await fetch(`/api/rentals/${rentalId}/detail`);
    if (!res.ok) throw new Error('Failed to load rental detail');
    const { data } = await res.json();
    return data as RentalDetail;
  }, []);

  const fetchTracking = useCallback(async (rentalId: string) => {
    const res = await fetch(`/api/rentals/${rentalId}/tracking`);
    if (!res.ok) throw new Error('Failed to load tracking');
    const { data } = await res.json();
    return data as TrackingEvent[];
  }, []);

  const fetchCustomerEmail = useCallback(async (userId: number) => {
    const res = await fetch(`/api/customers/${userId}`);
    if (!res.ok) return null; 
    const { data } = await res.json();
    return data?.email ?? null;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [rentalDetail, trackingList] = await Promise.all([
          fetchRental(id),
          fetchTracking(id),
        ]);

        const email = await fetchCustomerEmail(rentalDetail.user.id);
        if (email) rentalDetail.user.email = email;

        setRental(rentalDetail);
        setTracking(trackingList);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, fetchRental, fetchTracking, fetchCustomerEmail]);


  const subtotal = useMemo(
    () =>
      rental?.rentalItems.reduce(
        (sum, item) => sum + item.variantProduct.price,
        0,
      ) ?? 0,
    [rental],
  );

  const tax = 0;
  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + tax + shippingFee - discount;

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!rental) return <div className="p-6">Transaction not found</div>;


  const getStatusBadge = (status: RentalDetail['status']) => {
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
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTrackingStatusBadge = (status: TrackingEvent['status']) => {
    const statusConfig = {
      RENTAL_ONGOING: {
        label: 'Sedang Berlangsung',
        variant: 'default',
        icon: RefreshCw,
      },
      RETURN_PENDING: {
        label: 'Menunggu Pengembalian',
        variant: 'secondary',
        icon: Clock,
      },
      RETURNED: {
        label: 'Dikembalikan',
        variant: 'default',
        icon: CheckCircle,
      },
      COMPLETED: { label: 'Selesai', variant: 'default', icon: CheckCircle },
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const dueDate = (() => {
    const endDate = new Date(rental.endDate);
    const today = new Date();
    const diffDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) {
      return {
        text: `Terlambat ${Math.abs(diffDays)} hari`,
        variant: 'destructive' as const,
      };
    }
    if (diffDays === 0) {
      return { text: 'Jatuh tempo hari ini', variant: 'destructive' as const };
    }
    if (diffDays <= 3) {
      return { text: `${diffDays} hari lagi`, variant: 'secondary' as const };
    }
    return { text: `${diffDays} hari lagi`, variant: 'default' as const };
  })();

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
              Kembali ke Daftar Transaksi
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{rental.rentalCode}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-gray-600">
                  Jatuh tempo: {formatDate(rental.endDate)}
                </span>
                <Badge variant={dueDate.variant}>{dueDate.text}</Badge>
                {getStatusBadge(rental.status)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled
              >
                <Download className="h-4 w-4" />
                Unduh Struk
              </Button>
              <Button className="flex items-center gap-2" disabled>
                <FileText className="h-4 w-4" />
                Lihat Struk
              </Button>
            </div>
          </div>
        </div>

        {/* ===== top grid (left: items, right: customer) ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left – items & summary */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detail Produk Sewa
                </CardTitle>
                <CardDescription>
                  Daftar produk yang disewa dalam transaksi ini
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    {rental.rentalItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-lg border bg-gray-100">
                              <Image
                                src={
                                  item.variantProduct.products.images[0] ??
                                  '/placeholder.svg'
                                }
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
              </CardContent>
            </Card>

            {/* Summary */}
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

                {rental.additionalInfo && (
                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Catatan Tambahan
                    </h4>
                    <p className="text-sm text-gray-600">
                      {rental.additionalInfo}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right – customer & period */}
          <div className="space-y-6">
            {/* Customer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {rental.user.first_name} {rental.user.last_name ?? ''}
                  </h4>
                  <p className="text-sm text-gray-600">
                    @{rental.user.username}
                  </p>
                </div>
                <div className="space-y-3">
                  {rental.user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{rental.user.email}</span>
                    </div>
                  )}
                  {rental.user.phone_numbers && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {rental.user.phone_numbers}
                      </span>
                    </div>
                  )}
                  {rental.user.businessAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {rental.user.businessAddress}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Periode Sewa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Tanggal Mulai</span>
                  <p className="font-medium">{formatDate(rental.startDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tanggal Selesai</span>
                  <p className="font-medium">{formatDate(rental.endDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Durasi</span>
                  <p className="font-medium">
                    {Math.ceil(
                      (new Date(rental.endDate).getTime() -
                        new Date(rental.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{' '}
                    hari
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline */}
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
      </div>
    </div>
  );
};

export default TransactionDetailPage;
