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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useCreateTax, useUpdateTax } from "../api/use-taxes"
import { toast } from "sonner"
import { handleApiError } from "@/lib/handle-api-error"
import type { Tax } from "../data/schema"
import { Spinner } from '@/components/ui/spinner'

const taxSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  rate: z.number().min(0, "Rate must be at least 0").max(100, "Rate cannot exceed 100"),
  woocommerce_tax_id: z.number().nullable().optional(),
  is_active: z.boolean(),
})

type TaxesActionDialogProps = {
  currentRow?: Tax
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaxesActionDialog({ currentRow, open, onOpenChange }: TaxesActionDialogProps) {
  const createTax = useCreateTax()
  const updateTax = useUpdateTax()
  const isEdit = !!currentRow

  const form = useForm<z.infer<typeof taxSchema>>({
    resolver: zodResolver(taxSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          rate: currentRow.rate,
          woocommerce_tax_id: currentRow.woocommerce_tax_id || null,
          is_active: currentRow.is_active,
        }
      : {
          name: "",
          rate: 0,
          woocommerce_tax_id: null,
          is_active: true,
        },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        rate: currentRow.rate,
        woocommerce_tax_id: currentRow.woocommerce_tax_id || null,
        is_active: currentRow.is_active,
      })
    } else {
      form.reset({
        name: "",
        rate: 0,
        woocommerce_tax_id: null,
        is_active: true,
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: z.infer<typeof taxSchema>) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      rate: data.rate,
      is_active: data.is_active,
    }

    if (data.woocommerce_tax_id !== null && data.woocommerce_tax_id !== undefined) {
      payload.woocommerce_tax_id = data.woocommerce_tax_id
    }

    try {
      let response
      if (isEdit && currentRow) {
        response = await updateTax.mutateAsync({ id: currentRow.id, data: payload })
      } else {
        response = await createTax.mutateAsync(payload)
      }

      const message = (response as any)?.message || (isEdit ? "Tax updated successfully" : "Tax created successfully")
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
          <DialogTitle>{isEdit ? "Edit Tax" : "Add New Tax"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the tax here. " : "Create new tax here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <form id="tax-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-0.5">
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="tax-name">Name *</FieldLabel>
                    <Input
                      id="tax-name"
                      placeholder="Tax name (e.g., VAT)"
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
                name="rate"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="tax-rate">Rate (%) *</FieldLabel>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Tax rate (e.g., 10)"
                      autoComplete="off"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? 0 : Number(value))
                      }}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="woocommerce_tax_id"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="tax-woocommerce-id">WooCommerce Tax ID</FieldLabel>
                    <Input
                      id="tax-woocommerce-id"
                      type="number"
                      placeholder="WooCommerce tax ID (optional)"
                      autoComplete="off"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : Number(value))
                      }}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="is_active"
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="tax-active">Active</FieldLabel>
                    <Switch
                      id="tax-active"
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
          <Button type="submit" form="tax-form" disabled={createTax.isPending || updateTax.isPending}>
            {createTax.isPending || updateTax.isPending ? (
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

