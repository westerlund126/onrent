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
import { useEffect, useState, useCallback } from 'react';
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
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { EditRentalFormProps, SelectedVariant } from 'types/rental';
import { toast } from 'sonner';

const EditRentalForm = ({
  isOpen,
  onClose,
  rentalId,
  onSuccess,
}: EditRentalFormProps) => {
  const [formData, setFormData] = useState({
    customerId: '',
    startDate: '',
    endDate: '',
    status: 'BELUM_LUNAS',
    additionalInfo: '',
  });

  const [originalData, setOriginalData] = useState<any>(null);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>(
    [],
  );
  const [options, setOptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [productSearching, setProductSearching] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, any[]>>(new Map());
  const [loadingRental, setLoadingRental] = useState(false);

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

  // Debug state
  const [debugInfo, setDebugInfo] = useState('');

  const loadRentalData = useCallback(async () => {
    if (!rentalId) return;
    
    setLoadingRental(true);
    setSubmitError('');

    try {
      const response = await fetch(`/api/rentals/${rentalId}`);
      if (!response.ok) {
        throw new Error('Failed to load rental data');
      }

      const result = await response.json();
      const rental = result.data;

      setOriginalData(rental);

      setFormData({
        customerId: rental.userId.toString(),
        startDate: new Date(rental.startDate).toISOString().split('T')[0],
        endDate: new Date(rental.endDate).toISOString().split('T')[0],
        status: rental.status,
        additionalInfo: rental.additionalInfo || '',
      });

      setSelectedCustomer({
        id: rental.user.id,
        username: rental.user.username,
        first_name: rental.user.first_name,
        last_name: rental.user.last_name,
      });
      setCustomerUsername(rental.user.username);

      const variants: SelectedVariant[] = rental.rentalItems.map(
        (item: any) => ({
          id: item.variantProduct.id,
          sku: item.variantProduct.sku,
          size: item.variantProduct.size,
          color: item.variantProduct.color,
          price: item.variantProduct.price,
          productName: item.variantProduct.products.name,
          productId: item.variantProduct.products.id,
        }),
      );
      setSelectedVariants(variants);
    } catch (error) {
      console.error('Failed to load rental data:', error);
      setSubmitError('Gagal memuat data transaksi');
    } finally {
      setLoadingRental(false);
    }
  }, [rentalId]);

  const resetForm = useCallback(() => {
    setFormData({
      customerId: '',
      startDate: '',
      endDate: '',
      status: 'BELUM_LUNAS',
      additionalInfo: '',
    });
    setOriginalData(null);
    setSelectedVariants([]);
    setCustomerUsername('');
    setSelectedCustomer(null);
    setCustomerError('');
    setSubmitError('');
    setSubmitSuccess(false);
    setSearch('');
    setOptions([]);
    setSearchCache(new Map());
    setDebugInfo('');
  }, []);

  useEffect(() => {
    if (isOpen && rentalId) {
      loadRentalData();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, rentalId, loadRentalData, resetForm]);

  const filterAvailableVariants = useCallback((results: any[]) => {
    const selectedVariantIds = selectedVariants.map((v) => v.id);

    return results
      .map((product) => {
        const availableVariants =
          product.VariantProducts?.filter((variant: any) => {
            const isNotSelected = !selectedVariantIds.includes(variant.id);
            return variant.isAvailable && !variant.isRented && isNotSelected;
          }) || [];

        return {
          ...product,
          VariantProducts: availableVariants,
        };
      })
      .filter((product) => product.VariantProducts.length > 0);
  }, [selectedVariants]);

  useEffect(() => {
    const performSearch = async () => {
      if (!search || search.length < 2) {
        if (!originalData) {
          setOptions([]);
        }
        setProductSearching(false);
        setDebugInfo('Search query too short (minimum 2 characters)');
        return;
      }

      // Check cache first
      if (searchCache.has(search)) {
        const cachedResults = searchCache.get(search) || [];
        const filteredResults = filterAvailableVariants(cachedResults);
        setOptions(filteredResults);
        setProductSearching(false);
        setDebugInfo(
          `Using cached results: ${filteredResults.length} products found`,
        );
        return;
      }

      setProductSearching(true);
      setDebugInfo(`Searching for "${search}"...`);

      try {
        const url = `/api/products/search?q=${encodeURIComponent(
          search,
        )}&limit=20&includeRented=false`;

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API Error:', res.status, errorText);
          throw new Error(`API Error: ${res.status} - ${errorText}`);
        }

        const results = await res.json();
        const filteredResults = filterAvailableVariants(results);

        setSearchCache((prev) => new Map(prev).set(search, results));
        setOptions(filteredResults);
        setDebugInfo(
          `Found ${filteredResults.length} products with available variants`,
        );
      } catch (error) {
        console.error('Product search failed:', error);
        if (!originalData) {
          setOptions([]);
        }
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
  }, [search, searchCache, originalData, filterAvailableVariants]);

  const handleCustomerSearch = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== 'Enter') return;

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'endDate' && formData.startDate) {
      const isValid = new Date(value) >= new Date(formData.startDate);
      if (e.target instanceof HTMLInputElement) {
        e.target.setCustomValidity(
          isValid ? '' : 'Tanggal selesai harus setelah tanggal mulai',
        );
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const addVariant = (variant: any, product: any) => {
    const newVariant: SelectedVariant = {
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      productName: product.name,
      productId: product.id,
    };

    setSelectedVariants((prev) => [...prev, newVariant]);
    setOpen(false);
    setSearch('');

    setSearchCache(new Map());
    setOptions([]);
  };

  const removeVariant = (variantId: number) => {
    setSelectedVariants((prev) => prev.filter((v) => v.id !== variantId));

    setSearchCache(new Map());
    setOptions([]);
  };

  const validateForm = () => {
    if (!formData.customerId) {
      setSubmitError('Silakan pilih pelanggan terlebih dahulu');
      return false;
    }

    if (selectedVariants.length === 0) {
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

    if (!validateForm() || !rentalId) {
      return;
    }

    setIsLoading(true);

    try {
      const changes: any = {};

      const statusChanged = formData.status !== originalData?.status;
      const datesChanged =
        formData.startDate !==
          new Date(originalData.startDate).toISOString().split('T')[0] ||
        formData.endDate !==
          new Date(originalData.endDate).toISOString().split('T')[0];
      const additionalInfoChanged =
        formData.additionalInfo !== (originalData.additionalInfo || '');

      const originalVariantIds = originalData.rentalItems
        .map((item: any) => item.variantProduct.id)
        .sort();
      const currentVariantIds = selectedVariants.map((v) => v.id).sort();
      const variantsChanged =
        JSON.stringify(originalVariantIds) !==
        JSON.stringify(currentVariantIds);

      if (statusChanged) changes.status = formData.status;
      if (datesChanged) {
        changes.startDate = formData.startDate;
        changes.endDate = formData.endDate;
      }
      if (additionalInfoChanged)
        changes.additionalInfo = formData.additionalInfo;
      if (variantsChanged)
        changes.variantIds = selectedVariants.map((v) => v.id);

      if (Object.keys(changes).length === 0) {
        setSubmitError('Tidak ada perubahan yang dilakukan');
        return;
      }

      if (datesChanged || variantsChanged) {
        for (const variant of selectedVariants) {
          if (originalVariantIds.includes(variant.id) && !datesChanged) {
            continue;
          }

          const availabilityResponse = await fetch(
            `/api/products/${variant.productId}/variants/${variant.id}/availability?startDate=${formData.startDate}&endDate=${formData.endDate}&excludeRentalId=${rentalId}`,
          );

          if (!availabilityResponse.ok) {
            throw new Error(
              `Gagal memeriksa ketersediaan varian ${variant.sku}`,
            );
          }

          const availability = await availabilityResponse.json();
          if (!availability.isAvailable) {
            throw new Error(
              `Varian ${variant.sku} tidak tersedia untuk tanggal yang dipilih`,
            );
          }
        }
      }

      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Gagal mengupdate transaksi!");
        throw new Error(errorData.error || 'Gagal mengupdate transaksi sewa');
      }

      setSubmitSuccess(true);
      if (onSuccess) onSuccess(await response.json());
      toast.success("Transaksi berhasil diupdate!");

      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Gagal mengupdate transaksi!");
      setSubmitError(
        error instanceof Error ? error.message : 'Terjadi kesalahan',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    return selectedVariants.reduce(
      (total, variant) => total + (variant.price || 0),
      0,
    );
  };

  if (loadingRental) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
        <DialogContent className="max-w-2xl rounded-lg bg-white">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Memuat data transaksi...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Edit Transaksi
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {originalData?.rentalCode && (
                <span className="font-medium text-blue-600">
                  {originalData.rentalCode}
                </span>
              )}
              <br />
              Ubah detail transaksi sewa di bawah ini
            </DialogDescription>
          </DialogHeader>

          {/* Success Message */}
          {submitSuccess && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              Transaksi sewa berhasil diupdate!
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
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ketik username pelanggan dan tekan Enter..."
                  value={customerUsername}
                  onChange={(e) => setCustomerUsername(e.target.value)}
                  onKeyDown={handleCustomerSearch}
                  className="pr-10"
                  disabled={isLoading}
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
          {selectedVariants.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Produk Terpilih ({selectedVariants.length})
              </label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                {selectedVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {variant.productName}
                      </div>
                      <div className="text-xs text-gray-600">
                        SKU: {variant.sku}
                        {variant.size && ` • ${variant.size}`}
                        {variant.color && ` • ${variant.color}`}
                        {variant.price &&
                          ` • Rp ${variant.price.toLocaleString()}`}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(variant.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {selectedVariants.some((v) => v.price) && (
                  <div className="mt-2 border-t pt-2">
                    <div className="text-right text-sm font-medium">
                      Total: Rp {getTotalPrice().toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Product */}
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
                        Mencari Produk...
                      </div>
                    ) : search.length > 0 && search.length < 2 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Ketik minimal 2 karakter untuk mencari produk
                      </div>
                    ) : options.length === 0 && search.length >= 2 ? (
                      <CommandEmpty>
                        Produk tidak ditemukan atau sudah disewa.
                      </CommandEmpty>
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
                          {product.VariantProducts?.map((variant: any) => (
                            <CommandItem
                              key={variant.id}
                              value={`${product.name} ${variant.sku} ${
                                variant.size
                              } ${variant.color || ''}`}
                              onSelect={() => addVariant(variant, product)}
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
              className="mt-1"
              disabled={isLoading}
               onKeyDown={(e) => {
                if (e.key !== 'Tab' && e.key !== 'Shift') {
                  e.preventDefault();
                }
              }}
              onInput={(e) => {
                e.preventDefault();
              }}
              style={{ caretColor: 'transparent' }}
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
               onKeyDown={(e) => {
                if (e.key !== 'Tab' && e.key !== 'Shift') {
                  e.preventDefault();
                }
              }}
              onInput={(e) => {
                e.preventDefault();
              }}
              style={{ caretColor: 'transparent' }}
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
                <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
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
                selectedVariants.length === 0 ||
                submitSuccess
              }
              className="relative"
            >
              {isLoading && (
                <Loader2 className="absolute left-4 h-4 w-4 animate-spin" />
              )}
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

export default EditRentalForm;