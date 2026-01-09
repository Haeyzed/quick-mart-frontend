"use client"

import { UnitsActionDialog } from './units-action-dialog'
import { UnitsDeleteDialog } from './units-delete-dialog'
import { UnitsImportDialog } from './units-import-dialog'
import { UnitsViewDialog } from './units-view-dialog'
import { useUnits } from './units-provider'

export function UnitsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUnits()
  return (
    <>
      <UnitsActionDialog
        key='unit-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <UnitsImportDialog
        key='unit-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <UnitsViewDialog
            key={`unit-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UnitsActionDialog
            key={`unit-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UnitsDeleteDialog
            key={`unit-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            unit={currentRow}
          />
        </>
      )}
    </>
  )
}

