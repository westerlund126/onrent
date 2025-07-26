"use client";
import Card from "components/card";
import EditProductForm from "components/form/owner/EditProductForm";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  return (
    <Card extra="w-full h-full">
      <div className="mb-4 flex items-center gap-4 px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Produk
        </Button>
      </div>

      <header className="relative flex items-center justify-between px-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Edit Produk
        </div>
      </header>

      <p className="text-gray-600 px-4 mb-4">
        Isi form di bawah ini untuk mengedit informasi produk Anda.
      </p>

      {productId && <EditProductForm productId={productId} />}
    </Card>
  );
}
