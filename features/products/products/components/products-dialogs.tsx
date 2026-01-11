"use client"

import { ProductsImportDialog } from './products-import-dialog'
import { useProducts } from './products-provider'

export function ProductsDialogs() {
  const { open, setOpen } = useProducts()
  return (
    <>
      <ProductsImportDialog
        key='product-import'
        open={open === 'import'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'import' : null)}
      />
    </>
  )
}

