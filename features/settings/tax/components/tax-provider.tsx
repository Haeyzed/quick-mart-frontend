"use client"

import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Tax } from '../data/schema'

type TaxesDialogType = 'add' | 'edit' | 'delete' | 'import' | 'view'

type TaxesContextType = {
  open: TaxesDialogType | null
  setOpen: (str: TaxesDialogType | null) => void
  currentRow: Tax | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Tax | null>>
}

const TaxesContext = React.createContext<TaxesContextType | null>(null)

export function TaxesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TaxesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Tax | null>(null)

  return (
    <TaxesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TaxesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTaxes = () => {
  const taxesContext = React.useContext(TaxesContext)

  if (!taxesContext) {
    throw new Error('useTaxes has to be used within <TaxesContext>')
  }

  return taxesContext
}

