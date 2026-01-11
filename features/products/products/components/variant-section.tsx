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
import { TagInput } from '@/components/tag-input'
import { VariantTable } from './variant-table'
import { productFormSchema } from '../data/schema'
import { Delete01Icon, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type ProductFormData = z.infer<typeof productFormSchema>

interface VariantSectionProps {
  control: Control<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: UseFormSetValue<ProductFormData>
  productCode: string
}

export function VariantSection({ control, watch, setValue, productCode }: VariantSectionProps) {
  const variantOptionArray = ((watch as any)('variant_option') as string[]) || []
  const variantValueArray = ((watch as any)('variant_value') as string[]) || []
  
  const [newOption, setNewOption] = useState('')
  const [newValues, setNewValues] = useState<string[]>([])

  const handleAddVariant = () => {
    if (!newOption.trim() || newValues.length === 0) {
      return
    }

    const newOptions = [...variantOptionArray, newOption.trim()]
    const newValueStrings = [...variantValueArray, newValues.join(',')]

    ;(setValue as any)('variant_option', newOptions)
    ;(setValue as any)('variant_value', newValueStrings)

    setNewOption('')
    setNewValues([])
  }

  const handleRemoveVariant = (index: number) => {
    const newOptions = variantOptionArray.filter((_, i) => i !== index)
    const newValueStrings = variantValueArray.filter((_, i) => i !== index)

    ;(setValue as any)('variant_option', newOptions)
    ;(setValue as any)('variant_value', newValueStrings)
  }

  const handleUpdateVariantValue = (index: number, values: string[]) => {
    const newValueStrings = [...variantValueArray]
    newValueStrings[index] = values.join(',')
    ;(setValue as any)('variant_value', newValueStrings)
  }

  return (
    <>
      <Field>
        <FieldLabel>Variant Options</FieldLabel>
        <FieldDescription>
          Add variant options and values (e.g., Color: Red, Blue or Size: S, M, L). Values can be comma-separated.
        </FieldDescription>
        
        <div className="space-y-4 mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Option (e.g., Color)"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1"
            />
            <div className="flex-1">
              <TagInput
                value={newValues}
                onChange={setNewValues}
                placeholder="Values (e.g., Red, Blue, Green)"
                delimiter=","
              />
            </div>
            <Button
              type="button"
              onClick={handleAddVariant}
              disabled={!newOption.trim() || newValues.length === 0}
            >
              <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {variantOptionArray.length > 0 && (
          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Option</TableHead>
                  <TableHead>Values</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantOptionArray.map((option, index) => {
                  const values = variantValueArray[index]?.split(',').map(v => v.trim()).filter(v => v) || []
                  return (
                    <TableRow key={`${option}-${index}`}>
                      <TableCell className="font-medium">{option}</TableCell>
                      <TableCell>
                        <TagInput
                          value={values}
                          onChange={(vals) => handleUpdateVariantValue(index, vals)}
                          placeholder="Enter values"
                          delimiter=","
                          className="min-h-[40px]"
                        />
                      </TableCell>
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
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <FieldError />
      </Field>

      {/* Variant Combinations Table */}
      {variantOptionArray.length > 0 && (
        <Field>
          <FieldLabel>Variant Combinations</FieldLabel>
          <FieldDescription>
            Generated combinations from your variant options. You can edit item codes, additional costs, and prices.
          </FieldDescription>
          <VariantTable
            control={control}
            watch={watch}
            setValue={setValue}
            productCode={productCode}
          />
          <FieldError />
        </Field>
      )}
    </>
  )
}

