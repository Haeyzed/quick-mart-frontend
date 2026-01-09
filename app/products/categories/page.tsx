import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Categories } from '@/features/products/categories'

export default function CategoriesPage() {
    return (
      <AuthenticatedLayout>
        <Categories />
      </AuthenticatedLayout>
    );
}

