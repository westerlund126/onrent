'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getCategoryOptions } from 'utils/product';
import ImageUpload from 'components/image-upload/image-upload';

const AddProductForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [isLoadingOwner, setIsLoadingOwner] = useState(true);
  const router = useRouter();

  const [product, setProduct] = useState({
    name: '',
    category: 'LAINNYA',
    description: '',
    images: [],
  });

  const [variants, setVariants] = useState([
    {
      size: '',
      color: '',
      price: '',
      bustlength: '',
      waistlength: '',
      length: '',
    },
  ]);

  useEffect(() => {
    const fetchOwnerId = async () => {
      setIsLoadingOwner(true);
      try {
        const response = await fetch('/api/auth/owner');
        if (response.ok) {
          const ownerData = await response.json();
          setOwnerId(ownerData.id);
        } else {
          throw new Error('Owner not found');
        }
      } catch (error) {
        toast.error('Gagal mengambil informasi pemilik. Pastikan Anda sudah login sebagai owner.');
      } finally {
        setIsLoadingOwner(false);
      }
    };

    fetchOwnerId();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [name]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: '',
        color: '',
        price: '',
        bustlength: '',
        waistlength: '',
        length: '',
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setProduct({
      name: '',
      category: 'LAINNYA',
      description: '',
      images: [],
    });
    setVariants([
      {
        size: '',
        color: '',
        price: '',
        bustlength: '',
        waistlength: '',
        length: '',
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerId) {
      toast.error('Gagal mengambil informasi pemilik. Silakan coba lagi.');
      return;
    }

    if (!product.name || !product.category || !product.description) {
      toast.error("Lengkapi semua data produk.");
      return;
    }

    if (variants.some(v => !v.size || !v.color || !v.price)) {
      toast.error("Lengkapi semua data varian");
      return;
    }

    if (product.images.length === 0) {
      toast.error("Upload minimal satu gambar produk");
      return;
    }

    const processedVariants = variants.map(variant => ({
      ...variant,
      price: parseFloat(variant.price),
      bustlength: parseFloat(variant.bustlength),
      waistlength: parseFloat(variant.waistlength),
      length: parseFloat(variant.length),
    }));

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          ownerId,
          variants: processedVariants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      toast.success("Produk berhasil ditambahkan!");
      router.push('/owner/catalog');

    } catch (error) {
      toast.error("Gagal menambahkan produk", {
        description: error.message || 'Terjadi kesalahan saat menambahkan produk.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = getCategoryOptions();

  const handleImageUpload = (url: string) => {
    setProduct(prev => ({ ...prev, images: [...prev.images, url] }));
  };

  const handleImageRemove = (url: string) => {
    setProduct(prev => ({ ...prev, images: prev.images.filter(image => image !== url) }));
  };

  if (isLoadingOwner) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
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
              value={product.name}
              onChange={handleProductChange}
              disabled={isSubmitting}
              placeholder="Masukkan nama produk"
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={product.category}
              onValueChange={(val) => setProduct((prev) => ({ ...prev, category: val }))}
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
              value={product.description}
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
              value={product.images}
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
                    onChange={(e) => handleVariantChange(index, e)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor={`color-${index}`}>Warna</Label>
                  <Input
                    id={`color-${index}`}
                    name="color"
                    placeholder="Red, Blue, dll"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, e)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Harga (Rp)</Label>
                  <Input
                    id={`price-${index}`}
                    name="price"
                    type="number"
                    placeholder="100000"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, e)}
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
                    onChange={(e) => handleVariantChange(index, e)}
                    disabled={isSubmitting}
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
                    onChange={(e) => handleVariantChange(index, e)}
                    disabled={isSubmitting}
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
                    onChange={(e) => handleVariantChange(index, e)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Variant Button - right aligned */}
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

        {/* Submit & Reset Buttons - right aligned */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
          </Button>
        </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
