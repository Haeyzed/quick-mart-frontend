"use client"

import { useState, useEffect, useMemo } from 'react'
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
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { productFormSchema } from '../data/schema'
import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { useProductsWithoutVariant, useProductsWithVariant, useComboProductSearch, type ComboSearchResponse } from '../api/use-products'

type ProductFormData = z.infer<typeof productFormSchema>

interface ComboProductsTableProps {
  control: Control<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: (name: keyof ProductFormData, value: any) => void
}

interface ComboProduct {
  id: number
  name: string
  code: string
  price: number
  cost: number
  variant_id: number | null
  unit_id: number
  units: Array<{
    id: number
    name: string
    operation_value: number
    operator: string
    selected: boolean
  }>
  image_url?: string | null
}

interface ProductCodeOption {
  value: string // "code (name)" format
  code: string
  name: string
}


export function ComboProductsTable({ control, watch, setValue }: ComboProductsTableProps) {
  const { get } = useApiClient()
  const { data: productsWithoutVariant = [] } = useProductsWithoutVariant()
  const { data: productsWithVariant = [] } = useProductsWithVariant()
  const comboProductSearch = useComboProductSearch()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<ComboProduct[]>([])
  
  const productIdArray = ((watch as any)('product_id') as number[]) || []
  const productQtyArray = ((watch as any)('product_qty') as number[]) || []
  const unitPriceArray = ((watch as any)('unit_price') as number[]) || []
  const variantIdArray = ((watch as any)('variant_id') as number[]) || []
  const wastagePercentString = watch('wastage_percent') || ''
  const comboUnitIdString = watch('combo_unit_id') || ''
  
  // Parse comma-separated strings
  const wastagePercentArray = wastagePercentString 
    ? wastagePercentString.split(',').map(v => parseFloat(v.trim()) || 0)
    : []
  const comboUnitIdArray = comboUnitIdString
    ? comboUnitIdString.split(',').map(v => parseInt(v.trim()) || 0)
    : []
  
  // Create product code options for autocomplete (matching blade file format)
  // create.blade.php: products without variant use "code (name)", products with variant use "item_code (name)"
  // edit.blade.php: products without variant use "code(name)", products with variant use "item_code|name"
  // We'll use create.blade.php format: "code (name)" for non-variant, "code (name)" for variant (API returns item_code as 'code')
  const productCodeOptions = useMemo(() => {
    const options: ProductCodeOption[] = []
    
    // Add products without variant - format: "code (name)"
    productsWithoutVariant.forEach((product: any) => {
      options.push({
        value: `${product.code} (${product.name})`,
        code: product.code,
        name: product.name,
      })
    })
    
    // Add products with variant - format: "item_code (name)" (API returns item_code as 'code' field)
    productsWithVariant.forEach((product: any) => {
      // For variants, the API returns item_code as 'code', but we need to use it with format "code (name)"
      options.push({
        value: `${product.code} (${product.name})`,
        code: product.code, // This is actually item_code from API (aliased as 'code')
        name: product.name,
      })
    })
    
    return options
  }, [productsWithoutVariant, productsWithVariant])
  
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return []
    const query = searchQuery.toLowerCase()
    return productCodeOptions.filter(option => 
      option.value.toLowerCase().includes(query)
    )
  }, [searchQuery, productCodeOptions])
  
  // Load selected products from form arrays (matching blade file edit.blade.php lines 119-180)
  useEffect(() => {
    if (productIdArray.length > 0) {
      Promise.all(
        productIdArray.map(async (id, index) => {
          try {
            // Get product details
            const productRes = await get<{ 
              code?: string
              name?: string
              unit_id?: number
              price?: number
              cost?: number
              is_variant?: boolean
            }>(`/products/${id}`)
            if (!productRes.data) return null
            
            const productData = productRes.data
            const variantId = variantIdArray[index] || null
            let searchCode = productData.code || ''
            
            // If variant exists, get item_code (matching blade edit.blade.php lines 131-134)
            if (variantId && productData.is_variant) {
              // For variants, we need item_code - the API's searchComboProduct handles both code and item_code
              // So we can use the product code, and the API will search variants by item_code if needed
              // But to be safe, let's use the format that matches what user selected: "code (name)"
              searchCode = productData.code || ''
            }
            
            // Build search code in format "CODE (Name)" or just "CODE" - API will extract code
            // Format matches blade file which sends the full autocomplete value like "CODE (Name)"
            const searchValue = `${searchCode} (${productData.name || ''})`
            
            // Call combo-search API (matching blade file's lims_product_search call)
            const searchRes = await get<{ data: ComboSearchResponse[] }>('/products/combo-search', {
              data: searchValue, // Pass full format, API extracts code
            })
            
            if (!searchRes.data || !Array.isArray(searchRes.data) || searchRes.data.length === 0) return null
            
            const data = searchRes.data[0]
            const selectedUnitId = comboUnitIdArray[index] || data.unit_id || null
            const storedPrice = unitPriceArray[index] || data.price || 0
            const storedQty = productQtyArray[index] || 1
            
            return {
              id: data.id,
              name: data.name,
              code: data.code,
              price: storedPrice,
              cost: data.cost || 0,
              variant_id: variantId || data.variant_id || null,
              unit_id: selectedUnitId || data.unit_id || 0,
              units: data.units || [],
              image_url: null,
            } as ComboProduct
          } catch (error) {
            console.error('Error loading combo product:', error)
            return null
          }
        })
      ).then(products => {
        const validProducts = products.filter((p): p is ComboProduct => 
          p !== null && p !== undefined
        )
        setSelectedProducts(validProducts)
      })
    } else {
      setSelectedProducts([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdArray.join(','), variantIdArray.join(','), comboUnitIdArray.join(',')])
  
  const handleProductSelect = async (option: ProductCodeOption | null) => {
    if (!option) return
    
    const searchCode = option.value
    
    try {
      // Call combo-search endpoint using the hook
      const data = await comboProductSearch.mutateAsync(searchCode)
      
      // Check for duplicates using variant_id (matching blade logic line 1400-1405)
      // Blade checks: if variant_id matches, it's a duplicate
      const dataVariantId = data.variant_id || null
      const isDuplicate = selectedProducts.some(p => {
        const pVariantId = p.variant_id || null
        return pVariantId === dataVariantId
      })
      
      if (isDuplicate) {
        alert('Duplicate input is not allowed!')
        setSearchQuery('')
        return
      }
      
      const selectedUnitId = data.unit_id || (data.units && data.units.length > 0 ? data.units[0].id : null)
      
      const newProduct: ComboProduct = {
        id: data.id,
        name: data.name,
        code: data.code,
        price: data.price,
        cost: data.cost,
        variant_id: data.variant_id,
        unit_id: selectedUnitId || 0,
        units: data.units || [],
        image_url: null,
      }
      
      // Add to selected products
      const newSelectedProducts = [...selectedProducts, newProduct]
      setSelectedProducts(newSelectedProducts)
      
      // Update form arrays
      const newProductIds = newSelectedProducts.map(p => p.id)
      const newQty = newSelectedProducts.map((_, index) => productQtyArray[index] || 1)
      const newPrice = newSelectedProducts.map((p, index) => {
        if (index === selectedProducts.length) return p.price
        return unitPriceArray[index] || p.price || 0
      })
      const newVariantIds = newSelectedProducts.map(p => p.variant_id || 0)
      const newWastage = newSelectedProducts.map((_, index) => wastagePercentArray[index] || 0)
      const newComboUnitIds = newSelectedProducts.map((p, index) => {
        if (index === selectedProducts.length) return p.unit_id
        return comboUnitIdArray[index] || p.unit_id || 0
      })
      
      ;(setValue as any)('product_id', newProductIds)
      ;(setValue as any)('product_qty', newQty)
      ;(setValue as any)('unit_price', newPrice)
      ;(setValue as any)('variant_id', newVariantIds)
      setValue('wastage_percent', newWastage.join(','))
      setValue('combo_unit_id', newComboUnitIds.join(','))
      
      // Update main product price (sum of all unit prices)
      const totalPrice = newPrice.reduce((sum, price) => sum + price, 0)
      setValue('price' as any, totalPrice)
      
      // Update main product cost (sum of all costs)
      const totalCost = newSelectedProducts.reduce((sum, p) => sum + (p.cost || 0), 0)
      setValue('cost' as any, totalCost)
      
      setSearchQuery('')
    } catch (error) {
      console.error('Error searching combo product:', error)
      alert('Error loading product. Please try again.')
    }
  }
  
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
    const newVariantIds = newSelectedProducts.map(p => p.variant_id || 0)
    const newWastage = newSelectedProducts.map((_, i) => {
      const oldIndex = productIdArray.findIndex(id => id === newSelectedProducts[i].id)
      return oldIndex >= 0 ? wastagePercentArray[oldIndex] : 0
    })
    const newComboUnitIds = newSelectedProducts.map((p, i) => {
      const oldIndex = productIdArray.findIndex(id => id === p.id)
      return oldIndex >= 0 ? comboUnitIdArray[oldIndex] : p.unit_id || 0
    })
    
    setValue('product_id' as any, newProductIds)
    setValue('product_qty' as any, newQty)
    setValue('unit_price' as any, newPrice)
    setValue('variant_id' as any, newVariantIds)
    setValue('wastage_percent', newWastage.join(','))
    setValue('combo_unit_id', newComboUnitIds.join(','))
    
    // Recalculate totals
    const totalPrice = newPrice.reduce((sum, price) => sum + price, 0)
    setValue('price' as any, totalPrice)
    const totalCost = newSelectedProducts.reduce((sum, p) => sum + (p.cost || 0), 0)
    setValue('cost' as any, totalCost)
  }
  
  const updateField = (index: number, field: 'product_qty' | 'unit_price' | 'wastage_percent' | 'combo_unit_id', value: number | string) => {
    if (field === 'wastage_percent') {
      const newWastage = [...wastagePercentArray]
      newWastage[index] = value as number
      setValue('wastage_percent', newWastage.join(','))
      calculatePrice(index)
    } else if (field === 'product_qty') {
      const newQty = [...productQtyArray]
      newQty[index] = value as number
      setValue('product_qty' as any, newQty)
      calculatePrice(index)
    } else if (field === 'unit_price') {
      const newPrice = [...unitPriceArray]
      newPrice[index] = value as number
      setValue('unit_price' as any, newPrice)
      calculatePrice(index)
    } else if (field === 'combo_unit_id') {
      const newComboUnitIds = [...comboUnitIdArray]
      newComboUnitIds[index] = value as number
      setValue('combo_unit_id', newComboUnitIds.join(','))
      
      // Update the selected product's unit_id
      const updatedProducts = [...selectedProducts]
      updatedProducts[index].unit_id = value as number
      setSelectedProducts(updatedProducts)
      
      calculatePrice(index)
    }
  }
  
  const calculatePrice = (index: number) => {
    const product = selectedProducts[index]
    if (!product) return
    
    const qty = productQtyArray[index] || 0
    const baseUnitPrice = unitPriceArray[index] || product.price || 0
    const baseCost = product.cost || 0
    
    // Get selected unit
    const selectedUnitId = comboUnitIdArray[index] || product.unit_id
    const selectedUnit = product.units.find(u => u.id === selectedUnitId) || product.units[0]
    
    if (!selectedUnit) return
    
    // Convert quantity based on operator
    let convertedQty = qty
    if (selectedUnit.operator === '*') {
      convertedQty = qty * (selectedUnit.operation_value || 1)
    } else if (selectedUnit.operator === '/') {
      convertedQty = qty / (selectedUnit.operation_value || 1)
    }
    
    // Calculate subtotal using converted quantity
    const subtotal = convertedQty * baseUnitPrice
    const unitCost = convertedQty * baseCost
    
    // Update unit_price and unit_cost (these will be stored, but subtotal is calculated)
    // Note: We store the base price, subtotal is calculated on display
    
    // Calculate total price and cost for all products
    const totalPrice = selectedProducts.reduce((sum, p, i) => {
      if (i === index) {
        return sum + subtotal
      }
      const q = productQtyArray[i] || 0
      const up = unitPriceArray[i] || p.price || 0
      const uid = comboUnitIdArray[i] || p.unit_id
      const u = p.units.find(unit => unit.id === uid) || p.units[0]
      let cq = q
      if (u) {
        if (u.operator === '*') {
          cq = q * (u.operation_value || 1)
        } else if (u.operator === '/') {
          cq = q / (u.operation_value || 1)
        }
      }
      return sum + (cq * up)
    }, 0)
    
    setValue('price' as any, totalPrice)
  }
  
  const calculateSubtotal = (index: number) => {
    const product = selectedProducts[index]
    if (!product) return '0.00'
    
    const qty = productQtyArray[index] || 0
    const price = unitPriceArray[index] || product.price || 0
    const wastage = wastagePercentArray[index] || 0
    const selectedUnitId = comboUnitIdArray[index] || product.unit_id
    const selectedUnit = product.units.find(u => u.id === selectedUnitId) || product.units[0]
    
    if (!selectedUnit) return (qty * price * (1 + wastage / 100)).toFixed(2)
    
    // Convert quantity based on operator
    let convertedQty = qty
    if (selectedUnit.operator === '*') {
      convertedQty = qty * (selectedUnit.operation_value || 1)
    } else if (selectedUnit.operator === '/') {
      convertedQty = qty / (selectedUnit.operation_value || 1)
    }
    
    const subtotal = convertedQty * price * (1 + wastage / 100)
    return subtotal.toFixed(2)
  }
  
  const getImageUrl = (image_url?: string | string[] | null) => {
    if (!image_url) return null
    if (typeof image_url === 'string') return image_url
    if (Array.isArray(image_url) && image_url.length > 0) return image_url[0]
    return null
  }

  return (
    <Field>
      <FieldLabel>Add Product</FieldLabel>
      <FieldDescription>
        Search and add products to this combo by typing product code
      </FieldDescription>
      
      <div className="space-y-2">
        <Combobox<ProductCodeOption>
          items={filteredOptions}
          value={null}
          onValueChange={(value) => {
            if (value) {
              handleProductSelect(value)
            }
          }}
          itemToStringValue={(item) => item.value}
        >
          <ComboboxInput
            placeholder="Type product code and select (e.g., CODE001 (Product Name))"
            value={searchQuery}
            onChange={(e) => {
              const inputValue = (e.target as HTMLInputElement).value
              setSearchQuery(inputValue)
            }}
          />
          <ComboboxContent>
            <ComboboxEmpty>
              {comboProductSearch.isPending ? 'Searching...' : searchQuery.length === 0 ? 'Start typing to search products...' : 'No products found.'}
            </ComboboxEmpty>
            <ComboboxList>
              {(item) => item ? (
                <ComboboxItem key={item.value} value={item}>
                  {item.value}
                </ComboboxItem>
              ) : null}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {selectedProducts.length > 0 && (
        <div className="mt-4 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Wastage %</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
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
                const selectedUnitId = comboUnitIdArray[index] || product.unit_id
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
                      {product.units.length > 0 ? (
                        <Select
                          value={selectedUnitId?.toString()}
                          onValueChange={(value) => {
                            updateField(index, 'combo_unit_id', parseInt(value) || 0)
                            calculatePrice(index)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Unit Cost - shows converted cost (calculated based on unit and qty) */}
                      <Input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const selectedUnit = product.units.find(u => u.id === selectedUnitId) || product.units[0]
                          if (!selectedUnit) return product.cost
                          let convertedQty = qty
                          if (selectedUnit.operator === '*') {
                            convertedQty = qty * (selectedUnit.operation_value || 1)
                          } else if (selectedUnit.operator === '/') {
                            convertedQty = qty / (selectedUnit.operation_value || 1)
                          }
                          return (convertedQty * product.cost).toFixed(2)
                        })()}
                        readOnly
                        className="w-24 bg-muted"
                      />
                    </TableCell>
                    <TableCell>
                      {/* Unit Price - editable, stores converted price */}
                      <Input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => updateField(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      {/* Subtotal - calculated display only */}
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
