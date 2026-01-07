"use client"

import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Brand } from '../data/schema'

type BrandsDialogType = 'add' | 'edit' | 'delete' | 'import' | 'view'

type BrandsContextType = {
  open: BrandsDialogType | null
  setOpen: (str: BrandsDialogType | null) => void
  currentRow: Brand | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Brand | null>>
}

const BrandsContext = React.createContext<BrandsContextType | null>(null)

export function BrandsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BrandsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Brand | null>(null)

  return (
    <BrandsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BrandsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBrands = () => {
  const brandsContext = React.useContext(BrandsContext)

  if (!brandsContext) {
    throw new Error('useBrands has to be used within <BrandsContext>')
  }

  return brandsContext
}

