"use client"

import { useState, useEffect, useRef } from 'react'
import { UseFormSetValue, FieldValues, Path } from 'react-hook-form'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (searchQuery.length >= 2) {
      setIsSearching(true)
      const timeoutId = setTimeout(async () => {
        try {
          const response = await get<{ data: SearchProduct[] }>('/products', {
            search: searchQuery,
            per_page: 20,
            page: 1,
          })
          if (response.data) {
            const products = Array.isArray(response.data) 
              ? response.data 
              : (response.data as any).data || []
            setSearchResults(products.map((p: any) => ({
              id: p.id,
              name: p.name,
              code: p.code,
              image_url: p.image_url || p.image,
            })))
            setIsOpen(true)
          } else {
            setSearchResults([])
            setIsOpen(true)
          }
        } catch (error) {
          console.error('Error searching products:', error)
          setSearchResults([])
          setIsOpen(true)
        } finally {
          setIsSearching(false)
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
      setIsOpen(false)
    }
  }, [searchQuery, get])

  const handleSelectProduct = (product: SearchProduct) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      return // Already selected
    }

    const newSelected = [...selectedProducts, product]
    setSelectedProducts(newSelected)
    const ids = newSelected.map(p => p.id).join(',')
    setValue('related_products' as Path<TFieldValues>, ids as any)
    setSearchQuery('')
    setSearchResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemoveProduct = (productId: number) => {
    const newSelected = selectedProducts.filter(p => p.id !== productId)
    setSelectedProducts(newSelected)
    const ids = newSelected.map(p => p.id).join(',')
    setValue('related_products' as Path<TFieldValues>, (ids || null) as any)
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const getImageUrl = (image_url?: string | string[]) => {
    if (!image_url) return null
    if (typeof image_url === 'string') return image_url
    if (Array.isArray(image_url) && image_url.length > 0) return image_url[0]
    return null
  }

  return (
    <Field>
      <FieldLabel>Related Products</FieldLabel>
      <FieldDescription>
        Search and select related products for this product
      </FieldDescription>

      <div className="space-y-4">
        <Popover open={isOpen && searchResults.length > 0} onOpenChange={setIsOpen}>
          <PopoverAnchor asChild>
            <div
              ref={anchorRef}
              className={cn(
                "dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] has-aria-invalid:ring-[3px]",
                selectedProducts.length > 0 && "px-1.5"
              )}
            >
              {selectedProducts.map((product) => {
                const imageUrl = getImageUrl(product.image_url)
                return (
                  <div
                    key={product.id}
                    data-slot="combobox-chip"
                    className={cn(
                      "bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap pr-0"
                    )}
                  >
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        width={16}
                        height={16}
                        className="rounded object-cover"
                      />
                    )}
                    <span className="pr-1">{product.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="-ml-1 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveProduct(product.id)
                      }}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="pointer-events-none" />
                    </Button>
                  </div>
                )
              })}
              <InputGroup className="w-auto border-0 shadow-none p-0 h-auto flex-1 min-w-16">
                <InputGroupInput
                  ref={inputRef}
                  type="text"
                  placeholder={selectedProducts.length === 0 ? "Search products by name or code..." : ""}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setIsOpen(true)
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  {searchQuery && (
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleClear}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="pointer-events-none" />
                    </InputGroupButton>
                  )}
                  {isSearching && !searchQuery && (
                    <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </InputGroupAddon>
              </InputGroup>
            </div>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="bg-popover text-popover-foreground max-h-72 min-w-36 overflow-hidden rounded-md shadow-md ring-1 ring-foreground/10 p-1 w-[var(--radix-popover-trigger-width)]"
          >
            {searchResults.length === 0 ? (
              <div className="text-muted-foreground flex w-full justify-center py-2 text-center text-sm">
                No products found.
              </div>
            ) : (
              <div className="no-scrollbar max-h-[calc(18rem-0.5rem)] overflow-y-auto overscroll-contain p-1">
                {searchResults.map((product) => {
                  const isSelected = selectedProducts.some(p => p.id === product.id)
                  const imageUrl = getImageUrl(product.image_url)
                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "data-highlighted:bg-accent data-highlighted:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm relative flex w-full cursor-pointer items-center outline-hidden select-none hover:bg-accent",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <Item variant="default" size="xs" className="border-0 p-0 w-full">
                        {imageUrl && (
                          <ItemMedia variant="image">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </ItemMedia>
                        )}
                        <ItemContent>
                          <ItemTitle>{product.name}</ItemTitle>
                          <ItemDescription>{product.code}</ItemDescription>
                        </ItemContent>
                      </Item>
                      {isSelected && (
                        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="pointer-events-none" />
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </PopoverContent>
        </Popover>

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
