"use client";
import Card from "components/card";
import AddProductForm from "components/form/owner/AddProductForm";

export default function AddProductPage() {
  return (
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
  );
}