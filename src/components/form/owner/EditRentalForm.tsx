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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditRentalFormProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: number | null;
  onSuccess?: (rental: any) => void;
}

const EditRentalForm = ({ isOpen, onClose, rentalId, onSuccess }: EditRentalFormProps) => {
  const [formData, setFormData] = useState({
    customerId: '',
    product: '',
    startDate: '',
    endDate: '',
    variantId: '',
    status: 'BELUM_LUNAS',
  });
  
  const [originalData, setOriginalData] = useState<any>(null);
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

  // Success/Error states
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load rental data when dialog opens
  useEffect(() => {
    if (isOpen && rentalId) {
      loadRentalData();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, rentalId]);

  const loadRentalData = async () => {
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
      
      // Pre-populate form data
      setFormData({
        customerId: rental.userId.toString(),
        product: rental.productsId.toString(),
        startDate: new Date(rental.startDate).toISOString().split('T')[0],
        endDate: new Date(rental.endDate).toISOString().split('T')[0],
        variantId: rental.variantProductId.toString(),
        status: rental.status,
      });
      
      // Set customer data
      setSelectedCustomer({
        id: rental.user.id,
        username: rental.user.username,
        first_name: rental.user.first_name,
        last_name: rental.user.last_name,
      });
      setCustomerUsername(rental.user.username);
      
      // Pre-populate product data
      const productData = {
        id: rental.products.id,
        name: rental.products.name,
        VariantProducts: [rental.variantProduct]
      };
      setOptions([productData]);
      setSearch(rental.variantProduct.sku);
      
    } catch (error) {
      console.error('Failed to load rental data:', error);
      setSubmitError('Gagal memuat data transaksi');
    } finally {
      setLoadingRental(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      product: '',
      startDate: '',
      endDate: '',
      variantId: '',
      status: 'BELUM_LUNAS',
    });
    setOriginalData(null);
    setCustomerUsername('');
    setSelectedCustomer(null);
    setCustomerError('');
    setSubmitError('');
    setSubmitSuccess(false);
    setSearch('');
    setOptions([]);
    setSearchCache(new Map());
  };

  // Product search functionality (same as original)
  useEffect(() => {
    if (!search || search.length < 2) {
      // Don't clear options if we have pre-loaded data
      if (!originalData) {
        setOptions([]);
      }
      setProductSearching(false);
      return;
    }

    if (searchCache.has(search)) {
      setOptions(searchCache.get(search) || []);
      setProductSearching(false);
      return;
    }

    setProductSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(search)}&limit=20`,
        );
        if (!res.ok) throw new Error('Failed to fetch products');

        const results = await res.json();

        setSearchCache((prev) => new Map(prev).set(search, results));
        setOptions(results);
      } catch (error) {
        console.error('Product search failed:', error);
        if (!originalData) {
          setOptions([]);
        }
      } finally {
        setProductSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      setProductSearching(false);
    };
  }, [search, searchCache, originalData]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'endDate' && formData.startDate) {
      const isValid = new Date(value) >= new Date(formData.startDate);
      e.target.setCustomValidity(
        isValid ? '' : 'Tanggal selesai harus setelah tanggal mulai',
      );
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    if (!formData.customerId) {
      setSubmitError('Silakan pilih pelanggan terlebih dahulu');
      return false;
    }

    if (!formData.variantId) {
      setSubmitError('Silakan pilih produk terlebih dahulu');
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
          formData.startDate !== originalData.startDate.split('T')[0] ||
          formData.endDate !== originalData.endDate.split('T')[0];
        const variantChanged = parseInt(formData.variantId) !== originalData.variantProductId;
    
        // Only include changed fields
        if (statusChanged) changes.status = formData.status;
        if (datesChanged) {
          changes.startDate = formData.startDate;
          changes.endDate = formData.endDate;
        }
        if (variantChanged) {
          const newVariantResponse = await fetch(
            `/api/variants/${formData.variantId}`,
          );
          if (!newVariantResponse.ok) {
            throw new Error('Gagal memeriksa ketersediaan varian');
          }

          const newVariant = await newVariantResponse.json();
          if (!newVariant.isAvailable) {
            throw new Error('Varian sudah tidak tersedia');
          }
        }
        
        if (Object.keys(changes).length === 0) {
          setSubmitError('Tidak ada perubahan yang dilakukan');
          return;
        }
    
        const response = await fetch(`/api/rentals/${rentalId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gagal mengupdate transaksi sewa');
        }
    
        // Handle variant change
        if (variantChanged) {
          // Mark old variant as available
          await fetch(`/api/variants/${originalData.variantProductId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isAvailable: true })
          });
    
          // Mark new variant as unavailable
          await fetch(`/api/variants/${formData.variantId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isAvailable: false })
          });
        }
    
        setSubmitSuccess(true);
        if (onSuccess) onSuccess(await response.json());
        
        setTimeout(onClose, 1500);
      } catch (error) {
        console.error('Update error:', error);
        setSubmitError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
  };

  const selectedVariant = options
    .flatMap((product) => product.VariantProducts)
    .find((variant) => variant.id === parseInt(formData.variantId));

  if (loadingRental) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
        <DialogContent className="max-w-md rounded-lg bg-white">
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
      <DialogContent className="max-w-md rounded-lg bg-white">
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

          {/* Product */}
          <div>
            <label className="mb-1 block text-sm font-medium">Produk *</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={productSearching || isLoading}
                >
                  {selectedVariant
                    ? `${
                        options.find((p) =>
                          p.VariantProducts.some(
                            (v) => v.id === parseInt(formData.variantId),
                          ),
                        )?.name
                      } - ${selectedVariant.sku}`
                    : productSearching
                    ? 'Mencari...'
                    : 'Pilih Produk...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Cari kode produk..."
                    value={search}
                    onValueChange={setSearch}
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
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  product: product.id.toString(),
                                  variantId: variant.id.toString(),
                                }));
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.variantId === variant.id.toString()
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
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
                <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={isLoading || !selectedCustomer || submitSuccess}
              className="relative"
            >
              {isLoading && (
                <Loader2 className="absolute left-4 h-4 w-4 animate-spin" />
              )}
              {isLoading
                ? 'Menyimpan...'
                : submitSuccess
                ? 'Berhasil!'
                : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRentalForm;