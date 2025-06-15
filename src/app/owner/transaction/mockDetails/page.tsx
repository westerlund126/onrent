'use client';

import React, { useState } from 'react';
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
import Image from 'next/image';

const mockRentalData = {
  id: 1,
  rentalCode: 'RNT-1846325',
  status: 'LUNAS',
  startDate: '2024-03-15',
  endDate: '2024-03-20',
  additionalInfo: 'Untuk acara pernikahan di Gedung Serbaguna',
  createdAt: '2024-03-10T10:00:00Z',
  updatedAt: '2024-03-12T14:30:00Z',
  user: {
    id: 1,
    first_name: 'Sari',
    last_name: 'Dewi',
    username: 'saridewi',
    email: 'sari.dewi@email.com',
    phone_numbers: '+62 812-3456-7890',
    businessAddress: 'Jl. Malioboro No. 123, Yogyakarta',
  },
  rentalItems: [
    {
      id: 1,
      variantProduct: {
        id: 1,
        sku: 'KBY-001-M-RED',
        size: 'M',
        color: 'Merah',
        price: 150000,
        bustlength: 95,
        waistlength: 70,
        length: 140,
        products: {
          id: 1,
          name: 'Kebaya Klasik Jawa',
          description: 'Kebaya tradisional dengan bordir tangan yang elegan',
          category: 'KEBAYA',
          images: ['/api/placeholder/300/400'],
        },
      },
    },
    {
      id: 2,
      variantProduct: {
        id: 2,
        sku: 'SLP-002-38-GLD',
        size: '38',
        color: 'Emas',
        price: 75000,
        products: {
          id: 2,
          name: 'Selop Tradisional',
          description: 'Selop dengan hiasan payet emas',
          category: 'SELOP',
          images: ['/api/placeholder/300/200'],
        },
      },
    },
  ],
};

const mockTracking = [
  {
    id: 1,
    status: 'RENTAL_ONGOING',
    updatedAt: '2024-03-15T08:00:00Z',
    description: 'Rental dimulai - Produk telah diambil pelanggan',
  },
  {
    id: 2,
    status: 'RETURN_PENDING',
    updatedAt: '2024-03-20T16:00:00Z',
    description: 'Menunggu pengembalian produk',
  },
  {
    id: 3,
    status: 'RETURNED',
    updatedAt: '2024-03-21T10:30:00Z',
    description: 'Produk telah dikembalikan dalam kondisi baik',
  },
  {
    id: 4,
    status: 'COMPLETED',
    updatedAt: '2024-03-21T11:00:00Z',
    description: 'Transaksi selesai',
  },
];

const TransactionDetailPage = () => {
  const [rental] = useState(mockRentalData);
  const [tracking] = useState(mockTracking);

  // Calculate totals
  const subtotal = rental.rentalItems.reduce(
    (sum, item) => sum + item.variantProduct.price,
    0,
  );
  const tax = 0; // Assuming no tax for now
  const shippingFee = 0; // Assuming no shipping fee
  const discount = 0; // Assuming no discount
  const total = subtotal + tax + shippingFee - discount;

  // Status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      BELUM_LUNAS: {
        label: 'Belum Lunas',
        variant: 'destructive',
        icon: XCircle,
      },
      LUNAS: { label: 'Lunas', variant: 'default', icon: CheckCircle },
      TERLAMBAT: {
        label: 'Terlambat',
        variant: 'destructive',
        icon: AlertCircle,
      },
      SELESAI: { label: 'Selesai', variant: 'default', icon: CheckCircle },
    };

    const config = statusConfig[status] || {
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

  const getTrackingStatusBadge = (status) => {
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
    };

    const config = statusConfig[status] || {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDueDate = (): {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  } => {
    const endDate = new Date(rental.endDate);
    const today = new Date();
    const diffDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
      return {
        text: `Terlambat ${Math.abs(diffDays)} hari`,
        variant: 'destructive',
      };
    } else if (diffDays === 0) {
      return { text: 'Jatuh tempo hari ini', variant: 'destructive' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} hari lagi`, variant: 'secondary' };
    } else {
      return { text: `${diffDays} hari lagi`, variant: 'default' };
    }
  };

  const dueDate = getDueDate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
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
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Unduh Struk
              </Button>
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Lihat Struk
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Transaction Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Products Table */}
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
                                src={item.variantProduct.products.images[0]}
                                width={120}
                                height={120}
                                alt={item.variantProduct.products.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {item.variantProduct.products.name}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {item.variantProduct.products.description}
                              </p>
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
                              {/* Measurements for clothing items */}
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

            {/* Transaction Summary */}
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

          {/* Right Column - Customer Details */}
          <div className="space-y-6">
            {/* Customer Information */}
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
                    {rental.user.first_name} {rental.user.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    @{rental.user.username}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{rental.user.email}</span>
                  </div>

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

            {/* Rental Period */}
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

        {/* Transaction History */}
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
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetailPage;
