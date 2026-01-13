"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { useCreateUnit, useUpdateUnit, useBaseUnits } from "../api/use-units"
import { toast } from "sonner"
import { handleApiError } from "@/lib/handle-api-error"
import type { Unit } from "../data/schema"
import { Spinner } from '@/components/ui/spinner'

const unitSchema = z.object({
  code: z.string().min(1, "Code is required").max(255, "Code is too long"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  base_unit: z.number().nullable().optional(),
  operator: z.string().nullable().optional(),
  operation_value: z.number().nullable().optional(),
  is_active: z.boolean(),
})

type UnitsActionDialogProps = {
  currentRow?: Unit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitsActionDialog({ currentRow, open, onOpenChange }: UnitsActionDialogProps) {
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const { data: baseUnits = [] } = useBaseUnits()
  const isEdit = !!currentRow

  const form = useForm<z.infer<typeof unitSchema>>({
    resolver: zodResolver(unitSchema),
    defaultValues: isEdit
      ? {
          code: currentRow.code,
          name: currentRow.name,
          base_unit: currentRow.base_unit || null,
          operator: currentRow.operator || null,
          operation_value: currentRow.operation_value || null,
          is_active: currentRow.is_active,
        }
      : {
          code: "",
          name: "",
          base_unit: null,
          operator: null,
          operation_value: null,
          is_active: true,
        },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        code: currentRow.code,
        name: currentRow.name,
        base_unit: currentRow.base_unit || null,
        operator: currentRow.operator || null,
        operation_value: currentRow.operation_value || null,
        is_active: currentRow.is_active,
      })
    } else {
      form.reset({
        code: "",
        name: "",
        base_unit: null,
        operator: null,
        operation_value: null,
        is_active: true,
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: z.infer<typeof unitSchema>) => {
    const formData = new FormData()
    formData.append('code', data.code)
    formData.append('name', data.name)
    formData.append('is_active', String(data.is_active))

    if (data.base_unit !== null && data.base_unit !== undefined) {
      formData.append('base_unit', String(data.base_unit))
      if (data.operator) {
        formData.append('operator', data.operator)
      }
      if (data.operation_value !== null && data.operation_value !== undefined) {
        formData.append('operation_value', String(data.operation_value))
      }
    }

    try {
      let response
      if (isEdit && currentRow) {
        response = await updateUnit.mutateAsync({ id: currentRow.id, data: formData })
      } else {
        response = await createUnit.mutateAsync(formData)
      }

      const message = (response as any)?.message || (isEdit ? "Unit updated successfully" : "Unit created successfully")
      toast.success(message)
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
      modal={true}
    >
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the unit here. " : "Create new unit here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <form id="unit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-0.5">
            <FieldGroup>
              <Controller
                control={form.control}
                name="code"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="unit-code">Code *</FieldLabel>
                    <Input
                      id="unit-code"
                      placeholder="Unit code (e.g., KG)"
                      autoComplete="off"
                      {...field}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="unit-name">Name *</FieldLabel>
                    <Input
                      id="unit-name"
                      placeholder="Unit name (e.g., Kilogram)"
                      autoComplete="off"
                      {...field}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="base_unit"
                render={({ field, fieldState }) => {
                  const availableBaseUnits = baseUnits.filter((unit) => !isEdit || unit.id !== currentRow?.id)
                  const unitItems = availableBaseUnits.map((unit) => ({
                    id: unit.id,
                    label: `${unit.code} - ${unit.name}`,
                  }))
                  const selectedUnit = unitItems.find((unit) => unit.id === field.value)

                  return (
                    <Field>
                      <FieldLabel htmlFor="unit-base-unit">Base Unit</FieldLabel>
                      <Combobox
                        items={unitItems}
                        value={selectedUnit || null}
                        onValueChange={(value) => {
                          field.onChange(value ? value.id : null)
                        }}
                        itemToStringValue={(item) => String(item.id)}
                      >
                        <ComboboxInput
                          id="unit-base-unit"
                          name="base_unit"
                          placeholder="Select base unit (optional)"
                          showClear
                          data-invalid={!!fieldState.error}
                          value={selectedUnit ? selectedUnit.label : ''}
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No base units found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item.id} value={item}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FieldDescription>Leave empty if this is a base unit</FieldDescription>
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </Field>
                  )
                }}
              />
              {form.watch("base_unit") && (
                <>
                  <Controller
                    control={form.control}
                    name="operator"
                    render={({ field, fieldState }) => {
                      const operatorOptions = [
                        { value: "*", label: "Multiply (*)" },
                        { value: "/", label: "Divide (/)" },
                      ]
                      const selectedOperator = operatorOptions.find((opt) => opt.value === field.value)

                      return (
                        <Field>
                          <FieldLabel htmlFor="unit-operator">Operator</FieldLabel>
                          <Combobox
                            items={operatorOptions}
                            value={selectedOperator || null}
                            onValueChange={(value) => {
                              field.onChange(value ? value.value : null)
                            }}
                            itemToStringValue={(item) => item.value}
                          >
                            <ComboboxInput
                              id="unit-operator"
                              name="operator"
                              placeholder="Select operator"
                              showClear
                              data-invalid={!!fieldState.error}
                              value={selectedOperator ? selectedOperator.label : ''}
                            />
                            <ComboboxContent>
                              <ComboboxEmpty>No operators found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item) => (
                                  <ComboboxItem key={item.value} value={item}>
                                    {item.label}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          <FieldDescription>Mathematical operator for conversion</FieldDescription>
                          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                        </Field>
                      )
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="operation_value"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="unit-operation-value">Operation Value</FieldLabel>
                        <Input
                          id="unit-operation-value"
                          type="number"
                          step="any"
                          placeholder="Operation value"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value === "" ? null : Number(value))
                          }}
                          data-invalid={!!fieldState.error}
                        />
                        <FieldDescription>Value to use with operator for conversion</FieldDescription>
                        <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                      </Field>
                    )}
                  />
                  <div className="text-muted-foreground mt-2 mb-4 text-sm">
                    <strong>Example conversions:</strong>
                    <br />1 Dozen = 1<strong>*</strong>12 Piece
                    <br />1 Gram = 1<strong>/</strong>1000 KG
                  </div>
                </>
              )}
              <Controller
                control={form.control}
                name="is_active"
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="unit-active">Active</FieldLabel>
                    <Switch
                      id="unit-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <Button type="submit" form="unit-form" disabled={createUnit.isPending || updateUnit.isPending}>
            {createUnit.isPending || updateUnit.isPending ? (
              <>
                <Spinner className="mr-2 size-4" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
