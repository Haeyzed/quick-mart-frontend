"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Taxes } from "@/features/settings/tax";

export default function TaxPage() {
  return (
    <AuthenticatedLayout>
      <Taxes />
    </AuthenticatedLayout>
  );
}

