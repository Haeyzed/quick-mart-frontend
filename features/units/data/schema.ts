import { z } from 'zod'

export const unitSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  base_unit: z.number().nullable(),
  base_unit_relation: z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
  }).nullable().optional(),
  operator: z.string().nullable(),
  operation_value: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Unit = z.infer<typeof unitSchema>

export const unitListSchema = z.array(unitSchema)

