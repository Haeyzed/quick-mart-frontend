"use client"

import { useState, useEffect } from 'react'
import { Control, UseFormWatch } from 'react-hook-form'
import { z } from 'zod'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { productFormSchema } from '../data/schema'
import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useApiClient } from '@/lib/hooks/use-api-client'

type ProductFormData = z.infer<typeof productFormSchema>

interface ComboProductsTableProps {
  control: Control<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: (name: keyof ProductFormData, value: any) => void
  units: Array<{ id: number; unit_name: string }>
}

interface SearchProduct {
  id: number
  name: string
  code: string
  image_url?: string | string[]
  price?: number
  cost?: number
}

export function ComboProductsTable({ control, watch, setValue, units }: ComboProductsTableProps) {
  const { get } = useApiClient()
  const [items, setItems] = useState<SearchProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SearchProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const anchor = useComboboxAnchor()
  
  const productIdArray = ((watch as any)('product_id') as number[]) || []
  const productQtyArray = ((watch as any)('product_qty') as number[]) || []
  const unitPriceArray = ((watch as any)('unit_price') as number[]) || []
  const wastagePercentString = watch('wastage_percent') || ''
  
  // Parse comma-separated strings
  const wastagePercentArray = wastagePercentString 
    ? wastagePercentString.split(',').map(v => parseFloat(v.trim()) || 0)
    : []

  // Load selected products from form arrays
  useEffect(() => {
    if (productIdArray.length > 0) {
      Promise.all(
        productIdArray.map((id, index) => 
          get<SearchProduct>(`/products/${id}`).then(res => {
            if (!res.data) return null
            return {
              ...res.data,
              price: unitPriceArray[index] || res.data.price || 0,
              cost: res.data.cost || 0,
            }
          })
        )
      ).then(products => {
        const validProducts = products.filter((p): p is SearchProduct & { price: number; cost: number } => 
          p !== null && p !== undefined && p.id !== undefined && p.name !== undefined && p.code !== undefined
        )
        setSelectedProducts(validProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          price: p.price || 0,
          cost: p.cost || 0,
          image_url: Array.isArray(p.image_url) && p.image_url.length > 0
            ? p.image_url
            : null,
        })))
      }).catch(error => {
        console.error('Error fetching combo products:', error)
      })
    } else {
      setSelectedProducts([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdArray.join(',')])

  // Search products when input changes
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
              : []
            setItems(products.map((p: any) => ({
              id: p.id,
              name: p.name,
              code: p.code,
              price: p.price || 0,
              cost: p.cost || 0,
              image_url: Array.isArray(p.image_url) && p.image_url.length > 0
                ? p.image_url
                : null,
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
    
    // Filter out products that are already selected (to prevent duplicates)
    const existingIds = productIdArray
    const newProducts = newValues.filter(p => !existingIds.includes(p.id))
    const allProducts = [...selectedProducts, ...newProducts]
    
    setSelectedProducts(allProducts)
    
    // Update form arrays
    const newProductIds = allProducts.map(p => p.id)
    const newQty = allProducts.map((_, index) => productQtyArray[index] || 1)
    const newPrice = allProducts.map((p, index) => unitPriceArray[index] || p.price || 0)
    const newWastage = allProducts.map((_, index) => wastagePercentArray[index] || 0)

    ;(setValue as any)('product_id', newProductIds)
    ;(setValue as any)('product_qty', newQty)
    ;(setValue as any)('unit_price', newPrice)
    setValue('wastage_percent', newWastage.join(','))
  }

  const getImageUrl = (image_url?: string | string[]) => {
    if (!image_url) return null
    if (typeof image_url === 'string') return image_url
    if (Array.isArray(image_url) && image_url.length > 0) return image_url[0]
    return null
  }

  const itemToStringValue = (item: SearchProduct) => String(item.id)

  const handleRemoveProduct = (index: number) => {
    const newSelectedProducts = selectedProducts.filter((_, i) => i !== index)
    setSelectedProducts(newSelectedProducts)
    
    const newProductIds = newSelectedProducts.map(p => p.id)
    const newQty = newSelectedProducts.map((_, i) => {
      const oldIndex = productIdArray.findIndex(id => id === newSelectedProducts[i].id)
      return oldIndex >= 0 ? productQtyArray[oldIndex] : 1
    })
    const newPrice = newSelectedProducts.map((p, i) => {
      const oldIndex = productIdArray.findIndex(id => id === p.id)
      return oldIndex >= 0 ? unitPriceArray[oldIndex] : p.price || 0
    })
    const newWastage = newSelectedProducts.map((_, i) => {
      const oldIndex = productIdArray.findIndex(id => id === newSelectedProducts[i].id)
      return oldIndex >= 0 ? wastagePercentArray[oldIndex] : 0
    })

    setValue('product_id' as any, newProductIds)
    setValue('product_qty' as any, newQty)
    setValue('unit_price' as any, newPrice)
    setValue('wastage_percent', newWastage.join(','))
  }

  const updateField = (index: number, field: 'product_qty' | 'unit_price' | 'wastage_percent', value: number) => {
    if (field === 'wastage_percent') {
      const newWastage = [...wastagePercentArray]
      newWastage[index] = value
      setValue('wastage_percent', newWastage.join(','))
    } else if (field === 'product_qty') {
      const newQty = [...productQtyArray]
      newQty[index] = value
      setValue('product_qty' as any, newQty)
    } else if (field === 'unit_price') {
      const newPrice = [...unitPriceArray]
      newPrice[index] = value
      setValue('unit_price' as any, newPrice)
    }
  }

  const calculateSubtotal = (index: number) => {
    const qty = productQtyArray[index] || 0
    const price = unitPriceArray[index] || 0
    const wastage = wastagePercentArray[index] || 0
    const subtotal = qty * price * (1 + wastage / 100)
    return subtotal.toFixed(2)
  }

  return (
    <Field>
      <FieldLabel>Add Product</FieldLabel>
      <FieldDescription>
        Search and add products to this combo
      </FieldDescription>
      
      <div className="mb-4">
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
                    placeholder={selectedProducts.length === 0 ? "Search products by name or code..." : ""}
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
              {isSearching ? 'Searching...' : searchQuery.length < 2 ? 'Type at least 2 characters to search' : 'No products found.'}
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
      </div>

      {productIdArray.length > 0 && (
        <div className="mt-4 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Wastage %</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProducts.map((product, index) => {
                const productId = product.id
                const qty = productQtyArray[index] || 1
                const price = unitPriceArray[index] || product.price || 0
                const wastage = wastagePercentArray[index] || 0
                const imageUrl = getImageUrl(product.image_url)
                
                return (
                  <TableRow key={`${productId}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                            unoptimized
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">[{product.code}]</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={wastage}
                          onChange={(e) => updateField(index, 'wastage_percent', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        value={qty}
                        onChange={(e) => updateField(index, 'product_qty', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => updateField(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => updateField(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={calculateSubtotal(index)}
                        readOnly
                        className="w-24 bg-muted"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <FieldError />
    </Field>
  )
}

