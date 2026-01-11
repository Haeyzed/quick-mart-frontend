"use client"

import { useEffect, useMemo } from 'react'
import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { productFormSchema } from '../data/schema'

type ProductFormData = z.infer<typeof productFormSchema>

interface VariantTableProps {
  control: Control<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: UseFormSetValue<ProductFormData>
  productCode: string
}

export function VariantTable({ watch, setValue, productCode }: VariantTableProps) {
  const variantOptionArray = ((watch as any)('variant_option') as string[]) || []
  const variantValueArray = ((watch as any)('variant_value') as string[]) || []
  const variantNameArray = ((watch as any)('variant_name') as string[]) || []
  const itemCodeArray = ((watch as any)('item_code') as string[]) || []
  const additionalCostArray = ((watch as any)('additional_cost') as number[]) || []
  const additionalPriceArray = ((watch as any)('additional_price') as number[]) || []

  // Generate variant combinations from options and values
  const combinations = useMemo(() => {
    if (variantOptionArray.length === 0 || variantValueArray.length === 0) {
      return []
    }

    // Parse variant values (comma-separated)
    const parsedValues = variantValueArray.map(val => 
      val.split(',').map(v => v.trim()).filter(v => v)
    )

    // Generate all combinations
    const generateCombinations = (options: string[], values: string[][]): string[] => {
      if (options.length === 0) return []
      if (options.length === 1) {
        return values[0] || []
      }

      const [firstOption, ...restOptions] = options
      const [firstValues, ...restValues] = values

      if (restOptions.length === 0) {
        return firstValues || []
      }

      const restCombinations = generateCombinations(restOptions, restValues)
      const result: string[] = []

      for (const firstVal of firstValues || []) {
        for (const restCombo of restCombinations) {
          result.push(`${firstVal}/${restCombo}`)
        }
      }

      return result
    }

    return generateCombinations(variantOptionArray, parsedValues)
  }, [variantOptionArray, variantValueArray])

  // Update variant arrays when combinations change
  useEffect(() => {
    if (combinations.length === 0) {
      ;(setValue as any)('variant_name', [])
      ;(setValue as any)('item_code', [])
      ;(setValue as any)('additional_cost', [])
      ;(setValue as any)('additional_price', [])
      return
    }

    // Initialize arrays if needed
    const newVariantNames = [...variantNameArray]
    const newItemCodes = [...itemCodeArray]
    const newAdditionalCosts = [...additionalCostArray]
    const newAdditionalPrices = [...additionalPriceArray]

    // Update arrays to match combinations length
    while (newVariantNames.length < combinations.length) {
      const index = newVariantNames.length
      newVariantNames.push(combinations[index])
      newItemCodes.push(`${combinations[index]}-${productCode}`)
      newAdditionalCosts.push(0)
      newAdditionalPrices.push(0)
    }

    // Trim arrays if combinations decreased
    if (newVariantNames.length > combinations.length) {
      newVariantNames.splice(combinations.length)
      newItemCodes.splice(combinations.length)
      newAdditionalCosts.splice(combinations.length)
      newAdditionalPrices.splice(combinations.length)
    }

    // Update variant names to match current combinations
    combinations.forEach((combo, index) => {
      newVariantNames[index] = combo
      if (!newItemCodes[index] || newItemCodes[index] === `${variantNameArray[index] || ''}-${productCode}`) {
        newItemCodes[index] = `${combo}-${productCode}`
      }
    })

    ;(setValue as any)('variant_name', newVariantNames)
    ;(setValue as any)('item_code', newItemCodes)
    ;(setValue as any)('additional_cost', newAdditionalCosts)
    ;(setValue as any)('additional_price', newAdditionalPrices)
  }, [combinations, productCode, setValue])

  const updateField = (index: number, field: 'item_code' | 'additional_cost' | 'additional_price', value: string | number) => {
    if (field === 'item_code') {
      const newCodes = [...itemCodeArray]
      newCodes[index] = value as string
      ;(setValue as any)('item_code', newCodes)
    } else if (field === 'additional_cost') {
      const newCosts = [...additionalCostArray]
      newCosts[index] = Number(value) || 0
      ;(setValue as any)('additional_cost', newCosts)
    } else if (field === 'additional_price') {
      const newPrices = [...additionalPriceArray]
      newPrices[index] = Number(value) || 0
      ;(setValue as any)('additional_price', newPrices)
    }
  }

  if (combinations.length === 0) {
    return null
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Item Code</TableHead>
            <TableHead>Additional Cost</TableHead>
            <TableHead>Additional Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combo, index) => (
            <TableRow key={`${combo}-${index}`}>
              <TableCell>
                {combo}
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={itemCodeArray[index] || `${combo}-${productCode}`}
                  onChange={(e) => updateField(index, 'item_code', e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={String(additionalCostArray[index] || 0)}
                  onChange={(e) => updateField(index, 'additional_cost', e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={String(additionalPriceArray[index] || 0)}
                  onChange={(e) => updateField(index, 'additional_price', e.target.value)}
                  className="w-full"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

