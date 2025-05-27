'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Product, ProductVariant } from 'types/product';
import { getCategoryOptions } from 'utils/product';

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated: (updatedProduct: Product) => void;
}

interface VariantFormData {
  id?: number;
  size: string;
  color: string;
  price: string;
  bustlength: string;
  waistlength: string;
  length: string;
  isAvailable: boolean;
  isRented: boolean;
}

const EditProductDialog = ({ isOpen, onClose, product, onProductUpdated }: EditProductDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    category: 'LAINNYA',
    description: '',
  });
  const [variants, setVariants] = useState<VariantFormData[]>([]);

  // Reset form when product changes or dialog opens
  useEffect(() => {
    if (product && isOpen) {
      setProductData({
        name: product.name,
        category: product.category,
        description: product.description || '',
      });

      setVariants(
        product.VariantProducts.map(variant => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          price: variant.price.toString(),
          bustlength: variant.bustlength?.toString() || '',
          waistlength: variant.waistlength?.toString() || '',
          length: variant.length?.toString() || '',
          isAvailable: variant.isAvailable,
          isRented: variant.isRented,
        }))
      );
    }
  }, [product, isOpen]);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index: number, field: keyof VariantFormData, value: string | boolean) => {
    setVariants(prev =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        size: '',
        color: '',
        price: '',
        bustlength: '',
        waistlength: '',
        length: '',
        isAvailable: true,
        isRented: false,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error('Produk harus memiliki minimal satu varian');
      return;
    }
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    // Validation
    if (!productData.name || !productData.category || !productData.description) {
      toast.error('Lengkapi semua data produk');
      return;
    }

    if (variants.some(v => !v.size || !v.color || !v.price || !v.bustlength || !v.waistlength || !v.length)) {
      toast.error('Lengkapi semua data varian');      
      return;
    }

    // Convert string values to numbers for numeric fields
    const processedVariants = variants.map(variant => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      price: parseFloat(variant.price),
      bustlength: parseFloat(variant.bustlength),
      waistlength: parseFloat(variant.waistlength),
      length: parseFloat(variant.length),
      isAvailable: variant.isAvailable,
      isRented: variant.isRented,
    }));

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          variants: processedVariants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      
      onProductUpdated(updatedProduct);
      onClose();
      
      toast.success('Produk berhasil diperbarui!');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Gagal memperbarui produk', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui produk.'
      });    
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = getCategoryOptions();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white rounded-lg">
        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
              <DialogDescription>
                Ubah detail produk dan varian di bawah ini
              </DialogDescription>
            </DialogHeader>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium">Nama Produk</Label>
                <Input 
                  id="name"
                  name="name" 
                  value={productData.name} 
                  onChange={handleProductChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="category" className="block text-sm font-medium">Kategori</Label>
                <Select
                  value={productData.category}
                  onValueChange={(val) => setProductData(prev => ({ ...prev, category: val }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium">Deskripsi</Label>
                <Input 
                  id="description"
                  name="description" 
                  value={productData.description} 
                  onChange={handleProductChange} 
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Variant Section */}
            <div>
              <h4 className="text-md font-semibold mt-4">Varian Produk</h4>
              {variants.map((variant, index) => (
                <div key={index} className="border p-3 rounded-lg space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`size-${index}`} className="text-xs">Ukuran</Label>
                      <Input 
                        id={`size-${index}`}
                        placeholder="Ukuran" 
                        value={variant.size} 
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)} 
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`color-${index}`} className="text-xs">Warna</Label>
                      <Input 
                        id={`color-${index}`}
                        placeholder="Warna" 
                        value={variant.color} 
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)} 
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`price-${index}`} className="text-xs">Harga</Label>
                      <Input 
                        id={`price-${index}`}
                        type="number" 
                        placeholder="Harga" 
                        value={variant.price} 
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)} 
                        disabled={isSubmitting}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`bustlength-${index}`} className="text-xs">Lingkar Dada (cm)</Label>
                      <Input 
                        id={`bustlength-${index}`}
                        type="number"
                        placeholder="Lingkar Dada" 
                        value={variant.bustlength}
                        onChange={(e) => handleVariantChange(index, 'bustlength', e.target.value)} 
                        disabled={isSubmitting}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`waistlength-${index}`} className="text-xs">Lingkar Pinggang (cm)</Label>
                      <Input 
                        id={`waistlength-${index}`}
                        type="number"
                        placeholder="Lingkar Pinggang" 
                        value={variant.waistlength} 
                        onChange={(e) => handleVariantChange(index, 'waistlength', e.target.value)} 
                        disabled={isSubmitting}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`length-${index}`} className="text-xs">Panjang (cm)</Label>
                      <Input 
                        id={`length-${index}`}
                        type="number"
                        placeholder="Panjang Gaun" 
                        value={variant.length} 
                        onChange={(e) => handleVariantChange(index, 'length', e.target.value)}
                        disabled={isSubmitting}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={variant.isAvailable}
                        onChange={(e) => handleVariantChange(index, 'isAvailable', e.target.checked)}
                        disabled={isSubmitting}
                        className="mr-2"
                      />
                      <span className="text-sm">Tersedia</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={variant.isRented}
                        onChange={(e) => handleVariantChange(index, 'isRented', e.target.checked)}
                        disabled={isSubmitting}
                        className="mr-2"
                      />
                      <span className="text-sm">Sedang Disewa</span>
                    </label>
                  </div>
                  
                  {variants.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => removeVariant(index)} 
                      className="mt-2"
                      disabled={isSubmitting}
                      size="sm"
                    >
                      Hapus Varian
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="secondary" 
                className="mt-2" 
                onClick={addVariant}
                disabled={isSubmitting}
              >
                Tambah Varian
              </Button>
            </div>

            <DialogFooter className="gap-2 pt-4 sticky bottom-0 pb-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;