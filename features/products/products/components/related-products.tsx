"use client"

import { useState, useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { productFormSchema } from '../data/schema'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { Delete01Icon, Checkmark } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

type ProductFormData = z.infer<typeof productFormSchema>

interface RelatedProductsProps {
  setValue: UseFormSetValue<ProductFormData>
  value?: string
}

interface SearchProduct {
  id: number
  name: string
  code: string
  image?: string
}

export function RelatedProducts({ setValue, value }: RelatedProductsProps) {
  const { get } = useApiClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Parse initial value (comma-separated IDs)
  useEffect(() => {
    if (value) {
      const ids = value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      // We'll need to fetch product details for these IDs, but for now just initialize
      // The API should return product data when loading the form
    }
  }, [value])

  // Search products
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setIsSearching(true)
      const timeoutId = setTimeout(async () => {
        try {
          // Use the products API with search parameter
          const response = await get<SearchProduct[]>('/products', {
            search: searchQuery,
            per_page: 20,
            page: 1,
          })
          if (response.data) {
            // Map to SearchProduct format
            setSearchResults((response.data as any).map((p: any) => ({
              id: p.id,
              name: p.name,
              code: p.code,
              image: p.image_url?.[0] || p.image?.[0],
            })))
          } else {
            setSearchResults([])
          }
        } catch (error) {
          console.error('Error searching products:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, get])

  const handleSelectProduct = (product: SearchProduct) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      return // Already selected
    }

    const newSelected = [...selectedProducts, product]
    setSelectedProducts(newSelected)
    const ids = newSelected.map(p => p.id).join(',')
    setValue('related_products', ids)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveProduct = (productId: number) => {
    const newSelected = selectedProducts.filter(p => p.id !== productId)
    setSelectedProducts(newSelected)
    const ids = newSelected.map(p => p.id).join(',')
    setValue('related_products', ids || undefined)
  }

  return (
    <Field>
      <FieldLabel>Related Products</FieldLabel>
      <FieldDescription>
        Search and select related products for this product
      </FieldDescription>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="border rounded-md max-h-60 overflow-auto">
            <div className="p-2 space-y-1">
              {searchResults.map((product) => {
                const isSelected = selectedProducts.some(p => p.id === product.id)
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-sm",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => handleSelectProduct(product)}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.code}</div>
                    </div>
                    <HugeiconsIcon
                      icon={Checkmark}
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedProducts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Selected Items</h4>
            <div className="border rounded-md divide-y">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-accent relative"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.code}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FieldError />
    </Field>
  )
}

