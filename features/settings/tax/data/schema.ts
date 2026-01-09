import { z } from 'zod'

export const taxSchema = z.object({
  id: z.number(),
  name: z.string(),
  rate: z.number(),
  is_active: z.boolean(),
  woocommerce_tax_id: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Tax = z.infer<typeof taxSchema>

export const taxListSchema = z.array(taxSchema)

