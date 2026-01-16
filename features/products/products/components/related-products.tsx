"use client"

import { useState, useEffect, useRef } from 'react'
import { UseFormSetValue, FieldValues, Path } from 'react-hook-form'
import Image from 'next/image'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { cn } from '@/lib/utils'

interface RelatedProductsProps<TFieldValues extends FieldValues = FieldValues> {
  setValue: UseFormSetValue<TFieldValues>
  value?: string
}

interface SearchProduct {
  id: number
  name: string
  code: string
  image_url?: string | string[]
}

export function RelatedProducts<TFieldValues extends FieldValues = FieldValues>({ 
  setValue, 
  value 
}: RelatedProductsProps<TFieldValues>) {
  const { get } = useApiClient()
  const [items, setItems] = useState<SearchProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SearchProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const anchor = useComboboxAnchor()

  // Parse initial value (comma-separated IDs) and fetch product details
  useEffect(() => {
    if (value) {
      const ids = value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      if (ids.length > 0) {
        // Fetch product details for these IDs
        Promise.all(
          ids.map(id => 
            get<SearchProduct>(`/products/${id}`).then(res => res.data)
          )
        ).then(products => {
          const validProducts = products.filter((p): p is SearchProduct => p !== null && p !== undefined)
          setSelectedProducts(validProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            // image_url is already an array of full URLs from API
            image_url: Array.isArray(p.image_url) && p.image_url.length > 0
              ? p.image_url
              : null,
          })))
        }).catch(error => {
          console.error('Error fetching related products:', error)
        })
      }
    } else {
      setSelectedProducts([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Search products when input changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setIsSearching(true)
      const timeoutId = setTimeout(async () => {
        try {
          const response = await get<{ data: SearchProduct[] }>('/products/search', {
            term: searchQuery,
          })
          if (response.data) {
            // response.data is an array of products from search endpoint
            const products = Array.isArray(response.data) 
              ? response.data 
              : []
            setItems(products.map((p: any) => ({
              id: p.id,
              name: p.name,
              code: p.code,
              // image_url is a string URL from search endpoint
              image_url: p.image_url || null,
            })))
          } else {
            setItems([])
          }
        } catch (error) {
          console.error('Error searching products:', error)
          setItems([])
        } finally {
          setIsSearching(false)
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setItems([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleValueChange = (values: SearchProduct[] | SearchProduct | null) => {
    const newValues = Array.isArray(values) ? values : (values ? [values] : [])
    setSelectedProducts(newValues)
    const ids = newValues.map(p => p.id).join(',')
    setValue('related_products' as Path<TFieldValues>, (ids || null) as any)
  }

  const getImageUrl = (image_url?: string | string[]) => {
    if (!image_url) return null
    if (typeof image_url === 'string') return image_url
    // Use image_url[0] - first image from array
    if (Array.isArray(image_url) && image_url.length > 0) return image_url[0]
    return null
  }

  const itemToStringValue = (item: SearchProduct) => String(item.id)

  return (
    <Field>
      <FieldLabel>Related Products</FieldLabel>
      <FieldDescription>
        Search and select related products for this product
      </FieldDescription>

      <div className="space-y-4">
        <Combobox
          multiple
          autoHighlight
          items={items}
          value={selectedProducts}
          onValueChange={handleValueChange}
          itemToStringValue={itemToStringValue}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(values) => (
                <>
                  {Array.isArray(values) && values.map((product: SearchProduct) => {
                    const imageUrl = getImageUrl(product.image_url)
                    return (
                      <ComboboxChip key={product.id} {...({ value: product } as any)}>
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={16}
                            height={16}
                            className="rounded object-cover mr-1"
                            unoptimized
                          />
                        )}
                        {product.name}
                      </ComboboxChip>
                    )
                  })}
                  <ComboboxChipsInput 
                    placeholder={selectedProducts.length === 0 ? "Search products by name or code (min 3 characters)..." : ""}
                    onChange={(e) => {
                      const inputValue = (e.target as HTMLInputElement).value
                      setSearchQuery(inputValue)
                    }}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>
              {isSearching ? 'Searching...' : searchQuery.length < 3 ? 'Type at least 3 characters to search' : 'No products found.'}
            </ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const imageUrl = getImageUrl(item.image_url)
                return (
                  <ComboboxItem key={item.id} value={item}>
                    <Item variant="default" size="xs" className="border-0 p-0 w-full">
                      {imageUrl && (
                        <ItemMedia variant="image">
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-cover"
                            unoptimized
                          />
                        </ItemMedia>
                      )}
                      <ItemContent>
                        <ItemTitle>{item.name}</ItemTitle>
                        <ItemDescription>{item.code}</ItemDescription>
                      </ItemContent>
                    </Item>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {selectedProducts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Selected Products</h4>
            <div className="space-y-2">
              {selectedProducts.map((product) => {
                const imageUrl = getImageUrl(product.image_url)
                return (
                  <Item key={product.id} variant="muted">
                    {imageUrl && (
                      <ItemMedia variant="image">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </ItemMedia>
                    )}
                    <ItemContent>
                      <ItemTitle>{product.name}</ItemTitle>
                      <ItemDescription>{product.code}</ItemDescription>
                    </ItemContent>
                  </Item>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <FieldError />
    </Field>
  )
}
