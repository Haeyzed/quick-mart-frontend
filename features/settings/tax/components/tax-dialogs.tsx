"use client"

import { TaxesActionDialog } from './tax-action-dialog'
import { TaxesDeleteDialog } from './tax-delete-dialog'
import { TaxesImportDialog } from './tax-import-dialog'
import { TaxesViewDialog } from './tax-view-dialog'
import { useTaxes } from './tax-provider'

export function TaxesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTaxes()
  return (
    <>
      <TaxesActionDialog
        key='tax-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <TaxesImportDialog
        key='tax-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <TaxesViewDialog
            key={`tax-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <TaxesActionDialog
            key={`tax-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <TaxesDeleteDialog
            key={`tax-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            tax={currentRow}
          />
        </>
      )}
    </>
  )
}

