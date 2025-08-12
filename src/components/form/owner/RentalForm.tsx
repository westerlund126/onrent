'use client';

import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Check,
  ChevronsUpDown,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { RentalFormProps, SelectedProduct } from 'types/rental';
import { toast } from 'sonner';

const RentalForm = ({ isOpen, onClose, onSuccess }: RentalFormProps) => {
  const [formData, setFormData] = useState({
    customerId: '',
    startDate: '',
    endDate: '',
    status: 'BELUM_LUNAS',
    additionalInfo: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [options, setOptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [productSearching, setProductSearching] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, any[]>>(new Map());
  const [customerUsername, setCustomerUsername] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  } | null>(null);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerError, setCustomerError] = useState('');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      customerId: '',
      startDate: '',
      endDate: '',
      status: 'BELUM_LUNAS',
      additionalInfo: '',
    });
    setSelectedProducts([]);
    setCustomerUsername('');
    setSelectedCustomer(null);
    setCustomerError('');
    setSubmitError('');
    setSubmitSuccess(false);
    setSearch('');
    setOptions([]);
    setSearchCache(new Map());
    setDebugInfo('');
  };

  useEffect(() => {
    const performSearch = async () => {
      if (!search || search.length < 2) {
        setOptions([]);
        setProductSearching(false);
        setDebugInfo('Search query too short (minimum 2 characters)');
        return;
      }

      if (searchCache.has(search)) {
        const cachedResults = searchCache.get(search) || [];
        setOptions(cachedResults);
        setProductSearching(false);
        setDebugInfo(
          `Using cached results: ${cachedResults.length} products found`,
        );
        return;
      }

      setProductSearching(true);
      setDebugInfo(`Searching for "${search}"...`);

      try {
        const url = `/api/products/search?q=${encodeURIComponent(
          search,
        )}&limit=20&excludeRented=true`;

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API Error:', res.status, errorText);
          throw new Error(`API Error: ${res.status} - ${errorText}`);
        }

        const results = await res.json();

        const processedResults = results
          .map((product: any) => {
            const availableVariants =
              product.VariantProducts?.filter((variant: any) => {
                const isNotSelected = !selectedProducts.some(
                  (selected) => selected.variantId === variant.id,
                );
                return (
                  variant.isAvailable && !variant.isRented && isNotSelected
                );
              }) || [];

            return {
              ...product,
              VariantProducts: availableVariants,
            };
          })
          .filter((product: any) => {
            const hasVariants = product.VariantProducts.length > 0;
            return hasVariants;
          });

        setSearchCache((prev) => new Map(prev).set(search, processedResults));
        setOptions(processedResults);
        setDebugInfo(
          `Found ${processedResults.length} products with available variants`,
        );
      } catch (error) {
        setOptions([]);
        setDebugInfo(
          `Error: ${error instanceof Error ? error.message : 'Search failed'}`,
        );
      } finally {
        setProductSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);

    return () => {
      clearTimeout(timer);
      setProductSearching(false);
    };
  }, [search, selectedProducts, searchCache]);

  const handleCustomerSearch = async (
    e?: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e && e.key !== 'Enter') return;

    const username = customerUsername.trim();
    if (!username) return;

    setCustomerSearching(true);
    setCustomerError('');

    try {
      const res = await fetch(
        `/api/customers/search?q=${encodeURIComponent(username)}`,
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Customer API Error:', res.status, errorText);
        throw new Error('Failed to search customer');
      }

      const customers = await res.json();

      if (customers.length === 0) {
        setCustomerError('Pelanggan tidak ditemukan');
        setSelectedCustomer(null);
        setFormData((prev) => ({ ...prev, customerId: '' }));
      } else {
        const customer = customers[0];
        setSelectedCustomer(customer);
        setFormData((prev) => ({
          ...prev,
          customerId: customer.id.toString(),
        }));
        setCustomerError('');
      }
    } catch (error) {
      console.error('Customer search failed:', error);
      setCustomerError('Gagal mencari username pelanggan');
      setSelectedCustomer(null);
      setFormData((prev) => ({ ...prev, customerId: '' }));
    } finally {
      setCustomerSearching(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if ((name === 'startDate' || name === 'endDate') && value.length === 10 && !isNaN(new Date(value).getTime())) {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (name === 'startDate' && inputDate < today) {
        const correctedValue = today.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, startDate: correctedValue }));
        toast.warning("Tanggal mulai diubah ke hari ini karena tidak boleh di masa lalu");
        return; 
      }

      if (name === 'endDate' && formData.startDate) {
        const startDate = new Date(formData.startDate);
        if (inputDate <= startDate) {
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const correctedValue = nextDay.toISOString().split('T')[0];
          setFormData(prev => ({ ...prev, endDate: correctedValue }));
          toast.warning("Tanggal selesai diubah ke hari setelah tanggal mulai");
          return; 
      }
    }

    if (name === 'endDate' && formData.startDate) {
      const isValid = new Date(value) >= new Date(formData.startDate);
      (e.target as HTMLInputElement).setCustomValidity(
        isValid ? '' : 'Tanggal selesai harus setelah tanggal mulai',
      );
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
    };
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const addProduct = (product: any, variant: any) => {
    const newProduct: SelectedProduct = {
      id: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price,
    };

    setSelectedProducts((prev) => {
      const updated = [...prev, newProduct];
      return updated;
    });

    setOpen(false);
    setSearch('');

    setSearchCache(new Map());
    setOptions([]);
  };

  const removeProduct = (variantId: number) => {
    setSelectedProducts((prev) => {
      const updated = prev.filter((p) => p.variantId !== variantId);
      return updated;
    });

    setSearchCache(new Map());
    setOptions([]);
  };

  const validateForm = () => {
    if (!formData.customerId) {
      setSubmitError('Silakan pilih pelanggan terlebih dahulu');
      return false;
    }

    if (selectedProducts.length === 0) {
      setSubmitError('Silakan pilih minimal satu produk');
      return false;
    }

    if (!formData.startDate) {
      setSubmitError('Tanggal mulai harus diisi');
      return false;
    }

    if (!formData.endDate) {
      setSubmitError('Tanggal selesai harus diisi');
      return false;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setSubmitError('Tanggal selesai harus setelah tanggal mulai');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitError('');
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: parseInt(formData.customerId),
          variantIds: selectedProducts.map((p) => p.variantId),
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
          additionalInfo: formData.additionalInfo.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat transaksi sewa');
        toast.error("Gagal membuat transaksi sewa!");
      }
      setSubmitSuccess(true);
      toast.success("Transaksi sewa berhasil dibuat!");

      if (onSuccess) {
        onSuccess(result.data);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Rental submission error:', error);
      toast.error("Gagal menambahkan transaksi!");
      setSubmitError(
        error instanceof Error ? error.message : 'Gagal membuat transaksi sewa',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    return selectedProducts.reduce(
      (total, product) => total + (product.price || 0),
      0,
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Tambah Transaksi Baru
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Isi detail transaksi sewa di bawah ini
            </DialogDescription>
          </DialogHeader>

          {/* Success Message */}
          {submitSuccess && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              Transaksi sewa berhasil dibuat!
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {submitError}
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Username Pelanggan *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Ketik username pelanggan..."
                    value={customerUsername}
                    onChange={(e) => setCustomerUsername(e.target.value)}
                    onKeyDown={handleCustomerSearch}
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCustomerSearch()}
                  disabled={
                    customerSearching || isLoading || !customerUsername.trim()
                  }
                  className="px-4"
                >
                  {customerSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Cari</span>
                </Button>
              </div>

              {customerSearching && (
                <div className="text-sm text-blue-600">
                  Mencari username pelanggan...
                </div>
              )}

              {customerError && (
                <div className="text-sm text-red-600">{customerError}</div>
              )}

              {selectedCustomer && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  Pelanggan terdaftar: {selectedCustomer.username}
                  {(selectedCustomer.first_name ||
                    selectedCustomer.last_name) && (
                    <span className="text-gray-600">
                      ({selectedCustomer.first_name}{' '}
                      {selectedCustomer.last_name})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Produk Terpilih ({selectedProducts.length})
              </label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                {selectedProducts.map((product) => (
                  <div
                    key={product.variantId}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {product.productName}
                      </div>
                      <div className="text-xs text-gray-600">
                        SKU: {product.sku}
                        {product.size && ` • ${product.size}`}
                        {product.color && ` • ${product.color}`}
                        {product.price &&
                          ` • Rp ${product.price.toLocaleString()}`}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.variantId)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {selectedProducts.some((p) => p.price) && (
                  <div className="mt-2 border-t pt-2">
                    <div className="text-right text-sm font-medium">
                      Total: Rp {getTotalPrice().toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Search */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tambah Produk *
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={productSearching || isLoading}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {productSearching
                      ? 'Mencari...'
                      : 'Pilih Produk untuk Ditambahkan...'}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Cari kode produk..."
                    value={search}
                    onValueChange={(value) => {
                      setSearch(value);
                    }}
                  />
                  <CommandList>
                    {productSearching ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                        Mencari Produk...
                      </div>
                    ) : search.length > 0 && search.length < 2 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Ketik minimal 2 karakter untuk mencari produk
                      </div>
                    ) : options.length === 0 && search.length >= 2 ? (
                      <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                    ) : (
                      options.map((product) => (
                        <CommandGroup
                          key={product.id}
                          heading={
                            <div className="flex items-center justify-between">
                              <span>{product.name}</span>
                              <span className="text-xs text-gray-500">
                                {product.VariantProducts?.length || 0} varian
                                tersedia
                              </span>
                            </div>
                          }
                        >
                          {product.VariantProducts?.map((variant) => (
                            <CommandItem
                              key={variant.id}
                              value={`${product.name} ${variant.sku} ${
                                variant.size
                              } ${variant.color || ''}`}
                              onSelect={() => addProduct(product, variant)}
                            >
                              <Plus className="mr-2 h-4 w-4 text-green-500" />
                              <div className="flex flex-col gap-1">
                                <div className="font-medium">{variant.sku}</div>
                                <div className="text-xs text-gray-500">
                                  {variant.size}
                                  {variant.color && ` • ${variant.color}`}
                                  {variant.price &&
                                    ` • Rp ${variant.price.toLocaleString()}`}
                                </div>
                              </div>
                            </CommandItem>
                          )) || (
                            <div className="p-2 text-xs text-gray-500">
                              Tidak ada varian tersedia
                            </div>
                          )}
                        </CommandGroup>
                      ))
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium">Tanggal Mulai *</label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium">
              Tanggal Selesai *
            </label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">
              Status Pembayaran
            </label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleSelectChange('status', val)}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                <SelectItem value="LUNAS">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium">
              Informasi Tambahan
            </label>
            <Textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              placeholder="Catatan khusus, instruksi khusus, atau informasi tambahan lainnya..."
              className="mt-1 min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !selectedCustomer ||
                selectedProducts.length === 0 ||
                submitSuccess
              }
            >
              {isLoading
                ? 'Menyimpan...'
                : submitSuccess
                ? 'Berhasil!'
                : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RentalForm;