"use client";
import Card from "components/card";
import CardMenu from "components/card/CardMenu";
import EditProductForm from "components/form/owner/EditProductForm";
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  return (
    <Card extra="w-full h-full">
      <header className="relative flex items-center justify-between px-4 pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Edit Produk
        </div>
        <CardMenu />
      </header>      
      <p className="text-gray-600 px-4 mb-4">
        Isi form di bawah ini untuk mengedit informasi produk Anda.
      </p>
      {productId && <EditProductForm productId={productId} />}
    </Card>
  );
}