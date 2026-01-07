"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Units } from "@/features/units";

export default function UnitsPage() {
  return (
    <AuthenticatedLayout>
      <Units />
    </AuthenticatedLayout>
  );
}

