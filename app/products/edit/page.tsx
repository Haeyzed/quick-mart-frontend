"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ProductEdit } from "@/features/products/product-edit";

export default function ProductEditPage() {
  return (
    <AuthenticatedLayout>
      <ProductEdit />
    </AuthenticatedLayout>
  );
}

