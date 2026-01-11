"use client"

import React, { useState } from 'react'
import { type Product } from '../data/schema'

type ProductsContextType = {
  currentRow: Product | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Product | null>>
}

const ProductsContext = React.createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [currentRow, setCurrentRow] = useState<Product | null>(null)

  return (
    <ProductsContext.Provider value={{ currentRow, setCurrentRow }}>
      {children}
    </ProductsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const productsContext = React.useContext(ProductsContext)

  if (!productsContext) {
    throw new Error('useProducts has to be used within <ProductsProvider>')
  }

  return productsContext
}

