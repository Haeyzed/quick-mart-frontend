"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Apps } from "@/features/apps";

export default function AppsPage() {
  return (
    <AuthenticatedLayout>
      <Apps />
    </AuthenticatedLayout>
  );
}

