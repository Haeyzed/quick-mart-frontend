"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ProductCreate } from "@/features/products/product-create";

export default function ProductCreatePage() {
  return (
    <AuthenticatedLayout>
      <ProductCreate />
    </AuthenticatedLayout>
  );
}

