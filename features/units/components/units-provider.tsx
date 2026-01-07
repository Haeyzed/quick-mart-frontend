"use client"

import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Unit } from '../data/schema'

type UnitsDialogType = 'add' | 'edit' | 'delete' | 'import' | 'view'

type UnitsContextType = {
  open: UnitsDialogType | null
  setOpen: (str: UnitsDialogType | null) => void
  currentRow: Unit | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Unit | null>>
}

const UnitsContext = React.createContext<UnitsContextType | null>(null)

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UnitsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Unit | null>(null)

  return (
    <UnitsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UnitsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUnits = () => {
  const unitsContext = React.useContext(UnitsContext)

  if (!unitsContext) {
    throw new Error('useUnits has to be used within <UnitsContext>')
  }

  return unitsContext
}

