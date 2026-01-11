"use client"

import { useState } from 'react'
import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form'
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
import { productFormSchema } from '../data/schema'
import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type ProductFormData = z.infer<typeof productFormSchema>

interface VariantSectionProps {
  control: Control<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: UseFormSetValue<ProductFormData>
}

export function VariantSection({ control, watch, setValue }: VariantSectionProps) {
  const variantOptionArray = ((watch as any)('variant_option') as string[]) || []
  const variantValueArray = ((watch as any)('variant_value') as string[]) || []
  
  const [newOption, setNewOption] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAddVariant = () => {
    if (!newOption.trim() || !newValue.trim()) {
      return
    }

    const newOptions = [...variantOptionArray, newOption.trim()]
    const newValues = [...variantValueArray, newValue.trim()]

    ;(setValue as any)('variant_option', newOptions)
    ;(setValue as any)('variant_value', newValues)

    setNewOption('')
    setNewValue('')
  }

  const handleRemoveVariant = (index: number) => {
    const newOptions = variantOptionArray.filter((_, i) => i !== index)
    const newValues = variantValueArray.filter((_, i) => i !== index)

    ;(setValue as any)('variant_option', newOptions)
    ;(setValue as any)('variant_value', newValues)
  }

  return (
    <Field>
      <FieldLabel>Variant Options</FieldLabel>
      <FieldDescription>
        Add variant options and values (e.g., Color: Red, Blue or Size: S, M, L)
      </FieldDescription>
      
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Option (e.g., Color)"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          className="flex-1"
        />
        <Input
          type="text"
          placeholder="Value (e.g., Red, Blue)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddVariant}
          disabled={!newOption.trim() || !newValue.trim()}
        >
          Add
        </Button>
      </div>

      {variantOptionArray.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variantOptionArray.map((option, index) => (
                <TableRow key={`${option}-${index}`}>
                  <TableCell>{option}</TableCell>
                  <TableCell>{variantValueArray[index] || ''}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <FieldError />
    </Field>
  )
}

