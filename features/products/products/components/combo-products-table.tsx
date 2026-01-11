"use client"

import { useState } from 'react'
import { useFieldArray, Control, UseFormWatch, useFormContext } from 'react-hook-form'
import { z } from 'zod'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useProductsWithoutVariant, useProductsWithVariant } from '../api/use-products'
import { productFormSchema } from '../data/schema'
import { Tick02Icon, ChevronDown, Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

type ProductFormData = z.infer<typeof productFormSchema>

interface ComboProductsTableProps {
  control: Control<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: (name: keyof ProductFormData, value: any) => void
  units: Array<{ id: number; unit_name: string }>
}

interface ComboProductRow {
  product_id: number
  product_qty: number
  unit_price: number
  wastage_percent: number
  product_name?: string
  product_code?: string
}

export function ComboProductsTable({ control, watch, setValue, units }: ComboProductsTableProps) {
  const { data: productsWithoutVariant = [] } = useProductsWithoutVariant()
  const { data: productsWithVariant = [] } = useProductsWithoutVariant() // Note: Using without variant for combo for simplicity
  
  const productIdArray = ((watch as any)('product_id') as number[]) || []
  const productQtyArray = ((watch as any)('product_qty') as number[]) || []
  const unitPriceArray = ((watch as any)('unit_price') as number[]) || []
  const wastagePercentString = watch('wastage_percent') || ''
  
  // Parse comma-separated strings
  const wastagePercentArray = wastagePercentString 
    ? wastagePercentString.split(',').map(v => parseFloat(v.trim()) || 0)
    : []
  
  // Combine products for search
  const allProducts = [
    ...productsWithoutVariant.map((p) => ({ id: p.id, name: p.name, code: p.code, price: 0 })),
  ]

  const [openSearch, setOpenSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = allProducts.filter((product) => {
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.code.toLowerCase().includes(query)
    )
  })

  const handleAddProduct = (product: typeof allProducts[0]) => {
    // Check if product already exists
    if (productIdArray.includes(product.id)) {
      return // Product already added
    }

    // Add to arrays
    const newProductIds = [...productIdArray, product.id]
    const newQty = [...productQtyArray, 1]
    const newPrice = [...unitPriceArray, product.price]
    const newWastage = [...wastagePercentArray, 0]

    ;(setValue as any)('product_id', newProductIds)
    ;(setValue as any)('product_qty', newQty)
    ;(setValue as any)('unit_price', newPrice)
    setValue('wastage_percent', newWastage.join(','))

    setOpenSearch(false)
    setSearchQuery('')
  }

  const handleRemoveProduct = (index: number) => {
    const newProductIds = productIdArray.filter((_, i) => i !== index)
    const newQty = productQtyArray.filter((_, i) => i !== index)
    const newPrice = unitPriceArray.filter((_, i) => i !== index)
    const newWastage = wastagePercentArray.filter((_, i) => i !== index)

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
      
      <Popover open={openSearch} onOpenChange={setOpenSearch}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            Search products by code or name...
            <HugeiconsIcon icon={ChevronDown} className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search products..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No products found.</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} ${product.code}`}
                    onSelect={() => handleAddProduct(product)}
                  >
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className={cn(
                        "mr-2 h-4 w-4",
                        productIdArray.includes(product.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {product.name} [{product.code}]
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

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
              {productIdArray.map((productId, index) => {
                const product = allProducts.find((p) => p.id === productId)
                const qty = productQtyArray[index] || 0
                const price = unitPriceArray[index] || 0
                const wastage = wastagePercentArray[index] || 0
                
                return (
                  <TableRow key={`${productId}-${index}`}>
                    <TableCell>
                      {product ? `${product.name} [${product.code}]` : `Product ID: ${productId}`}
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

