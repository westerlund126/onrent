'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface RentalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RentalForm = ({ isOpen, onClose }: RentalFormProps) => {
  const [formData, setFormData] = useState({
    customerId: '',
    product: '',
    startDate: '',
    endDate: '',
    variantId: '',
    status: 'BELUM_LUNAS',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.variantId) return alert('Please select a variant');
    if (!formData.startDate) return alert('Please select a start date');
    if (!formData.endDate) return alert('Please select an end date');
    if (new Date(formData.startDate) > new Date(formData.endDate))
      return alert('End date must be after start date');
    if (!formData.customerId) return alert('Please select a customer');
    if (!formData.product) return alert('Please select a product');

    console.log('Submitting:', formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            <DialogDescription>Isi detail transaksi sewa di bawah ini</DialogDescription>
          </DialogHeader>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium">Customer</label>
            <Select
              value={formData.customerId}
              onValueChange={(val) => handleSelectChange('customerId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Customer 1</SelectItem>
                <SelectItem value="2">Customer 2</SelectItem>
                <SelectItem value="3">Customer 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium">Product</label>
            <Select
              value={formData.product}
              onValueChange={(val) => handleSelectChange('product', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Kebaya Set A</SelectItem>
                <SelectItem value="2">Kebaya Set B</SelectItem>
                <SelectItem value="3">Gaun Pengantin X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variant */}
          <div>
            <label className="block text-sm font-medium">Variant</label>
            <Select
              value={formData.variantId}
              onValueChange={(val) => handleSelectChange('variantId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Size S – Red</SelectItem>
                <SelectItem value="2">Size M – Red</SelectItem>
                <SelectItem value="3">Size L – Blue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleSelectChange('status', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                <SelectItem value="LUNAS">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RentalForm;
