"use client"

import { CategoriesActionDialog } from './categories-action-dialog'
import { CategoriesDeleteDialog } from './categories-delete-dialog'
import { CategoriesImportDialog } from './categories-import-dialog'
import { CategoriesViewDialog } from './categories-view-dialog'
import { useCategories } from './categories-provider'

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories()
  return (
    <>
      <CategoriesActionDialog
        key='category-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <CategoriesImportDialog
        key='category-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <CategoriesViewDialog
            key={`category-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <CategoriesActionDialog
            key={`category-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <CategoriesDeleteDialog
            key={`category-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            category={currentRow}
          />
        </>
      )}
    </>
  )
}

