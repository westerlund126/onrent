"use client";
import Card from "components/card";
import AddProductForm from "components/form/owner/AddProductForm";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';

export default function AddProductPage() {
  const router = useRouter();
  return (
    <div>
    <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Produk
            </Button>
          </div>
 <Card extra="w-full h-full">
        <header className="relative flex items-center justify-between px-4 pt-4">
          
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Tambah Produk
          </div>
                  </header>      
        <p className="text-gray-600 px-4 mb-4">
          Isi form di bawah ini untuk menambahkan produk baru ke katalog Anda.
        </p>

      
      <AddProductForm />
    </Card>
    </div>
  );
}