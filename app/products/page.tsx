"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Products } from "@/features/products/products";

export default function ProductsPage() {
  return (
    <AuthenticatedLayout>
      <Products />
    </AuthenticatedLayout>
  );
}

