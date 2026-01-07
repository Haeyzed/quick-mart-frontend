"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Brands } from "@/features/brands";

export default function BrandsPage() {
  return (
    <AuthenticatedLayout>
      <Brands />
    </AuthenticatedLayout>
  );
}

