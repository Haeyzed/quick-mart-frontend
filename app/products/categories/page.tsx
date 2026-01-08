import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Categories } from '@/features/categories'

export default function CategoriesPage() {
    return (
      <AuthenticatedLayout>
        <Categories />
      </AuthenticatedLayout>
    );
}

