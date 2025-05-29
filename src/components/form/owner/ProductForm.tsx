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
import { useRouter } from 'next/navigation';
import { getCategoryOptions } from 'utils/product';
import ImageUpload from 'components/image-upload/image-upload';
import { CldImage, CldUploadButton, CldUploadWidget } from 'next-cloudinary';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProductForm = ({ isOpen, onClose }: AddProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [isLoadingOwner, setIsLoadingOwner] = useState(false);
  const router = useRouter();
  
  const [product, setProduct] = useState({
    name: '',
    category: 'LAINNYA',
    description: '',
    images: [], // Default image
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
      if (!isOpen) return;
      
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
        console.error('Error fetching owner:', error);
        alert('Gagal mengambil informasi pemilik. Pastikan Anda sudah login sebagai owner.');
      } finally {
        setIsLoadingOwner(false);
      }
    };

    fetchOwnerId();
  }, [isOpen]);

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
    if (variants.length === 1) return; // At least one required
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

    // Check if owner ID is loaded
    if (!ownerId) {
      alert('Gagal mengambil informasi pemilik. Silakan coba lagi.');
      return;
    }

    // Validation
    if (!product.name || !product.category || !product.description) {
      toast.error("Lengkapi semua data produk.");
return;
    }

    if (variants.some(v => !v.size || !v.color || !v.price || !v.bustlength || !v.waistlength || !v.length)) {
    toast.error("Lengkapi semua data varian");      
    return;
    }

    if (product.images.length === 0) {
  toast.error("Upload minimal satu gambar produk");
  return;
}

    // Convert string values to numbers for numeric fields
    const processedVariants = variants.map(variant => ({
      ...variant,
      price: parseFloat(variant.price),
      bustlength: parseFloat(variant.bustlength),
      waistlength: parseFloat(variant.waistlength),
      length: parseFloat(variant.length),
    }));

    console.log('Submitting product:', product);
    console.log('Variants:', processedVariants);

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const result = await response.json();
      console.log('Product created successfully:', result);
      
      // Reset form and close dialog
      onClose();
      router.refresh();
      
      // Optionally show success message
      toast.success("Produk berhasil ditambahkan!",{
        description: "Produk baru telah berhasil ditambahkan ke katalog.",
      });

      // await new Promise((resolve) => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error creating product:', error);
toast.error("Gagal menambahkan produk", {
        description: error.message || 'Terjadi kesalahan saat menambahkan produk.'});    
} finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoadingOwner) {
      resetForm();
      setOwnerId(null);
      onClose();
    }
  };

  const categoryOptions = getCategoryOptions();
  const handleImageUpload = (url: string) => {
  setProduct(prev => ({
    ...prev,
    images: [...prev.images, url]
  }));
};

const handleImageRemove = (url: string) => {
  setProduct(prev => ({
    ...prev,
    images: prev.images.filter(image => image !== url)
  }));
};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
      <DialogContent className="max-w-2xl max-h-[90vh]  bg-white rounded-lg ">
        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>
                Isi detail produk di bawah ini
              </DialogDescription>
            </DialogHeader>

            
              <>
                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium">Nama Produk</Label>
                    <Input 
                      id="name"
                      name="name" 
                      value={product.name} 
                      onChange={handleProductChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="block text-sm font-medium">Kategori</Label>
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
                    <Label htmlFor="description" className="block text-sm font-medium">Deskripsi</Label>
                    <Input 
                      id="description"
                      name="description" 
                      value={product.description} 
                      onChange={handleProductChange} 
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
  <Label className="block text-sm font-medium mb-2">Gambar Produk</Label>
  <ImageUpload
    onChange={handleImageUpload}
    onRemove={handleImageRemove}
    value={product.images}
    disabled={isSubmitting}
  />
  <CldImage
  width="960"
  height="600"
  src="cld-sample-3"
  sizes="100vw"
  alt="Description of my image"
/>


</div>
                </div>

                {/* Variant Section */}
                <div>
                  <h4 className="text-md font-semibold mt-4">Varian Produk</h4>
                  {variants.map((variant, index) => (
                    <div key={index} className="border p-3 rounded-lg space-y-2 mt-2 ">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`size-${index}`} className="text-xs">Ukuran</Label>
                          <Input 
                            id={`size-${index}`}
                            name="size" 
                            placeholder="Ukuran" 
                            value={variant.size} 
                            onChange={(e) => handleVariantChange(index, e)} 
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`color-${index}`} className="text-xs">Warna</Label>
                          <Input 
                            id={`color-${index}`}
                            name="color" 
                            placeholder="Warna" 
                            value={variant.color} 
                            onChange={(e) => handleVariantChange(index, e)} 
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`price-${index}`} className="text-xs">Harga</Label>
                          <Input 
                            id={`price-${index}`}
                            name="price" 
                            type="number" 
                            placeholder="Harga" 
                            value={variant.price} 
                            onChange={(e) => handleVariantChange(index, e)} 
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`bustlength-${index}`} className="text-xs">Lingkar Dada (cm)</Label>
                          <Input 
                            id={`bustlength-${index}`}
                            name="bustlength" 
                            type="number"
                            placeholder="Lingkar Dada" 
                            value={variant.bustlength}
                            onChange={(e) => handleVariantChange(index, e)} 
                            disabled={isSubmitting}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`waistlength-${index}`} className="text-xs">Lingkar Pinggang (cm)</Label>
                          <Input 
                            id={`waistlength-${index}`}
                            name="waistlength" 
                            type="number"
                            placeholder="Lingkar Pinggang" 
                            value={variant.waistlength} 
                            onChange={(e) => handleVariantChange(index, e)} 
                            disabled={isSubmitting}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`length-${index}`} className="text-xs">Panjang (cm)</Label>
                          <Input 
                            id={`length-${index}`}
                            name="length" 
                            type="number"
                            placeholder="Panjang Gaun" 
                            value={variant.length} 
                            onChange={(e) => handleVariantChange(index, e)}
                            disabled={isSubmitting}
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>
                      {variants.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => removeVariant(index)} 
                          className="mt-2"
                          disabled={isSubmitting}
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
              </>
            

            <DialogFooter className="gap-2 pt-4 sticky bottom-0 pb-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;