import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Dashboard } from "@/features/dashboard";

export default function Page() {
  return (
    <AuthenticatedLayout>
      <Dashboard />
    </AuthenticatedLayout>
  );
}
