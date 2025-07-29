'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getCategoryOptions } from 'utils/product';
import { Product } from 'types/product';
import ImageUpload from 'components/image-upload/image-upload'; 

interface EditProductFormProps {
  productId: string;
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

const EditProductForm = ({ productId }: EditProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();

  const [productData, setProductData] = useState({
    name: '',
    category: 'LAINNYA',
    description: '',
    images: [] as string[], 
  });

  const [variants, setVariants] = useState<VariantFormData[]>([
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

  // Fetch product data
  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }
    
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const productData = await response.json();
        setProduct(productData);
        
        setProductData({
          name: productData.name,
          category: productData.category,
          description: productData.description || '',
          images: productData.images || [],
        });

        setVariants(
          productData.VariantProducts.map(variant => ({
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
        
      } catch (error) {
        toast.error('Gagal mengambil data produk');
        router.push('/owner/catalog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  if (!productId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p>Product ID tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url: string) => {
    setProductData(prev => ({ ...prev, images: [...prev.images, url] }));
  };

  const handleImageRemove = (url: string) => {
    setProductData(prev => ({ ...prev, images: prev.images.filter(image => image !== url) }));
  };

  // MODIFIED: This function now handles price formatting
  const handleVariantChange = (index: number, field: keyof VariantFormData, value: string | boolean) => {
    if (field === 'price' && typeof value === 'string') {
      // Remove thousand separators (periods) to get the raw number string
      const rawValue = value.replace(/\./g, '');

      // Allow only digits. If not, do nothing.
      if (!/^\d*$/.test(rawValue)) {
        return;
      }

      // Update state with the raw numeric string
      setVariants(prev =>
        prev.map((variant, i) =>
          i === index ? { ...variant, price: rawValue } : variant
        )
      );
    } else {
      // Handle other fields normally
      setVariants(prev =>
        prev.map((variant, i) =>
          i === index ? { ...variant, [field]: value } : variant
        )
      );
    }
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

    if (!productData.name || !productData.category || !productData.description) {
      toast.error('Lengkapi semua data produk');
      return;
    }

    if (productData.images.length === 0) {
      toast.error('Upload minimal satu gambar produk');
      return;
    }

    if (variants.some(v => !v.size || !v.color || !v.price)) {
      toast.error('Lengkapi semua data varian');
      return;
    }

    const processedVariants = variants.map(variant => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      price: parseInt(variant.price.replace(/\./g, ''), 10),
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

      toast.success('Produk berhasil diperbarui!');
      router.push('/owner/catalog');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p>Produk tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 mx-auto mb-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border p-4 rounded-lg space-y-4">
          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                name="name"
                value={productData.name}
                onChange={handleProductChange}
                disabled={isSubmitting}
                placeholder="Masukkan nama produk"
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
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
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                name="description"
                value={productData.description}
                onChange={handleProductChange}
                disabled={isSubmitting}
                placeholder="Masukkan deskripsi produk"
              />
            </div>

            <div>
              <Label className="block my-2">Gambar Produk</Label>
              <ImageUpload
                onChange={handleImageUpload}
                onRemove={handleImageRemove}
                value={productData.images}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-6">
            {variants.map((variant, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Varian {index + 1}</h4>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      disabled={isSubmitting}
                    >
                      Hapus
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`size-${index}`}>Ukuran</Label>
                    <Input
                      id={`size-${index}`}
                      name="size"
                      placeholder="S, M, L, XL"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`color-${index}`}>Warna</Label>
                    <Input
                      id={`color-${index}`}
                      name="color"
                      placeholder="Merah, Biru, dll"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* MODIFIED: This is the updated price input */}
                  <div>
                    <Label htmlFor={`price-${index}`}>Harga (Rp)</Label>
                    <Input
                      id={`price-${index}`}
                      name="price"
                      type="text" 
                      inputMode="numeric"
                      placeholder="100.000"
                      value={variant.price ? new Intl.NumberFormat('id-ID').format(Number(variant.price)) : ''}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bustlength-${index}`}>Lingkar Dada (cm)</Label>
                    <Input
                      id={`bustlength-${index}`}
                      name="bustlength"
                      type="number"
                      placeholder="90"
                      value={variant.bustlength}
                      onChange={(e) => handleVariantChange(index, 'bustlength', e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`waistlength-${index}`}>Lingkar Pinggang (cm)</Label>
                    <Input
                      id={`waistlength-${index}`}
                      name="waistlength"
                      type="number"
                      placeholder="70"
                      value={variant.waistlength}
                      onChange={(e) => handleVariantChange(index, 'waistlength', e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`length-${index}`}>Panjang (cm)</Label>
                    <Input
                      id={`length-${index}`}
                      name="length"
                      type="number"
                      placeholder="120"
                      value={variant.length}
                      onChange={(e) => handleVariantChange(index, 'length', e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Variant Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                disabled={isSubmitting}
              >
                + Tambah Varian
              </Button>
            </div>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/owner/catalog')}
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;