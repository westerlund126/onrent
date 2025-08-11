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
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
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
  PackageCheck,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRentalStore } from 'stores/useRentalStore';
import { toast } from 'sonner';

type TrackingEvent = {
  id: number;
  status: 'RENTAL_ONGOING' | 'RETURN_PENDING' | 'RETURNED' | 'COMPLETED';
  updatedAt: string;
  description: string;
};
type VariantProduct = {
  id: number;
  sku: string;
  price: number;
  products: { name: string; images: string[] };
};
type RentalItem = { id: number; variantProduct: VariantProduct };
type RentalDetail = {
  id: number;
  rentalCode: string;
  status: 'BELUM_LUNAS' | 'LUNAS' | 'TERLAMBAT' | 'SELESAI';
  startDate: string;
  endDate: string;
  additionalInfo?: string | null;
  user: {
    id: number;
    first_name: string;
    last_name?: string | null;
    username: string;
    email?: string | null;
    phone_numbers?: string | null;
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
  const [confirmReturnDialogOpen, setConfirmReturnDialogOpen] = useState(false);

  const { confirmReturn, returnConfirmLoading } = useRentalStore();

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

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [rentalDetail, trackingList] = await Promise.all([
        fetchRental(id),
        fetchTracking(id),
      ]);
      setRental(rentalDetail);
      setTracking(trackingList);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id, fetchRental, fetchTracking]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subtotal = useMemo(
    () =>
      rental?.rentalItems.reduce(
        (sum, item) => sum + item.variantProduct.price,
        0,
      ) ?? 0,
    [rental],
  );
  const total = subtotal;

  const currentTrackingStatus = useMemo(() => {
    if (!tracking.length) return null;
    return tracking[0]?.status;
  }, [tracking]);

  const canConfirmReturn = useMemo(
    () => currentTrackingStatus === 'RETURNED',
    [currentTrackingStatus],
  );

  const handleConfirmReturn = async () => {
  if (!rental) return;
  
  try {
    await confirmReturn(rental.id);
    setConfirmReturnDialogOpen(false);
    toast.success("Pengembalian berhasil dikonfirmasi.");
    
    setTimeout(async () => {
      await loadData();
    }, 1000);
    
  } catch (error) {
    console.error('Failed to confirm return:', error);
    
    let errorMessage = 'Tolong coba kembali.';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Operasi mungkin sedang diproses. Silakan refresh halaman untuk melihat status terbaru.';
      } else if (error.message.includes('already been processed')) {
        errorMessage = 'Pengembalian sudah diproses sebelumnya.';
        setTimeout(() => loadData(), 1000);
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(`Gagal mengonfirmasi pengembalian: ${errorMessage}`);
  }
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
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
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
        label: 'Dikembalikan Pelanggan',
        variant: 'destructive',
        icon: PackageCheck,
      },
      COMPLETED: { label: 'Selesai', variant: 'default', icon: CheckCircle },
    } as const;
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const dueDate = useMemo(() => {
    if (!rental) return null;
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
      return { text: 'Jatuh tempo hari ini', variant: 'destructive' as const };
    return { text: `${diffDays} hari lagi`, variant: 'default' as const };
  }, [rental]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!rental) return <div className="p-6">Transaction not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Transaksi
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{rental.rentalCode}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <span className="text-gray-600">
                  Jatuh tempo: {formatDate(rental.endDate)}
                </span>
                {dueDate && (
                  <Badge variant={dueDate.variant}>{dueDate.text}</Badge>
                )}
                {getStatusBadge(rental.status)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canConfirmReturn && (
                <Dialog
                  open={confirmReturnDialogOpen}
                  onOpenChange={setConfirmReturnDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex animate-pulse items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Konfirmasi Pengembalian
                    </Button>
                  </DialogTrigger>
                  <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm backdrop-contrast-50" >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Konfirmasi Penerimaan Produk</DialogTitle>
                      <DialogDescription>
                        Apakah Anda telah menerima produk yang dikembalikan
                        pelanggan? Tindakan ini akan menyelesaikan transaksi.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmReturnDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleConfirmReturn}
                        disabled={returnConfirmLoading === rental.id}
                      >
                        {returnConfirmLoading === rental.id ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{' '}
                            Mengkonfirmasi...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Ya,
                            Konfirmasi
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                  </DialogOverlay>
                </Dialog>
              )}
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled
              >
                <Download className="h-4 w-4" /> Unduh Struk
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package />
                  Detail Produk Sewa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rental.rentalItems.map((item) => (
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
                              className="h-16 w-16 rounded-lg border object-cover"
                            />
                            <div>
                              <h4 className="font-medium">
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
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
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-medium">
                  {rental.user.first_name} {rental.user.last_name ?? ''}
                </h4>
                {rental.user.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {rental.user.email}
                  </div>
                )}
                {rental.user.phone_numbers && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {rental.user.phone_numbers}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar />
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
              </CardContent>
            </Card>
          </div>
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock />
              Riwayat Transaksi
            </CardTitle>
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
                        <div className="h-full w-px bg-gray-200" />
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
