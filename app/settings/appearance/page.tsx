"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Settings } from "@/features/settings";

export default function SettingsAppearancePage() {
  return (
    <AuthenticatedLayout>
      <Settings />
    </AuthenticatedLayout>
  );
}

